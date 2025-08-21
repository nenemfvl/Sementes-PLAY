import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar ranking de usuários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const nivel = searchParams.get('nivel')
    const estado = searchParams.get('estado')
    const limite = parseInt(searchParams.get('limite') || '100')

    const where: any = {}
    
    // Filtrar por tipo
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
    
    // Filtrar por nível
    if (nivel && nivel !== 'todos') {
      if (nivel === 'criador-iniciante') {
        where.criador = { nivel: 1 }
      } else if (nivel === 'criador-comum') {
        where.criador = { nivel: 2 }
      } else if (nivel === 'criador-parceiro') {
        where.criador = { nivel: 3 }
      } else if (nivel === 'criador-supremo') {
        where.criador = { nivel: 4 }
      } else if (nivel === 'parceiro') {
        where.parceiro = { isNot: null }
      }
    }
    
    // Filtrar por estado
    if (estado && estado !== 'todos') {
      where.estado = estado
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        estado: true,
        cidade: true,
        avatarUrl: true,
        criador: {
          select: {
            id: true,
            categoria: true,
            nivel: true,
            sementes: true,
            apoiadores: true
          }
        },
        parceiro: {
          select: {
            id: true,
            categoria: true,
            nivel: true,
            sementes: true
          }
        },
        carteira: {
          select: {
            saldoSementes: true
          }
        }
      },
      orderBy: [
        { nivel: 'desc' },
        { carteira: { saldoSementes: 'desc' } }
      ],
      take: limite
    })

    // Mapear dados para o formato esperado pela interface
    const usuariosMapeados = usuarios.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.criador ? 'criador' : 
            usuario.parceiro ? 'parceiro' : 
            usuario.nivel >= 5 ? 'admin' : 'usuario',
      nivel: usuario.criador ? 
        (usuario.criador.nivel === 1 ? 'criador-iniciante' :
         usuario.criador.nivel === 2 ? 'criador-comum' :
         usuario.criador.nivel === 3 ? 'criador-parceiro' :
         usuario.criador.nivel === 4 ? 'criador-supremo' : 'criador') :
        usuario.parceiro ? 'parceiro' : 'usuario',
      estado: usuario.estado || 'Não informado',
      cidade: usuario.cidade || 'Não informado',
      avatarUrl: usuario.avatarUrl,
      sementes: usuario.carteira?.saldoSementes || 0,
      pontuacao: usuario.criador?.apoiadores || 0,
      categoria: usuario.criador?.categoria || usuario.parceiro?.categoria || 'N/A'
    }))

    return NextResponse.json({
      sucesso: true,
      dados: {
        usuarios: usuariosMapeados,
        total: usuariosMapeados.length
      }
    })

  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
