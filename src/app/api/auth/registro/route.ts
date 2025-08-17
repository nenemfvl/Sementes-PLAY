import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, username, password } = body

    // Validação básica
    if (!nome || !email || !username || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Verificar se username já existe
    const usernameExistente = await prisma.usuario.findFirst({
      where: { nome: username }
    })

    if (usernameExistente) {
      return NextResponse.json(
        { error: 'Este username já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(password, 12)

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo: 'usuario',
        sementes: 0,
        nivel: 'comum',
        pontuacao: 0,
        nivelUsuario: 1,
        streakLogin: 0,
        xp: 0
      }
    })

    // Criar carteira digital
    await prisma.carteiraDigital.create({
      data: {
        usuarioId: usuario.id,
        saldo: 0,
        saldoPendente: 0,
        totalRecebido: 0,
        totalSacado: 0
      }
    })

    // Retornar sucesso (sem a senha)
    const { senha: _, ...usuarioSemSenha } = usuario

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      usuario: usuarioSemSenha
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
