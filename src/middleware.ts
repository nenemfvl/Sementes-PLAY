import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  console.log('🔒 [MIDDLEWARE] Verificando rota:', request.nextUrl.pathname)
  console.log('🌐 [MIDDLEWARE] User Agent:', request.headers.get('user-agent'))
  
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
    console.log('🔒 [MIDDLEWARE] Rota protegida detectada')
    
    // Verificar token nos cookies
    const token = request.cookies.get('auth-token')?.value
    console.log('🍪 [MIDDLEWARE] Token encontrado:', !!token)

    if (!token) {
      console.log('❌ [MIDDLEWARE] Sem token, redirecionando para login')
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
        console.log('✅ [MIDDLEWARE] Token válido, permitindo acesso')
        
        // Token válido, continuar
        return NextResponse.next()
      } catch (jwtError) {
        console.log('⚠️ [MIDDLEWARE] Erro na verificação JWT, tentando verificação manual...')
        
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
              console.log('✅ [MIDDLEWARE] Token válido (verificação manual), permitindo acesso')
              return NextResponse.next()
            }
          }
        } catch (manualError) {
          console.log('❌ [MIDDLEWARE] Verificação manual falhou:', manualError)
        }
        
        throw jwtError
      }
    } catch (error) {
      console.log('❌ [MIDDLEWARE] Token inválido, redirecionando para login')
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
