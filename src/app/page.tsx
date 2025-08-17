'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlayIcon,
  StarIcon,
  TrophyIcon,
  GiftIcon,
  UsersIcon,
  FireIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: CurrencyDollarIcon,
      title: 'Cashback de 10%',
      description: 'Receba Sementes equivalentes a 10% de todas as suas compras em cidades FiveM parceiras.'
    },
    {
      icon: HeartIcon,
      title: 'Doações para Criadores',
      description: 'Doe suas Sementes para seus criadores de conteúdo favoritos e ajude-os a crescer.'
    },
    {
      icon: UserGroupIcon,
      title: 'Comunidade Ativa',
      description: 'Faça parte de uma comunidade vibrante de jogadores e criadores de conteúdo.'
    },
    {
      icon: ChartBarIcon,
      title: 'Sistema de Ranking',
      description: 'Criadores são ranqueados por engajamento e recebem benefícios especiais.'
    }
  ]

  const niveis = [
    {
      nome: 'Criador Supremo',
      cor: 'yellow',
      icone: '👑',
      requisitos: 'Top 1-50 do ranking',
      beneficios: ['Destaque máximo na plataforma', 'Maior visibilidade para doações', 'Benefícios exclusivos']
    },
    {
      nome: 'Criador Parceiro',
      cor: 'blue',
      icone: '💎',
      requisitos: 'Top 51-200 do ranking',
      beneficios: ['Destaque especial', 'Visibilidade aumentada', 'Acesso a recursos premium']
    },
    {
      nome: 'Criador Comum',
      cor: 'gray',
      icone: '⭐',
      requisitos: 'Top 201-500 do ranking',
      beneficios: ['Visibilidade padrão', 'Acesso a recursos básicos', 'Suporte da comunidade']
    },
    {
      nome: 'Criador Iniciante',
      cor: 'green',
      icone: '🌱',
      requisitos: 'Novos criadores',
      beneficios: ['Visibilidade básica', 'Recursos essenciais', 'Apoio da comunidade']
    }
  ]

  const stats = [
    { number: '0', label: 'Usuários Ativos' },
    { number: '0', label: 'Criadores Verificados' },
    { number: '0', label: 'Cidades Parceiras' },
    { number: 'R$ 0', label: 'Em Cashback Distribuído' }
  ]

  return (
    <div className="min-h-screen bg-sss-dark">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sementes-dark via-sementes-secondary to-sementes-primary opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-sss-white mb-6">
              <span className="text-gradient">Sementes</span>
              <span className="text-sss-white">PLAY</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Sistema de cashback e doações para o ecossistema FiveM. 
              Transforme suas compras em apoio aos seus criadores favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registrar-compra" className="btn-primary">
                <PlayIcon className="w-5 h-5 mr-2" />
                Solicitar Cashback
              </Link>
              <Link href="/criadores" className="btn-secondary">
                <HeartIcon className="w-5 h-5 mr-2" />
                Ver Criadores
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cupom Especial */}
      <section className="py-16 bg-gradient-to-r from-sementes-primary to-sementes-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-effect rounded-2xl p-8"
          >
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🎁</span>
            </div>
            <h3 className="text-2xl font-bold text-sss-white mb-3">Cupom Especial</h3>
            <p className="text-sss-white text-center mb-3">
              Use o cupom <span className="font-bold text-sss-white text-xl">sementesplay10</span> em nossos parceiros
            </p>
            <p className="text-gray-200 text-center text-sm">
              ✨ Transforme suas compras em apoio aos seus criadores favoritos ✨
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-sss-white mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              O SementesPLAY é um sistema cíclico que conecta jogadores, criadores de conteúdo e donos de cidades FiveM.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card text-center group hover:border-sementes-primary transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-sementes-primary/20 rounded-full flex items-center justify-center group-hover:bg-sementes-primary/30 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-sementes-primary" />
                </div>
                <h3 className="text-xl font-semibold text-sss-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Níveis de Criadores */}
      <section id="niveis" className="py-20 bg-sss-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-sss-white mb-4">
              Níveis de Criadores
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Criadores são ranqueados por engajamento e recebem benefícios conforme sua posição no ranking.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {niveis.map((nivel, index) => (
              <motion.div
                key={nivel.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`card text-center border-2 ${
                  nivel.cor === 'yellow' ? 'border-yellow-400' :
                  nivel.cor === 'blue' ? 'border-blue-400' :
                  nivel.cor === 'gray' ? 'border-gray-400' :
                  'border-green-400'
                } hover:scale-105 transition-all duration-300`}
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  nivel.cor === 'yellow' ? 'bg-yellow-100' :
                  nivel.cor === 'blue' ? 'bg-blue-100' :
                  nivel.cor === 'gray' ? 'bg-gray-100' :
                  'bg-green-100'
                }`}>
                  <span className="text-3xl">{nivel.icone}</span>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  nivel.cor === 'yellow' ? 'text-yellow-600' :
                  nivel.cor === 'blue' ? 'text-blue-600' :
                  nivel.cor === 'gray' ? 'text-gray-600' :
                  'text-green-600'
                }`}>
                  {nivel.nome}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{nivel.requisitos}</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  {nivel.beneficios.map((beneficio, idx) => (
                    <li key={idx} className="flex items-center justify-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        nivel.cor === 'yellow' ? 'bg-yellow-400' :
                        nivel.cor === 'blue' ? 'bg-blue-400' :
                        nivel.cor === 'gray' ? 'bg-gray-400' :
                        'bg-green-400'
                      }`}></span>
                      {beneficio}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-sementes-dark to-sementes-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-sss-white mb-4">
              Números Impressionantes
            </h2>
            <p className="text-xl text-gray-300">
              Veja o impacto do SementesPLAY na comunidade FiveM
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-sementes-accent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-sss-white mb-6">
              Comece Agora Mesmo
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Junte-se à comunidade SementesPLAY e comece a ganhar cashback 
              enquanto apoia seus criadores favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cadastro" className="btn-primary">
                <UsersIcon className="w-5 h-5 mr-2" />
                Criar Conta
              </Link>
              <Link href="/login" className="btn-secondary">
                <FireIcon className="w-5 h-5 mr-2" />
                Fazer Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
