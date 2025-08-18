import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Criar nova transação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, tipo, valor, codigoParceiro, descricao } = body

    if (!usuarioId || !tipo || !valor || valor <= 0) {
      return NextResponse.json(
        { error: 'Dados inválidos para transação' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
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
    let tipoMovimentacao = 'credito'
    let descricaoMovimentacao = descricao || `Transação: ${tipo}`

    // Processar transação baseada no tipo
    switch (tipo) {
      case 'compra_parceiro':
        // Compra em parceiro gera sementes
        saldoPosterior = saldoAnterior + valor
        tipoMovimentacao = 'credito'
        descricaoMovimentacao = `Cashback de compra - Parceiro: ${codigoParceiro || 'N/A'}`
        break
        
      case 'bonus_login':
        // Bônus de login
        saldoPosterior = saldoAnterior + valor
        tipoMovimentacao = 'credito'
        descricaoMovimentacao = 'Bônus de login diário'
        break
        
      case 'bonus_streak':
        // Bônus de streak
        saldoPosterior = saldoAnterior + valor
        tipoMovimentacao = 'credito'
        descricaoMovimentacao = 'Bônus de streak de login'
        break
        
      case 'bonus_nivel':
        // Bônus por nível
        saldoPosterior = saldoAnterior + valor
        tipoMovimentacao = 'credito'
        descricaoMovimentacao = 'Bônus por evolução de nível'
        break
        
      case 'penalidade':
        // Penalidade (debito)
        if (saldoAnterior < valor) {
          return NextResponse.json(
            { error: 'Saldo insuficiente para penalidade' },
            { status: 400 }
          )
        }
        saldoPosterior = saldoAnterior - valor
        tipoMovimentacao = 'debito'
        descricaoMovimentacao = 'Penalidade aplicada'
        break
        
      case 'transferencia':
        // Transferência entre usuários
        if (saldoAnterior < valor) {
          return NextResponse.json(
            { error: 'Saldo insuficiente para transferência' },
            { status: 400 }
          )
        }
        saldoPosterior = saldoAnterior - valor
        tipoMovimentacao = 'debito'
        descricaoMovimentacao = 'Transferência realizada'
        break
        
      default:
        return NextResponse.json(
          { error: 'Tipo de transação inválido' },
          { status: 400 }
        )
    }

    // Iniciar transação para garantir consistência
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Atualizar carteira
      const carteiraAtualizada = await tx.carteiraDigital.update({
        where: { id: carteira.id },
        data: {
          saldo: saldoPosterior,
          totalRecebido: tipoMovimentacao === 'credito' ? carteira.totalRecebido + valor : carteira.totalRecebido,
          totalSacado: tipoMovimentacao === 'debito' ? carteira.totalSacado + valor : carteira.totalSacado
        }
      })

      // 2. Registrar movimentação
      const movimentacao = await tx.movimentacaoCarteira.create({
        data: {
          carteiraId: carteira.id,
          tipo: tipoMovimentacao,
          valor,
          saldoAnterior,
          saldoPosterior,
          descricao: descricaoMovimentacao,
          referencia: `transacao_${tipo}_${Date.now()}`,
          status: 'processado'
        }
      })

      // 3. Criar registro de transação
      const transacao = await tx.transacao.create({
        data: {
          usuarioId,
          tipo,
          valor,
          codigoParceiro,
          status: 'processado',
          data: new Date()
        }
      })

      // 4. Atualizar sementes do usuário
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { sementes: saldoPosterior }
      })

      // 5. Registrar no histórico de sementes
      await tx.semente.create({
        data: {
          usuarioId,
          quantidade: tipoMovimentacao === 'credito' ? valor : -valor,
          tipo,
          descricao: descricaoMovimentacao,
          data: new Date()
        }
      })

      return {
        transacao,
        movimentacao,
        carteira: carteiraAtualizada
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Transação processada com sucesso!',
      dados: resultado
    })

  } catch (error) {
    console.error('Erro ao processar transação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Consultar transações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')
    const tipo = searchParams.get('tipo')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const where: any = { usuarioId }
    if (tipo) where.tipo = tipo

    const offset = (pagina - 1) * limite

    const [transacoes, total] = await Promise.all([
      prisma.transacao.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: offset,
        take: limite
      }),
      prisma.transacao.count({ where })
    ])

    const totalPaginas = Math.ceil(total / limite)

    return NextResponse.json({
      sucesso: true,
      dados: {
        transacoes,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas
        }
      }
    })

  } catch (error) {
    console.error('Erro ao consultar transações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
