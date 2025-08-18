'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Parceiro {
  id: string
  nome: string
  email: string
  telefone: string
  avatarUrl?: string
  status: 'ativo' | 'suspenso' | 'banido'
  dataCadastro: Date
  ultimaAtividade: Date
  cidades: Cidade[]
  totalRepasses: number
  totalGanhos: number
  biografia: string
  redesSociais: string[]
  especialidades: string[]
}

interface Cidade {
  id: string
  nome: string
  estado: string
  pais: string
  descricao: string
  url: string
  status: 'ativa' | 'inativa' | 'manutencao'
  dataCriacao: Date
  totalUsuarios: number
  totalCompras: number
}

export default function AdminParceiros() {
  const { usuario, isAuthenticated } = useAuth()
  const router = useRouter()
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [selectedParceiro, setSelectedParceiro] = useState<Parceiro | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingParceiro, setEditingParceiro] = useState<Partial<Parceiro> | null>(null)
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info', mensagem: string } | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!usuario || Number(usuario.nivel) < 5) {
      router.push('/')
      return
    }

    carregarParceiros()
  }, [usuario, isAuthenticated, router])

  const carregarParceiros = async () => {
    try {
      // TODO: Implementar API para buscar parceiros
      // Por enquanto, usando dados mockados para desenvolvimento
      setParceiros([
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          telefone: '(11) 99999-9999',
          avatarUrl: 'https://exemplo.com/avatar1.jpg',
          status: 'ativo',
          dataCadastro: new Date('2023-05-10'),
          ultimaAtividade: new Date('2024-01-20'),
          cidades: [
            {
              id: '1',
              nome: 'São Paulo',
              estado: 'SP',
              pais: 'Brasil',
              descricao: 'Cidade de roleplay com foco em economia realista',
              url: 'https://saopaulo.exemplo.com',
              status: 'ativa',
              dataCriacao: new Date('2023-05-15'),
              totalUsuarios: 1250,
              totalCompras: 89
            }
          ],
          totalRepasses: 45,
          totalGanhos: 8900.50,
          biografia: 'Dono de cidade FiveM com foco em economia realista',
          redesSociais: ['@joaosilva', '@cidadesp'],
          especialidades: ['Economia', 'Roleplay', 'Empregos']
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@exemplo.com',
          telefone: '(21) 88888-8888',
          avatarUrl: 'https://exemplo.com/avatar2.jpg',
          status: 'ativo',
          dataCadastro: new Date('2023-07-20'),
          ultimaAtividade: new Date('2024-01-19'),
          cidades: [
            {
              id: '2',
              nome: 'Rio de Janeiro',
              estado: 'RJ',
              pais: 'Brasil',
              descricao: 'Cidade com sistema de empregos e economia avançada',
              url: 'https://riodejaneiro.exemplo.com',
              status: 'ativa',
              dataCriacao: new Date('2023-07-25'),
              totalUsuarios: 980,
              totalCompras: 67
            }
          ],
          totalRepasses: 32,
          totalGanhos: 6400.75,
          biografia: 'Administradora de servidor com experiência em sistemas avançados',
          redesSociais: ['@mariasantos', '@ciderj'],
          especialidades: ['Sistemas', 'Empregos', 'Moderação']
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          email: 'pedro@exemplo.com',
          telefone: '(31) 77777-7777',
          avatarUrl: 'https://exemplo.com/avatar3.jpg',
          status: 'suspenso',
          dataCadastro: new Date('2023-09-15'),
          ultimaAtividade: new Date('2024-01-10'),
          cidades: [
            {
              id: '3',
              nome: 'Belo Horizonte',
              estado: 'MG',
              pais: 'Brasil',
              descricao: 'Cidade com foco em roleplay policial',
              url: 'https://belohorizonte.exemplo.com',
              status: 'manutencao',
              dataCriacao: new Date('2023-09-20'),
              totalUsuarios: 650,
              totalCompras: 34
            }
          ],
          totalRepasses: 18,
          totalGanhos: 3600.25,
          biografia: 'Criador de cidade com foco em roleplay policial',
          redesSociais: ['@pedrocosta', '@cidadebh'],
          especialidades: ['Policial', 'Roleplay', 'Sistemas']
        }
      ])
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar parceiros' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarParceiros = () => {
    return parceiros.filter(parceiro => {
      const matchSearch = parceiro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parceiro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parceiro.cidades.some(cidade => cidade.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchStatus = filterStatus === 'todos' || parceiro.status === filterStatus
      const matchEstado = filterEstado === 'todos' || parceiro.cidades.some(cidade => cidade.estado === filterEstado)
      
      return matchSearch && matchStatus && matchEstado
    })
  }

  const alterarStatus = async (parceiroId: string, novoStatus: 'ativo' | 'suspenso' | 'banido') => {
    try {
      // TODO: Implementar API para alterar status
      setNotificacao({ tipo: 'sucesso', mensagem: `Status alterado para ${novoStatus} com sucesso!` })
      carregarParceiros()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao alterar status' })
    }
  }

  const verDetalhes = (parceiro: Parceiro) => {
    setSelectedParceiro(parceiro)
    setEditingParceiro({ ...parceiro })
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

  const getCidadeStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-500/20 text-green-300'
      case 'inativa': return 'bg-gray-500/20 text-gray-300'
      case 'manutencao': return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando parceiros...</p>
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
                  Gerenciar Parceiros
                </h1>
                <p className="text-gray-300">Visualize e gerencie parceiros e suas cidades</p>
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
                    placeholder="Nome, email ou cidade..."
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

          {/* Tabela de Parceiros */}
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
                    <th className="text-left p-3 text-gray-400 font-medium">Parceiro</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Cidades</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Estatísticas</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarParceiros().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 p-8">
                        <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum parceiro encontrado</p>
                      </td>
                    </tr>
                  ) : filtrarParceiros().map((parceiro) => (
                    <tr key={parceiro.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                            {parceiro.avatarUrl ? (
                              <img src={parceiro.avatarUrl} alt={parceiro.nome} className="w-10 h-10 rounded-full" />
                            ) : (
                              <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{parceiro.nome}</p>
                            <p className="text-gray-400 text-sm">{parceiro.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          {parceiro.cidades.map((cidade) => (
                            <div key={cidade.id} className="flex items-center space-x-2">
                              <MapPinIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-white">{cidade.nome}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCidadeStatusColor(cidade.status)}`}>
                                {cidade.status === 'ativa' ? 'Ativa' :
                                 cidade.status === 'inativa' ? 'Inativa' : 'Manutenção'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(parceiro.status)}`}>
                          {parceiro.status === 'ativo' ? 'Ativo' :
                           parceiro.status === 'suspenso' ? 'Suspenso' : 'Banido'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="flex items-center space-x-1 mb-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">{parceiro.totalRepasses} repasses</span>
                          </div>
                          <div className="flex items-center space-x-1 mb-1">
                            <ChartBarIcon className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">R$ {parceiro.totalGanhos.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">{parceiro.cidades.reduce((total, cidade) => total + cidade.totalUsuarios, 0)} usuários</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => verDetalhes(parceiro)}
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
      {showModal && selectedParceiro && editingParceiro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Parceiro</h2>
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
                      <p className="text-white">{selectedParceiro.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Email</label>
                      <p className="text-white">{selectedParceiro.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Telefone</label>
                      <p className="text-white">{selectedParceiro.telefone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Data de Cadastro</label>
                      <p className="text-white">{new Date(selectedParceiro.dataCadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Última Atividade</label>
                      <p className="text-white">{new Date(selectedParceiro.ultimaAtividade).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações do Perfil</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedParceiro.status)}`}>
                        {selectedParceiro.status === 'ativo' ? 'Ativo' :
                         selectedParceiro.status === 'suspenso' ? 'Suspenso' : 'Banido'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Total de Repasses</label>
                      <p className="text-white">{selectedParceiro.totalRepasses}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Total de Ganhos</label>
                      <p className="text-white">R$ {selectedParceiro.totalGanhos.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Biografia</h3>
                <p className="text-gray-300 bg-gray-700 p-4 rounded-lg">{selectedParceiro.biografia}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedParceiro.especialidades.map((especialidade, index) => (
                    <span key={index} className="bg-sementes-primary/20 text-sementes-primary px-3 py-1 rounded-full text-sm">
                      {especialidade}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Redes Sociais</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedParceiro.redesSociais.map((rede, index) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {rede}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Cidades</h3>
                <div className="space-y-4">
                  {selectedParceiro.cidades.map((cidade) => (
                    <div key={cidade.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <MapPinIcon className="w-5 h-5 text-sementes-primary" />
                          <h4 className="text-lg font-semibold text-white">{cidade.nome}, {cidade.estado}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCidadeStatusColor(cidade.status)}`}>
                            {cidade.status === 'ativa' ? 'Ativa' :
                             cidade.status === 'inativa' ? 'Inativa' : 'Manutenção'}
                          </span>
                        </div>
                        <a
                          href={cidade.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sementes-primary hover:text-sementes-primary/80 transition-colors"
                        >
                          <GlobeAltIcon className="w-5 h-5" />
                        </a>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{cidade.descricao}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <ClockIcon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                          <p className="text-gray-400">Criada em</p>
                          <p className="text-white">{new Date(cidade.dataCriacao).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="text-center">
                          <UserIcon className="w-5 h-5 text-green-400 mx-auto mb-1" />
                          <p className="text-gray-400">Usuários</p>
                          <p className="text-white">{cidade.totalUsuarios}</p>
                        </div>
                        <div className="text-center">
                          <CurrencyDollarIcon className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                          <p className="text-gray-400">Compras</p>
                          <p className="text-white">{cidade.totalCompras}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ações Administrativas</h3>
                
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Alterar Status</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => alterarStatus(selectedParceiro.id, 'ativo')}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedParceiro.status === 'ativo' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 hover:bg-green-600 text-white'
                        }`}
                      >
                        Ativo
                      </button>
                      <button
                        onClick={() => alterarStatus(selectedParceiro.id, 'suspenso')}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedParceiro.status === 'suspenso' 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-600 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        Suspenso
                      </button>
                      <button
                        onClick={() => alterarStatus(selectedParceiro.id, 'banido')}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedParceiro.status === 'banido' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-600 hover:bg-red-600 text-white'
                        }`}
                      >
                        Banido
                      </button>
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
