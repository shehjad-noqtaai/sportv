import Link from 'next/link'

export const revalidate = 60

export default async function ShopCategoryPage({params}: {params: Promise<{category: string}>}) {
  const {category} = await params
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/shop" className="text-sm text-[color:var(--color-primary)] hover:underline">
        ← All products
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold capitalize">{category.replace(/-/g, ' ')}</h1>
      <p className="mt-2 text-[color:var(--color-text-secondary)]">Filter by category slug — add GROQ when ready.</p>
    </div>
  )
}
