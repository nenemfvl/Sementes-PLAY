import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Enviar nova mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { conteudo, tipo = 'texto' } = await request.json()

    if (!conteudo) {
      return NextResponse.json(
        { error: 'Conteúdo da mensagem é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o usuário logado do header de autorização
    const authHeader = request.headers.get('authorization')
    let usuarioId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      // Aqui você pode implementar a validação do token
      // Por enquanto, vamos usar um método alternativo
    }

    // Se não conseguir pegar do header, vamos tentar do body
    const body = await request.json()
    usuarioId = body.usuarioId

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'Usuário não identificado' },
        { status: 401 }
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

    // Criar a mensagem
    const novaMensagem = await prisma.mensagem.create({
      data: {
        conversaId: id,
        remetenteId: usuarioId,
        texto: conteudo,
        lida: false
      },
      include: {
        remetente: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    // Atualizar última mensagem da conversa
    await prisma.conversa.update({
      where: { id },
      data: { ultimaMensagem: new Date() }
    })

    return NextResponse.json({
      mensagem: {
        id: novaMensagem.id,
        remetenteId: novaMensagem.remetenteId,
        remetenteNome: novaMensagem.remetente.nome,
        conteudo: novaMensagem.texto,
        timestamp: novaMensagem.dataEnvio,
        lida: novaMensagem.lida
      }
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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
        timestamp: 'asc'
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
