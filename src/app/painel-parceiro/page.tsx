'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  PlusIcon,
  BellIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  VideoCameraIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  EyeIcon,
  StarIcon,
  LinkIcon,
  QrCodeIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

interface Transacao {
  id: string
  valor: number
  codigoParceiro: string
  status: string
  data: string
  usuario?: { nome: string; email: string }
}

interface Estatisticas {
  totalVendas: number
  totalComissoes: number
  codigosAtivos: number
  repassesRealizados: number
  transacoesMes: number
  usuariosAtivos: number
}

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  data: string
}

interface Repasse {
  id: string
  valorCompra: number
  valorRepasse: number
  status: string
  dataCompra: string
  dataRepasse?: string
  comprovante?: string
  usuario?: { nome: string; email: string }
  tipo?: string
}

interface ConteudoParceiro {
  id: string
  titulo: string
  tipo: string
  categoria: string
  url: string
  dataPublicacao?: string
  fixado?: boolean
  visualizacoes?: number
  curtidas?: number
  dislikes?: number
}

interface CodigoCashback {
  id: string
  codigo: string
  desconto: number
  maxUsos: number
  usosAtuais: number
  ativo: boolean
  dataCriacao: string
  dataExpiracao?: string
}

export default function PainelParceiroPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loadingTransacoes, setLoadingTransacoes] = useState(true)
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true)
  const [repasses, setRepasses] = useState<Repasse[]>([])
  const [loadingRepasses, setLoadingRepasses] = useState(true)
  const [conteudos, setConteudos] = useState<ConteudoParceiro[]>([])
  const [loadingConteudos, setLoadingConteudos] = useState(true)
  const [showModalConteudo, setShowModalConteudo] = useState(false)
  const [formConteudo, setFormConteudo] = useState({ 
    titulo: '',
    tipo: '',
    categoria: '', 
    url: '',
    cidade: ''
  })
  const [savingConteudo, setSavingConteudo] = useState(false)
  const [editandoConteudo, setEditandoConteudo] = useState<ConteudoParceiro | null>(null)
  const [codigosCashback, setCodigosCashback] = useState<CodigoCashback[]>([])
  const [loadingCodigos, setLoadingCodigos] = useState(true)
  const [showModalCodigo, setShowModalCodigo] = useState(false)
  const [formCodigo, setFormCodigo] = useState({
    codigo: '',
    desconto: 10,
    maxUsos: 100,
    dataExpiracao: ''
  })
  const [savingCodigo, setSavingCodigo] = useState(false)
  const [editandoCodigo, setEditandoCodigo] = useState<CodigoCashback | null>(null)

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          // Verificar se é um parceiro
          if (dadosUsuario.nivel === 'parceiro') {
            setUsuario(dadosUsuario)
            setIsAuthenticated(true)
            // Carregar dados após autenticação
            carregarDados()
          } else {
            // Não é parceiro, redirecionar
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

  const carregarDados = async () => {
    try {
      // TODO: Implementar APIs reais
      setEstatisticas({
        totalVendas: 0,
        totalComissoes: 0,
        codigosAtivos: 0,
        repassesRealizados: 0,
        transacoesMes: 0,
        usuariosAtivos: 0
      })
      setTransacoes([])
      setRepasses([])
      setConteudos([])
      setCodigosCashback([])
      setNotificacoes([])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoadingEstatisticas(false)
      setLoadingTransacoes(false)
      setLoadingRepasses(false)
      setLoadingConteudos(false)
      setLoadingCodigos(false)
      setLoadingNotificacoes(false)
    }
  }

  const handleSubmitConteudo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingConteudo(true)
    
    try {
      // TODO: Implementar API para salvar conteúdo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editandoConteudo) {
        setConteudos(prev => prev.map(c => c.id === editandoConteudo.id ? { ...c, ...formConteudo } : c))
      } else {
        setConteudos(prev => [...prev, { 
          id: Date.now().toString(), 
          ...formConteudo, 
          dataPublicacao: new Date().toISOString(),
          visualizacoes: 0,
          curtidas: 0,
          dislikes: 0
        }])
      }
      
      setFormConteudo({ titulo: '', tipo: '', categoria: '', url: '', cidade: '' })
      setEditandoConteudo(null)
      setShowModalConteudo(false)
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error)
    } finally {
      setSavingConteudo(false)
    }
  }

  const handleSubmitCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingCodigo(true)
    
    try {
      // TODO: Implementar API para salvar código
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editandoCodigo) {
        setCodigosCashback(prev => prev.map(c => c.id === editandoCodigo.id ? { ...c, ...formCodigo } : c))
      } else {
        setCodigosCashback(prev => [...prev, { 
          id: Date.now().toString(), 
          ...formCodigo, 
          usosAtuais: 0,
          ativo: true,
          dataCriacao: new Date().toISOString()
        }])
      }
      
      setFormCodigo({ codigo: '', desconto: 10, maxUsos: 100, dataExpiracao: '' })
      setEditandoCodigo(null)
      setShowModalCodigo(false)
    } catch (error) {
      console.error('Erro ao salvar código:', error)
    } finally {
      setSavingCodigo(false)
    }
  }

  const handleDeleteConteudo = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este conteúdo?')) {
      setConteudos(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleDeleteCodigo = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este código?')) {
      setCodigosCashback(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleToggleCodigoAtivo = async (id: string) => {
    setCodigosCashback(prev => prev.map(c => 
      c.id === id ? { ...c, ativo: !c.ativo } : c
    ))
  }

  const handleToggleConteudoFixado = async (id: string) => {
    setConteudos(prev => prev.map(c => 
      c.id === id ? { ...c, fixado: !c.fixado } : c
    ))
  }

  const gerarCodigoUnico = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let codigo = ''
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
    }
    setFormCodigo(prev => ({ ...prev, codigo }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando painel parceiro...</p>
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
                <BuildingOfficeIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                Painel do Parceiro
              </h1>
            </div>
            <p className="text-gray-300">
              Gerencie suas promoções, acompanhe transações e controle seus códigos de cashback
            </p>
            <p className="text-sementes-accent font-semibold mt-2">
              🏢 Parceiro Oficial • {estatisticas?.usuariosAtivos} usuários ativos
            </p>
          </motion.div>

          {/* Estatísticas Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-gray-400 text-sm">Total de Vendas</p>
              <p className="text-white font-bold text-lg">R$ {estatisticas?.totalVendas?.toLocaleString('pt-BR')}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-gray-400 text-sm">Comissões</p>
              <p className="text-white font-bold text-lg">R$ {estatisticas?.totalComissoes?.toLocaleString('pt-BR')}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🎫</div>
              <p className="text-gray-400 text-sm">Códigos Ativos</p>
              <p className="text-white font-bold text-lg">{estatisticas?.codigosAtivos}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-gray-400 text-sm">Repasses</p>
              <p className="text-white font-bold text-lg">{estatisticas?.repassesRealizados}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-gray-400 text-sm">Transações/Mês</p>
              <p className="text-white font-bold text-lg">{estatisticas?.transacoesMes}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-gray-400 text-sm">Usuários Ativos</p>
              <p className="text-white font-bold text-lg">{estatisticas?.usuariosAtivos}</p>
            </div>
          </motion.div>

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
                <button
                  onClick={() => setShowModalConteudo(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Adicionar Conteúdo
                </button>
                <button
                  onClick={() => setShowModalCodigo(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <QrCodeIcon className="w-5 h-5 mr-2" />
                  Criar Código
                </button>
                <button
                  onClick={() => router.push('/admin/fundo')}
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                  Ver Fundo de Sementes
                </button>
              </div>
            </div>
          </motion.div>

          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lado Esquerdo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Conteúdos */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    📺 Meus Conteúdos
                  </h3>
                  <button
                    onClick={() => setShowModalConteudo(true)}
                    className="p-2 bg-sementes-primary hover:bg-sementes-secondary rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 text-white" />
                  </button>
                </div>

                {conteudos.length === 0 ? (
                  <div className="text-center py-8">
                    <VideoCameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Nenhum conteúdo ainda</h4>
                    <p className="text-gray-400">Comece adicionando suas promoções e conteúdos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conteudos.map((conteudo) => (
                      <div key={conteudo.id} className="p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold">{conteudo.titulo}</h4>
                            <p className="text-gray-400 text-sm">{conteudo.categoria} • {conteudo.tipo}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleConteudoFixado(conteudo.id)}
                              className={`p-1 rounded ${conteudo.fixado ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}
                              title={conteudo.fixado ? 'Desfixar' : 'Fixar'}
                            >
                              <StarIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditandoConteudo(conteudo)
                                setFormConteudo({
                                  titulo: conteudo.titulo,
                                  tipo: conteudo.tipo,
                                  categoria: conteudo.categoria,
                                  url: conteudo.url,
                                  cidade: '' // Valor padrão para cidade
                                })
                                setShowModalConteudo(true)
                              }}
                              className="p-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConteudo(conteudo.id)}
                              className="p-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <a
                            href={conteudo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sementes-primary hover:text-sementes-accent flex items-center space-x-1"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span>Ver conteúdo</span>
                          </a>
                          <div className="flex items-center space-x-4 text-gray-400">
                            <span className="flex items-center space-x-1">
                              <EyeIcon className="w-4 h-4" />
                              <span>{conteudo.visualizacoes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4" />
                              <span>{conteudo.curtidas}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transações Recentes */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  💰 Transações Recentes
                </h3>
                {transacoes.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhuma transação ainda</p>
                ) : (
                  <div className="space-y-3">
                    {transacoes.slice(0, 5).map((transacao) => (
                      <div key={transacao.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{transacao.usuario?.nome}</p>
                          <p className="text-gray-400 text-sm">Código: {transacao.codigoParceiro}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sementes-primary font-bold">R$ {transacao.valor.toFixed(2)}</p>
                          <p className={`text-xs ${transacao.status === 'aprovada' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {transacao.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Lado Direito */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Códigos de Cashback */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    🎫 Códigos de Cashback
                  </h3>
                  <button
                    onClick={() => setShowModalCodigo(true)}
                    className="p-2 bg-sementes-primary hover:bg-sementes-secondary rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 text-white" />
                  </button>
                </div>

                {codigosCashback.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhum código criado ainda</p>
                ) : (
                  <div className="space-y-3">
                    {codigosCashback.map((codigo) => (
                      <div key={codigo.id} className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold">{codigo.codigo}</h4>
                            <p className="text-gray-400 text-sm">{codigo.desconto}% de desconto</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleCodigoAtivo(codigo.id)}
                              className={`p-1 rounded text-xs ${
                                codigo.ativo ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {codigo.ativo ? 'Ativo' : 'Inativo'}
                            </button>
                            <button
                              onClick={() => {
                                setEditandoCodigo(codigo)
                                setFormCodigo({
                                  codigo: codigo.codigo,
                                  desconto: codigo.desconto,
                                  maxUsos: codigo.maxUsos,
                                  dataExpiracao: codigo.dataExpiracao || ''
                                })
                                setShowModalCodigo(true)
                              }}
                              className="p-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCodigo(codigo.id)}
                              className="p-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            Usos: {codigo.usosAtuais}/{codigo.maxUsos}
                          </span>
                          <span className="text-gray-400 text-xs">
                            Criado em {new Date(codigo.dataCriacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Repasses Pendentes */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📊 Repasses Pendentes
                </h3>
                {repasses.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhum repasse pendente</p>
                ) : (
                  <div className="space-y-3">
                    {repasses.slice(0, 3).map((repasse) => (
                      <div key={repasse.id} className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{repasse.usuario?.nome}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            repasse.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                            repasse.status === 'aprovado' ? 'bg-green-500/20 text-green-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {repasse.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            Compra: R$ {repasse.valorCompra.toFixed(2)}
                          </span>
                          <span className="text-sementes-primary font-bold">
                            Repasse: R$ {repasse.valorRepasse.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          Data: {new Date(repasse.dataCompra).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notificações */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  🔔 Notificações
                </h3>
                {notificacoes.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhuma notificação</p>
                ) : (
                  <div className="space-y-3">
                    {notificacoes.slice(0, 3).map((notificacao) => (
                      <div key={notificacao.id} className="p-3 bg-gray-700/50 rounded-lg">
                        <h4 className="text-white font-medium text-sm">{notificacao.titulo}</h4>
                        <p className="text-gray-300 text-sm">{notificacao.mensagem}</p>
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(notificacao.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Conteúdo */}
      {showModalConteudo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {editandoConteudo ? 'Editar Conteúdo' : 'Adicionar Conteúdo'}
            </h3>
            
            <form onSubmit={handleSubmitConteudo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  value={formConteudo.titulo}
                  onChange={(e) => setFormConteudo({ ...formConteudo, titulo: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={formConteudo.url}
                  onChange={(e) => setFormConteudo({ ...formConteudo, url: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
                  <select
                    value={formConteudo.tipo}
                    onChange={(e) => setFormConteudo({ ...formConteudo, tipo: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="promocao">Promoção</option>
                    <option value="produto">Produto</option>
                    <option value="servico">Serviço</option>
                    <option value="evento">Evento</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                  <select
                    value={formConteudo.categoria}
                    onChange={(e) => setFormConteudo({ ...formConteudo, categoria: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="gaming">Gaming</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="entretenimento">Entretenimento</option>
                    <option value="educacao">Educação</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
                <input
                  type="text"
                  value={formConteudo.cidade}
                  onChange={(e) => setFormConteudo({ ...formConteudo, cidade: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                  placeholder="Ex: São Paulo"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModalConteudo(false)
                    setEditandoConteudo(null)
                    setFormConteudo({ titulo: '', tipo: '', categoria: '', url: '', cidade: '' })
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingConteudo}
                  className="flex-1 bg-sementes-primary hover:bg-sementes-secondary disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {savingConteudo ? 'Salvando...' : (editandoConteudo ? 'Atualizar' : 'Adicionar')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Código */}
      {showModalCodigo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {editandoCodigo ? 'Editar Código' : 'Criar Código de Cashback'}
            </h3>
            
            <form onSubmit={handleSubmitCodigo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Código</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formCodigo.codigo}
                    onChange={(e) => setFormCodigo({ ...formCodigo, codigo: e.target.value.toUpperCase() })}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                    placeholder="Ex: PARCEIRO10"
                    required
                  />
                  <button
                    type="button"
                    onClick={gerarCodigoUnico}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    🎲
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Desconto (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formCodigo.desconto}
                    onChange={(e) => setFormCodigo({ ...formCodigo, desconto: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Máximo de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={formCodigo.maxUsos}
                    onChange={(e) => setFormCodigo({ ...formCodigo, maxUsos: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Data de Expiração (opcional)</label>
                <input
                  type="date"
                  value={formCodigo.dataExpiracao}
                  onChange={(e) => setFormCodigo({ ...formCodigo, dataExpiracao: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModalCodigo(false)
                    setEditandoCodigo(null)
                    setFormCodigo({ codigo: '', desconto: 10, maxUsos: 100, dataExpiracao: '' })
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCodigo}
                  className="flex-1 bg-sementes-primary hover:bg-sementes-secondary disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {savingCodigo ? 'Salvando...' : (editandoCodigo ? 'Atualizar' : 'Criar')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
