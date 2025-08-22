import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Buscar solicitações pendentes recebidas pelo usuário
    const solicitacoes = await prisma.amizade.findMany({
      where: {
        amigoId: String(usuarioId),
        status: 'pendente'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataSolicitacao: 'desc'
      }
    })

    const solicitacoesFormatadas = solicitacoes.map(solicitacao => ({
      id: solicitacao.id,
      remetenteId: solicitacao.usuarioId,
      remetenteNome: solicitacao.usuario.nome,
      remetenteEmail: solicitacao.usuario.email,
      dataEnvio: solicitacao.dataSolicitacao,
      mensagem: undefined // Por enquanto sem mensagem personalizada
    }))

    return NextResponse.json({ solicitacoes: solicitacoesFormatadas })
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
