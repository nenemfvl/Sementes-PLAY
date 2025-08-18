import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      usuarioId,
      nome,
      email,
      bio,
      categoria,
      redesSociais,
      portfolio,
      experiencia,
      motivacao,
      metas,
      disponibilidade
    } = body

    // Validação básica
    if (!usuarioId || !nome || !email || !bio || !categoria || !experiencia || !motivacao || !metas || !disponibilidade) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já tem uma candidatura pendente
    const candidaturaExistente = await prisma.candidaturaCriador.findFirst({
      where: {
        usuarioId,
        status: 'pendente'
      }
    })

    if (candidaturaExistente) {
      return NextResponse.json(
        { error: 'Você já possui uma candidatura pendente. Aguarde a análise da equipe.' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já é um criador
    const criadorExistente = await prisma.criador.findUnique({
      where: { usuarioId }
    })

    if (criadorExistente) {
      return NextResponse.json(
        { error: 'Você já é um criador na plataforma.' },
        { status: 400 }
      )
    }

    // Criar candidatura
    const candidatura = await prisma.candidaturaCriador.create({
      data: {
        usuarioId,
        nome,
        email,
        bio,
        categoria,
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

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId,
        acao: 'CANDIDATURA_CRIADOR',
        detalhes: `Nova candidatura de criador criada: ${nome} - ${categoria}`,
        nivel: 'info'
      }
    })

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Candidatura enviada com sucesso!',
      candidaturaId: candidatura.id
    })

  } catch (error) {
    console.error('Erro ao processar candidatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
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
