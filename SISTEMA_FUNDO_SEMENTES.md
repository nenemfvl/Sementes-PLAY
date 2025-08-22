# Sistema de Fundo de Sementes - SementesPLAY

## Visão Geral

O sistema de fundo de sementes é o mecanismo principal de contabilidade e distribuição de sementes na plataforma SementesPLAY. Ele funciona como um "banco central" que gerencia o fluxo de sementes entre usuários e criadores.

## Como Funciona

### 1. Criação do Fundo
- **Por Ciclo**: Um novo fundo é criado a cada ciclo (geralmente mensal)
- **Valor Total**: O fundo recebe um valor total de sementes para distribuição
- **Período**: Define data de início e fim do ciclo de distribuição

### 2. Distribuição Automática
O fundo é distribuído automaticamente seguindo a regra **50/50**:

#### 50% para Criadores
- **Critério**: Proporcional à quantidade de conteúdo ativo
- **Cálculo**: `(conteúdos do criador / total de conteúdos) × 50% do fundo`
- **Benefício**: Recompensa criadores por produtividade

#### 50% para Usuários
- **Critério**: Proporcional ao valor gasto em compras de parceiros
- **Cálculo**: `(gasto do usuário / total gasto) × 50% do fundo`
- **Benefício**: Recompensa usuários por engajamento

### 3. Contabilidade em Tempo Real

#### Sementes em Circulação
- **Definição**: Valor do fundo atual não distribuído
- **Exibição**: Mostrado na página principal como "Sementes em Circulação"
- **Atualização**: Atualiza automaticamente após distribuições

#### Histórico de Distribuições
- **Rastreamento**: Todas as distribuições são registradas
- **Transparência**: Usuários podem ver quanto receberam e quando
- **Auditoria**: Log completo para fins administrativos

## APIs Implementadas

### 1. `/api/admin/fundo-sementes`
- **POST**: Criar novo fundo de sementes
- **GET**: Consultar fundo atual e histórico

### 2. `/api/admin/distribuir-fundo`
- **POST**: Executar distribuição automática do fundo

### 3. `/api/admin/estatisticas`
- **GET**: Estatísticas incluindo sementes em circulação

## Estrutura do Banco de Dados

### Modelo `FundoSementes`
```prisma
model FundoSementes {
  id            String              @id @default(cuid())
  ciclo         Int                 // Número do ciclo
  valorTotal    Float               // Valor total do fundo
  dataInicio    DateTime            // Início do ciclo
  dataFim       DateTime            // Fim do ciclo
  distribuido   Boolean             @default(false) // Status de distribuição
  distribuicoes DistribuicaoFundo[] // Histórico de distribuições
}
```

### Modelo `DistribuicaoFundo`
```prisma
model DistribuicaoFundo {
  id        String        @id @default(cuid())
  fundoId   String        // Referência ao fundo
  usuarioId String?       // Usuário beneficiado (se aplicável)
  criadorId String?       // Criador beneficiado (se aplicável)
  valor     Float         // Valor distribuído
  tipo      String        // 'criador' ou 'usuario'
  data      DateTime      @default(now()) // Data da distribuição
}
```

## Fluxo de Funcionamento

### Ciclo de Vida do Fundo
1. **Criação**: Admin cria fundo com valor e período
2. **Acumulação**: Sementes ficam em "circulação" durante o ciclo
3. **Distribuição**: Sistema distribui automaticamente ao final do ciclo
4. **Histórico**: Registro completo para auditoria

### Benefícios do Sistema
- **Transparência**: Usuários veem exatamente quantas sementes estão em circulação
- **Justiça**: Distribuição proporcional baseada em mérito real
- **Sustentabilidade**: Sistema auto-gerenciado que recompensa engajamento
- **Escalabilidade**: Funciona independentemente do número de usuários

## Configuração e Manutenção

### Criação de Fundo
```bash
POST /api/admin/fundo-sementes
{
  "ciclo": 1,
  "valorTotal": 1000000,
  "dataInicio": "2024-01-01T00:00:00Z",
  "dataFim": "2024-01-31T23:59:59Z"
}
```

### Distribuição Automática
```bash
POST /api/admin/distribuir-fundo
```

### Monitoramento
- Verificar sementes em circulação via `/api/admin/fundo-sementes`
- Acompanhar estatísticas via `/api/admin/estatisticas`
- Revisar histórico de distribuições

## Considerações de Segurança

- **Transações**: Todas as distribuições usam transações do banco
- **Validação**: Verificações de integridade antes da distribuição
- **Auditoria**: Log completo de todas as operações
- **Permissões**: Apenas administradores podem criar/distribuir fundos
