import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Buscar usuários que não são amigos nem têm solicitações pendentes
    const usuarios = await prisma.usuario.findMany({
      where: {
        AND: [
          { id: { not: String(usuarioId) } },
          {
            NOT: {
              OR: [
                {
                  amizades: {
                    some: {
                      OR: [
                        { usuarioId: String(usuarioId) },
                        { amigoId: String(usuarioId) }
                      ]
                    }
                  }
                },
                {
                  amizadesRecebidas: {
                    some: {
                      OR: [
                        { usuarioId: String(usuarioId) },
                        { amigoId: String(usuarioId) }
                      ]
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        sementes: true,
        dataCriacao: true
      },
      take: 10,
      orderBy: {
        sementes: 'desc'
      }
    })

    const usuariosFormatados = usuarios.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      nivel: usuario.nivel,
      sementes: usuario.sementes,
      status: 'online' as const, // Mockado por enquanto
      ultimaAtividade: new Date(),
      mutual: false
    }))

    return NextResponse.json({ usuarios: usuariosFormatados })
  } catch (error) {
    console.error('Erro ao buscar usuários sugeridos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
