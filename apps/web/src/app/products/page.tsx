'use client';
import {
  Button,
  FileUpload,
  IconButton,
  MutationButton,
  NexoIcon,
  NexoSelect,
  ProductCard,
  SaveStatus,
  TextArea,
  TextField,
  VisualChoiceCard,
  type MutationState,
} from '@nexo/ui';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { NexoAppShell } from '../global-shell';
import { categoryPresets } from '../business-presets';
import { apiFetch, browserReachableUrl, browserUuid } from '../../lib/api-client';
import { useActiveOrganization } from '../active-organization';
import { ProductIcon, productIconChoices, resolveProductIcon } from '../product-icon-registry';
const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
interface Product {
  id: string;
  name: string;
  sku?: string | null;
  type: string;
  status: string;
  version: number;
  metadata?: { iconKey?: string };
  description?: string | null;
  category?: { id: string; name: string } | null;
  media?: { id: string; status: string; altText?: string; isPrimary?: boolean }[];
  variants?: { id: string; isDefault: boolean; name?: string; sku?: string | null }[];
  prices?: { amount: string; currency: string }[];
  barcodes?: { value: string; isPrimary?: boolean }[];
}
interface ProductCategory {
  id: string;
  name: string;
  parentId?: string | null;
  slug: string;
}
export default function ProductsPage() {
  const activeContext = useActiveOrganization();
  const org = activeContext.organization?.id ?? '';
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [price, setPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [iconKey, setIconKey] = useState('cup');
  const [image, setImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editIcon, setEditIcon] = useState('bag');
  const [editImage, setEditImage] = useState<File>();
  const detailDialog = useRef<HTMLDialogElement>(null);
  const createForm = useRef<HTMLFormElement>(null);
  const [formGeneration, setFormGeneration] = useState(0);
  const [kind, setKind] = useState<'PHYSICAL' | 'SERVICE'>('PHYSICAL');
  const [error, setError] = useState('');
  const [mutation, setMutation] = useState<MutationState>('idle');
  const load = useCallback(async () => {
    if (!org) return;
    const [r, categoryResponse] = await Promise.all([
      apiFetch(`${api}/v1/organizations/${org}/products?q=${encodeURIComponent(q)}`),
      apiFetch(`${api}/v1/organizations/${org}/product-categories`),
    ]);
    if (r.ok) setItems((await r.json()) as Product[]);
    else setError('No pudimos consultar el catálogo.');
    if (categoryResponse.ok) setCategories((await categoryResponse.json()) as ProductCategory[]);
  }, [org, q]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }
    const value = URL.createObjectURL(image);
    setImagePreview(value);
    return () => {
      URL.revokeObjectURL(value);
    };
  }, [image]);
  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMutation('saving');
    let categoryId: string | undefined;
    if (category.trim()) {
      const existing = categories.find(
        (item) => normalizeLabel(item.name) === normalizeLabel(category),
      );
      if (existing) categoryId = existing.id;
      else {
        const categoryResponse = await write(`/v1/organizations/${org}/product-categories`, {
          name: category.trim(),
          slug: slug(category),
        });
        if (!categoryResponse.ok) {
          fail(categoryResponse.status);
          return;
        }
        categoryId = ((await categoryResponse.json()) as { id: string }).id;
      }
    }
    const r = await write(`/v1/organizations/${org}/products`, {
      name,
      sku: sku || undefined,
      type: kind,
      shortName: name,
      description: description || undefined,
      unitCode: 'H87',
      searchTerms: [name, sku, category].filter(Boolean),
      categoryId,
      iconKey,
    });
    if (r.ok) {
      const product = (await r.json()) as { id: string };
      const detailResponse = await apiFetch(
        `${api}/v1/organizations/${org}/products/${product.id}`,
        {
          credentials: 'include',
        },
      );
      const detail = detailResponse.ok ? ((await detailResponse.json()) as Product) : undefined;
      const defaultVariant = detail?.variants?.find((variant) => variant.isDefault);
      if (price && defaultVariant) {
        const priced = await write(`/v1/organizations/${org}/products/${product.id}/prices`, {
          variantId: defaultVariant.id,
          amount: price,
          currency: 'MXN',
          unitCode: 'H87',
        });
        if (!priced.ok) {
          fail(priced.status);
          return;
        }
        await priced.arrayBuffer();
      }
      if (barcode) {
        const coded = await write(`/v1/organizations/${org}/products/${product.id}/barcodes`, {
          type: 'INTERNAL',
          value: barcode,
          isPrimary: true,
        });
        if (!coded.ok) {
          fail(coded.status);
          return;
        }
        await coded.arrayBuffer();
      }
      if (image) {
        const prepared = await write(
          `/v1/organizations/${org}/products/${product.id}/media/uploads`,
          { contentType: image.type, altText: name, fileName: safeFileName(image.name) },
        );
        if (!prepared.ok) {
          fail(prepared.status);
          return;
        }
        const upload = (await prepared.json()) as {
          id: string;
          uploadUrl: string;
        };
        const sent = await apiFetch(upload.uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': image.type },
          body: image,
        });
        if (!sent.ok) {
          fail(sent.status);
          return;
        }
        await sent.arrayBuffer();
        const completed = await write(
          `/v1/organizations/${org}/products/${product.id}/media/complete`,
          { mediaId: upload.id },
        );
        if (!completed.ok) {
          fail(completed.status);
          return;
        }
        await completed.arrayBuffer();
      }
      const latestResponse = await apiFetch(
        `${api}/v1/organizations/${org}/products/${product.id}`,
        {
          credentials: 'include',
        },
      );
      const latest = latestResponse.ok ? ((await latestResponse.json()) as Product) : detail;
      if (latest?.status === 'DRAFT') {
        const activated = await write(`/v1/organizations/${org}/products/${product.id}/activate`, {
          version: latest.version,
        });
        if (!activated.ok) {
          fail(activated.status);
          return;
        }
        await activated.arrayBuffer();
      }
      setName('');
      setSku('');
      setDescription('');
      setCategory('');
      setPrice('');
      setBarcode('');
      setImage(undefined);
      setIconKey('cup');
      setKind('PHYSICAL');
      setError('');
      setMutation('success');
      await load();
      window.requestAnimationFrame(() => {
        createForm.current?.reset();
        setFormGeneration((value) => value + 1);
      });
    } else {
      fail(r.status);
    }
  }
  function fail(statusCode: number) {
    setMutation(statusCode === 409 ? 'conflict' : 'error');
    setError(
      statusCode === 403
        ? 'No tienes permiso para agregar productos.'
        : 'No pudimos completar el producto. Conservamos los datos para que intentes de nuevo.',
    );
  }
  function write(path: string, body: unknown) {
    return apiFetch(`${api}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': csrf(),
        'idempotency-key': browserUuid(),
      },
      body: JSON.stringify(body),
    });
  }
  function openProduct(product: Product) {
    setSelectedProduct(product);
    setEditingProduct(false);
    setEditName(product.name);
    setEditSku(product.sku ?? '');
    setEditDescription(product.description ?? '');
    setEditCategory(product.category?.id ?? '');
    setEditPrice(product.prices?.[0]?.amount ?? '');
    setEditBarcode(
      product.barcodes?.find((item) => item.isPrimary)?.value ?? product.barcodes?.[0]?.value ?? '',
    );
    setEditIcon(product.metadata?.iconKey ?? 'bag');
    setEditImage(undefined);
    requestAnimationFrame(() => detailDialog.current?.showModal());
  }
  async function updateProduct(event: FormEvent) {
    event.preventDefault();
    if (!selectedProduct) return;
    setMutation('saving');
    setError('');
    const response = await apiFetch(
      `${api}/v1/organizations/${org}/products/${selectedProduct.id}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': csrf(),
          'idempotency-key': browserUuid(),
        },
        body: JSON.stringify({
          name: editName.trim(),
          shortName: editName.trim(),
          sku: editSku.trim() || undefined,
          description: editDescription.trim(),
          categoryId: editCategory || undefined,
          iconKey: editIcon,
          searchTerms: [editName, editSku].filter(Boolean),
          version: selectedProduct.version,
        }),
      },
    );
    if (!response.ok) {
      fail(response.status);
      return;
    }
    const updated = (await response.json()) as Product;
    const defaultVariant = selectedProduct.variants?.find((item) => item.isDefault);
    if (editPrice && defaultVariant && editPrice !== selectedProduct.prices?.[0]?.amount) {
      const priced = await write(`/v1/organizations/${org}/products/${selectedProduct.id}/prices`, {
        variantId: defaultVariant.id,
        amount: editPrice,
        currency: 'MXN',
        unitCode: 'H87',
      });
      if (!priced.ok) {
        fail(priced.status);
        return;
      }
      await priced.arrayBuffer();
    }
    const currentBarcode =
      selectedProduct.barcodes?.find((item) => item.isPrimary)?.value ??
      selectedProduct.barcodes?.[0]?.value ??
      '';
    if (editBarcode && editBarcode !== currentBarcode) {
      const coded = await write(
        `/v1/organizations/${org}/products/${selectedProduct.id}/barcodes`,
        { type: 'INTERNAL', value: editBarcode, isPrimary: true },
      );
      if (!coded.ok) {
        fail(coded.status);
        return;
      }
      await coded.arrayBuffer();
    }
    if (editImage) {
      const prepared = await write(
        `/v1/organizations/${org}/products/${selectedProduct.id}/media/uploads`,
        { contentType: editImage.type, altText: editName, fileName: safeFileName(editImage.name) },
      );
      if (!prepared.ok) {
        fail(prepared.status);
        return;
      }
      const upload = (await prepared.json()) as {
        id: string;
        uploadUrl: string;
      };
      const sent = await apiFetch(upload.uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': editImage.type },
        body: editImage,
      });
      if (!sent.ok) {
        fail(sent.status);
        return;
      }
      await sent.arrayBuffer();
      const completed = await write(
        `/v1/organizations/${org}/products/${selectedProduct.id}/media/complete`,
        { mediaId: upload.id },
      );
      if (!completed.ok) {
        fail(completed.status);
        return;
      }
      await completed.arrayBuffer();
    }
    const latestResponse = await apiFetch(
      `${api}/v1/organizations/${org}/products/${selectedProduct.id}`,
      { cache: 'no-store' },
    );
    const latest = latestResponse.ok ? ((await latestResponse.json()) as Product) : updated;
    setSelectedProduct(latest);
    setEditingProduct(false);
    setMutation('success');
    await load();
  }
  return (
    <NexoAppShell active="products">
      <main className="module-page products-page">
        <header className="module-hero">
          <div>
            <p className="overline">CATÁLOGO VISUAL</p>
            <h1>Productos</h1>
            <p>Construye los artículos descriptivos que usarán Ventas e Inventario.</p>
          </div>
          <a
            className="nexo-button nexo-button--secondary module-hero__optical-action"
            href="#new-product"
          >
            Crear producto
          </a>
        </header>
        {error && (
          <p role="alert" className="login-error">
            {error}
          </p>
        )}
        <section className="premium-card product-create" id="new-product">
          <div className="product-create__intro">
            <span className="product-create__visual" aria-hidden="true">
              <NexoIcon name={kind === 'PHYSICAL' ? 'package' : 'briefcase'} decorative />
            </span>
            <div>
              <p className="overline">NUEVO EN EL CATÁLOGO</p>
              <h2>Crea algo que tu equipo reconozca al instante</h2>
              <p>Empieza con lo esencial. Variantes, precios y media se administran después.</p>
            </div>
          </div>
          <form key={formGeneration} ref={createForm} onSubmit={(e) => void create(e)}>
            <fieldset className="product-kind-picker">
              <legend>¿Qué vas a agregar?</legend>
              <VisualChoiceCard
                selected={kind === 'PHYSICAL'}
                icon={<NexoIcon name="package" decorative />}
                title="Producto físico"
                description="Artículo que puede relacionarse con inventario."
                onSelect={() => {
                  setKind('PHYSICAL');
                }}
              />
              <VisualChoiceCard
                selected={kind === 'SERVICE'}
                icon={<NexoIcon name="briefcase" decorative />}
                title="Servicio"
                description="Experiencia o trabajo que no consume existencias."
                onSelect={() => {
                  setKind('SERVICE');
                }}
              />
            </fieldset>
            <TextField
              label="Nombre del producto"
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
              help="Ejemplo: Latte grande."
              required
            />
            <TextField
              label="SKU comercial (opcional)"
              value={sku}
              onChange={(e) => {
                setSku(e.currentTarget.value);
              }}
              help="Código interno legible para tu equipo."
            />
            <TextArea
              label="Descripción (opcional)"
              value={description}
              onChange={(e) => {
                setDescription(e.currentTarget.value);
              }}
            />
            <NexoSelect
              label="Categoría"
              value={category}
              onValueChange={setCategory}
              searchable
              allowCustom
              options={[
                ...new Set([...categoryPresets, ...categories.map((item) => item.name)]),
              ].map((value) => ({ value, label: value }))}
            />
            <TextField
              label="Precio en MXN"
              value={price}
              onChange={(e) => {
                setPrice(e.currentTarget.value);
              }}
              help="Ejemplo: 65.00"
              inputMode="decimal"
            />
            <TextField
              label="Código de barras"
              value={barcode}
              onChange={(e) => {
                setBarcode(e.currentTarget.value);
              }}
              help="Código CODE128 comercial, si aplica."
            />
            <fieldset className="product-icon-picker">
              <legend>Icono</legend>
              {productIconChoices.map(({ id: value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={iconKey === value}
                  onClick={() => {
                    setIconKey(value);
                  }}
                >
                  <ProductIcon value={value} />
                  {label}
                </button>
              ))}
            </fieldset>
            <FileUpload
              label="Imagen del producto"
              help="PNG, JPEG o WebP. Se almacena de forma privada."
              {...(imagePreview ? { preview: imagePreview } : {})}
              onFile={setImage}
            />
            {image && (
              <button
                type="button"
                className="nexo-button nexo-button--secondary"
                onClick={() => {
                  setImage(undefined);
                }}
              >
                Eliminar imagen seleccionada
              </button>
            )}
            {!editingProduct && (
              <SaveStatus state={mutation} {...(error ? { message: error } : {})} />
            )}
            <MutationButton type="submit" state={mutation} disabled={mutation === 'saving'}>
              Agregar al catálogo
            </MutationButton>
          </form>
        </section>
        <section className="premium-card">
          <div className="card-heading">
            <div>
              <h2>Tu catálogo</h2>
              <p>
                {items.length
                  ? `${String(items.length)} productos disponibles.`
                  : 'Todavía no hay productos. Agrega el primero para comenzar.'}
              </p>
            </div>
            <TextField
              label="Buscar productos"
              value={q}
              onChange={(e) => {
                setQ(e.currentTarget.value);
              }}
            />
          </div>
          <div className="product-list product-visual-grid">
            {items.map((x) => {
              const media = primaryMedia(x);
              const price = x.prices?.[0];
              return (
                <ProductCard
                  key={x.id}
                  name={x.name}
                  {...(media
                    ? {
                        imageSrc: productMediaUrl(org, x, media.id),
                        imageAlt: media.altText ?? x.name,
                      }
                    : {})}
                  icon={<ProductIcon value={x.metadata?.iconKey} type={x.type} />}
                  typeLabel={x.type === 'SERVICE' ? 'Servicio' : 'Producto físico'}
                  category={x.category?.name ?? 'Sin categoría'}
                  {...(price ? { price } : {})}
                  availability={x.sku ?? 'Sin SKU comercial'}
                  status={status(x.status)}
                  onSelect={() => {
                    openProduct(x);
                  }}
                />
              );
            })}
          </div>
        </section>
        <dialog
          ref={detailDialog}
          className="product-detail-dialog"
          aria-labelledby="product-detail-title"
          onClick={(event) => {
            if (
              event.target === detailDialog.current &&
              (!editingProduct ||
                window.confirm('Tienes cambios sin guardar. ¿Cerrar de todos modos?'))
            )
              detailDialog.current.close();
          }}
          onCancel={(event) => {
            if (
              editingProduct &&
              !window.confirm('Tienes cambios sin guardar. ¿Cerrar de todos modos?')
            )
              event.preventDefault();
          }}
          onClose={() => {
            setSelectedProduct(null);
          }}
        >
          {selectedProduct && (
            <div>
              <IconButton
                className="dialog-close"
                label="Cerrar detalle del producto"
                onClick={() => detailDialog.current?.close()}
              >
                <NexoIcon name="close" decorative />
              </IconButton>
              <div className="product-detail-media">
                {primaryMedia(selectedProduct) ? (
                  <img
                    src={productMediaUrl(
                      org,
                      selectedProduct,
                      primaryMedia(selectedProduct)?.id ?? '',
                    )}
                    alt={selectedProduct.name}
                  />
                ) : (
                  <span>
                    <ProductIcon
                      value={selectedProduct.metadata?.iconKey}
                      type={selectedProduct.type}
                    />
                  </span>
                )}
              </div>
              <p className="overline">DETALLE DEL PRODUCTO</p>
              <h2 id="product-detail-title">{selectedProduct.name}</h2>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingProduct((value) => !value);
                }}
              >
                {editingProduct ? 'Cancelar edición' : 'Editar producto'}
              </Button>
              {editingProduct && (
                <form className="product-edit-form" onSubmit={(event) => void updateProduct(event)}>
                  <TextField
                    label="Nombre"
                    value={editName}
                    onChange={(event) => {
                      setEditName(event.currentTarget.value);
                    }}
                    required
                  />
                  <TextField
                    label="SKU"
                    value={editSku}
                    onChange={(event) => {
                      setEditSku(event.currentTarget.value);
                    }}
                  />
                  <TextArea
                    label="Descripción"
                    value={editDescription}
                    onChange={(event) => {
                      setEditDescription(event.currentTarget.value);
                    }}
                  />
                  <NexoSelect
                    label="Categoría"
                    value={editCategory}
                    onValueChange={setEditCategory}
                    searchable={categories.length > 8}
                    options={[
                      { value: '', label: 'Sin categoría' },
                      ...categories.map((item) => ({ value: item.id, label: item.name })),
                    ]}
                  />
                  <TextField
                    label="Precio"
                    inputMode="decimal"
                    value={editPrice}
                    onChange={(event) => {
                      setEditPrice(event.currentTarget.value);
                    }}
                  />
                  <TextField
                    label="Código de barras"
                    value={editBarcode}
                    onChange={(event) => {
                      setEditBarcode(event.currentTarget.value);
                    }}
                  />
                  <fieldset className="product-icon-picker">
                    <legend>Icono</legend>
                    {[
                      ['cup', 'Taza'],
                      ['food', 'Alimento'],
                      ['bag', 'Producto'],
                      ['service', 'Servicio'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={editIcon === value}
                        onClick={() => {
                          setEditIcon(value ?? 'bag');
                        }}
                      >
                        <NexoIcon name={productIcon(value ?? 'bag')} decorative />
                        {label}
                      </button>
                    ))}
                  </fieldset>
                  <FileUpload
                    label="Reemplazar fotografía"
                    help="La nueva imagen será la principal."
                    onFile={setEditImage}
                  />
                  <SaveStatus state={mutation} {...(error ? { message: error } : {})} />
                  <MutationButton type="submit" state={mutation} disabled={!editName.trim()}>
                    Guardar cambios
                  </MutationButton>
                </form>
              )}
              <dl className="product-detail-facts">
                <div>
                  <dt>SKU</dt>
                  <dd>{selectedProduct.sku ?? 'Sin SKU'}</dd>
                </div>
                <div>
                  <dt>Precio</dt>
                  <dd>{priceLabel(selectedProduct)}</dd>
                </div>
                <div>
                  <dt>Categoría</dt>
                  <dd>{selectedProduct.category?.name ?? 'Sin categoría'}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{status(selectedProduct.status)}</dd>
                </div>
                <div>
                  <dt>Código de barras</dt>
                  <dd>
                    {selectedProduct.barcodes?.find((item) => item.isPrimary)?.value ??
                      selectedProduct.barcodes?.[0]?.value ??
                      'Sin código'}
                  </dd>
                </div>
              </dl>
              <p>{selectedProduct.description ?? 'Sin descripción.'}</p>
            </div>
          )}
        </dialog>
      </main>
    </NexoAppShell>
  );
}
function primaryMedia(product: Product) {
  return (
    product.media?.find((item) => item.status === 'ACTIVE' && item.isPrimary) ??
    product.media?.find((item) => item.status === 'ACTIVE')
  );
}
function productMediaUrl(org: string, product: Product, mediaId: string) {
  return browserReachableUrl(
    `${api}/v1/organizations/${org}/products/${product.id}/media/${mediaId}`,
  ).toString();
}
function priceLabel(product: Product) {
  const price = product.prices?.[0];
  return price ? `${price.amount} ${price.currency}` : 'Sin precio';
}
function status(v: string) {
  return (
    ({ ACTIVE: 'Activo', ARCHIVED: 'Archivado', DRAFT: 'Borrador' } as Record<string, string>)[v] ??
    'Estado disponible'
  );
}
function slug(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'categoria'
  );
}
function normalizeLabel(value: string) {
  return value.trim().normalize('NFKC').toLocaleLowerCase('es-MX').replace(/\s+/gu, ' ');
}
function safeFileName(value: string) {
  return value.replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 200) || 'producto.webp';
}
function productIcon(value: string) {
  return resolveProductIcon(value);
}
function csrf() {
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((x) => x.startsWith('nexo_csrf='))
      ?.split('=')[1] ?? '',
  );
}
