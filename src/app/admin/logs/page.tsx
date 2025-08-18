'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface LogSistema {
  id: string
  timestamp: Date
  nivel: 'info' | 'warning' | 'error' | 'success'
  categoria: 'usuario' | 'admin' | 'sistema' | 'financeiro' | 'seguranca'
  acao: string
  descricao: string
  usuario?: {
    id: string
    nome: string
    email: string
    tipo: 'usuario' | 'criador' | 'admin'
  }
  ip?: string
  userAgent?: string
  detalhes?: Record<string, any>
}

export default function AdminLogs() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<LogSistema[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [filterData, setFilterData] = useState('24h')
  const [selectedLog, setSelectedLog] = useState<LogSistema | null>(null)
  const [showModal, setShowModal] = useState(false)
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
            carregarLogs()
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

  const carregarLogs = async () => {
    try {
      // TODO: Implementar API para buscar logs
      setLogs([])
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar logs' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarLogs = () => {
    return logs.filter(log => {
      const matchSearch = log.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.usuario && log.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchNivel = filterNivel === 'todos' || log.nivel === filterNivel
      const matchCategoria = filterCategoria === 'todos' || log.categoria === filterCategoria
      
      return matchSearch && matchNivel && matchCategoria
    })
  }

  const verDetalhes = (log: LogSistema) => {
    setSelectedLog(log)
    setShowModal(true)
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'info': return 'bg-blue-500/20 text-blue-300'
      case 'warning': return 'bg-yellow-500/20 text-yellow-300'
      case 'error': return 'bg-red-500/20 text-red-300'
      case 'success': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'info': return InformationCircleIcon
      case 'warning': return ExclamationTriangleIcon
      case 'error': return XCircleIcon
      case 'success': return CheckCircleIcon
      default: return InformationCircleIcon
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'usuario': return 'bg-blue-500/20 text-blue-300'
      case 'admin': return 'bg-purple-500/20 text-purple-300'
      case 'sistema': return 'bg-gray-500/20 text-gray-300'
      case 'financeiro': return 'bg-green-500/20 text-green-300'
      case 'seguranca': return 'bg-orange-500/20 text-orange-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'usuario': return UserIcon
      case 'admin': return ShieldCheckIcon
      case 'sistema': return DocumentTextIcon
      case 'financeiro': return CurrencyDollarIcon
      case 'seguranca': return ShieldCheckIcon
      default: return DocumentTextIcon
    }
  }

  const getNivelText = (nivel: string) => {
    switch (nivel) {
      case 'info': return 'Informação'
      case 'warning': return 'Aviso'
      case 'error': return 'Erro'
      case 'success': return 'Sucesso'
      default: return nivel
    }
  }

  const getCategoriaText = (categoria: string) => {
    switch (categoria) {
      case 'usuario': return 'Usuário'
      case 'admin': return 'Admin'
      case 'sistema': return 'Sistema'
      case 'financeiro': return 'Financeiro'
      case 'seguranca': return 'Segurança'
      default: return categoria
    }
  }

  const formatarTimestamp = (timestamp: Date) => {
    const agora = new Date()
    const diff = agora.getTime() - timestamp.getTime()
    const minutos = Math.floor(diff / (1000 * 60))
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutos < 1) return 'Agora mesmo'
    if (minutos < 60) return `${minutos} min atrás`
    if (horas < 24) return `${horas}h atrás`
    if (dias < 7) return `${dias} dias atrás`
    
    return timestamp.toLocaleDateString('pt-BR') + ' ' + timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando logs...</p>
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
                  <DocumentTextIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Logs do Sistema
                </h1>
                <p className="text-gray-300">Visualize logs de atividades e eventos do sistema</p>
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
                    placeholder="Descrição, ação ou usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nível</label>
                <select
                  value={filterNivel}
                  onChange={(e) => setFilterNivel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="info">Informação</option>
                  <option value="warning">Aviso</option>
                  <option value="error">Erro</option>
                  <option value="success">Sucesso</option>
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
                  <option value="usuario">Usuário</option>
                  <option value="admin">Admin</option>
                  <option value="sistema">Sistema</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="seguranca">Segurança</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Período</label>
                <select
                  value={filterData}
                  onChange={(e) => setFilterData(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="24h">Últimas 24h</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Estatísticas Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total de Logs</p>
                  <p className="text-2xl font-bold text-white">{logs.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Erros</p>
                  <p className="text-2xl font-bold text-white">{logs.filter(log => log.nivel === 'error').length}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <XCircleIcon className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avisos</p>
                  <p className="text-2xl font-bold text-white">{logs.filter(log => log.nivel === 'warning').length}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Sucessos</p>
                  <p className="text-2xl font-bold text-white">{logs.filter(log => log.nivel === 'success').length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="space-y-4">
              {filtrarLogs().length === 0 ? (
                <div className="text-center text-gray-400 p-8">
                  <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log encontrado</p>
                </div>
              ) : filtrarLogs().map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => verDetalhes(log)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getNivelColor(log.nivel)}`}>
                      {React.createElement(getNivelIcon(log.nivel), { className: 'w-5 h-5' })}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(log.categoria)}`}>
                          {getCategoriaText(log.categoria)}
                        </span>
                        <span className="text-white font-medium">{log.acao}</span>
                        <span className="text-gray-400 text-sm">{formatarTimestamp(log.timestamp)}</span>
                      </div>
                      
                      <p className="text-gray-300 mb-2">{log.descricao}</p>
                      
                      {log.usuario && (
                        <div className="flex items-center space-x-2 text-sm">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">{log.usuario.nome}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{log.usuario.email}</span>
                          <span className="text-gray-500">•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.usuario.tipo === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                            log.usuario.tipo === 'criador' ? 'bg-sementes-primary/20 text-sementes-primary' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {log.usuario.tipo === 'admin' ? 'Admin' :
                             log.usuario.tipo === 'criador' ? 'Criador' : 'Usuário'}
                          </span>
                        </div>
                      )}
                      
                      {log.ip && (
                        <div className="flex items-center space-x-2 text-sm mt-2">
                          <span className="text-gray-500">IP: {log.ip}</span>
                          {log.userAgent && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-500 text-xs truncate max-w-xs">{log.userAgent}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          verDetalhes(log)
                        }}
                        className="btn-secondary flex items-center space-x-1 text-sm"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Ver</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Log</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações Básicas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelColor(selectedLog.nivel)}`}>
                        {getNivelText(selectedLog.nivel)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoriaColor(selectedLog.categoria)}`}>
                        {getCategoriaText(selectedLog.categoria)}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Ação:</p>
                      <p className="text-white font-medium">{selectedLog.acao}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Timestamp:</p>
                      <p className="text-white">{selectedLog.timestamp.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações Técnicas</h3>
                  <div className="space-y-3">
                    {selectedLog.ip && (
                      <div>
                        <p className="text-gray-400 text-sm">Endereço IP:</p>
                        <p className="text-white">{selectedLog.ip}</p>
                      </div>
                    )}
                    {selectedLog.userAgent && (
                      <div>
                        <p className="text-gray-400 text-sm">User Agent:</p>
                        <p className="text-white text-sm break-all">{selectedLog.userAgent}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300">{selectedLog.descricao}</p>
                </div>
              </div>

              {/* Informações do Usuário */}
              {selectedLog.usuario && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Usuário Relacionado</h3>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Nome:</p>
                        <p className="text-white">{selectedLog.usuario.nome}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email:</p>
                        <p className="text-white">{selectedLog.usuario.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Tipo:</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedLog.usuario.tipo === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                          selectedLog.usuario.tipo === 'criador' ? 'bg-sementes-primary/20 text-sementes-primary' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {selectedLog.usuario.tipo === 'admin' ? 'Admin' :
                           selectedLog.usuario.tipo === 'criador' ? 'Criador' : 'Usuário'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detalhes Adicionais */}
              {selectedLog.detalhes && Object.keys(selectedLog.detalhes).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Detalhes Adicionais</h3>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedLog.detalhes).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-gray-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</p>
                          <p className="text-white">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
