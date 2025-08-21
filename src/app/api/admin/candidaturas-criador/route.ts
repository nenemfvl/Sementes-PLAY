import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar todas as candidaturas de criador (para admin)
export async function GET(request: NextRequest) {
  try {
    // Buscar todas as candidaturas com informações do usuário
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

    // Formatar os dados para retornar
    const candidaturasFormatadas = candidaturas.map(candidatura => ({
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
  } finally {
    await prisma.$disconnect()
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

    // Se aprovada, criar o criador
    if (status === 'aprovada') {
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

      // Atualizar nível do usuário para criador
      await prisma.usuario.update({
        where: { id: candidatura.usuarioId },
        data: { nivel: 'criador' }
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
