import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()

    if (data && data.id) {
      console.log('Webhook recebido do MercadoPago:', data.id)
      
      // Configurar access token
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
      
      if (!accessToken) {
        console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
        return NextResponse.json(
          { error: 'Configuração não disponível' },
          { status: 500 }
        )
      }
      
      // Buscar detalhes do pagamento via API direta
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
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
        // Pagamento aprovado - processar automaticamente
        console.log(`Pagamento aprovado: ${payment.id}`)

        // Buscar repasse pelo paymentId
        const repasse = await prisma.repasseParceiro.findFirst({
          where: {
            paymentId: String(payment.id),
            status: 'aguardando_pagamento'
          },
          include: {
            compra: {
              include: {
                parceiro: {
                  include: {
                    usuario: true
                  }
                },
                usuario: true
              }
            }
          }
        })

        if (!repasse) {
          console.log(`Repasse não encontrado para paymentId: ${payment.id}`)
          return NextResponse.json({ message: 'Repasse não encontrado' })
        }

        console.log(`Processando repasse: ${repasse.id}`)

        // Calcular as porcentagens - FLUXO CORRETO
        const valor = repasse.valor
        const pctUsuario = Math.round(valor * 0.05)    // 5% para jogador em sementes
        const pctSistema = valor * 0.025               // 2,5% para sistema SementesPLAY em dinheiro
        const pctFundo = valor * 0.025                 // 2,5% para fundo de distribuição em sementes

        // Buscar ciclo atual para o fundo de sementes
        const configCiclos = await prisma.configuracaoCiclos.findFirst()
        if (!configCiclos) {
          console.error('Configuração de ciclos não encontrada')
          return NextResponse.json(
            { error: 'Configuração de ciclos não disponível' },
            { status: 500 }
          )
        }

        // Transação: processar tudo de uma vez
        await prisma.$transaction(async (tx) => {
          // 1. Atualizar status do repasse para confirmado
          await tx.repasseParceiro.update({
            where: { id: repasse.id },
            data: { status: 'confirmado' }
          })

          // 2. Atualizar status da compra para cashback_liberado
          await tx.compraParceiro.update({
            where: { id: repasse.compra.id },
            data: { status: 'cashback_liberado' }
          })

          // 3. Atualizar saldo devedor do parceiro
          await tx.parceiro.update({
            where: { id: repasse.compra.parceiro.id },
            data: { saldoDevedor: { decrement: valor } }
          })

          // 4. Creditar sementes para usuário (5% da compra)
          await tx.usuario.update({
            where: { id: repasse.compra.usuarioId },
            data: { sementes: { increment: pctUsuario } }
          })
          
          // 5. Criar/atualizar fundo de sementes com 2,5% da compra
          const fundoExistente = await tx.fundoSementes.findFirst({
            where: { 
              ciclo: configCiclos.numeroCiclo,
              distribuido: false 
            }
          })

          if (fundoExistente) {
            // Atualizar fundo existente do ciclo atual
            await tx.fundoSementes.update({
              where: { id: fundoExistente.id },
              data: { 
                valorTotal: { increment: pctFundo },
                dataFim: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 dias a partir de agora
              }
            })
          } else {
            // Criar novo fundo para o ciclo atual
            await tx.fundoSementes.create({
              data: {
                ciclo: configCiclos.numeroCiclo,
                valorTotal: pctFundo,
                dataInicio: new Date(),
                dataFim: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
                distribuido: false
              }
            })
          }

          // 6. Registra histórico de sementes (apenas para o jogador)
          await tx.semente.createMany({
            data: [
              {
                usuarioId: repasse.compra.usuarioId,
                quantidade: pctUsuario,
                tipo: 'resgatada',
                descricao: `Cashback compra parceiro ${repasse.compra.id}`
              }
            ]
          })
        })

        // Log de auditoria
        await prisma.logAuditoria.create({
          data: {
            usuarioId: 'system', // Sistema
            acao: 'WEBHOOK_MERCADOPAGO_REPASSE',
            detalhes: `Repasse ${repasse.id} confirmado via webhook Mercado Pago. Parceiro: ${repasse.compra.parceiro.nomeCidade}, Compra: ${repasse.compra.id}, Valor: R$ ${valor.toFixed(2)}, Cashback usuário: ${pctUsuario} sementes, Fundo ciclo ${configCiclos.numeroCiclo}: ${pctFundo} sementes`,
            ip: request.headers.get('x-forwarded-for') || '',
            userAgent: request.headers.get('user-agent') || '',
            nivel: 'info'
          }
        })

        // Notificação para o usuário
        await prisma.notificacao.create({
          data: {
            usuarioId: repasse.compra.usuarioId,
            titulo: 'Cashback liberado!',
            mensagem: `Seu cashback da compra foi liberado automaticamente e você recebeu ${pctUsuario} sementes.`,
            tipo: 'cashback',
            lida: false
          }
        })

        console.log(`Repasse ${repasse.id} processado com sucesso via webhook`)
        console.log(`Fundo de sementes atualizado: +${pctFundo} sementes para o ciclo ${configCiclos.numeroCiclo}`)
        
        return NextResponse.json({ 
          success: true,
          message: 'Repasse processado com sucesso',
          repasseId: repasse.id,
          paymentId: payment.id,
          fundoAtualizado: pctFundo,
          ciclo: configCiclos.numeroCiclo
        })
      } else {
        console.log(`Pagamento não aprovado. Status: ${payment.status}`)
        return NextResponse.json({ 
          message: 'Pagamento não aprovado',
          status: payment.status 
        })
      }
    } else {
      console.log('Webhook recebido sem dados válidos')
      return NextResponse.json({ message: 'Webhook sem dados válidos' })
    }

  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
