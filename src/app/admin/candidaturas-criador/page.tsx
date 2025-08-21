'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface Candidatura {
  id: string
  usuarioId: string
  nome: string
  email: string
  bio: string
  categoria: string
  redesSociais: {
    youtube?: string
    twitch?: string
    instagram?: string
    tiktok?: string
    twitter?: string
  }
  portfolio: {
    descricao: string
    links: string[]
  }
  experiencia: string
  motivacao: string
  metas: string
  disponibilidade: string
  status: 'pendente' | 'aprovada' | 'rejeitada'
  dataCandidatura: Date
  dataRevisao?: Date
  observacoes?: string
}

export default function AdminCandidaturasCriadorPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterCategoria, setFilterCategoria] = useState('todos')
  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info', mensagem: string } | null>(null)

  // Função para formatar textos longos
  const formatarTexto = (texto: string, maxLength: number = 100) => {
    if (!texto) return ''
    if (texto.length <= maxLength) return texto
    
    // Se não há espaços, quebrar a cada maxLength caracteres
    if (!texto.includes(' ')) {
      const linhas = []
      for (let i = 0; i < texto.length; i += maxLength) {
        linhas.push(texto.slice(i, i + maxLength))
      }
      return linhas.join('\n')
    }
    
    // Quebrar em palavras e juntar com quebras de linha
    const palavras = texto.split(' ')
    let resultado = ''
    let linhaAtual = ''
    
    palavras.forEach(palavra => {
      if ((linhaAtual + palavra).length > maxLength) {
        resultado += linhaAtual + '\n'
        linhaAtual = palavra + ' '
      } else {
        linhaAtual += palavra + ' '
      }
    })
    
    resultado += linhaAtual
    return resultado.trim()
  }

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
            window.location.href = '/perfil'
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
      const response = await fetch('/api/admin/candidaturas-criador')
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setCandidaturas(data.candidaturas)
        } else {
          setNotificacao({ tipo: 'erro', mensagem: data.error || 'Erro ao carregar candidaturas' })
        }
      } else {
        setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar candidaturas' })
      }
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
                         candidatura.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'todos' || candidatura.status === filterStatus
      const matchCategoria = filterCategoria === 'todos' || candidatura.categoria === filterCategoria
      
      return matchSearch && matchStatus && matchCategoria
    })
  }

  const aprovarCandidatura = async (candidaturaId: string) => {
    try {
      const response = await fetch('/api/admin/candidaturas-criador', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidaturaId,
          status: 'aprovada',
          observacoes
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setNotificacao({ tipo: 'sucesso', mensagem: data.mensagem })
          carregarCandidaturas()
          setShowModal(false)
          setObservacoes('')
        } else {
          setNotificacao({ tipo: 'erro', mensagem: data.error || 'Erro ao aprovar candidatura' })
        }
      } else {
        setNotificacao({ tipo: 'erro', mensagem: 'Erro ao aprovar candidatura' })
      }
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
      const response = await fetch('/api/admin/candidaturas-criador', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidaturaId,
          status: 'rejeitada',
          observacoes
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setNotificacao({ tipo: 'sucesso', mensagem: data.mensagem })
          carregarCandidaturas()
          setShowModal(false)
          setObservacoes('')
        } else {
          setNotificacao({ tipo: 'erro', mensagem: data.error || 'Erro ao rejeitar candidatura' })
        }
      } else {
        setNotificacao({ tipo: 'erro', mensagem: 'Erro ao rejeitar candidatura' })
      }
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao rejeitar candidatura' })
    }
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
                  <ShieldCheckIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Candidaturas de Criador
                </h1>
                <p className="text-gray-300">Aprove ou rejeite candidaturas para se tornarem criadores</p>
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
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          )}

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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                >
                  <option value="todos">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="rejeitada">Rejeitada</option>
                </select>
                
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                >
                  <option value="todos">Todas as categorias</option>
                  <option value="gaming">Gaming</option>
                  <option value="tech">Tech</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="education">Educação</option>
                  <option value="entertainment">Entretenimento</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Lista de Candidaturas */}
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
                    <th className="text-left p-4 text-gray-400 font-medium">Candidato</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Categoria</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Data Candidatura</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarCandidaturas().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 p-8">
                        <ShieldCheckIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma candidatura encontrada</p>
                      </td>
                    </tr>
                  ) : filtrarCandidaturas().map((candidatura) => (
                    <tr key={candidatura.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{candidatura.nome}</div>
                            <div className="text-gray-400 text-sm">{candidatura.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                          {candidatura.categoria}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          candidatura.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                          candidatura.status === 'aprovada' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {candidatura.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {new Date(candidatura.dataCandidatura).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCandidatura(candidatura)
                              setShowModal(true)
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            title="Ver Detalhes"
                          >
                            <EyeIcon className="w-4 h-4 text-white" />
                          </button>
                          
                          {candidatura.status === 'pendente' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCandidatura(candidatura)
                                  setShowModal(true)
                                }}
                                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                title="Aprovar"
                              >
                                <CheckCircleIcon className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCandidatura(candidatura)
                                  setShowModal(true)
                                }}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                title="Rejeitar"
                              >
                                <XCircleIcon className="w-4 h-4 text-white" />
                              </button>
                            </>
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

      {/* Modal de Detalhes/Ações */}
      {showModal && selectedCandidatura && (
                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
           >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Candidatura de {selectedCandidatura.nome}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nome:</span>
                      <span className="text-white">{selectedCandidatura.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{selectedCandidatura.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Categoria:</span>
                      <span className="text-white">{selectedCandidatura.categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCandidatura.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                        selectedCandidatura.status === 'aprovada' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {selectedCandidatura.status}
                      </span>
                    </div>
                  </div>
                </div>

                                 <div>
                   <h4 className="text-lg font-medium text-white mb-2">Bio</h4>
                   <p className="text-gray-300 text-sm break-all whitespace-pre-wrap leading-relaxed max-w-full">
                     {formatarTexto(selectedCandidatura.bio, 60)}
                   </p>
                 </div>

                 <div>
                   <h4 className="text-lg font-medium text-white mb-2">Experiência</h4>
                   <p className="text-gray-300 text-sm break-all whitespace-pre-wrap leading-relaxed max-w-full">
                     {formatarTexto(selectedCandidatura.experiencia, 60)}
                   </p>
                 </div>
              </div>

              {/* Redes Sociais e Portfolio */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Redes Sociais</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedCandidatura.redesSociais).map(([rede, url]) => (
                      url && (
                        <div key={rede} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{rede}:</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sementes-primary hover:underline">
                            {url}
                          </a>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                                 <div>
                   <h4 className="text-lg font-medium text-white mb-2">Portfolio</h4>
                   <p className="text-gray-300 text-sm mb-2 break-all whitespace-pre-wrap leading-relaxed max-w-full">
                     {formatarTexto(selectedCandidatura.portfolio.descricao, 60)}
                   </p>
                   <div className="space-y-1">
                     {selectedCandidatura.portfolio.links.map((link, index) => (
                       <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="block text-sementes-primary hover:underline text-sm break-all">
                         {link}
                       </a>
                     ))}
                   </div>
                 </div>

                 <div>
                   <h4 className="text-lg font-medium text-white mb-2">Motivação e Metas</h4>
                   <p className="text-gray-300 text-sm mb-2 break-all whitespace-pre-wrap leading-relaxed max-w-full">
                     <strong>Motivação:</strong> {formatarTexto(selectedCandidatura.motivacao, 50)}
                   </p>
                   <p className="text-gray-300 text-sm break-words whitespace-pre-wrap leading-relaxed">
                     <strong>Metas:</strong> {formatarTexto(selectedCandidatura.metas, 50)}
                   </p>
                 </div>

                 <div>
                   <h4 className="text-lg font-medium text-white mb-2">Disponibilidade</h4>
                   <p className="text-gray-300 text-sm break-all whitespace-pre-wrap leading-relaxed max-w-full">
                     {formatarTexto(selectedCandidatura.disponibilidade, 60)}
                   </p>
                 </div>
              </div>
            </div>

            {/* Ações */}
            {selectedCandidatura.status === 'pendente' && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <h4 className="text-lg font-medium text-white mb-4">Ações</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Observações (opcional)</label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Adicione observações sobre a candidatura..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sementes-primary"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => rejeitarCandidatura(selectedCandidatura.id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => aprovarCandidatura(selectedCandidatura.id)}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Aprovar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
