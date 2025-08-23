import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

// GET - Verificar status da candidatura do usuário
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

    // Verificar se o usuário existe
    const user = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    // Verificar se já é criador ATIVO
    const criador = await prisma.criador.findFirst({
      where: {
        usuarioId: usuarioId
      }
    })

    if (criador) {
      // Se já é criador, redirecionar para o painel
      return NextResponse.json({
        sucesso: true,
        dados: {
          candidatura: null,
          criador: criador,
          status: 'criador_aprovado'
        }
      })
    }

    // Verificar se já existe candidatura
    const candidatura = await prisma.candidaturaCriador.findFirst({
      where: {
        usuarioId: usuarioId
      },
      orderBy: {
        dataCandidatura: 'desc'
      }
    })

    if (candidatura) {
      return NextResponse.json({
        sucesso: true,
        dados: {
          candidatura: candidatura,
          criador: null,
          status: candidatura.status
        }
      })
    }

    // Nenhuma candidatura encontrada
    return NextResponse.json({
      sucesso: true,
      dados: {
        candidatura: null,
        criador: null,
        status: 'sem_candidatura'
      }
    })

  } catch (error) {
    console.error('Erro ao verificar status da candidatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
