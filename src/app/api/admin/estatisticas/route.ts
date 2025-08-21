import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar estatísticas do sistema
export async function GET(request: NextRequest) {
  try {
    // Buscar contagens em paralelo para melhor performance
    const [
      totalUsuarios,
      totalCriadores,
      totalParceiros,
      totalAdmins,
      usuariosAtivos,
      usuariosBanidos,
      usuariosSuspensos,
      totalSementes,
      totalConteudos,
      totalSaques,
      saquesPendentes,
      saquesAprovados,
      saquesRejeitados
    ] = await Promise.all([
      prisma.usuario.count(),
      prisma.criador.count({ where: { aprovado: true } }),
      prisma.parceiro.count({ where: { aprovado: true } }),
      prisma.usuario.count({ where: { nivel: { gte: 5 } } }),
      prisma.usuario.count({ where: { status: 'ativo' } }),
      prisma.usuario.count({ where: { status: 'banido' } }),
      prisma.usuario.count({ where: { status: 'suspenso' } }),
      prisma.carteiraDigital.aggregate({
        _sum: { saldoSementes: true }
      }),
      prisma.conteudo.count(),
      prisma.saque.count(),
      prisma.saque.count({ where: { status: 'pendente' } }),
      prisma.saque.count({ where: { status: 'aprovado' } }),
      prisma.saque.count({ where: { status: 'rejeitado' } })
    ])

    // Calcular estatísticas de crescimento (últimos 30 dias)
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

    const [
      novosUsuarios,
      novosCriadores,
      novosConteudos,
      novosSaques
    ] = await Promise.all([
      prisma.usuario.count({
        where: { dataCriacao: { gte: trintaDiasAtras } }
      }),
      prisma.criador.count({
        where: { 
          aprovado: true,
          dataCriacao: { gte: trintaDiasAtras }
        }
      }),
      prisma.conteudo.count({
        where: { dataCriacao: { gte: trintaDiasAtras } }
      }),
      prisma.saque.count({
        where: { dataSolicitacao: { gte: trintaDiasAtras } }
      })
    ])

    // Calcular valor total em saques
    const valorTotalSaques = await prisma.saque.aggregate({
      where: { status: 'aprovado' },
      _sum: { valor: true }
    })

    const estatisticas = {
      usuarios: {
        total: totalUsuarios,
        ativos: usuariosAtivos,
        banidos: usuariosBanidos,
        suspensos: usuariosSuspensos,
        novosUltimos30Dias: novosUsuarios
      },
      criadores: {
        total: totalCriadores,
        novosUltimos30Dias: novosCriadores
      },
      parceiros: {
        total: totalParceiros
      },
      admins: {
        total: totalAdmins
      },
      sistema: {
        totalSementes: totalSementes._sum.saldoSementes || 0,
        totalConteudos: totalConteudos,
        novosConteudosUltimos30Dias: novosConteudos
      },
      financeiro: {
        totalSaques: totalSaques,
        saquesPendentes,
        saquesAprovados,
        saquesRejeitados,
        novosSaquesUltimos30Dias: novosSaques,
        valorTotalSaques: valorTotalSaques._sum.valor || 0
      },
      crescimento: {
        usuarios: ((novosUsuarios / Math.max(totalUsuarios - novosUsuarios, 1)) * 100).toFixed(1),
        criadores: ((novosCriadores / Math.max(totalCriadores - novosCriadores, 1)) * 100).toFixed(1),
        conteudos: ((novosConteudos / Math.max(totalConteudos - novosConteudos, 1)) * 100).toFixed(1)
      }
    }

    return NextResponse.json({
      sucesso: true,
      dados: estatisticas
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
