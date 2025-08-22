import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repasseId, parceiroId } = body

    if (!repasseId || !parceiroId) {
      return NextResponse.json(
        { error: 'RepasseId e parceiroId são obrigatórios' },
        { status: 400 }
      )
    }

    // Busca o repasse e verifica se pertence ao parceiro
    const repasse = await prisma.repasseParceiro.findFirst({
      where: {
        id: repasseId,
        parceiroId: parceiroId,
        status: 'pendente'
      },
      include: { 
        compra: {
          include: {
            parceiro: true,
            usuario: true
          }
        }
      }
    })

    if (!repasse) {
      return NextResponse.json(
        { error: 'Repasse não encontrado ou não está pendente' },
        { status: 404 }
      )
    }

    const compra = repasse.compra
    const parceiro = repasse.compra.parceiro

    if (!compra || !parceiro) {
      return NextResponse.json(
        { error: 'Dados inconsistentes' },
        { status: 400 }
      )
    }

    // Calcula as porcentagens - NOVO FLUXO
    const valor = repasse.valor
    const pctUsuario = Math.round(valor * 0.05)    // 5% para jogador
    const pctSistema = valor * 0.025               // 2,5% para sistema SementesPLAY
    const pctFundo = valor * 0.025                 // 2,5% para fundo de distribuição

    // Transação: atualiza tudo de uma vez
    await prisma.$transaction(async (tx) => {
      // Atualiza repasse para confirmado
      await tx.repasseParceiro.update({
        where: { id: repasseId },
        data: { status: 'confirmado' }
      })

      // Atualiza compra para cashback_liberado
      await tx.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      })

      // Atualiza saldo devedor do parceiro
      await tx.parceiro.update({
        where: { id: parceiro.id },
        data: { saldoDevedor: { decrement: valor } }
      })

      // Credita sementes para usuário
      await tx.usuario.update({
        where: { id: compra.usuarioId },
        data: { sementes: { increment: pctUsuario } }
      })
      
      // Sistema SementesPLAY recebe dinheiro (não sementes)
      // Aqui você pode implementar a lógica para creditar na conta do sistema
      // Por enquanto, vamos apenas registrar no histórico
      
      // Registra fundo de sementes
      const fundoExistente = await tx.fundoSementes.findFirst({
        where: { distribuido: false }
      })

      if (fundoExistente) {
        await tx.fundoSementes.update({
          where: { id: fundoExistente.id },
          data: { valorTotal: { increment: pctFundo } }
        })
      } else {
        await tx.fundoSementes.create({
          data: {
            ciclo: 1, // lógica de ciclo a ser implementada
            valorTotal: pctFundo,
            dataInicio: new Date(),
            dataFim: new Date(),
            distribuido: false
          }
        })
      }

      // Registra histórico de sementes (apenas para o jogador)
      await tx.semente.createMany({
        data: [
          {
            usuarioId: compra.usuarioId,
            quantidade: pctUsuario,
            tipo: 'resgatada',
            descricao: `Cashback compra parceiro ${compra.id}`
          }
        ]
      })
    })

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: 'system', // Sistema
        acao: 'CONFIRMAR_PAGAMENTO_REPASSE',
        detalhes: `Repasse ${repasseId} confirmado pelo parceiro. Parceiro: ${parceiro.nomeCidade}, Compra: ${compra.id}, Valor: R$ ${valor.toFixed(2)}, Cashback usuário: ${pctUsuario} sementes, Fundo: R$ ${pctFundo.toFixed(2)}`,
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || '',
        nivel: 'info'
      }
    })

    // Notificação para o usuário
    await prisma.notificacao.create({
      data: {
        usuarioId: compra.usuarioId,
        titulo: 'Cashback liberado!',
        mensagem: `Seu cashback da compra foi liberado e você recebeu ${pctUsuario} sementes.`,
        tipo: 'cashback',
        lida: false
      }
    })

    return NextResponse.json({ 
      message: 'Pagamento confirmado, cashback e porcentagens distribuídos com sucesso!' 
    })
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
