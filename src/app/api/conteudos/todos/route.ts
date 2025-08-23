import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

// GET - Listar todos os conteúdos dos parceiros/criadores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const categoria = searchParams.get('categoria')
    const tipo = searchParams.get('tipo')
    const plataforma = searchParams.get('plataforma')

    const where: any = {}
    
    if (categoria && categoria !== 'todas') {
      where.categoria = categoria
    }
    
    if (tipo && tipo !== 'todos') {
      where.tipo = tipo
    }

    if (plataforma && plataforma !== 'todas') {
      where.plataforma = plataforma
    }

    const conteudos = await prisma.conteudo.findMany({
      where,
      orderBy: [
        { fixado: 'desc' },
        { dataPublicacao: 'desc' }
      ],
      take: limit,
      skip: offset,
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            nivel: true,
            usuario: {
              select: {
                id: true,
                nome: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    // Formatar dados para o frontend
    const conteudosFormatados = conteudos.map(conteudo => ({
      id: conteudo.id,
      titulo: conteudo.titulo,
      descricao: conteudo.descricao || '',
      tipo: conteudo.tipo,
      categoria: conteudo.categoria,
      url: conteudo.url,
      plataforma: conteudo.plataforma,
      thumbnail: conteudo.preview || '',
      visualizacoes: conteudo.visualizacoes || 0,
      curtidas: conteudo.curtidas || 0,
      dislikes: conteudo.dislikes || 0,
      dataPublicacao: conteudo.dataPublicacao || new Date().toISOString(),
      parceiro: {
        id: conteudo.criador.id,
        nome: conteudo.criador.nome || conteudo.criador.usuario.nome,
        nivel: conteudo.criador.nivel,
        avatarUrl: conteudo.criador.usuario.avatarUrl
      }
    }))

    return NextResponse.json({
      sucesso: true,
      dados: conteudosFormatados,
      total: conteudos.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('Erro ao listar conteúdos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
