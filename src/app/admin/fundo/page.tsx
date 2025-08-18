'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  GiftIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface FundoSementes {
  id: string
  ciclo: number
  valorTotal: number
  dataInicio: Date
  dataFim: Date
  distribuido: boolean
}

interface DistribuicaoFundo {
  id: string
  fundoId: string
  usuarioId?: string
  criadorId?: string
  valor: number
  tipo: string
  data: Date
  usuario?: {
    nome: string
    email: string
  }
  criador?: {
    nome: string
    email: string
  }
}

export default function AdminFundoPage() {
  const router = useRouter()
  const [fundoAtual, setFundoAtual] = useState<FundoSementes | null>(null)
  const [distribuicoes, setDistribuicoes] = useState<DistribuicaoFundo[]>([])
  const [loading, setLoading] = useState(true)
  const [distribuindo, setDistribuindo] = useState(false)
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
            carregarDados()
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

  const carregarFundo = async () => {
    try {
      // TODO: Implementar API para buscar fundo atual
      // Por enquanto, usando dados mockados para desenvolvimento
      setFundoAtual({
        id: '1',
        ciclo: 1,
        valorTotal: 0,
        dataInicio: new Date(),
        dataFim: new Date(),
        distribuido: false
      })
      setDistribuicoes([])
    } catch (error) {
      console.error('Erro ao carregar fundo:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar fundo de sementes' })
    } finally {
      setLoading(false)
    }
  }

  const distribuirFundo = async () => {
    if (!fundoAtual) return
    
    if (!window.confirm('Distribuir fundo de sementes para criadores e usuários?')) return
    
    setDistribuindo(true)
    
    try {
      // TODO: Implementar API para distribuir fundo
      // Isso deve:
      // 1. Calcular distribuição baseada em pontuação/XP
      // 2. Criar registros de distribuição
      // 3. Atualizar carteiras dos usuários/criadores
      // 4. Marcar fundo como distribuído
      
      setNotificacao({ tipo: 'sucesso', mensagem: 'Fundo distribuído com sucesso! Criadores e usuários receberam suas sementes.' })
      carregarFundo()
    } catch (error) {
      console.error('Erro ao distribuir fundo:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao distribuir fundo. Verifique o console para mais detalhes.' })
    } finally {
      setDistribuindo(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando fundo de sementes...</p>
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
                  <GiftIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Fundo de Sementes
                </h1>
                <p className="text-gray-300">Distribua o fundo de sementes para criadores e usuários</p>
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

          {/* Informações do Fundo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <GiftIcon className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-white">Fundo de Sementes Atual</h2>
              </div>
            </div>
            
            {fundoAtual ? (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-500/20 p-4 rounded-lg">
                    <GiftIcon className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Valor Total Disponível</p>
                    <p className="text-3xl font-bold text-white">R$ {fundoAtual.valorTotal.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">Ciclo {fundoAtual.ciclo}</p>
                  </div>
                </div>
                
                {!fundoAtual.distribuido && fundoAtual.valorTotal > 0 && (
                  <button 
                    onClick={distribuirFundo} 
                    disabled={distribuindo} 
                    className="btn-primary text-lg px-6 py-3 disabled:opacity-50"
                  >
                    {distribuindo ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Distribuindo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <GiftIcon className="w-5 h-5" />
                        <span>Distribuir Fundo</span>
                      </div>
                    )}
                  </button>
                )}
                
                {fundoAtual.distribuido && (
                  <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-medium">
                    ✅ Fundo já distribuído
                  </span>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <GiftIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum fundo de sementes pendente de distribuição</p>
              </div>
            )}
          </motion.div>

          {/* Histórico de Distribuições */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-white">Histórico de Distribuições</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 text-gray-400 font-medium">Tipo</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Destinatário</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Valor</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {distribuicoes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 p-8">
                        <ChartBarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma distribuição encontrada</p>
                      </td>
                    </tr>
                  ) : distribuicoes.map((distribuicao) => (
                    <tr key={distribuicao.id} className="border-b border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          distribuicao.tipo === 'criador' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {distribuicao.tipo === 'criador' ? 'Criador' : 'Usuário'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {distribuicao.tipo === 'criador' ? (
                            <UserGroupIcon className="w-4 h-4 text-purple-400" />
                          ) : (
                            <UsersIcon className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-white">
                            {distribuicao.criador?.nome || distribuicao.usuario?.nome || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-green-400 font-semibold">R$ {distribuicao.valor.toFixed(2)}</span>
                      </td>
                      <td className="p-3 text-gray-300 text-sm">
                        {new Date(distribuicao.data).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
