import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  console.log('🔒 [MIDDLEWARE] Verificando rota:', request.nextUrl.pathname)
  
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
      // Verificar token JWT
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      )
      
      await jwtVerify(token, secret)
      console.log('✅ [MIDDLEWARE] Token válido, permitindo acesso')
      
      // Token válido, continuar
      return NextResponse.next()
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
