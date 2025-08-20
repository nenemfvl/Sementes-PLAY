import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os criadores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '20')
    const categoria = searchParams.get('categoria')
    const nivel = searchParams.get('nivel')

    const where: any = {}
    
    // Filtrar por categoria se especificada
    if (categoria && categoria !== 'todas') {
      where.categoria = categoria
    }
    
    // Filtrar por nível se especificado
    if (nivel && nivel !== 'todos') {
      where.nivel = nivel
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
              corPerfil: true,
              nivel: true,
              sementes: true,
              dataCriacao: true
            }
          }
        },
        orderBy: [
          { nivel: 'desc' },
          { sementes: 'desc' },
          { apoiadores: 'desc' }
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
      bio: criador.bio,
      categoria: criador.categoria,
      nivel: criador.nivel,
      sementes: criador.sementes,
      apoiadores: criador.apoiadores,
      doacoes: criador.doacoes,
      dataCriacao: criador.dataCriacao,
      redesSociais: criador.redesSociais ? JSON.parse(criador.redesSociais) : {},
      portfolio: criador.portfolio ? JSON.parse(criador.portfolio) : {},
      usuario: {
        id: criador.usuario.id,
        nome: criador.usuario.nome,
        avatarUrl: criador.usuario.avatarUrl,
        corPerfil: criador.usuario.corPerfil,
        nivel: criador.usuario.nivel,
        sementes: criador.usuario.sementes,
        dataCriacao: criador.usuario.dataCriacao
      }
    }))

    return NextResponse.json({
      sucesso: true,
      dados: {
        criadores: criadoresFormatados,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar criadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Buscar criador específico por ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { criadorId } = body

    if (!criadorId) {
      return NextResponse.json(
        { error: 'ID do criador é obrigatório' },
        { status: 400 }
      )
    }

    const criador = await prisma.criador.findUnique({
      where: { id: criadorId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            corPerfil: true,
            nivel: true,
            sementes: true,
            dataCriacao: true
          }
        }
      }
    })

    if (!criador) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    // Formatar dados do criador
    const criadorFormatado = {
      id: criador.id,
      nome: criador.nome,
      bio: criador.bio,
      categoria: criador.categoria,
      nivel: criador.nivel,
      sementes: criador.sementes,
      apoiadores: criador.apoiadores,
      doacoes: criador.doacoes,
      dataCriacao: criador.dataCriacao,
      redesSociais: criador.redesSociais ? JSON.parse(criador.redesSociais) : {},
      portfolio: criador.portfolio ? JSON.parse(criador.portfolio) : {},
      usuario: {
        id: criador.usuario.id,
        nome: criador.usuario.nome,
        avatarUrl: criador.usuario.avatarUrl,
        corPerfil: criador.usuario.corPerfil,
        nivel: criador.usuario.nivel,
        sementes: criador.usuario.sementes,
        dataCriacao: criador.usuario.dataCriacao
      }
    }

    return NextResponse.json({
      sucesso: true,
      dados: criadorFormatado
    })

  } catch (error) {
    console.error('Erro ao buscar criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
