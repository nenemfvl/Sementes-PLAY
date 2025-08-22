import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { compraId, parceiroId, valor, comprovanteUrl } = body

    if (!compraId || !parceiroId || !valor) {
      return NextResponse.json(
        { error: 'CompraId, parceiroId e valor são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se a compra existe e pertence ao parceiro
    const compra = await prisma.compraParceiro.findFirst({
      where: {
        id: compraId,
        parceiroId: parceiroId,
        status: 'aguardando_repasse'
      },
      include: {
        usuario: true,
        parceiro: true
      }
    })

    if (!compra) {
      return NextResponse.json(
        { error: 'Compra não encontrada ou não está aguardando repasse' },
        { status: 404 }
      )
    }

    // Verifica se já existe um repasse para esta compra
    const repasseExistente = await prisma.repasseParceiro.findUnique({
      where: { compraId: compraId }
    })

    if (repasseExistente) {
      return NextResponse.json(
        { error: 'Já existe um repasse para esta compra' },
        { status: 400 }
      )
    }

    // Cria o repasse
    const repasse = await prisma.repasseParceiro.create({
      data: {
        parceiroId: parceiroId,
        compraId: compraId,
        valor: valor,
        comprovanteUrl: comprovanteUrl,
        status: 'pendente',
        dataRepasse: new Date()
      }
    })

    // A compra continua com status 'aguardando_repasse' até o admin aprovar

    // Cria notificação para o usuário
    await prisma.notificacao.create({
      data: {
        usuarioId: compra.usuarioId,
        titulo: 'Repasse Realizado!',
        mensagem: `O parceiro ${compra.parceiro.nomeCidade} realizou o repasse de R$ ${valor.toFixed(2)} para sua compra. Aguarde a liberação do cashback.`,
        tipo: 'repasse_realizado',
        lida: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Repasse criado com sucesso! Aguardando aprovação administrativa.',
      repasse
    })
  } catch (error) {
    console.error('Erro ao criar repasse:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
