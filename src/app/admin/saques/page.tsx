'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BanknotesIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface SolicitacaoSaque {
  id: string
  usuario: {
    id: string
    nome: string
    email: string
    telefone?: string
    tipo: 'usuario' | 'criador'
    nivel?: number
  }
  valor: number
  metodoPagamento: 'pix' | 'transferencia' | 'cartao'
  dadosPagamento: {
    chavePix?: string
    banco?: string
    agencia?: string
    conta?: string
    tipoConta?: string
    numeroCartao?: string
    nomeCartao?: string
  }
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'processado'
  dataSolicitacao: Date
  dataProcessamento?: Date
  observacoes?: string
  motivoRejeicao?: string
}

export default function AdminSaquesPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saques, setSaques] = useState<SolicitacaoSaque[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [selectedSaque, setSelectedSaque] = useState<SolicitacaoSaque | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
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
            carregarSaques()
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

  const carregarSaques = async () => {
    try {
      // TODO: Implementar API para buscar saques
      // Por enquanto, usando dados mockados para desenvolvimento
      setSaques([
        {
          id: '1',
          usuario: {
            id: '1',
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            telefone: '(11) 99999-9999',
            tipo: 'usuario'
          },
          valor: 150.00,
          metodoPagamento: 'pix',
          dadosPagamento: {
            chavePix: 'joao@exemplo.com'
          },
          status: 'pendente',
          dataSolicitacao: new Date('2024-01-20 14:30:00'),
          observacoes: 'Solicitação de saque do saldo acumulado'
        },
        {
          id: '2',
          usuario: {
            id: '2',
            nome: 'Maria Santos',
            email: 'maria@exemplo.com',
            telefone: '(21) 88888-8888',
            tipo: 'criador',
            nivel: 3
          },
          valor: 450.75,
          metodoPagamento: 'transferencia',
          dadosPagamento: {
            banco: 'Banco do Brasil',
            agencia: '1234',
            conta: '12345-6',
            tipoConta: 'Corrente'
          },
          status: 'aprovado',
          dataSolicitacao: new Date('2024-01-19 10:15:00'),
          dataProcessamento: new Date('2024-01-20 09:45:00'),
          observacoes: 'Saque aprovado e processado'
        },
        {
          id: '3',
          usuario: {
            id: '3',
            nome: 'Pedro Costa',
            email: 'pedro@exemplo.com',
            telefone: '(31) 77777-7777',
            tipo: 'usuario'
          },
          valor: 75.50,
          metodoPagamento: 'cartao',
          dadosPagamento: {
            numeroCartao: '**** **** **** 1234',
            nomeCartao: 'PEDRO COSTA'
          },
          status: 'rejeitado',
          dataSolicitacao: new Date('2024-01-18 16:20:00'),
          dataProcessamento: new Date('2024-01-19 14:30:00'),
          observacoes: 'Solicitação rejeitada',
          motivoRejeicao: 'Saldo insuficiente para o valor solicitado'
        },
        {
          id: '4',
          usuario: {
            id: '4',
            nome: 'Ana Oliveira',
            email: 'ana@exemplo.com',
            telefone: '(41) 66666-6666',
            tipo: 'criador',
            nivel: 2
          },
          valor: 320.00,
          metodoPagamento: 'pix',
          dadosPagamento: {
            chavePix: 'ana.oliveira@exemplo.com'
          },
          status: 'processado',
          dataSolicitacao: new Date('2024-01-17 11:00:00'),
          dataProcessamento: new Date('2024-01-18 15:20:00'),
          observacoes: 'Saque processado com sucesso'
        }
      ])
    } catch (error) {
      console.error('Erro ao carregar saques:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar saques' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarSaques = () => {
    return saques.filter(saque => {
      const matchSearch = saque.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         saque.usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || saque.status === filterStatus
      const matchTipo = filterTipo === 'todos' || saque.usuario.tipo === filterTipo
      
      return matchSearch && matchStatus && matchTipo
    })
  }

  const aprovarSaque = async (saqueId: string) => {
    if (!observacoes.trim()) {
      setNotificacao({ tipo: 'erro', mensagem: 'Por favor, informe as observações para aprovação' })
      return
    }

    try {
      // TODO: Implementar API para aprovar saque
      setNotificacao({ tipo: 'sucesso', mensagem: 'Saque aprovado com sucesso!' })
      carregarSaques()
      setShowModal(false)
      setObservacoes('')
    } catch (error) {
      console.error('Erro ao aprovar saque:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao aprovar saque' })
    }
  }

  const rejeitarSaque = async (saqueId: string) => {
    if (!motivoRejeicao.trim()) {
      setNotificacao({ tipo: 'erro', mensagem: 'Por favor, informe o motivo da rejeição' })
      return
    }

    try {
      // TODO: Implementar API para rejeitar saque
      setNotificacao({ tipo: 'sucesso', mensagem: 'Saque rejeitado com sucesso!' })
      carregarSaques()
      setShowModal(false)
      setMotivoRejeicao('')
    } catch (error) {
      console.error('Erro ao rejeitar saque:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao rejeitar saque' })
    }
  }

  const processarSaque = async (saqueId: string) => {
    try {
      // TODO: Implementar API para processar saque
      setNotificacao({ tipo: 'sucesso', mensagem: 'Saque processado com sucesso!' })
      carregarSaques()
    } catch (error) {
      console.error('Erro ao processar saque:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao processar saque' })
    }
  }

  const verDetalhes = (saque: SolicitacaoSaque) => {
    setSelectedSaque(saque)
    setObservacoes(saque.observacoes || '')
    setMotivoRejeicao(saque.motivoRejeicao || '')
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-300'
      case 'aprovado': return 'bg-blue-500/20 text-blue-300'
      case 'rejeitado': return 'bg-red-500/20 text-red-300'
      case 'processado': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'aprovado': return 'Aprovado'
      case 'rejeitado': return 'Rejeitado'
      case 'processado': return 'Processado'
      default: return status
    }
  }

  const getMetodoPagamentoText = (metodo: string) => {
    switch (metodo) {
      case 'pix': return 'PIX'
      case 'transferencia': return 'Transferência'
      case 'cartao': return 'Cartão'
      default: return metodo
    }
  }

  const getTipoUsuarioText = (tipo: string) => {
    switch (tipo) {
      case 'usuario': return 'Usuário'
      case 'criador': return 'Criador'
      default: return tipo
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando saques...</p>
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
                  <BanknotesIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Saques
                </h1>
                <p className="text-gray-300">Gerencie solicitações de saque dos usuários e criadores</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Buscar</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nome ou email..."
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
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="processado">Processado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="usuario">Usuários</option>
                  <option value="criador">Criadores</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tabela de Saques */}
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
                    <th className="text-left p-3 text-gray-400 font-medium">Solicitante</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Valor</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Método</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Data</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarSaques().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 p-8">
                        <BanknotesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum saque encontrado</p>
                      </td>
                    </tr>
                  ) : filtrarSaques().map((saque) => (
                    <tr key={saque.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                            {saque.usuario.tipo === 'criador' ? (
                              <BuildingOfficeIcon className="w-6 h-6 text-sementes-primary" />
                            ) : (
                              <UserIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{saque.usuario.nome}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">{saque.usuario.email}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                saque.usuario.tipo === 'criador' ? 'bg-sementes-primary/20 text-sementes-primary' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {getTipoUsuarioText(saque.usuario.tipo)}
                                {saque.usuario.tipo === 'criador' && saque.usuario.nivel && ` N${saque.usuario.nivel}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                          <span className="text-white font-medium">R$ {saque.valor.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {saque.metodoPagamento === 'pix' && <CreditCardIcon className="w-4 h-4 text-green-400" />}
                          {saque.metodoPagamento === 'transferencia' && <BanknotesIcon className="w-4 h-4 text-blue-400" />}
                          {saque.metodoPagamento === 'cartao' && <CreditCardIcon className="w-4 h-4 text-purple-400" />}
                          <span className="text-gray-300">{getMetodoPagamentoText(saque.metodoPagamento)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(saque.status)}`}>
                          {getStatusText(saque.status)}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300 text-sm">
                        {new Date(saque.dataSolicitacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => verDetalhes(saque)}
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
      {showModal && selectedSaque && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Saque</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações do Solicitante</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedSaque.usuario.nome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{selectedSaque.usuario.email}</span>
                    </div>
                    {selectedSaque.usuario.telefone && (
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{selectedSaque.usuario.telefone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedSaque.usuario.tipo === 'criador' ? 'bg-sementes-primary/20 text-sementes-primary' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {getTipoUsuarioText(selectedSaque.usuario.tipo)}
                        {selectedSaque.usuario.tipo === 'criador' && selectedSaque.usuario.nivel && ` Nível ${selectedSaque.usuario.nivel}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações do Saque</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                      <span className="text-white font-medium text-lg">R$ {selectedSaque.valor.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-white">{getMetodoPagamentoText(selectedSaque.metodoPagamento)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSaque.status)}`}>
                        {getStatusText(selectedSaque.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white">
                        Solicitado em {new Date(selectedSaque.dataSolicitacao).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados de Pagamento */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Dados de Pagamento</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  {selectedSaque.metodoPagamento === 'pix' && (
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Chave PIX:</p>
                      <p className="text-white font-medium">{selectedSaque.dadosPagamento.chavePix}</p>
                    </div>
                  )}
                  
                  {selectedSaque.metodoPagamento === 'transferencia' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Banco:</p>
                        <p className="text-white">{selectedSaque.dadosPagamento.banco}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Agência:</p>
                        <p className="text-white">{selectedSaque.dadosPagamento.agencia}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Conta:</p>
                        <p className="text-white">{selectedSaque.dadosPagamento.conta}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Tipo:</p>
                        <p className="text-white">{selectedSaque.dadosPagamento.tipoConta}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedSaque.metodoPagamento === 'cartao' && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-sm">Número do Cartão:</p>
                        <p className="text-white">{selectedSaque.dadosPagamento.numeroCartao}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Nome no Cartão:</p>
                        <p className="text-white">{selectedSaque.dadosPagamento.nomeCartao}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              {selectedSaque.observacoes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Observações</h3>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-300">{selectedSaque.observacoes}</p>
                  </div>
                </div>
              )}

              {/* Motivo da Rejeição */}
              {selectedSaque.motivoRejeicao && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Motivo da Rejeição</h3>
                  <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg">
                    <p className="text-red-300">{selectedSaque.motivoRejeicao}</p>
                  </div>
                </div>
              )}

              {/* Ações */}
              {selectedSaque.status === 'pendente' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Observações</h3>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Digite suas observações..."
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Motivo da Rejeição</h3>
                    <textarea
                      value={motivoRejeicao}
                      onChange={(e) => setMotivoRejeicao(e.target.value)}
                      placeholder="Digite o motivo da rejeição (se aplicável)..."
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => aprovarSaque(selectedSaque.id)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Aprovar</span>
                    </button>
                    <button
                      onClick={() => rejeitarSaque(selectedSaque.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      <span>Rejeitar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Ações para saques aprovados */}
              {selectedSaque.status === 'aprovado' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => processarSaque(selectedSaque.id)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <BanknotesIcon className="w-5 h-5" />
                    <span>Processar Pagamento</span>
                  </button>
                </div>
              )}

              {/* Ações para saques processados */}
              {selectedSaque.status === 'processado' && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 text-center font-medium">
                    ✓ Saque processado com sucesso em {selectedSaque.dataProcessamento && new Date(selectedSaque.dataProcessamento).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
