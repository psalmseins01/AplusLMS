import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'A+ LMS - Learning Management System',
    template: '%s | A+ LMS'
  },
  description: 'A comprehensive Learning Management System for A+ Computer Training - manage courses, track progress, and enhance learning experiences.',
  keywords: ['LMS', 'Learning Management System', 'Education', 'Online Learning', 'A+ Computer Training'],
  authors: [{ name: 'A+ Computer Training' }],
  creator: 'A+ Computer Training',
  publisher: 'A+ Computer Training',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    siteName: 'A+ LMS',
    title: 'A+ LMS - Learning Management System',
    description: 'Comprehensive Learning Management System for A+ Computer Training',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script async src="https://api.lindy.ai/api/lindyEmbed/lindyEmbed.js?a=45f1ea05-fecd-4c5d-9c1a-496d532834d8" crossOrigin="use-credentials"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
