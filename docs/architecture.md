# Arquitetura do Sistema

## Visão Geral

O **Nexus Event Driven** é um sistema de gerenciamento de eventos nativos do Node.js construído com uma arquitetura moderna e escalável, utilizando NestJS no backend e Angular v20.2 no frontend.

## Arquitetura Monorepo

```
nexus-event-driven/
├── apps/
│   ├── api/                    # Backend NestJS
│   └── web/                    # Frontend Angular
├── docs/                       # Documentação técnica
├── .cursor/rules/              # Padrões e convenções
├── package.json                # Configuração do monorepo
└── README.md
```

## Backend (NestJS)

### Estrutura Modular

O backend segue uma arquitetura modular baseada em domínios:

```
apps/api/src/
├── event/                      # Módulo de eventos nativos
├── example/                    # Módulo de exemplo
├── shared/                     # Código compartilhado
├── database/                   # Configuração de banco
├── env/                        # Configuração de ambiente
├── app.module.ts               # Módulo principal
└── main.ts                     # Bootstrap da aplicação
```

### Estrutura Padrão de um Módulo

Cada módulo de domínio segue a estrutura:

```
[nome-modulo]/
├── data-access/
│   ├── repositories/       # Interface abstrata do repositório
│   │   └── [entidade].repository.ts
│   └── services/           # Lógica de negócio
│       └── [entidade].service.ts
├── feature/
│   ├── schemas/            # Schemas Zod para validação
│   │   └── [entidade].schema.ts
│   ├── [entidade].controller.ts
│   └── [entidade].module.ts
└── util/
    ├── types/              # Tipos TypeScript específicos
    │   └── [entidade].type.ts
    └── enums/              # Enums específicos (opcional)
```

### Padrões Arquiteturais

#### 1. Hexagonal Architecture
- **Controllers**: Camada de apresentação (HTTP)
- **Services**: Camada de aplicação (lógica de negócio)
- **Repositories**: Camada de infraestrutura (acesso a dados)

#### 2. Either Pattern
Tratamento funcional de erros usando o padrão Either:
```typescript
// Sucesso
return right(data);

// Erro
return left(new Error('Something went wrong'));
```

#### 3. Criteria System
Sistema flexível para queries complexas:
```typescript
const criteria = new Criteria([
  new Filter('status', new EqualOperator(), 'pending'),
  new Filter('retryCount', new LessThanOperator(), 5)
], new Pagination(10, 0));
```

#### 4. Base Classes
- **BaseController**: Para paginação e conversão de query params
- **BaseRepository**: Interface comum para repositórios
- **BaseEntity**: Entidades com campos comuns (id, timestamps)

## Camadas e Responsabilidades

### 1. Controllers (feature/)
- **Localização**: `src/[modulo]/feature/[nome].controller.ts`
- **Responsabilidades**:
  - Definir rotas HTTP
  - Validar entrada com `ZodValidationPipe`
  - Converter query params em `Criteria` usando `BaseController`
  - Chamar services
  - Mapear erros para exceções HTTP
  - Usar `ClassSerializerInterceptor` para serialização
- **Padrão de Nomenclatura**: `[Entidade]Controller`
- **Herança**: Extende `BaseController<QuerySchema>` para queries paginadas
- **Decorators**: `@Controller('rota')`, `@Get()`, `@Post()`, `@Put()`, `@Delete()`

### 2. Services (data-access/services/)
- **Localização**: `src/[modulo]/data-access/services/[nome].service.ts`
- **Responsabilidades**:
  - Lógica de negócio
  - Validações de domínio
  - Orquestração entre repositórios
  - Retornar `Either<Error, Success>` para tratamento de erros funcionais
- **Padrão de Nomenclatura**: `[Entidade]Service`
- **Decorator**: `@Injectable()`
- **Padrão de Retorno**: Sempre usa `Either` com `left(error)` ou `right(data)`

### 3. Repositories (data-access/repositories/)
- **Localização Abstrata**: `src/[modulo]/data-access/repositories/[entidade].repository.ts`
- **Localização Implementação**: `src/database/feature/repositories/typeorm-[entidade].repository.ts`
- **Responsabilidades**:
  - Acesso a dados
  - Queries customizadas
  - Abstração do TypeORM
