import {NextResponse} from 'next/server'

export const runtime = 'edge'

/** Algolia proxy placeholder (PRD §8). */
export async function GET() {
  return NextResponse.json({message: 'Search not configured'}, {status: 501})
}
