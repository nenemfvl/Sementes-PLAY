import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

// GET - Consultar carteira do usuário
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

    // Buscar carteira do usuário
    let carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            nome: true,
            nivel: true,
            sementes: true
          }
        }
      }
    })

    // Se não existir, criar uma nova carteira
    if (!carteira) {
      carteira = await prisma.carteiraDigital.create({
        data: {
          usuarioId,
          saldo: 0,
          saldoPendente: 0,
          totalRecebido: 0,
          totalSacado: 0
        },
        include: {
          usuario: {
            select: {
              nome: true,
              nivel: true,
              sementes: true
            }
          }
        }
      })
    }

    // Buscar movimentações recentes
    const movimentacoes = await prisma.movimentacaoCarteira.findMany({
      where: { carteiraId: carteira.id },
      orderBy: { data: 'desc' },
      take: 10
    })

    return NextResponse.json({
      sucesso: true,
      carteira: {
        ...carteira,
        movimentacoes
      }
    })

  } catch (error) {
    console.error('Erro ao consultar carteira:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Atualizar saldo da carteira
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, tipo, valor, descricao, referencia } = body

    if (!usuarioId || !tipo || !valor || !descricao) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar ou criar carteira
    let carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId }
    })

    if (!carteira) {
      carteira = await prisma.carteiraDigital.create({
        data: {
          usuarioId,
          saldo: 0,
          saldoPendente: 0,
          totalRecebido: 0,
          totalSacado: 0
        }
      })
    }

    const saldoAnterior = carteira.saldo
    let saldoPosterior = saldoAnterior

    // Calcular novo saldo baseado no tipo de movimentação
    switch (tipo) {
      case 'credito':
        saldoPosterior = saldoAnterior + valor
        break
      case 'debito':
        if (saldoAnterior < valor) {
          return NextResponse.json(
            { error: 'Saldo insuficiente' },
            { status: 400 }
          )
        }
        saldoPosterior = saldoAnterior - valor
        break
      case 'pendente':
        // Para valores pendentes, não altera o saldo atual
        saldoPosterior = saldoAnterior
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de movimentação inválido' },
          { status: 400 }
        )
    }

    // Atualizar carteira
    const carteiraAtualizada = await prisma.carteiraDigital.update({
      where: { id: carteira.id },
      data: {
        saldo: saldoPosterior,
        saldoPendente: tipo === 'pendente' ? carteira.saldoPendente + valor : carteira.saldoPendente,
        totalRecebido: tipo === 'credito' ? carteira.totalRecebido + valor : carteira.totalRecebido,
        totalSacado: tipo === 'debito' ? carteira.totalSacado + valor : carteira.totalSacado
      }
    })

    // Registrar movimentação
    const movimentacao = await prisma.movimentacaoCarteira.create({
      data: {
        carteiraId: carteira.id,
        tipo,
        valor,
        saldoAnterior,
        saldoPosterior,
        descricao,
        referencia,
        status: 'processado'
      }
    })

    // Atualizar sementes do usuário
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { sementes: saldoPosterior }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Movimentação registrada com sucesso',
      carteira: carteiraAtualizada,
      movimentacao
    })

  } catch (error) {
    console.error('Erro ao processar movimentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
