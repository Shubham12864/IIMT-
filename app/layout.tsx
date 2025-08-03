import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'IIMT Group of Colleges - Student Portal',
  description: 'Official student portal and donation system for IIMT Group of Colleges - Leading educational institution',
  keywords: 'IIMT Group of Colleges, student portal, donations, education, university',
  authors: [{ name: 'IIMT Group of Colleges' }],
  creator: 'IIMT Group of Colleges',
  publisher: 'IIMT Group of Colleges',
  icons: {
    icon: '/images/iimt-university-logo.png',
    shortcut: '/images/iimt-university-logo.png',
    apple: '/images/iimt-university-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://iimt.vercel.app',
    title: 'IIMT Group of Colleges - Student Portal',
    description: 'Official student portal and donation system for IIMT Group of Colleges',
    siteName: 'IIMT Group of Colleges',
    images: [
      {
        url: '/images/iimt-university-logo.png',
        width: 800,
        height: 600,
        alt: 'IIMT Group of Colleges Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IIMT Group of Colleges - Student Portal',
    description: 'Official student portal and donation system for IIMT Group of Colleges',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/iimt-university-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/iimt-university-logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
