import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'MERCADOPAGO_ACCESS_TOKEN não configurado',
        message: 'Configure a variável de ambiente MERCADOPAGO_ACCESS_TOKEN'
      })
    }

    // Testar conexão com Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({
        success: false,
        error: 'Erro na conexão com Mercado Pago',
        status: response.status,
        details: errorData
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com Mercado Pago estabelecida com sucesso!',
      accessToken: {
        configurado: true,
        tipo: accessToken.startsWith('TEST-') ? 'Teste' : 'Produção',
        primeirosChars: accessToken.substring(0, 10) + '...'
      },
      mercadopago: {
        status: 'Conectado',
        metodosPagamento: data.length,
        apiVersion: 'v1'
      },
      webhook: {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mercadopago/webhook`,
        status: 'Configurado'
      }
    })

  } catch (error) {
    console.error('Erro no teste:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
