'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline'

interface UsuarioPermissao {
  id: string
  nome: string
  email: string
  avatarUrl?: string
  tipo: 'usuario' | 'criador' | 'admin'
  nivel: number
  status: 'ativo' | 'suspenso' | 'banido'
  dataCadastro: Date
  ultimaAtividade: Date
  permissoes: Permissao[]
  nivelAnterior?: number
}

interface Permissao {
  id: string
  nome: string
  descricao: string
  categoria: 'sistema' | 'admin' | 'financeiro' | 'conteudo' | 'usuarios'
  ativa: boolean
}

interface NivelPermissao {
  nivel: number
  nome: string
  descricao: string
  permissoes: string[]
  cor: string
}

export default function AdminPermissoes() {
  const { usuario, isAuthenticated } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<UsuarioPermissao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterNivel, setFilterNivel] = useState('todos')
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioPermissao | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Partial<UsuarioPermissao> | null>(null)
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info', mensagem: string } | null>(null)

  const niveisPermissao: NivelPermissao[] = [
    {
      nivel: 1,
      nome: 'Usuário Básico',
      descricao: 'Acesso básico ao sistema',
      permissoes: ['visualizar_conteudo', 'solicitar_cashback'],
      cor: 'bg-gray-500/20 text-gray-300'
    },
    {
      nivel: 2,
      nome: 'Usuário Premium',
      descricao: 'Acesso a recursos avançados',
      permissoes: ['visualizar_conteudo', 'solicitar_cashback', 'comentar', 'avaliar'],
      cor: 'bg-blue-500/20 text-blue-300'
    },
    {
      nivel: 3,
      nome: 'Criador Nível 1',
      descricao: 'Pode criar e gerenciar conteúdo básico',
      permissoes: ['visualizar_conteudo', 'solicitar_cashback', 'criar_conteudo', 'editar_proprio_conteudo'],
      cor: 'bg-green-500/20 text-green-300'
    },
    {
      nivel: 4,
      nome: 'Criador Nível 2',
      descricao: 'Pode criar conteúdo avançado e receber pagamentos',
      permissoes: ['visualizar_conteudo', 'solicitar_cashback', 'criar_conteudo', 'editar_proprio_conteudo', 'receber_pagamentos', 'gerenciar_perfil'],
      cor: 'bg-purple-500/20 text-purple-300'
    },
    {
      nivel: 5,
      nome: 'Administrador',
      descricao: 'Acesso completo ao sistema administrativo',
      permissoes: ['todas_permissoes'],
      cor: 'bg-red-500/20 text-red-300'
    }
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!usuario || Number(usuario.nivel) < 5) {
      router.push('/')
      return
    }

    carregarUsuarios()
  }, [usuario, isAuthenticated, router])

  const carregarUsuarios = async () => {
    try {
      // TODO: Implementar API para buscar usuários
      // Por enquanto, usando dados mockados para desenvolvimento
      setUsuarios([
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          avatarUrl: 'https://exemplo.com/avatar1.jpg',
          tipo: 'usuario',
          nivel: 2,
          status: 'ativo',
          dataCadastro: new Date('2023-06-15'),
          ultimaAtividade: new Date('2024-01-20'),
          permissoes: [
            { id: '1', nome: 'visualizar_conteudo', descricao: 'Visualizar conteúdo', categoria: 'conteudo', ativa: true },
            { id: '2', nome: 'solicitar_cashback', descricao: 'Solicitar cashback', categoria: 'financeiro', ativa: true },
            { id: '3', nome: 'comentar', descricao: 'Comentar em conteúdo', categoria: 'conteudo', ativa: true },
            { id: '4', nome: 'avaliar', descricao: 'Avaliar conteúdo', categoria: 'conteudo', ativa: true }
          ]
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@exemplo.com',
          avatarUrl: 'https://exemplo.com/avatar2.jpg',
          tipo: 'criador',
          nivel: 4,
          status: 'ativo',
          dataCadastro: new Date('2023-03-20'),
          ultimaAtividade: new Date('2024-01-19'),
          permissoes: [
            { id: '1', nome: 'visualizar_conteudo', descricao: 'Visualizar conteúdo', categoria: 'conteudo', ativa: true },
            { id: '2', nome: 'solicitar_cashback', descricao: 'Solicitar cashback', categoria: 'financeiro', ativa: true },
            { id: '3', nome: 'criar_conteudo', descricao: 'Criar conteúdo', categoria: 'conteudo', ativa: true },
            { id: '4', nome: 'editar_proprio_conteudo', descricao: 'Editar próprio conteúdo', categoria: 'conteudo', ativa: true },
            { id: '5', nome: 'receber_pagamentos', descricao: 'Receber pagamentos', categoria: 'financeiro', ativa: true },
            { id: '6', nome: 'gerenciar_perfil', descricao: 'Gerenciar perfil', categoria: 'usuarios', ativa: true }
          ]
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          email: 'pedro@exemplo.com',
          avatarUrl: 'https://exemplo.com/avatar3.jpg',
          tipo: 'criador',
          nivel: 3,
          status: 'ativo',
          dataCadastro: new Date('2023-09-10'),
          ultimaAtividade: new Date('2024-01-15'),
          permissoes: [
            { id: '1', nome: 'visualizar_conteudo', descricao: 'Visualizar conteúdo', categoria: 'conteudo', ativa: true },
            { id: '2', nome: 'solicitar_cashback', descricao: 'Solicitar cashback', categoria: 'financeiro', ativa: true },
            { id: '3', nome: 'criar_conteudo', descricao: 'Criar conteúdo', categoria: 'conteudo', ativa: true },
            { id: '4', nome: 'editar_proprio_conteudo', descricao: 'Editar próprio conteúdo', categoria: 'conteudo', ativa: true }
          ]
        },
        {
          id: '4',
          nome: 'Ana Oliveira',
          email: 'ana@exemplo.com',
          avatarUrl: 'https://exemplo.com/avatar4.jpg',
          tipo: 'admin',
          nivel: 5,
          status: 'ativo',
          dataCadastro: new Date('2023-01-15'),
          ultimaAtividade: new Date('2024-01-20'),
          permissoes: [
            { id: '1', nome: 'todas_permissoes', descricao: 'Todas as permissões', categoria: 'sistema', ativa: true }
          ]
        }
      ])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar usuários' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarUsuarios = () => {
    return usuarios.filter(user => {
      const matchSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = filterTipo === 'todos' || user.tipo === filterTipo
      const matchNivel = filterNivel === 'todos' || user.nivel.toString() === filterNivel
      
      return matchSearch && matchTipo && matchNivel
    })
  }

  const alterarNivel = async (usuarioId: string, novoNivel: number) => {
    try {
      // TODO: Implementar API para alterar nível
      setNotificacao({ tipo: 'sucesso', mensagem: `Nível alterado para ${novoNivel} com sucesso!` })
      carregarUsuarios()
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao alterar nível:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao alterar nível' })
    }
  }

  const alterarPermissao = async (usuarioId: string, permissaoId: string, ativa: boolean) => {
    try {
      // TODO: Implementar API para alterar permissão
      setNotificacao({ tipo: 'sucesso', mensagem: `Permissão ${ativa ? 'ativada' : 'desativada'} com sucesso!` })
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao alterar permissão:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao alterar permissão' })
    }
  }

  const verDetalhes = (user: UsuarioPermissao) => {
    setSelectedUsuario(user)
    setEditingUsuario({ ...user })
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

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'usuario': return 'bg-blue-500/20 text-blue-300'
      case 'criador': return 'bg-green-500/20 text-green-300'
      case 'admin': return 'bg-purple-500/20 text-purple-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'usuario': return 'Usuário'
      case 'criador': return 'Criador'
      case 'admin': return 'Admin'
      default: return tipo
    }
  }

  const getNivelInfo = (nivel: number) => {
    return niveisPermissao.find(n => n.nivel === nivel) || niveisPermissao[0]
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
                onClick={() => router.push('/admin')}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <ShieldCheckIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Gerenciar Permissões
                </h1>
                <p className="text-gray-300">Controle níveis de acesso e permissões dos usuários</p>
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="usuario">Usuários</option>
                  <option value="criador">Criadores</option>
                  <option value="admin">Admins</option>
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
                  <option value="5">Nível 5</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tabela de Usuários */}
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
                    <th className="text-left p-3 text-gray-400 font-medium">Tipo</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Nível</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Permissões</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarUsuarios().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 p-8">
                        <ShieldCheckIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum usuário encontrado</p>
                      </td>
                    </tr>
                  ) : filtrarUsuarios().map((user) => (
                    <tr key={user.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.nome} className="w-10 h-10 rounded-full" />
                            ) : (
                              <UserIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.nome}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(user.tipo)}`}>
                          {getTipoText(user.tipo)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNivelInfo(user.nivel).cor}`}>
                          Nível {user.nivel}
                        </span>
                        <p className="text-gray-400 text-xs mt-1">{getNivelInfo(user.nivel).nome}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status === 'ativo' ? 'Ativo' :
                           user.status === 'suspenso' ? 'Suspenso' : 'Banido'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <p className="text-gray-300">{user.permissoes.filter(p => p.ativa).length} ativas</p>
                          <p className="text-gray-400 text-xs">{user.permissoes.length} total</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => verDetalhes(user)}
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
      {showModal && selectedUsuario && editingUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes do Usuário</h2>
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
                      <p className="text-white">{selectedUsuario.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Email</label>
                      <p className="text-white">{selectedUsuario.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Data de Cadastro</label>
                      <p className="text-white">{new Date(selectedUsuario.dataCadastro).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Última Atividade</label>
                      <p className="text-white">{new Date(selectedUsuario.ultimaAtividade).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informações de Acesso</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Tipo</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(selectedUsuario.tipo)}`}>
                        {getTipoText(selectedUsuario.tipo)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Nível Atual</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getNivelInfo(selectedUsuario.nivel).cor}`}>
                        Nível {selectedUsuario.nivel} - {getNivelInfo(selectedUsuario.nivel).nome}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUsuario.status)}`}>
                        {selectedUsuario.status === 'ativo' ? 'Ativo' :
                         selectedUsuario.status === 'suspenso' ? 'Suspenso' : 'Banido'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição do Nível */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Descrição do Nível</h3>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-300">{getNivelInfo(selectedUsuario.nivel).descricao}</p>
                </div>
              </div>

              {/* Permissões */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Permissões</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUsuario.permissoes.map((permissao) => (
                    <div key={permissao.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{permissao.nome}</h4>
                        <button
                          onClick={() => alterarPermissao(selectedUsuario.id, permissao.id, !permissao.ativa)}
                          className={`p-2 rounded-lg transition-colors ${
                            permissao.ativa 
                              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          }`}
                        >
                          {permissao.ativa ? <LockOpenIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{permissao.descricao}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        permissao.ativa ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {permissao.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        permissao.categoria === 'sistema' ? 'bg-purple-500/20 text-purple-300' :
                        permissao.categoria === 'admin' ? 'bg-red-500/20 text-red-300' :
                        permissao.categoria === 'financeiro' ? 'bg-green-500/20 text-green-300' :
                        permissao.categoria === 'conteudo' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {permissao.categoria}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alterar Nível */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Alterar Nível de Acesso</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {niveisPermissao.map((nivel) => (
                    <div
                      key={nivel.nivel}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedUsuario.nivel === nivel.nivel
                          ? 'border-sementes-primary bg-sementes-primary/10'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setEditingUsuario({ ...editingUsuario, nivel: nivel.nivel })}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${nivel.cor}`}>
                          <span className="text-lg font-bold">{nivel.nivel}</span>
                        </div>
                        <h4 className="text-white font-medium mb-2">{nivel.nome}</h4>
                        <p className="text-gray-400 text-sm mb-3">{nivel.descricao}</p>
                        <div className="text-xs text-gray-500">
                          {nivel.permissoes.length} permissões
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {editingUsuario.nivel !== selectedUsuario.nivel && (
                  <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">Alteração de Nível</span>
                    </div>
                    <p className="text-yellow-300 text-sm mb-4">
                      Você está alterando o nível de <strong>Nível {selectedUsuario.nivel}</strong> para <strong>Nível {editingUsuario.nivel}</strong>.
                      Esta alteração pode afetar as permissões do usuário.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => alterarNivel(selectedUsuario.id, editingUsuario.nivel!)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Confirmar Alteração</span>
                      </button>
                      <button
                        onClick={() => setEditingUsuario({ ...editingUsuario, nivel: selectedUsuario.nivel })}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span>Cancelar</span>
                      </button>
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