- **Padrão**:
  - Interface abstrata: `export abstract class [Entidade]Repository extends BaseRepository<Entidade>`
  - Implementação: `export class TypeOrm[Entidade]Repository extends TypeOrmBaseRepository<Entidade> implements [Entidade]Repository`
- **Registro**: No `DatabaseModule` com padrão `{ provide: [Entidade]Repository, useClass: TypeOrm[Entidade]Repository }`

### 4. Entities (database/feature/entities/)
- **Localização**: `src/database/feature/entities/[nome].entity.ts`
- **Responsabilidades**:
  - Definição do modelo de dados
  - Mapeamento ORM com TypeORM
- **Padrão**: Todas extendem `BaseEntity` que fornece:
  - `id: string` (UUID)
  - `createdAt: Date`
  - `updatedAt: Date`
  - `deletedAt: Date | null`
  - `createdBy`, `updatedBy`, `deletedBy` (relações com User)
- **Decorators**: `@Entity('nome_tabela')`, `@Column()`, `@ManyToOne()`, etc.
- **Export**: Todas exportadas em `src/database/feature/entities/index.ts`

### 5. Schemas (feature/schemas/)
- **Localização**: `src/[modulo]/feature/schemas/[nome].schema.ts`
- **Framework**: Zod
- **Responsabilidades**:
  - Validação de entrada (DTOs)
  - Schemas de query params
  - Type inference para TypeScript
- **Padrões**:
  - Query schema: Extende `pageQueryParamSchema` para paginação
  - Create schema: `create[Entidade]BodySchema`
  - Update schema: `update[Entidade]BodySchema` (geralmente partial)
  - Types inferidos: `export type Create[Entidade]BodySchema = z.infer<typeof create[Entidade]BodySchema>`

### 6. Types (util/types/)
- **Localização**: `src/[modulo]/util/types/[nome].type.ts`
- **Responsabilidades**:
  - Tipos de requisição e resposta dos services
  - Usar `Either` para respostas com possíveis erros
- **Padrões**:
  - Request: `[Acao][Entidade]Request`
  - Response: `[Acao][Entidade]Response = Either<ErrorType, SuccessData>`

## Base Classes e Utilidades

### BaseController
- **Localização**: `src/shared/feature/base.controller.ts`
- **Método Principal**: `parseQueryParamsToCriteria(params)` - Converte query params em objeto `Criteria`
- **Operadores Suportados**: equals, notEquals, contains, like, in, between, isNull, greaterThan, lessThan, startsWith, etc.
- **Formato Query**: Objetos aninhados com operadores (ex: `{ name: { contains: "john" } }`)

### BaseRepository
- **Localização Abstrata**: `src/shared/data-access/repositories/base.repository.ts`
- **Métodos Obrigatórios**:
  - `findById(id)`, `findOne(params)`, `findBy(params)`
  - `findManyByCriteria(criteria)` - Aceita objeto Criteria
  - `findMany(params)`, `findAll()`
  - `create(entity)`, `save(entity)`, `saveMany(entities)`
  - `delete(entity)`, `count()`

### TypeOrmBaseRepository
- **Localização**: `src/database/feature/repositories/typeorm-base.repository.ts`
- **Implementa**: Todos os métodos de `BaseRepository`
- **Usa**: `TypeOrmCriteriaConverter` para converter `Criteria` em `FindOptions` do TypeORM
- **Constructor**: Recebe `Repository<T>` injetado via `@InjectDataSource()`

### Either Pattern
- **Localização**: `src/shared/util/types/either.ts`
- **Uso**: Tratamento funcional de erros
- **Classes**: `Left<L, R>` (erro), `Right<L, R>` (sucesso)
- **Helpers**: `left(value)`, `right(value)`
- **Checagem**: `result.isLeft()`, `result.isRight()`

### Criteria System
- **Localização**: `src/shared/util/types/criteria/`
- **Classes**:
  - `Criteria` - Objeto que agrupa filters, pagination, sorts
  - `Filter` - Campo + Operador
  - `Operator` - Classes de operadores (EqualOperator, LikeOperator, etc.)
  - `Pagination` - Take e skip
- **Conversão**: `TypeOrmCriteriaConverter` converte para `FindOptions` do TypeORM

## DatabaseModule (Global)

