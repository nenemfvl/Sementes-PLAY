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
  CalendarIcon,
  TrophyIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { FaYoutube, FaTwitch, FaInstagram, FaTiktok } from 'react-icons/fa'

interface Usuario {
  id: string
  nome: string
  email: string
  avatarUrl?: string
  nivel: string
  categoria?: string
  cidade: string
  estado: string
  totalConteudos: number
  totalVisualizacoes: number
  totalCurtidas: number
  totalSementes: number
  dataCadastro: string
  status: 'ativo' | 'inativo' | 'suspenso'
  tipo: 'usuario' | 'criador' | 'parceiro'
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

export default function RankingPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
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
          carregarUsuarios()
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
      carregarDadosCiclo()
      setLoading(false)
    }
    verificarAutenticacao()
  }, [])

  const carregarDadosCiclo = async () => {
    try {
      const response = await fetch('/api/ciclos')
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setDadosCiclo(data.dados)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do ciclo:', error)
    }
  }

  const carregarUsuarios = async () => {
    try {
      // TODO: Implementar API para buscar usuários
      setUsuarios([])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    }
  }

  // Carregar favoritos do localStorage
  useEffect(() => {
    const favoritosSalvos = localStorage.getItem('rankingFavoritos')
    if (favoritosSalvos) {
      try {
        const favoritosArray = JSON.parse(favoritosSalvos)
        setFavoritos(new Set(favoritosArray))
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error)
        localStorage.removeItem('rankingFavoritos')
      }
    }
  }, [])

  const toggleFavorito = (usuarioId: string) => {
    setFavoritos(prev => {
      const novosFavoritos = new Set(prev)
      if (novosFavoritos.has(usuarioId)) {
        novosFavoritos.delete(usuarioId)
      } else {
        novosFavoritos.add(usuarioId)
      }
      localStorage.setItem('rankingFavoritos', JSON.stringify(Array.from(novosFavoritos)))
      return novosFavoritos
    })
  }

  const tipos = ['todos', 'usuario', 'criador', 'parceiro']
  const niveis = ['todos', 'usuario', 'criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo', 'parceiro']
  const estados = ['todos', ...Array.from(new Set(usuarios.map(u => u.estado)))]

  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.status === 'ativo' &&
    (searchTerm === '' || usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) || (usuario.categoria && usuario.categoria.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterTipo === 'todos' || usuario.tipo === filterTipo) &&
    (filterNivel === 'todos' || usuario.nivel === filterNivel) &&
    (filterEstado === 'todos' || usuario.estado === filterEstado)
  )

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'criador-supremo': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'criador-parceiro': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'criador-comum': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'criador-iniciante': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'parceiro': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'usuario': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'criador-supremo': return 'Supremo'
      case 'criador-parceiro': return 'Parceiro'
      case 'criador-comum': return 'Comum'
      case 'criador-iniciante': return 'Iniciante'
      case 'parceiro': return 'Parceiro'
      case 'usuario': return 'Usuário'
      default: return nivel
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'criador': return 'Criador'
      case 'parceiro': return 'Parceiro'
      case 'usuario': return 'Usuário'
      default: return tipo
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando ranking...</p>
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
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-600/20 to-yellow-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <TrophyIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Ranking Geral
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Descubra os melhores criadores, parceiros e usuários da nossa comunidade. 
                  Acompanhe o ranking e inspire-se para crescer!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Informações do Ciclo Atual */}
          {dadosCiclo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-2xl border border-yellow-500/30 p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Status do Ciclo */}
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">🔄</span>
                        <span className="text-gray-400 text-sm">Ciclo Atual</span>
                      </div>
                      <div className="text-4xl font-bold text-yellow-500">
                        {dadosCiclo.ciclo}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">🏆</span>
                        <span className="text-gray-400 text-sm">Season</span>
                      </div>
                      <div className="text-4xl font-bold text-amber-600">
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

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-600/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Barra de Busca */}
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative">
                        <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                        <input
                          type="text"
                          placeholder="🔍 Buscar por nome ou categoria..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-14 pr-6 py-4 bg-gray-800/80 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-4">
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                      <div className="relative flex items-center space-x-3 bg-gray-800/80 border border-gray-600/50 rounded-2xl px-4 py-3 hover:border-blue-500/50 transition-all duration-300">
                        <UsersIcon className="w-5 h-5 text-blue-400" />
                        <select
                          value={filterTipo}
                          onChange={(e) => setFilterTipo(e.target.value)}
                          className="bg-transparent text-white focus:outline-none cursor-pointer"
                        >
                          {tipos.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo === 'todos' ? '👥 Todos os Tipos' : getTipoLabel(tipo)}
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

          {/* Lista de Usuários */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4 mb-12"
          >
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-400">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuariosFiltrados.map((usuario, index) => (
                  <motion.div
                    key={usuario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedUsuario(usuario)
                      setShowModal(true)
                    }}
                  >
                    {/* Efeito de brilho no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-600/10 to-yellow-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                    
                    {/* Card principal */}
                    <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-6 hover:border-yellow-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                              {usuario.avatarUrl ? (
                                <img 
                                  src={usuario.avatarUrl} 
                                  alt={usuario.nome}
                                  className="w-16 h-16 rounded-2xl object-cover"
                                />
                              ) : (
                                <UserGroupIcon className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors mb-1">
                              {usuario.nome}
                            </h3>
                            <p className="text-gray-400 font-medium">{usuario.categoria || 'Sem categoria'}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-3 py-2 rounded-2xl text-sm font-bold border-2 ${getNivelColor(usuario.nivel)}`}>
                            {getNivelLabel(usuario.nivel)}
                          </span>
                        </div>
                      </div>

                      {/* Tipo de Usuário */}
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium border border-blue-500/30">
                          {getTipoLabel(usuario.tipo)}
                        </span>
                      </div>

                      {/* Informações */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center space-x-3 text-gray-300">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <MapPinIcon className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="font-medium">{usuario.cidade}, {usuario.estado}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-gray-300">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="font-medium">Desde {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl border border-blue-500/30">
                          <p className="text-blue-400 text-xs font-bold mb-1">Conteúdos</p>
                          <p className="text-white font-black text-lg">{usuario.totalConteudos}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl border border-green-500/30">
                          <p className="text-green-400 text-xs font-bold mb-1">Visualizações</p>
                          <p className="text-white font-black text-lg">{(usuario.totalVisualizacoes / 1000).toFixed(0)}k</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl border border-yellow-500/30">
                          <p className="text-yellow-400 text-xs font-bold mb-1">Sementes</p>
                          <p className="text-white font-black text-lg">{(usuario.totalSementes / 1000).toFixed(0)}k</p>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorito(usuario.id)
                          }}
                          className={`p-3 rounded-2xl transition-all duration-300 ${
                            favoritos.has(usuario.id)
                              ? 'text-red-500 bg-red-500/20 border-2 border-red-500/50'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-500/20 border-2 border-transparent hover:border-red-500/50'
                          }`}
                        >
                          <HeartIcon className="w-5 h-5" />
                        </button>
                        
                        <button className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105">
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
        </div>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {showModal && selectedUsuario && (
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
                  {selectedUsuario.nome}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Informações do Usuário */}
              <div className="space-y-6">
                {/* Nível e Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getNivelColor(selectedUsuario.nivel)}`}>
                    {getNivelLabel(selectedUsuario.nivel)}
                  </span>
                  <span className="text-green-400 text-sm">● Ativo</span>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium border border-blue-500/30">
                    {getTipoLabel(selectedUsuario.tipo)}
                  </span>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
                    <p className="text-white">{selectedUsuario.categoria || 'Sem categoria'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Localização</label>
                    <p className="text-white">{selectedUsuario.cidade}, {selectedUsuario.estado}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white">{selectedUsuario.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data de Cadastro</label>
                    <p className="text-white">{new Date(selectedUsuario.dataCadastro).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Total de Conteúdos</p>
                    <p className="text-white font-bold text-lg">{selectedUsuario.totalConteudos}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Visualizações</p>
                    <p className="text-white font-bold text-lg">{(selectedUsuario.totalVisualizacoes / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Curtidas</p>
                    <p className="text-white font-bold text-lg">{(selectedUsuario.totalCurtidas / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Sementes</p>
                    <p className="text-white font-bold text-lg">{(selectedUsuario.totalSementes / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                {/* Redes Sociais */}
                {selectedUsuario.redesSociais && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Redes Sociais</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsuario.redesSociais.youtube && (
                        <a
                          href={selectedUsuario.redesSociais.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaYoutube className="w-4 h-4" />
                          <span>YouTube</span>
                        </a>
                      )}
                      {selectedUsuario.redesSociais.twitch && (
                        <a
                          href={selectedUsuario.redesSociais.twitch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaTwitch className="w-4 h-4" />
                          <span>Twitch</span>
                        </a>
                      )}
                      {selectedUsuario.redesSociais.instagram && (
                        <a
                          href={selectedUsuario.redesSociais.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <FaInstagram className="w-4 h-4" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {selectedUsuario.redesSociais.tiktok && (
                        <a
                          href={selectedUsuario.redesSociais.tiktok}
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
