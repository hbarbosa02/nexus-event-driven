# Documentação - Nexus Event Driven

Bem-vindo à documentação completa do projeto **Nexus Event Driven**.

## 📋 Índice

### 🏗️ Arquitetura
- [Arquitetura Geral](./architecture.md) - Visão geral da arquitetura do sistema

### 🔧 API (Backend)
- [Guia de Início](./api/getting-started.md) - Como configurar e executar a API
- [Módulos](./api/modules.md) - Documentação dos módulos Event e Example
- [Padrões](./api/patterns.md) - Padrões arquiteturais utilizados
- [Endpoints](./api/endpoints.md) - Documentação completa da API REST

### 🌐 WEB (Frontend)
- [Guia de Início](./web/getting-started.md) - Como configurar e executar o frontend
- [Estrutura](./web/structure.md) - Organização de componentes e módulos
- [Componentes](./web/components.md) - Documentação dos componentes principais

### 🚀 Desenvolvimento
- [Guia de Desenvolvimento](./development.md) - Padrões e convenções de desenvolvimento
- [Padrões de Código](./code-standards.md) - Padrões rigorosos de código e ferramentas

### 📚 Guias
- [Convenções de Nomenclatura](./guides/naming-conventions.md) - Padrões de nomenclatura para arquivos, classes e variáveis
- [Estrutura de Pastas](./guides/folder-structure.md) - Organização de diretórios e arquivos

### 🎯 Padrões de Framework
- [Padrões NestJS](./patterns/nestjs-patterns.md) - Padrões específicos do NestJS
- [Padrões Angular](./patterns/angular-patterns.md) - Padrões específicos do Angular

## 🎯 Visão Geral

O **Nexus Event Driven** é um sistema completo para gerenciamento de eventos nativos do Node.js, construído com:

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: Angular v20.2 + TypeScript
- **Padrões**: Either, Criteria, BaseController, BaseRepository
- **Validação**: Zod schemas

## 🚀 Início Rápido

### Pré-requisitos
- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm >= 8.0.0

### Instalação
```bash
# Instalar dependências
npm install

# Configurar banco de dados
cp apps/api/env.example apps/api/.env

# Executar em desenvolvimento
npm run dev
```

### URLs
- **API**: http://localhost:3001/api
- **WEB**: http://localhost:3000
- **Documentação**: http://localhost:3000/doc

### Docker (Desenvolvimento)
```bash
# Subir containers (Postgres, API e WEB)
npm run docker:up

# Ver logs
npm run docker:logs:api
npm run docker:logs:web
npm run docker:logs:db

# Parar containers
npm run docker:down

# Reset do banco (remove volume de dados)
npm run docker:reset:db

# (Opcional) Executar migrations em vez de synchronize
npm run docker:migrate
```

URLs via Docker:
- **API (Docker)**: http://localhost:3001/api
- **WEB (Docker)**: http://localhost:4200

## 📚 Recursos Principais

### Event Module
- Gerenciamento de eventos nativos do Node.js (EventEmitter)
- Sistema de retry automático (máx 5 tentativas)
- Status: pending, success, error, cancelled
- Log completo de erros e cancelamentos

### Example Module
- Módulo de exemplo seguindo os padrões estabelecidos
- CRUD completo com validação Zod
- Paginação e filtros

### Documentação Integrada
- Sistema de documentação acessível via `/doc`
- Navegação lateral intuitiva
- Suporte a Markdown

## 🤝 Contribuindo

Para contribuir com o projeto, consulte os seguintes documentos para entender os padrões estabelecidos:

### 📚 Documentação Essencial
- [Guia de Desenvolvimento](./development.md) - Padrões e convenções de desenvolvimento
- [Padrões de Código](./code-standards.md) - Padrões rigorosos de código e ferramentas
- [Arquitetura Geral](./architecture.md) - Visão geral da arquitetura do sistema

### 🎯 Padrões Específicos
- [Padrões NestJS](./patterns/nestjs-patterns.md) - Para desenvolvimento backend
- [Padrões Angular](./patterns/angular-patterns.md) - Para desenvolvimento frontend
- [Convenções de Nomenclatura](./guides/naming-conventions.md) - Padrões de nomenclatura
- [Estrutura de Pastas](./guides/folder-structure.md) - Organização de arquivos

---

**Importante**: Sempre consulte a documentação antes de implementar novas funcionalidades para manter a consistência do projeto.
