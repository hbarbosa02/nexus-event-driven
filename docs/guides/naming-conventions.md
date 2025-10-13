# Convenções de Nomenclatura

## Arquivos e Diretórios

### Estrutura de Arquivos
```
[nome-modulo]/
├── data-access/
│   ├── repositories/
│   │   └── [entidade].repository.ts        # event.repository.ts
│   └── services/
│       └── [entidade].service.ts           # event.service.ts
├── feature/
│   ├── schemas/
│   │   └── [entidade].schema.ts            # event.schema.ts
│   ├── [entidade].controller.ts            # event.controller.ts
│   └── [entidade].module.ts                # event.module.ts
└── util/
    └── types/
        └── [entidade].type.ts              # event.type.ts
```

### Nomenclatura de Arquivos
- **Formato**: `kebab-case` (minúsculas com hífen)
- **Exemplos**:
  - `event.controller.ts`
  - `event.service.ts`
  - `event.entity.ts`
  - `event.schema.ts`
  - `event.repository.ts`
  - `event.module.ts`

### Nomenclatura de Diretórios
- **Formato**: `kebab-case` (minúsculas com hífen)
- **Exemplos**:
  - `data-access/`
  - `feature/`
  - `util/`
  - `shared/`
  - `database/`

## Classes e Interfaces

### Classes
- **Formato**: `PascalCase`
- **Sufixos Obrigatórios**:
  - Controllers: `[Entidade]Controller`
  - Services: `[Entidade]Service`
  - Repositories: `[Entidade]Repository`
  - Entities: `[Entidade]Entity`
  - Modules: `[Entidade]Module`
  - Guards: `[Função]Guard`
  - Pipes: `[Função]Pipe`
  - Interceptors: `[Função]Interceptor`

### Exemplos de Classes
```typescript
// ✅ Correto
export class EventController extends BaseController {}
export class EventService {}
export class EventRepository {}
export class EventEntity extends BaseEntity {}
export class EventModule {}
export class PermissionsGuard {}
export class ZodValidationPipe {}
export class LoggingInterceptor {}

// ❌ Incorreto
export class eventController {}  // Deve ser PascalCase
export class Event {}            // Falta sufixo descritivo
export class EventService {}     // Ok
```

### Interfaces
- **Formato**: `PascalCase`
- **Sufixos**:
  - Requests: `[Ação][Entidade]Request`
  - Responses: `[Ação][Entidade]Response`
  - DTOs: `[Entidade][Ação]Dto`

### Exemplos de Interfaces
```typescript
// ✅ Correto
interface CreateEventRequest {
  title: string;
  description: string;
  date: Date;
  capacity: number;
}

interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: Date;
  capacity: number;
  status: EventStatus;
}

interface UpdateEventDto {
  title?: string;
  description?: string;
  capacity?: number;
}

// ❌ Incorreto
interface eventRequest {}        // Deve ser PascalCase
interface CreateEvent {}         // Falta sufixo Request/Response
interface createEventRequest {}  // Deve ser PascalCase
```

## Variáveis e Funções

### Variáveis
- **Formato**: `camelCase`
- **Booleanos**: Iniciar com verbo (is, has, can, should)
- **Arrays**: Nome no plural
- **Objetos**: Nome descritivo do que representa

### Exemplos de Variáveis
```typescript
// ✅ Correto
const eventData: CreateEventRequest = {};
const isEventActive = event.status === 'published';
const hasPermission = user.canCreateEvents;
const shouldValidateCapacity = true;
const events: Event[] = [];
const userPermissions: Permission[] = [];

// ❌ Incorreto
const EventData = {};           // Deve ser camelCase
const active = true;            // Nome não descritivo
const event_list = [];          // Deve ser camelCase
const data = {};                // Nome muito genérico
```

### Funções e Métodos
- **Formato**: `camelCase`
- **Iniciar com verbo**: find, create, update, delete, get, set, validate, check
- **Ser descritivo**: O nome deve indicar claramente o que a função faz

### Exemplos de Funções
```typescript
// ✅ Correto
async createEvent(data: CreateEventRequest): Promise<Either<Error, Event>> {}
async findEventById(id: string): Promise<Either<Error, Event>> {}
async updateEventStatus(id: string, status: EventStatus): Promise<Either<Error, Event>> {}
async deleteEvent(id: string): Promise<Either<Error, void>> {}
async validateEventCapacity(capacity: number): Promise<boolean> {}
async checkUserPermissions(userId: string): Promise<Permission[]> {}

// ❌ Incorreto
async event(data: CreateEventRequest) {}           // Falta verbo
async get(id: string) {}                          // Nome não descritivo
async updateEvent(id: string, data: any) {}       // Parâmetro any
async doSomething() {}                            // Nome vago
```

## Constantes e Enums

### Constantes
- **Formato**: `UPPER_SNAKE_CASE`
- **Ser descritivo**: Indicar claramente o propósito

