import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SementesPLAY - Sistema de Cashback e Doações FiveM',
  description: 'Sistema de cashback e doações para o ecossistema FiveM. Receba 10% de cashback em compras e doe para criadores de conteúdo.',
  keywords: 'fivem, cashback, doações, criadores, sementes, gaming',
  authors: [{ name: 'SementesPLAY Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
