'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PlusIcon,
  BellIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

type Transacao = {
  id: string
  valor: number
  codigoParceiro: string
  status: string
  data: string
  usuario?: { nome: string; email: string }
}

type Estatisticas = {
  totalVendas: number
  totalComissoes: number
  codigosAtivos: number
  repassesRealizados: number
  transacoesMes: number
  usuariosAtivos: number
}

type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  data: string
}

type Repasse = {
  id: string
  valorCompra: number
  valorRepasse: number
  status: string
  dataCompra: string
  dataRepasse?: string
  comprovante?: string
  usuario?: { nome: string; email: string }
  tipo?: string
}

type ConteudoParceiro = {
  id: string
  titulo: string
  tipo: string
  categoria: string
  url: string
  dataPublicacao?: string
  fixado?: boolean
  visualizacoes?: number
  curtidas?: number
  dislikes?: number
}

export default function PainelParceiro() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loadingTransacoes, setLoadingTransacoes] = useState(true)
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true)
  const [repasses, setRepasses] = useState<Repasse[]>([])
  const [loadingRepasses, setLoadingRepasses] = useState(true)
  const [parceiro, setParceiro] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([])
  const [loadingConteudos, setLoadingConteudos] = useState(true)
  const [showModalConteudo, setShowModalConteudo] = useState(false)
  const [formConteudo, setFormConteudo] = useState({
    titulo: '',
    tipo: '',
    categoria: '',
    url: '',
    cidade: ''
  })
  const [editandoConteudo, setEditandoConteudo] = useState<ConteudoParceiro | null>(null)
  const [savingConteudo, setSavingConteudo] = useState(false)
  const [showModalPIX, setShowModalPIX] = useState(false)
  const [repasseSelecionado, setRepasseSelecionado] = useState<Repasse | null>(null)
  const [showModalRedesSociais, setShowModalRedesSociais] = useState(false)
  const [redesSociais, setRedesSociais] = useState({
    instagram: '',
    twitch: '',
    youtube: '',
    tiktok: '',
    discord: '',
    urlConnect: ''
  })
  const [savingRedesSociais, setSavingRedesSociais] = useState(false)
  const [aprovarLoading, setAprovarLoading] = useState<string | null>(null)
  const [rejeitarLoading, setRejeitarLoading] = useState<string | null>(null)
  const [pagamentoPIX, setPagamentoPIX] = useState<any>(null)
  const [verificandoPagamento, setVerificandoPagamento] = useState(false)

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('usuario-dados')
        if (!userData) {
          window.location.href = '/login'
          return
        }

        const currentUser = JSON.parse(userData)
        if (currentUser.nivel !== 'parceiro') {
          alert('Acesso negado. Apenas parceiros podem acessar esta área.')
          window.location.href = '/perfil'
          return
        }

        setUser(currentUser)
        setAuthorized(true)
      } catch (error) {
        console.error('Erro na verificação de autorização:', error)
        window.location.href = '/login'
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  // Carregar dados
  const fetchParceiro = useCallback(async () => {
    try {
      const response = await fetch(`/api/parceiros/perfil?usuarioId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setParceiro(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do parceiro:', error)
    }
  }, [user?.id])

  const fetchTransacoes = useCallback(async () => {
    try {
      const response = await fetch(`/api/parceiros/transacoes?usuarioId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTransacoes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoadingTransacoes(false)
    }
  }, [user?.id])

  const fetchEstatisticas = useCallback(async () => {
    try {
      const response = await fetch(`/api/parceiros/estatisticas?usuarioId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setEstatisticas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoadingEstatisticas(false)
    }
  }, [user?.id])

  const fetchNotificacoes = useCallback(async () => {
    try {
      const response = await fetch(`/api/notificacoes?usuarioId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotificacoes(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoadingNotificacoes(false)
    }
  }, [user?.id])

  const fetchRepasses = useCallback(async () => {
    try {
      const response = await fetch(`/api/parceiros/repasses-pendentes?usuarioId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setRepasses(data)
      }
    } catch (error) {
      console.error('Erro ao carregar repasses:', error)
    } finally {
      setLoadingRepasses(false)
    }
  }, [user?.id])

  const fetchConteudos = useCallback(async () => {
    try {
      const response = await fetch(`/api/parceiros/conteudos?parceiroId=${parceiro?.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setConteudos(data.conteudos || [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    } finally {
      setLoadingConteudos(false)
    }
  }, [parceiro?.id])

  useEffect(() => {
    if (authorized && user) {
      fetchParceiro()
      fetchTransacoes()
      fetchEstatisticas()
      fetchNotificacoes()
      fetchRepasses()
      fetchConteudos()
    }
  }, [authorized, user, parceiro?.id, fetchParceiro, fetchTransacoes, fetchEstatisticas, fetchNotificacoes, fetchRepasses, fetchConteudos])

  const getProgressWidthClass = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage >= 100) return 'w-full'
    if (percentage >= 75) return 'w-3/4'
    if (percentage >= 50) return 'w-1/2'
    if (percentage >= 25) return 'w-1/4'
    return 'w-full'
  }

  const formatarNumero = (numero: number) => {
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1) + 'M'
    } else if (numero >= 1000) {
      return (numero / 1000).toFixed(1) + 'K'
    }
    return numero.toString()
  }

  // Função para mostrar toast notifications
  const mostrarToast = (mensagem: string, tipo: 'success' | 'error' | 'info' = 'success') => {
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`
    
    let bgColor = 'bg-green-500'
    let icon = '✅'
    
    if (tipo === 'error') {
      bgColor = 'bg-red-500'
      icon = '❌'
    } else if (tipo === 'info') {
      bgColor = 'bg-blue-500'
      icon = 'ℹ️'
    }
    
    toast.className += ` ${bgColor} text-white`
    
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-lg">${icon}</span>
        <span class="font-medium">${mensagem}</span>
      </div>
    `
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
    
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  // Função para obter thumbnail das plataformas
  function getThumbnail(url: string) {
    if (!url) return null
    
    // YouTube
    const yt = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/)
    if (yt) {
      return {
        src: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`,
        platform: 'YouTube',
        icon: '🎥',
        color: 'from-red-500 to-red-600'
      }
    }
    
    // Twitch
    const tw = url.match(/twitch\.tv\/([^/?]+)/)
    if (tw) {
      return {
        src: null,
        platform: 'Twitch',
        icon: '📺',
        color: 'from-purple-600 to-pink-600'
      }
    }
    
    // Instagram
    if (url.includes('instagram.com')) {
      return {
        src: null,
        platform: 'Instagram',
        icon: '📷',
        color: 'from-pink-500 via-purple-500 to-orange-500'
      }
    }
    
    // TikTok
    if (url.includes('tiktok.com')) {
      return {
        src: null,
        platform: 'TikTok',
        icon: '🎵',
        color: 'from-gray-900 via-gray-800 to-gray-700'
      }
    }
    
    return {
      src: null,
      platform: 'Link',
      icon: '🔗',
      color: 'from-blue-500 to-blue-600'
    }
  }

  // Loading
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">Verificando autorização...</div>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Painel do Parceiro</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas principais */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {!loadingEstatisticas ? `R$ ${estatisticas?.totalVendas.toFixed(2) || '0.00'}` : '--'}
                  </div>
                  <div className="text-sm text-green-300">Total de Repasses</div>
                </div>
              </div>
              <div className="h-1 bg-green-500/20 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full ${getProgressWidthClass(estatisticas?.totalVendas || 0, 10000)}`}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-all">
                  <CreditCardIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {!loadingEstatisticas ? estatisticas?.codigosAtivos || 0 : '--'}
                  </div>
                  <div className="text-sm text-blue-300">Códigos Ativos</div>
                </div>
              </div>
              <div className="h-1 bg-blue-500/20 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full ${getProgressWidthClass(estatisticas?.codigosAtivos || 0, 100)}`}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-all">
                  <CheckCircleIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {!loadingEstatisticas ? estatisticas?.repassesRealizados || 0 : '--'}
                  </div>
                  <div className="text-sm text-purple-300">Repasses Realizados</div>
                </div>
              </div>
              <div className="h-1 bg-purple-500/20 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full ${getProgressWidthClass(estatisticas?.repassesRealizados || 0, 50)}`}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/30 transition-all">
                  <UsersIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {!loadingEstatisticas ? estatisticas?.usuariosAtivos || 0 : '--'}
                  </div>
                  <div className="text-sm text-yellow-300">Usuários com Repasse</div>
                </div>
              </div>
              <div className="h-1 bg-yellow-500/20 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full ${getProgressWidthClass(estatisticas?.usuariosAtivos || 0, 100)}`}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda - Repasses e Transações */}
          <div className="lg:col-span-2 space-y-8">
            {/* Repasses Pendentes */}
            <section>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <CurrencyDollarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Repasses Pendentes</h2>
                      <p className="text-sm text-gray-400">Gerencie os repasses aguardando aprovação</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingRepasses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Carregando repasses...</p>
                    </div>
                  ) : repasses.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400">Nenhum repasse pendente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {repasses.map((repasse) => (
                        <div key={repasse.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-white font-semibold">
                                Repasse de R$ {repasse.valorRepasse.toFixed(2)}
                              </h3>
                              <p className="text-sm text-gray-400">
                                Compra: R$ {repasse.valorCompra.toFixed(2)} • {repasse.usuario?.nome || 'Usuário'}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              repasse.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                              repasse.status === 'aprovado' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {repasse.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>{new Date(repasse.dataCompra).toLocaleDateString('pt-BR')}</span>
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors">
                                Aprovar
                              </button>
                              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors">
                                Rejeitar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Transações Recentes */}
            <section>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Transações Recentes</h2>
                      <p className="text-sm text-gray-400">Histórico de suas transações</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingTransacoes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Carregando transações...</p>
                    </div>
                  ) : transacoes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400">Nenhuma transação encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transacoes.slice(0, 5).map((transacao) => (
                        <div key={transacao.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                          <div>
                            <p className="text-white font-medium">R$ {transacao.valor.toFixed(2)}</p>
                            <p className="text-sm text-gray-400">{transacao.usuario?.nome || 'Usuário'}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transacao.status === 'aprovado' ? 'bg-green-500/20 text-green-400' :
                              transacao.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {transacao.status}
                            </span>
                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(transacao.data).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Coluna direita - Notificações e Configurações */}
          <div className="space-y-8">
            {/* Notificações */}
            <section>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                      <BellIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Notificações</h2>
                      <p className="text-sm text-gray-400">Suas notificações recentes</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingNotificacoes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Carregando notificações...</p>
                    </div>
                  ) : notificacoes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BellIcon className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400">Nenhuma notificação</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notificacoes.map((notificacao) => (
                        <div key={notificacao.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                          <h3 className="text-white font-medium text-sm mb-2">{notificacao.titulo}</h3>
                          <p className="text-gray-400 text-sm mb-2">{notificacao.mensagem}</p>
                          <p className="text-gray-500 text-xs">{new Date(notificacao.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Configurações */}
            <section>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Cog6ToothIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Configurações</h2>
                      <p className="text-sm text-gray-400">Gerencie suas informações</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-3">Informações da Cidade</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-400">Nome da Cidade</p>
                          <p className="text-white font-medium">{parceiro?.nomeCidade || 'Não definido'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">URL do Connect</p>
                          <p className="text-white font-medium">
                            {parceiro?.urlConnect ? (
                              <span className="text-blue-400">{parceiro.urlConnect}</span>
                            ) : (
                              'Não configurado'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                      Editar Perfil
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
