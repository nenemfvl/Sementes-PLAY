'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UsersIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface UsuarioAdmin {
  id: string
  nome: string
  email: string
  tipo: string
  nivel: string
  sementes: number
  pontuacao: number
  dataCriacao: Date
  status: 'ativo' | 'banido' | 'pendente' | 'suspenso'
}

export default function AdminUsuariosPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [duracaoSuspensao, setDuracaoSuspensao] = useState(7)

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
            carregarUsuarios()
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

  const carregarUsuarios = async () => {
    try {
      // TODO: Implementar API para buscar usuários
      // Por enquanto, usando dados mockados para desenvolvimento
      setUsuarios([])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarUsuarios = () => {
    return usuarios.filter(usuario => {
      const matchSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = filterTipo === 'todos' || usuario.tipo === filterTipo
      const matchNivel = filterNivel === 'todos' || usuario.nivel === filterNivel
      
      return matchSearch && matchTipo && matchNivel
    })
  }

  const banirUsuario = async (usuarioId: string) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo do banimento.')
      return
    }

    try {
      // TODO: Implementar API para banir usuário
      alert('Usuário banido com sucesso!')
      setShowBanModal(false)
      setMotivo('')
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao banir usuário:', error)
      alert('Erro ao banir usuário')
    }
  }

  const suspenderUsuario = async (usuarioId: string) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da suspensão.')
      return
    }

    try {
      // TODO: Implementar API para suspender usuário
      alert('Usuário suspenso com sucesso!')
      setShowSuspendModal(false)
      setMotivo('')
      setDuracaoSuspensao(7)
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao suspender usuário:', error)
      alert('Erro ao suspender usuário')
    }
  }

  const reativarUsuario = async (usuarioId: string) => {
    if (!motivo.trim()) {
      alert('Por favor, informe o motivo da reativação.')
      return
    }

    try {
      // TODO: Implementar API para reativar usuário
      alert('Usuário reativado com sucesso!')
      setShowReactivateModal(false)
      setMotivo('')
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao reativar usuário:', error)
      alert('Erro ao reativar usuário')
    }
  }

  const alterarNivel = async (usuarioId: string, novoNivel: string) => {
    try {
      // TODO: Implementar API para alterar nível
      alert('Nível alterado com sucesso!')
      setShowModal(false)
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao alterar nível:', error)
      alert('Erro ao alterar nível')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando usuários...</p>
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
                  <UsersIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Gerenciar Usuários
                </h1>
                <p className="text-gray-300">Gerencie todos os usuários do sistema</p>
              </div>
            </div>
          </motion.div>

          {/* Filtros e Busca */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card mb-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="usuario">Usuário</option>
                  <option value="criador">Criador</option>
                  <option value="parceiro">Parceiro</option>
                  <option value="admin">Admin</option>
                </select>
                
                <select
                  value={filterNivel}
                  onChange={(e) => setFilterNivel(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                >
                  <option value="todos">Todos os níveis</option>
                  <option value="1">Nível 1</option>
                  <option value="2">Nível 2</option>
                  <option value="3">Nível 3</option>
                  <option value="4">Nível 4</option>
                  <option value="5">Nível 5</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Lista de Usuários */}
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
                    <th className="text-left p-4 text-gray-400 font-medium">Usuário</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Tipo</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Nível</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Sementes</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Pontuação</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Data Criação</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarUsuarios().length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-400 p-8">
                        <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum usuário encontrado</p>
                      </td>
                    </tr>
                  ) : filtrarUsuarios().map((user) => (
                    <tr key={user.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.nome}</div>
                            <div className="text-gray-400 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.tipo === 'admin' ? 'bg-red-500/20 text-red-300' :
                          user.tipo === 'parceiro' ? 'bg-green-500/20 text-green-300' :
                          user.tipo === 'criador' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {user.tipo}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">Nível {user.nivel}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'ativo' ? 'bg-green-500/20 text-green-300' :
                          user.status === 'suspenso' ? 'bg-yellow-500/20 text-yellow-300' :
                          user.status === 'banido' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-green-400 font-semibold">{user.sementes}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-blue-400 font-semibold">{user.pontuacao}</span>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {new Date(user.dataCriacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowModal(true)
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            title="Alterar Nível"
                          >
                            <PencilIcon className="w-4 h-4 text-white" />
                          </button>
                          
                          {user.status === 'ativo' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowSuspendModal(true)
                                }}
                                className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                                title="Suspender"
                              >
                                <ClockIcon className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowBanModal(true)
                                }}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                title="Banir"
                              >
                                <NoSymbolIcon className="w-4 h-4 text-white" />
                              </button>
                            </>
                          )}
                          
                          {(user.status === 'suspenso' || user.status === 'banido') && (
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowReactivateModal(true)
                              }}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              title="Reativar"
                            >
                              <CheckCircleIcon className="w-4 h-4 text-white" />
                            </button>
                          )}
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

      {/* Modal Alterar Nível */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Alterar Nível do Usuário</h3>
            <p className="text-gray-300 mb-4">
              Alterando nível de <span className="text-white font-medium">{selectedUser.nome}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Novo Nível</label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                  defaultValue={selectedUser.nivel}
                >
                  <option value="1">Nível 1</option>
                  <option value="2">Nível 2</option>
                  <option value="3">Nível 3</option>
                  <option value="4">Nível 4</option>
                  <option value="5">Nível 5</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => alterarNivel(selectedUser.id, '1')}
                  className="flex-1 px-4 py-2 bg-sementes-primary hover:bg-sementes-primary/80 text-white rounded-lg transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Banir Usuário */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Banir Usuário</h3>
            <p className="text-gray-300 mb-4">
              Banindo <span className="text-white font-medium">{selectedUser.nome}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Motivo do Banimento</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Informe o motivo do banimento..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => banirUsuario(selectedUser.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Banir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Suspender Usuário */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Suspender Usuário</h3>
            <p className="text-gray-300 mb-4">
              Suspendo <span className="text-white font-medium">{selectedUser.nome}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Motivo da Suspensão</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Informe o motivo da suspensão..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duração (dias)</label>
                <input
                  type="number"
                  value={duracaoSuspensao}
                  onChange={(e) => setDuracaoSuspensao(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => suspenderUsuario(selectedUser.id)}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Suspender
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Reativar Usuário */}
      {showReactivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Reativar Usuário</h3>
            <p className="text-gray-300 mb-4">
              Reativando <span className="text-white font-medium">{selectedUser.nome}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Motivo da Reativação</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Informe o motivo da reativação..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReactivateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => reativarUsuario(selectedUser.id)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Reativar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
