import {revalidatePath, revalidateTag} from 'next/cache'
import {type NextRequest, NextResponse} from 'next/server'
import {parseBody} from 'next-sanity/webhook'

type WebhookDoc = {
  _type: string
  slug?: {current?: string}
  sport?: {slug?: {current?: string}}
}

const revalidationPaths: Record<string, (doc: WebhookDoc) => string[]> = {
  sport: (doc) => (doc.slug?.current ? [`/${doc.slug.current}`] : []),
  player: (doc) => {
    const s = doc.sport?.slug?.current
    const p = doc.slug?.current
    if (!s || !p) return []
    return [`/${s}/players/${p}`, `/${s}`]
  },
  team: (doc) => {
    const s = doc.sport?.slug?.current
    const t = doc.slug?.current
    if (!s || !t) return []
    return [`/${s}/teams/${t}`, `/${s}`]
  },
  tournament: (doc) => {
    const s = doc.sport?.slug?.current
    const t = doc.slug?.current
    if (!s || !t) return []
    return [`/${s}/tournaments/${t}`, `/${s}`]
  },
  article: (doc) => {
    const s = doc.sport?.slug?.current
    const a = doc.slug?.current
    if (!s || !a) return []
    return [`/${s}/news/${a}`, `/${s}`]
  },
  product: (doc) => {
    const slug = doc.slug?.current
    return slug ? [`/shop/${slug}`, `/shop`] : [`/shop`]
  },
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return new NextResponse('Missing SANITY_REVALIDATE_SECRET', {status: 500})
  }

  try {
    const {body, isValidSignature} = await parseBody<WebhookDoc>(req, secret)

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', {status: 401})
    }

    if (!body?._type) {
      return new NextResponse('Missing document type', {status: 400})
    }

    const fn = revalidationPaths[body._type]
    if (fn) {
      for (const path of fn(body)) {
        revalidatePath(path)
      }
      revalidateTag(body._type)
    }

    return NextResponse.json({revalidated: true, type: body._type, now: Date.now()})
  } catch {
    return new NextResponse('Webhook handler failed', {status: 500})
  }
}
