'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

// Forçar renderização dinâmica para evitar erro de prerendering
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  
  // Função de login direta como no site antigo
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      // Salvar dados do usuário no localStorage
      localStorage.setItem('usuario-dados', JSON.stringify(data.usuario))
      localStorage.setItem('auth-token', data.token)
      
              // Redirecionar para perfil
        window.location.href = '/perfil'
    } catch (error) {
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
            Bem-vindo de volta
          </h2>
          <p className="text-gray-400">
            Faça login na sua conta SementesPLAY
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-field w-full"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
            />
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
                autoComplete="current-password"
                required
                className="input-field w-full pr-10"
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-sementes-primary focus:ring-sementes-primary border-gray-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Lembrar de mim
              </label>
            </div>

            <div className="text-sm">
              <Link href="/esqueci-senha" className="text-sementes-primary hover:text-sementes-accent">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <Link href="/registro" className="text-sementes-primary hover:text-sementes-accent font-medium">
                Registre-se
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
            Ao fazer login, você concorda com nossos{' '}
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
