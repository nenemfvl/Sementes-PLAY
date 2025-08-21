# Configuração do Cloudinary para SementesPLAY

## 🚀 Por que usar Cloudinary?

- ✅ **Performance**: CDN global para carregamento rápido
- ✅ **Otimização automática**: Redimensionamento e compressão inteligente
- ✅ **Transformações**: Corte, redimensionamento e filtros em tempo real
- ✅ **Segurança**: URLs seguras e controle de acesso
- ✅ **Escalabilidade**: Suporte a milhões de imagens

## 📋 Pré-requisitos

1. Conta no [Cloudinary](https://cloudinary.com/)
2. Projeto criado no Cloudinary
3. Credenciais de API

## ⚙️ Configuração

### 1. Criar conta no Cloudinary
- Acesse [cloudinary.com](https://cloudinary.com/)
- Clique em "Sign Up For Free"
- Crie sua conta

### 2. Obter credenciais
Após fazer login, vá para o **Dashboard** e copie:
- **Cloud Name**
- **API Key**
- **API Secret**

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="sua_api_secret"
```

### 4. Configurar Upload Preset
No Dashboard do Cloudinary:

1. Vá para **Settings** > **Upload**
2. Role até **Upload presets**
3. Clique em **Add upload preset**
4. Configure:
   - **Preset name**: `sementesplay`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `sementesplay/avatars`
5. Salve o preset

## 🔧 Funcionalidades Implementadas

### Upload de Avatar
- ✅ Validação de tipo de arquivo (apenas imagens)
- ✅ Validação de tamanho (máximo 5MB)
- ✅ Otimização automática (200x200px, qualidade auto)
- ✅ Corte inteligente com foco no rosto
- ✅ Deletar avatar anterior automaticamente
- ✅ Organização em pastas por usuário

### Transformações Automáticas
- **Tamanho**: 200x200 pixels
- **Corte**: `fill` com foco no rosto (`gravity: face`)
- **Qualidade**: Automática (`auto:good`)
- **Formato**: Automático (WebP quando possível)

### Estrutura de Pastas
```
sementesplay/
├── avatars/
│   ├── avatar_user1_timestamp.jpg
│   ├── avatar_user2_timestamp.png
│   └── ...
├── conteudos/
└── outros/
```

## 🧪 Testando

1. **Configurar variáveis de ambiente**
2. **Reiniciar o servidor** (npm run dev)
3. **Acessar página de perfil**
4. **Clicar no ícone de lápis** sobre o avatar
5. **Selecionar uma imagem**
6. **Verificar upload** no Cloudinary Dashboard

## 📱 URLs de Exemplo

Após o upload, as URLs serão assim:
```
https://res.cloudinary.com/seu_cloud_name/image/upload/v1234567890/sementesplay/avatars/avatar_user123_1234567890.jpg
```

## 🚨 Troubleshooting

### Erro: "Upload failed"
- Verificar se as variáveis de ambiente estão corretas
- Verificar se o upload preset `sementesplay` existe
- Verificar se a conta tem créditos suficientes

### Erro: "Invalid API key"
- Verificar se a API key está correta
- Verificar se a API secret está correta
- Verificar se a conta está ativa

### Imagem não aparece
- Verificar se a URL está sendo salva no banco
- Verificar se a URL do Cloudinary está acessível
- Verificar console do navegador para erros

## 🔒 Segurança

- ✅ Upload presets unsigned para segurança
- ✅ Validação de tipo e tamanho de arquivo
- ✅ URLs seguras (HTTPS)
- ✅ Controle de acesso por pasta

## 💰 Custos

- **Free Tier**: 25 GB de armazenamento, 25 GB de banda
- **Pro**: $89/mês para 225 GB de armazenamento
- **Enterprise**: Contato direto

## 📞 Suporte

- [Documentação oficial](https://cloudinary.com/documentation)
- [Fórum da comunidade](https://support.cloudinary.com/)
- [Status do serviço](https://status.cloudinary.com/)
