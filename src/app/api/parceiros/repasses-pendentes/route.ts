import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Buscar o parceiro
    const parceiro = await prisma.parceiro.findUnique({
      where: { usuarioId: usuarioId }
    })

    if (!parceiro) {
      return NextResponse.json(
        { error: 'Parceiro não encontrado' },
        { status: 404 }
      )
    }

    // Buscar solicitações de compra pendentes
    const solicitacoesPendentes = await prisma.solicitacaoCompra.findMany({
      where: {
        parceiroId: parceiro.id,
        status: 'pendente'
      },
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    // Buscar compras aguardando repasse
    const comprasAguardandoRepasse = await prisma.compraParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: {
          in: ['aguardando_repasse', 'repasse_pendente']
        }
      },
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    // Buscar repasses pendentes
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: 'pendente'
      },
      include: {
        compra: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        dataRepasse: 'desc'
      }
    })

    // Formatar dados para o frontend
    const repassesFormatados = [
      // Solicitações pendentes
      ...solicitacoesPendentes.map(solicitacao => ({
        id: solicitacao.id,
        valorCompra: solicitacao.valorCompra,
        valorRepasse: solicitacao.valorCompra * 0.10, // 10% da compra
        status: 'solicitacao_pendente',
        dataCompra: solicitacao.dataCompra,
        dataRepasse: null,
        comprovante: solicitacao.comprovanteUrl,
        usuario: solicitacao.usuario,
        tipo: 'solicitacao'
      })),
      // Compras aguardando repasse
      ...comprasAguardandoRepasse.map(compra => ({
        id: compra.id,
        valorCompra: compra.valorCompra,
        valorRepasse: compra.valorCompra * 0.10, // 10% da compra
        status: 'aguardando_repasse',
        dataCompra: compra.dataCompra,
        dataRepasse: null,
        comprovante: compra.comprovanteUrl,
        usuario: compra.usuario,
        tipo: 'compra'
      })),
      // Repasses pendentes
      ...repassesPendentes.map(repasse => ({
        id: repasse.id,
        valorCompra: repasse.compra.valorCompra,
        valorRepasse: repasse.valor,
        status: 'repasse_pendente',
        dataCompra: repasse.compra.dataCompra,
        dataRepasse: repasse.dataRepasse,
        comprovante: repasse.comprovanteUrl,
        usuario: repasse.compra.usuario,
        tipo: 'repasse'
      }))
    ]

    return NextResponse.json(repassesFormatados)
  } catch (error) {
    console.error('Erro ao buscar repasses pendentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
