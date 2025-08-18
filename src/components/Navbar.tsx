'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)

  // Usar o contexto de autenticação
  const { usuario, isAuthenticated, logout } = useAuth()

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleMenuItemClick = (path: string) => {
    router.push(path)
    setShowProfileMenu(false)
    setShowMobileMenu(false)
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
    setShowMobileMenu(false)
  }

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="bg-black shadow-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-3xl">🌱</span>
            <span className="text-xl font-bold text-sementes-primary group-hover:text-sementes-accent transition-colors">
              SementesPLAY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
                         <Link 
               href="/" 
               className={`transition-colors ${
                 isActiveLink('/') 
                   ? 'text-sementes-primary font-semibold' 
                   : 'text-gray-300 hover:text-sementes-primary'
               }`}
             >
               Início
             </Link>
                         <Link 
               href="/criadores" 
               className={`transition-colors ${
                 isActiveLink('/criadores') 
                   ? 'text-sementes-primary font-semibold' 
                   : 'text-gray-300 hover:text-sementes-primary'
               }`}
             >
               Criadores
             </Link>
                         <Link 
               href="/parceiros" 
               className={`transition-colors ${
                 isActiveLink('/parceiros') 
                   ? 'text-sementes-primary font-semibold' 
                   : 'text-gray-300 hover:text-sementes-primary'
               }`}
             >
               Parceiros
             </Link>
                         <Link 
               href="/cashback" 
               className={`transition-colors ${
                 isActiveLink('/cashback') 
                   ? 'text-sementes-primary font-semibold' 
                   : 'text-gray-300 hover:text-sementes-primary'
               }`}
             >
               Cashback
             </Link>
                         <Link 
               href="/ranking" 
               className={`transition-colors ${
                 isActiveLink('/ranking') 
                   ? 'text-sementes-primary font-semibold' 
                   : 'text-gray-300 hover:text-sementes-primary'
               }`}
             >
               Ranking
             </Link>
                         
                         {/* Admin Link - Apenas para usuários com nível 5+ */}
                         {isAuthenticated && usuario && Number(usuario.nivel) >= 5 && (
                           <Link 
                             href="/admin" 
                             className={`transition-colors ${
                               isActiveLink('/admin') 
                                 ? 'text-sementes-primary font-semibold' 
                                 : 'text-gray-300 hover:text-sementes-primary'
                             }`}
                           >
                             Admin
                           </Link>
                         )}
                         
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-sementes-primary transition-colors relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="relative">
              {isAuthenticated && usuario ? (
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {usuario.avatarUrl ? (
                    <img 
                      src={usuario.avatarUrl} 
                      alt={usuario.nome} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-sementes-primary rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-gray-300 hidden sm:block">{usuario.nome}</span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-sementes-primary transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/registro"
                    className="bg-sementes-primary hover:bg-sementes-secondary text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Registrar
                  </Link>
                </div>
              )}

              {/* Profile Dropdown */}
              {showProfileMenu && isAuthenticated && usuario && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-sss-dark border border-gray-700 rounded-lg shadow-lg py-2"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      {usuario.avatarUrl ? (
                        <img 
                          src={usuario.avatarUrl} 
                          alt={usuario.nome} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-sementes-primary rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{usuario.nome}</div>
                        <div className="text-sm text-gray-400">{usuario.email}</div>
                        <div className="text-sm text-sementes-accent">
                          {usuario.sementes} Sementes
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => handleMenuItemClick('/dashboard')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>Meu Perfil</span>
                    </button>
                    
                    <button
                      onClick={() => handleMenuItemClick('/carteira')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
                    >
                      <CurrencyDollarIcon className="w-5 h-5" />
                      <span>Minha Carteira</span>
                    </button>
                    
                    <button
                      onClick={() => handleMenuItemClick('/doacoes')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
                    >
                      <HeartIcon className="w-5 h-5" />
                      <span>Minhas Doações</span>
                    </button>
                    
                    <button
                      onClick={() => handleMenuItemClick('/relatorios')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
                    >
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Relatórios</span>
                    </button>
                    
                    <button
                      onClick={() => handleMenuItemClick('/configuracoes')}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center space-x-3"
                    >
                      <CogIcon className="w-5 h-5" />
                      <span>Configurações</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-700 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/20 flex items-center space-x-3"
                    >
                      <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                      <span>Sair</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-400 hover:text-sementes-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-700 py-4"
          >
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-sementes-primary transition-colors px-4 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Início
              </Link>
              <Link 
                href="/criadores" 
                className="text-gray-300 hover:text-sementes-primary transition-colors px-4 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Criadores
              </Link>
              <Link 
                href="/parceiros" 
                className="text-gray-300 hover:text-sementes-primary transition-colors px-4 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Parceiros
              </Link>
              <Link 
                href="/cashback" 
                className="text-gray-300 hover:text-sementes-primary transition-colors px-4 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Cashback
              </Link>
              <Link 
                href="/ranking" 
                className="text-gray-300 hover:text-sementes-primary transition-colors px-4 py-2"
                onClick={() => setShowMobileMenu(false)}
              >
                Ranking
              </Link>
              
              {/* Admin Link Mobile - Apenas para usuários com nível 5+ */}
              {isAuthenticated && usuario && Number(usuario.nivel) >= 5 && (
                <Link 
                  href="/admin" 
                  className="text-gray-300 hover:text-sementes-primary transition-colors px-4 py-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Admin
                </Link>
              )}
              
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
