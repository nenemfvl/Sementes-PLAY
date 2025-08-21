'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  PlayIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const [totalSementes, setTotalSementes] = useState(0)
  const [dadosCiclo, setDadosCiclo] = useState<DadosCiclo | null>(null)
  const [conteudosParceiros, setConteudosParceiros] = useState<ConteudoParceiro[]>([])
  const [criadores, setCriadores] = useState<Criador[]>([])
  const [criadoresLoading, setCriadoresLoading] = useState(true)
  const [usuario, setUsuario] = useState<any>(null)
  const [statusCandidatura, setStatusCandidatura] = useState<string | null>(null)
  const [verificandoStatus, setVerificandoStatus] = useState(true)
  const router = useRouter()

  useEffect(() => {
    verificarUsuario()
    carregarDados()
  }, [])

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

  const carregarDados = async () => {
    try {
      // Carregar dados do ciclo
      const responseCiclos = await fetch('/api/ciclos')
      if (responseCiclos.ok) {
        const data = await responseCiclos.json()
        if (data.sucesso) {
          setDadosCiclo(data.dados)
        }
      }

      // Carregar total de sementes
      const responseStats = await fetch('/api/admin/stats')
      if (responseStats.ok) {
        const data = await responseStats.json()
        if (typeof data.totalSementes === 'number') {
          setTotalSementes(data.totalSementes)
        }
      }

      // Carregar criadores
      await carregarCriadores()

      // TODO: Implementar API para carregar conteúdos dos parceiros
      setConteudosParceiros([])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLoading(false)
    }
  }

  const carregarCriadores = async () => {
    try {
      setCriadoresLoading(true)
      const response = await fetch('/api/criadores')
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setCriadores(data.dados.criadores)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar criadores:', error)
    } finally {
      setCriadoresLoading(false)
    }
  }

  useEffect(() => {
    carregarCriadores()
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/20 via-sementes-accent/20 to-sementes-primary/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-2xl flex items-center justify-center shadow-2xl">
                    <UserGroupIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Criadores de Conteúdo
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Informações sobre ciclos, estatísticas e conteúdos dos parceiros
                </p>
                
                {/* Botão Seja Criador */}
                <div className="mt-8">
                  {verificandoStatus ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sementes-primary mx-auto mb-4"></div>
                  ) : statusCandidatura === 'criador_aprovado' ? (
                    <Link
                      href="/painel-criador"
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-green-600/25 transition-all duration-300 hover:scale-105 transform"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3" />
                      Acessar Painel Criador
                    </Link>
                  ) : statusCandidatura === 'pendente' ? (
                    <div className="inline-flex items-center justify-center px-8 py-4 bg-yellow-600 text-white font-bold text-lg rounded-2xl">
                      <UserGroupIcon className="w-6 h-6 mr-3" />
                      Candidatura em Análise
                    </div>
                  ) : statusCandidatura === 'aprovada' ? (
                    <Link
                      href="/painel-criador"
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-green-600/25 transition-all duration-300 hover:scale-105 transform"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3" />
                      Acessar Painel Criador
                    </Link>
                  ) : statusCandidatura === 'rejeitada' ? (
                    <button
                      onClick={() => router.push('/candidatura-criador')}
                      className="inline-flex items-center justify-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-red-600/25 transition-all duration-300 hover:scale-105 transform"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3" />
                      Nova Candidatura
                    </button>
                  ) : (
                    <Link
                      href="/candidatura-criador"
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-sementes-primary to-sementes-accent text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-sementes-primary/25 transition-all duration-300 hover:scale-105 transform"
                    >
                      <UserGroupIcon className="w-6 h-6 mr-3" />
                      Seja um Criador
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

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
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🌱</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Total de Sementes na Plataforma</h2>
                  <p className="text-6xl md:text-7xl font-black text-yellow-500 mb-4">
                    {(totalSementes / 1000).toFixed(0)}k
                  </p>
                  <p className="text-gray-400 text-lg">Sementes distribuídas entre criadores e usuários</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Informações do Ciclo Atual */}
          {dadosCiclo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
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
                        {dadosCiclo.ciclo}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">🏆</span>
                        <span className="text-gray-400 text-sm">Season</span>
                      </div>
                      <div className="text-4xl font-bold text-sementes-accent">
                        {dadosCiclo.season}
                      </div>
                    </div>
                  </div>

                  {/* Status e Datas */}
                  <div className="flex flex-col items-center lg:items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${dadosCiclo.pausado ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      <span className="text-sm text-gray-300">
                        {dadosCiclo.pausado ? 'Ciclo Pausado' : 'Ciclo Ativo'}
                      </span>
                    </div>
                    
                    <div className="text-center lg:text-right">
                      <p className="text-gray-400 text-xs">Início do Ciclo</p>
                      <p className="text-white text-sm">
                        {new Date(dadosCiclo.dataInicioCiclo).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div className="text-center lg:text-right">
                      <p className="text-gray-400 text-xs">Início da Season</p>
                      <p className="text-white text-sm">
                        {new Date(dadosCiclo.dataInicioSeason).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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
                  {dadosCiclo ? dadosCiclo.estatisticas.totalCriadores : 0}
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
                  {dadosCiclo ? 
                    (dadosCiclo.estatisticas.totalSementes / 1000).toFixed(0) + 'k' : 
                    (totalSementes / 1000).toFixed(0) + 'k'
                  }
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
                          <div className="w-12 h-12 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-xl flex items-center justify-center shadow-lg">
                            <UserGroupIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-sementes-primary transition-colors mb-1">
                              {criador.nome}
                            </h3>
                            <span className="px-2 py-1 rounded-lg text-xs font-medium border border-sementes-primary/30 text-sementes-primary">
                              {criador.categoria}
                            </span>
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
              <h2 className="text-3xl font-bold text-white mb-4">📺 Conteúdos dos Parceiros</h2>
              <p className="text-gray-400">Descubra os melhores conteúdos criados pelos nossos parceiros</p>
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
    </div>
  )
}
