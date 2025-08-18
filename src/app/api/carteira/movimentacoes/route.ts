import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Consultar movimentações da carteira
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')
    const tipo = searchParams.get('tipo')
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar carteira do usuário
    const carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId }
    })

    if (!carteira) {
      return NextResponse.json(
        { error: 'Carteira não encontrada' },
        { status: 404 }
      )
    }

    // Construir filtros
    const where: any = { carteiraId: carteira.id }
    
    if (tipo) {
      where.tipo = tipo
    }
    
    if (dataInicio && dataFim) {
      where.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      }
    }

    // Calcular offset para paginação
    const offset = (pagina - 1) * limite

    // Buscar movimentações com paginação
    const [movimentacoes, total] = await Promise.all([
      prisma.movimentacaoCarteira.findMany({
        where,
        orderBy: { data: 'desc' },
        skip: offset,
        take: limite,
        include: {
          carteira: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  nivel: true
                }
              }
            }
          }
        }
      }),
      prisma.movimentacaoCarteira.count({ where })
    ])

    // Calcular estatísticas
    const estatisticas = await prisma.movimentacaoCarteira.groupBy({
      by: ['tipo'],
      where: { carteiraId: carteira.id },
      _sum: {
        valor: true
      }
    })

    const totalPaginas = Math.ceil(total / limite)

    return NextResponse.json({
      sucesso: true,
      dados: {
        movimentacoes,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas
        },
        estatisticas: estatisticas.reduce((acc, item) => {
          acc[item.tipo] = item._sum.valor || 0
          return acc
        }, {} as Record<string, number>)
      }
    })

  } catch (error) {
    console.error('Erro ao consultar movimentações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
