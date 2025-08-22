import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { paymentId, repasseId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: 'PaymentId obrigatório não fornecido' },
        { status: 400 }
      )
    }

    // Configurar access token do Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
      return NextResponse.json(
        { error: 'Configuração não disponível' },
        { status: 500 }
      )
    }

    // Buscar detalhes do pagamento via API do Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Erro ao buscar pagamento no MercadoPago:', response.status)
      return NextResponse.json(
        { error: 'Erro ao verificar pagamento' },
        { status: 400 }
      )
    }

    const payment = await response.json()
    console.log('Status do pagamento:', payment.status)

    if (payment.status === 'approved') {
      // Pagamento aprovado - verificar se já foi processado
      console.log(`Pagamento aprovado: ${payment.id}`)

      if (!repasseId) {
        return NextResponse.json({ 
          success: true, 
          status: 'approved',
          message: 'Pagamento aprovado no Mercado Pago',
          paymentId: String(payment.id)
        })
      }

      // Buscar o repasse no banco de dados
      const repasse = await prisma.repasseParceiro.findUnique({
        where: { id: repasseId },
        include: { 
          compra: {
            include: { usuario: true }
          }
        }
      })

      if (!repasse) {
        return NextResponse.json(
          { error: 'Repasse não encontrado' },
          { status: 404 }
        )
      }

      if (repasse.status === 'confirmado') {
        return NextResponse.json({ 
          success: true, 
          status: 'confirmado',
          message: 'Repasse já foi processado',
          repasseId: repasse.id
        })
      }

      // Se o repasse ainda não foi processado, o webhook deve processá-lo
      // Aqui apenas retornamos o status do pagamento
      return NextResponse.json({ 
        success: true, 
        status: 'approved',
        message: 'Pagamento aprovado, aguardando processamento automático',
        paymentId: String(payment.id),
        repasseId: repasse.id
      })

    } else if (payment.status === 'pending') {
      return NextResponse.json({ 
        success: true, 
        status: 'pending',
        message: 'Pagamento pendente',
        paymentId: String(payment.id)
      })
    } else if (payment.status === 'rejected') {
      return NextResponse.json({ 
        success: true, 
        status: 'rejected',
        message: 'Pagamento rejeitado',
        paymentId: String(payment.id)
      })
    } else {
      return NextResponse.json({ 
        success: true, 
        status: payment.status,
        message: `Status do pagamento: ${payment.status}`,
        paymentId: String(payment.id)
      })
    }

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
