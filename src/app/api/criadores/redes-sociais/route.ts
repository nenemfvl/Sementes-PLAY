import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const criadorId = searchParams.get('criadorId')

    if (!criadorId) {
      return NextResponse.json(
        { error: 'ID do criador é obrigatório' },
        { status: 400 }
      )
    }

    const criador = await prisma.criador.findUnique({
      where: { id: criadorId },
      select: { redesSociais: true }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    const redesSociais = criador.redesSociais ? JSON.parse(criador.redesSociais) : {}

    return NextResponse.json({ redesSociais })
  } catch (error) {
    console.error('Erro ao carregar redes sociais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const criadorId = searchParams.get('criadorId')

    if (!criadorId) {
      return NextResponse.json(
        { error: 'ID do criador é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { redesSociais } = body

    if (!redesSociais || typeof redesSociais !== 'object') {
      return NextResponse.json(
        { error: 'Dados de redes sociais inválidos' },
        { status: 400 }
      )
    }

    // Validar URLs das redes sociais
    const redesValidadas: any = {}
    
    if (redesSociais.youtube && redesSociais.youtube.trim()) {
      redesValidadas.youtube = redesSociais.youtube.trim()
    }
    if (redesSociais.twitch && redesSociais.twitch.trim()) {
      redesValidadas.twitch = redesSociais.twitch.trim()
    }
    if (redesSociais.tiktok && redesSociais.tiktok.trim()) {
      redesValidadas.tiktok = redesSociais.tiktok.trim()
    }
    if (redesSociais.instagram && redesSociais.instagram.trim()) {
      redesValidadas.instagram = redesSociais.instagram.trim()
    }
    if (redesSociais.discord && redesSociais.discord.trim()) {
      redesValidadas.discord = redesSociais.discord.trim()
    }

    const criador = await prisma.criador.update({
      where: { id: criadorId },
      data: {
        redesSociais: JSON.stringify(redesValidadas)
      },
      select: { redesSociais: true }
    })

    const redesAtualizadas = criador.redesSociais ? JSON.parse(criador.redesSociais) : {}

    return NextResponse.json({ 
      message: 'Redes sociais atualizadas com sucesso',
      redesSociais: redesAtualizadas
    })
  } catch (error) {
    console.error('Erro ao salvar redes sociais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
