import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        carteira: true,
        criador: true,
        parceiro: true
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, usuario.senha)

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verificar se usuário está suspenso
    if (usuario.suspenso) {
      return NextResponse.json(
        { error: 'Conta suspensa. Entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    // Atualizar último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() }
    })

    // Gerar JWT token
    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Retornar usuário e token (sem a senha)
    const { senha: _, ...usuarioSemSenha } = usuario

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha,
      token
    })

  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
