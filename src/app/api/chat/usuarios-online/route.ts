import { NextRequest, NextResponse } from 'next/server'

// Simulação simples de usuários online
// Em produção, isso seria gerenciado por WebSockets ou Redis
let usuariosOnline = new Set<string>()

export async function GET() {
  try {
    return NextResponse.json({ online: Array.from(usuariosOnline) })
  } catch (error) {
    console.error('Erro ao buscar usuários online:', error)
    return NextResponse.json({ online: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (userId) {
      usuariosOnline.add(userId)
      
      // Remover usuário offline após 30 segundos de inatividade
      setTimeout(() => {
        usuariosOnline.delete(userId)
      }, 30000)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar status online:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
