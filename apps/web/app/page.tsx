import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[color:var(--color-primary)]">
        The Kinetic Stadium
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-[color:var(--color-text)] md:text-5xl">
        Welcome to SportVerse
      </h1>
      <p className="mt-4 text-lg text-[color:var(--color-text-secondary)]">
        Editorial hubs, player profiles, and shop — powered by Sanity. UI aligns with{' '}
        <code className="rounded bg-[color:var(--color-surface-container-low)] px-1">DESIGN.md</code> and Stitch mocks in{' '}
        <code className="rounded bg-[color:var(--color-surface-container-low)] px-1">stitch_project_placeholder_title/</code>.
      </p>
      <ul className="mt-10 space-y-3 text-[color:var(--color-text)]">
        <li>
          <Link href="/cricket" className="text-[color:var(--color-primary)] underline-offset-4 hover:underline">
            Cricket hub
          </Link>{' '}
          — see <code className="text-sm">cricket_hub/code.html</code>
        </li>
        <li>
          <Link href="/shop" className="text-[color:var(--color-primary)] underline-offset-4 hover:underline">
            Shop
          </Link>{' '}
          — see <code className="text-sm">sportverse_shop/shop_code.html</code>
        </li>
      </ul>
    </div>
  )
}
