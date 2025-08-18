import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Solicitar saque (apenas criadores)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, valor, dadosBancarios } = body

    if (!usuarioId || !valor || !dadosBancarios) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (valor <= 0) {
      return NextResponse.json(
        { error: 'Valor do saque deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Verificar se o usuário é um criador
    const criador = await prisma.criador.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            nome: true,
            nivel: true
          }
        }
      }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Apenas criadores de conteúdo podem solicitar saques' },
        { status: 403 }
      )
    }

    // Verificar se o criador tem saldo suficiente
    const carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId }
    })

    if (!carteira || carteira.saldo < valor) {
      return NextResponse.json(
        { error: 'Saldo insuficiente para o saque solicitado' },
        { status: 400 }
      )
    }

    // Verificar se já existe um saque pendente
    const saquePendente = await prisma.saque.findFirst({
      where: {
        usuarioId,
        status: 'pendente'
      }
    })

    if (saquePendente) {
      return NextResponse.json(
        { error: 'Você já possui um saque pendente. Aguarde o processamento.' },
        { status: 400 }
      )
    }

    // Calcular taxa (5% para criadores)
    const taxa = valor * 0.05
    const valorLiquido = valor - taxa

    // Verificar valor mínimo (R$ 50,00)
    if (valorLiquido < 50) {
      return NextResponse.json(
        { error: 'Valor líquido mínimo para saque é R$ 50,00' },
        { status: 400 }
      )
    }

    // Iniciar transação para garantir consistência
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Criar solicitação de saque
      const saque = await tx.saque.create({
        data: {
          usuarioId,
          valor,
          taxa,
          valorLiquido,
          dadosBancarios: JSON.stringify(dadosBancarios),
          status: 'pendente',
          dataSolicitacao: new Date()
        }
      })

      // 2. Debitar da carteira (colocar como pendente)
      const carteiraAtualizada = await tx.carteiraDigital.update({
        where: { id: carteira.id },
        data: {
          saldo: carteira.saldo - valor,
          saldoPendente: carteira.saldoPendente + valor
        }
      })

      // 3. Registrar movimentação
      await tx.movimentacaoCarteira.create({
        data: {
          carteiraId: carteira.id,
          tipo: 'pendente',
          valor,
          saldoAnterior: carteira.saldo,
          saldoPosterior: carteira.saldo - valor,
          descricao: 'Saque solicitado - Aguardando processamento',
          referencia: `saque_${saque.id}`,
          status: 'processado'
        }
      })

      // 4. Atualizar sementes do usuário
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { sementes: carteiraAtualizada.saldo }
      })

      // 5. Log de auditoria
      await tx.logAuditoria.create({
        data: {
          usuarioId,
          acao: 'SAQUE_SOLICITADO',
          detalhes: `Saque solicitado: R$ ${valor.toFixed(2)} - Valor líquido: R$ ${valorLiquido.toFixed(2)}`,
          nivel: 'info'
        }
      })

      return {
        saque,
        carteira: carteiraAtualizada
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Saque solicitado com sucesso! Aguarde o processamento.',
      dados: {
        saque: resultado.saque,
        valorLiquido: resultado.saque.valorLiquido,
        taxa: resultado.saque.taxa
      }
    })

  } catch (error) {
    console.error('Erro ao solicitar saque:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Consultar saques do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')
    const status = searchParams.get('status')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário é um criador
    const criador = await prisma.criador.findUnique({
      where: { usuarioId }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Apenas criadores de conteúdo podem consultar saques' },
        { status: 403 }
      )
    }

    const where: any = { usuarioId }
    if (status) where.status = status

    const offset = (pagina - 1) * limite

    const [saques, total] = await Promise.all([
      prisma.saque.findMany({
        where,
        orderBy: { dataSolicitacao: 'desc' },
        skip: offset,
        take: limite
      }),
      prisma.saque.count({ where })
    ])

    const totalPaginas = Math.ceil(total / limite)

    return NextResponse.json({
      sucesso: true,
      dados: {
        saques: saques.map(saque => ({
          ...saque,
          dadosBancarios: JSON.parse(saque.dadosBancarios)
        })),
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas
        }
      }
    })

  } catch (error) {
    console.error('Erro ao consultar saques:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
