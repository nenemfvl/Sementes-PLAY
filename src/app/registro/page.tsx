'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function RegistroPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    aceiteTermos: false
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    const newErrors: Record<string, string> = {}
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username é obrigatório'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username deve ter pelo menos 3 caracteres'
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }
    
    if (!formData.aceiteTermos) {
      newErrors.aceiteTermos = 'Você deve aceitar os termos de uso'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Implementar lógica de registro
    console.log('Registro:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  return (
    <div className="min-h-screen bg-sss-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <span className="text-4xl">🌱</span>
          </div>
          <h2 className="text-3xl font-bold text-sss-white mb-2">
            Crie sua conta
          </h2>
          <p className="text-gray-400">
            Junte-se à comunidade SementesPLAY
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
              Nome completo
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              autoComplete="name"
              required
              className={`input-field w-full ${errors.nome ? 'border-red-500' : ''}`}
              placeholder="Seu nome completo"
              value={formData.nome}
              onChange={handleChange}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-500">{errors.nome}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`input-field w-full ${errors.email ? 'border-red-500' : ''}`}
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className={`input-field w-full ${errors.username ? 'border-red-500' : ''}`}
              placeholder="seu_username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={`input-field w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={`input-field w-full pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="aceiteTermos"
                name="aceiteTermos"
                type="checkbox"
                className="h-4 w-4 text-sementes-primary focus:ring-sementes-primary border-gray-600 rounded"
                checked={formData.aceiteTermos}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="aceiteTermos" className="text-gray-300">
                Eu concordo com os{' '}
                <Link href="/termos" className="text-sementes-primary hover:text-sementes-accent">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link href="/privacidade" className="text-sementes-primary hover:text-sementes-accent">
                  Política de Privacidade
                </Link>
              </label>
              {errors.aceiteTermos && (
                <p className="mt-1 text-sm text-red-500">{errors.aceiteTermos}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Criar conta
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-sementes-primary hover:text-sementes-accent font-medium">
                Faça login
              </Link>
            </p>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-500 text-xs">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="/termos" className="text-sementes-primary hover:text-sementes-accent">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacidade" className="text-sementes-primary hover:text-sementes-accent">
              Política de Privacidade
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
