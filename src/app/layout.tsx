import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://lactalis-demo.vercel.app'),
  title: 'Lactalis Academy - Kraft Singles',
  description: 'Aprende sobre los ingredientes y beneficios de Kraft Singles. Descubre por qué es queso de verdad con calcio.',
  openGraph: {
    title: 'Lactalis Academy - Kraft Singles',
    description: 'Aprende sobre los ingredientes y beneficios de Kraft Singles.',
    url: 'https://lactalis-demo.vercel.app/',
    siteName: 'Lactalis México',
    images: [
      {
        url: '/poster2.png',
        width: 838,
        height: 810,
        alt: 'Kraft Singles - Capacitación',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lactalis Academy - Kraft Singles',
    description: 'Aprende sobre los ingredientes y beneficios de Kraft Singles.',
    images: ['/poster2.png'],
  },
  other: {
    'og:image:type': 'image/png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
