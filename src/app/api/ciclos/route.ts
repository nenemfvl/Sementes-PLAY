import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Buscar configuração atual de ciclos
    const configuracaoCiclos = await prisma.configuracaoCiclos.findFirst({
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    // Buscar ranking do ciclo atual
    const rankingCiclo = await prisma.rankingCiclo.findMany({
      where: {
        tipo: 'criador'
      },
      orderBy: {
        pontuacao: 'desc'
      },
      take: 10,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            avatarUrl: true,
            nivel: true
          }
        }
      }
    })

    // Buscar estatísticas do ciclo atual
    const totalCriadores = await prisma.usuario.count({
      where: {
        nivel: {
          in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
        },
        suspenso: false
      }
    })

    const totalSementes = await prisma.usuario.aggregate({
      where: {
        nivel: {
          in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
        },
        suspenso: false
      },
      _sum: {
        sementes: true
      }
    })

    return NextResponse.json({
      sucesso: true,
      dados: {
        ciclo: configuracaoCiclos?.numeroCiclo || 1,
        season: configuracaoCiclos?.numeroSeason || 1,
        dataInicioCiclo: configuracaoCiclos?.dataInicioCiclo,
        dataInicioSeason: configuracaoCiclos?.dataInicioSeason,
        pausado: configuracaoCiclos?.pausado || false,
        ranking: rankingCiclo,
        estatisticas: {
          totalCriadores,
          totalSementes: totalSementes._sum.sementes || 0
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar dados dos ciclos:', error)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
