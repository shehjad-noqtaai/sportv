import Link from 'next/link'

export const revalidate = 120

export default async function TournamentPage({params}: {params: Promise<{sport: string; slug: string}>}) {
  const {sport} = await params
  return (
    <div>
      <Link href={`/${sport}`} className="text-sm text-[color:var(--color-primary)] hover:underline">
        ← Hub
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold">Tournament</h1>
      <p className="mt-2 text-[color:var(--color-text-secondary)]">Tournament detail — wire to GROQ next.</p>
    </div>
  )
}
