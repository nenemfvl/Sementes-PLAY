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

    const conversas = await prisma.conversa.findMany({
      where: {
        OR: [
          { usuario1Id: usuarioId },
          { usuario2Id: usuarioId }
        ]
      },
      include: {
        usuario1: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        usuario2: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        mensagens: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        ultimaMensagem: 'desc'
      }
    })

    const conversasFormatadas = conversas.map(conversa => {
      const outroUsuario = conversa.usuario1Id === usuarioId 
        ? conversa.usuario2 
        : conversa.usuario1
      
      const ultimaMensagem = conversa.mensagens[0]?.texto || ''
      const naoLidas = conversa.mensagens.filter(m => 
        !m.lida && m.remetenteId !== usuarioId
      ).length

      return {
        id: conversa.id,
        usuarioId: outroUsuario.id,
        usuarioNome: outroUsuario.nome,
        ultimaMensagem,
        ultimaAtividade: conversa.ultimaMensagem || conversa.dataCriacao,
        naoLidas
      }
    })

    return NextResponse.json({ conversas: conversasFormatadas })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
