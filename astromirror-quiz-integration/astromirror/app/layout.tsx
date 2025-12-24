import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: {
    default: 'AstroMirror | Kosmischer Spiegel',
    template: '%s | AstroMirror',
  },
  description: 'Premium astrologische Berechnungen mit Voice-Agent. Für Menschen, die tiefer schauen wollen.',
  keywords: ['Astrologie', 'Horoskop', 'Geburtshoroskop', 'Voice Agent', 'Premium'],
  authors: [{ name: 'AstroMirror' }],
  metadataBase: new URL('https://astromirror.io'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'AstroMirror',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-obsidian text-ivory antialiased">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
