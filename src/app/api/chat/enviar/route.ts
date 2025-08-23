import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API /api/chat/enviar - Body recebido:', body)
    
    const { conversaId, remetenteId, texto } = body

    if (!conversaId || !remetenteId || !texto) {
      console.log('API /api/chat/enviar - Validação falhou:', { conversaId, remetenteId, texto })
      return NextResponse.json(
        { error: 'ConversaId, remetenteId e texto são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a conversa existe
    const conversa = await prisma.conversa.findUnique({
      where: { id: String(conversaId) }
    })

    if (!conversa) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    // Criar nova mensagem
    const novaMensagem = await prisma.mensagem.create({
      data: {
        conversaId: String(conversaId),
        remetenteId: String(remetenteId),
        texto: String(texto)
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
      where: { id: String(conversaId) },
      data: {
        ultimaMensagem: novaMensagem.dataEnvio
      }
    })

    const mensagemFormatada = {
      id: novaMensagem.id,
      remetenteId: novaMensagem.remetenteId,
      remetenteNome: novaMensagem.remetente.nome,
      conteudo: novaMensagem.texto,
      timestamp: novaMensagem.dataEnvio,
      tipo: 'texto',
      lida: novaMensagem.lida
    }

    return NextResponse.json({ mensagem: mensagemFormatada }, { status: 201 })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
