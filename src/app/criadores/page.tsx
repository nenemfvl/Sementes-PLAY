'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  PlayIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { FaTwitch, FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ConteudoInteracoes from '@/components/ConteudoInteracoes'

// Forçar renderização dinâmica para evitar erro de prerendering
export const dynamic = 'force-dynamic'

interface DadosCiclo {
  ciclo: number
  season: number
  dataInicioCiclo: string
  dataInicioSeason: string
  pausado: boolean
  estatisticas: {
    totalCriadores: number
    totalSementes: number
  }
}

interface ConteudoParceiro {
  id: string
  titulo: string
  descricao: string
  tipo: 'video' | 'stream' | 'post' | 'artigo'
  plataforma: 'youtube' | 'twitch' | 'instagram' | 'tiktok' | 'blog'
  url: string
  thumbnail?: string
  visualizacoes: number
  curtidas: number
  dislikes?: number
  dataPublicacao: string
  parceiro: {
    nome: string
    avatarUrl?: string
    nivel: string
  }
}

interface Criador {
  id: string
  nome: string
  bio: string
  categoria: string
  nivel: string
  sementes: number
  apoiadores: number
  doacoes: number
  dataCriacao: string
  redesSociais: any
  portfolio: any
  usuario: {
    id: string
    nome: string
    avatarUrl?: string
    corPerfil?: string
    nivel: string
    sementes: number
    dataCriacao: string
  }
}

