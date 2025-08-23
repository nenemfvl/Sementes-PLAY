import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

// GET - Buscar todas as candidaturas de criador (para admin)
export async function GET(request: NextRequest) {
  try {
    // Buscar todas as candidaturas com informações do usuário
    // EXCLUIR candidaturas aprovadas de usuários que foram removidos (não são mais criadores)
    const candidaturas = await prisma.candidaturaCriador.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            nivel: true
          }
        }
      },
      orderBy: { dataCandidatura: 'desc' }
    })

    // Filtrar candidaturas aprovadas que não são mais criadores ativos
    const candidaturasFiltradas = []
    
    for (const candidatura of candidaturas) {
      // Se a candidatura não é aprovada, incluir normalmente
      if (candidatura.status !== 'aprovada') {
        candidaturasFiltradas.push(candidatura)
        continue
      }
      
      // Se é aprovada, verificar se o usuário ainda é criador ativo
      const criadorAtivo = await prisma.criador.findFirst({
        where: { usuarioId: candidatura.usuarioId }
      })
      
      // Incluir apenas se o criador ainda estiver ativo
      if (criadorAtivo) {
        candidaturasFiltradas.push(candidatura)
      }
    }

    // Formatar os dados para retornar
    const candidaturasFormatadas = candidaturasFiltradas.map(candidatura => ({
      id: candidatura.id,
      usuarioId: candidatura.usuarioId,
      nome: candidatura.nome,
      email: candidatura.email,
      bio: candidatura.bio,
      categoria: candidatura.categoria,
      redesSociais: JSON.parse(candidatura.redesSociais || '{}'),
      portfolio: JSON.parse(candidatura.portfolio || '{}'),
      experiencia: candidatura.experiencia,
      motivacao: candidatura.motivacao,
      metas: candidatura.metas,
      disponibilidade: candidatura.disponibilidade,
      status: candidatura.status,
      dataCandidatura: candidatura.dataCandidatura,
      dataRevisao: candidatura.dataRevisao,
      observacoes: candidatura.observacoes,
      usuario: candidatura.usuario
    }))

    return NextResponse.json({
      sucesso: true,
      candidaturas: candidaturasFormatadas
    })

  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar status de candidatura (aprovar/rejeitar)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidaturaId, status, observacoes } = body

    if (!candidaturaId || !status) {
      return NextResponse.json(
        { error: 'ID da candidatura e status são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['aprovada', 'rejeitada'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Buscar a candidatura
    const candidatura = await prisma.candidaturaCriador.findUnique({
      where: { id: candidaturaId },
      include: { usuario: true }
    })

    if (!candidatura) {
      return NextResponse.json(
        { error: 'Candidatura não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar status da candidatura
    const candidaturaAtualizada = await prisma.candidaturaCriador.update({
      where: { id: candidaturaId },
      data: {
        status,
        dataRevisao: new Date(),
        observacoes: observacoes || null
      }
    })

    // Se aprovada, verificar se já não existe criador ativo
    if (status === 'aprovada') {
      const criadorExistente = await prisma.criador.findFirst({
        where: { usuarioId: candidatura.usuarioId }
      })

      if (criadorExistente) {
        return NextResponse.json(
          { error: 'Este usuário já é um criador ativo. Não é possível aprovar nova candidatura.' },
          { status: 400 }
        )
      }

      // Criar o criador
      await prisma.criador.create({
        data: {
          usuarioId: candidatura.usuarioId,
          nome: candidatura.nome,
          bio: candidatura.bio,
          categoria: candidatura.categoria,
          redesSociais: candidatura.redesSociais,
          portfolio: candidatura.portfolio
        }
      })

      // Usuário sempre inicia como criador-iniciante
      await prisma.usuario.update({
        where: { id: candidatura.usuarioId },
        data: { nivel: 'criador-iniciante' }
      })
    }

    // Log da ação
    try {
      await prisma.logAuditoria.create({
        data: {
          usuarioId: candidatura.usuarioId,
          acao: `CANDIDATURA_${status.toUpperCase()}`,
          detalhes: `Candidatura ${status} - ID: ${candidaturaId}`,
          nivel: 'info'
        }
      })
    } catch (logError) {
      console.error('Erro ao criar log de auditoria:', logError)
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: `Candidatura ${status} com sucesso!`,
      candidatura: candidaturaAtualizada
    })

  } catch (error) {
    console.error('Erro ao atualizar candidatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
