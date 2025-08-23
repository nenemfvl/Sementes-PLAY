import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Buscar ou criar configuração de ciclos
    let configCiclos = await prisma.configuracaoCiclos.findFirst()
    
    if (!configCiclos) {
      // Criar configuração inicial
      const dataInicio = new Date()
      configCiclos = await prisma.configuracaoCiclos.create({
        data: {
          dataInicioCiclo: dataInicio,
          dataInicioSeason: dataInicio,
          numeroSeason: 1,
          numeroCiclo: 1
        }
      })
    }

    const agora = new Date()
    
    // Calcular dias restantes para o ciclo (15 dias)
    const dataFimCiclo = new Date(configCiclos.dataInicioCiclo)
    dataFimCiclo.setDate(dataFimCiclo.getDate() + 15)
    
    const diasRestantesCiclo = Math.max(0, Math.ceil((dataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Calcular dias restantes para a season (3 meses)
    const dataFimSeason = new Date(configCiclos.dataInicioSeason)
    dataFimSeason.setMonth(dataFimSeason.getMonth() + 3)
    
    const diasRestantesSeason = Math.max(0, Math.ceil((dataFimSeason.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Verificar se precisa resetar o ciclo
    const precisaResetarCiclo = agora >= dataFimCiclo
    
    // Verificar se precisa resetar a season
    const precisaResetarSeason = agora >= dataFimSeason
    
    // Se estiver pausado, não executar resets automáticos
    if (configCiclos.pausado) {
      return NextResponse.json({
        diasRestantesCiclo: Math.max(0, diasRestantesCiclo),
        diasRestantesSeason: Math.max(0, diasRestantesSeason),
        numeroCiclo: configCiclos.numeroCiclo,
        numeroSeason: configCiclos.numeroSeason,
        dataInicioCiclo: configCiclos.dataInicioCiclo,
        dataInicioSeason: configCiclos.dataInicioSeason,
        pausado: true,
        resetou: false
      })
    }
    
    // Se precisar resetar, fazer o reset
    if (precisaResetarCiclo || precisaResetarSeason) {
      if (precisaResetarSeason) {
        // Reset da season - resetar rankings, níveis de criadores e conteúdos
        await prisma.configuracaoCiclos.update({
          where: { id: configCiclos.id },
          data: {
            dataInicioCiclo: agora,
            dataInicioSeason: agora,
            numeroSeason: configCiclos.numeroSeason + 1,
            numeroCiclo: 1
          }
        })
        
        // Resetar rankings
        await prisma.rankingCiclo.deleteMany()
        await prisma.rankingSeason.deleteMany()
        
        // Resetar APENAS níveis de criadores para 'criador-iniciante'
        await prisma.criador.updateMany({
          where: {
            nivel: {
              in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
            }
          },
          data: {
            nivel: 'criador-iniciante'
          }
        })
        
        // Limpar conteúdos para dar oportunidade igual a todos
        await prisma.conteudo.deleteMany()
        await prisma.conteudoParceiro.deleteMany()
        
        configCiclos = await prisma.configuracaoCiclos.findFirst()
      } else if (precisaResetarCiclo) {
        // Reset apenas do ciclo - resetar ranking, níveis de criadores e conteúdos
        await prisma.configuracaoCiclos.update({
          where: { id: configCiclos.id },
          data: {
            dataInicioCiclo: agora,
            numeroCiclo: configCiclos.numeroCiclo + 1
          }
        })
        
        // Resetar ranking do ciclo
        await prisma.rankingCiclo.deleteMany()
        
        // Resetar APENAS níveis de criadores para 'criador-iniciante'
        await prisma.criador.updateMany({
          where: {
            nivel: {
              in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
            }
          },
          data: {
            nivel: 'criador-iniciante'
          }
        })
        
        // Limpar conteúdos para dar oportunidade igual a todos
        await prisma.conteudo.deleteMany()
        await prisma.conteudoParceiro.deleteMany()
        
        configCiclos = await prisma.configuracaoCiclos.findFirst()
      }
      
      // Recalcular após reset
      const novaDataFimCiclo = new Date(configCiclos!.dataInicioCiclo)
      novaDataFimCiclo.setDate(novaDataFimCiclo.getDate() + 15)
      
      const novaDataFimSeason = new Date(configCiclos!.dataInicioSeason)
      novaDataFimSeason.setMonth(novaDataFimSeason.getMonth() + 3)
      
      return NextResponse.json({
        diasRestantesCiclo: 15,
        diasRestantesSeason: Math.ceil((novaDataFimSeason.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)),
        numeroCiclo: configCiclos!.numeroCiclo,
        numeroSeason: configCiclos!.numeroSeason,
        dataInicioCiclo: configCiclos!.dataInicioCiclo,
        dataInicioSeason: configCiclos!.dataInicioSeason,
        resetou: true
      })
    }

    return NextResponse.json({
      diasRestantesCiclo,
      diasRestantesSeason,
      numeroCiclo: configCiclos.numeroCiclo,
      numeroSeason: configCiclos.numeroSeason,
      dataInicioCiclo: configCiclos.dataInicioCiclo,
      dataInicioSeason: configCiclos.dataInicioSeason,
      pausado: configCiclos.pausado || false,
      resetou: false
    })
  } catch (error) {
    console.error('Erro ao buscar informações dos ciclos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
