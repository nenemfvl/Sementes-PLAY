import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Tentar obter o usuário do cookie de sessão
    let userId = null
    const userCookie = request.cookies.get('sementesplay_user')
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.value))
        userId = userData.id
      } catch (error) {
        console.error('Erro ao decodificar cookie do usuário:', error)
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        criador: true,
        parceiro: true
      }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 })
    }

    // Retornar dados do usuário sem a senha
    const { senha, ...usuarioSemSenha } = usuario

    return NextResponse.json({ 
      usuario: usuarioSemSenha,
      autenticado: true 
    })
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
