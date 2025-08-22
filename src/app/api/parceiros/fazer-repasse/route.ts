import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { compraId, parceiroId, valor, comprovanteUrl } = body

    if (!compraId || !parceiroId || !valor) {
      return NextResponse.json(
        { error: 'CompraId, parceiroId e valor são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se a compra existe e pertence ao parceiro
    const compra = await prisma.compraParceiro.findFirst({
      where: {
        id: compraId,
        parceiroId: parceiroId,
        status: 'aguardando_repasse'
      },
      include: {
        parceiro: true,
        usuario: true
      }
    })

    if (!compra) {
      return NextResponse.json(
        { error: 'Compra não encontrada ou não está aguardando repasse' },
        { status: 404 }
      )
    }

    // Verifica se já existe um repasse para esta compra
    const repasseExistente = await prisma.repasseParceiro.findUnique({
      where: { compraId: compraId }
    })

    if (repasseExistente) {
      return NextResponse.json(
        { error: 'Já existe um repasse para esta compra' },
        { status: 400 }
      )
    }

    // Cria o repasse com status pendente
    const repasse = await prisma.repasseParceiro.create({
      data: {
        parceiroId: parceiroId,
        compraId: compraId,
        valor: valor,
        dataRepasse: new Date(),
        comprovanteUrl: comprovanteUrl,
        status: 'pendente' // Será atualizado quando o PIX for gerado
      }
    })

    // Gera PIX via Mercado Pago
    try {
      const pixResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mercadopago/pix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repasseId: repasse.id,
          parceiroId: parceiroId,
          usuarioId: compra.usuarioId,
          valor: valor
        })
      })

      if (!pixResponse.ok) {
        const errorData = await pixResponse.json()
        console.error('Erro ao gerar PIX:', errorData)
        
        // Remove o repasse se não conseguir gerar o PIX
        await prisma.repasseParceiro.delete({
          where: { id: repasse.id }
        })

        return NextResponse.json(
          { error: 'Erro ao gerar PIX para o repasse', details: errorData },
          { status: 400 }
        )
      }

      const pixData = await pixResponse.json()

      // Cria notificação para o usuário
      await prisma.notificacao.create({
        data: {
          usuarioId: compra.usuarioId,
          titulo: 'Repasse Iniciado!',
          mensagem: `O parceiro ${compra.parceiro.nomeCidade} iniciou o repasse de R$ ${valor.toFixed(2)} para sua compra. Aguarde a confirmação do pagamento.`,
          tipo: 'repasse_iniciado',
          lida: false
        }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: parceiroId,
          acao: 'INICIAR_REPASSE_MERCADOPAGO',
          detalhes: `Repasse ${repasse.id} iniciado para compra ${compraId}. Parceiro: ${compra.parceiro.nomeCidade}, Valor: R$ ${valor.toFixed(2)}, PaymentId: ${pixData.paymentId}`,
          ip: request.headers.get('x-forwarded-for') || '',
          userAgent: request.headers.get('user-agent') || '',
          nivel: 'info'
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Repasse iniciado com sucesso. PIX gerado via Mercado Pago.',
        repasse: {
          id: repasse.id,
          status: repasse.status,
          paymentId: pixData.paymentId
        },
        pix: {
          qrCode: pixData.qrCode,
          qrCodeBase64: pixData.qrCodeBase64,
          status: pixData.status
        }
      })

    } catch (error) {
      console.error('Erro ao gerar PIX:', error)
      
      // Remove o repasse se não conseguir gerar o PIX
      await prisma.repasseParceiro.delete({
        where: { id: repasse.id }
      })

      return NextResponse.json(
        { error: 'Erro ao gerar PIX para o repasse' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao fazer repasse:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
