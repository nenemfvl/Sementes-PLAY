import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Consultar dados PIX do usuário
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

    const dadosPix = await prisma.dadosPix.findUnique({
      where: { usuarioId }
    })

    if (!dadosPix) {
      return NextResponse.json(
        { error: 'Dados PIX não encontrados' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      sucesso: true,
      dados: dadosPix
    })

  } catch (error) {
    console.error('Erro ao consultar dados PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Criar/atualizar dados PIX
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, chavePix, tipoChave, nomeTitular, cpfCnpj } = body

    if (!usuarioId || !chavePix || !tipoChave || !nomeTitular || !cpfCnpj) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar ou atualizar dados PIX
    const dadosPix = await prisma.dadosPix.upsert({
      where: { usuarioId },
      update: {
        chavePix,
        tipoChave,
        nomeTitular,
        cpfCnpj,
        validado: false,
        dataValidacao: null,
        dataAtualizacao: new Date()
      },
      create: {
        usuarioId,
        chavePix,
        tipoChave,
        nomeTitular,
        cpfCnpj,
        validado: false,
        dataCriacao: new Date(),
        dataAtualizacao: new Date()
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Dados PIX salvos com sucesso!',
      dados: dadosPix
    })

  } catch (error) {
    console.error('Erro ao salvar dados PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Atualizar dados PIX
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, chavePix, tipoChave, nomeTitular, cpfCnpj } = body

    if (!usuarioId || !chavePix || !tipoChave || !nomeTitular || !cpfCnpj) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const dadosPix = await prisma.dadosPix.update({
      where: { usuarioId },
      data: {
        chavePix,
        tipoChave,
        nomeTitular,
        cpfCnpj,
        validado: false,
        dataValidacao: null,
        dataAtualizacao: new Date()
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Dados PIX atualizados com sucesso!',
      dados: dadosPix
    })

  } catch (error) {
    console.error('Erro ao atualizar dados PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Remover dados PIX
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.dadosPix.delete({
      where: { usuarioId }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Dados PIX removidos com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao remover dados PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
