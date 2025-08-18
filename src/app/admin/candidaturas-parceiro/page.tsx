'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface CandidaturaParceiro {
  id: string
  nome: string
  email: string
  telefone: string
  nomeCidade: string
  estado: string
  pais: string
  descricao: string
  experiencia: string
  redesSociais: string[]
  comprovantes: string[]
  status: 'pendente' | 'aprovada' | 'rejeitada'
  dataCandidatura: Date
  dataRevisao?: Date
  observacoes?: string
}

export default function AdminCandidaturasParceiroPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [candidaturas, setCandidaturas] = useState<CandidaturaParceiro[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [selectedCandidatura, setSelectedCandidatura] = useState<CandidaturaParceiro | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [observacoes, setObservacoes] = useState('')
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
            carregarCandidaturas()
          } else {
            // Não é admin, redirecionar
            window.location.href = '/dashboard'
          }
        } catch (error) {
          console.error('Erro ao ler dados do usuário:', error)
          localStorage.removeItem('usuario-dados')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
      setLoading(false)
    }
    verificarAutenticacao()
  }, [])

  const carregarCandidaturas = async () => {
    try {
      // TODO: Implementar API para buscar candidaturas de parceiro
      setCandidaturas([])
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar candidaturas' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarCandidaturas = () => {
    return candidaturas.filter(candidatura => {
      const matchSearch = candidatura.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidatura.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidatura.nomeCidade.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || candidatura.status === filterStatus
      const matchEstado = filterEstado === 'todos' || candidatura.estado === filterEstado
      
      return matchSearch && matchStatus && matchEstado
    })
  }

  const aprovarCandidatura = async (candidaturaId: string) => {
    if (!observacoes.trim()) {
      setNotificacao({ tipo: 'erro', mensagem: 'Por favor, informe as observações para aprovação' })
      return
    }

    try {
      // TODO: Implementar API para aprovar candidatura
      setNotificacao({ tipo: 'sucesso', mensagem: 'Candidatura aprovada com sucesso!' })
      carregarCandidaturas()
      setShowModal(false)
      setObservacoes('')
    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao aprovar candidatura' })
    }
  }

  const rejeitarCandidatura = async (candidaturaId: string) => {
    if (!observacoes.trim()) {
      setNotificacao({ tipo: 'erro', mensagem: 'Por favor, informe as observações para rejeição' })
      return
    }

    try {
      // TODO: Implementar API para rejeitar candidatura
      setNotificacao({ tipo: 'sucesso', mensagem: 'Candidatura rejeitada com sucesso!' })
      carregarCandidaturas()
      setShowModal(false)
      setObservacoes('')
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao rejeitar candidatura' })
    }
  }

  const verDetalhes = (candidatura: CandidaturaParceiro) => {
    setSelectedCandidatura(candidatura)
    setObservacoes(candidatura.observacoes || '')
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando candidaturas...</p>
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
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <BuildingOfficeIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Candidaturas de Parceiro
                </h1>
                <p className="text-gray-300">Aprove ou rejeite candidaturas para parceiros</p>
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Buscar</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nome, email ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="rejeitada">Rejeitada</option>
                </select>
              </div>
              
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="PR">Paraná</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tabela de Candidaturas */}
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
                    <th className="text-left p-3 text-gray-400 font-medium">Candidato</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Cidade</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Estado</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Data</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarCandidaturas().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 p-8">
                        <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma candidatura encontrada</p>
                      </td>
                    </tr>
                  ) : filtrarCandidaturas().map((candidatura) => (
                    <tr key={candidatura.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="text-white font-medium">{candidatura.nome}</p>
                          <p className="text-gray-400 text-sm">{candidatura.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{candidatura.nomeCidade}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-300">{candidatura.estado}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          candidatura.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                          candidatura.status === 'aprovada' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {candidatura.status === 'pendente' ? 'Pendente' :
                           candidatura.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300 text-sm">
                        {new Date(candidatura.dataCandidatura).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => verDetalhes(candidatura)}
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
      {showModal && selectedCandidatura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes da Candidatura</h2>
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
                      <p className="text-white">{selectedCandidatura.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Email</label>
                      <p className="text-white">{selectedCandidatura.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Telefone</label>
                      <p className="text-white">{selectedCandidatura.telefone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações da Cidade</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Nome da Cidade</label>
                      <p className="text-white">{selectedCandidatura.nomeCidade}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Estado</label>
                      <p className="text-white">{selectedCandidatura.estado}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">País</label>
                      <p className="text-white">{selectedCandidatura.pais}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Descrição da Cidade</h3>
                <p className="text-gray-300 bg-gray-700 p-4 rounded-lg">{selectedCandidatura.descricao}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Experiência</h3>
                <p className="text-gray-300 bg-gray-700 p-4 rounded-lg">{selectedCandidatura.experiencia}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Redes Sociais</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidatura.redesSociais.map((rede, index) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {rede}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Comprovantes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCandidatura.comprovantes.map((comprovante, index) => (
                    <a
                      key={index}
                      href={comprovante}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <GlobeAltIcon className="w-6 h-6 text-sementes-primary mx-auto mb-2" />
                      <p className="text-center text-white text-sm">Ver Comprovante {index + 1}</p>
                    </a>
                  ))}
                </div>
              </div>

              {selectedCandidatura.status === 'pendente' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Observações</h3>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Digite suas observações..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                    rows={4}
                  />
                </div>
              )}

              {selectedCandidatura.status === 'pendente' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => aprovarCandidatura(selectedCandidatura.id)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Aprovar</span>
                  </button>
                  <button
                    onClick={() => rejeitarCandidatura(selectedCandidatura.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    <span>Rejeitar</span>
                  </button>
                </div>
              )}

              {selectedCandidatura.status !== 'pendente' && selectedCandidatura.observacoes && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Observações do Admin</h3>
                  <p className="text-gray-300">{selectedCandidatura.observacoes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
