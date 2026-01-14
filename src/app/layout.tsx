import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lactalis Academy - Capacitación',
  description: 'Completa tu lección diaria y gana puntos.',
  openGraph: {
    title: 'Lactalis Academy - Lección 1',
    description: 'Mira el video de bienvenida y suma Lactalises.',
    url: 'https://lactalis-demo.vercel.app/demo',
    siteName: 'Lactalis México',
    type: 'video.other', // Esto ayuda a WhatsApp a entender que hay un video
    images: [
      {
        url: 'https://lactalis-demo.vercel.app/thumbnail-demo.png',
        width: 800,
        height: 600,
        alt: 'Lactalis Academy Preview',
      },
    ],
    // Intentamos forzar el player de video en el preview
    videos: [
      {
        url: 'https://lactalis-demo.vercel.app/videos/bienvenida.mp4',
        width: 1080,
        height: 1920,
        type: 'video/mp4',
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
        {/* Este meta asegura que en móviles el sitio no se vea chiquito y use bien el espacio */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" 
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}