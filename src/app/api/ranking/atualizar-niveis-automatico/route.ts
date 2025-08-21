import { NextRequest, NextResponse } from 'next/server'
import { atualizarNiveisCriadores } from '@/lib/niveis-criadores'

// POST - Atualização automática de níveis
export async function POST(request: NextRequest) {
  try {
    // Verificar se é uma chamada automática (com token secreto)
    const authHeader = request.headers.get('authorization')
    const isAutomaticCall = authHeader === `Bearer ${process.env.INTERNAL_API_SECRET}`

    if (!isAutomaticCall) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    console.log('🔄 Atualização automática de níveis iniciada...')

    const resultado = await atualizarNiveisCriadores()

    if (resultado.success) {
      console.log(`✅ Atualização concluída: ${resultado.atualizacoes.length} mudanças em ${resultado.totalCriadores} criadores`)
      
      return NextResponse.json({
        success: true,
        message: resultado.message,
        mudancas: resultado.atualizacoes.length,
        totalCriadores: resultado.totalCriadores,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('❌ Erro na atualização automática:', resultado.message)
      
      return NextResponse.json({ 
        success: false,
        error: resultado.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro na atualização automática de níveis:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET - Para testes (apenas em desenvolvimento)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Método não permitido em produção' },
      { status: 405 }
    )
  }

  try {
    console.log('🔄 Atualização manual de níveis iniciada...')

    const resultado = await atualizarNiveisCriadores()

    if (resultado.success) {
      console.log(`✅ Atualização concluída: ${resultado.atualizacoes.length} mudanças em ${resultado.totalCriadores} criadores`)
      
      return NextResponse.json({
        success: true,
        message: resultado.message,
        mudancas: resultado.atualizacoes.length,
        totalCriadores: resultado.totalCriadores,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('❌ Erro na atualização manual:', resultado.message)
      
      return NextResponse.json({ 
        success: false,
        error: resultado.message,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erro na atualização manual de níveis:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
