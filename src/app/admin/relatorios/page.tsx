'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  UsersIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline'

interface RelatorioGeral {
  periodo: string
  totalUsuarios: number
  totalCriadores: number
  totalParceiros: number
  totalRepasses: number
  totalGanhos: number
  totalConteudos: number
  totalVisualizacoes: number
  crescimentoUsuarios: number
  crescimentoRepasses: number
  topCriadores: TopCriador[]
  topParceiros: TopParceiro[]
  estatisticasMensais: EstatisticaMensal[]
}

interface TopCriador {
  id: string
  nome: string
  categoria: string
  totalConteudos: number
  totalVisualizacoes: number
  totalGanhos: number
}

interface TopParceiro {
  id: string
  nome: string
  cidade: string
  totalRepasses: number
  totalGanhos: number
  totalUsuarios: number
}

interface EstatisticaMensal {
  mes: string
  usuarios: number
  repasses: number
  ganhos: number
  conteudos: number
}

export default function AdminRelatorios() {
  const { usuario, isAuthenticated } = useAuth()
  const router = useRouter()
  const [relatorio, setRelatorio] = useState<RelatorioGeral | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30dias')
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

    carregarRelatorio()
  }, [usuario, isAuthenticated, router, periodoSelecionado])

  const carregarRelatorio = async () => {
    try {
      // TODO: Implementar API para buscar relatórios
      // Por enquanto, usando dados mockados para desenvolvimento
      setRelatorio({
        periodo: periodoSelecionado === '30dias' ? 'Últimos 30 dias' : 
                periodoSelecionado === '90dias' ? 'Últimos 90 dias' : 'Último ano',
        totalUsuarios: 1250,
        totalCriadores: 45,
        totalParceiros: 23,
        totalRepasses: 156,
        totalGanhos: 31200.50,
        totalConteudos: 234,
        totalVisualizacoes: 89000,
        crescimentoUsuarios: 12.5,
        crescimentoRepasses: 8.3,
        topCriadores: [
          {
            id: '1',
            nome: 'Carlos Silva',
            categoria: 'Veículos',
            totalConteudos: 45,
            totalVisualizacoes: 12500,
            totalGanhos: 1250.50
          },
          {
            id: '2',
            nome: 'Ana Costa',
            categoria: 'Scripts',
            totalConteudos: 78,
            totalVisualizacoes: 28900,
            totalGanhos: 3200.75
          },
          {
            id: '3',
            nome: 'Pedro Santos',
            categoria: 'Maps',
            totalConteudos: 23,
            totalVisualizacoes: 5600,
            totalGanhos: 450.25
          }
        ],
        topParceiros: [
          {
            id: '1',
            nome: 'João Silva',
            cidade: 'São Paulo',
            totalRepasses: 45,
            totalGanhos: 8900.50,
            totalUsuarios: 1250
          },
          {
            id: '2',
            nome: 'Maria Santos',
            cidade: 'Rio de Janeiro',
            totalRepasses: 32,
            totalGanhos: 6400.75,
            totalUsuarios: 980
          },
          {
            id: '3',
            nome: 'Pedro Costa',
            cidade: 'Belo Horizonte',
            totalRepasses: 18,
            totalGanhos: 3600.25,
            totalUsuarios: 650
          }
        ],
        estatisticasMensais: [
          { mes: 'Jan', usuarios: 1200, repasses: 45, ganhos: 8900, conteudos: 23 },
          { mes: 'Fev', usuarios: 1250, repasses: 52, ganhos: 10200, conteudos: 28 },
          { mes: 'Mar', usuarios: 1300, repasses: 48, ganhos: 9500, conteudos: 31 },
          { mes: 'Abr', usuarios: 1280, repasses: 55, ganhos: 11000, conteudos: 29 },
          { mes: 'Mai', usuarios: 1320, repasses: 58, ganhos: 11500, conteudos: 35 },
          { mes: 'Jun', usuarios: 1350, repasses: 62, ganhos: 12200, conteudos: 38 }
        ]
      })
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao carregar relatório' })
    } finally {
      setLoading(false)
    }
  }

  const exportarRelatorio = async (formato: 'pdf' | 'excel') => {
    try {
      // TODO: Implementar API para exportar relatório
      setNotificacao({ tipo: 'sucesso', mensagem: `Relatório exportado em ${formato.toUpperCase()} com sucesso!` })
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      setNotificacao({ tipo: 'erro', mensagem: 'Erro ao exportar relatório' })
    }
  }

  const getCrescimentoColor = (valor: number) => {
    return valor >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getCrescimentoIcon = (valor: number) => {
    return valor >= 0 ? TrendingUpIcon : TrendingDownIcon
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  if (!relatorio) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center text-gray-400">
          <ChartBarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Nenhum relatório disponível</p>
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
                  <ChartBarIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                  Relatórios
                </h1>
                <p className="text-gray-300">Estatísticas e relatórios do sistema</p>
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

          {/* Controles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card mb-6"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Período:</label>
                <select
                  value={periodoSelecionado}
                  onChange={(e) => setPeriodoSelecionado(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sementes-primary focus:border-transparent"
                >
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                  <option value="1ano">Último ano</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => exportarRelatorio('pdf')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>Exportar PDF</span>
                </button>
                <button
                  onClick={() => exportarRelatorio('excel')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Estatísticas Principais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Usuários</p>
                  <p className="text-2xl font-bold text-white">{relatorio.totalUsuarios.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    {React.createElement(getCrescimentoIcon(relatorio.crescimentoUsuarios), { 
                      className: `w-4 h-4 ${getCrescimentoColor(relatorio.crescimentoUsuarios)}` 
                    })}
                    <span className={`text-sm ${getCrescimentoColor(relatorio.crescimentoUsuarios)}`}>
                      {relatorio.crescimentoUsuarios}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Repasses</p>
                  <p className="text-2xl font-bold text-white">{relatorio.totalRepasses}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    {React.createElement(getCrescimentoIcon(relatorio.crescimentoRepasses), { 
                      className: `w-4 h-4 ${getCrescimentoColor(relatorio.crescimentoRepasses)}` 
                    })}
                    <span className={`text-sm ${getCrescimentoColor(relatorio.crescimentoRepasses)}`}>
                      {relatorio.crescimentoRepasses}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Ganhos</p>
                  <p className="text-2xl font-bold text-white">R$ {relatorio.totalGanhos.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-2">Período selecionado</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Conteúdos</p>
                  <p className="text-2xl font-bold text-white">{relatorio.totalConteudos}</p>
                  <p className="text-sm text-gray-400 mt-2">{relatorio.totalVisualizacoes.toLocaleString()} visualizações</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gráfico de Estatísticas Mensais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Evolução Mensal</h2>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-6 gap-4 mb-4">
                  {relatorio.estatisticasMensais.map((estatistica, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm text-gray-400 mb-2">{estatistica.mes}</p>
                      <div className="space-y-2">
                        <div className="bg-blue-500/20 p-2 rounded">
                          <p className="text-xs text-blue-300">Usuários</p>
                          <p className="text-sm font-bold text-white">{estatistica.usuarios}</p>
                        </div>
                        <div className="bg-green-500/20 p-2 rounded">
                          <p className="text-xs text-green-300">Repasses</p>
                          <p className="text-sm font-bold text-white">{estatistica.repasses}</p>
                        </div>
                        <div className="bg-yellow-500/20 p-2 rounded">
                          <p className="text-xs text-yellow-300">Ganhos</p>
                          <p className="text-sm font-bold text-white">R$ {estatistica.ganhos}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Criadores e Parceiros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Criadores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Top Criadores</h2>
                <UserGroupIcon className="w-6 h-6 text-purple-400" />
              </div>
              
              <div className="space-y-4">
                {relatorio.topCriadores.map((criador, index) => (
                  <div key={criador.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-sementes-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{criador.nome}</p>
                        <p className="text-gray-400 text-sm">{criador.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{criador.totalConteudos} conteúdos</p>
                      <p className="text-gray-400 text-sm">{criador.totalVisualizacoes.toLocaleString()} visualizações</p>
                      <p className="text-sementes-primary text-sm font-medium">R$ {criador.totalGanhos.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Parceiros */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Top Parceiros</h2>
                <BuildingOfficeIcon className="w-6 h-6 text-green-400" />
              </div>
              
              <div className="space-y-4">
                {relatorio.topParceiros.map((parceiro, index) => (
                  <div key={parceiro.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-sementes-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{parceiro.nome}</p>
                        <p className="text-gray-400 text-sm">{parceiro.cidade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{parceiro.totalRepasses} repasses</p>
                      <p className="text-gray-400 text-sm">{parceiro.totalUsuarios} usuários</p>
                      <p className="text-sementes-primary text-sm font-medium">R$ {parceiro.totalGanhos.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Resumo do Período */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Resumo do Período</h2>
              <CalendarIcon className="w-6 h-6 text-blue-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <UsersIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{relatorio.totalUsuarios}</p>
                <p className="text-gray-400">Usuários Ativos</p>
              </div>
              
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <UserGroupIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{relatorio.totalCriadores}</p>
                <p className="text-gray-400">Criadores</p>
              </div>
              
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <BuildingOfficeIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{relatorio.totalParceiros}</p>
                <p className="text-gray-400">Parceiros</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-sementes-primary/10 border border-sementes-primary/20 rounded-lg">
              <p className="text-center text-sementes-primary font-medium">
                Período: {relatorio.periodo} | 
                Total de Ganhos: R$ {relatorio.totalGanhos.toLocaleString()} | 
                Total de Repasses: {relatorio.totalRepasses}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
