# Sistema de Repasse dos Parceiros - SementesPLAY

## Visão Geral

O sistema de repasse dos parceiros permite que parceiros aprovem solicitações de compra e realizem repasses automaticamente, distribuindo cashback em sementes para os usuários sem necessidade de aprovação administrativa.

## Como Funciona

### 1. Fluxo de Solicitação e Aprovação
- **Usuário faz solicitação** → Cria `SolicitacaoCompra` com status `pendente`
- **Parceiro aprova/rejeita** → Atualiza status e cria `CompraParceiro` com status `aguardando_repasse`
- **Parceiro faz repasse** → Cria `RepasseParceiro` com status `pendente`

### 2. Confirmação e Distribuição Automática
- **Parceiro confirma pagamento** → Executa `/api/parceiros/confirmar-pagamento`
- **Sistema distribui automaticamente**:
  - 5% do valor para o usuário em sementes
  - 2,5% para o fundo de distribuição
  - 2,5% para o sistema SementesPLAY

### 3. Status dos Repasses
- `pendente`: Repasse criado, aguardando confirmação
- `confirmado`: Pagamento confirmado, cashback distribuído
- `rejeitado`: Repasse rejeitado pelo parceiro

## APIs Implementadas

### 1. `/api/parceiros/solicitacoes/[id]/aprovar`
- **POST**: Parceiro aprova solicitação de compra
- **Ação**: Cria `CompraParceiro` e notifica usuário

### 2. `/api/parceiros/solicitacoes/[id]/rejeitar`
- **POST**: Parceiro rejeita solicitação de compra
- **Ação**: Atualiza status e notifica usuário

### 3. `/api/parceiros/fazer-repasse`
- **POST**: Parceiro cria repasse para uma compra
- **Ação**: Cria `RepasseParceiro` com status `pendente`

### 4. `/api/parceiros/confirmar-pagamento`
- **POST**: Parceiro confirma pagamento do repasse
- **Ação**: Distribui cashback automaticamente

### 5. `/api/parceiros/repasses-pendentes`
- **GET**: Lista repasses pendentes do parceiro
- **Retorna**: Solicitações, compras e repasses pendentes

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
  status         String         @default("pendente") // pendente, confirmado, rejeitado
  paymentId      String?
}
```

## Fluxo de Funcionamento

### Ciclo de Vida do Repasse
1. **Solicitação**: Usuário solicita compra com parceiro
2. **Aprovação**: Parceiro aprova ou rejeita a solicitação
3. **Repasse**: Parceiro cria repasse com valor e comprovante
4. **Confirmação**: Parceiro confirma pagamento
5. **Distribuição**: Sistema distribui cashback automaticamente

### Benefícios do Sistema
- **Autonomia**: Parceiros gerenciam seus próprios repasses
- **Agilidade**: Cashback liberado imediatamente após confirmação
- **Transparência**: Usuários veem status em tempo real
- **Auditoria**: Log completo de todas as operações

## Configuração e Manutenção

### Confirmação de Pagamento
```bash
POST /api/parceiros/confirmar-pagamento
{
  "repasseId": "id_do_repasse",
  "parceiroId": "id_do_parceiro"
}
```

### Monitoramento
- Verificar repasses pendentes via `/api/parceiros/repasses-pendentes`
- Acompanhar histórico de repasses via `/api/admin/repasses`
- Revisar logs de auditoria para transparência

## Considerações de Segurança

- **Validação**: Verificações de propriedade antes de confirmar pagamento
- **Transações**: Todas as operações usam transações do banco
- **Auditoria**: Log completo de todas as operações
- **Permissões**: Apenas parceiros podem confirmar seus próprios repasses
