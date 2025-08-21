import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar parceiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nivel = searchParams.get('nivel')
    const categoria = searchParams.get('categoria')
    const limite = parseInt(searchParams.get('limite') || '50')

    const where: any = {}
    
    // Filtrar por nível
    if (nivel && nivel !== 'todos') {
      where.nivel = nivel
    }
    
    // Filtrar por categoria
    if (categoria && categoria !== 'todos') {
      where.categoria = categoria
    }

    const parceiros = await prisma.parceiro.findMany({
      where: {
        ...where,
        aprovado: true // Apenas parceiros aprovados
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            estado: true,
            cidade: true
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
        { sementes: 'desc' }
      ],
      take: limite
    })

    // Mapear dados para o formato esperado pela interface
    const parceirosMapeados = parceiros.map(parceiro => ({
      id: parceiro.id,
      nome: parceiro.usuario.nome,
      email: parceiro.usuario.email,
      avatarUrl: parceiro.usuario.avatarUrl,
      nivel: parceiro.nivel,
      categoria: parceiro.categoria,
      estado: parceiro.usuario.estado || 'Não informado',
      cidade: parceiro.usuario.cidade || 'Não informado',
      sementes: parceiro.sementes,
      saldoCarteira: parceiro.carteira?.saldoSementes || 0,
      descricao: parceiro.descricao || '',
      website: parceiro.website || '',
      redesSociais: parceiro.redesSociais || {}
    }))

    return NextResponse.json({
      sucesso: true,
      dados: {
        parceiros: parceirosMapeados,
        total: parceirosMapeados.length
      }
    })

  } catch (error) {
    console.error('Erro ao buscar parceiros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
