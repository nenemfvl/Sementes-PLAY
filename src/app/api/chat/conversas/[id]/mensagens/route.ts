import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()



// GET - Buscar mensagens de uma conversa
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a conversa existe e se o usuário participa dela
    const conversa = await prisma.conversa.findFirst({
      where: {
        id,
        OR: [
          { usuario1Id: usuarioId },
          { usuario2Id: usuarioId }
        ]
      }
    })

    if (!conversa) {
      return NextResponse.json(
        { error: 'Conversa não encontrada ou acesso negado' },
        { status: 404 }
      )
    }

    // Buscar mensagens da conversa
    const mensagens = await prisma.mensagem.findMany({
      where: { conversaId: id },
      include: {
        remetente: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        dataEnvio: 'asc'
      }
    })

    // Marcar mensagens como lidas (exceto as do próprio usuário)
    await prisma.mensagem.updateMany({
      where: {
        conversaId: id,
        remetenteId: { not: usuarioId },
        lida: false
      },
      data: { lida: true }
    })

    const mensagensFormatadas = mensagens.map(msg => ({
      id: msg.id,
      remetenteId: msg.remetenteId,
      remetenteNome: msg.remetente.nome,
      conteudo: msg.texto,
      timestamp: msg.dataEnvio,
      lida: msg.lida
    }))

    return NextResponse.json({ mensagens: mensagensFormatadas })
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
