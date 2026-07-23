import { traceOperation } from '@nexo/observability';
import { assertMoney, assertProductTypeEnabled, validateBarcode } from '@nexo/product';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { OBJECT_STORAGE } from '../../../infrastructure/infrastructure.module.js';
import type { SessionIdentity } from '../../authentication/application/authentication.ports.js';
import { AuthorizationService } from '../../authorization/application/authorization.service.js';
import {
  PRODUCT_REPOSITORY,
  type CreateProductInput,
  type CreateVariantInput,
  type ProductRepository,
} from './product.ports.js';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly repository: ProductRepository,
    private readonly authorization: AuthorizationService,
    @Inject(OBJECT_STORAGE) private readonly storage: MinioClient,
  ) {}
  private async allowed(
    identity: SessionIdentity,
    tenantId: string,
    permission: string,
    resource = 'product',
  ) {
    await this.authorization.assert(identity, tenantId, permission, { type: resource });
  }
  async list(identity: SessionIdentity, tenantId: string, query?: string) {
    await this.allowed(identity, tenantId, 'product.read');
    return this.repository.list(tenantId, query);
  }
  async get(identity: SessionIdentity, tenantId: string, id: string) {
    await this.allowed(identity, tenantId, 'product.read');
    return this.repository.get(tenantId, id);
  }
  async create(identity: SessionIdentity, tenantId: string, input: CreateProductInput) {
    this.assertTypeEnabled(input.type);
    await this.allowed(identity, tenantId, 'product.create');
    return traceOperation('product.create', { tenantId }, () =>
      this.repository.create(tenantId, identity.userId, input),
    );
  }
  async update(
    identity: SessionIdentity,
    tenantId: string,
    id: string,
    input: Partial<CreateProductInput> & { version: number },
  ) {
    if (input.type) this.assertTypeEnabled(input.type);
    await this.allowed(identity, tenantId, 'product.update');
    return this.repository.update(tenantId, id, identity.userId, input);
  }
  async status(
    identity: SessionIdentity,
    tenantId: string,
    id: string,
    status: 'ARCHIVED' | 'DRAFT' | 'ACTIVE',
    version: number,
  ) {
    await this.allowed(
      identity,
      tenantId,
      status === 'ARCHIVED'
        ? 'product.archive'
        : status === 'ACTIVE'
          ? 'product.update'
          : 'product.restore',
    );
    return this.repository.status(tenantId, id, identity.userId, status, version);
  }
  async variant(
    identity: SessionIdentity,
    tenantId: string,
    id: string,
    input: CreateVariantInput,
  ) {
    await this.allowed(identity, tenantId, 'product.variant.create', 'product_variant');
    return this.repository.variant(tenantId, id, identity.userId, input);
  }
  async category(
    identity: SessionIdentity,
    tenantId: string,
    input: { name: string; slug: string; parentId?: string; sortOrder?: number },
  ) {
    await this.allowed(identity, tenantId, 'product.category.manage', 'product_category');
    return this.repository.category(tenantId, identity.userId, input);
  }
  async categories(identity: SessionIdentity, tenantId: string) {
    await this.allowed(identity, tenantId, 'product.read', 'product_category');
    return this.repository.categories(tenantId);
  }
  async barcode(
    identity: SessionIdentity,
    tenantId: string,
    id: string,
    input: Parameters<ProductRepository['barcode']>[3],
  ) {
    const normalized = validateBarcode(input.type, input.value);
    await this.allowed(identity, tenantId, 'product.barcode.manage', 'product_barcode');
    return this.repository.barcode(tenantId, id, identity.userId, { ...input, value: normalized });
  }
  async price(
    identity: SessionIdentity,
    tenantId: string,
    id: string,
    input: Parameters<ProductRepository['price']>[3],
  ) {
    assertMoney(input.amount, input.currency);
    await this.allowed(identity, tenantId, 'product.price.update', 'product_price');
    return this.repository.price(tenantId, id, identity.userId, input);
  }
  async prepareMedia(
    identity: SessionIdentity,
    tenantId: string,
    id: string,
    input: Parameters<ProductRepository['prepareMedia']>[3],
  ) {
    await this.allowed(identity, tenantId, 'product.media.manage', 'product_media');
    const media = await this.repository.prepareMedia(tenantId, id, identity.userId, input);
    const publicEndpoint = new URL(process.env.S3_PUBLIC_ENDPOINT ?? 'http://localhost:9000');
    const publicStorage = new MinioClient({
      endPoint: publicEndpoint.hostname,
      port: Number(publicEndpoint.port || (publicEndpoint.protocol === 'https:' ? 443 : 80)),
      useSSL: publicEndpoint.protocol === 'https:',
      accessKey: process.env.S3_ACCESS_KEY ?? '',
      secretKey: process.env.S3_SECRET_KEY ?? '',
      region: process.env.S3_REGION ?? 'us-east-1',
    });
    const uploadUrl = await publicStorage.presignedPutObject(
      process.env.S3_BUCKET ?? 'nexo',
      media.objectKey,
      15 * 60,
    );
    return { ...media, uploadUrl, expiresInSeconds: 900 };
  }
  async completeMedia(
    identity: SessionIdentity,
    tenantId: string,
    productId: string,
    mediaId: string,
  ) {
    await this.allowed(identity, tenantId, 'product.media.manage', 'product_media');
    const media = await this.repository.pendingMedia(tenantId, productId, mediaId);
    const bucket = process.env.S3_BUCKET ?? 'nexo';
    let object: Awaited<ReturnType<MinioClient['statObject']>>;
    try {
      object = await this.storage.statObject(bucket, media.objectKey);
    } catch {
      throw new BadRequestException('Uploaded media object is missing');
    }
    if (object.size <= 0 || object.size > 5 * 1024 * 1024)
      throw new BadRequestException('Uploaded media size is invalid');
    const stream = await this.storage.getObject(bucket, media.objectKey);
    const chunks: Uint8Array[] = [];
    let received = 0;
    for await (const chunk of stream) {
      const candidate: unknown = chunk;
      if (!(candidate instanceof Uint8Array))
        throw new BadRequestException('Uploaded media stream is invalid');
      const bytes = candidate;
      received += bytes.length;
      if (received > 5 * 1024 * 1024) throw new BadRequestException('Uploaded media is too large');
      chunks.push(bytes);
    }
    const content = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      content.set(chunk, offset);
      offset += chunk.length;
    }
    if (!matchesImageSignature(content, media.contentType))
      throw new BadRequestException('Uploaded media content does not match its declared type');
    return this.repository.activateMedia(
      tenantId,
      productId,
      mediaId,
      identity.userId,
      object.size,
    );
  }
  async media(identity: SessionIdentity, tenantId: string, productId: string, mediaId: string) {
    await this.allowed(identity, tenantId, 'product.read', 'product_media');
    const item = await this.repository.media(tenantId, productId, mediaId);
    return {
      ...item,
      stream: await this.storage.getObject(process.env.S3_BUCKET ?? 'nexo', item.objectKey),
    };
  }
  private assertTypeEnabled(type: Parameters<typeof assertProductTypeEnabled>[0]) {
    try {
      assertProductTypeEnabled(type);
    } catch {
      throw new BadRequestException('Product type is not implemented');
    }
  }
}

function matchesImageSignature(bytes: Uint8Array, contentType: string) {
  if (contentType === 'image/jpeg')
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === 'image/png')
    return (
      bytes.length >= 8 &&
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
        (value, index) => bytes[index] === value,
      )
    );
  if (contentType === 'image/webp')
    return (
      bytes.length >= 12 &&
      [0x52, 0x49, 0x46, 0x46].every((value, index) => bytes[index] === value) &&
      [0x57, 0x45, 0x42, 0x50].every((value, index) => bytes[index + 8] === value)
    );
  return false;
}
