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

    // Buscar usuário com estatísticas
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        doacoes: {
          select: { quantidade: true }
        },
        doacoesRecebidas: {
          select: { quantidade: true }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Calcular estatísticas
    const totalDoacoes = usuario.doacoes?.reduce((total, doacao) => total + doacao.quantidade, 0) || 0
    const totalRecebido = usuario.doacoesRecebidas?.reduce((total, doacao) => total + doacao.quantidade, 0) || 0
    const pontuacao = usuario.pontuacao || 0
    const totalXP = usuario.xp || 0

    // Contar criadores únicos apoiados
    const criadoresApoiados = await prisma.doacao.count({
      where: {
        doadorId: usuarioId,
        criadorId: { not: null }
      },
      distinct: ['criadorId']
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalDoacoes,
        criadoresApoiados,
        pontuacao,
        totalXP
      }
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
