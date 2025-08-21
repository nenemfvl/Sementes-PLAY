import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Buscar parceiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limite = parseInt(searchParams.get('limite') || '50')

    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
            carteira: {
              select: {
                saldo: true
              }
            }
          }
        }
      },
      orderBy: [
        { totalVendas: 'desc' },
        { comissaoMensal: 'desc' }
      ],
      take: limite
    })

    // Mapear dados para o formato esperado pela interface
    const parceirosMapeados = parceiros.map(parceiro => ({
      id: parceiro.id,
      nome: parceiro.usuario.nome,
      email: parceiro.usuario.email,
      avatarUrl: parceiro.usuario.avatarUrl,
      nivel: parceiro.comissaoMensal.toString(),
      categoria: parceiro.nomeCidade,
      estado: 'Não informado', // Campo não existe no schema
      cidade: parceiro.nomeCidade,
      sementes: parceiro.totalVendas,
      saldoCarteira: parceiro.usuario.carteira?.saldo || 0,
      descricao: '',
      website: parceiro.urlConnect || '',
      redesSociais: {
        instagram: parceiro.instagram || '',
        tiktok: parceiro.tiktok || '',
        twitch: parceiro.twitch || '',
        youtube: parceiro.youtube || '',
        discord: parceiro.discord || ''
      }
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
