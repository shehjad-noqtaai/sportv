import Link from 'next/link'

export const revalidate = 0

export default async function ArticlePage({params}: {params: Promise<{sport: string; slug: string}>}) {
  const {sport} = await params
  return (
    <div>
      <Link href={`/${sport}`} className="text-sm text-[color:var(--color-primary)] hover:underline">
        ← Hub
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold">Article</h1>
      <p className="mt-2 text-[color:var(--color-text-secondary)]">SSR article body — wire Portable Text next.</p>
    </div>
  )
}
