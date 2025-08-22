'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChevronDownIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const [showSocials, setShowSocials] = React.useState(false)
  const [showMobileMenu, setShowMobileMenu] = React.useState(false)
  const [showAmigosModal, setShowAmigosModal] = React.useState(false)

  // Verificação direta no localStorage como no site antigo
  const [usuario, setUsuario] = React.useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [statusCandidatura, setStatusCandidatura] = React.useState<string | null>(null)
  
  // Estados para o modal de amigos
  const [amigos, setAmigos] = React.useState<any[]>([])
  const [solicitacoes, setSolicitacoes] = React.useState<any[]>([])
  const [usuariosSugeridos, setUsuariosSugeridos] = React.useState<any[]>([])
  const [loadingAmigos, setLoadingAmigos] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('amigos')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('todos')
  const [onlineIds, setOnlineIds] = React.useState<string[]>([])
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [searching, setSearching] = React.useState(false)

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

  // Buscar lista de usuários online periodicamente
  React.useEffect(() => {
    if (!usuario?.id) return
    
    const fetchOnline = async () => {
      try {
        const res = await fetch('/api/chat/usuarios-online')
        const data = await res.json()
        setOnlineIds(data.online || [])
      } catch (error) {
        // Silenciar erro para não afetar funcionalidade
      }
    }
    
    fetchOnline()
    const interval = setInterval(fetchOnline, 10000) // a cada 10s
    return () => clearInterval(interval)
  }, [usuario?.id])

  // Marcar usuário como online
  React.useEffect(() => {
    if (!usuario?.id) return
    
    const ping = () => {
      fetch('/api/chat/usuarios-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuario.id })
      }).catch(() => {
        // Silenciar erro para não afetar funcionalidade
      })
    }
    
    ping()
    const interval = setInterval(ping, 10000) // a cada 10s
    return () => clearInterval(interval)
  }, [usuario?.id])

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

  // Fechar modal de amigos quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showAmigosModal && !target.closest('.amigos-modal')) {
        setShowAmigosModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAmigosModal])

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu)
    setShowSocials(false) // Fechar outros dropdowns
  }

  const handleMenuItemClick = (path: string) => {
    router.push(path)
    setShowProfileMenu(false)
    setShowMobileMenu(false)
  }

  // Funções para gerenciar amigos
  const carregarDadosAmigos = async () => {
    if (!usuario?.id) return
    
    try {
      setLoadingAmigos(true)
      const [amigosResponse, solicitacoesResponse, sugeridosResponse] = await Promise.all([
        fetch(`/api/amigos?usuarioId=${usuario.id}`),
        fetch(`/api/amigos/solicitacoes?usuarioId=${usuario.id}`),
        fetch(`/api/amigos/sugeridos?usuarioId=${usuario.id}`)
      ])

      if (amigosResponse.ok) {
        const data = await amigosResponse.json()
        setAmigos(data.amigos || [])
      }

      if (solicitacoesResponse.ok) {
        const data = await solicitacoesResponse.json()
        setSolicitacoes(data.solicitacoes || [])
      }

      if (sugeridosResponse.ok) {
        const data = await sugeridosResponse.json()
        setUsuariosSugeridos(data.usuarios || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados de amigos:', error)
    } finally {
      setLoadingAmigos(false)
    }
  }

  const buscarUsuarios = async (q: string) => {
    if (!q || q.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/usuarios?query=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data.usuarios || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setSearching(false)
    }
  }

  const enviarSolicitacao = async (amigoId: string) => {
    if (!usuario?.id) return
    
    try {
      const response = await fetch('/api/amigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id, amigoId })
      })

      if (response.ok) {
        carregarDadosAmigos()
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
    }
  }

  const aceitarSolicitacao = async (solicitacaoId: string) => {
    try {
      const response = await fetch(`/api/amigos/solicitacoes/${solicitacaoId}/aceitar`, {
        method: 'POST'
      })

      if (response.ok) {
        carregarDadosAmigos()
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error)
    }
  }

  const rejeitarSolicitacao = async (solicitacaoId: string) => {
    try {
      const response = await fetch(`/api/amigos/solicitacoes/${solicitacaoId}/rejeitar`, {
        method: 'POST'
      })

      if (response.ok) {
        carregarDadosAmigos()
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error)
    }
  }

  const removerAmigo = async (amigoId: string) => {
    if (!confirm('Tem certeza que deseja remover este amigo?')) return

    try {
      const response = await fetch(`/api/amigos/${amigoId}`, { method: 'DELETE' })
      if (response.ok) {
        carregarDadosAmigos()
      }
    } catch (error) {
      console.error('Erro ao remover amigo:', error)
    }
  }

  const filtrarAmigos = () => {
    return amigos.filter(amigo => {
      const matchSearch = amigo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amigo.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || amigo.status === filterStatus
      
      return matchSearch && matchStatus
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Ausente'
      case 'offline': return 'Offline'
      default: return 'Desconhecido'
    }
  }

  const formatarTempo = (data: Date) => {
    const agora = new Date()
    const diff = agora.getTime() - new Date(data).getTime()
    const minutos = Math.floor(diff / (1000 * 60))
    const horas = Math.floor(minutos / 60)
    const dias = Math.floor(horas / 24)

    if (dias > 0) return `${dias}d atrás`
    if (horas > 0) return `${horas}h atrás`
    if (minutos > 0) return `${minutos}m atrás`
    return 'Agora'
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
          <span className="text-2xl text-red-500">🌱</span>
          <span className="text-xl font-bold text-red-500">SementesPLAY</span>
        </button>

        {/* Navegação central */}
        <div className="flex justify-center items-center py-6">
          <nav className="flex-1 flex justify-center hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`transition-colors ${
                isActiveLink('/') 
                  ? 'text-red-500 font-bold' 
                  : 'text-gray-300 hover:text-red-500'
              }`}
            >
              Início
            </Link>
            <Link 
              href="/criadores" 
              className={`transition-colors ${
                isActiveLink('/criadores') 
                  ? 'text-red-500 font-bold' 
                  : 'text-gray-300 hover:text-red-500'
              }`}
            >
              Criadores
            </Link>
            <Link 
              href="/parceiros" 
              className={`transition-colors ${
                isActiveLink('/parceiros') 
                  ? 'text-red-500 font-bold' 
                  : 'text-gray-300 hover:text-red-500'
              }`}
            >
              Parceiros
            </Link>
            <Link 
              href="/ranking" 
              className={`transition-colors ${
                isActiveLink('/ranking') 
                  ? 'text-red-500 font-bold' 
                  : 'text-gray-300 hover:text-red-500'
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
                    ? 'text-red-500 font-bold' 
                    : 'text-gray-300 hover:text-red-500'
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
                    ? 'text-red-500 font-bold' 
                    : 'text-gray-300 hover:text-red-500'
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
                    ? 'text-red-500 font-bold' 
                    : 'text-gray-300 hover:text-red-500'
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
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-red-500 flex items-center justify-center">
                    {usuario.avatarUrl ? (
                      <Image 
                        src={usuario.avatarUrl} 
                        alt={`Avatar de ${usuario.nome}`}
                        width={32}
                        height={32}
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
                  <span className="text-red-500 font-bold">{usuario.nome}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-300 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown menu - EXATAMENTE igual ao site antigo */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleMenuItemClick('/perfil')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        👤 Perfil
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/doar')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        💝 Fazer Doação
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/cashback')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        💰 Cashback
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/carteira')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        🏦 Carteira
                      </button>
                      <button
                        onClick={() => {
                          setShowAmigosModal(true)
                          setShowProfileMenu(false)
                          carregarDadosAmigos()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        👥 Amigos
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/notificacoes')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        🔔 Notificações
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/criadores-favoritos')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        ⭐ Criadores Favoritos
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/parceiros-favoritos')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
                      >
                        🏢 Parceiros Favoritos
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/suporte')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-red-500"
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
                  className="p-2 text-gray-300 hover:text-red-500 focus:outline-none"
                  title="Redes sociais"
                >
                  <UserGroupIcon className="w-6 h-6" />
                </button>
                {showSocials && (
                  <div className="origin-top-right absolute right-0 mt-2 w-16 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5 z-50 flex flex-col items-center py-2 gap-2">
                    <a href="https://discord.gg/7vtVZYvR" target="_blank" rel="noopener noreferrer" className="hover:text-red-500" title="Discord" aria-label="Discord"><i className="fab fa-discord fa-lg"></i></a>
                    <a href="https://www.instagram.com/sementesplay/" target="_blank" rel="noopener noreferrer" className="hover:text-red-500" title="Instagram" aria-label="Instagram"><i className="fab fa-instagram fa-lg"></i></a>
                    <a href="https://www.tiktok.com/@sementesplay" target="_blank" rel="noopener noreferrer" className="hover:text-red-500" title="TikTok" aria-label="TikTok"><i className="fab fa-tiktok fa-lg"></i></a>
                    <a href="https://www.youtube.com/@SementesPLAY" target="_blank" rel="noopener noreferrer" className="hover:text-red-500" title="YouTube" aria-label="YouTube"><i className="fab fa-youtube fa-lg"></i></a>
                    <a href="https://x.com/SementesPLAY" target="_blank" rel="noopener noreferrer" className="hover:text-red-500" title="Twitter" aria-label="Twitter"><i className="fab fa-twitter fa-lg"></i></a>
                  </div>
                )}
              </div>
              
              <button onClick={handleLogout} title="Sair" className="p-2 text-gray-300 hover:text-red-400">
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-red-500 transition-colors">Entrar</Link>
              <Link href="/registro" className="bg-sementes-primary hover:bg-sementes-secondary text-white px-4 py-2 rounded-lg transition-colors">Cadastrar</Link>
            </>
          )}
        </div>
      </header>

      {/* Modal de Amigos */}
      {showAmigosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="amigos-modal bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-white">Amigos e Seguidores</h2>
              </div>
              <button
                onClick={() => setShowAmigosModal(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Barra de pesquisa global */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Buscar pessoas por nome ou e-mail..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value)
                    buscarUsuarios(e.target.value)
                  }}
                />
                
                {/* Resultados da busca global */}
                {searching ? (
                  <div className="text-gray-400 mt-2">Buscando...</div>
                ) : searchResults.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {searchResults.map(usuario => (
                      <div key={usuario.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{usuario.nome}</h3>
                            <p className="text-gray-400 text-sm">{usuario.email}</p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-gray-500">Nível {usuario.nivel}</span>
                              <span className="text-xs text-red-500">{usuario.sementes || 0} 🌱</span>
                            </div>
                          </div>
                        </div>
                        {!amigos.some(a => a.id === usuario.id) ? (
                          <button 
                            onClick={() => enviarSolicitacao(usuario.id)} 
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Adicionar
                          </button>
                        ) : (
                          <span className="text-xs text-green-400">Já é seu amigo</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="bg-gray-800 rounded-lg border border-gray-600">
                <div className="border-b border-gray-600">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'amigos', label: 'Amigos', count: amigos.length },
                      { id: 'solicitacoes', label: 'Solicitações', count: solicitacoes.length },
                      { id: 'sugeridos', label: 'Sugeridos', count: usuariosSugeridos.length }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-red-500 text-red-500'
                            : 'border-transparent text-gray-300 hover:text-white'
                        }`}
                      >
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Tab Amigos */}
                  {activeTab === 'amigos' && (
                    <div className="space-y-4">
                      {/* Filtros */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar amigos..."
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="todos">Todos os status</option>
                            <option value="online">Online</option>
                            <option value="away">Ausente</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              setSearchTerm('')
                              setFilterStatus('todos')
                            }}
                            className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                          >
                            Limpar Filtros
                          </button>
                        </div>
                      </div>

                      {/* Lista de Amigos */}
                      <div className="space-y-3">
                        {loadingAmigos ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                            <p className="text-gray-400 mt-2">Carregando amigos...</p>
                          </div>
                        ) : filtrarAmigos().length === 0 ? (
                          <div className="text-center py-8">
                            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400">Nenhum amigo encontrado</p>
                          </div>
                        ) : (
                          filtrarAmigos().map((amigo) => (
                            <div
                              key={amigo.id}
                              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                  </div>
                                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${onlineIds.includes(amigo.id) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                </div>
                                
                                <div>
                                  <h3 className="text-white font-semibold">{amigo.nome}</h3>
                                  <p className="text-gray-400 text-sm">{amigo.email}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-gray-500">Nível {amigo.nivel}</span>
                                    <span className="text-xs text-red-500">{amigo.sementes || 0} 🌱</span>
                                    <span className={`text-xs ${amigo.status === 'online' ? 'text-green-500' : amigo.status === 'away' ? 'text-yellow-500' : 'text-gray-500'}`}>
                                      {getStatusText(amigo.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => removerAmigo(amigo.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                  title="Remover amigo"
                                >
                                  <UserMinusIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab Solicitações */}
                  {activeTab === 'solicitacoes' && (
                    <div className="space-y-3">
                      {solicitacoes.length === 0 ? (
                        <div className="text-center py-8">
                          <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">Nenhuma solicitação pendente</p>
                        </div>
                      ) : (
                        solicitacoes.map((solicitacao) => (
                          <div
                            key={solicitacao.id}
                            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">👤</span>
                              </div>
                              
                              <div>
                                <h3 className="text-white font-semibold">{solicitacao.remetenteNome}</h3>
                                <p className="text-gray-400 text-sm">{solicitacao.remetenteEmail}</p>
                                {solicitacao.mensagem && (
                                  <p className="text-gray-300 text-sm mt-1">&quot;{solicitacao.mensagem}&quot;</p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                  {formatarTempo(solicitacao.dataEnvio)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => aceitarSolicitacao(solicitacao.id)}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors"
                                title="Aceitar"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => rejeitarSolicitacao(solicitacao.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                title="Rejeitar"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Tab Sugeridos */}
                  {activeTab === 'sugeridos' && (
                    <div className="space-y-3">
                      {usuariosSugeridos.length === 0 ? (
                        <div className="text-center py-8">
                          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">Nenhuma sugestão disponível</p>
                        </div>
                      ) : (
                        usuariosSugeridos.map((usuario) => (
                          <div
                            key={usuario.id}
                            className="p-3 bg-gray-700 rounded-lg border border-gray-600"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">👤</span>
                                </div>
                                <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${onlineIds.includes(usuario.id) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-white font-semibold">{usuario.nome}</h3>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-xs text-gray-500">Nível {usuario.nivel}</span>
                                  <span className="text-xs text-red-500">{usuario.sementes || 0} 🌱</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => enviarSolicitacao(usuario.id)}
                                className="flex-1 flex items-center justify-center px-3 py-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors text-sm"
                                title="Adicionar amigo"
                              >
                                <UserPlusIcon className="w-4 h-4 mr-1" />
                                Adicionar
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
