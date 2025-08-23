import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

// POST - Remover usuário do nível de criador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuarioId, motivo } = body

    if (!usuarioId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe e é um criador
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        criador: true
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!usuario.criador) {
      return NextResponse.json(
        { error: 'Usuário não é um criador' },
        { status: 400 }
      )
    }

    // Remover o criador e reverter para usuário comum
    await prisma.$transaction(async (tx) => {
      // 1. Remover o criador (com verificação de null)
      if (usuario.criador) {
        await tx.criador.delete({
          where: { id: usuario.criador.id }
        })
      }

      // 2. Atualizar o usuário para nível comum
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          nivel: 'usuario',
          // Remover campos específicos de criador
          sementes: 0, // Resetar sementes
          pontuacao: 0, // Resetar pontuação
          xp: 0 // Resetar XP
        }
      })

      // 3. Registrar log de auditoria
      await tx.logAuditoria.create({
        data: {
          usuarioId: usuarioId,
          acao: 'remover_criador',
          detalhes: `Usuário removido do nível de criador. Motivo: ${motivo || 'Não especificado'}`,
          ip: request.headers.get('x-forwarded-for') || 'desconhecido'
        }
      })
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Usuário removido do nível de criador com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
