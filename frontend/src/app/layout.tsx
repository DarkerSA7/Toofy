import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/index.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: 'Toofy.Tv - Anime Platform',
  description: 'Discover and watch the latest anime releases on Toofy.Tv',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    type: 'website',
    url: 'http://localhost:3000',
    title: 'Toofy.Tv - Anime Platform',
    description: 'Discover and watch the latest anime releases on Toofy.Tv',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toofy.Tv - Anime Platform',
    description: 'Discover and watch the latest anime releases on Toofy.Tv',
  },
  icons: {},
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Read theme from cookie (same as theme-provider)
                  const getCookie = (name) => {
                    const value = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
                    return value ? value.pop() : '';
                  };
                  
                  const theme = getCookie('vite-ui-theme') || 'system';
                  let resolvedTheme = theme;
                  
                  // Resolve 'system' to actual theme
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  // Apply theme immediately to prevent flash
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolvedTheme);
                } catch (e) {
                  // Fallback to light theme on error
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
