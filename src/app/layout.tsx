import './globals.css' // <--- ESTO ES LO QUE CARGA TUS ESTILOS BONITOS
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

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
        url: 'https://lactalis-demo.vercel.app/thumbnail-demo.png',
        width: 800,
        height: 600,
        alt: 'Lactalis Academy Preview',
      },
    ],
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}