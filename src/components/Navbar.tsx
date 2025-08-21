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
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const [showSocials, setShowSocials] = React.useState(false)
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)

  // Verificação direta no localStorage como no site antigo
  const [usuario, setUsuario] = React.useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [statusCandidatura, setStatusCandidatura] = React.useState<string | null>(null)

  // Verificar autenticação ao carregar
  React.useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          setUsuario(dadosUsuario)
          setIsAuthenticated(true)
          
          // Verificar status da candidatura para determinar se é criador
          verificarStatusCandidatura(dadosUsuario.id)
        } catch (error) {
          console.error('Erro ao ler dados do usuário:', error)
          localStorage.removeItem('usuario-dados')
          setUsuario(null)
          setIsAuthenticated(false)
        }
      } else {
        setUsuario(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    }
    
    verificarAutenticacao()
  }, [])

  const verificarStatusCandidatura = async (userId: string) => {
    try {
      const response = await fetch(`/api/candidaturas/criador/status?usuarioId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setStatusCandidatura(data.dados.status)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da candidatura:', error)
    }
  }

  const isCriador = () => {
    return statusCandidatura === 'criador_aprovado' || statusCandidatura === 'aprovada'
  }

  // Fechar dropdowns quando clicar fora (igual ao site antigo)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.profile-menu') && !target.closest('.socials-menu')) {
        setShowProfileMenu(false)
        setShowSocials(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu)
    setShowSocials(false) // Fechar outros dropdowns
  }

  const handleMenuItemClick = (path: string) => {
    router.push(path)
    setShowProfileMenu(false)
    setShowMobileMenu(false)
  }

  const handleLogout = () => {
    // Logout direto como no site antigo
    localStorage.removeItem('usuario-dados')
    localStorage.removeItem('auth-token')
    setUsuario(null)
    setIsAuthenticated(false)
    setShowProfileMenu(false)
    setShowMobileMenu(false)
    window.location.href = '/'
  }

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <>
      <header className="bg-black shadow-lg border-b border-gray-700 sticky top-0 z-50 relative">
        {/* Logo e nome colados à esquerda como botão para o topo */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-6 focus:outline-none bg-transparent border-none cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Ir para o topo"
        >
          <span className="text-2xl text-sementes-accent">🌱</span>
          <span className="text-xl font-bold text-sementes-accent">SementesPLAY</span>
        </button>

        {/* Navegação central */}
        <div className="flex justify-center items-center py-6">
          <nav className="flex-1 flex justify-center hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`transition-colors ${
                isActiveLink('/') 
                  ? 'text-sementes-accent font-bold' 
                  : 'text-gray-300 hover:text-sementes-accent'
              }`}
            >
              Início
            </Link>
            <Link 
              href="/criadores" 
              className={`transition-colors ${
                isActiveLink('/criadores') 
                  ? 'text-sementes-accent font-bold' 
                  : 'text-gray-300 hover:text-sementes-accent'
              }`}
            >
              Criadores
            </Link>
            <Link 
              href="/parceiros" 
              className={`transition-colors ${
                isActiveLink('/parceiros') 
                  ? 'text-sementes-accent font-bold' 
                  : 'text-gray-300 hover:text-sementes-accent'
              }`}
            >
              Parceiros
            </Link>
            <Link 
              href="/ranking" 
              className={`transition-colors ${
                isActiveLink('/ranking') 
                  ? 'text-sementes-accent font-bold' 
                  : 'text-gray-300 hover:text-sementes-accent'
              }`}
            >
              Ranking
            </Link>
            
            {/* Painel Criador - Apenas para usuários com níveis de criador */}
            {isAuthenticated && usuario && isCriador() && (
              <Link 
                href="/painel-criador" 
                className={`transition-colors ${
                  isActiveLink('/painel-criador') 
                    ? 'text-sementes-accent font-bold' 
                    : 'text-gray-300 hover:text-sementes-accent'
                }`}
              >
                Painel Criador
              </Link>
            )}
            
            {/* Painel Parceiro - Apenas para usuários com nível parceiro */}
            {isAuthenticated && usuario && usuario.nivel === 'parceiro' && (
              <Link 
                href="/painel-parceiro" 
                className={`transition-colors ${
                  isActiveLink('/painel-parceiro') 
                    ? 'text-sementes-accent font-bold' 
                    : 'text-gray-300 hover:text-sementes-accent'
                }`}
              >
                Painel Parceiro
              </Link>
            )}
            
            {/* Admin Link - Apenas para usuários com nível 5+ */}
            {isAuthenticated && usuario && Number(usuario.nivel) >= 5 && (
              <Link 
                href="/admin" 
                className={`transition-colors ${
                  isActiveLink('/admin') 
                    ? 'text-sementes-accent font-bold' 
                    : 'text-gray-300 hover:text-sementes-accent'
                }`}
              >
                Painel Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Usuário e logout colados na borda direita */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4 px-6">
          {isAuthenticated && usuario ? (
            <>
              {/* Menu dropdown do perfil */}
              <div className="relative profile-menu">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors"
                >
                  {/* Avatar do usuário */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-sementes-accent flex items-center justify-center">
                    {usuario.avatarUrl ? (
                      <img 
                        src={usuario.avatarUrl} 
                        alt={`Avatar de ${usuario.nome}`}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          // Fallback para ícone se a imagem falhar
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling
                          if (nextElement) {
                            nextElement.classList.remove('hidden')
                          }
                        }}
                      />
                    ) : null}
                    <UserIcon className={`w-5 h-5 text-white ${usuario.avatarUrl ? 'hidden' : ''}`} />
                  </div>
                  <span className="text-sementes-accent font-bold">{usuario.nome}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-300 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown menu - EXATAMENTE igual ao site antigo */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleMenuItemClick('/perfil')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        👤 Perfil
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/doar')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        💝 Fazer Doação
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/cashback')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        💰 Cashback
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/carteira')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        🏦 Carteira
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/amigos')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        👥 Amigos
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/notificacoes')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        🔔 Notificações
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/criadores-favoritos')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        ⭐ Criadores Favoritos
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/parceiros-favoritos')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        🏢 Parceiros Favoritos
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/suporte')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-sementes-accent"
                      >
                        💬 Suporte
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dropdown de redes sociais - EXATAMENTE igual ao site antigo */}
              <div className="relative inline-block text-left socials-menu">
                <button
                  onClick={() => setShowSocials((v) => !v)}
                  className="p-2 text-gray-300 hover:text-sementes-accent focus:outline-none"
                  title="Redes sociais"
                >
                  <UserGroupIcon className="w-6 h-6" />
                </button>
                {showSocials && (
                  <div className="origin-top-right absolute right-0 mt-2 w-16 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 z-50 flex flex-col items-center py-2 gap-2">
                    <a href="https://discord.gg/7vtVZYvR" target="_blank" rel="noopener noreferrer" className="hover:text-sementes-accent" title="Discord" aria-label="Discord"><i className="fab fa-discord fa-lg"></i></a>
                    <a href="https://www.instagram.com/sementesplay/" target="_blank" rel="noopener noreferrer" className="hover:text-sementes-accent" title="Instagram" aria-label="Instagram"><i className="fab fa-instagram fa-lg"></i></a>
                    <a href="https://www.tiktok.com/@sementesplay" target="_blank" rel="noopener noreferrer" className="hover:text-sementes-accent" title="TikTok" aria-label="TikTok"><i className="fab fa-tiktok fa-lg"></i></a>
                    <a href="https://www.youtube.com/@SementesPLAY" target="_blank" rel="noopener noreferrer" className="hover:text-sementes-accent" title="YouTube" aria-label="YouTube"><i className="fab fa-youtube fa-lg"></i></a>
                    <a href="https://x.com/SementesPLAY" target="_blank" rel="noopener noreferrer" className="hover:text-sementes-accent" title="Twitter" aria-label="Twitter"><i className="fab fa-twitter fa-lg"></i></a>
                  </div>
                )}
              </div>
              
              <button onClick={handleLogout} title="Sair" className="p-2 text-gray-300 hover:text-red-400">
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-sementes-accent transition-colors">Entrar</Link>
              <Link href="/registro" className="bg-sementes-primary hover:bg-sementes-secondary text-white px-4 py-2 rounded-lg transition-colors">Cadastrar</Link>
            </>
          )}
        </div>
      </header>
    </>
  )
}
