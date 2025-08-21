import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar todos os usuários (apenas para admins)
export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar verificação de autenticação admin
    // Por enquanto, permitindo acesso direto para desenvolvimento
    
    const { searchParams } = new URL(request.url)
    const pagina = parseInt(searchParams.get('pagina') || '1')
    const limite = parseInt(searchParams.get('limite') || '50')
    const tipo = searchParams.get('tipo')
    const nivel = searchParams.get('nivel')
    const status = searchParams.get('status')

    const offset = (pagina - 1) * limite

    const where: any = {}
    
    // Filtrar por tipo se especificado
    if (tipo && tipo !== 'todos') {
      if (tipo === 'admin') {
        where.nivel = { gte: 5 }
      } else if (tipo === 'criador') {
        where.criador = { isNot: null }
      } else if (tipo === 'parceiro') {
        where.parceiro = { isNot: null }
      } else {
        where.AND = [
          { criador: null },
          { parceiro: null },
          { nivel: { lt: 5 } }
        ]
      }
    }
    
    // Filtrar por nível se especificado
    if (nivel && nivel !== 'todos') {
      where.nivel = parseInt(nivel)
    }
    
    // Filtrar por status se especificado
    if (status && status !== 'todos') {
      where.status = status
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          nivel: true,
          status: true,
          dataCriacao: true,
          criador: {
            select: {
              id: true,
              categoria: true,
              nivel: true
            }
          },
          parceiro: {
            select: {
              id: true,
              categoria: true,
              nivel: true
            }
          },
          carteira: {
            select: {
              sementes: true
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
      prisma.usuario.count({ where })
    ])

    // Mapear dados para o formato esperado pela interface
    const usuariosMapeados = usuarios.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.criador ? 'criador' : 
            usuario.parceiro ? 'parceiro' : 
            usuario.nivel >= 5 ? 'admin' : 'usuario',
      nivel: usuario.nivel.toString(),
      sementes: usuario.carteira?.sementes || 0,
      pontuacao: 0, // TODO: Implementar sistema de pontuação
      dataCriacao: usuario.dataCriacao,
      status: usuario.status || 'ativo'
    }))

    return NextResponse.json({
      sucesso: true,
      dados: {
        usuarios: usuariosMapeados,
        paginacao: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PATCH - Atualizar usuário (nível, status, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nivel, status, motivo } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (nivel !== undefined) updateData.nivel = parseInt(nivel)
    if (status !== undefined) updateData.status = status

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData
    })

    // TODO: Registrar log de alteração se necessário

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso!',
      dados: usuario
    })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
