# Sistema de Fundo de Sementes - SementesPLAY

## Visão Geral

O sistema de fundo de sementes é o mecanismo principal de distribuição de recompensas na plataforma SementesPLAY. Ele funciona de forma automática e transparente, coletando uma porcentagem das compras dos parceiros e distribuindo para criadores e usuários ativos.

## Como Funciona

### 1. Criação Automática do Fundo

**O fundo NÃO é mais criado manualmente com valor fixo.** Em vez disso, ele é criado e atualizado automaticamente a cada compra confirmada dos parceiros:

- **2,5%** de cada compra dos parceiros vai para o fundo de sementes
- **5%** da compra vai para o usuário em sementes (cashback)
- **2,5%** da compra vai para o sistema SementesPLAY em dinheiro

### 2. Distribuição Automática

O fundo é distribuído automaticamente no final de cada ciclo (15 dias) ou quando o admin decide distribuir:

- **50%** para criadores de conteúdo (proporcional à quantidade de conteúdo)
- **50%** para usuários que fizeram compras (proporcional ao valor gasto)

### 3. Ciclos e Seasons

- **Ciclo**: 15 dias - reset de ranking e níveis de criadores
- **Season**: 3 meses - reset completo (ranking, níveis, conteúdos)
- **Fundo**: Criado automaticamente a cada compra, não mais manualmente

## Fluxo Detalhado

```
1. Usuário faz compra no parceiro
   ↓
2. Parceiro confirma pagamento (PIX aprovado)
   ↓
3. Sistema automaticamente:
   - Cria/atualiza fundo de sementes com 2,5% da compra
   - Credita 5% em sementes para o usuário
   - Sistema recebe 2,5% em dinheiro
   ↓
4. No final do ciclo ou quando admin distribuir:
   - 50% do fundo vai para criadores
   - 50% do fundo vai para usuários
```

## APIs Principais

### `/api/mercadopago/webhook`
- **Função**: Processa pagamentos aprovados do Mercado Pago
- **Ação**: Cria/atualiza fundo de sementes automaticamente
- **Porcentagens**: 
  - 5% para usuário (sementes)
  - 2,5% para sistema (dinheiro)
  - 2,5% para fundo (sementes)

### `/api/admin/distribuir-fundo`
- **Função**: Distribui o fundo acumulado para criadores e usuários
- **Distribuição**: 50% criadores, 50% usuários
- **Critérios**: Proporcional à atividade (conteúdo para criadores, gastos para usuários)

### `/api/ranking/ciclos`
- **Função**: Gerencia ciclos e seasons
- **Reset**: Ranking, níveis de criadores, conteúdos
- **NOTA**: NÃO cria mais fundo automaticamente

## Modelo `FundoSementes`

```prisma
model FundoSementes {
  id          String   @id @default(cuid())
  ciclo       Int      // Número do ciclo atual
  valorTotal  Float    // Total acumulado (2,5% das compras)
  dataInicio  DateTime // Data de início do fundo
  dataFim     DateTime // Data de fim (15 dias)
  distribuido Boolean  @default(false) // Se já foi distribuído
  
  // Relacionamentos
  distribuicoes DistribuicaoFundo[]
  
  @@map("fundo_sementes")
}
```

## Vantagens do Novo Sistema

1. **Transparência**: Fundo é criado automaticamente pelas compras reais
2. **Sustentabilidade**: Sistema se auto-financia através das transações
3. **Justiça**: Distribuição proporcional à atividade real dos usuários
4. **Automação**: Sem necessidade de intervenção manual para criar fundos
5. **Escalabilidade**: Fundo cresce naturalmente com o crescimento da plataforma

## Configuração

O sistema funciona automaticamente após a configuração do Mercado Pago. Não é necessário configurar valores fixos ou criar fundos manualmente.

## Monitoramento

- **Logs**: Todas as transações são registradas em `logAuditoria`
- **Notificações**: Usuários recebem notificações quando recebem cashback
- **Dashboard**: Admin pode monitorar fundos em `/admin/fundo`
