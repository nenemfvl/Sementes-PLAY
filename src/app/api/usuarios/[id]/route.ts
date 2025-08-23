import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        criador: {
          select: {
            id: true,
            bio: true,
            categoria: true,
            redesSociais: true,
            dataAprovacao: true
          }
        },
        carteiraDigital: {
          select: {
            saldo: true
          }
        }
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Remover campos sensíveis
    const { senha, ...usuarioSemSenha } = usuario

    return NextResponse.json({ usuario: usuarioSemSenha })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
