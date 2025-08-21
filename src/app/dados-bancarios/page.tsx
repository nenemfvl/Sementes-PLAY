'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  QrCodeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

interface DadosPix {
  chavePix: string
  tipoChave: string
  nomeTitular: string
  cpfCnpj: string
  validado: boolean
}

export default function DadosBancariosPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dadosPix, setDadosPix] = useState<DadosPix>({
    chavePix: '',
    tipoChave: 'cpf',
    nomeTitular: '',
    cpfCnpj: '',
    validado: false
  })
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'info', mensagem: string } | null>(null)

  const tiposChave = [
    { valor: 'cpf', label: 'CPF' },
    { valor: 'cnpj', label: 'CNPJ' },
    { valor: 'email', label: 'E-mail' },
    { valor: 'telefone', label: 'Telefone' },
    { valor: 'aleatoria', label: 'Chave Aleatória' }
  ]

  useEffect(() => {
    const verificarAutenticacao = () => {
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      if (usuarioSalvo) {
        try {
          const dadosUsuario = JSON.parse(usuarioSalvo)
          setUsuario(dadosUsuario)
          setIsAuthenticated(true)
          
          // Carregar dados PIX existentes
          loadDadosPix(dadosUsuario.id)
        } catch (error) {
          console.error('Erro ao ler dados do usuário:', error)
          localStorage.removeItem('usuario-dados')
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    verificarAutenticacao()
  }, [router])

  const loadDadosPix = async (usuarioId: string) => {
    try {
      const response = await fetch(`/api/dados-pix?usuarioId=${usuarioId}`)
      if (response.ok) {
        const data = await response.json()
        setDadosPix(data.dados)
      }
    } catch (error) {
      console.error('Erro ao carregar dados PIX:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setDadosPix(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dadosPix.chavePix || !dadosPix.nomeTitular || !dadosPix.cpfCnpj) {
      setNotificacao({
        tipo: 'erro',
        mensagem: 'Todos os campos são obrigatórios'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/dados-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dadosPix,
          usuarioId: usuario.id
        }),
      })

      if (response.ok) {
        setNotificacao({
          tipo: 'sucesso',
          mensagem: 'Dados PIX salvos com sucesso!'
        })
        
        // Recarregar dados
        await loadDadosPix(usuario.id)
      } else {
        const error = await response.json()
        setNotificacao({
          tipo: 'erro',
          mensagem: error.error || 'Erro ao salvar dados PIX'
        })
      }
    } catch (error) {
      console.error('Erro ao salvar dados PIX:', error)
      setNotificacao({
        tipo: 'erro',
        mensagem: 'Erro ao salvar dados PIX'
      })
    } finally {
      setSaving(false)
    }
  }

  const validarCPF = (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) return false
    
    // Validação básica de CPF
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
    }
    let resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.charAt(9))) return false
    
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
    }
    resto = 11 - (soma % 11)
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpfLimpo.charAt(10))) return false
    
    return true
  }

  const validarCNPJ = (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return false
    
    // Validação básica de CNPJ
    let soma = 0
    let peso = 2
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    let resto = soma % 11
    if (resto < 2) resto = 0
    else resto = 11 - resto
    if (resto !== parseInt(cnpjLimpo.charAt(12))) return false
    
    soma = 0
    peso = 2
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpjLimpo.charAt(i)) * peso
      peso = peso === 9 ? 2 : peso + 1
    }
    resto = soma % 11
    if (resto < 2) resto = 0
    else resto = 11 - resto
    if (resto !== parseInt(cnpjLimpo.charAt(13))) return false
    
    return true
  }

  const validarChave = () => {
    if (dadosPix.tipoChave === 'cpf') {
      return validarCPF(dadosPix.cpfCnpj)
    } else if (dadosPix.tipoChave === 'cnpj') {
      return validarCNPJ(dadosPix.cpfCnpj)
    } else if (dadosPix.tipoChave === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(dadosPix.cpfCnpj)
    } else if (dadosPix.tipoChave === 'telefone') {
      const telefoneRegex = /^\+?[1-9]\d{1,14}$/
      return telefoneRegex.test(dadosPix.cpfCnpj)
    }
    return true
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
                href="/carteira"
                className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Voltar à Carteira
              </Link>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-sementes-primary to-sementes-accent rounded-2xl flex items-center justify-center shadow-2xl">
                  <QrCodeIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Dados Bancários
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Configure seus dados PIX para receber saques e pagamentos
              </p>
            </div>
          </motion.div>

          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Chave PIX */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Tipo de Chave PIX
                </label>
                <select
                  value={dadosPix.tipoChave}
                  onChange={(e) => handleInputChange('tipoChave', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-sementes-primary focus:outline-none transition-colors"
                >
                  {tiposChave.map((tipo) => (
                    <option key={tipo.valor} value={tipo.valor}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-1">
                  Escolha o tipo de chave PIX que você deseja usar
                </p>
              </div>

              {/* Chave PIX */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={dadosPix.chavePix}
                  onChange={(e) => handleInputChange('chavePix', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                  placeholder={
                    dadosPix.tipoChave === 'cpf' ? '000.000.000-00' :
                    dadosPix.tipoChave === 'cnpj' ? '00.000.000/0000-00' :
                    dadosPix.tipoChave === 'email' ? 'seu@email.com' :
                    dadosPix.tipoChave === 'telefone' ? '+5511999999999' :
                    'Chave aleatória'
                  }
                />
                <p className="text-gray-400 text-sm mt-1">
                  Digite sua chave PIX conforme o tipo selecionado
                </p>
              </div>

              {/* Nome do Titular */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  value={dadosPix.nomeTitular}
                  onChange={(e) => handleInputChange('nomeTitular', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                  placeholder="Nome completo do titular da conta"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Nome completo como está no banco
                </p>
              </div>

              {/* CPF/CNPJ */}
              <div>
                <label className="block text-white font-medium mb-2">
                  {dadosPix.tipoChave === 'cpf' ? 'CPF' : 
                   dadosPix.tipoChave === 'cnpj' ? 'CNPJ' : 
                   dadosPix.tipoChave === 'email' ? 'E-mail' :
                   dadosPix.tipoChave === 'telefone' ? 'Telefone' : 'Chave'}
                </label>
                <input
                  type="text"
                  value={dadosPix.cpfCnpj}
                  onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sementes-primary focus:outline-none transition-colors"
                  placeholder={
                    dadosPix.tipoChave === 'cpf' ? '000.000.000-00' :
                    dadosPix.tipoChave === 'cnpj' ? '00.000.000/0000-00' :
                    dadosPix.tipoChave === 'email' ? 'seu@email.com' :
                    dadosPix.tipoChave === 'telefone' ? '+5511999999999' :
                    'Chave'
                  }
                />
                <p className="text-gray-400 text-sm mt-1">
                  {dadosPix.tipoChave === 'cpf' ? 'CPF do titular da conta' :
                   dadosPix.tipoChave === 'cnpj' ? 'CNPJ da empresa' :
                   dadosPix.tipoChave === 'email' ? 'E-mail cadastrado no banco' :
                   dadosPix.tipoChave === 'telefone' ? 'Telefone cadastrado no banco' :
                   'Chave cadastrada no banco'}
                </p>
              </div>

              {/* Validação */}
              {dadosPix.cpfCnpj && !validarChave() && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-300">
                      {dadosPix.tipoChave === 'cpf' ? 'CPF inválido' :
                       dadosPix.tipoChave === 'cnpj' ? 'CNPJ inválido' :
                       dadosPix.tipoChave === 'email' ? 'E-mail inválido' :
                       dadosPix.tipoChave === 'telefone' ? 'Telefone inválido' :
                       'Chave inválida'}
                    </span>
                  </div>
                </div>
              )}

              {/* Botão de Envio */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving || !validarChave()}
                  className="w-full px-8 py-4 bg-gradient-to-r from-sementes-primary to-sementes-accent hover:from-sementes-accent hover:to-sementes-primary text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Salvando...' : 'Salvar Dados PIX'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Informações Importantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 mr-2" />
                Informações Importantes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Segurança</h4>
                      <p className="text-gray-300 text-sm">
                        Seus dados são criptografados e armazenados com segurança
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Validação</h4>
                      <p className="text-gray-300 text-sm">
                        Os dados são validados antes de serem salvos
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Saques</h4>
                      <p className="text-gray-300 text-sm">
                        Necessário para solicitar saques da sua carteira
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold">Atualização</h4>
                      <p className="text-gray-300 text-sm">
                        Você pode atualizar seus dados a qualquer momento
                      </p>
                    </div>
                  </div>
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
          <div className="flex items-center">
            {notificacao.tipo === 'sucesso' ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{notificacao.mensagem}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
