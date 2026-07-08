import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import './globals.css'
import { Nav } from '@/components/layout/nav'
import { FooterWrapper } from '@/components/layout/footer-wrapper'

const jakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kerb.autos'),
  title: { default: 'Kerb — Find Your Next Car', template: '%s | Kerb' },
  description: 'Real Kerb Appeal. The UK car marketplace built on transparency. Verified dealers, direct contact, no games.',
  keywords: ['used cars UK', 'buy used car UK', 'UK car marketplace', 'verified car dealers', 'transparent car buying', 'Kerb'],

  verification: {
    google: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_ID,
  },
  openGraph: {
    title: 'Kerb — Find Your Next Car',
    description: 'Real Kerb Appeal. The UK car marketplace built on transparency. Verified dealers, direct contact, no games.',
    url: 'https://kerb.autos',
    siteName: 'Kerb',
    type: 'website',
    locale: 'en_GB',
    images: [
      {
        url: '/screenshots/hero.png',
        width: 1200,
        height: 630,
        alt: 'Kerb — Real Kerb Appeal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kerb — Find Your Next Car',
    description: 'Real Kerb Appeal. The UK car marketplace built on transparency.',
    images: ['/screenshots/hero.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F8FA]">
        <Nav />
        <main className="flex-1">{children}</main>
        {/* GA4 */}
        {process.env.NEXT_PUBLIC_GA_ID && <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());
            gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');
          `}</Script>
        </>}
        {/* Microsoft Clarity (heatmaps) */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="clarity-init" strategy="afterInteractive">{`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");
          `}</Script>
        )}
        <FooterWrapper><footer className="border-t border-[#E5E5E7] bg-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div>
                <a href="/" className="flex items-center gap-2.5 no-underline">
                  <svg width="22" height="22" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="20" width="44" height="14" rx="2" fill="#0A0A0F"/>
                    <rect x="26" y="42" width="44" height="14" rx="2" fill="#0A0A0F"/>
                  </svg>
                  <span className="text-[15px] font-medium tracking-[0.32em] uppercase text-[#0A0A0F]">Kerb</span>
                </a>
                <p className="mt-2 text-sm font-medium text-[#0A0A0F]">Real Kerb Appeal.</p>
                <p className="mt-1 text-sm text-[#6E6E73] max-w-xs">The UK car marketplace built on transparency. Verified dealers, direct contact, no games.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-[#0A0A0F]">Buy</p>
                  <a href="/search" className="block text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">Search cars</a>
                  <a href="/dealers" className="block text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">Find a dealer</a>
                  <a href="/advice" className="block text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">Advice</a>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-[#0A0A0F]">Dealers</p>
                  <a href="/dealers/join" className="block text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">Why Kerb</a>
                  <a href="/dealers/register" className="block text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">List your cars</a>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-[#0A0A0F]">Company</p>
                  <a href="/about" className="block text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">About</a>
                  <a href="/contact" className="block text-[#6E6E73] hover:text-[#0A0A0F] transition-colors">Contact</a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[#E5E5E7] text-xs text-[#6E6E73] flex flex-wrap gap-4 items-center justify-between">
              <span>© 2026 Kerb Ltd. All rights reserved.</span>
              <div className="flex gap-4">
                <a href="/terms" className="hover:text-[#0A0A0F] transition-colors">Terms</a>
                <a href="/privacy" className="hover:text-[#0A0A0F] transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </footer></FooterWrapper>
      </body>
    </html>
    </ClerkProvider>
  )
}
