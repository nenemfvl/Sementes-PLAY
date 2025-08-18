'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Criador {
  id: string
  nome: string
  email: string
  avatarUrl?: string
  nivel: number
  categoria: string
  status: 'ativo' | 'suspenso' | 'banido'
  dataCadastro: Date
  ultimaAtividade: Date
  totalConteudos: number
  totalVisualizacoes: number
  totalGanhos: number
  biografia: string
  redesSociais: string[]
  especialidades: string[]
}

export default function AdminCriadores() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [criadores, setCriadores] = useState<Criador[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [selectedCriador, setSelectedCriador] = useState<Criador | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCriador, setEditingCriador] = useState<Partial<Criador> | null>(null)
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info', mensagem: string } | null>(null)

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          // Verificar se é admin (nivel >= 5)
          if (dadosUsuario.nivel && dadosUsuario.nivel >= 5) {
            setUsuario(dadosUsuario)
            setIsAuthenticated(true)
            // Carregar dados após autenticação
            carregarCriadores()
          } else {
            // Não é admin, redirecionar
            window.location.href = '/'
          }
        } catch (error) {
          console.error('Erro ao ler dados do usuário:', error)
          localStorage.removeItem('usuario-dados')
          window.location.href = '/login'
        }
      } else {
        // Não autenticado, redirecionar
        window.location.href = '/login'
      }
      setLoading(false)
    }
    verificarAutenticacao()
  }, [])

  const carregarCriadores = async () => {
    try {
      // TODO: Implementar API para buscar criadores
      setCriadores([])
    } catch (error) {
      console.error('Erro ao carregar criadores:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar criadores' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarCriadores = () => {
    return criadores.filter(criador => {
      const matchSearch = criador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criador.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || criador.status === filterStatus
      const matchCategoria = filterCategoria === 'todos' || criador.categoria === filterCategoria
      const matchNivel = filterNivel === 'todos' || criador.nivel.toString() === filterNivel
      
      return matchSearch && matchStatus && matchCategoria && matchNivel
    })
  }

  const alterarStatus = async (criadorId: string, novoStatus: 'ativo' | 'suspenso' | 'banido') => {
    try {
      // TODO: Implementar API para alterar status
      setNotificacao({ tipo: 'sucesso', mensagem: `Status alterado para ${novoStatus} com sucesso!` })
      carregarCriadores()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao alterar status' })
    }
  }

  const alterarNivel = async (criadorId: string, novoNivel: number) => {
    try {
      // TODO: Implementar API para alterar nível
      setNotificacao({ tipo: 'sucesso', mensagem: `Nível alterado para ${novoNivel} com sucesso!` })
      carregarCriadores()
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao alterar nível:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao alterar nível' })
    }
  }

  const verDetalhes = (criador: Criador) => {
    setSelectedCriador(criador)
    setEditingCriador({ ...criador })
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500/20 text-green-300'
      case 'suspenso': return 'bg-yellow-500/20 text-yellow-300'
      case 'banido': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getNivelColor = (nivel: number) => {
    switch (nivel) {
      case 1: return 'bg-gray-500/20 text-gray-300'
      case 2: return 'bg-blue-500/20 text-blue-300'
      case 3: return 'bg-purple-500/20 text-purple-300'
      case 4: return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-gray-500/20 text-gray-300'
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
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <UserGroupIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Gerenciar Criadores
                </h1>
                <p className="text-gray-300">Visualize e gerencie criadores existentes</p>
              </div>
            </div>
          </motion.div>

          {/* Notificação */}
          {notificacao && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                notificacao.tipo === 'sucesso' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                notificacao.tipo === 'erro' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {notificacao.mensagem}
              <button
                onClick={() => setNotificacao(null)}
                className="float-right text-gray-400 hover:text-white"
              >
                ×
              </button>
            </motion.div>
          )}

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Buscar</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nome, email ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="suspenso">Suspenso</option>
                  <option value="banido">Banido</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Categoria</label>
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todas</option>
                  <option value="Veículos">Veículos</option>
                  <option value="Scripts">Scripts</option>
                  <option value="Maps">Maps</option>
                  <option value="Mods">Mods</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nível</label>
                <select
                  value={filterNivel}
                  onChange={(e) => setFilterNivel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="1">Nível 1</option>
                  <option value="2">Nível 2</option>
                  <option value="3">Nível 3</option>
                  <option value="4">Nível 4</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tabela de Criadores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 text-gray-400 font-medium">Criador</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Categoria</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Nível</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Estatísticas</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarCriadores().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 p-8">
                        <UserGroupIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum criador encontrado</p>
                      </td>
                    </tr>
                  ) : filtrarCriadores().map((criador) => (
                    <tr key={criador.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                            {criador.avatarUrl ? (
                              <img src={criador.avatarUrl} alt={criador.nome} className="w-10 h-10 rounded-full" />
                            ) : (
                              <UserGroupIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{criador.nome}</p>
                            <p className="text-gray-400 text-sm">{criador.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-300">{criador.categoria}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelColor(criador.nivel)}`}>
                          Nível {criador.nivel}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(criador.status)}`}>
                          {criador.status === 'ativo' ? 'Ativo' :
                           criador.status === 'suspenso' ? 'Suspenso' : 'Banido'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="flex items-center space-x-1 mb-1">
                            <ChartBarIcon className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">{criador.totalConteudos} conteúdos</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-1">
                            <EyeIcon className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">{criador.totalVisualizacoes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">R$ {criador.totalGanhos.toFixed(2)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => verDetalhes(criador)}
                            className="btn-secondary flex items-center space-x-1 text-sm"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>Ver</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedCriador && editingCriador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Criador</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Nome</label>
                      <p className="text-white">{selectedCriador.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Email</label>
                      <p className="text-white">{selectedCriador.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Data de Cadastro</label>
                      <p className="text-white">{new Date(selectedCriador.dataCadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Última Atividade</label>
                      <p className="text-white">{new Date(selectedCriador.ultimaAtividade).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações do Perfil</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Categoria</label>
                      <p className="text-white">{selectedCriador.categoria}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Nível Atual</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(selectedCriador.nivel)}`}>
                        Nível {selectedCriador.nivel}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCriador.status)}`}>
                        {selectedCriador.status === 'ativo' ? 'Ativo' :
                         selectedCriador.status === 'suspenso' ? 'Suspenso' : 'Banido'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Biografia</h3>
                <p className="text-gray-300 bg-gray-700 p-4 rounded-lg">{selectedCriador.biografia}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCriador.especialidades.map((especialidade, index) => (
                    <span key={index} className="bg-sementes-primary/20 text-sementes-primary px-3 py-1 rounded-full text-sm">
                      {especialidade}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Redes Sociais</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCriador.redesSociais.map((rede, index) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {rede}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Estatísticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <ChartBarIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{selectedCriador.totalConteudos}</p>
                    <p className="text-gray-400 text-sm">Total de Conteúdos</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <EyeIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{selectedCriador.totalVisualizacoes.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">Total de Visualizações</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">R$ {selectedCriador.totalGanhos.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">Total de Ganhos</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ações Administrativas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Alterar Status</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => alterarStatus(selectedCriador.id, 'ativo')}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCriador.status === 'ativo' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 hover:bg-green-600 text-white'
                        }`}
                      >
                        Ativo
                      </button>
                      <button
                        onClick={() => alterarStatus(selectedCriador.id, 'suspenso')}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCriador.status === 'suspenso' 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-600 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        Suspenso
                      </button>
                      <button
                        onClick={() => alterarStatus(selectedCriador.id, 'banido')}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCriador.status === 'banido' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-600 hover:bg-red-600 text-white'
                        }`}
                      >
                        Banido
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Alterar Nível</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4].map((nivel) => (
                        <button
                          key={nivel}
                          onClick={() => alterarNivel(selectedCriador.id, nivel)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCriador.nivel === nivel 
                              ? 'bg-sementes-primary text-white' 
                              : 'bg-gray-600 hover:bg-sementes-primary text-white'
                          }`}
                        >
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
