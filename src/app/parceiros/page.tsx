'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  EyeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Parceiro {
  id: string
  nome: string
  email: string
  nomeCidade: string
  avatar: string
  nivel: string
  sementes: number
  comissaoMensal: number
  totalVendas: number
  posicao: number
  dataCriacao: string
  status: 'ativo' | 'inativo' | 'pendente'
  categoria: string
  telefone?: string
  site?: string
  descricao?: string
}

export default function Parceiros() {
  const { usuario, isAuthenticated } = useAuth()
  const router = useRouter()
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCidade, setSelectedCidade] = useState('todas')
  const [selectedNivel, setSelectedNivel] = useState('todos')
  const [selectedParceiro, setSelectedParceiro] = useState<Parceiro | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    carregarParceiros()
  }, [usuario, isAuthenticated, router])

  const carregarParceiros = async () => {
    try {
      // TODO: Implementar API para buscar parceiros
      // Por enquanto, usando dados mockados
      setParceiros([
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          nomeCidade: 'São Paulo',
          avatar: '',
          nivel: 'Ouro',
          sementes: 15000,
          comissaoMensal: 2500,
          totalVendas: 125000,
          posicao: 1,
          dataCriacao: '2024-01-01',
          status: 'ativo',
          categoria: 'E-commerce',
          telefone: '(11) 99999-9999',
          site: 'www.joao.com.br',
          descricao: 'Especialista em produtos digitais e serviços online.'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@exemplo.com',
          nomeCidade: 'Rio de Janeiro',
          avatar: '',
          nivel: 'Prata',
          sementes: 8500,
          comissaoMensal: 1800,
          totalVendas: 89000,
          posicao: 2,
          dataCriacao: '2024-01-15',
          status: 'ativo',
          categoria: 'Moda',
          telefone: '(21) 88888-8888',
          site: 'www.maria.com.br',
          descricao: 'Loja de roupas e acessórios com as melhores marcas.'
        },
        {
          id: '3',
          nome: 'Pedro Costa',
          email: 'pedro@exemplo.com',
          nomeCidade: 'Belo Horizonte',
          avatar: '',
          nivel: 'Bronze',
          sementes: 5200,
          comissaoMensal: 1200,
          totalVendas: 65000,
          posicao: 3,
          dataCriacao: '2024-02-01',
          status: 'ativo',
          categoria: 'Tecnologia',
          telefone: '(31) 77777-7777',
          site: 'www.pedro.com.br',
          descricao: 'Produtos de tecnologia e gadgets para todos os gostos.'
        },
        {
          id: '4',
          nome: 'Ana Oliveira',
          email: 'ana@exemplo.com',
          nomeCidade: 'Salvador',
          avatar: '',
          nivel: 'Ouro',
          sementes: 12000,
          comissaoMensal: 2200,
          totalVendas: 110000,
          posicao: 4,
          dataCriacao: '2024-01-10',
          status: 'ativo',
          categoria: 'Beleza',
          telefone: '(71) 66666-6666',
          site: 'www.ana.com.br',
          descricao: 'Produtos de beleza e cosméticos com qualidade premium.'
        },
        {
          id: '5',
          nome: 'Carlos Ferreira',
          email: 'carlos@exemplo.com',
          nomeCidade: 'Fortaleza',
          avatar: '',
          nivel: 'Prata',
          sementes: 7800,
          comissaoMensal: 1600,
          totalVendas: 75000,
          posicao: 5,
          dataCriacao: '2024-01-20',
          status: 'ativo',
          categoria: 'Esportes',
          telefone: '(85) 55555-5555',
          site: 'www.carlos.com.br',
          descricao: 'Equipamentos esportivos e roupas para todas as modalidades.'
        }
      ])
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const cidades = ['todas', ...Array.from(new Set(parceiros.map(p => p.nomeCidade)))]
  const niveis = ['todos', 'Ouro', 'Prata', 'Bronze']

  const parceirosFiltrados = parceiros.filter(parceiro => 
    parceiro.status === 'ativo' &&
    (searchTerm === '' || parceiro.nome.toLowerCase().includes(searchTerm.toLowerCase()) || parceiro.categoria.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCidade === 'todas' || parceiro.nomeCidade === selectedCidade) &&
    (selectedNivel === 'todos' || parceiro.nivel === selectedNivel)
  )

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Ouro': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'Prata': return 'bg-gray-400/20 text-gray-300 border-gray-400/30'
      case 'Bronze': return 'bg-orange-600/20 text-orange-300 border-orange-600/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'Ouro': return '🥇'
      case 'Prata': return '🥈'
      case 'Bronze': return '🥉'
      default: return '⭐'
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
                Parceiros
              </h1>
            </div>
            <p className="text-gray-300">
              Encontre parceiros em sua cidade e comece a ganhar cashback
            </p>
            <p className="text-sementes-accent font-semibold mt-2">
              🎯 Use o cupom <strong>sementesplay10</strong> e receba 5% de volta em Sementes!
            </p>
          </motion.div>

          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🏢</div>
              <p className="text-gray-400 text-sm">Total de Parceiros</p>
              <p className="text-white font-bold text-lg">{parceiros.filter(p => p.status === 'ativo').length}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🌍</div>
              <p className="text-gray-400 text-sm">Cidades</p>
              <p className="text-white font-bold text-lg">{Array.from(new Set(parceiros.map(p => p.nomeCidade))).length}</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-gray-400 text-sm">Total em Vendas</p>
              <p className="text-white font-bold text-lg">R$ {(parceiros.reduce((acc, p) => acc + p.totalVendas, 0) / 1000).toFixed(0)}k</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🎁</div>
              <p className="text-gray-400 text-sm">Cashback Disponível</p>
              <p className="text-white font-bold text-lg">{(parceiros.reduce((acc, p) => acc + p.totalVendas, 0) * 0.05).toFixed(0)} Sementes</p>
            </div>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar parceiros por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sementes-primary"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCidade}
                    onChange={(e) => setSelectedCidade(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-sementes-primary"
                  >
                    {cidades.map((cidade) => (
                      <option key={cidade} value={cidade}>
                        {cidade === 'todas' ? 'Todas as Cidades' : cidade}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedNivel}
                    onChange={(e) => setSelectedNivel(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-sementes-primary"
                  >
                    {niveis.map((nivel) => (
                      <option key={nivel} value={nivel}>
                        {nivel === 'todos' ? 'Todos os Níveis' : nivel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Parceiros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {parceirosFiltrados.length === 0 ? (
              <div className="card text-center py-12">
                <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum parceiro encontrado</h3>
                <p className="text-gray-400">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parceirosFiltrados.map((parceiro, index) => (
                  <motion.div
                    key={parceiro.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="card hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedParceiro(parceiro)
                      setShowModal(true)
                    }}
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-sementes-primary/20 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-sementes-primary" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold group-hover:text-sementes-primary transition-colors">
                            {parceiro.nome}
                          </h3>
                          <p className="text-gray-400 text-sm">{parceiro.categoria}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getNivelColor(parceiro.nivel)}`}>
                          {getNivelIcon(parceiro.nivel)} {parceiro.nivel}
                        </span>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPinIcon className="w-4 h-4 text-sementes-primary" />
                        <span className="text-sm">{parceiro.nomeCidade}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-300">
                        <CurrencyDollarIcon className="w-4 h-4 text-sementes-primary" />
                        <span className="text-sm">R$ {parceiro.totalVendas.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-300">
                        <StarIcon className="w-4 h-4 text-sementes-primary" />
                        <span className="text-sm">#{parceiro.posicao} no ranking</span>
                      </div>
                    </div>

                    {/* Cashback Info */}
                    <div className="bg-sementes-primary/10 border border-sementes-primary/20 rounded-lg p-3 mb-4">
                      <div className="text-center">
                        <p className="text-sementes-primary font-semibold text-sm">
                          💰 Cashback Disponível
                        </p>
                        <p className="text-white font-bold">
                          {(parceiro.totalVendas * 0.05).toFixed(0)} Sementes
                        </p>
                        <p className="text-gray-400 text-xs">
                          Use cupom: <strong>sementesplay10</strong>
                        </p>
                      </div>
                    </div>

                    {/* Botão Ver Detalhes */}
                    <div className="flex items-center justify-center">
                      <button className="inline-flex items-center space-x-2 text-sementes-primary hover:text-sementes-accent transition-colors">
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Ver Detalhes</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Como Funciona */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card mt-8"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                🚀 Como Funciona o Cashback
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                  <div className="text-2xl">🛒</div>
                  <h4 className="font-medium text-white">1. Faça a Compra</h4>
                  <p className="text-gray-400">Use o cupom <strong>sementesplay10</strong> no site do parceiro</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">📝</div>
                  <h4 className="font-medium text-white">2. Registre Aqui</h4>
                  <p className="text-gray-400">Registre a compra com comprovante em <Link href="/registrar-compra" className="text-sementes-primary hover:underline">Registrar Compra</Link></p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">🎁</div>
                  <h4 className="font-medium text-white">3. Receba Sementes</h4>
                  <p className="text-gray-400">Receba 5% do valor em Sementes automaticamente</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedParceiro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedParceiro.nome}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Informações do Parceiro */}
              <div className="space-y-6">
                {/* Nível e Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getNivelColor(selectedParceiro.nivel)}`}>
                    {getNivelIcon(selectedParceiro.nivel)} {selectedParceiro.nivel}
                  </span>
                  <span className="text-green-400 text-sm">● Ativo</span>
                </div>

                {/* Detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
                    <p className="text-white">{selectedParceiro.categoria}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cidade</label>
                    <p className="text-white">{selectedParceiro.nomeCidade}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white">{selectedParceiro.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                    <p className="text-white">{selectedParceiro.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Site</label>
                    <p className="text-white">{selectedParceiro.site || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data de Cadastro</label>
                    <p className="text-white">{new Date(selectedParceiro.dataCriacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Total em Vendas</p>
                    <p className="text-white font-bold text-lg">R$ {selectedParceiro.totalVendas.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Comissão Mensal</p>
                    <p className="text-white font-bold text-lg">R$ {selectedParceiro.comissaoMensal.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Sementes</p>
                    <p className="text-white font-bold text-lg">{selectedParceiro.sementes.toLocaleString()}</p>
                  </div>
                </div>

                {/* Cashback Info */}
                <div className="bg-sementes-primary/20 border border-sementes-primary/30 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="text-sementes-primary font-semibold mb-2">
                      💰 Cashback Disponível
                    </h4>
                    <p className="text-white font-bold text-2xl mb-2">
                      {(selectedParceiro.totalVendas * 0.05).toFixed(0)} Sementes
                    </p>
                    <p className="text-gray-300 text-sm mb-3">
                      Use o cupom <strong>sementesplay10</strong> e receba 5% de volta
                    </p>
                    <Link
                      href="/registrar-compra"
                      className="inline-block bg-sementes-primary hover:bg-sementes-secondary text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Registrar Compra
                    </Link>
                  </div>
                </div>

                {/* Descrição */}
                {selectedParceiro.descricao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Sobre</label>
                    <p className="text-gray-300">{selectedParceiro.descricao}</p>
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