### Exemplos de Constantes
```typescript
// ✅ Correto
const DEFAULT_PAGE_SIZE = 10;
const MAX_EVENT_CAPACITY = 1000;
const MIN_EVENT_TITLE_LENGTH = 3;
const MAX_EVENT_TITLE_LENGTH = 100;
const API_BASE_URL = 'https://api.example.com';

// ❌ Incorreto
const pageSize = 10;              // Deve ser UPPER_SNAKE_CASE
const MAX = 1000;                 // Nome não descritivo
const DEFAULT_PAGE_SIZE = 10;     // Ok
```

### Enums
- **Formato**: `PascalCase` para o nome do enum
- **Valores**: `UPPER_SNAKE_CASE` ou string literal

### Exemplos de Enums
```typescript
// ✅ Correto
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// ❌ Incorreto
export enum eventStatus {}        // Deve ser PascalCase
export enum EventStatus {
  draft = 'draft'                 // Deve ser UPPER_SNAKE_CASE
}
```

## Props e Parâmetros

### Props de Componentes (Angular)
- **Formato**: `camelCase`
- **Ser descritivo**: Indicar tipo e propósito

### Exemplos de Props
```typescript
// ✅ Correto
@Input() eventData: Event;
@Input() isEventActive: boolean;
@Input() onEventClick: (event: Event) => void;
@Input() maxCapacity: number;

// ❌ Incorreto
@Input() data: any;               // Tipo any e nome genérico
@Input() active: boolean;         // Nome não descritivo
@Input() click: Function;         // Tipo genérico
```

### Parâmetros de Função
- **Formato**: `camelCase`
- **Ser descritivo**: Indicar o que representa

### Exemplos de Parâmetros
```typescript
// ✅ Correto
async createEvent(eventData: CreateEventRequest, userId: string): Promise<Event> {}
async findEventsByDate(startDate: Date, endDate: Date): Promise<Event[]> {}
async updateEventCapacity(eventId: string, newCapacity: number): Promise<Event> {}

// ❌ Incorreto
async createEvent(data: any, id: string) {}        // Parâmetros genéricos
async findEvents(start: Date, end: Date) {}        // Nomes não descritivos
async update(id: string, capacity: number) {}      // Falta contexto
```

## Database

### Tabelas
- **Formato**: `snake_case` (minúsculas com underscore)
- **Plural**: Nome da tabela no plural

### Exemplos de Tabelas
```sql
-- ✅ Correto
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_permissions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_name VARCHAR(100) NOT NULL
);

-- ❌ Incorreto
CREATE TABLE Event {};            // Deve ser snake_case
CREATE TABLE userPermission {};   // Deve ser snake_case
```

### Colunas
- **Formato**: `snake_case` (minúsculas com underscore)
- **Ser descritivo**: Indicar claramente o conteúdo

### Exemplos de Colunas
```sql
-- ✅ Correto
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
deleted_at TIMESTAMP NULL,
event_title VARCHAR(255) NOT NULL,
max_capacity INTEGER NOT NULL,
is_active BOOLEAN DEFAULT true

-- ❌ Incorreto
createdAt TIMESTAMP,              // Deve ser snake_case
updatedAt TIMESTAMP,              // Deve ser snake_case
title VARCHAR(255),               // Nome genérico (event_title seria melhor)
max INTEGER,                      // Nome não descritivo
active BOOLEAN                    // Nome não descritivo (is_active seria melhor)
```

## URLs e Rotas

### Rotas da API
- **Formato**: `kebab-case` (minúsculas com hífen)
- **Plural**: Nome da rota no plural
- **Hierárquico**: Usar `/` para separar recursos

### Exemplos de Rotas
```typescript
// ✅ Correto
@Controller('events')
export class EventController {
  @Get()           // GET /events
  @Get(':id')      // GET /events/:id
  @Post()          // POST /events
  @Put(':id')      // PUT /events/:id
  @Delete(':id')   // DELETE /events/:id
}

@Controller('user-events')  // Para rotas aninhadas
export class UserEventController {
  @Get(':userId/events')    // GET /user-events/:userId/events
}
```

### Rotas do Frontend (Angular)
- **Formato**: `kebab-case` (minúsculas com hífen)
- **Ser descritivo**: Indicar claramente a página

### Exemplos de Rotas
```typescript
// ✅ Correto
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'events/:id/edit', component: EventEditComponent },
  { path: 'create-event', component: CreateEventComponent },
  { path: 'doc', component: DocumentationComponent }
];
```

## Environment Variables

### Variáveis de Ambiente
- **Formato**: `UPPER_SNAKE_CASE`
- **Prefixo**: Usar prefixo para agrupar (ex: `DB_`, `API_`, `JWT_`)

### Exemplos de Environment Variables
```typescript
// ✅ Correto
DATABASE_URL=postgresql://localhost:5432/nexus_events
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=nexus_events
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
API_PORT=3001
API_HOST=localhost

// ❌ Incorreto
databaseUrl=postgresql://...    // Deve ser UPPER_SNAKE_CASE
db_host=localhost              // Deve ser UPPER_SNAKE_CASE
port=3001                      // Nome não descritivo
```

---

Seguir estas convenções garante consistência e legibilidade em todo o projeto, facilitando a manutenção e colaboração entre desenvolvedores.
