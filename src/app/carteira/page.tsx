'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  CalendarIcon,
  FilterIcon
} from '@heroicons/react/24/outline'

interface Carteira {
  id: string
  saldo: number
  saldoPendente: number
  totalRecebido: number
  totalSacado: number
  usuario: {
    nome: string
    nivel: string
    sementes: number
  }
  movimentacoes: Movimentacao[]
}

interface Movimentacao {
  id: string
  tipo: 'credito' | 'debito' | 'pendente'
  valor: number
  saldoAnterior: number
  saldoPosterior: number
  descricao: string
  referencia: string
  status: string
  data: string
}

export default function CarteiraPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [carteira, setCarteira] = useState<Carteira | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSaldo, setShowSaldo] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroData, setFiltroData] = useState<string>('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          setUsuario(dadosUsuario)
          carregarCarteira(dadosUsuario.id)
        } catch (error) {
          console.error('Erro ao ler dados do usuário:', error)
          localStorage.removeItem('usuario-dados')
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    }
    verificarAutenticacao()
  }, [router])

  const carregarCarteira = async (usuarioId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/carteira?usuarioId=${usuarioId}`)
      
      if (response.ok) {
        const data = await response.json()
        setCarteira(data.carteira)
      } else {
        console.error('Erro ao carregar carteira')
      }
    } catch (error) {
      console.error('Erro ao carregar carteira:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarMovimentacoes = async (usuarioId: string, paginaAtual: number = 1) => {
    try {
      let url = `/api/carteira/movimentacoes?usuarioId=${usuarioId}&pagina=${paginaAtual}`
      
      if (filtroTipo) url += `&tipo=${filtroTipo}`
      if (filtroData) {
        const data = new Date(filtroData)
        const dataFim = new Date(data)
        dataFim.setDate(dataFim.getDate() + 1)
        url += `&dataInicio=${data.toISOString()}&dataFim=${dataFim.toISOString()}`
      }

      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setCarteira(prev => prev ? {
          ...prev,
          movimentacoes: data.dados.movimentacoes
        } : null)
        setTotalPaginas(data.dados.paginacao.totalPaginas)
        setPagina(paginaAtual)
      }
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error)
    }
  }

  const aplicarFiltros = () => {
    if (usuario) {
      carregarMovimentacoes(usuario.id, 1)
    }
  }

  const limparFiltros = () => {
    setFiltroTipo('')
    setFiltroData('')
    if (usuario) {
      carregarMovimentacoes(usuario.id, 1)
    }
  }

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case 'credito':
        return <PlusIcon className="w-4 h-4 text-green-500" />
      case 'debito':
        return <MinusIcon className="w-4 h-4 text-red-500" />
      case 'pendente':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
      default:
        return <ArrowPathIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case 'credito':
        return 'text-green-500 bg-green-500/10'
      case 'debito':
        return 'text-red-500 bg-red-500/10'
      case 'pendente':
        return 'text-yellow-500 bg-yellow-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando carteira...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sss-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors mr-4"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-4xl font-bold text-white">
                <CurrencyDollarIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                Minha Carteira
              </h1>
            </div>
            <p className="text-gray-300">
              Gerencie suas sementes, acompanhe movimentações e visualize seu histórico financeiro
            </p>
          </motion.div>

          {/* Cards de Saldo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Saldo Principal */}
            <div className="card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-sementes-primary" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Saldo Disponível</p>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowSaldo(!showSaldo)}
                  className="mr-2 text-gray-400 hover:text-white"
                >
                  {showSaldo ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                </button>
                <p className="text-2xl font-bold text-white">
                  {showSaldo ? `${formatarValor(carteira?.saldo || 0)}` : '••••••'}
                </p>
              </div>
              <p className="text-sm text-sementes-primary mt-1">Sementes</p>
            </div>

            {/* Saldo Pendente */}
            <div className="card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <ClockIcon className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Saldo Pendente</p>
              <p className="text-2xl font-bold text-white">
                {formatarValor(carteira?.saldoPendente || 0)}
              </p>
              <p className="text-sm text-yellow-500 mt-1">Sementes</p>
            </div>

            {/* Total Recebido */}
            <div className="card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <TrendingUpIcon className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Recebido</p>
              <p className="text-2xl font-bold text-white">
                {formatarValor(carteira?.totalRecebido || 0)}
              </p>
              <p className="text-sm text-green-500 mt-1">Sementes</p>
            </div>

            {/* Total Sacado */}
            <div className="card p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <TrendingDownIcon className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Sacado</p>
              <p className="text-2xl font-bold text-white">
                {formatarValor(carteira?.totalSacado || 0)}
              </p>
              <p className="text-sm text-red-500 mt-1">Sementes</p>
            </div>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <FilterIcon className="w-5 h-5 text-gray-400" />
                <span className="text-white font-medium">Filtros:</span>
              </div>
              
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
              >
                <option value="">Todos os tipos</option>
                <option value="credito">Créditos</option>
                <option value="debito">Débitos</option>
                <option value="pendente">Pendentes</option>
              </select>

              <input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
              />

              <button
                onClick={aplicarFiltros}
                className="bg-sementes-primary hover:bg-sementes-secondary text-white px-4 py-2 rounded-lg transition-colors"
              >
                Aplicar
              </button>

              <button
                onClick={limparFiltros}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Limpar
              </button>
            </div>
          </motion.div>

          {/* Movimentações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                <ChartBarIcon className="w-6 h-6 inline mr-2 text-sementes-primary" />
                Histórico de Movimentações
              </h3>
              
              <button
                onClick={() => usuario && carregarMovimentacoes(usuario.id, pagina)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {carteira?.movimentacoes && carteira.movimentacoes.length > 0 ? (
              <div className="space-y-4">
                {carteira.movimentacoes.map((movimentacao) => (
                  <div
                    key={movimentacao.id}
                    className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getTipoIcone(movimentacao.tipo)}
                        <div>
                          <p className="text-white font-medium">{movimentacao.descricao}</p>
                          <p className="text-gray-400 text-sm">
                            {movimentacao.referencia}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getTipoCor(movimentacao.tipo)} px-3 py-1 rounded-full`}>
                          {movimentacao.tipo === 'debito' ? '-' : '+'}
                          {formatarValor(movimentacao.valor)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Saldo: {formatarValor(movimentacao.saldoPosterior)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatarData(movimentacao.data)}</span>
                      </span>
                      
                      <span className={`px-2 py-1 rounded text-xs ${getTipoCor(movimentacao.tipo)}`}>
                        {movimentacao.tipo.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Nenhuma movimentação</h4>
                <p className="text-gray-400">Sua carteira ainda não possui movimentações</p>
              </div>
            )}

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => usuario && carregarMovimentacoes(usuario.id, pagina - 1)}
                    disabled={pagina <= 1}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-3 py-2 text-white">
                    {pagina} de {totalPaginas}
                  </span>
                  
                  <button
                    onClick={() => usuario && carregarMovimentacoes(usuario.id, pagina + 1)}
                    disabled={pagina >= totalPaginas}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
