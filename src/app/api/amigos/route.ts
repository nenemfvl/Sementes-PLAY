import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar amizades aceitas do usuário
    const amizades = await prisma.amizade.findMany({
      where: {
        OR: [
          { usuarioId: String(usuarioId), status: 'aceita' },
          { amigoId: String(usuarioId), status: 'aceita' }
        ]
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            sementes: true
          }
        },
        amigo: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            sementes: true
          }
        }
      }
    })

    // Formatar lista de amigos
    const amigos = amizades.map(amizade => {
      const amigo = amizade.usuarioId === usuarioId ? amizade.amigo : amizade.usuario
      const mutual = true // Se está na lista, é mutual

      return {
        id: amigo.id,
        nome: amigo.nome,
        email: amigo.email,
        nivel: amigo.nivel,
        sementes: amigo.sementes,
        status: 'online' as const, // Mockado por enquanto
        ultimaAtividade: new Date(),
        mutual
      }
    })

    return NextResponse.json({ amigos })
  } catch (error) {
    console.error('Erro ao buscar amigos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, amigoId } = await request.json()

    if (!usuarioId || !amigoId) {
      return NextResponse.json(
        { error: 'IDs do usuário e amigo são obrigatórios' },
        { status: 400 }
      )
    }

    if (usuarioId === amigoId) {
      return NextResponse.json(
        { error: 'Não é possível adicionar a si mesmo como amigo' },
        { status: 400 }
      )
    }

    // Verificar se já existe amizade
    const amizadeExistente = await prisma.amizade.findFirst({
      where: {
        OR: [
          { usuarioId: String(usuarioId), amigoId: String(amigoId) },
          { usuarioId: String(amigoId), amigoId: String(usuarioId) }
        ]
      }
    })

    if (amizadeExistente) {
      return NextResponse.json(
        { error: 'Amizade já existe' },
        { status: 400 }
      )
    }

    // Criar solicitação de amizade
    const novaAmizade = await prisma.amizade.create({
      data: {
        usuarioId: String(usuarioId),
        amigoId: String(amigoId),
        status: 'pendente'
      }
    })

    return NextResponse.json(novaAmizade, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar amigo:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
