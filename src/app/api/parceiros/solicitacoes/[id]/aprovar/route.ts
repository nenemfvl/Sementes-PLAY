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
    const { parceiroId } = body

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

    // Atualiza status para aprovada
    await prisma.solicitacaoCompra.update({
      where: { id: id },
      data: {
        status: 'aprovada',
        dataAprovacao: new Date()
      }
    })

    // Cria a compra efetiva
    const compra = await prisma.compraParceiro.create({
      data: {
        usuarioId: solicitacao.usuarioId,
        parceiroId: solicitacao.parceiroId,
        valorCompra: solicitacao.valorCompra,
        dataCompra: solicitacao.dataCompra,
        comprovanteUrl: solicitacao.comprovanteUrl,
        status: 'aguardando_repasse',
        cupomUsado: solicitacao.cupomUsado
      }
    })

    // Cria notificação para o usuário
    await prisma.notificacao.create({
      data: {
        usuarioId: solicitacao.usuarioId,
        titulo: 'Solicitação de Compra Aprovada!',
        mensagem: `Sua solicitação de compra de R$ ${solicitacao.valorCompra.toFixed(2)} foi aprovada pelo parceiro ${solicitacao.parceiro.nomeCidade}. Aguarde o pagamento.`,
        tipo: 'solicitacao_aprovada',
        lida: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitação aprovada com sucesso!',
      compra
    })
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
