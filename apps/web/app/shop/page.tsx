import Image from 'next/image'
import Link from 'next/link'
import {assertSanityConfig, client} from '@/lib/sanity/client'
import {defaultLocale, productListQuery} from '@/lib/sanity/queries'

export const revalidate = 60

export default async function ShopPage() {
  assertSanityConfig()
  const products = await client.fetch(productListQuery, {locale: defaultLocale})

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-4xl font-bold">Shop</h1>
      <p className="mt-2 text-[color:var(--color-text-secondary)]">Inspired by stitch_project_placeholder_title/sportverse_shop.</p>
      {!products?.length && (
        <p className="mt-8 text-[color:var(--color-text-secondary)]">No products in Sanity yet.</p>
      )}
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map(
          (p: {
            _id: string
            name?: string
            slug?: {current?: string}
            price?: {amount?: number; currency?: string}
            images?: {url?: string}
            categoryName?: string
          }) => (
            <li key={p._id}>
              <Link href={`/shop/${p.slug?.current}`} className="card-surface block overflow-hidden rounded-xl">
                {p.images?.url && (
                  <div className="relative aspect-square w-full bg-[color:var(--color-surface-container-low)]">
                    <Image src={p.images.url} alt="" fill className="object-cover" sizes="33vw" />
                  </div>
                )}
                <div className="p-4">
                  {p.categoryName && (
                    <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-secondary)]">{p.categoryName}</p>
                  )}
                  <p className="mt-1 font-medium">{p.name}</p>
                  {p.price?.amount != null && (
                    <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                      {p.price.currency} {p.price.amount}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
