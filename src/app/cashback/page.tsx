'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CodigoCashback {
  id: string
  codigo: string
  descricao: string
  valor: number
  tipo: 'percentual' | 'fixo'
  valorMinimo: number
  valorMaximo: number
  dataInicio: Date
  dataFim: Date
  status: 'ativo' | 'inativo' | 'expirado'
  categoria: 'geral' | 'criador' | 'especial' | 'parceiro'
  criadorId?: string
  criadorNome?: string
  usos: number
  maxUsos: number
  icone: string
  cor: string
}

interface HistoricoCashback {
  id: string
  codigo: string
  valor: number
  dataResgate: Date
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'processado'
  observacao?: string
  criadorNome?: string
}

interface SolicitacaoPendente {
  id: string
  parceiroNome: string
  valorCompra: number
  valorCashback: number
  dataCompra: Date
  status: string
  comprovanteUrl?: string
  repasse?: {
    id: string
    status: string
    dataRepasse: Date
    comprovanteUrl?: string
  }
}

interface EstatisticasCashback {
  totalResgatado: number
  totalPendente: number
  codigosUsados: number
  economiaTotal: number
  resgatesMes: number
  mediaPorResgate: number
}

export default function CashbackPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [codigos, setCodigos] = useState<CodigoCashback[]>([])
  const [historico, setHistorico] = useState<HistoricoCashback[]>([])
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<SolicitacaoPendente[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasCashback | null>(null)
  const [activeTab, setActiveTab] = useState('disponiveis')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('todas')
  const [selectedCodigo, setSelectedCodigo] = useState<CodigoCashback | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [resgateLoading, setResgateLoading] = useState(false)

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          setUsuario(dadosUsuario)
          setIsAuthenticated(true)
          // Carregar dados após autenticação
          carregarDados()
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

  const carregarDados = async () => {
    try {
      // TODO: Implementar APIs reais
      // Por enquanto, usando dados mockados
      setCodigos([
        {
          id: '1',
          codigo: 'sementesplay10',
          descricao: 'Cupom principal para compras em parceiros',
          valor: 10,
          tipo: 'percentual',
          valorMinimo: 50,
          valorMaximo: 1000,
          dataInicio: new Date('2024-01-01'),
          dataFim: new Date('2024-12-31'),
          status: 'ativo',
          categoria: 'parceiro',
          usos: 1250,
          maxUsos: 10000,
          icone: '🎯',
          cor: 'green'
        }
      ])

      setHistorico([
        {
          id: '1',
          codigo: 'sementesplay10',
          valor: 25.50,
          dataResgate: new Date('2024-01-15'),
          status: 'aprovado',
          observacao: 'Compra aprovada - R$ 510,00'
        }
      ])

      setSolicitacoesPendentes([
        {
          id: '1',
          parceiroNome: 'João Silva - São Paulo',
          valorCompra: 510.00,
          valorCashback: 25.50,
          dataCompra: new Date('2024-01-15'),
          status: 'pendente'
        }
      ])

      setEstatisticas({
        totalResgatado: 1250.75,
        totalPendente: 89.50,
        codigosUsados: 45,
        economiaTotal: 1340.25,
        resgatesMes: 12,
        mediaPorResgate: 28.50
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'disponiveis', label: 'Códigos Disponíveis', icon: GiftIcon, count: codigos.filter(c => c.status === 'ativo').length },
    { id: 'historico', label: 'Histórico', icon: ClockIcon, count: historico.length },
    { id: 'pendentes', label: 'Solicitações Pendentes', icon: ExclamationTriangleIcon, count: solicitacoesPendentes.length }
  ]

  const categorias = [
    { id: 'todas', label: 'Todas as Categorias' },
    { id: 'geral', label: 'Geral' },
    { id: 'criador', label: 'Criador' },
    { id: 'especial', label: 'Especial' },
    { id: 'parceiro', label: 'Parceiro' }
  ]

  const codigosDisponiveis = codigos.filter(codigo => 
    codigo.status === 'ativo' &&
    (searchTerm === '' || codigo.descricao.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategoria === 'todas' || codigo.categoria === selectedCategoria)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'border-green-500 bg-green-500/10'
      case 'inativo': return 'border-gray-500 bg-gray-500/10'
      case 'expirado': return 'border-red-500 bg-red-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
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

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500/20 text-yellow-300'
      case 'aprovado': return 'bg-green-500/20 text-green-300'
      case 'rejeitado': return 'bg-red-500/20 text-red-300'
      case 'processado': return 'bg-blue-500/20 text-blue-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando cashback...</p>
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
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors mr-4"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-4xl font-bold text-white">
                <CurrencyDollarIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                Cashback
              </h1>
            </div>
            <p className="text-gray-300">
              Resgate códigos, acompanhe solicitações e veja seu histórico
            </p>
            <p className="text-sementes-accent font-semibold mt-2">
              ✨ Cada compra é uma oportunidade de fazer a diferença ✨
            </p>
          </motion.div>

          {/* Estatísticas Rápidas */}
          {estatisticas && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Resgatado</p>
                    <p className="text-white font-bold text-lg">{estatisticas.totalResgatado} Sementes</p>
                  </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pendente</p>
                    <p className="text-white font-bold text-lg">{estatisticas.totalPendente} Sementes</p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Códigos Usados</p>
                    <p className="text-white font-bold text-lg">{estatisticas.codigosUsados}</p>
                  </div>
                  <GiftIcon className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Economia Total</p>
                    <p className="text-white font-bold text-lg">{estatisticas.economiaTotal} Sementes</p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card mb-8"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                🚀 Ações Rápidas
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/registrar-compra"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Registrar Compra com Parceiro
                </Link>
                <Link
                  href="/parceiros"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                  Ver Parceiros Disponíveis
                </Link>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                💡 Use o cupom <strong>sementesplay10</strong> nas compras e registre aqui para receber cashback!
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="card">
            <div className="border-b border-gray-700">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-sementes-primary text-sementes-primary'
                        : 'border-transparent text-gray-300 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Códigos Disponíveis */}
              {activeTab === 'disponiveis' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar códigos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sementes-primary"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FunnelIcon className="w-5 h-5 text-gray-400" />
                      <select
                        value={selectedCategoria}
                        onChange={(e) => setSelectedCategoria(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                      >
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lista de Códigos */}
                  {codigosDisponiveis.length === 0 ? (
                    <div className="text-center py-8">
                      <GiftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Nenhum código disponível</h3>
                      <p className="text-gray-400">Volte mais tarde para novos códigos de cashback</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {codigosDisponiveis.map((codigo) => (
                        <motion.div
                          key={codigo.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border-l-4 ${getStatusColor(codigo.status)} cursor-pointer hover:bg-gray-700 transition-colors`}
                          onClick={() => {
                            setSelectedCodigo(codigo)
                            setShowModal(true)
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-2xl">{codigo.icone}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              codigo.status === 'ativo' ? 'bg-green-500/20 text-green-300' :
                              codigo.status === 'inativo' ? 'bg-gray-500/20 text-gray-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {codigo.status}
                            </span>
                          </div>
                          
                          <h4 className="text-white font-semibold mb-2">{codigo.codigo}</h4>
                          <p className="text-gray-300 text-sm mb-3">{codigo.descricao}</p>
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Valor:</span>
                              <span className="text-white font-medium">
                                {codigo.tipo === 'percentual' ? `${codigo.valor}%` : `${codigo.valor} Sementes`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Mínimo:</span>
                              <span className="text-white">R$ {codigo.valorMinimo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Usos:</span>
                              <span className="text-white">{codigo.usos}/{codigo.maxUsos}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Histórico */}
              {activeTab === 'historico' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {historico.length === 0 ? (
                    <div className="text-center py-8">
                      <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Nenhum histórico</h3>
                      <p className="text-gray-400">Você ainda não resgatou nenhum código</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {historico.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">🎯</span>
                              <div>
                                <p className="text-white font-medium">{item.codigo}</p>
                                <p className="text-gray-400 text-sm">
                                  {item.dataResgate.toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{item.valor} Sementes</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(item.status)}`}>
                                {getStatusText(item.status)}
                              </span>
                            </div>
                          </div>
                          {item.observacao && (
                            <p className="text-gray-300 text-sm">{item.observacao}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Solicitações Pendentes */}
              {activeTab === 'pendentes' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {solicitacoesPendentes.length === 0 ? (
                    <div className="text-center py-8">
                      <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Nenhuma solicitação pendente</h3>
                      <p className="text-gray-400">Todas as suas solicitações foram processadas</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {solicitacoesPendentes.map((solicitacao) => (
                        <div key={solicitacao.id} className="p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">🛒</span>
                              <div>
                                <p className="text-white font-medium">{solicitacao.parceiroNome}</p>
                                <p className="text-gray-400 text-sm">
                                  {solicitacao.dataCompra.toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">R$ {solicitacao.valorCompra.toFixed(2)}</p>
                              <p className="text-sementes-primary font-medium">{solicitacao.valorCashback} Sementes</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(solicitacao.status)}`}>
                              {getStatusText(solicitacao.status)}
                            </span>
                            {solicitacao.comprovanteUrl && (
                              <a
                                href={solicitacao.comprovanteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sementes-primary hover:text-sementes-accent text-sm"
                              >
                                Ver Comprovante
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Código */}
      {showModal && selectedCodigo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{selectedCodigo.icone}</div>
              <h3 className="text-xl font-bold text-white mb-2">{selectedCodigo.codigo}</h3>
              <p className="text-gray-300">{selectedCodigo.descricao}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Valor:</span>
                <span className="text-white font-medium">
                  {selectedCodigo.tipo === 'percentual' ? `${selectedCodigo.valor}%` : `${selectedCodigo.valor} Sementes`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor Mínimo:</span>
                <span className="text-white">R$ {selectedCodigo.valorMinimo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor Máximo:</span>
                <span className="text-white">R$ {selectedCodigo.valorMaximo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Usos:</span>
                <span className="text-white">{selectedCodigo.usos}/{selectedCodigo.maxUsos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Válido até:</span>
                <span className="text-white">{selectedCodigo.dataFim.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
              {selectedCodigo.status === 'ativo' && (
                <button
                  onClick={() => {
                    // TODO: Implementar resgate
                    alert('Funcionalidade de resgate será implementada!')
                    setShowModal(false)
                  }}
                  className="flex-1 bg-sementes-primary hover:bg-sementes-secondary text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Resgatar
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
