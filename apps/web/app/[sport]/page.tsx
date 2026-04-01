import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {assertSanityConfig, client} from '@/lib/sanity/client'
import {defaultLocale, sportHubQuery} from '@/lib/sanity/queries'

export const revalidate = 60

type Props = {params: Promise<{sport: string}>}

export default async function SportHubPage({params}: Props) {
  const {sport: sportSlug} = await params
  assertSanityConfig()

  const data = await client.fetch(sportHubQuery, {
    sportSlug,
    locale: defaultLocale,
  })

  if (!data) {
    notFound()
  }

  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl kinetic-gradient px-6 py-14 text-white md:px-10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{data.name || sportSlug}</h1>
          {data.hasTeams === false && (
            <p className="mt-2 text-sm text-white/80">Individual sport (teams optional)</p>
          )}
        </div>
        {data.heroImage?.url && (
          <div className="absolute right-0 top-0 h-full w-1/2 max-md:hidden">
            <Image
              src={data.heroImage.url}
              alt=""
              fill
              className="object-cover opacity-40"
              sizes="50vw"
              priority
            />
          </div>
        )}
      </section>

      {data.featuredPlayers?.length > 0 && (
        <section className="section-surface mt-10 rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold">Featured players</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.featuredPlayers.map(
              (p: {
                _id: string
                name?: string
                slug?: {current?: string}
                position?: string
                portrait?: {url?: string}
                teamName?: string
              }) => (
                <li key={p._id}>
                  <Link
                    href={`/${sportSlug}/players/${p.slug?.current}`}
                    className="card-surface flex gap-4 rounded-xl p-4 transition hover:opacity-90"
                  >
                    {p.portrait?.url && (
                      <Image
                        src={p.portrait.url}
                        alt=""
                        width={72}
                        height={72}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-[color:var(--color-text)]">{p.name}</p>
                      {p.position && (
                        <p className="text-sm text-[color:var(--color-text-secondary)]">{p.position}</p>
                      )}
                      {p.teamName && (
                        <p className="text-xs text-[color:var(--color-text-secondary)]">{p.teamName}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {data.upcomingTournaments?.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Upcoming tournaments</h2>
          <ul className="mt-4 space-y-3">
            {data.upcomingTournaments.map(
              (t: {
                _id: string
                name?: string
                slug?: {current?: string}
                edition?: string
                startDate?: string
              }) => (
                <li key={t._id}>
                  <Link
                    href={`/${sportSlug}/tournaments/${t.slug?.current}`}
                    className="block rounded-xl bg-[color:var(--color-surface-container-low)] px-4 py-3 hover:opacity-90"
                  >
                    <span className="font-medium">{t.name}</span>
                    {t.edition && (
                      <span className="ml-2 text-sm text-[color:var(--color-text-secondary)]">{t.edition}</span>
                    )}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {data.latestArticles?.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Latest news</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {data.latestArticles.map(
              (a: {
                _id: string
                title?: string
                slug?: {current?: string}
                articleType?: string
                authorName?: string
              }) => (
                <li key={a._id}>
                  <Link
                    href={`/${sportSlug}/news/${a.slug?.current}`}
                    className="card-surface block rounded-xl p-4 hover:opacity-90"
                  >
                    <p className="font-medium">{a.title}</p>
                    <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                      {a.articleType}
                      {a.authorName ? ` · ${a.authorName}` : ''}
                    </p>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {data.featuredProducts?.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Gear</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.featuredProducts.map(
              (pr: {
                _id: string
                name?: string
                slug?: {current?: string}
                price?: {amount?: number; currency?: string}
                image?: {url?: string}
              }) => (
                <li key={pr._id}>
                  <Link href={`/shop/${pr.slug?.current}`} className="card-surface block overflow-hidden rounded-xl">
                    {pr.image?.url && (
                      <div className="relative aspect-[4/3] w-full">
                        <Image src={pr.image.url} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-medium">{pr.name}</p>
                      {pr.price?.amount != null && (
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                          {pr.price.currency} {pr.price.amount}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {!data.featuredPlayers?.length &&
        !data.upcomingTournaments?.length &&
        !data.latestArticles?.length &&
        !data.featuredProducts?.length && (
          <p className="mt-10 text-[color:var(--color-text-secondary)]">
            No related content yet — add players, tournaments, articles, or products in Sanity Studio.
          </p>
        )}
    </div>
  )
}
