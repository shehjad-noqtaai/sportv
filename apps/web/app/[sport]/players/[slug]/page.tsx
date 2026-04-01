import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {assertSanityConfig, client} from '@/lib/sanity/client'
import {defaultLocale, playerBySlugQuery} from '@/lib/sanity/queries'

export const revalidate = 300

type Props = {params: Promise<{sport: string; slug: string}>}

export default async function PlayerProfilePage({params}: Props) {
  const {sport: sportSlug, slug} = await params
  assertSanityConfig()

  const player = await client.fetch(playerBySlugQuery, {
    playerSlug: slug,
    locale: defaultLocale,
  })

  if (!player) {
    notFound()
  }

  const playerSportSlug = player.sport?.slug?.current
  if (playerSportSlug && playerSportSlug !== sportSlug) {
    notFound()
  }

  return (
    <div>
      <Link href={`/${sportSlug}`} className="text-sm text-[color:var(--color-primary)] hover:underline">
        ← {player.sport?.name || sportSlug}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
        <div className="card-surface overflow-hidden rounded-2xl">
          {player.portrait?.url ? (
            <div className="relative aspect-[3/4] w-full">
              <Image src={player.portrait.url} alt="" fill className="object-cover" sizes="280px" priority />
            </div>
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center bg-[color:var(--color-surface-container-low)] text-[color:var(--color-text-secondary)]">
              No portrait
            </div>
          )}
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-[color:var(--color-text-secondary)]">
            {player.position}
            {player.isActive === false && ' · Retired'}
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight md:text-5xl">{player.name}</h1>
          {player.nickname && <p className="mt-1 text-lg text-[color:var(--color-text-secondary)]">{player.nickname}</p>}
          {(player.nationality || player.dateOfBirth) && (
            <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
              {[player.nationality, player.dateOfBirth].filter(Boolean).join(' · ')}
            </p>
          )}
          {player.currentTeam && (
            <p className="mt-4">
              <span className="text-[color:var(--color-text-secondary)]">Current team: </span>
              <Link
                href={`/${sportSlug}/teams/${player.currentTeam.slug?.current}`}
                className="font-medium text-[color:var(--color-primary)] hover:underline"
              >
                {player.currentTeam.name}
              </Link>
            </p>
          )}
        </div>
      </div>

      {player.endorsedProducts?.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Endorsed gear</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {player.endorsedProducts.map(
              (p: {_id: string; name?: string; slug?: {current?: string}; images?: {url?: string}}) => (
                <li key={p._id}>
                  <Link href={`/shop/${p.slug?.current}`} className="card-surface block overflow-hidden rounded-xl">
                    {p.images?.url && (
                      <div className="relative aspect-video w-full">
                        <Image src={p.images.url} alt="" fill className="object-cover" sizes="33vw" />
                      </div>
                    )}
                    <p className="p-3 font-medium">{p.name}</p>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {player.relatedArticles?.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">In the news</h2>
          <ul className="mt-4 space-y-2">
            {player.relatedArticles.map(
              (a: {_id: string; title?: string; slug?: {current?: string}}) => (
                <li key={a._id}>
                  <Link href={`/${sportSlug}/news/${a.slug?.current}`} className="text-[color:var(--color-primary)] hover:underline">
                    {a.title}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      )}
    </div>
  )
}
