import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar todos os criadores (para admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '50')
    const categoria = searchParams.get('categoria')
    const nivel = searchParams.get('nivel')
    const status = searchParams.get('status')

    const where: any = {}
    
    // Filtrar por categoria se especificada
    if (categoria && categoria !== 'todas') {
      where.categoria = categoria
    }
    
    // Filtrar por nível se especificado
    if (nivel && nivel !== 'todos') {
      where.nivel = nivel
    }

    // Filtrar por status se especificado
    if (status && status !== 'todos') {
      if (status === 'ativo') {
        where.usuario = { suspenso: false }
      } else if (status === 'suspenso') {
        where.usuario = { suspenso: true }
      } else if (status === 'banido') {
        where.usuario = { suspenso: true }
      }
    }

    const offset = (pagina - 1) * limite

    const [criadores, total] = await Promise.all([
      prisma.criador.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatarUrl: true,
              nivel: true,
              sementes: true,
              dataCriacao: true,
              ultimoLogin: true,
              suspenso: true
            }
          }
        },
        orderBy: [
          { nivel: 'desc' },
          { dataCriacao: 'desc' }
        ],
        skip: offset,
        take: limite
      }),
      prisma.criador.count({ where })
    ])

    const totalPaginas = Math.ceil(total / limite)

    // Formatar dados dos criadores
    const criadoresFormatados = criadores.map(criador => ({
      id: criador.id,
      nome: criador.nome,
      email: criador.usuario.email,
      avatarUrl: criador.usuario.avatarUrl,
      nivel: parseInt(criador.nivel) || 1,
      categoria: criador.categoria,
      status: criador.usuario.suspenso ? 'suspenso' : 'ativo',
      dataCadastro: criador.dataCriacao,
      ultimaAtividade: criador.usuario.ultimoLogin || criador.dataCriacao,
      totalConteudos: 0, // TODO: Implementar contagem de conteúdos
      totalVisualizacoes: 0, // TODO: Implementar contagem de visualizações
      totalGanhos: 0, // TODO: Implementar cálculo de ganhos
      biografia: criador.bio || 'Sem biografia',
      redesSociais: criador.redesSociais ? Object.keys(JSON.parse(criador.redesSociais)) : [],
      especialidades: [criador.categoria],
      usuarioId: criador.usuarioId
    }))

    return NextResponse.json({
      sucesso: true,
      criadores: criadoresFormatados,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas
      }
    })

  } catch (error) {
    console.error('Erro ao buscar criadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT - Atualizar criador (status, nível, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { criadorId, acao, valor } = body

    if (!criadorId || !acao) {
      return NextResponse.json(
        { error: 'ID do criador e ação são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar o criador
    const criador = await prisma.criador.findUnique({
      where: { id: criadorId },
      include: { usuario: true }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    let resultado: any = {}

    switch (acao) {
      case 'alterar_status':
        if (!['ativo', 'suspenso'].includes(valor)) {
          return NextResponse.json(
            { error: 'Status inválido' },
            { status: 400 }
          )
        }
        
        resultado = await prisma.usuario.update({
          where: { id: criador.usuarioId },
          data: { suspenso: valor === 'suspenso' }
        })
        break

      case 'alterar_nivel':
        if (![1, 2, 3, 4].includes(valor)) {
          return NextResponse.json(
            { error: 'Nível inválido' },
            { status: 400 }
          )
        }
        
        resultado = await prisma.criador.update({
          where: { id: criadorId },
          data: { nivel: valor.toString() }
        })
        break

      case 'banir':
        // Banir o usuário (suspender permanentemente)
        resultado = await prisma.usuario.update({
          where: { id: criador.usuarioId },
          data: { 
            suspenso: true,
            motivoSuspensao: 'Usuário banido por administrador'
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

    // Log da ação
    try {
      await prisma.logAuditoria.create({
        data: {
          usuarioId: criador.usuarioId,
          acao: `CRIADOR_${acao.toUpperCase()}`,
          detalhes: `Criador ${acao} - ID: ${criadorId}, Valor: ${valor}`,
          nivel: 'info'
        }
      })
    } catch (logError) {
      console.error('Erro ao criar log de auditoria:', logError)
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: `Criador ${acao} com sucesso!`,
      resultado
    })

  } catch (error) {
    console.error('Erro ao atualizar criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Remover criador (rebaixar para usuário comum)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const criadorId = searchParams.get('id')

    if (!criadorId) {
      return NextResponse.json(
        { error: 'ID do criador é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o criador
    const criador = await prisma.criador.findUnique({
      where: { id: criadorId },
      include: { usuario: true }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    // Remover o criador e rebaixar para usuário comum
    await prisma.$transaction([
      // Remover criador
      prisma.criador.delete({
        where: { id: criadorId }
      }),
      // Atualizar usuário para nível comum
      prisma.usuario.update({
        where: { id: criador.usuarioId },
        data: { nivel: 'comum' }
      })
    ])

    // Log da ação
    try {
      await prisma.logAuditoria.create({
        data: {
          usuarioId: criador.usuarioId,
          acao: 'CRIADOR_REMOVIDO',
          detalhes: `Criador removido - ID: ${criadorId}`,
          nivel: 'warning'
        }
      })
    } catch (logError) {
      console.error('Erro ao criar log de auditoria:', logError)
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Criador removido com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao remover criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
