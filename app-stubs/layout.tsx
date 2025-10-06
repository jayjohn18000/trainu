import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrainU - AI-Powered Fitness Coaching',
  description: 'Scale great coaching with AI agents that reduce admin work and increase show-rates.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// TODO: Implement Providers component
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* TODO: Add theme provider */}
      {/* TODO: Add auth provider */}
      {/* TODO: Add PostHog provider */}
      {/* TODO: Add error boundary */}
      {children}
    </>
  )
}
