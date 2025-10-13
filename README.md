# 🚀 Monorepo Project

Um projeto monorepo configurado com uma API Node.js/Express e uma aplicação WEB React/Vite.

## 📁 Estrutura do Projeto

```
monorepo-project/
├── apps/
│   ├── api/          # API Node.js com Express
│   └── web/          # Aplicação React com Vite
├── packages/         # Pacotes compartilhados (futuro)
├── package.json      # Configuração raiz do monorepo
└── README.md
```

## 🛠️ Tecnologias Utilizadas

### API (`apps/api`)
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **CORS** - Configuração de CORS
- **Helmet** - Segurança HTTP
- **dotenv** - Variáveis de ambiente
- **tsx** - Execução TypeScript em desenvolvimento

### WEB (`apps/web`)
- **React 18** + **TypeScript**
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP
- **CSS moderno** com gradientes e animações

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 8.0.0

### Instalação
```bash
# Instalar dependências de todos os projetos
npm install
```

### Desenvolvimento
```bash
# Executar API e WEB simultaneamente
npm run dev

# Ou executar separadamente:
npm run dev:api    # API na porta 3001
npm run dev:web    # WEB na porta 3000
```

### Build
```bash
# Build de todos os projetos
npm run build

# Ou build separado:
npm run build:api
npm run build:web
```

### Produção
```bash
# Primeiro faça o build da API
npm run build:api

# Depois execute
npm start
```

## 📊 Endpoints da API

- `GET /` - Informações da API
- `GET /health` - Health check
- `GET /api/users` - Lista de usuários (exemplo)

## 🔧 Scripts Disponíveis

### Raiz do Monorepo
- `npm run dev` - Executa API e WEB em paralelo
- `npm run build` - Build de todos os projetos
- `npm run test` - Executa testes de todos os projetos
- `npm run lint` - Executa linting em todos os projetos
- `npm run clean` - Limpa node_modules e builds

### API (`apps/api`)
- `npm run dev --workspace=apps/api` - Modo desenvolvimento
- `npm run build --workspace=apps/api` - Build para produção
- `npm run start --workspace=apps/api` - Executa versão buildada

### WEB (`apps/web`)
- `npm run dev --workspace=apps/web` - Servidor de desenvolvimento
- `npm run build --workspace=apps/web` - Build para produção
- `npm run preview --workspace=apps/web` - Preview do build

## 🌐 URLs de Desenvolvimento

- **API**: http://localhost:3001
- **WEB**: http://localhost:3000
- **Health Check**: http://localhost:3001/health

## 📝 Configuração de Ambiente

### API
Copie o arquivo `.env.example` para `.env` na pasta `apps/api`:
```bash
cp apps/api/.env.example apps/api/.env
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎯 Próximos Passos

- [ ] Adicionar testes unitários e de integração
- [ ] Configurar CI/CD
- [ ] Adicionar ESLint e Prettier
- [ ] Criar pacotes compartilhados em `packages/`
- [ ] Adicionar autenticação JWT
- [ ] Configurar Docker
- [ ] Adicionar documentação da API com Swagger