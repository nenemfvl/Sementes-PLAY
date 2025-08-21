'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  VideoCameraIcon,
  TrophyIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  PlusIcon,
  CogIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  LinkIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ArrowLeftIcon,
  UserIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface Conteudo {
  id: string
  titulo: string
  descricao?: string
  tipo: string
  categoria: string
  url: string
  dataPublicacao?: string
  fixado?: boolean
  visualizacoes?: number
  curtidas?: number
  dislikes?: number
}

interface Doacao {
  id: string
  quantidade: number
  data: string
  mensagem?: string
  doador?: { nome: string }
}

interface DoadorRanking {
  id: string
  nome: string
  total: number
}

interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  data: string
}

interface Recado {
  id: string
  usuarioNome: string
  mensagem: string
  data: string
  resposta?: string
  publico?: boolean
}

interface Enquete {
  id: string
  pergunta: string
  opcoes: { opcao: string; votos: number; porcentagem: number }[]
  criador: string
  totalVotos: number
  dataCriacao: string
  dataFim?: string
  ativa: boolean
}

export default function PainelCriador() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ titulo: '', url: '', tipo: '', categoria: '' })
  const [saving, setSaving] = useState(false)
  const [editando, setEditando] = useState<Conteudo | null>(null)
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [estatisticas, setEstatisticas] = useState({ totalDoacoes: 0, totalSementes: 0, totalFavoritos: 0 })
  const [loadingEstatisticas, setLoadingEstatisticas] = useState(true)
  const [doacoes, setDoacoes] = useState<Doacao[]>([])
  const [ranking, setRanking] = useState<DoadorRanking[]>([])
  const [loadingDoacoes, setLoadingDoacoes] = useState(true)
  const [loadingRanking, setLoadingRanking] = useState(true)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loadingNotificacoes, setLoadingNotificacoes] = useState(true)
  const [suporteMsg, setSuporteMsg] = useState('')
  const [suporteStatus, setSuporteStatus] = useState<'idle'|'enviando'|'enviado'>('idle')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [recados, setRecados] = useState<Recado[]>([])
  const [loadingRecados, setLoadingRecados] = useState(true)
  const [resposta, setResposta] = useState<{[id:string]:string}>({})
  const [respondendo, setRespondendo] = useState<string|null>(null)
  const [respostaStatus, setRespostaStatus] = useState<{[id:string]:string}>({})
  const [toggleStatus, setToggleStatus] = useState<{[id:string]:string}>({})
  const [enquetes, setEnquetes] = useState<Enquete[]>([])
  const [loadingEnquetes, setLoadingEnquetes] = useState(true)
  const [showEnqueteModal, setShowEnqueteModal] = useState(false)
  const [formEnquete, setFormEnquete] = useState({ pergunta: '', opcoes: ['', ''], dataFim: '' })

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          // Verificar se é um criador
          if (dadosUsuario.nivel && ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo'].includes(dadosUsuario.nivel)) {
            setUsuario(dadosUsuario)
            setIsAuthenticated(true)
            // Carregar dados após autenticação
            carregarDados()
          } else {
            // Não é criador, redirecionar
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

  const isCriador = (nivel: string | number) => {
    const niveisCriador = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
    return niveisCriador.includes(String(nivel))
  }

  const carregarDados = async () => {
    try {
      // Carregar conteúdos do criador
      await carregarConteudos()
      
      // TODO: Implementar outras APIs reais
      setEstatisticas({
        totalDoacoes: 0,
        totalSementes: 0,
        totalFavoritos: 0
      })
      setDoacoes([])
      setRanking([])
      setNotificacoes([])
      setRecados([])
      setEnquetes([])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
      setLoadingEstatisticas(false)
      setLoadingDoacoes(false)
      setLoadingRanking(false)
      setLoadingNotificacoes(false)
      setLoadingRecados(false)
      setLoadingEnquetes(false)
    }
  }

  const carregarConteudos = async () => {
    try {
      if (!usuario?.criador?.id) return
      
      const response = await fetch(`/api/conteudos?criadorId=${usuario.criador.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          setConteudos(data.dados)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (!usuario?.criador?.id) {
        throw new Error('Usuário não é um criador válido')
      }

      if (editando) {
        // Atualizar conteúdo existente
        const response = await fetch('/api/conteudos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editando.id,
            titulo: form.titulo,
            descricao: form.titulo, // Usar título como descrição por enquanto
            tipo: form.tipo,
            categoria: form.categoria,
            url: form.url
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.sucesso) {
            // Recarregar conteúdos para obter dados atualizados
            await carregarConteudos()
          }
        }
      } else {
        // Criar novo conteúdo
        const response = await fetch('/api/conteudos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            criadorId: usuario.criador.id,
            titulo: form.titulo,
            descricao: form.titulo, // Usar título como descrição por enquanto
            tipo: form.tipo,
            categoria: form.categoria,
            url: form.url
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.sucesso) {
            // Recarregar conteúdos para obter dados atualizados
            await carregarConteudos()
          }
        }
      }
      
      setForm({ titulo: '', url: '', tipo: '', categoria: '' })
      setEditando(null)
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este conteúdo?')) {
      try {
        const response = await fetch(`/api/conteudos?id=${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.sucesso) {
            // Recarregar conteúdos para obter dados atualizados
            await carregarConteudos()
          }
        }
      } catch (error) {
        console.error('Erro ao excluir conteúdo:', error)
      }
    }
  }

  const handleToggleFixado = async (id: string) => {
    try {
      const conteudo = conteudos.find(c => c.id === id)
      if (!conteudo) return

      const response = await fetch('/api/conteudos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          fixado: !conteudo.fixado
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.sucesso) {
          // Recarregar conteúdos para obter dados atualizados
          await carregarConteudos()
        }
      }
    } catch (error) {
      console.error('Erro ao alterar status fixado:', error)
    }
  }

  const handleResponderRecado = async (id: string) => {
    if (!resposta[id]) return
    
    setRespondendo(id)
    try {
      // TODO: Implementar API para responder recado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setRecados(prev => prev.map(r => 
        r.id === id ? { ...r, resposta: resposta[id] } : r
      ))
      
      setResposta(prev => ({ ...prev, [id]: '' }))
      setRespostaStatus(prev => ({ ...prev, [id]: 'enviado' }))
    } catch (error) {
      console.error('Erro ao responder:', error)
      setRespostaStatus(prev => ({ ...prev, [id]: 'erro' }))
    } finally {
      setRespondendo(null)
    }
  }

  const handleToggleRecadoPublico = async (id: string) => {
    setRecados(prev => prev.map(r => 
      r.id === id ? { ...r, publico: !r.publico } : r
    ))
  }

  const handleSubmitEnquete = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // TODO: Implementar API para criar enquete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const novaEnquete: Enquete = {
        id: Date.now().toString(),
        pergunta: formEnquete.pergunta,
        opcoes: formEnquete.opcoes.map(op => ({ opcao: op, votos: 0, porcentagem: 0 })),
        criador: usuario?.nome || 'Eu',
        totalVotos: 0,
        dataCriacao: new Date().toISOString(),
        dataFim: formEnquete.dataFim,
        ativa: true
      }
      
      setEnquetes(prev => [...prev, novaEnquete])
      setFormEnquete({ pergunta: '', opcoes: ['', ''], dataFim: '' })
      setShowEnqueteModal(false)
    } catch (error) {
      console.error('Erro ao criar enquete:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEnviarSuporte = async () => {
    if (!suporteMsg.trim()) return
    
    setSuporteStatus('enviando')
    try {
      // TODO: Implementar API para enviar suporte
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuporteMsg('')
      setSuporteStatus('enviado')
      
      setTimeout(() => setSuporteStatus('idle'), 3000)
    } catch (error) {
      console.error('Erro ao enviar suporte:', error)
      setSuporteStatus('idle')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sss-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sementes-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando painel criador...</p>
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
                <VideoCameraIcon className="w-8 h-8 inline mr-2 text-sementes-primary" />
                Painel do Criador
              </h1>
            </div>
            <p className="text-gray-300">
              Gerencie seu conteúdo, acompanhe doações e interaja com sua comunidade
            </p>
            <p className="text-sementes-accent font-semibold mt-2">
              🌟 Nível: {usuario?.nivel} • {estatisticas.totalFavoritos} favoritos
            </p>
          </motion.div>

          {/* Estatísticas Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-gray-400 text-sm">Total de Doações</p>
              <p className="text-white font-bold text-lg">{estatisticas.totalDoacoes} Sementes</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-gray-400 text-sm">Sementes Acumuladas</p>
              <p className="text-white font-bold text-lg">{estatisticas.totalSementes} Sementes</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">⭐</div>
              <p className="text-gray-400 text-sm">Favoritos</p>
              <p className="text-white font-bold text-lg">{estatisticas.totalFavoritos}</p>
            </div>
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card mb-8"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                🚀 Ações Rápidas
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Adicionar Conteúdo
                </button>
                <button
                  onClick={() => setShowEnqueteModal(true)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Criar Enquete
                </button>
                <button
                  onClick={() => setSuporteStatus('enviando')}
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                  Suporte
                </button>
              </div>
            </div>
          </motion.div>

          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Conteúdos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    📺 Meus Conteúdos
                  </h3>
                  <button
                    onClick={() => setShowModal(true)}
                    className="p-2 bg-sementes-primary hover:bg-sementes-secondary rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 text-white" />
                  </button>
                </div>

                {conteudos.length === 0 ? (
                  <div className="text-center py-8">
                    <VideoCameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Nenhum conteúdo ainda</h4>
                    <p className="text-gray-400">Comece adicionando seu primeiro conteúdo</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conteudos.map((conteudo) => (
                      <div key={conteudo.id} className="p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold">{conteudo.titulo}</h4>
                            <p className="text-gray-400 text-sm">{conteudo.categoria} • {conteudo.tipo}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleFixado(conteudo.id)}
                              className={`p-1 rounded ${conteudo.fixado ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}
                              title={conteudo.fixado ? 'Desfixar' : 'Fixar'}
                            >
                              <StarIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditando(conteudo)
                                setForm(conteudo)
                                setShowModal(true)
                              }}
                              className="p-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(conteudo.id)}
                              className="p-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <a
                            href={conteudo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sementes-primary hover:text-sementes-accent flex items-center space-x-1"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span>Ver conteúdo</span>
                          </a>
                          <div className="flex items-center space-x-4 text-gray-400">
                            <span className="flex items-center space-x-1">
                              <EyeIcon className="w-4 h-4" />
                              <span>{conteudo.visualizacoes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <HeartIcon className="w-4 h-4" />
                              <span>{conteudo.curtidas}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doações Recentes */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  💰 Doações Recentes
                </h3>
                {doacoes.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhuma doação ainda</p>
                ) : (
                  <div className="space-y-3">
                    {doacoes.slice(0, 5).map((doacao) => (
                      <div key={doacao.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{doacao.doador?.nome}</p>
                          {doacao.mensagem && (
                            <p className="text-gray-300 text-sm">{doacao.mensagem}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sementes-primary font-bold">{doacao.quantidade} Sementes</p>
                          <p className="text-gray-400 text-xs">{new Date(doacao.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Lado Direito */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Top Doadores */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  🏆 Top Doadores
                </h3>
                {ranking.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhum doador ainda</p>
                ) : (
                  <div className="space-y-3">
                    {ranking.slice(0, 5).map((doador, index) => (
                      <div key={doador.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-white font-medium">{doador.nome}</span>
                        </div>
                        <span className="text-sementes-primary font-bold">{doador.total} Sementes</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recados da Comunidade */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  💬 Recados da Comunidade
                </h3>
                {recados.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhum recado ainda</p>
                ) : (
                  <div className="space-y-3">
                    {recados.slice(0, 3).map((recado) => (
                      <div key={recado.id} className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{recado.usuarioNome}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleRecadoPublico(recado.id)}
                              className={`p-1 rounded text-xs ${
                                recado.publico ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                              }`}
                            >
                              {recado.publico ? 'Público' : 'Privado'}
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{recado.mensagem}</p>
                        
                        {recado.resposta ? (
                          <div className="ml-4 p-2 bg-sementes-primary/20 rounded border-l-2 border-sementes-primary">
                            <p className="text-white text-sm font-medium">Sua resposta:</p>
                            <p className="text-gray-300 text-sm">{recado.resposta}</p>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder="Responder..."
                              value={resposta[recado.id] || ''}
                              onChange={(e) => setResposta(prev => ({ ...prev, [recado.id]: e.target.value }))}
                              className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm placeholder-gray-400"
                            />
                            <button
                              onClick={() => handleResponderRecado(recado.id)}
                              disabled={respondendo === recado.id}
                              className="px-3 py-1 bg-sementes-primary hover:bg-sementes-secondary text-white text-sm rounded disabled:opacity-50"
                            >
                              {respondendo === recado.id ? '...' : 'Responder'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enquetes Ativas */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📊 Enquetes Ativas
                </h3>
                {enquetes.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Nenhuma enquete ativa</p>
                ) : (
                  <div className="space-y-3">
                    {enquetes.slice(0, 2).map((enquete) => (
                      <div key={enquete.id} className="p-3 bg-gray-700/50 rounded-lg">
                        <h4 className="text-white font-medium mb-2">{enquete.pergunta}</h4>
                        <div className="space-y-2">
                          {enquete.opcoes.map((opcao, index) => (
                            <div key={index} className="relative">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">{opcao.opcao}</span>
                                <span className="text-sementes-primary font-medium">{opcao.porcentagem}%</span>
                              </div>
                              <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                                <div
                                  className="bg-sementes-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${opcao.porcentagem}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-400 text-xs mt-2">
                          Total de votos: {enquete.totalVotos}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Conteúdo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {editando ? 'Editar Conteúdo' : 'Adicionar Conteúdo'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="video">Vídeo</option>
                    <option value="live">Live</option>
                    <option value="post">Post</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="gaming">Gaming</option>
                    <option value="tecnologia">Tecnologia</option>
                    <option value="entretenimento">Entretenimento</option>
                    <option value="educacao">Educação</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditando(null)
                    setForm({ titulo: '', url: '', tipo: '', categoria: '' })
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-sementes-primary hover:bg-sementes-secondary disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {saving ? 'Salvando...' : (editando ? 'Atualizar' : 'Adicionar')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Enquete */}
      {showEnqueteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Criar Enquete</h3>
            
            <form onSubmit={handleSubmitEnquete} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Pergunta</label>
                <input
                  type="text"
                  value={formEnquete.pergunta}
                  onChange={(e) => setFormEnquete({ ...formEnquete, pergunta: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Opções</label>
                {formEnquete.opcoes.map((opcao, index) => (
                  <input
                    key={index}
                    type="text"
                    value={opcao}
                    onChange={(e) => {
                      const novasOpcoes = [...formEnquete.opcoes]
                      novasOpcoes[index] = e.target.value
                      setFormEnquete({ ...formEnquete, opcoes: novasOpcoes })
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary mb-2"
                    placeholder={`Opção ${index + 1}`}
                    required
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setFormEnquete({ ...formEnquete, opcoes: [...formEnquete.opcoes, ''] })}
                  className="text-sementes-primary hover:text-sementes-accent text-sm"
                >
                  + Adicionar opção
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Data de Encerramento (opcional)</label>
                <input
                  type="date"
                  value={formEnquete.dataFim}
                  onChange={(e) => setFormEnquete({ ...formEnquete, dataFim: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEnqueteModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-sementes-primary hover:bg-sementes-secondary disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {saving ? 'Criando...' : 'Criar Enquete'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Suporte */}
      {suporteStatus === 'enviando' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Suporte</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mensagem</label>
                <textarea
                  value={suporteMsg}
                  onChange={(e) => setSuporteMsg(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sementes-primary h-32"
                  placeholder="Descreva sua dúvida ou problema..."
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSuporteStatus('idle')}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarSuporte}
                  className="flex-1 bg-sementes-primary hover:bg-sementes-secondary text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
