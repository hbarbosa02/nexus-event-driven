# 🚀 Nexus Event Driven

Sistema completo de gerenciamento de eventos nativos do Node.js, construído com NestJS e Angular v20.2.

## 📋 Visão Geral

O **Nexus Event Driven** é uma solução robusta para gerenciar eventos nativos do Node.js (EventEmitter), oferecendo:

- ⚡ **Gerenciamento de Eventos**: Criação, execução e monitoramento de eventos nativos
- 🔄 **Retry Automático**: Sistema inteligente com até 5 tentativas e cancelamento automático
- 📊 **Monitoramento Completo**: Status, logs de erro e histórico detalhado
- 🏗️ **Arquitetura Moderna**: NestJS + Angular v20.2 com padrões robustos
- 📚 **Documentação Integrada**: Sistema de documentação acessível via `/doc`

## 🏗️ Arquitetura

### Monorepo Structure
```
nexus-event-driven/
├── apps/
│   ├── api/                    # Backend NestJS
│   └── web/                    # Frontend Angular v20.2
├── docs/                       # Documentação técnica
├── .cursor/rules/              # Padrões e convenções
├── package.json                # Configuração do monorepo
└── README.md
```

### Tecnologias

#### Backend (NestJS)
- **NestJS** v10.x - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados principal
- **Zod** - Validação de schemas
- **EventEmitter** - Eventos nativos do Node.js

#### Frontend (Angular)
- **Angular** v20.2 - Framework web
- **TypeScript** v5.x - Linguagem principal
- **SCSS** - Estilização
- **ngx-markdown** - Renderização de documentação

## 🚀 Início Rápido

### Pré-requisitos
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **npm** >= 8.0.0

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd nexus-event-driven

# Instalar dependências
npm run install:all

# Configurar banco de dados
cp apps/api/env.example apps/api/.env
# Edite o arquivo .env com suas configurações

# Criar banco de dados
createdb nexus_events
```

### Desenvolvimento
```bash
# Executar API e WEB simultaneamente
npm run dev

# Ou executar separadamente:
npm run dev:api    # API na porta 3001
npm run dev:web    # WEB na porta 3000
```

### URLs de Desenvolvimento
- **API**: http://localhost:3001/api
- **WEB**: http://localhost:3000
- **Documentação**: http://localhost:3000/doc
- **Health Check**: http://localhost:3001/api/health

### Docker (Desenvolvimento)
```bash
# Subir containers (Postgres, API e WEB)
npm run docker:up

# Ver logs (ex.: API)
npm run docker:logs:api

# Parar containers
npm run docker:down

# Reset do banco (remove volume de dados)
npm run docker:reset:db

# (Opcional) Executar migrations em vez de synchronize
npm run docker:migrate
```

URLs quando usando Docker:
- **API (Docker)**: http://localhost:3001/api
- **WEB (Docker)**: http://localhost:4200

## 📊 Funcionalidades

### Event Module
- ✅ Criação e execução de eventos nativos (EventEmitter)
- ✅ Sistema de retry automático (máx 5 tentativas)
- ✅ Status tracking: `pending`, `success`, `error`, `cancelled`
- ✅ Log completo de erros e cancelamentos
- ✅ API REST completa com paginação e filtros

### Example Module
- ✅ Módulo de exemplo seguindo padrões estabelecidos
- ✅ CRUD completo com validação Zod
- ✅ Paginação e filtros avançados

### Sistema de Documentação
- ✅ Documentação técnica integrada
- ✅ Navegação lateral intuitiva
- ✅ Suporte a Markdown
- ✅ Acessível via `/doc` no frontend

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev                    # Executa API e WEB em paralelo
npm run dev:api               # Executa apenas a API
npm run dev:web               # Executa apenas o frontend
```

### Build
```bash
npm run build                 # Build de todos os projetos
npm run build:api            # Build da API
npm run build:web            # Build do frontend
```

### Testes
```bash
npm run test                  # Executa todos os testes
npm run test:api             # Testes da API
npm run test:web             # Testes do frontend
```

### Qualidade de Código
```bash
npm run lint                  # ESLint em todos os projetos
npm run lint:api             # ESLint da API
npm run lint:web             # ESLint do frontend
```

### Database
```bash
npm run database:migrate      # Executa migrations
npm run database:generate     # Gera nova migration
npm run database:revert       # Reverte última migration
```

## 📚 Documentação

### Estrutura de Documentação
- **[Arquitetura](./docs/architecture.md)** - Visão geral da arquitetura
- **[API - Guia de Início](./docs/api/getting-started.md)** - Configuração da API
- **[API - Módulos](./docs/api/modules.md)** - Documentação dos módulos
- **[WEB - Guia de Início](./docs/web/getting-started.md)** - Configuração do frontend
- **[Desenvolvimento](./docs/development.md)** - Padrões e convenções

### Arquitetura e Padrões
Consulte a pasta `.cursor/rules/` para entender os padrões estabelecidos:
- **[ARCHITECTURE.md](.cursor/rules/ARCHITECTURE.md)** - Arquitetura completa
- **[coding-standards.md](.cursor/rules/coding-standards.md)** - Padrões de código
- **[nestjs-patterns.md](.cursor/rules/nestjs-patterns.md)** - Padrões NestJS
- **[angular-patterns.md](.cursor/rules/angular-patterns.md)** - Padrões Angular

## 🎯 Event Module - Funcionalidades Detalhadas

### Gerenciamento de Eventos Nativos
O sistema gerencia eventos nativos do Node.js (EventEmitter) com:

#### Status dos Eventos
- **PENDING**: Evento criado, aguardando execução
- **SUCCESS**: Evento executado com sucesso
- **ERROR**: Evento falhou durante execução
- **CANCELLED**: Evento cancelado após máximo de tentativas

#### Sistema de Retry
- Máximo de 5 tentativas por evento
- Retry automático em caso de erro
- Cancelamento automático após esgotar tentativas
- Log completo de erros e motivos de cancelamento

#### API Endpoints
```
GET    /api/events              # Listar eventos com paginação
GET    /api/events/:id          # Buscar evento por ID
POST   /api/events              # Criar novo evento
PUT    /api/events/:id          # Atualizar evento
DELETE /api/events/:id          # Deletar evento
POST   /api/events/:id/retry    # Retry de evento
```

## 🛠️ Configuração de Ambiente

### API (apps/api/.env)
```env
# Environment
NODE_ENV=development
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=nexus_events
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
```

## 🤝 Contribuindo

1. Leia a [documentação de desenvolvimento](./docs/development.md)
2. Consulte os padrões em `.cursor/rules/`
3. Faça um fork do projeto
4. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
5. Siga os padrões estabelecidos
6. Adicione testes para novas funcionalidades
7. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
8. Push para a branch (`git push origin feature/AmazingFeature`)
9. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] **Autenticação**: JWT com Passport
- [ ] **Cache**: Redis para queries frequentes
- [ ] **Queue**: Bull/BullMQ para processamento assíncrono
- [ ] **Monitoring**: Prometheus + Grafana
- [ ] **Testing**: Cobertura completa de testes
- [ ] **CI/CD**: Pipeline automatizado
- [ ] **Docker**: Containerização completa

### Melhorias Planejadas
- [ ] Dashboard de métricas em tempo real
- [ ] Notificações por email/Slack
- [ ] API GraphQL
- [ ] PWA para mobile
- [ ] Internacionalização (i18n)

---

**Desenvolvido com ❤️ usando NestJS e Angular v20.2**