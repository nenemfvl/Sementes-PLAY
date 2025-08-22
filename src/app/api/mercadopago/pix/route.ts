import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { repasseId, parceiroId, usuarioId, valor } = await request.json()

    console.log('Dados recebidos:', { repasseId, parceiroId, usuarioId, valor })

    if (!repasseId || !parceiroId || !usuarioId || !valor) {
      console.log('Dados obrigatórios não fornecidos')
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const valorRepasse = parseFloat(valor)

    if (isNaN(valorRepasse) || valorRepasse <= 0) {
      console.log('Valor inválido:', valor)
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // Configurar access token do Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    console.log('Access Token configurado:', accessToken ? 'SIM' : 'NÃO')
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
      return NextResponse.json(
        { 
          error: 'Configuração de pagamento não disponível',
          message: 'Configure a variável MERCADOPAGO_ACCESS_TOKEN no Vercel'
        },
        { status: 500 }
      )
    }

    // Criar pagamento PIX no Mercado Pago
    const payment_data = {
      transaction_amount: valorRepasse,
      description: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
      payment_method_id: 'pix',
      payer: {
        email: 'parceiro@sementesplay.com.br',
        first_name: 'Parceiro',
        last_name: 'SementesPLAY'
      },
      external_reference: repasseId,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sementesplay.com.br'}/api/mercadopago/webhook`
    }

    console.log('Criando pagamento no Mercado Pago:', JSON.stringify(payment_data, null, 2))

    // Fazer requisição para a API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${repasseId}-${Date.now()}`
      },
      body: JSON.stringify(payment_data)
    })

    console.log('Status da resposta Mercado Pago:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro na API do Mercado Pago:', JSON.stringify(errorData, null, 2))
      return NextResponse.json(
        { 
          error: 'Erro ao gerar PIX',
          details: errorData.message || 'Erro na integração com Mercado Pago',
          mercadopago_error: errorData,
          status: response.status
        },
        { status: 400 }
      )
    }

    const payment = await response.json()
    console.log('Pagamento criado no Mercado Pago:', payment.id)

    // Salvar o paymentId no repasse
    try {
      await prisma.repasseParceiro.update({
        where: { id: repasseId },
        data: { 
          paymentId: String(payment.id),
          status: 'aguardando_pagamento'
        }
      })
      console.log('PaymentId salvo no repasse:', payment.id)
    } catch (dbError) {
      console.error('Erro ao salvar paymentId no banco:', dbError)
      // Não falhar se não conseguir salvar o paymentId
    }

    // Retornar dados do PIX para o parceiro
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      externalReference: payment.external_reference,
      status: payment.status,
      message: 'PIX gerado com sucesso. Aguarde a confirmação do pagamento.'
    })

  } catch (error) {
    console.error('Erro ao gerar PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
