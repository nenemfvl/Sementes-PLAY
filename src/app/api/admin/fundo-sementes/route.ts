import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ciclo, valorTotal, dataInicio, dataFim } = body

    if (!ciclo || !valorTotal || !dataInicio || !dataFim) {
      return NextResponse.json(
        { error: 'Ciclo, valorTotal, dataInicio e dataFim são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar novo fundo de sementes
    const fundo = await prisma.fundoSementes.create({
      data: {
        ciclo: parseInt(ciclo),
        valorTotal: parseFloat(valorTotal),
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        distribuido: false
      }
    })

    return NextResponse.json({
      sucesso: true,
      dados: fundo
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar fundo de sementes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar fundo de sementes' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Buscar fundo de sementes não distribuído (em circulação)
    const fundoAtual = await prisma.fundoSementes.findFirst({
      where: { distribuido: false },
      orderBy: { ciclo: 'desc' }
    })

    // Buscar fundos distribuídos para histórico
    const fundosDistribuidos = await prisma.fundoSementes.findMany({
      where: { distribuido: true },
      orderBy: { ciclo: 'desc' },
      take: 10
    })

    // Calcular total de sementes em circulação
    const totalEmCirculacao = fundoAtual?.valorTotal || 0

    // Calcular total de sementes distribuídas
    const totalDistribuido = fundosDistribuidos.reduce((sum, fundo) => sum + fundo.valorTotal, 0)

    return NextResponse.json({
      sucesso: true,
      dados: {
        fundoAtual,
        fundosDistribuidos,
        totalEmCirculacao,
        totalDistribuido,
        totalGeral: totalEmCirculacao + totalDistribuido
      }
    })
  } catch (error) {
    console.error('Erro ao buscar fundo de sementes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar fundo de sementes' },
      { status: 500 }
    )
  }
}
