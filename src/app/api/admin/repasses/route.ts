import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os repasses com dados relacionados
    const repasses = await prisma.repasseParceiro.findMany({
      include: {
        parceiro: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        },
        compra: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        dataRepasse: 'desc'
      }
    })

    return NextResponse.json({ repasses })
  } catch (error) {
    console.error('Erro ao buscar repasses:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
