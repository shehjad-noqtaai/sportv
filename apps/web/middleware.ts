import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

/** Edge middleware stub — geo / personalization (PRD §7.2). */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
