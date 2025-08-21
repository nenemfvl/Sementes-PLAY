import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const avatar = formData.get('avatar') as File
    const usuarioId = formData.get('usuarioId') as string

    if (!avatar || !usuarioId) {
      return NextResponse.json(
        { error: 'Avatar e ID do usuário são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!avatar.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas arquivos de imagem são permitidos' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    if (avatar.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 5MB' },
        { status: 400 }
      )
    }

    // Converter arquivo para base64 para armazenamento temporário
    // Em produção, você deve usar um serviço como Cloudinary, AWS S3, etc.
    const bytes = await avatar.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = avatar.type
    const avatarUrl = `data:${mimeType};base64,${base64}`

    // Atualizar o usuário no banco de dados
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatarUrl }
    })

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: 'Avatar atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
