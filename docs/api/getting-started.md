# Guia de Início - API

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 22.20.0
- **PostgreSQL** >= 14
- **npm** >= 10.8.2

## Instalação

### 1. Instalar Dependências
```bash
cd apps/api
npm install
```

### 2. Configurar Banco de Dados

Copie o arquivo de exemplo:
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
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

### 3. Criar Banco de Dados
```sql
CREATE DATABASE nexus_events;
```

### 4. Executar Migrations (quando disponíveis)
```bash
npm run migration:run
```

## Execução

### Desenvolvimento
```bash
npm run start:dev
```

### Docker (Desenvolvimento)
```bash
# Subir stack (Postgres + API + WEB)
npm run docker:up

# Logs da API
npm run docker:logs:api

# Parar
npm run docker:down

# Reset do banco
npm run docker:reset:db
```

### Produção
```bash
npm run build
npm run start:prod
```

## Verificação

Acesse http://localhost:3001/api/health para verificar se a API está funcionando.

No Docker, um healthcheck automático verifica `GET /api/health` para considerar a API saudável.

Você deve receber uma resposta como:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## Estrutura do Projeto

```
apps/api/src/
├── event/                      # Módulo de eventos nativos
│   ├── data-access/
│   │   ├── repositories/       # Interfaces de repositório
│   │   └── services/           # Lógica de negócio
│   ├── feature/
│   │   ├── schemas/            # Validação Zod
│   │   ├── event.controller.ts # Controller REST
│   │   └── event.module.ts     # Módulo NestJS
│   └── util/types/             # Tipos TypeScript
├── example/                    # Módulo de exemplo
├── shared/                     # Código compartilhado
├── database/                   # Configuração TypeORM
├── env/                        # Configuração de ambiente
├── app.module.ts               # Módulo principal
└── main.ts                     # Bootstrap da aplicação
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev              # Executa com watch mode
npm run start:debug            # Executa com debug

# Build
npm run build                  # Build para produção
npm run start:prod             # Executa versão buildada

# Testes
npm run test                   # Executa testes unitários
npm run test:watch             # Executa testes em watch mode
npm run test:cov               # Executa testes com coverage
npm run test:e2e               # Executa testes e2e

# Qualidade de Código
npm run lint                   # Executa ESLint
npm run format                 # Executa Prettier
```

## Configuração de Ambiente

### Variáveis Obrigatórias
- `DATABASE_HOST`: Host do PostgreSQL
- `DATABASE_PORT`: Porta do PostgreSQL
- `DATABASE_NAME`: Nome do banco de dados
- `DATABASE_USERNAME`: Usuário do banco
- `DATABASE_PASSWORD`: Senha do banco

### Variáveis Opcionais
- `NODE_ENV`: Ambiente (development/production/test)
- `PORT`: Porta da aplicação (padrão: 3001)
- `DATABASE_SYNCHRONIZE`: Sincronização automática (padrão: false)
- `DATABASE_LOGGING`: Logs do TypeORM (padrão: false)

## Troubleshooting

### Erro de Conexão com Banco
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solução**: Verifique se o PostgreSQL está rodando e as credenciais estão corretas.

### Erro de Migração
```
Error: relation "events" already exists
```
**Solução**: Execute `npm run migration:revert` e depois `npm run migration:run`.

### Erro de Porta
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solução**: Altere a porta no arquivo `.env` ou mate o processo que está usando a porta.

## Próximos Passos

1. [Documentação dos Módulos](./modules.md)
2. [Padrões Arquiteturais](./patterns.md)
3. [Endpoints da API](./endpoints.md)
