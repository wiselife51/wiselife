import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Vida Sabia | Psicologia Clinica - Stephanie Rincon",
  description:
    "Terapia psicologica personalizada con enfoque en TCC. Sesiones presenciales en Bogota y online. Espacio seguro, confidencial y profesional para tu bienestar emocional.",
  keywords: [
    "psicologia clinica",
    "terapia cognitivo conductual",
    "TCC",
    "psicologa bogota",
    "terapia online",
    "salud mental",
    "bienestar emocional",
    "terapia de pareja",
    "ansiedad",
    "depresion",
  ],
  authors: [{ name: "Stephanie Rincon" }],
  creator: "Vida Sabia",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://vidasabia.com",
    siteName: "Vida Sabia",
    title: "Vida Sabia | Psicologia Clinica",
    description:
      "Terapia psicologica personalizada con enfoque en TCC. Tu bienestar emocional es nuestra prioridad.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vida Sabia - Psicologia Clinica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vida Sabia | Psicologia Clinica",
    description: "Terapia psicologica personalizada con enfoque en TCC.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0d1117",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
