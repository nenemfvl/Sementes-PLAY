import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const amigoId = params.id

    if (!amigoId) {
      return NextResponse.json(
        { error: 'ID do amigo é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a amizade
    const amizade = await prisma.amizade.findFirst({
      where: {
        OR: [
          { usuarioId: amigoId, status: 'aceita' },
          { amigoId: amigoId, status: 'aceita' }
        ]
      }
    })

    if (!amizade) {
      return NextResponse.json(
        { error: 'Amizade não encontrada' },
        { status: 404 }
      )
    }

    // Remover a amizade
    await prisma.amizade.delete({
      where: { id: amizade.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover amigo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
