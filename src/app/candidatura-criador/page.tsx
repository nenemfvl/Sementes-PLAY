'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  StarIcon,
  HeartIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FormCandidatura {
  nome: string
  email: string
  bio: string
  redesSociais: {
    youtube: string
    twitch: string
    instagram: string
    tiktok: string
    twitter: string
    discord: string
  }
  portfolio: {
    descricao: string
    links: string[]
  }
  experiencia: string
  motivacao: string
  metas: string
  disponibilidade: string
}

export default function CandidaturaCriadorPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState<FormCandidatura>({
    nome: '',
    email: '',
    bio: '',
    redesSociais: {
      youtube: '',
      twitch: '',
      instagram: '',
      tiktok: '',
      twitter: '',
      discord: ''
    },
    portfolio: {
      descricao: '',
      links: ['', '']
    },
    experiencia: '',
    motivacao: '',
    metas: '',
    disponibilidade: ''
  })
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info', mensagem: string } | null>(null)

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          setUsuario(dadosUsuario)
          setIsAuthenticated(true)
          
          // Preencher dados do usuário
          setForm(prev => ({
            ...prev,
            nome: dadosUsuario.nome || '',
            email: dadosUsuario.email || ''
          }))
        } catch (error) {
          console.error('Erro ao ler dados do usuário:', error)
          localStorage.removeItem('usuario-dados')
        }
      }
      setLoading(false)
    }
    verificarAutenticacao()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setForm(prev => {
        const parentValue = prev[parent as keyof FormCandidatura]
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value
            }
          }
        }
        return prev
      })
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handlePortfolioLinkChange = (index: number, value: string) => {
    const newLinks = [...form.portfolio.links]
    newLinks[index] = value
    setForm(prev => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        links: newLinks
      }
    }))
  }

  const addPortfolioLink = () => {
    setForm(prev => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        links: [...prev.portfolio.links, '']
      }
    }))
  }

  const removePortfolioLink = (index: number) => {
    if (form.portfolio.links.length > 1) {
      const newLinks = form.portfolio.links.filter((_, i) => i !== index)
      setForm(prev => ({
        ...prev,
        portfolio: {
          ...prev.portfolio,
          links: newLinks
        }
      }))
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitCandidatura = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/candidaturas/criador', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          usuarioId: usuario?.id
        }),
      })

      if (response.ok) {
        setNotificacao({
          tipo: 'sucesso',
          mensagem: 'Candidatura enviada com sucesso! Nossa equipe entrará em contato em breve.'
        })
        setTimeout(() => {
          router.push('/criadores')
        }, 3000)
      } else {
        const error = await response.json()
        setNotificacao({
          tipo: 'erro',
          mensagem: error.error || 'Erro ao enviar candidatura. Tente novamente.'
        })
      }
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error)
      setNotificacao({
        tipo: 'erro',
        mensagem: 'Erro ao enviar candidatura. Tente novamente.'
      })
    }
    setSubmitting(false)
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return form.nome && form.email && form.bio
      case 2:
        return true // Redes sociais são opcionais
      case 3:
        return form.experiencia && form.motivacao && form.metas && form.disponibilidade
      case 4:
        return form.nome && form.email && form.bio && form.experiencia && form.motivacao && form.metas && form.disponibilidade
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sss-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <Link
                href="/criadores"
                className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Voltar
              </Link>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-2xl flex items-center justify-center shadow-2xl">
                  <StarIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Candidatura para Criador
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Junte-se à nossa comunidade de criadores de conteúdo
              </p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Progresso da Candidatura</span>
                <span className="text-gray-400">{currentStep}/4</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-sementes-primary to-sementes-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>Informações Básicas</span>
                <span>Redes Sociais</span>
                <span>Experiência</span>
                <span>Revisão</span>
              </div>
            </div>
          </motion.div>

          {/* Form Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8"
          >
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <UserIcon className="w-6 h-6 mr-3 text-sementes-primary" />
                  Informações Básicas
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Biografia</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                    placeholder="Conte um pouco sobre você e seu conteúdo..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Redes Sociais */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <StarIcon className="w-6 h-6 mr-3 text-sementes-primary" />
                  Redes Sociais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">YouTube</label>
                    <input
                      type="url"
                      value={form.redesSociais.youtube}
                      onChange={(e) => handleInputChange('redesSociais.youtube', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="https://youtube.com/@seucanal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Twitch</label>
                    <input
                      type="url"
                      value={form.redesSociais.twitch}
                      onChange={(e) => handleInputChange('redesSociais.twitch', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="https://twitch.tv/seucanal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Instagram</label>
                    <input
                      type="url"
                      value={form.redesSociais.instagram}
                      onChange={(e) => handleInputChange('redesSociais.instagram', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="https://instagram.com/seuperfil"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">TikTok</label>
                    <input
                      type="url"
                      value={form.redesSociais.tiktok}
                      onChange={(e) => handleInputChange('redesSociais.tiktok', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="https://tiktok.com/@seuperfil"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Discord</label>
                    <input
                      type="text"
                      value={form.redesSociais.discord}
                      onChange={(e) => handleInputChange('redesSociais.discord', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="username#1234"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Twitter</label>
                    <input
                      type="url"
                      value={form.redesSociais.twitter}
                      onChange={(e) => handleInputChange('redesSociais.twitter', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                      placeholder="https://twitter.com/seuperfil"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Experiência e Motivação */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <HeartIcon className="w-6 h-6 mr-3 text-sementes-primary" />
                  Experiência e Motivação
                </h2>
                
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Experiência em Criação de Conteúdo</label>
                  <textarea
                    value={form.experiencia}
                    onChange={(e) => handleInputChange('experiencia', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                    placeholder="Conte sobre sua experiência criando conteúdo..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Por que você quer ser um criador no SementesPLAY?</label>
                  <textarea
                    value={form.motivacao}
                    onChange={(e) => handleInputChange('motivacao', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                    placeholder="Explique sua motivação..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Metas como Criador</label>
                  <textarea
                    value={form.metas}
                    onChange={(e) => handleInputChange('metas', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                    placeholder="Quais são suas metas e objetivos?"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Disponibilidade para Criação</label>
                  <textarea
                    value={form.disponibilidade}
                    onChange={(e) => handleInputChange('disponibilidade', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                    placeholder="Quantas horas por semana você pode dedicar?"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Revisão */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-3 text-sementes-primary" />
                  Revisão
                </h2>
                
                {/* Critérios de Aprovação */}
                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Critérios de Aprovação</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Ter pelo menos 100 seguidores</p>
                        <p className="text-gray-400 text-sm">Em pelo menos uma rede social</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Criar conteúdo regularmente</p>
                        <p className="text-gray-400 text-sm">Pelo menos 1 post/vídeo por semana</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Ter conteúdo de qualidade</p>
                        <p className="text-gray-400 text-sm">Original e relevante para a comunidade</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Seguir as diretrizes da comunidade</p>
                        <p className="text-gray-400 text-sm">Conteúdo apropriado e sem violações</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processo de Aprovação */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-400 font-semibold">Processo de Aprovação</h4>
                      <p className="text-yellow-200 text-sm mt-1">
                        Sua candidatura será revisada pela nossa equipe em até 7 dias úteis. 
                        Você receberá uma notificação por email com o resultado.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Resumo da Candidatura */}
                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Resumo da Sua Candidatura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Nome:</p>
                      <p className="text-white break-words">{form.nome}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email:</p>
                      <p className="text-white break-all">{form.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Bio:</p>
                      <p className="text-white break-words whitespace-pre-wrap max-w-full overflow-hidden">{form.bio}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Experiência:</p>
                      <p className="text-white break-words whitespace-pre-wrap max-w-full overflow-hidden">{form.experiencia}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Motivação:</p>
                      <p className="text-white break-words whitespace-pre-wrap max-w-full overflow-hidden">{form.motivacao}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Metas:</p>
                      <p className="text-white break-words whitespace-pre-wrap max-w-full overflow-hidden">{form.metas}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Disponibilidade:</p>
                      <p className="text-white break-words whitespace-pre-wrap max-w-full overflow-hidden">{form.disponibilidade}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Redes Sociais:</p>
                      <p className="text-white">
                        {Object.values(form.redesSociais).filter(Boolean).length} configuradas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
                >
                  Anterior
                </button>
              )}
              
              <div className="ml-auto">
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="px-6 py-3 bg-sementes-primary hover:bg-sementes-accent text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={submitCandidatura}
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-sementes-primary to-sementes-accent hover:from-sementes-accent hover:to-sementes-primary text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Candidatura'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Benefícios de ser Criador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-sementes-primary/20 to-sementes-accent/20 rounded-2xl border border-sementes-primary/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">🌟 Por que ser um Criador?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <StarIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Recompensas</h4>
                  <p className="text-gray-300 text-sm">
                    Ganhe sementes por seu conteúdo e participe de rankings mensais
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Visibilidade</h4>
                  <p className="text-gray-300 text-sm">
                    Alcance milhares de usuários da comunidade FiveM
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Flexibilidade</h4>
                  <p className="text-gray-300 text-sm">
                    Crie conteúdo no seu ritmo e horário preferido
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Notificação */}
      {notificacao && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg z-50 ${
            notificacao.tipo === 'sucesso' 
              ? 'bg-green-600 text-white' 
              : notificacao.tipo === 'erro' 
              ? 'bg-red-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}
        >
          {notificacao.mensagem}
        </motion.div>
      )}
    </div>
  )
}
