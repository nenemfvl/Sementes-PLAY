import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { userId } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID do conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    // Primeiro, verificar se é um conteúdo normal ou de parceiro
    let conteudo = await prisma.conteudo.findUnique({
      where: { id: String(id) }
    })

    let conteudoParceiro = null
    if (!conteudo) {
      conteudoParceiro = await prisma.conteudoParceiro.findUnique({
        where: { id: String(id) }
      })
    }

    if (!conteudo && !conteudoParceiro) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const isConteudoParceiro = !!conteudoParceiro
    const tabelaInteracao = isConteudoParceiro ? 'interacaoConteudoParceiro' : 'interacaoConteudo'

    // Verificar se o usuário já visualizou este conteúdo
    let jaVisualizou = false
    if (userId) {
      try {
        const visualizacaoExistente = await (prisma as any)[tabelaInteracao].findFirst({
          where: {
            conteudoId: String(id),
            usuarioId: userId,
            tipo: 'visualizacao'
          }
        })
        jaVisualizou = !!visualizacaoExistente
      } catch (error) {
        console.error('Erro ao verificar visualização existente:', error)
      }
    }

    // Só incrementar visualizações se o usuário ainda não visualizou
    if (!jaVisualizou) {
      if (isConteudoParceiro) {
        conteudoParceiro = await prisma.conteudoParceiro.update({
          where: { id: String(id) },
          data: {
            visualizacoes: {
              increment: 1
            }
          }
        })
      } else {
        conteudo = await prisma.conteudo.update({
          where: { id: String(id) },
          data: {
            visualizacoes: {
              increment: 1
            }
          }
        })
      }
    } else {
      // Buscar o conteúdo sem incrementar
      if (isConteudoParceiro) {
        conteudoParceiro = await prisma.conteudoParceiro.findUnique({
          where: { id: String(id) }
        })
      } else {
        conteudo = await prisma.conteudo.findUnique({
          where: { id: String(id) }
        })
      }
    }

    // Registrar visualização do usuário (se autenticado e ainda não visualizou)
    if (userId && !jaVisualizou) {
      try {
        await (prisma as any)[tabelaInteracao].create({
          data: {
            conteudoId: String(id),
            usuarioId: userId,
            tipo: 'visualizacao'
          }
        })
      } catch (error) {
        console.error('Erro ao registrar visualização do usuário:', error)
        // Não falha se não conseguir registrar a visualização do usuário
      }
    }

    const visualizacoes = isConteudoParceiro ? conteudoParceiro?.visualizacoes : conteudo?.visualizacoes

    return NextResponse.json({ 
      success: true, 
      visualizacoes: visualizacoes || 0
    })
  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
