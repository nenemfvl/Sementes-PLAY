'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  HeartIcon,
  TrophyIcon,
  StarIcon,
  CogIcon,
  PencilIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

// Forçar renderização dinâmica para evitar erro de prerendering
export const dynamic = 'force-dynamic'

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          setUsuario(dadosUsuario)
          setAvatarUrl(dadosUsuario.avatarUrl || null)
          
          // Carregar estatísticas
          carregarEstatisticas(dadosUsuario.id)
        } catch (error) {
          console.error('Erro ao ler dados do usuário:', error)
          localStorage.removeItem('usuario-dados')
          setUsuario(null)
        }
      } else {
        // Redirecionar para login se não estiver autenticado
        window.location.href = '/login'
      }
      setLoading(false)
    }
    
    verificarAutenticacao()
  }, [])

  const carregarEstatisticas = async (userId: string) => {
    try {
      const response = await fetch(`/api/perfil/stats?usuarioId=${userId}`)
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const atualizarEstatisticas = async () => {
    if (!usuario) return
    
    setLoading(true)
    try {
      await carregarEstatisticas(usuario.id)
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'criador-supremo':
        return <StarIcon className="w-6 h-6 text-yellow-500" />
      case 'criador-parceiro':
        return <StarIcon className="w-6 h-6 text-blue-500" />
      case 'criador-comum':
        return <StarIcon className="w-6 h-6 text-orange-600" />
      case 'criador-iniciante':
        return <StarIcon className="w-6 h-6 text-green-500" />
      case 'parceiro':
        return <StarIcon className="w-6 h-6 text-purple-500" />
      default:
        return <UserIcon className="w-6 h-6 text-gray-400" />
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'criador-supremo':
        return 'text-yellow-500'
      case 'criador-parceiro':
        return 'text-blue-500'
      case 'criador-comum':
        return 'text-orange-600'
      case 'criador-iniciante':
        return 'text-green-500'
      case 'parceiro':
        return 'text-purple-500'
      default:
        return 'text-gray-400'
    }
  }

  if (!usuario) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: StarIcon },
    { id: 'doacoes', label: 'Histórico de Doações', icon: HeartIcon },
    { id: 'xp', label: 'Histórico XP', icon: StarIcon }
  ]

  // Calcular dados de XP
  const xpData = {
    usuario: {
      xp: stats?.xp || usuario.xp || 0,
      nivelUsuario: stats?.nivelUsuario || usuario.nivelUsuario || 1
    },
    xpProximoNivel: Math.pow((stats?.nivelUsuario || usuario.nivelUsuario || 1) + 1, 2) * 100,
    progressoNivel: ((stats?.xp || usuario.xp || 0) - Math.pow(stats?.nivelUsuario || usuario.nivelUsuario || 1, 2) * 100) / (Math.pow((stats?.nivelUsuario || usuario.nivelUsuario || 1) + 1, 2) * 100 - Math.pow(stats?.nivelUsuario || usuario.nivelUsuario || 1, 2) * 100) * 100
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Profile Header */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-sementes-accent/20 rounded-full flex items-center justify-center relative group">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl.replace('http://', 'https://')}
                    alt="Avatar do usuário"
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-20 h-20"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-sementes-accent" />
                )}
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-sementes-accent text-white rounded-full p-1 cursor-pointer shadow-lg group-hover:scale-110 transition-transform" title="Alterar foto">
                  <PencilIcon className="w-5 h-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    aria-label="Upload de avatar"
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{usuario.nome}</h2>
                  {getNivelIcon(usuario.nivel)}
                  <span className={`text-sm font-medium ${getNivelColor(usuario.nivel)}`}>
                    Nível {usuario.nivel}
                  </span>
                </div>
                
                <p className="text-gray-400 mb-2">{usuario.email}</p>
                
                {/* XP e Nível do Usuário */}
                {xpData && (
                  <div className="mb-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-blue-400 font-medium">
                        Nível {xpData.usuario.nivelUsuario}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({xpData.usuario.xp} XP)
                      </span>
                      {usuario.streakLogin > 0 && (
                        <span className="text-sm text-orange-400">
                          🔥 {usuario.streakLogin} dias
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ${xpData.progressoNivel <= 25 ? 'w-1/4' : xpData.progressoNivel <= 50 ? 'w-1/2' : xpData.progressoNivel <= 75 ? 'w-3/4' : 'w-full'}`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {xpData.usuario.xp} / {xpData.xpProximoNivel} XP para o próximo nível
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-gray-500">
                  Membro desde {new Date(usuario.dataCriacao || Date.now()).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-sementes-accent">{usuario.sementes}</div>
                <div className="text-sm text-gray-400">Sementes Disponíveis</div>
                {stats?.sementes && stats.sementes > 0 && (
                  <div className="mt-2">
                    <div className="text-lg font-semibold text-purple-400">{stats.sementes}</div>
                    <div className="text-xs text-gray-500">Sementes Disponíveis</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Estatísticas</h3>
            <button
              onClick={atualizarEstatisticas}
              disabled={loading}
              className="bg-sementes-accent hover:bg-red-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CogIcon className="w-4 h-4" />
              )}
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sementes-accent mx-auto"></div>
              <p className="text-gray-400 mt-2">Carregando estatísticas...</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Doações</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.totalDoacoes || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <HeartIcon className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Criadores Apoiados</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.criadoresApoiados || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Pontuação</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.pontuacao || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total de XP Ganho</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {xpData?.usuario?.xp || 0} XP
                    </p>
                    <p className="text-sm text-gray-400">
                      Nível {xpData?.usuario?.nivelUsuario || 1}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <StarIcon className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>{Math.round(xpData?.progressoNivel || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ${(xpData?.progressoNivel || 0) <= 25 ? 'w-1/4' : (xpData?.progressoNivel || 0) <= 50 ? 'w-1/2' : (xpData?.progressoNivel || 0) <= 75 ? 'w-3/4' : 'w-full'}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {xpData?.usuario?.xp || 0} / {xpData?.xpProximoNivel || 100} XP
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="bg-gray-900 rounded-lg border border-gray-700">
            <div className="border-b border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-sementes-accent text-sementes-accent'
                        : 'border-transparent text-gray-300 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Atividade Recente</h3>
                      <div className="space-y-3">
                        {stats?.atividadesRecentes?.map((atividade: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                            <div className="w-8 h-8 bg-sementes-accent/20 rounded-full flex items-center justify-center">
                              <CalendarIcon className="w-4 h-4 text-sementes-accent" />
                            </div>
                            <div>
                              <p className="text-white text-sm">{atividade.descricao}</p>
                              <p className="text-gray-400 text-xs">{atividade.data}</p>
                            </div>
                          </div>
                        ))}
                        {(!stats?.atividadesRecentes || stats.atividadesRecentes.length === 0) && (
                          <p className="text-gray-400 text-sm">Nenhuma atividade recente</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'doacoes' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Histórico de Doações</h3>
                  <div className="space-y-3">
                    {stats?.historicoDoacoes?.map((doacao: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <HeartIcon className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="text-white">{doacao.criador}</p>
                            <p className="text-gray-400 text-sm">{doacao.data}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sementes-accent font-semibold">{doacao.valor} Sementes</p>
                        </div>
                      </div>
                    ))}
                    {(!stats?.historicoDoacoes || stats.historicoDoacoes.length === 0) && (
                      <p className="text-gray-400 text-sm">Nenhuma doação encontrada</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'xp' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Histórico de Experiência</h3>
                  {xpData ? (
                    <div className="space-y-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Resumo</span>
                          <span className="text-blue-400 font-bold">{xpData.usuario.xp} XP Total</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-400">{xpData.usuario.nivelUsuario}</p>
                            <p className="text-xs text-gray-400">Nível Atual</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-400">{xpData.xpProximoNivel}</p>
                            <p className="text-xs text-gray-400">XP Próximo Nível</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-400">{Math.round(xpData.progressoNivel)}%</p>
                            <p className="text-xs text-gray-400">Progresso</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-400">{usuario.streakLogin || 0}</p>
                            <p className="text-xs text-gray-400">Dias Consecutivos</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">Como ganhar XP</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400">💝</span>
                            <span className="text-gray-300">Fazer doação: 10 XP cada</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-400">🎁</span>
                            <span className="text-gray-300">Receber doação: 5 XP cada</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-purple-400">🔥</span>
                            <span className="text-gray-300">Login diário: 10 XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Carregando dados de XP...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
