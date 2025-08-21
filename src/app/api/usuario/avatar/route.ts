import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { uploadAvatar, deleteImage } from '@/lib/cloudinary'

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

    // Buscar usuário atual para verificar se já tem avatar
    const usuarioAtual = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { avatarUrl: true }
    })

    // Se já tem avatar, deletar o anterior do Cloudinary
    if (usuarioAtual?.avatarUrl && usuarioAtual.avatarUrl.includes('cloudinary.com')) {
      try {
        // Extrair public_id da URL do Cloudinary
        const urlParts = usuarioAtual.avatarUrl.split('/')
        const publicId = urlParts[urlParts.length - 1].split('.')[0]
        await deleteImage(publicId)
      } catch (error) {
        console.warn('Erro ao deletar avatar anterior:', error)
        // Continuar mesmo se falhar ao deletar
      }
    }

    let avatarUrl: string
    let publicId: string | null = null

    try {
      // Tentar upload para o Cloudinary
      const result = await uploadAvatar(avatar, usuarioId)
      avatarUrl = result.url
      publicId = result.publicId
    } catch (cloudinaryError) {
      console.warn('Erro no Cloudinary, usando fallback:', cloudinaryError)
      
      // Fallback: converter para base64
      const bytes = await avatar.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = avatar.type
      avatarUrl = `data:${mimeType};base64,${base64}`
    }

    // Atualizar o usuário no banco de dados
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatarUrl }
    })

    return NextResponse.json({
      success: true,
      avatarUrl,
      publicId,
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
