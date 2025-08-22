import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    return NextResponse.json({
      success: true,
      tokenConfigurado: !!accessToken,
      tokenLength: accessToken ? accessToken.length : 0,
      tokenInicio: accessToken ? accessToken.substring(0, 20) + '...' : 'NÃO CONFIGURADO',
      tokenTipo: accessToken ? (accessToken.startsWith('TEST-') ? 'Teste' : 'Produção') : 'NÃO CONFIGURADO',
      todasVariaveis: {
        MERCADOPAGO_ACCESS_TOKEN: accessToken ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NÃO CONFIGURADO'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
