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
    const limite = parseInt(searchParams.get('limite') || '50')

    const where: any = {}
    
    // Filtrar por tipo
    if (tipo && tipo !== 'todos') {
      if (tipo === 'criador') {
        where.criador = { isNot: null }
      } else if (tipo === 'parceiro') {
        where.parceiro = { isNot: null }
      } else if (tipo === 'admin') {
        where.nivel = { in: ['admin', 'moderador', 'supervisor'] }
      }
    }
    
    // Filtrar por nível
    if (nivel && nivel !== 'todos') {
      if (nivel === 'criador-iniciante') {
        where.criador = { nivel: 'iniciante' }
      } else if (nivel === 'criador-comum') {
        where.criador = { nivel: 'comum' }
      } else if (nivel === 'criador-parceiro') {
        where.criador = { nivel: 'parceiro' }
      } else if (nivel === 'criador-supremo') {
        where.criador = { nivel: 'supremo' }
      } else if (nivel === 'parceiro') {
        where.parceiro = { isNot: null }
      }
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        avatarUrl: true,
        criador: {
          select: {
            id: true,
            categoria: true,
            nivel: true,
            apoiadores: true
          }
        },
        parceiro: {
          select: {
            id: true,
            nomeCidade: true,
            totalVendas: true
          }
        },
        carteira: {
          select: {
            saldo: true
          }
        }
      },
      orderBy: [
        { nivel: 'desc' },
        { carteira: { saldo: 'desc' } }
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
            ['admin', 'moderador', 'supervisor'].includes(usuario.nivel) ? 'admin' : 'usuario',
      nivel: usuario.criador ? 
        (usuario.criador.nivel === 'iniciante' ? 'criador-iniciante' :
         usuario.criador.nivel === 'comum' ? 'criador-comum' :
         usuario.criador.nivel === 'parceiro' ? 'criador-parceiro' :
         usuario.criador.nivel === 'supremo' ? 'criador-supremo' : 'criador') :
        usuario.parceiro ? 'parceiro' : 'usuario',
      estado: 'Não informado', // Campo não existe no schema
      cidade: 'Não informado', // Campo não existe no schema
      avatarUrl: usuario.avatarUrl,
      sementes: usuario.carteira?.saldo || 0,
      pontuacao: usuario.criador?.apoiadores || 0,
      categoria: usuario.criador?.categoria || usuario.parceiro?.nomeCidade || 'N/A'
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
