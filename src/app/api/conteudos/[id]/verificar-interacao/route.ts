import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const userId = searchParams.get('userId')

    if (!id || !tipo || !userId) {
      return NextResponse.json(
        { error: 'ID do conteúdo, tipo e usuário são obrigatórios' },
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

    // Verificar se o usuário já interagiu com este conteúdo
    const interacaoExistente = await (prisma as any)[tabelaInteracao].findFirst({
      where: {
        conteudoId: String(id),
        usuarioId: userId,
        tipo: tipo
      }
    })

    return NextResponse.json({
      success: true,
      interagiu: !!interacaoExistente
    })

  } catch (error) {
    console.error('Erro ao verificar interação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
