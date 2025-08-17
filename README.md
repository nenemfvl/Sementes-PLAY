# SementesPLAY

Sistema de cashback e doações para o ecossistema FiveM. Conectamos jogadores, criadores de conteúdo e donos de cidades através de um sistema cíclico de recompensas.

> **Status**: Projeto configurado e pronto para deploy no Vercel e Railway!

## 🚀 Funcionalidades

- **Sistema de Cashback**: 10% de cashback em compras FiveM
- **Doações para Criadores**: Apoie seus criadores favoritos
- **Sistema de Níveis**: 4 níveis de criadores (Supremo, Parceiro, Comum, Iniciante)
- **Ranking e Competições**: Sistema de pontuação e rankings
- **Carteira Digital**: Gerenciamento de Sementes e saques
- **Sistema de Parceiros**: Cidades FiveM parceiras

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Database**: PostgreSQL com Prisma ORM
- **Cloud Storage**: Cloudinary
- **Deploy**: Vercel (Frontend), Railway (Backend)
- **Authentication**: Sistema customizado com JWT
- **Payments**: MercadoPago (opcional)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- PostgreSQL
- Conta no Cloudinary

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd Sementes-PLAY
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env.local
   # Edite o arquivo .env.local com suas configurações
   ```

4. **Configure o banco de dados**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

## 🔧 Configuração

### Variáveis de Ambiente

- `DATABASE_URL`: URL do banco PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `CLOUDINARY_*`: Configurações do Cloudinary
- `NEXTAUTH_*`: Configurações do NextAuth

### Banco de Dados

O projeto usa Prisma como ORM. Execute os seguintes comandos para configurar:

```bash
# Gerar cliente Prisma
npx prisma generate

# Sincronizar schema com banco
npx prisma db push

# Abrir interface do Prisma Studio
npx prisma studio
```

## 📁 Estrutura do Projeto

```
src/
├── app/                 # App Router do Next.js
│   ├── globals.css     # Estilos globais
│   ├── layout.tsx      # Layout raiz
│   └── page.tsx        # Página inicial
├── components/          # Componentes React
│   ├── Navbar.tsx      # Navegação global
│   └── Footer.tsx      # Rodapé global
├── lib/                 # Utilitários e configurações
└── types/               # Tipos TypeScript

prisma/
└── schema.prisma        # Schema do banco de dados
```

## 🚀 Deploy

### Vercel (Frontend)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Railway (Backend/Database)

1. Conecte seu repositório ao Railway
2. Configure o banco PostgreSQL
3. Configure as variáveis de ambiente

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através de:
- Discord: [Link do Discord]
- Email: contato@sementesplay.com
- Issues: [GitHub Issues]

## 🔄 Status do Projeto

- [x] Estrutura base do projeto
- [x] Componentes principais (Navbar, Footer)
- [x] Página inicial
- [x] Schema do banco de dados
- [x] Configurações de deploy
- [ ] Sistema de autenticação
- [ ] APIs do sistema
- [ ] Sistema de cashback
- [ ] Sistema de doações
- [ ] Dashboard do usuário
- [ ] Painel administrativo
- [ ] Sistema de notificações
- [ ] Integração com MercadoPago
