import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// CONFIGURACIÓN DE METADATOS PARA FORZAR EL PLAY EN WHATSAPP
export const metadata: Metadata = {
  title: 'Lactalis Academy - Capacitación',
  description: 'Mira el video y suma tus primeros 50 puntos.',
  openGraph: {
    title: 'Lactalis Academy - Kraft Singles',
    description: 'Aprende sobre los ingredientes y beneficios de Kraft Singles.',
    url: 'https://lactalis-demo.vercel.app/',
    siteName: 'Lactalis México',
    type: 'video.other', 
    images: [
      {
        url: 'https://lactalis-demo.vercel.app/videos/poster2.png',
        width: 1920,
        height: 1080,
        alt: 'Kraft Singles - Video de Capacitación',
      },
    ],
    videos: [
      {
        url: 'https://lactalis-demo.vercel.app/videos/Kraft_Singles_Commercial_Script.mp4',
        secureUrl: 'https://lactalis-demo.vercel.app/videos/Kraft_Singles_Commercial_Script.mp4',
        type: 'video/mp4',
        width: 1920,
        height: 1080,
      },
    ],
  },
  // ESTO ES LO QUE SUELE ACTIVAR EL BOTÓN EN IPHONE/WHATSAPP
  twitter: {
    card: 'player',
    title: 'Lactalis Academy - Kraft Singles',
    description: 'Aprende sobre los ingredientes y beneficios de Kraft Singles.',
    images: ['https://lactalis-demo.vercel.app/videos/poster2.png'],
    players: [
      {
        playerUrl: 'https://lactalis-demo.vercel.app/',
        streamUrl: 'https://lactalis-demo.vercel.app/videos/Kraft_Singles_Commercial_Script.mp4',
        width: 1920,
        height: 1080,
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
        <meta property="og:video:width" content="1920" />
        <meta property="og:video:height" content="1080" />
        <meta property="og:image" content="https://lactalis-demo.vercel.app/videos/poster2.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}