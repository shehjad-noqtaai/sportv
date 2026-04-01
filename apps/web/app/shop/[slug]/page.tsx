import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {assertSanityConfig, client} from '@/lib/sanity/client'
import {defaultLocale, productBySlugQuery} from '@/lib/sanity/queries'

export const revalidate = 60

export default async function ProductDetailPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  assertSanityConfig()

  const product = await client.fetch(productBySlugQuery, {
    productSlug: slug,
    locale: defaultLocale,
  })

  if (!product) {
    notFound()
  }

  const mainImage = product.images?.[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/shop" className="text-sm text-[color:var(--color-primary)] hover:underline">
        ← Shop
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[color:var(--color-surface-container-low)]">
          {mainImage?.url ? (
            <Image src={mainImage.url} alt="" fill className="object-cover" sizes="50vw" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-[color:var(--color-text-secondary)]">No image</div>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
          {product.sku && <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">SKU {product.sku}</p>}
          {product.price?.amount != null && (
            <p className="mt-4 text-2xl font-semibold text-[color:var(--color-primary)]">
              {product.price.currency} {product.price.amount}
              {product.compareAtPrice != null && product.compareAtPrice > product.price.amount && (
                <span className="ml-2 text-lg font-normal text-[color:var(--color-text-secondary)] line-through">
                  {product.compareAtPrice}
                </span>
              )}
            </p>
          )}
          {product.category?.name && (
            <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">{product.category.name}</p>
          )}
          {product.endorsedBy?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold">Endorsed by</h2>
              <ul className="mt-2 space-y-1">
                {product.endorsedBy.map((pl: {name?: string; slug?: {current?: string}}) => (
                  <li key={pl.slug?.current}>
                    {pl.name}
                    {pl.slug?.current && (
                      <span className="text-[color:var(--color-text-secondary)]"> — profile in Studio</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
