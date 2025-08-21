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

  // Verificar se a rota atual precisa de autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
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
        await jwtVerify(token, secret)
        
        // Token válido, continuar
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
    '/configuracoes/:path*'
  ]
}
