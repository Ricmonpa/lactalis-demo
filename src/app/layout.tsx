import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// CONFIGURACIÓN DE METADATOS PARA FORZAR EL PLAY EN WHATSAPP
export const metadata: Metadata = {
  title: 'Lactalis Academy - Capacitación',
  description: 'Mira el video y suma tus primeros 50 puntos.',
  openGraph: {
    title: 'Lactalis Academy - Bienvenida',
    description: 'Video de inducción para nuevos colaboradores.',
    url: 'https://lactalis-demo.vercel.app/demo',
    siteName: 'Lactalis México',
    type: 'video.other', 
    images: [
      {
        url: 'https://lactalis-demo.vercel.app/thumbnail-demo.png',
        width: 800,
        height: 600,
      },
    ],
    videos: [
      {
        url: 'https://lactalis-demo.vercel.app/videos/bienvenida.mp4',
        secureUrl: 'https://lactalis-demo.vercel.app/videos/bienvenida.mp4',
        type: 'video/mp4',
        width: 1080,
        height: 1920,
      },
    ],
  },
  // ESTO ES LO QUE SUELE ACTIVAR EL BOTÓN EN IPHONE/WHATSAPP
  twitter: {
    card: 'player',
    title: 'Lactalis Academy - Bienvenida',
    description: 'Video de inducción para nuevos colaboradores.',
    images: ['https://lactalis-demo.vercel.app/thumbnail-demo.png'],
    players: [
      {
        playerUrl: 'https://lactalis-demo.vercel.app/demo',
        streamUrl: 'https://lactalis-demo.vercel.app/videos/bienvenida.mp4',
        width: 1080,
        height: 1920,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Forzamos que WhatsApp no ignore el video */}
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1080" />
        <meta property="og:video:height" content="1920" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}