- **Localização**: `src/database/feature/database.module.ts`
- **Decorator**: `@Global()`
- **Configuração TypeORM**:
  - Naming Strategy: `SnakeNamingStrategy` (camelCase → snake_case)
  - Synchronize: false (usa migrations)
  - Logging: file ('ormlogs.log')
- **Providers**: Todos os repositórios (Interface → Implementação)
- **Exports**: Todas as interfaces de repositórios

## Frontend (Angular v20.2)

### Estrutura Modular

```
apps/web/src/app/
├── core/                       # Serviços singleton
├── shared/                     # Componentes compartilhados
├── features/                   # Módulos de funcionalidades
│   ├── events/                 # Módulo de eventos
│   └── examples/               # Módulo de exemplos
├── pages/                      # Páginas principais
│   ├── home/                   # Página inicial
│   └── doc/                    # Documentação
├── layouts/                    # Layouts da aplicação
└── environments/               # Configurações de ambiente
```

### Padrões Frontend

#### 1. Standalone Components
Componentes independentes que não dependem de NgModules:
```typescript
@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  template: `...`
})
```

#### 2. Feature Modules
Organização por funcionalidades com lazy loading:
```typescript
{
  path: 'events',
  loadChildren: () => import('./features/events/events.routes')
}
```

#### 3. Service Layer
Serviços para comunicação HTTP e gerenciamento de estado:
```typescript
@Injectable({ providedIn: 'root' })
export class EventService {
  getEvents(): Observable<PaginatedResult<Event>> { ... }
}
```

## Event Module - Funcionalidades

### Gerenciamento de Eventos Nativos

O módulo Event gerencia eventos nativos do Node.js (EventEmitter):

#### Entidade Event
```typescript
interface Event {
  id: string;
  name: string;                 // Nome do evento
  startTime: Date | null;       // Início da execução
  endTime: Date | null;         // Fim da execução
  data: Record<string, any>;    // Dados do evento
  status: EventStatus;          // Status atual
  retryCount: number;           // Contador de tentativas
  error: string | null;         // Erro ocorrido
  cancellationReason: string;   // Motivo do cancelamento
}
```

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

### API Endpoints

```
GET    /api/events              # Listar eventos com paginação
GET    /api/events/:id          # Buscar evento por ID
POST   /api/events              # Criar novo evento
PUT    /api/events/:id          # Atualizar evento
DELETE /api/events/:id          # Deletar evento
POST   /api/events/:id/retry    # Retry de evento
```

## Database

### PostgreSQL + TypeORM

- **ORM**: TypeORM com decorators
- **Naming Strategy**: Snake case para tabelas e colunas
- **Migrations**: Controle de versão do schema
- **Soft Delete**: Exclusão lógica com `deletedAt`

### Configuração
```typescript
{
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  entities: [EventEntity, ExampleEntity],
  synchronize: false,  // Usar migrations
  namingStrategy: new SnakeNamingStrategy(),
}
```

## Validação e Segurança

### Zod Schemas
Validação robusta com schemas Zod:
```typescript
const createEventSchema = z.object({
  name: z.string().min(1).max(255),
  data: z.record(z.any()).optional(),
});
```

### CORS e Headers
- CORS configurado para desenvolvimento
- Headers de segurança com Helmet
- Validação de entrada em todas as rotas

## Documentação Integrada

### Sistema de Documentação
- Documentação acessível via `/doc` no frontend
- Navegação lateral intuitiva
- Suporte a Markdown com `ngx-markdown`
- Busca de conteúdo

### Estrutura de Docs
```
docs/
├── README.md                   # Índice principal
├── architecture.md             # Esta documentação
├── api/                        # Docs da API
├── web/                        # Docs do frontend
└── development.md              # Guia de desenvolvimento
```

## Fluxo de Execução

### 1. Criação de Evento
1. Cliente faz POST para `/api/events`
2. Controller valida entrada com Zod
3. Service cria entidade Event com status PENDING
4. EventEmitter emite o evento nativo
5. Retorna evento criado

### 2. Execução e Retry
1. EventEmitter executa evento nativo
2. Em caso de sucesso: status → SUCCESS
3. Em caso de erro: status → ERROR, incrementa retryCount
4. Se retryCount < 5: permite retry manual
5. Se retryCount >= 5: status → CANCELLED

