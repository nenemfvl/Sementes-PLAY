import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Fazer uma doação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doadorId, criadorId, quantidade, mensagem } = body

    if (!doadorId || !criadorId || !quantidade || quantidade <= 0) {
      return NextResponse.json(
        { error: 'Dados inválidos para doação' },
        { status: 400 }
      )
    }

    // Verificar se o doador tem saldo suficiente
    const carteiraDoador = await prisma.carteiraDigital.findUnique({
      where: { usuarioId: doadorId }
    })

    if (!carteiraDoador || carteiraDoador.saldo < quantidade) {
      return NextResponse.json(
        { error: 'Saldo insuficiente para doação' },
        { status: 400 }
      )
    }

    // Verificar se o criador existe
    const criador = await prisma.criador.findUnique({
      where: { usuarioId: criadorId }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    // Iniciar transação para garantir consistência
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Debitar do doador
      const carteiraDoadorAtualizada = await tx.carteiraDigital.update({
        where: { id: carteiraDoador.id },
        data: {
          saldo: carteiraDoador.saldo - quantidade,
          totalSacado: carteiraDoador.totalSacado + quantidade
        }
      })

      // 2. Registrar movimentação do doador
      await tx.movimentacaoCarteira.create({
        data: {
          carteiraId: carteiraDoador.id,
          tipo: 'debito',
          valor: quantidade,
          saldoAnterior: carteiraDoador.saldo,
          saldoPosterior: carteiraDoador.saldo - quantidade,
          descricao: `Doação para ${criador.nome}`,
          referencia: `doacao_${criadorId}`,
          status: 'processado'
        }
      })

      // 3. Buscar carteira do criador
      let carteiraCriador = await tx.carteiraDigital.findUnique({
        where: { usuarioId: criadorId }
      })

      if (!carteiraCriador) {
        carteiraCriador = await tx.carteiraDigital.create({
          data: {
            usuarioId: criadorId,
            saldo: 0,
            saldoPendente: 0,
            totalRecebido: 0,
            totalSacado: 0
          }
        })
      }

      // 4. Creditar o criador
      const carteiraCriadorAtualizada = await tx.carteiraDigital.update({
        where: { id: carteiraCriador.id },
        data: {
          saldo: carteiraCriador.saldo + quantidade,
          totalRecebido: carteiraCriador.totalRecebido + quantidade
        }
      })

      // 5. Registrar movimentação do criador
      await tx.movimentacaoCarteira.create({
        data: {
          carteiraId: carteiraCriador.id,
          tipo: 'credito',
          valor: quantidade,
          saldoAnterior: carteiraCriador.saldo,
          saldoPosterior: carteiraCriador.saldo + quantidade,
          descricao: `Doação recebida de ${carteiraDoador.usuario?.nome || 'Usuário'}`,
          referencia: `doacao_${doadorId}`,
          status: 'processado'
        }
      })

      // 6. Criar registro de doação
      const doacao = await tx.doacao.create({
        data: {
          doadorId,
          criadorId,
          quantidade,
          mensagem: mensagem || '',
          data: new Date()
        }
      })

      // 7. Atualizar estatísticas do criador
      await tx.criador.update({
        where: { id: criador.id },
        data: {
          sementes: carteiraCriadorAtualizada.saldo,
          doacoes: criador.doacoes + 1
        }
      })

      // 8. Atualizar sementes dos usuários
      await tx.usuario.update({
        where: { id: doadorId },
        data: { sementes: carteiraDoadorAtualizada.saldo }
      })

      await tx.usuario.update({
        where: { id: criadorId },
        data: { sementes: carteiraCriadorAtualizada.saldo }
      })

      return {
        doacao,
        carteiraDoador: carteiraDoadorAtualizada,
        carteiraCriador: carteiraCriadorAtualizada
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Doação realizada com sucesso!',
      doacao: resultado.doacao
    })

  } catch (error) {
    console.error('Erro ao processar doação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Consultar doações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const criadorId = searchParams.get('criadorId')
    const doadorId = searchParams.get('doadorId')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')

    if (!criadorId && !doadorId) {
      return NextResponse.json(
        { error: 'ID do criador ou doador é obrigatório' },
        { status: 400 }
      )
    }

    const where: any = {}
    if (criadorId) where.criadorId = criadorId
    if (doadorId) where.doadorId = doadorId

    const offset = (pagina - 1) * limite

    const [doacoes, total] = await Promise.all([
      prisma.doacao.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: offset,
        take: limite,
        include: {
          doador: {
            select: {
              id: true,
              nome: true,
              avatarUrl: true
            }
          },
          criador: {
            select: {
              id: true,
              nome: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.doacao.count({ where })
    ])

    const totalPaginas = Math.ceil(total / limite)

    return NextResponse.json({
      sucesso: true,
      dados: {
        doacoes,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas
        }
      }
    })

  } catch (error) {
    console.error('Erro ao consultar doações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
