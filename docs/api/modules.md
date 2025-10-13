# Módulos da API

## Event Module

### Visão Geral
O módulo Event gerencia eventos nativos do Node.js (EventEmitter), fornecendo um sistema completo de execução, monitoramento e retry automático.

### Funcionalidades
- ✅ Criação e execução de eventos nativos
- ✅ Sistema de retry automático (máx 5 tentativas)
- ✅ Status tracking (pending, success, error, cancelled)
- ✅ Log completo de erros e cancelamentos
- ✅ API REST completa com paginação e filtros

### Entidade Event
```typescript
interface Event {
  id: string;                    // UUID único
  name: string;                  // Nome do evento (max 255 chars)
  startTime: Date | null;        // Início da execução
  endTime: Date | null;          // Fim da execução
  data: Record<string, any>;     // Dados do evento (JSON)
  status: EventStatus;           // Status atual
  retryCount: number;            // Contador de tentativas (0-5)
  error: string | null;          // Mensagem de erro
  cancellationReason: string;    // Motivo do cancelamento
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data da última atualização
  deletedAt: Date | null;        // Data de exclusão (soft delete)
}
```

### Status dos Eventos
```typescript
enum EventStatus {
  PENDING = 'pending',           // Criado, aguardando execução
  SUCCESS = 'success',           // Executado com sucesso
  ERROR = 'error',               // Falhou durante execução
  CANCELLED = 'cancelled'        // Cancelado após max tentativas
}
```

### Endpoints

#### Listar Eventos
```http
GET /api/events?page=1&limit=10&status=pending&name=test
```

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, max: 100)
- `status`: Filtrar por status (pending|success|error|cancelled)
- `name`: Filtrar por nome (busca parcial)
- `retryCount`: Filtrar por número de tentativas

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "user.created",
      "startTime": "2024-01-01T10:00:00Z",
      "endTime": "2024-01-01T10:00:01Z",
      "data": { "userId": 123 },
      "status": "success",
      "retryCount": 0,
      "error": null,
      "cancellationReason": null,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:01Z",
      "deletedAt": null
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Buscar Evento por ID
```http
GET /api/events/{id}
```

#### Criar Evento
```http
POST /api/events
Content-Type: application/json

{
  "name": "user.created",
  "data": {
    "userId": 123,
    "email": "user@example.com"
  }
}
```

**Validação:**
- `name`: Obrigatório, string, 1-255 caracteres
- `data`: Opcional, objeto JSON

#### Atualizar Evento
```http
PUT /api/events/{id}
Content-Type: application/json

{
  "status": "success",
  "error": null
}
```

#### Deletar Evento
```http
DELETE /api/events/{id}
```

#### Retry de Evento
```http
POST /api/events/{id}/retry
Content-Type: application/json

{
  "maxRetries": 5
}
```

**Validação:**
- `maxRetries`: Opcional, número, 1-10 (padrão: 5)

### Fluxo de Execução

1. **Criação**: Evento criado com status `PENDING`
2. **Execução**: EventEmitter emite evento nativo
3. **Sucesso**: Status alterado para `SUCCESS`, `endTime` definido
4. **Erro**: Status alterado para `ERROR`, `retryCount` incrementado
5. **Retry**: Se `retryCount < 5`, permite retry manual
6. **Cancelamento**: Se `retryCount >= 5`, status alterado para `CANCELLED`

## Example Module

### Visão Geral
Módulo de exemplo que demonstra os padrões arquiteturais estabelecidos no projeto.

### Funcionalidades
- ✅ CRUD completo
- ✅ Validação com Zod schemas
- ✅ Paginação e filtros
- ✅ Soft delete
- ✅ Campos de auditoria

### Entidade Example
```typescript
interface Example {
  id: string;                    // UUID único
  name: string;                  // Nome do exemplo (max 255 chars)
  description: string | null;    // Descrição (max 500 chars)
  active: boolean;               // Status ativo/inativo
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data da última atualização
  deletedAt: Date | null;        // Data de exclusão (soft delete)
}
```

### Endpoints

#### Listar Exemplos
```http
GET /api/examples?page=1&limit=10&name=test&active=true
```

#### Buscar Exemplo por ID
```http
GET /api/examples/{id}
```

#### Criar Exemplo
```http
POST /api/examples
Content-Type: application/json

{
  "name": "Example Name",
  "description": "Example description",
  "active": true
}
```

#### Atualizar Exemplo
```http
PUT /api/examples/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "active": false
}
```

#### Deletar Exemplo
```http
DELETE /api/examples/{id}
```

#### Listar Exemplos Ativos
```http
GET /api/examples/active
```

## Padrões Comuns

### Validação
Todos os endpoints utilizam schemas Zod para validação:
- Entrada validada automaticamente
- Erros de validação retornam 400 Bad Request
- Mensagens de erro detalhadas

### Paginação
Todos os endpoints de listagem suportam:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, max: 100)

### Filtros
Filtros disponíveis via query parameters:
- Busca exata por campos específicos
- Operadores de comparação (quando aplicável)
- Suporte a valores nulos

### Respostas de Erro
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Soft Delete
Todos os recursos suportam exclusão lógica:
- Campo `deletedAt` marca exclusão
- Recursos excluídos não aparecem em listagens
- Possibilidade de restaurar (quando implementado)

## Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro de validação
- **404**: Recurso não encontrado
- **409**: Conflito (recurso já existe)
- **500**: Erro interno do servidor

## Rate Limiting

Atualmente não implementado, mas recomendado para produção:
- Limite de requisições por IP
- Limite por usuário (quando autenticação for implementada)
- Headers informativos sobre limites

## Logging

- Logs estruturados em JSON
- Níveis: error, warn, info, debug
- Contexto da requisição incluído
- Rotação automática de logs

---

Para mais detalhes sobre implementação, consulte [Padrões Arquiteturais](./patterns.md).
