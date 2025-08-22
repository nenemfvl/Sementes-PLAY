import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { parceiroId, motivoRejeicao } = body

    if (!id || !parceiroId) {
      return NextResponse.json(
        { error: 'ID da solicitação e ID do parceiro são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se a solicitação existe e pertence ao parceiro
    const solicitacao = await prisma.solicitacaoCompra.findFirst({
      where: {
        id: id,
        parceiroId: parceiroId,
        status: 'pendente'
      },
      include: {
        usuario: true,
        parceiro: true
      }
    })

    if (!solicitacao) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada ou já processada' },
        { status: 404 }
      )
    }

    // Atualiza status para rejeitada
    await prisma.solicitacaoCompra.update({
      where: { id: id },
      data: {
        status: 'rejeitada',
        dataRejeicao: new Date(),
        motivoRejeicao: motivoRejeicao || 'Rejeitada pelo parceiro'
      }
    })

    // Cria notificação para o usuário
    await prisma.notificacao.create({
      data: {
        usuarioId: solicitacao.usuarioId,
        titulo: 'Solicitação de Compra Rejeitada',
        mensagem: `Sua solicitação de compra de R$ ${solicitacao.valorCompra.toFixed(2)} foi rejeitada pelo parceiro ${solicitacao.parceiro.nomeCidade}. Motivo: ${motivoRejeicao || 'Rejeitada pelo parceiro'}`,
        tipo: 'solicitacao_rejeitada',
        lida: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitação rejeitada com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
