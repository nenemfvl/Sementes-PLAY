# Configuração do Mercado Pago - SementesPLAY

## 🎯 **Visão Geral**

Este guia te ajudará a configurar o Mercado Pago para receber repasses dos parceiros automaticamente via PIX.

## 📋 **Pré-requisitos**

- Conta no Mercado Pago (pessoal ou empresarial)
- Documentos de identificação válidos
- Conta bancária para receber pagamentos
- Acesso ao painel de desenvolvedores

## 🚀 **Passo a Passo**

### 1. **Criar Conta no Mercado Pago**

1. Acesse [mercadopago.com.br](https://mercadopago.com.br)
2. Clique em **"Criar conta"**
3. Escolha entre conta pessoal ou empresarial
4. Preencha seus dados:
   - Nome completo
   - CPF/CNPJ
   - Email
   - Telefone
   - Data de nascimento
5. Verifique seu email e telefone

### 2. **Configurar Conta de Vendedor**

1. Faça login na sua conta
2. Vá em **"Vender"** → **"Configurar conta"**
3. Complete a verificação de identidade:
   - Envie foto do documento
   - Tire selfie para comparação
   - Aguarde aprovação (24-48h)
4. Configure dados bancários:
   - Banco
   - Agência
   - Conta
   - Tipo de conta

### 3. **Obter Access Token**

1. Acesse [mercadopago.com/developers](https://mercadopago.com/developers)
2. Faça login com sua conta
3. Vá em **"Suas integrações"**
4. Clique em **"Credenciais"**
5. Copie o **Access Token**:
   - **Test**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Production**: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 4. **Configurar Webhook**

1. No painel de desenvolvedores, vá em **"Webhooks"**
2. Clique em **"Adicionar webhook"**
3. Configure:
   - **URL**: `https://sementesplay.com.br/api/mercadopago/webhook`
   - **Eventos**: 
     - ✅ `payment.created`
     - ✅ `payment.updated`
   - **Versão da API**: v1
4. Clique em **"Salvar"**

### 5. **Configurar Variáveis de Ambiente**

#### Desenvolvimento Local (.env.local)
```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Produção (Vercel)
1. Acesse seu projeto no Vercel
2. Vá em **"Settings"** → **"Environment Variables"**
3. Adicione:
   - **Name**: `MERCADOPAGO_ACCESS_TOKEN`
   - **Value**: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Environment**: Production
4. Adicione também:
   - **Name**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: `https://sementesplay.com.br`
   - **Environment**: Production

### 6. **Testar a Configuração**

#### API de Teste
```bash
GET /api/mercadopago/teste
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Conexão com Mercado Pago estabelecida com sucesso!",
  "accessToken": {
    "configurado": true,
    "tipo": "Teste",
    "primeirosChars": "TEST-xxxxx..."
  },
  "mercadopago": {
    "status": "Conectado",
    "metodosPagamento": 15,
    "apiVersion": "v1"
  },
  "webhook": {
    "url": "https://sementesplay.com.br/api/mercadopago/webhook",
    "status": "Configurado"
  }
}
```

## 🔧 **Configurações Adicionais**

### 1. **Ambiente de Teste vs Produção**

- **Teste**: Use `TEST-` tokens para desenvolvimento
- **Produção**: Use `APP_USR-` tokens para usuários reais

### 2. **Configuração de PIX**

O sistema já está configurado para:
- Gerar PIX automaticamente
- Processar confirmações via webhook
- Distribuir cashback automaticamente

### 3. **Monitoramento**

- **Logs**: Todas as operações são logadas
- **Webhook**: Confirmações em tempo real
- **Auditoria**: Histórico completo de transações

## 🚨 **Problemas Comuns**

### 1. **Access Token Inválido**
```
Error: Configuração de pagamento não disponível
```
**Solução**: Verifique se a variável `MERCADOPAGO_ACCESS_TOKEN` está configurada

### 2. **Webhook Não Recebido**
```
Webhook não configurado ou URL incorreta
```
**Solução**: Verifique a URL do webhook no painel do Mercado Pago

### 3. **Pagamento Não Processado**
```
Repasse não encontrado para paymentId
```
**Solução**: Verifique se o webhook está funcionando e se o repasse foi criado

## 📱 **Testando o Sistema**

### 1. **Teste de PIX**
```bash
POST /api/parceiros/fazer-repasse
{
  "compraId": "id_da_compra",
  "parceiroId": "id_do_parceiro",
  "valor": 100.00,
  "comprovanteUrl": "url_do_comprovante"
}
```

### 2. **Verificar Status**
```bash
POST /api/mercadopago/verificar-pagamento
{
  "paymentId": "id_do_pagamento",
  "repasseId": "id_do_repasse"
}
```

## 🔒 **Segurança**

- **Access Token**: Nunca compartilhe ou commite no código
- **Webhook**: Use HTTPS em produção
- **Validação**: Todas as requisições são validadas
- **Auditoria**: Log completo de todas as operações

## 📞 **Suporte**

- **Mercado Pago**: [suporte.mercadopago.com.br](https://suporte.mercadopago.com.br)
- **Documentação**: [mercadopago.com/developers](https://mercadopago.com/developers)
- **Status da API**: [status.mercadopago.com](https://status.mercadopago.com)

## ✅ **Checklist de Configuração**

- [ ] Conta criada no Mercado Pago
- [ ] Identidade verificada
- [ ] Dados bancários configurados
- [ ] Access Token obtido
- [ ] Webhook configurado
- [ ] Variáveis de ambiente configuradas
- [ ] API de teste funcionando
- [ ] Sistema testado com PIX real

---

**🎉 Parabéns!** Seu sistema está configurado para receber repasses automaticamente via Mercado Pago!
