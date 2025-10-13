# Padrões de Código

## Visão Geral

Este documento estabelece os padrões rigorosos de código para o projeto **Nexus Event Driven**, focando em qualidade, manutenibilidade e consistência.

## TypeScript

### Configuração
- **Versão**: TypeScript v5.x
- **Strict Mode**: Habilitado
- **Path Aliases**: `@/` para imports absolutos
- **Target**: ES2022

### Regras de Tipagem
```typescript
// ✅ Bom - tipos explícitos
interface CreateEventRequest {
  title: string;
  description: string;
  date: Date;
  capacity: number;
}

// ❌ Ruim - any
function processData(data: any): any {
  return data;
}

// ✅ Bom - tipos específicos
function processData(data: CreateEventRequest): Either<Error, Event> {
  return right(data);
}
```

### Interfaces vs Types
```typescript
// ✅ Use interfaces para objetos que podem ser estendidos
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Event extends BaseEntity {
  title: string;
  description: string;
}

// ✅ Use types para unions, primitives e computed types
type EventStatus = 'draft' | 'published' | 'cancelled';
type EventResponse = Either<Error, Event>;
```

## Prettier

### Configuração
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Imports

### Ordem dos Imports
```typescript
// 1. Node modules
import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/shared/util/types/either';

// 2. Imports absolutos (@/)
import { EventRepository } from '@/event/data-access/repositories/event.repository';
import { BaseController } from '@/shared/feature/base.controller';

// 3. Imports relativos
import { CreateEventSchema } from './schemas/event.schema';
import { EventService } from '../data-access/services/event.service';
```

### Path Aliases
```typescript
// ✅ Use aliases para imports absolutos
import { BaseController } from '@/shared/feature/base.controller';

// ❌ Evite imports relativos longos
import { BaseController } from '../../../shared/feature/base.controller';
```

## Regras ESLint Aplicadas

### Proibição de `any`

**Regra**: `@typescript-eslint/no-explicit-any: error`

**O que é proibido**:
```typescript
// ❌ PROIBIDO
function processData(data: any): any {
  return data.someProperty;
}

// ❌ PROIBIDO
const result: any = await apiCall();
```

**Alternativas corretas**:
```typescript
// ✅ CORRETO - Use tipos específicos
function processData(data: { someProperty: string }): string {
  return data.someProperty;
}

// ✅ CORRETO - Use generics quando apropriado
function processData<T>(data: T): T {
  return data;
}

// ✅ CORRETO - Use unknown quando o tipo é realmente desconhecido
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return (data as { someProperty: string }).someProperty;
  }
  throw new Error('Invalid data');
}
```

### Imports Não Utilizados

**Regra**: `@typescript-eslint/no-unused-vars: error`

**O que é proibido**:
```typescript
// ❌ PROIBIDO - Import não utilizado
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Não usado

@Component({
  selector: 'app-example',
  template: '<div>Hello</div>'
})
export class ExampleComponent {
  // HttpClient não é usado
}
```

**Correção**:
```typescript
// ✅ CORRETO - Apenas imports utilizados
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  template: '<div>Hello</div>'
})
export class ExampleComponent {
  // Apenas imports necessários
}
```

**Exceções**:
```typescript
// ✅ CORRETO - Variáveis com prefixo _ são ignoradas
function example(_unusedParam: string, usedParam: number): number {
  return usedParam * 2;
}

// ✅ CORRETO - Imports de tipos podem ser removidos automaticamente
import type { EventEntity } from './event.entity';
```

### Política de Comentários

**Regras aplicadas**:
- `no-inline-comments: error`
- `no-warning-comments: error`
- `spaced-comment: error`

#### O que é Proibido

```typescript
// ❌ PROIBIDO - Comentários inline
const result = calculateValue(); // Este é um comentário inline proibido

// ❌ PROIBIDO - Comentários de TODO/FIXME
// TODO: Implementar validação
// FIXME: Corrigir bug aqui
// HACK: Solução temporária

// ❌ PROIBIDO - Comentários mal formatados
//comentário sem espaço
/*comentário sem espaço*/
```

#### O que é Permitido

```typescript
// ✅ CORRETO - JSDoc para APIs públicas
/**
 * Creates a new event with the provided data
 * @param data - Event creation data
 * @returns Either containing the created event or an error
 * @throws BadRequestException when validation fails
 */
async createEvent(data: CreateEventRequest): Promise<Either<Error, Event>> {
  // Implementation
}

// ✅ CORRETO - Diretivas ESLint quando necessárias
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = getLegacyData();

// ✅ CORRETO - Comentários de bloco bem formatados
/*
 * Este é um comentário de bloco
 * que explica algo complexo
 */
```

