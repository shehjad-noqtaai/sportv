import Link from 'next/link'

export const revalidate = 300

export default async function TeamPage({params}: {params: Promise<{sport: string; slug: string}>}) {
  const {sport} = await params
  return (
    <div>
      <Link href={`/${sport}`} className="text-sm text-[color:var(--color-primary)] hover:underline">
        ← Hub
      </Link>
      <h1 className="font-display mt-4 text-3xl font-bold">Team</h1>
      <p className="mt-2 text-[color:var(--color-text-secondary)]">Team detail + roster — wire to GROQ next.</p>
    </div>
  )
}
