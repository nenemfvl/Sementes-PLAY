# Sistema de Repasse dos Parceiros - SementesPLAY

## Visão Geral

O sistema de repasse dos parceiros permite que parceiros aprovem solicitações de compra e realizem repasses automaticamente via Mercado Pago, distribuindo cashback em sementes para os usuários sem necessidade de aprovação administrativa.

## Como Funciona

### 1. Fluxo de Solicitação e Aprovação
- **Usuário faz solicitação** → Cria `SolicitacaoCompra` com status `pendente`
- **Parceiro aprova/rejeita** → Atualiza status e cria `CompraParceiro` com status `aguardando_repasse`
- **Parceiro inicia repasse** → Cria `RepasseParceiro` e gera PIX via Mercado Pago

### 2. Processamento Automático via Mercado Pago
- **Parceiro paga via PIX** → Mercado Pago confirma pagamento
- **Webhook processa automaticamente** → Sistema distribui cashback imediatamente:
  - 5% do valor para o usuário em sementes
  - 2,5% para o fundo de distribuição
  - 2,5% para o sistema SementesPLAY

### 3. Status dos Repasses
- `pendente`: Repasse criado, aguardando geração do PIX
- `aguardando_pagamento`: PIX gerado, aguardando confirmação
- `confirmado`: Pagamento confirmado, cashback distribuído
- `rejeitado`: Repasse rejeitado pelo parceiro

## Integração com Mercado Pago

### 1. Geração de PIX
- **API**: `/api/mercadopago/pix`
- **Função**: Cria pagamento PIX no Mercado Pago para receber repasse
- **Retorna**: QR Code, status e paymentId

### 2. Webhook de Confirmação
- **API**: `/api/mercadopago/webhook`
- **Função**: Processa automaticamente pagamentos confirmados
- **Ação**: Distribui cashback e atualiza status do repasse

### 3. Verificação de Status
- **API**: `/api/mercadopago/verificar-pagamento`
- **Função**: Consulta status do pagamento no Mercado Pago
- **Uso**: Verificação manual quando necessário

## APIs Implementadas

### 1. `/api/parceiros/solicitacoes/[id]/aprovar`
- **POST**: Parceiro aprova solicitação de compra
- **Ação**: Cria `CompraParceiro` e notifica usuário

### 2. `/api/parceiros/solicitacoes/[id]/rejeitar`
- **POST**: Parceiro rejeita solicitação de compra
- **Ação**: Atualiza status e notifica usuário

### 3. `/api/parceiros/fazer-repasse`
- **POST**: Parceiro inicia repasse e gera PIX automaticamente
- **Ação**: Cria `RepasseParceiro` e integra com Mercado Pago

### 4. `/api/parceiros/repasses-pendentes`
- **GET**: Lista repasses pendentes do parceiro
- **Retorna**: Solicitações, compras e repasses pendentes

### 5. `/api/admin/repasses`
- **GET**: Admin visualiza histórico de todos os repasses

## Estrutura do Banco de Dados

### Modelo `SolicitacaoCompra`
```prisma
model SolicitacaoCompra {
  id             String    @id @default(cuid())
  usuarioId      String
  parceiroId     String
  valorCompra    Float
  dataCompra     DateTime  @default(now())
  comprovanteUrl String?
  status         String    @default("pendente") // pendente, aprovada, rejeitada
  cupomUsado     String
  dataAprovacao  DateTime?
  dataRejeicao   DateTime?
  motivoRejeicao String?
}
```

### Modelo `CompraParceiro`
```prisma
model CompraParceiro {
  id             String           @id @default(cuid())
  usuarioId      String
  parceiroId     String
  valorCompra    Float
  dataCompra     DateTime         @default(now())
  comprovanteUrl String?
  status         String           @default("aguardando_repasse")
  cupomUsado     String
  repasse        RepasseParceiro?
}
```

### Modelo `RepasseParceiro`
```prisma
model RepasseParceiro {
  id             String         @id @default(cuid())
  parceiroId     String
  compraId       String         @unique
  valor          Float
  dataRepasse    DateTime       @default(now())
  comprovanteUrl String?
  status         String         @default("pendente") // pendente, aguardando_pagamento, confirmado, rejeitado
  paymentId      String?        // ID do pagamento no Mercado Pago
}
```

## Fluxo de Funcionamento

### Ciclo de Vida do Repasse
1. **Solicitação**: Usuário solicita compra com parceiro
2. **Aprovação**: Parceiro aprova ou rejeita a solicitação
3. **Repasse**: Parceiro inicia repasse e sistema gera PIX
4. **Pagamento**: Parceiro paga via PIX no Mercado Pago
5. **Confirmação**: Webhook confirma pagamento automaticamente
6. **Distribuição**: Sistema distribui cashback imediatamente

### Benefícios do Sistema
- **Autonomia**: Parceiros gerenciam seus próprios repasses
- **Agilidade**: Cashback liberado automaticamente após confirmação do pagamento
- **Transparência**: Usuários veem status em tempo real
- **Auditoria**: Log completo de todas as operações
- **Integração**: Pagamentos processados via Mercado Pago (seguro e confiável)

## Configuração e Manutenção

### Variáveis de Ambiente
```bash
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_BASE_URL=https://sementesplay.com.br
```

### Iniciar Repasse
```bash
POST /api/parceiros/fazer-repasse
{
  "compraId": "id_da_compra",
  "parceiroId": "id_do_parceiro",
  "valor": 100.00,
  "comprovanteUrl": "url_do_comprovante"
}
```

### Monitoramento
- Verificar repasses pendentes via `/api/parceiros/repasses-pendentes`
- Acompanhar histórico de repasses via `/api/admin/repasses`
- Revisar logs de auditoria para transparência
- Monitorar webhooks do Mercado Pago

## Considerações de Segurança

- **Validação**: Verificações de propriedade antes de iniciar repasse
- **Transações**: Todas as distribuições usam transações do banco
- **Auditoria**: Log completo de todas as operações
- **Permissões**: Apenas parceiros podem iniciar seus próprios repasses
- **Integração**: Pagamentos processados via Mercado Pago (PCI compliant)
- **Webhook**: Confirmação automática via webhook seguro
