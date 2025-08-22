import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { calcularNivelCriador } from '@/lib/niveis'

const prisma = new PrismaClient()

// POST - Atualizar níveis de todos os criadores baseado na pontuação
export async function POST(request: NextRequest) {
  try {
    // Buscar todos os usuários que são criadores
    const criadores = await prisma.usuario.findMany({
      where: {
        nivel: {
          startsWith: 'criador'
        }
      },
      select: {
        id: true,
        nome: true,
        nivel: true,
        pontuacao: true
      }
    })

    let atualizados = 0
    const resultados = []

    for (const criador of criadores) {
      const novoNivel = calcularNivelCriador(criador.pontuacao)
      
      // Só atualizar se o nível mudou
      if (novoNivel !== criador.nivel) {
        await prisma.usuario.update({
          where: { id: criador.id },
          data: { nivel: novoNivel }
        })
        
        atualizados++
        resultados.push({
          id: criador.id,
          nome: criador.nome,
          nivelAnterior: criador.nivel,
          novoNivel,
          pontuacao: criador.pontuacao
        })
      }
    }

    // Log da ação
    try {
      await prisma.logAuditoria.create({
        data: {
          usuarioId: 'sistema',
          acao: 'ATUALIZAR_NIVEIS_CRIADORES',
          detalhes: `Atualizados ${atualizados} níveis de criadores`,
          nivel: 'info'
        }
      })
    } catch (logError) {
      console.error('Erro ao criar log de auditoria:', logError)
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: `${atualizados} níveis de criadores foram atualizados`,
      atualizados,
      resultados
    })

  } catch (error) {
    console.error('Erro ao atualizar níveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Verificar níveis atuais dos criadores
export async function GET() {
  try {
    const criadores = await prisma.usuario.findMany({
      where: {
        nivel: {
          startsWith: 'criador'
        }
      },
      select: {
        id: true,
        nome: true,
        nivel: true,
        pontuacao: true,
        dataCriacao: true
      },
      orderBy: {
        pontuacao: 'desc'
      }
    })

    const niveisCalculados = criadores.map(criador => ({
      ...criador,
      nivelCalculado: calcularNivelCriador(criador.pontuacao),
      precisaAtualizar: calcularNivelCriador(criador.pontuacao) !== criador.nivel
    }))

    return NextResponse.json({
      sucesso: true,
      criadores: niveisCalculados,
      total: criadores.length
    })

  } catch (error) {
    console.error('Erro ao buscar criadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
