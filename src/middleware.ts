import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // Rotas que precisam de autenticação
  const protectedRoutes = [
    '/perfil',
    '/doacoes',
    '/relatorios',
    '/configuracoes'
  ]

  // Rotas que precisam de nível de criador
  const criadorRoutes = [
    '/painel-criador',
    '/criador'
  ]

  // Verificar se a rota atual precisa de autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Verificar se a rota atual precisa de nível de criador
  const isCriadorRoute = criadorRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute || isCriadorRoute) {
    // Verificar token nos cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirecionar para login se não tiver token
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verificar token JWT com tratamento específico para Edge
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      )
      
      // Verificação mais robusta para Edge
      try {
        const { payload } = await jwtVerify(token, secret)
        
        // Se for rota de criador, verificar nível
        if (isCriadorRoute) {
          const userLevel = (payload as any).nivel
          const validCriadorLevels = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
          
          if (!validCriadorLevels.includes(userLevel)) {
            // Usuário não tem nível de criador, redirecionar para perfil
            return NextResponse.redirect(new URL('/perfil', request.url))
          }
        }
        
        // Token válido e autorizado, continuar
        return NextResponse.next()
      } catch (jwtError) {
        // Verificação manual para Edge
        try {
          const tokenParts = token.split('.')
          if (tokenParts.length === 3) {
            // Verificar se é um token JWT válido
            const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString())
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
            
            // Verificar se não expirou
            const agora = Math.floor(Date.now() / 1000)
            if (payload.exp && payload.exp > agora) {
              // Se for rota de criador, verificar nível
              if (isCriadorRoute) {
                const userLevel = payload.nivel
                const validCriadorLevels = ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
                
                if (!validCriadorLevels.includes(userLevel)) {
                  // Usuário não tem nível de criador, redirecionar para perfil
                  return NextResponse.redirect(new URL('/perfil', request.url))
                }
              }
              
              return NextResponse.next()
            }
          }
        } catch (manualError) {
          // Silenciar erro
        }
        
        throw jwtError
      }
    } catch (error) {
      // Token inválido, redirecionar para login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/perfil/:path*',
    '/doacoes/:path*',
    '/relatorios/:path*',
    '/configuracoes/:path*',
    '/painel-criador/:path*',
    '/criador/:path*'
  ]
}
