import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Token não configurado',
        message: 'Configure MERCADOPAGO_ACCESS_TOKEN no Vercel'
      })
    }

    // Testar conexão básica
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Erro na conexão',
        status: response.status
      })
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Mercado Pago conectado com sucesso!',
      token: accessToken.substring(0, 20) + '...',
      status: 'Conectado'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
