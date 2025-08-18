'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

import {
  UsersIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  FlagIcon,
  CogIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BanknotesIcon,
  GiftIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface AdminStats {
  totalUsuarios: number
  totalCriadores: number
  totalParceiros: number
  candidaturasPendentes: number
  denunciasPendentes: number
  fundoAtual: number
}

export default function AdminPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsuarios: 0,
    totalCriadores: 0,
    totalParceiros: 0,
    candidaturasPendentes: 0,
    denunciasPendentes: 0,
    fundoAtual: 0
  })

  useEffect(() => {
    const verificarAutenticacao = () => {
      console.log('🔍 [ADMIN] Verificando autenticação...')
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      console.log('📱 [ADMIN] Usuário no localStorage:', usuarioSalvo ? 'EXISTE' : 'NÃO EXISTE')
      
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          console.log('👤 [ADMIN] Dados do usuário:', dadosUsuario)
          console.log('🔢 [ADMIN] Nível do usuário:', dadosUsuario.nivel, 'Tipo:', typeof dadosUsuario.nivel)
          
          // Verificar se é admin (nivel >= 5)
          if (dadosUsuario.nivel && Number(dadosUsuario.nivel) >= 5) {
            console.log('✅ [ADMIN] Usuário é admin, definindo estado...')
            setUsuario(dadosUsuario)
            setIsAuthenticated(true)
          } else {
            console.log('❌ [ADMIN] Usuário não é admin, redirecionando...')
            // Não é admin, redirecionar
            window.location.href = '/dashboard'
          }
        } catch (error) {
          console.error('❌ [ADMIN] Erro ao parsear usuário:', error)
          localStorage.removeItem('usuario-dados')
          window.location.href = '/login'
        }
      } else {
        console.log('❌ [ADMIN] Sem usuário no localStorage, redirecionando...')
        window.location.href = '/login'
      }
      setLoading(false)
    }
    verificarAutenticacao()
  }, [])

  useEffect(() => {
    if (isAuthenticated && usuario) {
      carregarEstatisticas()
    }
  }, [isAuthenticated, usuario])

  const carregarEstatisticas = async () => {
    try {
      // TODO: Implementar API para buscar estatísticas
      // Por enquanto, usando dados mockados para desenvolvimento
      setStats({
        totalUsuarios: 0,
        totalCriadores: 0,
        totalParceiros: 0,
        candidaturasPendentes: 0,
        denunciasPendentes: 0,
        fundoAtual: 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  const adminModules = [
    {
      title: 'Gerenciar Usuários',
      description: 'Banir, suspender, reativar e alterar níveis',
      icon: UsersIcon,
      href: '/admin/usuarios',
      color: 'bg-blue-500',
      stats: stats.totalUsuarios
    },
    {
      title: 'Candidaturas Criador',
      description: 'Aprovar/rejeitar candidaturas para criadores',
      icon: UserGroupIcon,
      href: '/admin/candidaturas-criador',
      color: 'bg-purple-500',
      stats: stats.candidaturasPendentes
    },
    {
      title: 'Candidaturas Parceiro',
      description: 'Aprovar/rejeitar candidaturas para parceiros',
      icon: BuildingOfficeIcon,
      href: '/admin/candidaturas-parceiro',
      color: 'bg-green-500',
      stats: 0
    },
    {
      title: 'Gerenciar Criadores',
      description: 'Gerenciar criadores existentes',
      icon: UserGroupIcon,
      href: '/admin/criadores',
      color: 'bg-indigo-500',
      stats: stats.totalCriadores
    },
    {
      title: 'Gerenciar Parceiros',
      description: 'Gerenciar parceiros e suas cidades',
      icon: BuildingOfficeIcon,
      href: '/admin/parceiros',
      color: 'bg-emerald-500',
      stats: stats.totalParceiros
    },
    {
      title: 'Fundo de Sementes',
      description: 'Distribuir fundo de sementes para criadores e usuários',
      icon: GiftIcon,
      href: '/admin/fundo',
      color: 'bg-yellow-500',
      stats: stats.fundoAtual
    },
    {
      title: 'Relatórios',
      description: 'Estatísticas e relatórios do sistema',
      icon: ChartBarIcon,
      href: '/admin/relatorios',
      color: 'bg-red-500',
      stats: 0
    },
    {
      title: 'Suporte',
      description: 'Sistema de suporte e tickets',
      icon: FlagIcon,
      href: '/admin/suporte',
      color: 'bg-orange-500',
      stats: 0
    },
    {
      title: 'Saques',
      description: 'Gerenciar solicitações de saque',
      icon: CreditCardIcon,
      href: '/admin/saques',
      color: 'bg-teal-500',
      stats: 0
    },
    {
      title: 'Logs',
      description: 'Histórico de ações administrativas',
      icon: DocumentTextIcon,
      href: '/admin/logs',
      color: 'bg-gray-500',
      stats: 0
    },
    {
      title: 'Permissões',
      description: 'Gerenciar permissões de usuários',
      icon: ShieldCheckIcon,
      href: '/admin/permissoes',
      color: 'bg-pink-500',
      stats: 0
    },
    {
      title: 'Configurações',
      description: 'Configurações do sistema',
      icon: CogIcon,
      href: '/admin/configuracoes',
      color: 'bg-slate-500',
      stats: 0
    }
  ]

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
            <h1 className="text-4xl font-bold text-white mb-4">
              <ShieldCheckIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
              Painel Administrativo
            </h1>
            <p className="text-gray-300">
              Gerencie usuários, criadores, parceiros e o sistema
            </p>
          </motion.div>

          {/* Fluxo do Sistema */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card mb-8"
          >
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fluxo do Sistema</h3>
                                  <div className="space-y-2 text-sm text-gray-300">
                    <p>• Usuários compram em sites parceiros usando cupom <span className="font-bold text-sementes-primary">sementesplay20</span></p>
                    <p>• Parceiros devem repassar 10% do valor ao SementesPLAY e enviar comprovante</p>
                    <p>• Sistema alimenta automaticamente o fundo de sementes</p>
                    <p>• Admin distribui o fundo a cada ciclo para criadores e usuários</p>
                    <p>• Dúvidas? Consulte o suporte ou documentação</p>
                  </div>
              </div>
            </div>
          </motion.div>

          {/* Estatísticas Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Usuários</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsuarios}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Criadores</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCriadores}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Parceiros</p>
                  <p className="text-2xl font-bold text-white">{stats.totalParceiros}</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <GiftIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Fundo de Sementes</p>
                  <p className="text-2xl font-bold text-white">R$ {stats.fundoAtual}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Módulos do Admin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {adminModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => window.location.href = module.href}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${module.color} group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  {module.stats > 0 && (
                    <span className="bg-sementes-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                      {module.stats}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-sementes-primary transition-colors">
                  {module.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4">
                  {module.description}
                </p>
                
                <div className="flex items-center text-sementes-primary group-hover:text-sementes-primary/80 transition-colors">
                  <span className="text-sm font-medium">Acessar</span>
                  <EyeIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