### 3. Monitoramento
1. Frontend consulta eventos via API
2. Exibe status, contadores e histórico
3. Permite retry manual de eventos com erro
4. Log completo de erros e cancelamentos

## Escalabilidade

### Backend
- Arquitetura modular permite fácil adição de módulos
- Padrões consistentes facilitam manutenção
- TypeORM permite migração para outros bancos
- Either pattern garante tratamento robusto de erros

### Frontend
- Standalone components facilitam reutilização
- Lazy loading otimiza performance
- Service layer centraliza lógica de negócio
- Estrutura modular permite crescimento

## Regras de Implementação

### Services
1. Sempre retornar `Either<Error, Data>`
2. Usar `left()` para erros, `right()` para sucesso
3. Validar regras de negócio antes de persistir
4. Injetar repositórios via constructor
5. Métodos públicos devem ter type hints completos

### Controllers
1. Extender `BaseController` para endpoints com paginação
2. Usar `ZodValidationPipe` para validação de entrada
3. Mapear erros de Either para exceções HTTP
4. Usar `ClassSerializerInterceptor` para remover campos sensíveis
5. Nomear rotas no plural (ex: `/users`, `/materials`)

### Repositories
1. Interface abstrata no módulo de domínio
2. Implementação TypeORM em `database/feature/repositories/`
3. Override métodos de `TypeOrmBaseRepository` quando precisar customizar
4. Sempre incluir relations necessárias em queries

### Entities
1. Sempre extender `BaseEntity`
2. Usar `@Exclude()` de `class-transformer` para campos sensíveis
3. Definir cascade operations quando apropriado
4. Usar naming strategy padrão (snake_case no DB)

### Schemas
1. Usar Zod para todos os DTOs
2. Queries paginadas devem extender `pageQueryParamSchema`
3. Update schemas geralmente são `.partial()` do create schema
4. Sempre exportar tipos inferidos

## Dependências Principais

### Core
- `@nestjs/common`, `@nestjs/core` - Framework base
- `@nestjs/config` - Configuração com validação Zod
- `@nestjs/typeorm` - Integração TypeORM
- `typeorm` - ORM
- `pg` - Driver PostgreSQL

### Validação
- `zod` - Validação de schemas
- `class-validator` - Validação de classes (secundário)
- `class-transformer` - Transformação e serialização

### Autenticação
- `@nestjs/passport`, `@nestjs/jwt`
- `passport-jwt` - Estratégia JWT
- `bcryptjs` - Hashing de senhas

### Utilidades
- `date-fns` - Manipulação de datas
- `pluralize` - Pluralização de nomes
- `sharp` - Processamento de imagens

## Fluxo de uma Requisição

1. **Middleware**: `ContextMiddleware` extrai JWT e popula contexto
2. **Guard**: `ActiveTenantGuard` valida tenant
3. **Guard**: `PermissionsGuard` valida permissões (se aplicável)
4. **Controller**: Recebe requisição e valida com Zod
5. **Controller**: Converte query params em Criteria (se GET com paginação)
6. **Service**: Executa lógica de negócio
7. **Repository**: Acessa dados via TypeORM
8. **Service**: Retorna Either com resultado ou erro
9. **Controller**: Mapeia Either para resposta HTTP
10. **Interceptor**: `ClassSerializerInterceptor` serializa resposta

## Testes

### Estrutura
- **Unit Tests**: `*.spec.ts` junto aos arquivos
- **E2E Tests**: `test/*.e2e-spec.ts`
- **Framework**: Jest
- **Coverage**: `npm run test:cov`

### Convenções
- **Arrange-Act-Assert** para testes unitários
- **Given-When-Then** para testes de aceitação
- Nomear variáveis: `inputX`, `mockX`, `actualX`, `expectedX`

## Próximos Passos

1. **Autenticação**: JWT com Passport
2. **Cache**: Redis para queries frequentes
3. **Queue**: Bull/BullMQ para processamento assíncrono
4. **Monitoring**: Prometheus + Grafana
5. **Testing**: Cobertura completa de testes
6. **CI/CD**: Pipeline automatizado

---

Esta arquitetura garante um sistema robusto, escalável e maintível, seguindo as melhores práticas de desenvolvimento moderno.
