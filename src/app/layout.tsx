import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lactalis Academy - Capacitación',
  description: 'Completa tu lección diaria y gana puntos.',
  openGraph: {
    title: 'Lactalis Academy - Lección 1',
    description: 'Mira el video de bienvenida y suma Lactalises.',
    url: 'https://lactalis-demo.vercel.app/demo',
    siteName: 'Lactalis México',
    images: [
      {
        url: 'https://lactalis-demo.vercel.app/thumbnail-demo.png', // RECUERDA: Sube esta imagen a tu carpeta /public
        width: 800,
        height: 600,
        alt: 'Lactalis Academy Preview',
      },
    ],
    type: 'website',
  },
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}