import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // Rotas que precisam de autenticação
  const protectedRoutes = [
    '/dashboard',
    '/perfil',
    '/carteira',
    '/doacoes',
    '/relatorios',
    '/configuracoes'
  ]

  // Verificar se a rota atual precisa de autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirecionar para login se não tiver token
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verificar token JWT
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      )
      
      await jwtVerify(token, secret)
      
      // Token válido, continuar
      return NextResponse.next()
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
    '/dashboard/:path*',
    '/perfil/:path*',
    '/carteira/:path*',
    '/doacoes/:path*',
    '/relatorios/:path*',
    '/configuracoes/:path*'
  ]
}
