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
  xp: number
  pontuacao: number
  avatarUrl?: string
  criador?: {
    id: string
    nome: string
    categoria: string
    nivel: string
    status?: string
  } | null
  parceiro?: {
    id: string
    nomeCidade: string
    status?: string
  } | null
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

// Função para salvar token nos cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

// Função para remover cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se usuário está logado ao carregar - simples como no site antigo
  useEffect(() => {
    console.log('🔍 [AUTH] useEffect executado')
    
    const verificarAutenticacao = async () => {
      console.log('🔍 [AUTH] Verificando autenticação...')
      
      // Primeiro, verificar se temos dados do usuário salvos no localStorage
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      const token = localStorage.getItem('auth-token')
      
      console.log('📱 [AUTH] Usuário no localStorage:', usuarioSalvo ? 'EXISTE' : 'NÃO EXISTE')
      console.log('🔑 [AUTH] Token no localStorage:', token ? 'EXISTE' : 'NÃO EXISTE')
      
      if (usuarioSalvo && token) {
        try {
          console.log('✅ [AUTH] Usuário e token encontrados, parseando...')
          const dadosUsuario = JSON.parse(usuarioSalvo)
          console.log('👤 [AUTH] Dados do usuário:', dadosUsuario)
          
          // Verificar se o token ainda é válido
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const agora = Math.floor(Date.now() / 1000)
            
            if (payload.exp > agora) {
              console.log('✅ [AUTH] Token válido, usuário autenticado')
              setUsuario(dadosUsuario)
              setIsAuthenticated(true)
            } else {
              console.log('❌ [AUTH] Token expirado, removendo dados')
              localStorage.removeItem('usuario-dados')
              localStorage.removeItem('auth-token')
              setUsuario(null)
              setIsAuthenticated(false)
            }
          } catch (tokenError) {
            console.error('❌ [AUTH] Erro ao verificar token:', tokenError)
            localStorage.removeItem('usuario-dados')
            localStorage.removeItem('auth-token')
            setUsuario(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao parsear usuário:', error)
          localStorage.removeItem('usuario-dados')
          localStorage.removeItem('auth-token')
          setUsuario(null)
          setIsAuthenticated(false)
          console.log('🧹 [AUTH] Dados inválidos removidos')
        }
      } else {
        console.log('❌ [AUTH] Sem usuário ou token no localStorage')
        setUsuario(null)
        setIsAuthenticated(false)
      }
      
      setLoading(false)
      console.log('🏁 [AUTH] Verificação concluída, loading = false')
    }
    
    verificarAutenticacao()
  }, [])

  // Não mostrar usuário enquanto está carregando
  const usuarioExibicao = loading ? null : usuario

  const verificarToken = async (token: string) => {
    try {
      // Verificar se temos dados do usuário salvos no localStorage
      const usuarioSalvo = localStorage.getItem('usuario-dados')
      
      if (usuarioSalvo) {
        // Usar dados salvos para evitar fallbacks
        const dadosUsuario = JSON.parse(usuarioSalvo)
        setUsuario(dadosUsuario)
        setIsAuthenticated(true)
        return
      }
      
      // Se não tiver dados salvos, verificar token
      const payload = JSON.parse(atob(token.split('.')[1]))
      const agora = Math.floor(Date.now() / 1000)
      
      if (payload.exp > agora) {
        // Token válido - usar dados disponíveis com fallbacks seguros
        setUsuario({
          id: payload.userId || payload.sub || 'unknown',
          nome: payload.nome || payload.name || 'Usuário',
          email: payload.email || '',
          tipo: payload.tipo || 'comum',
          sementes: payload.sementes || 0,
          nivel: payload.nivel || 'comum',
          xp: payload.xp || 0,
          pontuacao: payload.pontuacao || 0
        })
        setIsAuthenticated(true)
      } else {
        // Token expirado
        throw new Error('Token expirado')
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      throw error
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

      // Salvar token no localStorage e cookies
      localStorage.setItem('auth-token', data.token)
      setCookie('auth-token', data.token)
      
      // SALVAR DADOS COMPLETOS DO USUÁRIO para evitar fallbacks
      localStorage.setItem('usuario-dados', JSON.stringify(data.usuario))
      
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
    localStorage.removeItem('usuario-dados')
    removeCookie('auth-token')
    setUsuario(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  const value = {
    usuario: usuarioExibicao,
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
