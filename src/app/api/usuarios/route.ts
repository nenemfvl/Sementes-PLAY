import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 2) {
      return NextResponse.json({ usuarios: [] })
    }

    // Buscar usuários por nome ou email
    const usuarios = await prisma.usuario.findMany({
      where: {
        OR: [
          {
            nome: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        sementes: true
      },
      take: 10,
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
