'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { FaYoutube, FaTwitch, FaInstagram, FaTiktok } from 'react-icons/fa'
import ConteudosCriadores from '@/components/ConteudosCriadores'

interface Criador {
  id: string
  nome: string
  email: string
  avatarUrl?: string
  nivel: string
  categoria: string
  cidade: string
  estado: string
  totalConteudos: number
  totalVisualizacoes: number
  totalCurtidas: number
  totalSementes: number
  dataCadastro: string
  status: 'ativo' | 'inativo' | 'suspenso'
  redesSociais?: {
    youtube?: string
    twitch?: string
    instagram?: string
    tiktok?: string
  }
}

export default function CriadoresPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [criadores, setCriadores] = useState<Criador[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [selectedCriador, setSelectedCriador] = useState<Criador | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          setUsuario(dadosUsuario)
          setIsAuthenticated(true)
          // Carregar dados após autenticação
          carregarCriadores()
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

  const carregarCriadores = async () => {
    try {
      // TODO: Implementar API para buscar criadores
      // Por enquanto, usando dados mockados
      const mockCriadores: Criador[] = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          avatarUrl: '',
          nivel: 'criador-supremo',
          categoria: 'Tecnologia',
          cidade: 'São Paulo',
          estado: 'SP',
          totalConteudos: 45,
          totalVisualizacoes: 125000,
          totalCurtidas: 8900,
          totalSementes: 15000,
          dataCadastro: '2024-01-01',
          status: 'ativo',
          redesSociais: {
            youtube: 'https://youtube.com/@joaosilva',
            twitch: 'https://twitch.tv/joaosilva',
            instagram: 'https://instagram.com/joaosilva'
          }
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@exemplo.com',
          avatarUrl: '',
          nivel: 'criador-parceiro',
          categoria: 'Culinária',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          totalConteudos: 32,
          totalVisualizacoes: 89000,
          totalCurtidas: 5600,
          totalSementes: 12000,
          dataCadastro: '2024-01-15',
          status: 'ativo',
          redesSociais: {
            instagram: 'https://instagram.com/mariasantos',
            tiktok: 'https://tiktok.com/@mariasantos'
          }
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          email: 'pedro@exemplo.com',
          avatarUrl: '',
          nivel: 'criador-comum',
          categoria: 'Gaming',
          cidade: 'Belo Horizonte',
          estado: 'MG',
          totalConteudos: 28,
          totalVisualizacoes: 67000,
          totalCurtidas: 4200,
          totalSementes: 8500,
          dataCadastro: '2024-02-01',
          status: 'ativo',
          redesSociais: {
            twitch: 'https://twitch.tv/pedrocosta',
            youtube: 'https://youtube.com/@pedrocosta'
          }
        },
        {
          id: '4',
          nome: 'Ana Oliveira',
          email: 'ana@exemplo.com',
          avatarUrl: '',
          nivel: 'criador-iniciante',
          categoria: 'Fitness',
          cidade: 'Salvador',
          estado: 'BA',
          totalConteudos: 15,
          totalVisualizacoes: 23000,
          totalCurtidas: 1800,
          totalSementes: 3200,
          dataCadastro: '2024-02-15',
          status: 'ativo',
          redesSociais: {
            instagram: 'https://instagram.com/anaoliveira',
            tiktok: 'https://tiktok.com/@anaoliveira'
          }
        },
        {
          id: '5',
          nome: 'Carlos Ferreira',
          email: 'carlos@exemplo.com',
          avatarUrl: '',
          nivel: 'criador-parceiro',
          categoria: 'Marketing',
          cidade: 'Fortaleza',
          estado: 'CE',
          totalConteudos: 38,
          totalVisualizacoes: 95000,
          totalCurtidas: 7200,
          totalSementes: 13500,
          dataCadastro: '2024-01-10',
          status: 'ativo',
          redesSociais: {
            youtube: 'https://youtube.com/@carlosferreira',
            instagram: 'https://instagram.com/carlosferreira'
          }
        }
      ]

      setCriadores(mockCriadores)
    } catch (error) {
      console.error('Erro ao carregar criadores:', error)
    }
  }

  // Carregar favoritos do localStorage
  useEffect(() => {
    const favoritosSalvos = localStorage.getItem('criadoresFavoritos')
    if (favoritosSalvos) {
      try {
        const favoritosArray = JSON.parse(favoritosSalvos)
        setFavoritos(new Set(favoritosArray))
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        localStorage.removeItem('criadoresFavoritos')
      }
    }
  }, [])

  const toggleFavorito = (criadorId: string) => {
    setFavoritos(prev => {
      const novosFavoritos = new Set(prev)
      if (novosFavoritos.has(criadorId)) {
        novosFavoritos.delete(criadorId)
      } else {
        novosFavoritos.add(criadorId)
      }
      // Salvar no localStorage
      localStorage.setItem('criadoresFavoritos', JSON.stringify(Array.from(novosFavoritos)))
      return novosFavoritos
    })
  }

  const categorias = ['todas', ...Array.from(new Set(criadores.map(c => c.categoria)))]
  const niveis = ['todos', 'criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
  const estados = ['todos', ...Array.from(new Set(criadores.map(c => c.estado)))]

  const criadoresFiltrados = criadores.filter(criador => 
    criador.status === 'ativo' &&
    (searchTerm === '' || criador.nome.toLowerCase().includes(searchTerm.toLowerCase()) || criador.categoria.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategoria === 'todas' || criador.categoria === filterCategoria) &&
    (filterNivel === 'todos' || criador.nivel === filterNivel) &&
    (filterEstado === 'todos' || criador.estado === filterEstado)
  )

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'criador-supremo': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'criador-parceiro': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'criador-comum': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'criador-iniciante': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'criador-supremo': return 'Supremo'
      case 'criador-parceiro': return 'Parceiro'
      case 'criador-comum': return 'Comum'
      case 'criador-iniciante': return 'Iniciante'
      default: return nivel
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando criadores...</p>
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
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              <UserGroupIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
              Criadores de Conteúdo
            </h1>
            <p className="text-gray-300">
              Descubra e acompanhe os melhores criadores da nossa comunidade
            </p>
          </motion.div>

          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-gray-400 text-sm">Total de Criadores</p>
              <p className="text-white font-bold text-lg">{criadores.filter(c => c.status === 'ativo').length}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🎬</div>
              <p className="text-gray-400 text-sm">Total de Conteúdos</p>
              <p className="text-white font-bold text-lg">{criadores.reduce((acc, c) => acc + c.totalConteudos, 0)}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">👁️</div>
              <p className="text-gray-400 text-sm">Total de Visualizações</p>
              <p className="text-white font-bold text-lg">{(criadores.reduce((acc, c) => acc + c.totalVisualizacoes, 0) / 1000).toFixed(0)}k</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">💝</div>
              <p className="text-gray-400 text-sm">Total de Sementes</p>
              <p className="text-white font-bold text-lg">{(criadores.reduce((acc, c) => acc + c.totalSementes, 0) / 1000).toFixed(0)}k</p>
            </div>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar criadores por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sementes-primary"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-sementes-primary"
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria === 'todas' ? 'Todas as Categorias' : categoria}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterNivel}
                    onChange={(e) => setFilterNivel(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-sementes-primary"
                  >
                    {niveis.map((nivel) => (
                      <option key={nivel} value={nivel}>
                        {nivel === 'todos' ? 'Todos os Níveis' : getNivelLabel(nivel)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-sementes-primary"
                  >
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado === 'todos' ? 'Todos os Estados' : estado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Criadores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4 mb-12"
          >
            {criadoresFiltrados.length === 0 ? (
              <div className="card text-center py-12">
                <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum criador encontrado</h3>
                <p className="text-gray-400">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {criadoresFiltrados.map((criador, index) => (
                  <motion.div
                    key={criador.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedCriador(criador)
                      setShowModal(true)
                    }}
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-sementes-primary/20 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-6 h-6 text-sementes-primary" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold group-hover:text-sementes-primary transition-colors">
                            {criador.nome}
                          </h3>
                          <p className="text-gray-400 text-sm">{criador.categoria}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getNivelColor(criador.nivel)}`}>
                          {getNivelLabel(criador.nivel)}
                        </span>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPinIcon className="w-4 h-4 text-sementes-primary" />
                        <span className="text-sm">{criador.cidade}, {criador.estado}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-300">
                        <CalendarIcon className="w-4 h-4 text-sementes-primary" />
                        <span className="text-sm">Desde {new Date(criador.dataCadastro).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-gray-400 text-xs">Conteúdos</p>
                        <p className="text-white font-bold">{criador.totalConteudos}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-gray-400 text-xs">Visualizações</p>
                        <p className="text-white font-bold">{(criador.totalVisualizacoes / 1000).toFixed(0)}k</p>
                      </div>
                      <div className="text-center p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-gray-400 text-xs">Sementes</p>
                        <p className="text-white font-bold">{(criador.totalSementes / 1000).toFixed(0)}k</p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorito(criador.id)
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          favoritos.has(criador.id)
                            ? 'text-red-500 bg-red-500/20'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        <HeartIcon className="w-4 h-4" />
                      </button>
                      
                      <button className="inline-flex items-center space-x-2 text-sementes-primary hover:text-sementes-accent transition-colors">
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Ver Perfil</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Seção de Conteúdos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <ConteudosCriadores />
          </motion.div>
        </div>
      </div>

      {/* Modal de Detalhes do Criador */}
      {showModal && selectedCriador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedCriador.nome}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Informações do Criador */}
              <div className="space-y-6">
                {/* Nível e Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getNivelColor(selectedCriador.nivel)}`}>
                    {getNivelLabel(selectedCriador.nivel)}
                  </span>
                  <span className="text-green-400 text-sm">● Ativo</span>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
                    <p className="text-white">{selectedCriador.categoria}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Localização</label>
                    <p className="text-white">{selectedCriador.cidade}, {selectedCriador.estado}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white">{selectedCriador.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data de Cadastro</label>
                    <p className="text-white">{new Date(selectedCriador.dataCadastro).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Total de Conteúdos</p>
                    <p className="text-white font-bold text-lg">{selectedCriador.totalConteudos}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Visualizações</p>
                    <p className="text-white font-bold text-lg">{(selectedCriador.totalVisualizacoes / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Curtidas</p>
                    <p className="text-white font-bold text-lg">{(selectedCriador.totalCurtidas / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Sementes</p>
                    <p className="text-white font-bold text-lg">{(selectedCriador.totalSementes / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                {/* Redes Sociais */}
                {selectedCriador.redesSociais && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Redes Sociais</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCriador.redesSociais.youtube && (
                        <a
                          href={selectedCriador.redesSociais.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaYoutube className="w-4 h-4" />
                          <span>YouTube</span>
                        </a>
                      )}
                      {selectedCriador.redesSociais.twitch && (
                        <a
                          href={selectedCriador.redesSociais.twitch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaTwitch className="w-4 h-4" />
                          <span>Twitch</span>
                        </a>
                      )}
                      {selectedCriador.redesSociais.instagram && (
                        <a
                          href={selectedCriador.redesSociais.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaInstagram className="w-4 h-4" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {selectedCriador.redesSociais.tiktok && (
                        <a
                          href={selectedCriador.redesSociais.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaTiktok className="w-4 h-4" />
                          <span>TikTok</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
