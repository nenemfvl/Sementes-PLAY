import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserGroupIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline'

interface Amigo {
  id: string
  nome: string
  email: string
  nivel: string
  sementes: number
  status: 'online' | 'offline' | 'away'
  ultimaAtividade: Date
  mutual: boolean
}

interface SolicitacaoAmizade {
  id: string
  remetenteId: string
  remetenteNome: string
  remetenteEmail: string
  dataEnvio: Date
  mensagem?: string
}

interface UsuarioSugerido {
  id: string
  nome: string
  email: string
  nivel: string
  sementes: number
}

interface Mensagem {
  id: string
  remetenteId: string
  remetenteNome: string
  conteudo: string
  timestamp: Date
  lida: boolean
}

interface Conversa {
  id: string
  usuarioId: string
  usuarioNome: string
  ultimaMensagem: string
  ultimaAtividade: Date
  naoLidas: number
}

interface FriendsChatProps {
  isOpen: boolean
  onClose: () => void
  usuario: any
}

export default function FriendsChat({ isOpen, onClose, usuario }: FriendsChatProps) {
  const [amigos, setAmigos] = useState<Amigo[]>([])
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [conversaAtiva, setConversaAtiva] = useState<Conversa | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [onlineIds, setOnlineIds] = useState<string[]>([])
  const mensagensRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'amigos' | 'chat' | 'solicitacoes' | 'sugeridos' | 'buscar'>('amigos')
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAmizade[]>([])
  const [usuariosSugeridos, setUsuariosSugeridos] = useState<UsuarioSugerido[]>([])
  const [searchResults, setSearchResults] = useState<UsuarioSugerido[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (usuario && isOpen) {
      loadDados()
    }
  }, [usuario, isOpen])

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight
    }
  }, [mensagens])

  // Buscar lista de usuários online periodicamente
  useEffect(() => {
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
  useEffect(() => {
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

  const loadDados = async () => {
    if (!usuario?.id) return
    
    try {
      setLoading(true)
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
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
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
        loadDados()
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
        loadDados()
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
        loadDados()
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
        loadDados()
      }
    } catch (error) {
      console.error('Erro ao remover amigo:', error)
    }
  }

  const abrirConversa = async (conversa: Conversa) => {
    setConversaAtiva(conversa)
    setActiveTab('chat')
    
    // Simular mensagens para demonstração
    setMensagens([
      {
        id: '1',
        remetenteId: conversa.usuarioId,
        remetenteNome: conversa.usuarioNome,
        conteudo: 'Oi! Como você está?',
        timestamp: new Date(Date.now() - 60000),
        lida: true
      },
      {
        id: '2',
        remetenteId: usuario.id,
        remetenteNome: usuario.nome,
        conteudo: 'Oi! Tudo bem, e você?',
        timestamp: new Date(Date.now() - 30000),
        lida: true
      }
    ])
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaAtiva) return

    const novaMsg: Mensagem = {
      id: Date.now().toString(),
      remetenteId: usuario.id,
      remetenteNome: usuario.nome,
      conteudo: novaMensagem,
      timestamp: new Date(),
      lida: false
    }

    setMensagens(prev => [...prev, novaMsg])
    setNovaMensagem('')
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Ausente'
      case 'offline': return 'Offline'
      default: return 'Desconhecido'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center rounded-t-lg">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-white">Amigos e Chat</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-gray-800 border-b border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'amigos', label: 'Amigos', count: amigos.length },
                  { id: 'chat', label: 'Chat', count: conversas.length },
                  { id: 'solicitacoes', label: 'Solicitações', count: solicitacoes.length },
                  { id: 'sugeridos', label: 'Sugeridos', count: usuariosSugeridos.length },
                  { id: 'buscar', label: 'Buscar', count: 0 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-gray-300 hover:text-white'
                    }`}
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'amigos' && (
                /* Lista de Amigos */
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-700">
                    <input
                      type="text"
                      placeholder="Buscar amigos..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-400">Carregando...</div>
                    ) : amigos.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <UserGroupIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhum amigo encontrado</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {amigos.map((amigo) => (
                          <motion.div
                            key={amigo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-3 border border-gray-600 hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => abrirConversa({
                              id: amigo.id,
                              usuarioId: amigo.id,
                              usuarioNome: amigo.nome,
                              ultimaMensagem: '',
                              ultimaAtividade: amigo.ultimaAtividade,
                              naoLidas: 0
                            })}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                  </div>
                                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${onlineIds.includes(amigo.id) ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{amigo.nome}</h4>
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
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    abrirConversa({
                                      id: amigo.id,
                                      usuarioId: amigo.id,
                                      usuarioNome: amigo.nome,
                                      ultimaMensagem: '',
                                      ultimaAtividade: amigo.ultimaAtividade,
                                      naoLidas: 0
                                    })
                                  }}
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                                  title="Conversar"
                                >
                                  <ChatBubbleLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removerAmigo(amigo.id)
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                  title="Remover amigo"
                                >
                                  <UserMinusIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'solicitacoes' && (
                /* Solicitações de Amizade */
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-400">Carregando...</div>
                    ) : solicitacoes.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <UserPlusIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma solicitação pendente</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {solicitacoes.map((solicitacao) => (
                          <motion.div
                            key={solicitacao.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">👤</span>
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{solicitacao.remetenteNome}</h4>
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
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'sugeridos' && (
                /* Usuários Sugeridos */
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-gray-400">Carregando...</div>
                    ) : usuariosSugeridos.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma sugestão disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {usuariosSugeridos.map((usuario) => (
                          <motion.div
                            key={usuario.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">👤</span>
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{usuario.nome}</h4>
                                  <p className="text-gray-400 text-sm">{usuario.email}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-gray-500">Nível {usuario.nivel}</span>
                                    <span className="text-xs text-red-500">{usuario.sementes || 0} 🌱</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => enviarSolicitacao(usuario.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                              >
                                Adicionar
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'buscar' && (
                /* Buscar Usuários */
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-700">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          buscarUsuarios(e.target.value)
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {searching ? (
                      <div className="p-4 text-center text-gray-400">Buscando...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        {searchTerm.length > 0 ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários'}
                      </div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {searchResults.map((usuario) => (
                          <motion.div
                            key={usuario.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-3 border border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">👤</span>
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{usuario.nome}</h4>
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
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                                >
                                  Adicionar
                                </button>
                              ) : (
                                <span className="text-xs text-green-400">Já é amigo</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                /* Chat */
                <div className="h-full flex flex-col">
                  {conversaAtiva ? (
                    <>
                      {/* Header da conversa */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{conversaAtiva.usuarioNome}</h4>
                            <p className="text-gray-400 text-sm">
                              {onlineIds.includes(conversaAtiva.usuarioId) ? '🟢 Online' : '⚫ Offline'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setConversaAtiva(null)
                            setActiveTab('amigos')
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 rounded transition-colors"
                          title="Voltar para lista de amigos"
                        >
                          <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Mensagens */}
                      <div 
                        ref={mensagensRef}
                        className="flex-1 overflow-y-auto p-4 space-y-3"
                      >
                        {mensagens.map((mensagem) => (
                          <motion.div
                            key={mensagem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${mensagem.remetenteId === usuario.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs ${
                              mensagem.remetenteId === usuario.id
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-700 text-white'
                            } rounded-lg px-3 py-2`}>
                              <p className="text-sm">{mensagem.conteudo}</p>
                              <p className={`text-xs mt-1 ${
                                mensagem.remetenteId === usuario.id
                                  ? 'text-red-200'
                                  : 'text-gray-400'
                              }`}>
                                {formatarTempo(mensagem.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-gray-700">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={novaMensagem}
                            onChange={(e) => setNovaMensagem(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                            placeholder="Digite uma mensagem..."
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            onClick={enviarMensagem}
                            disabled={!novaMensagem.trim()}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                            title="Enviar mensagem"
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>Selecione um amigo para conversar</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