export default function CriadoresPage() {
  const [loading, setLoading] = useState(true)
  const [totalSementes, setTotalSementes] = useState<number | null>(null)
  const [ciclosInfo, setCiclosInfo] = useState<any>(null)
  const [progressWidthCiclo, setProgressWidthCiclo] = useState(0)
  const [progressWidthSeason, setProgressWidthSeason] = useState(0)
  const [conteudosParceiros, setConteudosParceiros] = useState<ConteudoParceiro[]>([])
  const [criadores, setCriadores] = useState<Criador[]>([])
  const [criadoresLoading, setCriadoresLoading] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const [statusCandidatura, setStatusCandidatura] = useState<string | null>(null)
  const [verificandoStatus, setVerificandoStatus] = useState(true)
  const router = useRouter()

  const verificarUsuario = () => {
    const usuarioSalvo = localStorage.getItem('usuario-dados')
    if (usuarioSalvo) {
      try {
        const dadosUsuario = JSON.parse(usuarioSalvo)
        setUsuario(dadosUsuario)
        
        // Verificar status da candidatura
        verificarStatusCandidatura(dadosUsuario.id)
      } catch (error) {
        console.error('Erro ao ler dados do usuário:', error)
        setVerificandoStatus(false)
      }
    } else {
      setVerificandoStatus(false)
    }
  }

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
    } finally {
      setVerificandoStatus(false)
    }
  }

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar estatísticas
        const responseStats = await fetch('/api/admin/estatisticas')
        if (responseStats.ok) {
          const dataStats = await responseStats.json()
          if (dataStats.sucesso) {
            setTotalSementes(dataStats.dados.sistema.totalSementes || 0)
          }
        }

        // Carregar informações dos ciclos
        const responseCiclos = await fetch('/api/ranking/ciclos')
        if (responseCiclos.ok) {
          const dataCiclos = await responseCiclos.json()
          setCiclosInfo(dataCiclos)
          
          // Calcular larguras das barras de progresso
          if (dataCiclos) {
            const cicloWidth = Math.max(0, Math.min(100, ((15 - dataCiclos.diasRestantesCiclo) / 15) * 100))
            const seasonWidth = Math.max(0, Math.min(100, ((90 - dataCiclos.diasRestantesSeason) / 90) * 100))
            setProgressWidthCiclo(cicloWidth)
            setProgressWidthSeason(seasonWidth)
          }
        }

        // Carregar criadores
        const responseCriadores = await fetch('/api/criadores')
        if (responseCriadores.ok) {
          const dataCriadores = await responseCriadores.json()
          console.log('Resposta da API de criadores:', dataCriadores)
          if (dataCriadores.sucesso) {
            const criadoresData = dataCriadores.dados.criadores || []
            console.log('Criadores encontrados:', criadoresData.length, criadoresData)
            setCriadores(criadoresData)
          } else {
            console.error('Erro na API de criadores:', dataCriadores.error)
            setCriadores([])
          }
        } else {
          console.error('Erro na resposta da API de criadores:', responseCriadores.status)
          setCriadores([])
        }
        
        // Definir criadoresLoading como false após carregar
        setCriadoresLoading(false)

        // Carregar conteúdos
        await carregarConteudosParceiros()
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  const carregarConteudosParceiros = useCallback(async () => {
    try {
      const response = await fetch('/api/conteudos/todos?limit=20')
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setConteudosParceiros(data.dados)
        } else {
          console.error('Erro na API de conteúdos:', data.error)
          setConteudosParceiros([])
        }
      } else {
        console.error('Erro na resposta da API:', response.status)
        setConteudosParceiros([])
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos dos parceiros:', error)
      setConteudosParceiros([])
    }
  }, [])

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return '🎬'
      case 'stream': return '📺'
      case 'post': return '📱'
      case 'artigo': return '📝'
      default: return '📄'
    }
  }

  const getPlataformaColor = (plataforma: string) => {
    switch (plataforma) {
      case 'youtube': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'twitch': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'instagram': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'tiktok': return 'bg-black/20 text-gray-300 border-gray-600/30'
      case 'blog': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getPlataformaLabel = (plataforma: string) => {
    switch (plataforma) {
      case 'youtube': return 'YouTube'
      case 'twitch': return 'Twitch'
      case 'instagram': return 'Instagram'
      case 'tiktok': return 'TikTok'
      case 'blog': return 'Blog'
      default: return plataforma
    }
  }

  const renderRedesSociais = (redesSociais: any) => {
    if (!redesSociais) return null

    const redesConfiguradas = []

    if (redesSociais.youtube) {
      redesConfiguradas.push(
        <a
          key="youtube"
          href={redesSociais.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ff0000] text-lg hover:scale-110 transition-transform"
          title="YouTube"
        >
          <FaYoutube />
        </a>
      )
    }

    if (redesSociais.twitch) {
      redesConfiguradas.push(
        <a
          key="twitch"
          href={redesSociais.twitch}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9147ff] text-lg hover:scale-110 transition-transform"
          title="Twitch"
        >
          <FaTwitch />
        </a>
      )
    }

    if (redesSociais.tiktok) {
      redesConfiguradas.push(
        <a
          key="tiktok"
          href={redesSociais.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#000] text-lg hover:scale-110 transition-transform"
          title="TikTok"
        >
          <FaTiktok />
        </a>
      )
    }

    if (redesSociais.instagram) {
      redesConfiguradas.push(
        <a
          key="instagram"
          href={redesSociais.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e1306c] text-lg hover:scale-110 transition-transform"
          title="Instagram"
        >
          <FaInstagram />
        </a>
      )
    }

    if (redesSociais.discord) {
      redesConfiguradas.push(
        <a
          key="discord"
          href={redesSociais.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-lg hover:scale-110 transition-transform"
          title="Discord"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
          </svg>
        </a>
      )
    }

    if (redesConfiguradas.length === 0) {
      return (
        <span className="px-2 py-1 rounded-lg text-xs font-medium border border-gray-500/30 text-gray-400">
          Sem redes sociais
        </span>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        {redesConfiguradas}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sss-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">


          {/* Contador de Sementes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🌱</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Sementes em Circulação</h2>
                  <p className="text-6xl md:text-7xl font-black text-yellow-500 mb-4">
                    {totalSementes ? (totalSementes / 1000).toFixed(0) + 'k' : '0k'}
                  </p>
                  <p className="text-gray-400 text-lg">Fundo de distribuição em circulação para o ciclo atual</p>
                </div>

                {/* Informações do Ciclo Atual - Agora dentro da mesma seção */}
                {ciclosInfo && (
                  <div className="bg-gradient-to-r from-sementes-primary/20 to-sementes-accent/20 rounded-2xl border border-sementes-primary/30 p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      {/* Status do Ciclo */}
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">🔄</span>
                            <span className="text-gray-400 text-sm">Ciclo Atual</span>
                          </div>
                          <div className="text-4xl font-bold text-sementes-primary">
                            #{ciclosInfo.numeroCiclo}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {ciclosInfo.diasRestantesCiclo} dias restantes
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">🏆</span>
                            <span className="text-gray-400 text-sm">Season</span>
                          </div>
                          <div className="text-4xl font-bold text-sementes-accent">
                            S{ciclosInfo.numeroSeason}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {ciclosInfo.diasRestantesSeason} dias restantes
                          </div>
                        </div>
                      </div>

                      {/* Status e Datas */}
                      <div className="flex flex-col items-center lg:items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${ciclosInfo.pausado ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          <span className="text-sm text-gray-300">
                            {ciclosInfo.pausado ? 'Ciclo Pausado' : 'Ciclo Ativo'}
                          </span>
                        </div>
                        
                        <div className="text-center lg:text-right">
                          <p className="text-gray-400 text-xs">Início do Ciclo</p>
                          <p className="text-white text-sm">
                            {new Date(ciclosInfo.dataInicioCiclo).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="text-center lg:text-right">
                          <p className="text-gray-400 text-xs">Início da Season</p>
                          <p className="text-white text-sm">
                            {new Date(ciclosInfo.dataInicioSeason).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>



          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-right">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-2">Total de Criadores</p>
                <p className="text-3xl font-black text-white">
                  {criadores.length}
                </p>
                <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <div className="text-right">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-2">Total de Conteúdos</p>
                <p className="text-3xl font-black text-white">{conteudosParceiros.length}</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div className="text-right">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-2">Total de Visualizações</p>
                <p className="text-3xl font-black text-white">{(conteudosParceiros.reduce((acc, c) => acc + c.visualizacoes, 0) / 1000).toFixed(0)}k</p>
                <div className="mt-4 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
              </div>
            </div>

            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🌱</span>
                  </div>
                  <div className="text-right">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-2">Total de Sementes</p>
                <p className="text-3xl font-black text-white">
                  {totalSementes ? (totalSementes / 1000).toFixed(0) + 'k' : '0k'}
                </p>
                <div className="mt-4 h-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Criadores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">👥 Criadores da Plataforma</h2>
              <p className="text-gray-400">Conheça nossos criadores de conteúdo aprovados</p>
            </div>

            {criadoresLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando criadores...</p>
              </div>
            ) : criadores.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum Criador Encontrado</h3>
                <p className="text-gray-400 mb-6">Ainda não há criadores aprovados na plataforma</p>
                <Link
                  href="/candidatura-criador"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sementes-primary to-sementes-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Seja o Primeiro Criador
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {criadores.map((criador, index) => (
                  <motion.div
                    key={criador.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative overflow-hidden cursor-pointer"
                  >
                    {/* Efeito de brilho no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/10 via-sementes-accent/10 to-sementes-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                    
                    {/* Card principal */}
                    <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 hover:border-sementes-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                            {criador.usuario?.avatarUrl ? (
                              <img 
                                src={criador.usuario.avatarUrl} 
                                alt={`Avatar de ${criador.nome}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserGroupIcon className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-sementes-primary transition-colors mb-1">
                              {criador.nome}
                            </h3>
                            {renderRedesSociais(criador.redesSociais)}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {criador.bio}
                      </p>

                      {/* Nível e Estatísticas */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                          <p className="text-blue-400 text-xs font-bold mb-1">Nível</p>
                          <p className="text-white font-bold">{criador.nivel}</p>
                        </div>
                        <div className="text-center p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                          <p className="text-green-400 text-xs font-bold mb-1">Sementes</p>
                          <p className="text-white font-bold">{(criador.sementes / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="text-center p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                          <p className="text-purple-400 text-xs font-bold mb-1">Apoiadores</p>
                          <p className="text-white font-bold">{criador.apoiadores}</p>
                        </div>
                      </div>

                      {/* Data de Criação */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Criador desde {new Date(criador.dataCriacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <Link
                          href={`/criador/${criador.id}`}
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-sementes-primary to-sementes-accent text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-sementes-primary/25 transition-all duration-300 hover:scale-105"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Ver</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Conteúdos dos Parceiros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
                              <h2 className="text-3xl font-bold text-white mb-4">📺 Conteúdos dos Criadores</h2>
                              <p className="text-gray-400">Descubra os melhores conteúdos criados pelos nossos criadores</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {conteudosParceiros.map((conteudo, index) => (
                <motion.div
                  key={conteudo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative overflow-hidden cursor-pointer"
                >
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/10 via-sementes-accent/10 to-sementes-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                  
                  {/* Card principal */}
                  <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 hover:border-sementes-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">{getTipoIcon(conteudo.tipo)}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-sementes-primary transition-colors mb-1">
                            {conteudo.titulo}
                          </h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPlataformaColor(conteudo.plataforma)}`}>
                            {getPlataformaLabel(conteudo.plataforma)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {conteudo.descricao}
                    </p>

                    {/* Parceiro */}
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-700/30 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{conteudo.parceiro.nome}</p>
                        <p className="text-gray-400 text-xs">{conteudo.parceiro.nivel}</p>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <p className="text-blue-400 text-xs font-bold mb-1">Visualizações</p>
                        <p className="text-white font-bold">{(conteudo.visualizacoes / 1000).toFixed(0)}k</p>
                      </div>
                      <div className="text-center p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                        <p className="text-red-400 text-xs font-bold mb-1">Curtidas</p>
                        <p className="text-white font-bold">{(conteudo.curtidas / 1000).toFixed(0)}k</p>
                      </div>
                    </div>

                                         {/* Sistema de Interações */}
                     <div className="mb-4">
                       <ConteudoInteracoes
                         conteudoId={conteudo.id}
                         conteudoParceiroId={conteudo.id}
                         tituloConteudo={conteudo.titulo}
                         tipoConteudo="parceiro"
                         visualizacoes={conteudo.visualizacoes}
                         curtidas={conteudo.curtidas}
                         dislikes={conteudo.dislikes || 0}
                         onVisualizacaoChange={(novasVisualizacoes: number) => {
                           // Atualizar visualizações localmente
                           setConteudosParceiros(prev => 
                             prev.map(c => 
                               c.id === conteudo.id 
                                 ? { ...c, visualizacoes: novasVisualizacoes }
                                 : c
                             )
                           )
                         }}
                         onCurtidaChange={(novasCurtidas: number, curtido: boolean) => {
                           // Atualizar curtidas localmente
                           setConteudosParceiros(prev => 
                             prev.map(c => 
                               c.id === conteudo.id 
                                 ? { ...c, curtidas: novasCurtidas }
                                 : c
                             )
                           )
                         }}
                         onDislikeChange={(novosDislikes: number, disliked: boolean) => {
                           // Atualizar dislikes localmente
                           setConteudosParceiros(prev => 
                             prev.map(c => 
                               c.id === conteudo.id 
                                 ? { ...c, dislikes: novosDislikes }
                                 : c
                             )
                           )
                         }}
                       />
                     </div>

                     {/* Data e Botão */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-2 text-gray-400 text-sm">
                         <CalendarIcon className="w-4 h-4" />
                         <span>{new Date(conteudo.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                       </div>
                       
                       <a
                         href={conteudo.url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center space-x-2 bg-gradient-to-r from-sementes-primary to-sementes-accent text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-sementes-primary/25 transition-all duration-300 hover:scale-105"
                       >
                         <PlayIcon className="w-4 h-4" />
                         <span>Ver</span>
                       </a>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Como Funciona o Sistema de Ciclos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <div className="card">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🔄 Como Funciona o Sistema de Ciclos</h2>
                <p className="text-gray-400">Entenda como funciona nosso sistema de recompensas por ciclos</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Ciclos Mensais</h3>
                  <p className="text-gray-400 text-sm">
                    Cada ciclo dura um mês e é dividido em seasons trimestrais para maior engajamento
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Ranking e Recompensas</h3>
                  <p className="text-gray-400 text-sm">
                    Os criadores são ranqueados por pontuação e recebem sementes baseadas em seu desempenho
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sistema de Sementes</h3>
                  <p className="text-gray-400 text-sm">
                    As sementes são distribuídas proporcionalmente ao engajamento e qualidade do conteúdo
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Botão Flutuante "Seja um Criador" - Fixado na lateral direita */}
      <div className="fixed right-4 top-1/3 -translate-y-1/2 z-40">
                 <motion.button
           onClick={() => router.push('/candidatura-criador')}
           className="group relative bg-gradient-to-r from-sementes-primary to-sementes-accent text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-sementes-primary/50 transition-all duration-300 hover:scale-105 transform overflow-hidden"
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
         >
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Conteúdo do botão - Horizontal como na imagem */}
          <div className="relative flex items-center space-x-3">
            <UserGroupIcon className="w-5 h-5 text-white" />
            <span className="text-sm font-bold">Seja um Criador</span>
          </div>
          
          {/* Seta indicativa */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-6 border-r-sementes-primary border-b-6 border-b-transparent"></div>
        </motion.button>
      </div>
    </div>
  )
}
