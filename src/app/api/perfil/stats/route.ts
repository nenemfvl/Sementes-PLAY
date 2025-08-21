import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')

    console.log('📊 [API STATS] Buscando estatísticas para usuário:', usuarioId)

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
        doacoesFeitas: {
          select: { quantidade: true }
        },
        criador: {
          include: {
            doacoesRecebidas: {
              select: { quantidade: true }
            }
          }
        }
      }
    })

    console.log('👤 [API STATS] Usuário encontrado:', {
      id: usuario?.id,
      tipo: usuario?.tipo,
      nivel: usuario?.nivel,
      temCriador: !!usuario?.criador
    })

    if (!usuario) {
      console.log('❌ [API STATS] Usuário não encontrado')
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é um criador
    const isCriador = !!usuario.criador
    console.log('🎭 [API STATS] É criador:', isCriador)

    // Calcular estatísticas
    const totalDoacoes = usuario.doacoesFeitas?.reduce((total: number, doacao: any) => total + doacao.quantidade, 0) || 0
    const totalRecebido = usuario.criador?.doacoesRecebidas?.reduce((total: number, doacao: any) => total + doacao.quantidade, 0) || 0
    const pontuacao = usuario.pontuacao || 0
    const totalXP = usuario.xp || 0

    console.log('📊 [API STATS] Estatísticas calculadas:', {
      totalDoacoes,
      totalRecebido,
      pontuacao,
      totalXP
    })

    // Contar criadores únicos apoiados
    const criadoresApoiados = await prisma.doacao.count({
      where: {
        doadorId: usuarioId
      },
      distinct: ['criadorId']
    })

    const response = {
      success: true,
      stats: {
        totalDoacoes,
        criadoresApoiados,
        pontuacao,
        totalXP
      }
    }

    console.log('✅ [API STATS] Resposta final:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 [API STATS] Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
