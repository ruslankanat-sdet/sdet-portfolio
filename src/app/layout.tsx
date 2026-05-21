import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ruslan Kanatbek — SDET Portfolio',
  description:
    'Portfolio of Ruslan Kanatbek, Senior SDET/QA Automation Engineer. Real Playwright and Pytest tests in an IDE-style showcase.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} site-body`}>
        <SiteHeader />
        <main className="site-main">{children}</main>
        <Footer variant="compact" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
