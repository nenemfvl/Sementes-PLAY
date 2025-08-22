import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const { usuario1Id, usuario2Id } = await request.json()

    if (!usuario1Id || !usuario2Id) {
      return NextResponse.json(
        { error: 'IDs dos usuários são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma conversa entre esses usuários
    const conversaExistente = await prisma.conversa.findFirst({
      where: {
        OR: [
          {
            usuario1Id: usuario1Id,
            usuario2Id: usuario2Id
          },
          {
            usuario1Id: usuario2Id,
            usuario2Id: usuario1Id
          }
        ]
      }
    })

    if (conversaExistente) {
      return NextResponse.json({ id: conversaExistente.id })
    }

    // Criar nova conversa
    const novaConversa = await prisma.conversa.create({
      data: {
        usuario1Id,
        usuario2Id
      }
    })

    return NextResponse.json({ id: novaConversa.id })
  } catch (error) {
    console.error('Erro ao criar conversa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar conversas de um usuário
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

    // Buscar todos os amigos aceitos
    const amizades = await prisma.amizade.findMany({
      where: {
        OR: [
          { usuarioId: String(usuarioId), status: 'aceita' },
          { amigoId: String(usuarioId), status: 'aceita' }
        ]
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        amigo: { select: { id: true, nome: true, email: true } }
      }
    })

    // Para cada amigo, buscar conversa (se existir) e última mensagem
    const conversas = await Promise.all(amizades.map(async amizade => {
      const amigo = amizade.usuarioId === usuarioId ? amizade.amigo : amizade.usuario
      // Buscar conversa (pode ser em qualquer direção)
      const conversa = await prisma.conversa.findFirst({
        where: {
          OR: [
            { usuario1Id: String(usuarioId), usuario2Id: amigo.id },
            { usuario1Id: amigo.id, usuario2Id: String(usuarioId) }
          ]
        },
        include: {
          mensagens: {
            orderBy: { dataEnvio: 'desc' },
            take: 1
          }
        }
      })
      const ultimaMensagem = conversa?.mensagens[0]
      return {
        id: conversa?.id || null,
        usuarioId: amigo.id,
        usuarioNome: amigo.nome,
        usuarioEmail: amigo.email,
        ultimaMensagem: ultimaMensagem?.texto || 'Nenhuma mensagem',
        ultimaAtividade: ultimaMensagem?.dataEnvio || null,
        naoLidas: 0 // Por enquanto
      }
    }))

    return NextResponse.json({ conversas })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
