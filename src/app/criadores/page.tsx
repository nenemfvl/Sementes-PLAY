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

interface DadosCiclo {
  ciclo: number
  season: number
  dataInicioCiclo: string
  dataInicioSeason: string
  pausado: boolean
  ranking: Array<{
    id: string
    pontuacao: number
    posicao: number
    usuario: {
      id: string
      nome: string
      avatarUrl?: string
      nivel: string
    }
  }>
  estatisticas: {
    totalCriadores: number
    totalSementes: number
  }
}

export default function CriadoresPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [totalSementes, setTotalSementes] = useState<number | null>(null)
  const [criadores, setCriadores] = useState<Criador[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [selectedCriador, setSelectedCriador] = useState<Criador | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [dadosCiclo, setDadosCiclo] = useState<DadosCiclo | null>(null)

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
          carregarTotalSementes()
          carregarDadosCiclo()
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
      // Carregar contador independentemente da autenticação
      carregarTotalSementes()
      carregarDadosCiclo()
      setLoading(false)
    }
    verificarAutenticacao()
  }, [])

  const carregarTotalSementes = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        if (typeof data.totalSementes === 'number') {
          setTotalSementes(data.totalSementes)
          return
        }
      }
      // Fallback enquanto API não existir
      setTotalSementes(0)
    } catch (error) {
      console.error('Erro ao carregar total de sementes:', error)
      setTotalSementes(0)
    }
  }

  const carregarDadosCiclo = async () => {
    try {
      const response = await fetch('/api/ciclos')
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setDadosCiclo(data.dados)
          // Atualizar total de sementes com dados do ciclo
          if (data.dados.estatisticas.totalSementes > 0) {
            setTotalSementes(data.dados.estatisticas.totalSementes)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do ciclo:', error)
    }
  }

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
          {/* Header Moderno */}
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
                  Descubra e acompanhe os melhores criadores da nossa comunidade. 
                  Conecte-se, inspire-se e cresça junto conosco.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contador de Sementes em circulação */}
          {totalSementes !== null && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full mb-8"
            >
              <div className="flex flex-col items-center bg-[#1a223a]/90 rounded-2xl border border-gray-700 py-8">
                <span className="text-gray-400 text-sm mb-2">Sementes em circulação</span>
                <div className="flex items-center gap-3">
                  <span className="text-5xl md:text-6xl font-extrabold text-sss-accent">
                    {totalSementes.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-4xl">🌱</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Informações do Ciclo Atual */}
          {dadosCiclo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-sementes-primary/20 to-sementes-accent/20 rounded-2xl border border-sementes-primary/30 p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Status do Ciclo */}
                  <div className="flex items-center space-x-4">
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

          {/* Estatísticas Modernas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
                  {dadosCiclo ? dadosCiclo.estatisticas.totalCriadores : criadores.filter(c => c.status === 'ativo').length}
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
                <p className="text-3xl font-black text-white">{criadores.reduce((acc, c) => acc + c.totalConteudos, 0)}</p>
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
                <p className="text-3xl font-black text-white">{(criadores.reduce((acc, c) => acc + c.totalVisualizacoes, 0) / 1000).toFixed(0)}k</p>
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
                    (criadores.reduce((acc, c) => acc + c.totalSementes, 0) / 1000).toFixed(0) + 'k'
                  }
                </p>
                <div className="mt-4 h-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Filtros Modernos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/10 to-sementes-accent/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Barra de Busca */}
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/20 to-sementes-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative">
                        <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-sementes-primary" />
                        <input
                          type="text"
                          placeholder="🔍 Buscar criadores por nome ou categoria..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 bg-gray-800/80 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-sementes-primary focus:ring-2 focus:ring-sementes-primary/20 transition-all duration-300 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-4">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative flex items-center space-x-3 bg-gray-800/80 border border-gray-600/50 rounded-2xl px-4 py-3 hover:border-blue-500/50 transition-all duration-300">
                        <FunnelIcon className="w-5 h-5 text-blue-400" />
                        <select
                          value={filterCategoria}
                          onChange={(e) => setFilterCategoria(e.target.value)}
                          className="bg-transparent text-white focus:outline-none cursor-pointer"
                        >
                          {categorias.map((categoria) => (
                            <option key={categoria} value={categoria}>
                              {categoria === 'todas' ? '📂 Todas as Categorias' : categoria}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative flex items-center space-x-3 bg-gray-800/80 border border-gray-600/50 rounded-2xl px-4 py-3 hover:border-yellow-500/50 transition-all duration-300">
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                        <select
                          value={filterNivel}
                          onChange={(e) => setFilterNivel(e.target.value)}
                          className="bg-transparent text-white focus:outline-none cursor-pointer"
                        >
                          {niveis.map((nivel) => (
                            <option key={nivel} value={nivel}>
                              {nivel === 'todos' ? '⭐ Todos os Níveis' : getNivelLabel(nivel)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative flex items-center space-x-3 bg-gray-800/80 border border-gray-600/50 rounded-2xl px-4 py-3 hover:border-green-500/50 transition-all duration-300">
                        <MapPinIcon className="w-5 h-5 text-green-400" />
                        <select
                          value={filterEstado}
                          onChange={(e) => setFilterEstado(e.target.value)}
                          className="bg-transparent text-white focus:outline-none cursor-pointer"
                        >
                          {estados.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado === 'todos' ? '🌍 Todos os Estados' : estado}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ranking do Ciclo Atual */}
          {dadosCiclo && dadosCiclo.ranking.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="text-3xl mr-3">🏆</span>
                    Ranking do Ciclo {dadosCiclo.ciclo}
                  </h2>
                  <div className="text-sm text-gray-400">
                    Top {dadosCiclo.ranking.length} Criadores
                  </div>
                </div>

                <div className="space-y-3">
                  {dadosCiclo.ranking.map((ranking, index) => (
                    <motion.div
                      key={ranking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                    >
                      {/* Posição */}
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {index === 0 && (
                            <span className="text-yellow-400">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-gray-300">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-amber-600">🥉</span>
                          )}
                          {index > 2 && (
                            <span className="text-gray-400">#{index + 1}</span>
                          )}
                        </div>
                        
                        {/* Avatar e Nome */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-sementes-primary/20 rounded-full flex items-center justify-center">
                            {ranking.usuario.avatarUrl ? (
                              <img 
                                src={ranking.usuario.avatarUrl} 
                                alt={ranking.usuario.nome}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <UserGroupIcon className="w-5 h-5 text-sementes-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{ranking.usuario.nome}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getNivelColor(ranking.usuario.nivel)}`}>
                              {getNivelLabel(ranking.usuario.nivel)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pontuação */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-sementes-primary">
                          {ranking.pontuacao.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-gray-400 text-sm">pontos</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-600">
                  <p className="text-center text-gray-400 text-sm">
                    O ranking é atualizado a cada ciclo. Mantenha-se ativo para subir no ranking!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

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
                    className="group relative overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedCriador(criador)
                      setShowModal(true)
                    }}
                  >
                    {/* Efeito de brilho no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sementes-primary/10 via-sementes-accent/10 to-sementes-primary/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                    
                    {/* Card principal */}
                    <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 hover:border-sementes-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-2xl flex items-center justify-center shadow-lg">
                              {criador.avatarUrl ? (
                                <img 
                                  src={criador.avatarUrl} 
                                  alt={criador.nome}
                                  className="w-16 h-16 rounded-2xl object-cover"
                                />
                              ) : (
                                <UserGroupIcon className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-sementes-primary transition-colors mb-1">
                              {criador.nome}
                            </h3>
                            <p className="text-gray-400 font-medium">{criador.categoria}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-3 py-2 rounded-2xl text-sm font-bold border-2 ${getNivelColor(criador.nivel)}`}>
                            {getNivelLabel(criador.nivel)}
                          </span>
                        </div>
                      </div>

                      {/* Informações */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center space-x-3 text-gray-300">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <MapPinIcon className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="font-medium">{criador.cidade}, {criador.estado}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-gray-300">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="font-medium">Desde {new Date(criador.dataCadastro).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl border border-blue-500/30">
                          <p className="text-blue-400 text-xs font-bold mb-1">Conteúdos</p>
                          <p className="text-white font-black text-lg">{criador.totalConteudos}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl border border-green-500/30">
                          <p className="text-green-400 text-xs font-bold mb-1">Visualizações</p>
                          <p className="text-white font-black text-lg">{(criador.totalVisualizacoes / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl border border-yellow-500/30">
                          <p className="text-yellow-400 text-xs font-bold mb-1">Sementes</p>
                          <p className="text-white font-black text-lg">{(criador.totalSementes / 1000).toFixed(0)}k</p>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorito(criador.id)
                          }}
                          className={`p-3 rounded-2xl transition-all duration-300 ${
                            favoritos.has(criador.id)
                              ? 'text-red-500 bg-red-500/20 border-2 border-red-500/50'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-500/20 border-2 border-transparent hover:border-red-500/50'
                          }`}
                        >
                          <HeartIcon className="w-5 h-5" />
                        </button>
                        
                        <button className="inline-flex items-center space-x-3 bg-gradient-to-r from-sementes-primary to-sementes-accent text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-sementes-primary/25 transition-all duration-300 hover:scale-105">
                          <EyeIcon className="w-5 h-5" />
                          <span>Ver Perfil</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Como Funciona o Sistema de Ciclos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="card">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🔄 Como Funciona o Sistema de Ciclos</h2>
                <p className="text-gray-400">Entenda como funciona nosso sistema de recompensas por ciclos</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-sementes-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ciclos Mensais</h3>
                  <p className="text-gray-400 text-sm">
                    Cada ciclo dura aproximadamente um mês. Os criadores acumulam pontos baseados em suas atividades e engajamento.
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-sementes-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ranking e Recompensas</h3>
                  <p className="text-gray-400 text-sm">
                    Ao final de cada ciclo, os melhores criadores recebem recompensas em sementes e sobem no ranking da plataforma.
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sementes e Crescimento</h3>
                  <p className="text-gray-400 text-sm">
                    As sementes podem ser usadas para desbloquear recursos, participar de eventos especiais e crescer na comunidade.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                <h4 className="text-white font-semibold mb-2">📊 Como Ganhar Pontos:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Criar conteúdo de qualidade e engajante</li>
                  <li>• Receber visualizações, curtidas e comentários</li>
                  <li>• Participar ativamente da comunidade</li>
                  <li>• Colaborar com outros criadores</li>
                  <li>• Manter consistência na produção de conteúdo</li>
                </ul>
              </div>
            </div>
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
