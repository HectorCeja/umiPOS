import type { AuthenticationConfiguration } from '@nexo/config';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AUTHENTICATION_CONFIGURATION } from '../../authentication/application/authentication.ports.js';
import { AuthenticationService } from '../../authentication/application/authentication.service.js';
import { ProductService } from '../application/product.service.js';
import {
  BarcodeDto,
  CategoryDto,
  CompleteMediaDto,
  CreateProductDto,
  MediaDto,
  PriceDto,
  ProductItemPathDto,
  ProductMediaPathDto,
  ProductPathDto,
  UpdateProductDto,
  VariantDto,
  VersionDto,
} from './product.dto.js';

@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class ProductController {
  private readonly cookie: string;
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly products: ProductService,
    @Inject(AUTHENTICATION_CONFIGURATION) private readonly config: AuthenticationConfiguration,
  ) {
    this.cookie = config.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
  }
  @Get('organizations/:organizationId/products') list(
    @Param() p: ProductPathDto,
    @Query('q') q: string | undefined,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.products.list(i, p.organizationId, q));
  }
  @Get('organizations/:organizationId/products/:productId') get(
    @Param() p: ProductItemPathDto,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.products.get(i, p.organizationId, p.productId));
  }
  @Post('organizations/:organizationId/products') create(
    @Param() p: ProductPathDto,
    @Body() b: CreateProductDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.products.create(i, p.organizationId, b));
  }
  @Patch('organizations/:organizationId/products/:productId') update(
    @Param() p: ProductItemPathDto,
    @Body() b: UpdateProductDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.products.update(i, p.organizationId, p.productId, b));
  }
  @Post('organizations/:organizationId/products/:productId/archive') archive(
    @Param() p: ProductItemPathDto,
    @Body() b: VersionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.products.status(i, p.organizationId, p.productId, 'ARCHIVED', b.version),
    );
  }
  @Post('organizations/:organizationId/products/:productId/activate') activate(
    @Param() p: ProductItemPathDto,
    @Body() b: VersionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.products.status(i, p.organizationId, p.productId, 'ACTIVE', b.version),
    );
  }
  @Post('organizations/:organizationId/products/:productId/restore') restore(
    @Param() p: ProductItemPathDto,
    @Body() b: VersionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.products.status(i, p.organizationId, p.productId, 'DRAFT', b.version),
    );
  }
  @Post('organizations/:organizationId/products/:productId/variants') variant(
    @Param() p: ProductItemPathDto,
    @Body() b: VariantDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.products.variant(i, p.organizationId, p.productId, b));
  }
  @Post('organizations/:organizationId/product-categories') category(
    @Param() p: ProductPathDto,
    @Body() b: CategoryDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.products.category(i, p.organizationId, b));
  }
  @Get('organizations/:organizationId/product-categories') categories(
    @Param() p: ProductPathDto,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.products.categories(i, p.organizationId));
  }
  @Post('organizations/:organizationId/products/:productId/barcodes') barcode(
    @Param() p: ProductItemPathDto,
    @Body() b: BarcodeDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.products.barcode(i, p.organizationId, p.productId, b));
  }
  @Post('organizations/:organizationId/products/:productId/prices') price(
    @Param() p: ProductItemPathDto,
    @Body() b: PriceDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.products.price(i, p.organizationId, p.productId, b));
  }
  @Post('organizations/:organizationId/products/:productId/media/uploads') media(
    @Param() p: ProductItemPathDto,
    @Body() b: MediaDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.products.prepareMedia(i, p.organizationId, p.productId, b));
  }
  @Post('organizations/:organizationId/products/:productId/media/complete') completeMedia(
    @Param() p: ProductItemPathDto,
    @Body() b: CompleteMediaDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.products.completeMedia(i, p.organizationId, p.productId, b.mediaId),
    );
  }
  @Get('organizations/:organizationId/products/:productId/media/:mediaId') async productMedia(
    @Param() p: ProductMediaPathDto,
    @Req() r: FastifyRequest,
    @Res() response: FastifyReply,
  ) {
    const media = await this.products.media(
      await this.principal(r),
      p.organizationId,
      p.productId,
      p.mediaId,
    );
    response.header('content-type', media.contentType);
    response.header('cache-control', 'private, max-age=300');
    return response.send(media.stream);
  }
  private principal(r: FastifyRequest) {
    return this.authentication.authenticate(r.cookies[this.cookie]);
  }
  private async write<T>(
    r: FastifyRequest,
    fn: (identity: Awaited<ReturnType<AuthenticationService['authenticate']>>) => Promise<T>,
  ) {
    const origin = r.headers.origin;
    if (origin && !this.config.allowedOrigins.has(origin))
      throw new ForbiddenException('Request origin is not allowed');
    const identity = await this.principal(r);
    const csrf = r.headers['x-csrf-token'];
    this.authentication.assertCsrf(identity, typeof csrf === 'string' ? csrf : undefined);
    return fn(identity);
  }
}
