import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Criar candidatura para criador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nome,
      email,
      bio,
      redesSociais,
      portfolio,
      experiencia,
      motivacao,
      metas,
      disponibilidade,
      usuarioId
    } = body

    // Verificar se o usuário existe
    const user = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    // Validações básicas
    if (!nome || !email || !bio) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    if (bio.length < 50) {
      return NextResponse.json(
        { error: 'Biografia deve ter pelo menos 50 caracteres' },
        { status: 400 }
      )
    }

    if (experiencia.length < 30) {
      return NextResponse.json(
        { error: 'Experiência deve ter pelo menos 30 caracteres' },
        { status: 400 }
      )
    }

    if (motivacao.length < 30) {
      return NextResponse.json(
        { error: 'Motivação deve ter pelo menos 30 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se já é criador ATIVO
    const criadorExistente = await prisma.criador.findFirst({
      where: {
        usuarioId: user.id
      }
    })

    if (criadorExistente) {
      return NextResponse.json(
        { error: 'Você já é um criador aprovado' },
        { status: 400 }
      )
    }

    // Verificar se já existe candidatura pendente
    const candidaturaExistente = await prisma.candidaturaCriador.findFirst({
      where: {
        usuarioId: user.id,
        status: 'pendente'
      }
    })

    if (candidaturaExistente) {
      return NextResponse.json(
        { error: 'Você já possui uma candidatura pendente' },
        { status: 400 }
      )
    }

    // Criar candidatura
    const candidatura = await prisma.candidaturaCriador.create({
      data: {
        usuarioId: user.id,
        nome,
        email,
        bio,
        categoria: 'Streamer', // Categoria padrão
        redesSociais: JSON.stringify(redesSociais),
        portfolio: JSON.stringify(portfolio),
        experiencia,
        motivacao,
        metas,
        disponibilidade,
        status: 'pendente',
        dataCandidatura: new Date()
      }
    })

    // Log da ação
    try {
      await prisma.logAuditoria.create({
        data: {
          usuarioId: user.id,
          acao: 'CANDIDATURA_CRIADOR',
          detalhes: `Candidatura criada com ID: ${candidatura.id}`,
          nivel: 'info'
        }
      })
    } catch (logError) {
      console.error('Erro ao criar log de auditoria:', logError)
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Candidatura enviada com sucesso!',
      dados: candidatura
    })

  } catch (error) {
    console.error('Erro ao criar candidatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

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

    // Buscar candidaturas do usuário
    const candidaturas = await prisma.candidaturaCriador.findMany({
      where: { usuarioId },
      orderBy: { dataCandidatura: 'desc' }
    })

    return NextResponse.json({
      sucesso: true,
      candidaturas: candidaturas.map(c => ({
        ...c,
        redesSociais: JSON.parse(c.redesSociais),
        portfolio: JSON.parse(c.portfolio)
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}
