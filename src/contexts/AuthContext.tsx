'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: string
  sementes: number
  nivel: string
  avatarUrl?: string
}

interface AuthContextType {
  usuario: Usuario | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  registro: (nome: string, email: string, username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      // Verificar se token ainda é válido
      verificarToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verificarToken = async (token: string) => {
    try {
      // Aqui você pode fazer uma chamada para verificar o token
      // Por enquanto, vamos apenas decodificar o JWT
      const payload = JSON.parse(atob(token.split('.')[1]))
      const agora = Math.floor(Date.now() / 1000)
      
      if (payload.exp > agora) {
        // Token válido
        setUsuario({
          id: payload.userId,
          nome: payload.nome || 'Usuário',
          email: payload.email,
          tipo: payload.tipo,
          sementes: 0,
          nivel: 'comum'
        })
        setIsAuthenticated(true)
      } else {
        // Token expirado
        localStorage.removeItem('auth-token')
      }
    } catch (error) {
      localStorage.removeItem('auth-token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
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

      // Salvar token
      localStorage.setItem('auth-token', data.token)
      
      // Atualizar estado
      setUsuario(data.usuario)
      setIsAuthenticated(true)
      
      // Redirecionar para dashboard
      router.push('/dashboard')
      
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const registro = async (nome: string, email: string, username: string, password: string) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      // Redirecionar para login com mensagem de sucesso
      router.push('/login?message=Conta criada com sucesso!')
      
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    setUsuario(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  const value = {
    usuario,
    isAuthenticated,
    login,
    registro,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
