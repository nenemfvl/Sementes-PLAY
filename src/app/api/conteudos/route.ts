import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar conteúdos de um criador específico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const criadorId = searchParams.get('criadorId')
    const categoria = searchParams.get('categoria')
    const tipo = searchParams.get('tipo')

    if (!criadorId) {
      return NextResponse.json(
        { error: 'ID do criador é obrigatório' },
        { status: 400 }
      )
    }

    const where: any = { criadorId }
    
    if (categoria && categoria !== 'todas') {
      where.categoria = categoria
    }
    
    if (tipo && tipo !== 'todos') {
      where.tipo = tipo
    }

    const conteudos = await prisma.conteudo.findMany({
      where,
      orderBy: [
        { fixado: 'desc' },
        { dataPublicacao: 'desc' }
      ],
      include: {
        criador: {
          select: {
            nome: true,
            nivel: true
          }
        }
      }
    })

    return NextResponse.json({
      sucesso: true,
      dados: conteudos
    })

  } catch (error) {
    console.error('Erro ao listar conteúdos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Criar novo conteúdo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { criadorId, titulo, descricao, tipo, categoria, url, preview, plataforma } = body

    if (!criadorId || !titulo || !tipo || !categoria || !url || !plataforma) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: criadorId, titulo, tipo, categoria, url, plataforma' },
        { status: 400 }
      )
    }

    // Verificar se o criador existe
    const criador = await prisma.criador.findUnique({
      where: { id: criadorId }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    const conteudo = await prisma.conteudo.create({
      data: {
        criadorId,
        titulo,
        descricao: descricao || '',
        tipo,
        categoria,
        url,
        preview: preview || '',
        plataforma,
        fixado: false,
        visualizacoes: 0,
        curtidas: 0,
        dislikes: 0,
        compartilhamentos: 0
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Conteúdo criado com sucesso!',
      dados: conteudo
    })

  } catch (error) {
    console.error('Erro ao criar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Atualizar conteúdo existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, titulo, descricao, tipo, categoria, url, preview, plataforma } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    const conteudo = await prisma.conteudo.update({
      where: { id },
      data: {
        titulo,
        descricao,
        tipo,
        categoria,
        url,
        preview,
        plataforma
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Conteúdo atualizado com sucesso!',
      dados: conteudo
    })

  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Remover conteúdo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.conteudo.delete({
      where: { id }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Conteúdo removido com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao remover conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH - Atualizar campos específicos (fixar/desfixar, visualizações, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, fixado, visualizacoes, curtidas, dislikes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do conteúdo é obrigatório' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (fixado !== undefined) updateData.fixado = fixado
    if (visualizacoes !== undefined) updateData.visualizacoes = visualizacoes
    if (curtidas !== undefined) updateData.curtidas = curtidas
    if (dislikes !== undefined) updateData.dislikes = dislikes

    const conteudo = await prisma.conteudo.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Conteúdo atualizado com sucesso!',
      dados: conteudo
    })

  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
