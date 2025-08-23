import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { denuncianteId, conteudoId, conteudoParceiroId, tipo, motivo, descricao } = await request.json()

    // Validações básicas
    if (!denuncianteId || !tipo || !motivo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      )
    }

    if (!conteudoId && !conteudoParceiroId) {
      return NextResponse.json(
        { error: 'Deve especificar um conteúdo para denunciar' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já denunciou este conteúdo
    const denunciaExistente = await prisma.denuncia.findFirst({
      where: {
        denuncianteId,
        OR: [
          { conteudoId: conteudoId || undefined },
          { conteudoParceiroId: conteudoParceiroId || undefined }
        ]
      }
    })

    if (denunciaExistente) {
      return NextResponse.json(
        { error: 'Você já denunciou este conteúdo' },
        { status: 400 }
      )
    }

    // Determinar prioridade baseada no tipo
    let prioridade = 'baixa'
    if (['violencia', 'assedio', 'direitos_autorais'].includes(tipo)) {
      prioridade = 'alta'
    } else if (['spam', 'conteudo_inadequado'].includes(tipo)) {
      prioridade = 'media'
    }

    // Criar a denúncia
    const denuncia = await prisma.denuncia.create({
      data: {
        denuncianteId,
        conteudoId: conteudoId || null,
        conteudoParceiroId: conteudoParceiroId || null,
        tipo,
        motivo,
        descricao: descricao || null,
        prioridade
      },
      include: {
        denunciante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        conteudo: {
          select: {
            id: true,
            titulo: true,
            criador: {
              select: {
                nome: true
              }
            }
          }
        },
        conteudoParceiro: {
          select: {
            id: true,
            titulo: true,
            parceiro: {
              select: {
                nomeCidade: true
              }
            }
          }
        }
      }
    })

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: denuncianteId,
        acao: 'DENUNCIAR_CONTEUDO',
        detalhes: `Denúncia criada. ID: ${denuncia.id}, Tipo: ${tipo}, Motivo: ${motivo}, Conteúdo: ${conteudoId || conteudoParceiroId}`,
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
        nivel: 'info'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Denúncia enviada com sucesso',
      denuncia
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar denúncia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tipo = searchParams.get('tipo')
    const prioridade = searchParams.get('prioridade')
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'

    const where: any = {}

    if (status) {
      where.status = String(status)
    }

    if (tipo) {
      where.tipo = String(tipo)
    }

    if (prioridade) {
      where.prioridade = String(prioridade)
    }

    const denuncias = await prisma.denuncia.findMany({
      where,
      include: {
        denunciante: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        conteudo: {
          select: {
            id: true,
            titulo: true,
            criador: {
              select: {
                nome: true
              }
            }
          }
        },
        conteudoParceiro: {
          select: {
            id: true,
            titulo: true,
            parceiro: {
              select: {
                nomeCidade: true
              }
            }
          }
        }
      },
      orderBy: {
        dataDenuncia: 'desc'
      },
      take: parseInt(String(limit)),
      skip: parseInt(String(offset))
    })

    const total = await prisma.denuncia.count({ where })

    return NextResponse.json({
      denuncias,
      total,
      pendentes: await prisma.denuncia.count({ where: { status: 'pendente' } }),
      em_analise: await prisma.denuncia.count({ where: { status: 'em_analise' } }),
      resolvidas: await prisma.denuncia.count({ where: { status: 'resolvida' } }),
      rejeitadas: await prisma.denuncia.count({ where: { status: 'rejeitada' } })
    })

  } catch (error) {
    console.error('Erro ao buscar denúncias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
