import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  // metadataBase is required so the relative /og path in openGraph.images resolves correctly
  // (Next.js Pitfall: without this, relative OG image URLs cause a build error).
  // Use NEXT_PUBLIC_SITE_URL env var on Vercel; fall back to canonical domain for local/preview builds.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ruslankanat.dev'),
  title: 'Ruslan Kanatbek — SDET Portfolio',
  description:
    'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer. Real Playwright and Pytest tests in an IDE-style showcase.',
  openGraph: {
    title: 'Ruslan Kanatbek SDET Portfolio',
    description:
      'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer. Real Playwright and Pytest tests in an IDE-style showcase.',
    url: '/',
    siteName: 'Ruslan Kanatbek SDET Portfolio',
    images: [{ url: '/og', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ruslan Kanatbek SDET Portfolio',
    description:
      'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer. Real Playwright and Pytest tests in an IDE-style showcase.',
    images: ['/og'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} site-body`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
