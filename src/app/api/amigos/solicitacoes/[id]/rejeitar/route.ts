import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitacaoId = params.id

    if (!solicitacaoId) {
      return NextResponse.json(
        { error: 'ID da solicitação é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar a solicitação
    const solicitacao = await prisma.amizade.findUnique({
      where: { id: solicitacaoId }
    })

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    if (solicitacao.status !== 'pendente') {
      return NextResponse.json(
        { error: 'Solicitação já foi processada' },
        { status: 400 }
      )
    }

    // Rejeitar a solicitação
    await prisma.amizade.update({
      where: { id: solicitacaoId },
      data: {
        status: 'rejeitada',
        dataResposta: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
