import type {Metadata} from 'next'
import {Inter, Plus_Jakarta_Sans} from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SportVerse',
  description: 'Multi-sport editorial and commerce platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${inter.variable} min-h-screen antialiased`}>
        <header className="sticky top-0 z-50 border-b border-transparent bg-[color:var(--color-surface)]/80 backdrop-blur-[20px]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="font-display text-xl font-bold tracking-tight text-[color:var(--color-primary)]">
              SportVerse
            </Link>
            <nav className="flex gap-6 text-sm text-[color:var(--color-text-secondary)]">
              <Link href="/cricket" className="hover:text-[color:var(--color-text)]">
                Cricket
              </Link>
              <Link href="/tennis" className="hover:text-[color:var(--color-text)]">
                Tennis
              </Link>
              <Link href="/esports" className="hover:text-[color:var(--color-text)]">
                E-sports
              </Link>
              <Link href="/shop" className="hover:text-[color:var(--color-text)]">
                Shop
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="section-surface mt-16 px-4 py-12 text-center text-sm text-[color:var(--color-text-secondary)]">
          SportVerse — content from Sanity
        </footer>
      </body>
    </html>
  )
}
