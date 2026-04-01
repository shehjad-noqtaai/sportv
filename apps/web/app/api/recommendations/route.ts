import {NextResponse} from 'next/server'

export const runtime = 'edge'

/** Recommendations placeholder (PRD §7). */
export async function GET() {
  return NextResponse.json({items: []})
}
