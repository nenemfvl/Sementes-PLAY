'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  TagIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'

interface TicketSuporte {
  id: string
  usuario: {
    id: string
    nome: string
    email: string
    telefone?: string
  }
  assunto: string
  mensagem: string
  categoria: 'tecnico' | 'financeiro' | 'conta' | 'outros'
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  status: 'aberto' | 'em_andamento' | 'respondido' | 'fechado'
  dataCriacao: Date
  ultimaAtualizacao: Date
  respostas: RespostaTicket[]
}

interface RespostaTicket {
  id: string
  autor: 'usuario' | 'admin'
  nomeAutor: string
  mensagem: string
  data: Date
}

export default function AdminSuporte() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<TicketSuporte[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterPrioridade, setFilterPrioridade] = useState('todos')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [selectedTicket, setSelectedTicket] = useState<TicketSuporte | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [novaResposta, setNovaResposta] = useState('')
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
            carregarTickets()
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

  const carregarTickets = async () => {
    try {
      // TODO: Implementar API para buscar tickets
      setTickets([])
    } catch (error) {
      console.error('Erro ao carregar tickets:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar tickets' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarTickets = () => {
    return tickets.filter(ticket => {
      const matchSearch = ticket.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || ticket.status === filterStatus
      const matchPrioridade = filterPrioridade === 'todos' || ticket.prioridade === filterPrioridade
      const matchCategoria = filterCategoria === 'todos' || ticket.categoria === filterCategoria
      
      return matchSearch && matchStatus && matchPrioridade && matchCategoria
    })
  }

  const alterarStatus = async (ticketId: string, novoStatus: 'aberto' | 'em_andamento' | 'respondido' | 'fechado') => {
    try {
      // TODO: Implementar API para alterar status
      setNotificacao({ tipo: 'sucesso', mensagem: `Status alterado para ${novoStatus} com sucesso!` })
      carregarTickets()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao alterar status' })
    }
  }

  const responderTicket = async (ticketId: string) => {
    if (!novaResposta.trim()) {
      setNotificacao({ tipo: 'erro', mensagem: 'Por favor, digite uma resposta' })
      return
    }

    try {
      // TODO: Implementar API para responder ticket
      setNotificacao({ tipo: 'sucesso', mensagem: 'Resposta enviada com sucesso!' })
      setNovaResposta('')
      carregarTickets()
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao enviar resposta' })
    }
  }

  const verDetalhes = (ticket: TicketSuporte) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-blue-500/20 text-blue-300'
      case 'em_andamento': return 'bg-yellow-500/20 text-yellow-300'
      case 'respondido': return 'bg-green-500/20 text-green-300'
      case 'fechado': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'bg-green-500/20 text-green-300'
      case 'media': return 'bg-yellow-500/20 text-yellow-300'
      case 'alta': return 'bg-orange-500/20 text-orange-300'
      case 'urgente': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'tecnico': return 'bg-purple-500/20 text-purple-300'
      case 'financeiro': return 'bg-green-500/20 text-green-300'
      case 'conta': return 'bg-blue-500/20 text-blue-300'
      case 'outros': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aberto': return 'Aberto'
      case 'em_andamento': return 'Em Andamento'
      case 'respondido': return 'Respondido'
      case 'fechado': return 'Fechado'
      default: return status
    }
  }

  const getPrioridadeText = (prioridade: string) => {
    switch (prioridade) {
      case 'baixa': return 'Baixa'
      case 'media': return 'Média'
      case 'alta': return 'Alta'
      case 'urgente': return 'Urgente'
      default: return prioridade
    }
  }

  const getCategoriaText = (categoria: string) => {
    switch (categoria) {
      case 'tecnico': return 'Técnico'
      case 'financeiro': return 'Financeiro'
      case 'conta': return 'Conta'
      case 'outros': return 'Outros'
      default: return categoria
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando tickets...</p>
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
                  <ChatBubbleLeftRightIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Suporte
                </h1>
                <p className="text-gray-300">Gerencie tickets de suporte dos usuários</p>
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
                    placeholder="Assunto, nome ou email..."
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
                  <option value="aberto">Aberto</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="respondido">Respondido</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prioridade</label>
                <select
                  value={filterPrioridade}
                  onChange={(e) => setFilterPrioridade(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todas</option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
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
                  <option value="tecnico">Técnico</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="conta">Conta</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tabela de Tickets */}
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
                    <th className="text-left p-3 text-gray-400 font-medium">Usuário</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Assunto</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Categoria</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Prioridade</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Data</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarTickets().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-400 p-8">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum ticket encontrado</p>
                      </td>
                    </tr>
                  ) : filtrarTickets().map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="text-white font-medium">{ticket.usuario.nome}</p>
                          <p className="text-gray-400 text-sm">{ticket.usuario.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-white font-medium">{ticket.assunto}</p>
                        <p className="text-gray-400 text-sm line-clamp-2">{ticket.mensagem}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoriaColor(ticket.categoria)}`}>
                          {getCategoriaText(ticket.categoria)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(ticket.prioridade)}`}>
                          {getPrioridadeText(ticket.prioridade)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300 text-sm">
                        {new Date(ticket.dataCriacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => verDetalhes(ticket)}
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
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Ticket</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações do Usuário</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedTicket.usuario.nome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedTicket.usuario.email}</span>
                    </div>
                    {selectedTicket.usuario.telefone && (
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{selectedTicket.usuario.telefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações do Ticket</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <TagIcon className="w-4 h-4 text-gray-400" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoriaColor(selectedTicket.categoria)}`}>
                        {getCategoriaText(selectedTicket.categoria)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPrioridadeColor(selectedTicket.prioridade)}`}>
                        {getPrioridadeText(selectedTicket.prioridade)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicket.status)}`}>
                        {getStatusText(selectedTicket.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white">
                        Criado em {new Date(selectedTicket.dataCriacao).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Assunto</h3>
                <p className="text-white font-medium text-lg">{selectedTicket.assunto}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Mensagem Original</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300">{selectedTicket.mensagem}</p>
                </div>
              </div>

              {/* Histórico de Respostas */}
              {selectedTicket.respostas.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Histórico de Respostas</h3>
                  <div className="space-y-4">
                    {selectedTicket.respostas.map((resposta, index) => (
                      <div key={resposta.id} className={`p-4 rounded-lg ${
                        resposta.autor === 'admin' ? 'bg-sementes-primary/20 border border-sementes-primary/30' : 'bg-gray-700'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${
                            resposta.autor === 'admin' ? 'text-sementes-primary' : 'text-white'
                          }`}>
                            {resposta.nomeAutor}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(resposta.data).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-gray-300">{resposta.mensagem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nova Resposta */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Responder Ticket</h3>
                <textarea
                  value={novaResposta}
                  onChange={(e) => setNovaResposta(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Ações */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => alterarStatus(selectedTicket.id, 'aberto')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedTicket.status === 'aberto' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Aberto
                  </button>
                  <button
                    onClick={() => alterarStatus(selectedTicket.id, 'em_andamento')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedTicket.status === 'em_andamento' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-600 hover:bg-yellow-600 text-white'
                    }`}
                  >
                    Em Andamento
                  </button>
                  <button
                    onClick={() => alterarStatus(selectedTicket.id, 'respondido')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedTicket.status === 'respondido' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 hover:bg-green-600 text-white'
                    }`}
                  >
                    Respondido
                  </button>
                  <button
                    onClick={() => alterarStatus(selectedTicket.id, 'fechado')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedTicket.status === 'fechado' 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    Fechado
                  </button>
                </div>

                <button
                  onClick={() => responderTicket(selectedTicket.id)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Enviar Resposta</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