## Estratégias para Evitar Comentários

### 1. Nomes Descritivos

```typescript
// ❌ EVITAR - Nome vago + comentário
const d = 30; // dias para expirar

// ✅ PREFERIR - Nome descritivo
const daysUntilExpiration = 30;
```

### 2. Funções Pequenas e Focadas

```typescript
// ❌ EVITAR - Função grande com comentários
function processUserData(userData: any) {
  // Validar dados do usuário
  if (!userData.email) {
    throw new Error('Email required');
  }
  
  // Calcular idade
  const age = new Date().getFullYear() - userData.birthYear;
  
  // Retornar dados processados
  return {
    email: userData.email,
    age: age
  };
}

// ✅ PREFERIR - Funções pequenas e focadas
function validateUserData(userData: UserData): void {
  if (!userData.email) {
    throw new Error('Email required');
  }
}

function calculateAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

function processUserData(userData: UserData): ProcessedUserData {
  validateUserData(userData);
  const age = calculateAge(userData.birthYear);
  
  return {
    email: userData.email,
    age: age
  };
}
```

### 3. Tipos Explícitos

```typescript
// ❌ EVITAR - Tipo genérico + comentário
const config = {}; // { apiUrl: string, timeout: number }

// ✅ PREFERIR - Tipo explícito
interface ApiConfig {
  apiUrl: string;
  timeout: number;
}

const config: ApiConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
};
```

## Documentação Apropriada

### Quando Usar JSDoc

**Use JSDoc apenas para**:
- APIs públicas (métodos de controllers, services públicos)
- Funções complexas que necessitam explicação técnica
- Interfaces que serão usadas por outros módulos

```typescript
// ✅ CORRETO - JSDoc para API pública
@Controller('events')
export class EventController {
  /**
   * Creates a new event
   * @param createEventDto - Event creation data
   * @returns Created event with generated ID
   * @throws BadRequestException when validation fails
   * @throws ConflictException when event name already exists
   */
  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    // Implementation
  }
}
```

### Quando Usar Arquivos de Documentação

**Use arquivos em `/docs` para**:
- Explicar decisões arquiteturais
- Documentar fluxos complexos
- Guias de uso de APIs
- Padrões de integração

**Estrutura recomendada**:
```
docs/
├── api/
│   ├── getting-started.md
│   ├── modules.md
│   └── endpoints/
│       ├── events.md
│       └── users.md
├── architecture/
│   ├── event-driven-patterns.md
│   └── database-design.md
└── development/
    ├── code-standards.md
    └── testing-guidelines.md
```

## Verificação e Correção

### Comandos de Verificação

```bash
# Verificar erros de linting
npm run lint

# Corrigir automaticamente (quando possível)
npm run lint -- --fix

# Verificar apenas imports não utilizados
npx eslint --rule '@typescript-eslint/no-unused-vars' src/

# Verificar apenas uso de any
npx eslint --rule '@typescript-eslint/no-explicit-any' src/
```

### Configuração do VS Code

Adicione ao `settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ]
}
```

## Exceções e Casos Especiais

### Diretivas ESLint Permitidas

```typescript
// ✅ Permitido - Quando absolutamente necessário
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyApiResponse: any = await legacyApiCall();

// ✅ Permitido - Para arquivos de configuração
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./config.json');
```

### Imports de Tipos

```typescript
// ✅ Permitido - Imports de tipos são removidos automaticamente
import type { EventEntity } from './event.entity';
import type { CreateEventRequest } from './create-event.request';

// O TypeScript remove estes imports automaticamente se não usados
```

## Benefícios das Regras

1. **Código mais limpo**: Sem comentários desnecessários
2. **Melhor manutenibilidade**: Nomes descritivos e funções focadas
3. **Type safety**: Proibição de `any` força uso de tipos corretos
4. **Performance**: Imports não utilizados são removidos automaticamente
5. **Consistência**: Padrões uniformes em todo o projeto

## Checklist de Code Review

- [ ] Nenhum uso de `any` no código
- [ ] Todos os imports são utilizados
- [ ] Nenhum comentário inline desnecessário
- [ ] Nomes de variáveis e funções são descritivos
- [ ] JSDoc apenas onde apropriado
- [ ] Documentação complexa está em `/docs`
- [ ] Código é autoexplicativo

---

Seguir estes padrões garante código limpo, manutenível e profissional em todo o projeto.
