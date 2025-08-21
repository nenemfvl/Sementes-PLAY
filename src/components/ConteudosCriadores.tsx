'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  PhotoIcon, 
  LinkIcon, 
  DocumentTextIcon,
  HeartIcon,
  EyeIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { FaInstagram, FaYoutube, FaTwitch, FaTiktok } from 'react-icons/fa'

// Forçar renderização dinâmica para evitar erro de prerendering
export const dynamic = 'force-dynamic'

interface Conteudo {
  id: string
  titulo: string
  descricao: string
  data: string
  url: string
  tipo: string
  preview?: string
  criador: {
    nome: string
    avatarUrl?: string
  }
  categoria?: string
  visualizacoes?: number
  curtidas?: number
  compartilhamentos?: number
  pontuacaoPopularidade?: number
}

interface ConteudosCriadoresProps {
  criadorId?: string // Se fornecido, mostra apenas conteúdos de um criador específico
}

export default function ConteudosCriadores({ criadorId }: ConteudosCriadoresProps) {
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroRede, setFiltroRede] = useState('todos')

  const tiposConteudo = [
    { id: 'todos', nome: 'Todos', icone: DocumentTextIcon },
    { id: 'video', nome: 'Vídeos', icone: PlayIcon },
    { id: 'imagem', nome: 'Imagens', icone: PhotoIcon },
    { id: 'link', nome: 'Links', icone: LinkIcon }
  ]

  const redesSociais = [
    { id: 'todos', nome: 'Todas', icone: null },
    { id: 'youtube', nome: 'YouTube', icone: FaYoutube },
    { id: 'twitch', nome: 'Twitch', icone: FaTwitch },
    { id: 'instagram', nome: 'Instagram', icone: FaInstagram },
    { id: 'tiktok', nome: 'TikTok', icone: FaTiktok }
  ]

  useEffect(() => {
    const fetchConteudos = async () => {
      try {
        setLoading(true)
        // TODO: Implementar API para buscar conteúdos
        setConteudos([])
      } catch (err) {
        setError('Erro ao carregar conteúdos')
        console.error('Erro ao buscar conteúdos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConteudos()
  }, [criadorId])

  // Auto-advance slides
  useEffect(() => {
    if (conteudos.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(conteudos.length, 3))
      }, 60000) // Change slide every 60 seconds

      return () => clearInterval(timer)
    }
  }, [conteudos.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(conteudos.length, 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(conteudos.length, 3)) % Math.min(conteudos.length, 3))
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'video':
      case 'youtube':
      case 'twitch':
        return <PlayIcon className="w-5 h-5 text-red-400" />
      case 'imagem':
      case 'foto':
        return <PhotoIcon className="w-5 h-5 text-green-400" />
      case 'link':
      case 'url':
        return <LinkIcon className="w-5 h-5 text-blue-400" />
      default:
        return <DocumentTextIcon className="w-5 h-5 text-blue-300" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'video':
      case 'youtube':
        return 'Vídeo'
      case 'twitch':
        return 'Stream'
      case 'imagem':
      case 'foto':
        return 'Imagem'
      case 'link':
      case 'url':
        return 'Link'
      case 'post':
        return 'Post'
      default:
        return 'Conteúdo'
    }
  }

  const getRedeIcon = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <FaYoutube className="w-4 h-4 text-red-500" />
    }
    if (url.includes('twitch.tv')) {
      return <FaTwitch className="w-4 h-4 text-purple-500" />
    }
    if (url.includes('instagram.com')) {
      return <FaInstagram className="w-4 h-4 text-pink-500" />
    }
    if (url.includes('tiktok.com')) {
      return <FaTiktok className="w-4 h-4 text-black" />
    }
    return null
  }

  const conteudosFiltrados = conteudos.filter(conteudo => {
    const matchTipo = filtroTipo === 'todos' || conteudo.tipo === filtroTipo
    const matchRede = filtroRede === 'todos' || 
      (filtroRede === 'youtube' && conteudo.url.includes('youtube')) ||
      (filtroRede === 'twitch' && conteudo.url.includes('twitch')) ||
      (filtroRede === 'instagram' && conteudo.url.includes('instagram')) ||
      (filtroRede === 'tiktok' && conteudo.url.includes('tiktok'))
    
    return matchTipo && matchRede
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sementes-primary"></div>
        <span className="ml-3 text-gray-400">Carregando conteúdos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-2">❌</div>
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Conteúdos dos Criadores
        </h2>
        <p className="text-gray-300">
          Descubra os melhores conteúdos da nossa comunidade
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {/* Filtro por tipo */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Tipo:</span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            {tiposConteudo.map((tipo) => {
              const Icon = tipo.icone
              return (
                <button
                  key={tipo.id}
                  onClick={() => setFiltroTipo(tipo.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filtroTipo === tipo.id
                      ? 'bg-sementes-primary text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 inline mr-2" />}
                  {tipo.nome}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filtro por rede social */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Rede:</span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            {redesSociais.map((rede) => {
              const Icon = rede.icone
              return (
                <button
                  key={rede.id}
                  onClick={() => setFiltroRede(rede.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filtroRede === rede.id
                      ? 'bg-sementes-primary text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 inline mr-2" />}
                  {rede.nome}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Carrossel de Conteúdos Populares */}
      {conteudosFiltrados.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Conteúdos Populares
          </h3>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="block w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 h-[400px] relative">
              {conteudosFiltrados.slice(0, 3).map((conteudo, index) => (
                <div
                  key={conteudo.id}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="relative h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30">
                    {/* Background Image */}
                    {conteudo.preview && (
                      <div className="absolute inset-0">
                        <img
                          src={conteudo.preview}
                          alt={conteudo.titulo}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <div className="mb-4">
                          {getTipoIcon(conteudo.tipo)}
                        </div>
                        <h4 className="text-2xl font-bold mb-2">{conteudo.titulo}</h4>
                        <p className="text-lg mb-4 opacity-90">{conteudo.descricao}</p>
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <span className="flex items-center space-x-1">
                            <EyeIcon className="w-4 h-4" />
                            <span>{conteudo.visualizacoes?.toLocaleString() || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <HeartIcon className="w-4 h-4" />
                            <span>{conteudo.curtidas?.toLocaleString() || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ShareIcon className="w-4 h-4" />
                            <span>{conteudo.compartilhamentos?.toLocaleString() || 0}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <span className="text-sm opacity-75">por</span>
                          <span className="font-semibold">{conteudo.criador.nome}</span>
                          {getRedeIcon(conteudo.url)}
                        </div>
                        <a
                          href={conteudo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-sementes-primary hover:bg-sementes-secondary text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Ver Conteúdo
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {conteudosFiltrados.slice(0, 3).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Conteúdos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conteudosFiltrados.map((conteudo) => (
          <motion.div
            key={conteudo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-all duration-300 group border border-gray-700 hover:border-gray-600"
          >
            {/* Preview Image */}
            {conteudo.preview && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={conteudo.preview}
                  alt={conteudo.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  {getTipoIcon(conteudo.tipo)}
                </div>
                <div className="absolute top-3 right-3">
                  {getRedeIcon(conteudo.url)}
                </div>
              </div>
            )}
            
            {/* Content Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-white group-hover:text-sementes-primary transition-colors line-clamp-2">
                  {conteudo.titulo}
                </h4>
              </div>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {conteudo.descricao}
              </p>
              
              {/* Creator Info */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-300">
                  por <span className="font-medium text-sementes-primary">{conteudo.criador.nome}</span>
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(conteudo.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{conteudo.visualizacoes?.toLocaleString() || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{conteudo.curtidas?.toLocaleString() || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ShareIcon className="w-4 h-4" />
                  <span>{conteudo.compartilhamentos?.toLocaleString() || 0}</span>
                </span>
              </div>
              
              {/* Action Button */}
              <a
                href={conteudo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-sementes-primary hover:bg-sementes-secondary text-white text-center py-2 rounded-lg font-medium transition-colors"
              >
                Ver Conteúdo
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {conteudosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎬</div>
          <div className="text-lg font-bold text-white mb-2">Nenhum conteúdo encontrado</div>
          <div className="text-sm text-gray-400">
            Tente ajustar os filtros para ver mais conteúdos
          </div>
        </div>
      )}
    </div>
  )
}
