'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { usuario, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  // Redirecionar se não estiver logado
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-sss-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {usuario?.nome}! 👋
          </h1>
          <p className="text-gray-400">
            Gerencie sua conta e acompanhe suas atividades
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-sementes-primary/20 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-sementes-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Sementes</p>
                <p className="text-2xl font-bold text-white">{usuario?.sementes || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-sementes-accent/20 rounded-lg">
                <HeartIcon className="w-6 h-6 text-sementes-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Nível</p>
                <p className="text-2xl font-bold text-white">{usuario?.nivel || 'Comum'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-sementes-secondary/20 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-sementes-secondary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">XP</p>
                <p className="text-2xl font-bold text-white">{usuario?.xp || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-sementes-accent/20 rounded-lg">
                <HeartIcon className="w-6 h-6 text-sementes-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pontuação</p>
                <p className="text-2xl font-bold text-white">{usuario?.pontuacao || 0}</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="card p-6 hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-sementes-primary mr-3" />
              <h3 className="text-xl font-semibold text-white">Minha Carteira</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Gerencie seus Sementes e solicite saques
            </p>
            <button className="btn-primary w-full">
              Acessar Carteira
            </button>
          </div>

          <div className="card p-6 hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div className="flex items-center mb-4">
              <HeartIcon className="w-8 h-8 text-sementes-accent mr-3" />
              <h3 className="text-xl font-semibold text-white">Minhas Doações</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Acompanhe suas doações para criadores
            </p>
            <button className="btn-primary w-full">
              Ver Doações
            </button>
          </div>

          <div className="card p-6 hover:bg-gray-700/50 transition-colors cursor-pointer">
            <div className="flex items-center mb-4">
              <CogIcon className="w-8 h-8 text-gray-400 mr-3" />
              <h3 className="text-xl font-semibold text-white">Configurações</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Personalize seu perfil e preferências
            </p>
            <button className="btn-primary w-full">
              Configurar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
