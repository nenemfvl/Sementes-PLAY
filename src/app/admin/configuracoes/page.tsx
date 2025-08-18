'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  Cog6ToothIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BellIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

interface ConfiguracaoSistema {
  id: string
  categoria: 'geral' | 'financeiro' | 'seguranca' | 'notificacoes' | 'integracao'
  nome: string
  descricao: string
  valor: string | number | boolean
  tipo: 'text' | 'number' | 'boolean' | 'select'
  opcoes?: string[]
  obrigatorio: boolean
  editavel: boolean
}

export default function AdminConfiguracoes() {
  const { usuario, isAuthenticated } = useAuth()
  const router = useRouter()
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState<Record<string, any>>({})
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info', mensagem: string } | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [configToReset, setConfigToReset] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!usuario || Number(usuario.nivel) < 5) {
      router.push('/')
      return
    }

    carregarConfiguracoes()
  }, [usuario, isAuthenticated, router])

  const carregarConfiguracoes = async () => {
    try {
      // TODO: Implementar API para buscar configurações
      // Por enquanto, usando dados mockados para desenvolvimento
      setConfiguracoes([
        // Configurações Gerais
        {
          id: 'site_nome',
          categoria: 'geral',
          nome: 'Nome do Site',
          descricao: 'Nome exibido no cabeçalho e título das páginas',
          valor: 'SementesPLAY',
          tipo: 'text',
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'site_descricao',
          categoria: 'geral',
          nome: 'Descrição do Site',
          descricao: 'Descrição meta para SEO e redes sociais',
          valor: 'Plataforma de cashback para FiveM com sistema de criadores',
          tipo: 'text',
          obrigatorio: false,
          editavel: true
        },
        {
          id: 'manutencao',
          categoria: 'geral',
          nome: 'Modo Manutenção',
          descricao: 'Ativa o modo manutenção, bloqueando acesso de usuários',
          valor: false,
          tipo: 'boolean',
          obrigatorio: false,
          editavel: true
        },
        {
          id: 'registro_aberto',
          categoria: 'geral',
          nome: 'Registro Aberto',
          descricao: 'Permite que novos usuários se registrem no sistema',
          valor: true,
          tipo: 'boolean',
          obrigatorio: false,
          editavel: true
        },

        // Configurações Financeiras
        {
          id: 'percentual_cashback',
          categoria: 'financeiro',
          nome: 'Percentual de Cashback',
          descricao: 'Percentual padrão de cashback para usuários (em %)',
          valor: 5,
          tipo: 'number',
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'percentual_fundo',
          categoria: 'financeiro',
          nome: 'Percentual para Fundo',
          descricao: 'Percentual que vai para o fundo de sementes (em %)',
          valor: 2.5,
          tipo: 'number',
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'percentual_manutencao',
          categoria: 'financeiro',
          nome: 'Percentual para Manutenção',
          descricao: 'Percentual para manutenção do sistema (em %)',
          valor: 2.5,
          tipo: 'number',
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'moeda_padrao',
          categoria: 'financeiro',
          nome: 'Moeda Padrão',
          descricao: 'Moeda padrão para transações no sistema',
          valor: 'BRL',
          tipo: 'select',
          opcoes: ['BRL', 'USD', 'EUR'],
          obrigatorio: true,
          editavel: true
        },

        // Configurações de Segurança
        {
          id: 'forca_senha',
          categoria: 'seguranca',
          nome: 'Força Mínima da Senha',
          descricao: 'Nível mínimo de força para senhas de usuários',
          valor: 'media',
          tipo: 'select',
          opcoes: ['baixa', 'media', 'alta'],
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'tentativas_login',
          categoria: 'seguranca',
          nome: 'Tentativas de Login',
          descricao: 'Número máximo de tentativas de login antes do bloqueio',
          valor: 5,
          tipo: 'number',
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'tempo_bloqueio',
          categoria: 'seguranca',
          nome: 'Tempo de Bloqueio (minutos)',
          descricao: 'Tempo de bloqueio após exceder tentativas de login',
          valor: 30,
          tipo: 'number',
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'verificacao_email',
          categoria: 'seguranca',
          nome: 'Verificação de Email',
          descricao: 'Obriga verificação de email para novos usuários',
          valor: true,
          tipo: 'boolean',
          obrigatorio: false,
          editavel: true
        },

        // Configurações de Notificações
        {
          id: 'email_notificacoes',
          categoria: 'notificacoes',
          nome: 'Notificações por Email',
          descricao: 'Envia notificações por email para usuários',
          valor: true,
          tipo: 'boolean',
          obrigatorio: false,
          editavel: true
        },
        {
          id: 'push_notificacoes',
          categoria: 'notificacoes',
          nome: 'Notificações Push',
          descricao: 'Ativa notificações push no navegador',
          valor: true,
          tipo: 'boolean',
          obrigatorio: false,
          editavel: true
        },

        // Configurações de Integração
        {
          id: 'cloudinary_cloud_name',
          categoria: 'integracao',
          nome: 'Cloudinary Cloud Name',
          descricao: 'Nome da cloud para upload de imagens',
          valor: 'sementesplay',
          tipo: 'text',
          obrigatorio: true,
          editavel: true
        },
        {
          id: 'google_analytics',
          categoria: 'integracao',
          nome: 'Google Analytics ID',
          descricao: 'ID do Google Analytics para rastreamento',
          valor: 'G-XXXXXXXXXX',
          tipo: 'text',
          obrigatorio: false,
          editavel: true
        }
      ])

      // Inicializar estado de edição
      const initialEditing: Record<string, any> = {}
      configuracoes.forEach(config => {
        initialEditing[config.id] = config.valor
      })
      setEditingConfig(initialEditing)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const salvarConfiguracao = async (configId: string) => {
    try {
      // TODO: Implementar API para salvar configuração
      setNotificacao({ tipo: 'sucesso', mensagem: 'Configuração salva com sucesso!' })
      
      // Atualizar valor local
      setConfiguracoes(prev => prev.map(config => 
        config.id === configId 
          ? { ...config, valor: editingConfig[configId] }
          : config
      ))
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao salvar configuração' })
    }
  }

  const resetarConfiguracao = async (configId: string) => {
    try {
      // TODO: Implementar API para resetar configuração
      setNotificacao({ tipo: 'sucesso', mensagem: 'Configuração resetada com sucesso!' })
      
      // Restaurar valor original
      const configOriginal = configuracoes.find(c => c.id === configId)
      if (configOriginal) {
        setEditingConfig(prev => ({ ...prev, [configId]: configOriginal.valor }))
      }
      
      setShowConfirmModal(false)
      setConfigToReset(null)
    } catch (error) {
      console.error('Erro ao resetar configuração:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao resetar configuração' })
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'geral': return GlobeAltIcon
      case 'financeiro': return CurrencyDollarIcon
      case 'seguranca': return ShieldCheckIcon
      case 'notificacoes': return BellIcon
      case 'integracao': return KeyIcon
      default: return Cog6ToothIcon
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'geral': return 'bg-blue-500/20 text-blue-300'
      case 'financeiro': return 'bg-green-500/20 text-green-300'
      case 'seguranca': return 'bg-red-500/20 text-red-300'
      case 'notificacoes': return 'bg-yellow-500/20 text-yellow-300'
      case 'integracao': return 'bg-purple-500/20 text-purple-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getCategoriaText = (categoria: string) => {
    switch (categoria) {
      case 'geral': return 'Geral'
      case 'financeiro': return 'Financeiro'
      case 'seguranca': return 'Segurança'
      case 'notificacoes': return 'Notificações'
      case 'integracao': return 'Integração'
      default: return categoria
    }
  }

  const renderInput = (config: ConfiguracaoSistema) => {
    const valor = editingConfig[config.id] ?? config.valor

    switch (config.tipo) {
      case 'text':
        return (
          <input
            type="text"
            value={valor as string}
            onChange={(e) => setEditingConfig(prev => ({ ...prev, [config.id]: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
            disabled={!config.editavel}
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={valor as number}
            onChange={(e) => setEditingConfig(prev => ({ ...prev, [config.id]: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
            disabled={!config.editavel}
            step="0.01"
            min="0"
          />
        )
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditingConfig(prev => ({ ...prev, [config.id]: !valor }))}
              disabled={!config.editavel}
              className={`w-12 h-6 rounded-full transition-colors ${
                valor ? 'bg-sementes-primary' : 'bg-gray-600'
              } ${!config.editavel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                valor ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="text-gray-300 text-sm">
              {valor ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        )
      
      case 'select':
        return (
          <select
            value={valor as string}
            onChange={(e) => setEditingConfig(prev => ({ ...prev, [config.id]: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
            disabled={!config.editavel}
          >
            {config.opcoes?.map(opcao => (
              <option key={opcao} value={opcao}>{opcao}</option>
            ))}
          </select>
        )
      
      default:
        return <span className="text-gray-400">Tipo não suportado</span>
    }
  }

  const agruparPorCategoria = () => {
    const grupos: Record<string, ConfiguracaoSistema[]> = {}
    configuracoes.forEach(config => {
      if (!grupos[config.categoria]) {
        grupos[config.categoria] = []
      }
      grupos[config.categoria].push(config)
    })
    return grupos
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando configurações...</p>
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
                  <Cog6ToothIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Configurações do Sistema
                </h1>
                <p className="text-gray-300">Gerencie configurações gerais e parâmetros do sistema</p>
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

          {/* Configurações por Categoria */}
          <div className="space-y-8">
            {Object.entries(agruparPorCategoria()).map(([categoria, configs]) => (
              <motion.div
                key={categoria}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card"
              >
                <div className="flex items-center space-x-3 mb-6">
                  {React.createElement(getCategoriaIcon(categoria), { className: 'w-6 h-6 text-sementes-primary' })}
                  <h2 className="text-xl font-bold text-white">{getCategoriaText(categoria)}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoriaColor(categoria)}`}>
                    {configs.length} configuração{configs.length !== 1 ? 'ões' : ''}
                  </span>
                </div>

                <div className="space-y-6">
                  {configs.map((config) => (
                    <div key={config.id} className="border-b border-gray-600/30 pb-6 last:border-b-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-white font-medium">{config.nome}</h3>
                            {config.obrigatorio && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                                Obrigatório
                              </span>
                            )}
                            {!config.editavel && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">
                                Somente Leitura
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-4">{config.descricao}</p>
                          
                          <div className="flex items-center space-x-3">
                            {renderInput(config)}
                            
                            {config.editavel && (
                              <>
                                <button
                                  onClick={() => salvarConfiguracao(config.id)}
                                  className="btn-primary flex items-center space-x-2 text-sm"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                  <span>Salvar</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setConfigToReset(config.id)
                                    setShowConfirmModal(true)
                                  }}
                                  className="btn-secondary flex items-center space-x-2 text-sm"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                  <span>Resetar</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="lg:col-span-1">
                          <div className="bg-gray-700/50 p-4 rounded-lg">
                            <h4 className="text-gray-300 font-medium mb-2">Valor Atual</h4>
                            <div className="text-white font-mono text-sm break-all">
                              {config.tipo === 'boolean' 
                                ? (config.valor ? 'true' : 'false')
                                : String(config.valor)
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && configToReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Confirmar Reset</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Tem certeza que deseja resetar esta configuração para o valor padrão? 
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => resetarConfiguracao(configToReset)}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Confirmar</span>
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setConfigToReset(null)
                }}
                className="btn-secondary flex items-center space-x-2"
              >
                <XCircleIcon className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
