'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  PlayIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  ChartBarIcon,
  MapPinIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

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

interface Conteudo {
  id: string
  titulo: string
  descricao: string
  tipo: 'video' | 'stream' | 'post' | 'artigo'
  plataforma: 'youtube' | 'twitch' | 'instagram' | 'tiktok' | 'blog'
  url: string
  thumbnail?: string
  visualizacoes: number
  curtidas: number
  dislikes: number
  dataPublicacao: string
  fixado: boolean
}

interface Enquete {
  id: string
  pergunta: string
  opcoes: { opcao: string; votos: number; porcentagem: number }[]
  criador: string
  totalVotos: number
  dataCriacao: string
  dataFim?: string
  ativa: boolean
}

interface Doacao {
  id: string
  quantidade: number
  data: string
  mensagem?: string
  doador?: { nome: string }
}

export default function CriadorPage() {
  const params = useParams()
  const router = useRouter()
  const criadorId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [criador, setCriador] = useState<Criador | null>(null)
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [enquetes, setEnquetes] = useState<Enquete[]>([])
  const [doacoes, setDoacoes] = useState<Doacao[]>([])
  const [loadingConteudos, setLoadingConteudos] = useState(true)
  const [loadingEnquetes, setLoadingEnquetes] = useState(true)
  const [loadingDoacoes, setLoadingDoacoes] = useState(true)
  const [activeTab, setActiveTab] = useState<'conteudos' | 'enquetes' | 'doacoes'>('conteudos')
  const [bioExpandida, setBioExpandida] = useState(false)

  useEffect(() => {
    if (criadorId) {
      carregarDadosCriador()
    }
  }, [criadorId])

  const carregarDadosCriador = async () => {
    try {
      setLoading(true)
      
      // Carregar dados do criador
      const responseCriador = await fetch('/api/criadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criadorId })
      })
      
      if (responseCriador.ok) {
        const data = await responseCriador.json()
        if (data.sucesso) {
          setCriador(data.dados)
        }
      }

      // Carregar conteúdos do criador
      await carregarConteudos()
      
      // Carregar enquetes do criador
      await carregarEnquetes()
      
      // Carregar doações do criador
      await carregarDoacoes()
      
    } catch (error) {
      console.error('Erro ao carregar dados do criador:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarConteudos = async () => {
    try {
      setLoadingConteudos(true)
      const response = await fetch(`/api/conteudos?criadorId=${criadorId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setConteudos(data.dados)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    } finally {
      setLoadingConteudos(false)
    }
  }

  const carregarEnquetes = async () => {
    try {
      setLoadingEnquetes(true)
      // TODO: Implementar API de enquetes
      setEnquetes([])
    } catch (error) {
      console.error('Erro ao carregar enquetes:', error)
    } finally {
      setLoadingEnquetes(false)
    }
  }

  const carregarDoacoes = async () => {
    try {
      setLoadingDoacoes(true)
      // TODO: Implementar API de doações
      setDoacoes([])
    } catch (error) {
      console.error('Erro ao carregar doações:', error)
    } finally {
      setLoadingDoacoes(false)
    }
  }

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
          <p className="text-white">Carregando perfil do criador...</p>
        </div>
      </div>
    )
  }

  if (!criador) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Criador não encontrado</h3>
          <p className="text-gray-400 mb-6">O criador que você está procurando não existe</p>
          <button
            onClick={() => router.push('/criadores')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sementes-primary to-sementes-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Voltar aos Criadores
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sss-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header com Botão Voltar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push('/criadores')}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors mr-4"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-3xl font-bold text-white">Perfil do Criador</h1>
            </div>
          </motion.div>

          {/* Perfil do Criador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/20 to-sementes-accent/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  {/* Avatar e Informações Básicas */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-3xl flex items-center justify-center shadow-lg mb-4">
                      <UserGroupIcon className="w-16 h-16 text-white" />
                    </div>
                    <div className="text-center">
                      <span className="px-4 py-2 rounded-xl text-sm font-medium border border-sementes-primary/30 text-sementes-primary">
                        {criador.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Informações Detalhadas */}
                  <div className="flex-1">
                                         <div className="mb-6">
                       <h2 className="text-4xl font-bold text-white mb-2">{criador.nome}</h2>
                       <p className={`text-gray-300 text-lg max-w-4xl ${bioExpandida ? '' : 'line-clamp-3'}`}>
                         {criador.bio}
                       </p>
                       {criador.bio && criador.bio.length > 200 && (
                         <button
                           onClick={() => setBioExpandida(!bioExpandida)}
                           className="text-sementes-primary hover:text-sementes-accent text-sm font-medium mt-2 transition-colors"
                         >
                           {bioExpandida ? 'Ver menos' : 'Ver mais'}
                         </button>
                       )}
                     </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="text-2xl mb-2">🏆</div>
                        <p className="text-gray-400 text-sm">Nível</p>
                        <p className="text-white font-bold text-lg">{criador.nivel}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="text-2xl mb-2">🌱</div>
                        <p className="text-gray-400 text-sm">Sementes</p>
                        <p className="text-white font-bold text-lg">{(criador.sementes / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="text-2xl mb-2">👥</div>
                        <p className="text-gray-400 text-sm">Apoiadores</p>
                        <p className="text-white font-bold text-lg">{criador.apoiadores}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="text-2xl mb-2">💰</div>
                        <p className="text-gray-400 text-sm">Doações</p>
                        <p className="text-white font-bold text-lg">{criador.doacoes}</p>
                      </div>
                    </div>

                    {/* Redes Sociais */}
                    {criador.redesSociais && Object.keys(criador.redesSociais).length > 0 && (
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400 text-sm">Redes Sociais:</span>
                        {Object.entries(criador.redesSociais).map(([plataforma, url]) => (
                          <a
                            key={plataforma}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                            title={plataforma}
                          >
                            <GlobeAltIcon className="w-5 h-5 text-sementes-primary" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Data de Criação */}
                    <div className="mt-6 flex items-center space-x-2 text-gray-400 text-sm">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Criador desde {new Date(criador.dataCriacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs de Navegação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('conteudos')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'conteudos'
                    ? 'bg-sementes-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                📺 Conteúdos ({conteudos.length})
              </button>
              <button
                onClick={() => setActiveTab('enquetes')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'enquetes'
                    ? 'bg-sementes-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                📊 Enquetes ({enquetes.length})
              </button>
              <button
                onClick={() => setActiveTab('doacoes')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'doacoes'
                    ? 'bg-sementes-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                💰 Doações ({doacoes.length})
              </button>
            </div>
          </motion.div>

          {/* Conteúdo das Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Tab Conteúdos */}
            {activeTab === 'conteudos' && (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">📺 Conteúdos de {criador.nome}</h3>
                  <p className="text-gray-400">Descubra os melhores conteúdos criados por este criador</p>
                </div>

                {loadingConteudos ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Carregando conteúdos...</p>
                  </div>
                ) : conteudos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlayIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Nenhum conteúdo ainda</h4>
                    <p className="text-gray-400">Este criador ainda não publicou nenhum conteúdo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {conteudos.map((conteudo, index) => (
                      <motion.div
                        key={conteudo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group relative overflow-hidden cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/10 via-sementes-accent/10 to-sementes-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                        
                        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 hover:border-sementes-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">{getTipoIcon(conteudo.tipo)}</span>
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-white group-hover:text-sementes-primary transition-colors mb-1">
                                  {conteudo.titulo}
                                </h4>
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPlataformaColor(conteudo.plataforma)}`}>
                                  {getPlataformaLabel(conteudo.plataforma)}
                                </span>
                              </div>
                            </div>
                            {conteudo.fixado && (
                              <StarIcon className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>

                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {conteudo.descricao}
                          </p>

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
                )}
              </div>
            )}

            {/* Tab Enquetes */}
            {activeTab === 'enquetes' && (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">📊 Enquetes de {criador.nome}</h3>
                  <p className="text-gray-400">Participe das enquetes criadas por este criador</p>
                </div>

                {loadingEnquetes ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Carregando enquetes...</p>
                  </div>
                ) : enquetes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChartBarIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Nenhuma enquete ainda</h4>
                    <p className="text-gray-400">Este criador ainda não criou nenhuma enquete</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enquetes.map((enquete, index) => (
                      <motion.div
                        key={enquete.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-white">{enquete.pergunta}</h4>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            enquete.ativa ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {enquete.ativa ? 'Ativa' : 'Encerrada'}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          {enquete.opcoes.map((opcao, index) => (
                            <div key={index} className="relative">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-300">{opcao.opcao}</span>
                                <span className="text-sementes-primary font-medium">{opcao.porcentagem}%</span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-sementes-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${opcao.porcentagem}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Total de votos: {enquete.totalVotos}</span>
                          <span>{new Date(enquete.dataCriacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Doações */}
            {activeTab === 'doacoes' && (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">💰 Doações para {criador.nome}</h3>
                  <p className="text-gray-400">Histórico de doações recebidas por este criador</p>
                </div>

                {loadingDoacoes ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Carregando doações...</p>
                  </div>
                ) : doacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HeartIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Nenhuma doação ainda</h4>
                    <p className="text-gray-400">Este criador ainda não recebeu nenhuma doação</p>
                    <Link
                      href={`/doar?criadorId=${criador.id}`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sementes-primary to-sementes-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 mt-4"
                    >
                      <HeartIcon className="w-5 h-5 mr-2" />
                      Fazer Primeira Doação
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doacoes.map((doacao, index) => (
                      <motion.div
                        key={doacao.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{doacao.doador?.nome || 'Anônimo'}</p>
                            {doacao.mensagem && (
                              <p className="text-gray-300 text-sm mt-1">{doacao.mensagem}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sementes-primary font-bold text-xl">{doacao.quantidade} Sementes</p>
                            <p className="text-gray-400 text-sm">{new Date(doacao.data).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
