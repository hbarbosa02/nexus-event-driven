# Guia de Desenvolvimento

## Visão Geral

Este guia estabelece os padrões e convenções para desenvolvimento no projeto **Nexus Event Driven**.

## Padrões de Código

### TypeScript
- **Strict Mode**: Sempre habilitado
- **Path Aliases**: Use `@/` para imports absolutos
- **Tipos Explícitos**: Evite `any`, use tipos específicos
- **Interfaces**: Prefira interfaces para objetos extensíveis

### ESLint
```json
{
  "extends": ["@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error",
    "no-unused-vars": "off",
    "no-inline-comments": "error",
    "no-warning-comments": ["error", {
      "terms": ["todo", "fixme", "hack"],
      "location": "anywhere"
    }],
    "spaced-comment": ["error", "always", {
      "markers": ["/"],
      "exceptions": ["*", "-", "+"]
    }]
  }
}
```

#### Política de Comentários
- **Proibidos**: Comentários inline (`// comentário`) e comentários de TODO/FIXME
- **Permitidos**: JSDoc para APIs públicas que necessitam documentação técnica
- **Documentação**: Use arquivos apropriados em `/docs` quando necessário
- **Diretivas ESLint**: `// eslint-disable-next-line` ainda funciona quando absolutamente necessário

### Prettier
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

## Convenções de Nomenclatura

### Arquivos e Diretórios
- **Formato**: `kebab-case`
- **Exemplos**: `event.service.ts`, `event-list.component.ts`

### Classes
- **Formato**: `PascalCase`
- **Sufixos**: `Controller`, `Service`, `Repository`, `Entity`

### Variáveis e Funções
- **Formato**: `camelCase`
- **Booleanos**: `is`, `has`, `can`, `should`
- **Funções**: Verbo descritivo (`create`, `find`, `update`, `delete`)

### Constantes
- **Formato**: `UPPER_SNAKE_CASE`
- **Exemplos**: `DEFAULT_PAGE_SIZE`, `MAX_RETRY_COUNT`

## Estrutura de Pastas

### Backend (NestJS)
```
[nome-modulo]/
├── data-access/
│   ├── repositories/          # Interfaces abstratas
│   └── services/              # Lógica de negócio
├── feature/
│   ├── schemas/               # Validação Zod
│   ├── [nome].controller.ts   # Controller REST
│   └── [nome].module.ts       # Módulo NestJS
└── util/types/                # Tipos específicos
```

### Frontend (Angular)
```
[feature]/
├── components/                # Componentes específicos
├── services/                  # Serviços específicos
├── models/                    # Interfaces e tipos
└── [feature].routes.ts        # Rotas do módulo
```

## Padrões Arquiteturais

### Either Pattern
```typescript
// ✅ Sempre use Either para operações que podem falhar
async createEvent(data: CreateEventRequest): Promise<Either<Error, Event>> {
  try {
    const event = await this.eventRepository.create(data);
    return right(event);
  } catch (error) {
    return left(new Error('Failed to create event'));
  }
}

// ✅ Use left() para erros, right() para sucesso
const result = await this.eventService.createEvent(eventData);
if (result.isLeft()) {
  const error = result.value;
  throw new BadRequestException(error.message);
}
```

### Criteria System
```typescript
// ✅ Use Criteria para queries complexas
const criteria = new Criteria([
  new Filter('status', new EqualOperator(), 'pending'),
  new Filter('retryCount', new LessThanOperator(), 5)
], new Pagination(10, 0));

const result = await this.eventRepository.findManyByCriteria(criteria);
```

### Base Classes
```typescript
// ✅ Controllers estendem BaseController
export class EventController extends BaseController<EventQuerySchema> {
  constructor(private readonly eventService: EventService) {
    super();
  }
}

// ✅ Repositories estendem BaseRepository
export abstract class EventRepository extends BaseRepository<EventEntity> {
  abstract findByStatus(status: EventStatus): Promise<EventEntity[]>;
}
```

## Validação

### Zod Schemas
```typescript
// ✅ Defina schemas Zod para validação
export const createEventSchema = z.object({
  name: z.string().min(1).max(255),
  data: z.record(z.any()).optional(),
});

export type CreateEventBodySchema = z.infer<typeof createEventSchema>;

// ✅ Use ZodValidationPipe
@Post()
@UsePipes(new ZodValidationPipe(createEventSchema))
async createEvent(@Body() data: CreateEventBodySchema): Promise<Event> {
  // Implementation
}
```

### Angular Reactive Forms
```typescript
// ✅ Use Reactive Forms com validação
export class EventFormComponent {
  eventForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.maxLength(500)]],
    capacity: [1, [Validators.required, Validators.min(1)]]
  });
}
```

## Tratamento de Erros

### Backend
```typescript
// ✅ Mapeie Either errors para HTTP exceptions
if (result.isLeft()) {
  const error = result.value;
  switch (error.constructor) {
    case ResourceNotFoundError:
      throw new NotFoundException(error.message);
    case ResourceAlreadyExistsError:
      throw new ConflictException(error.message);
    default:
      throw new BadRequestException(error.message);
  }
}
```

### Frontend
```typescript
// ✅ Use catchError para tratar erros HTTP
this.eventService.getEvents().pipe(
  catchError((error: HttpErrorResponse) => {
    console.error('Error loading events:', error);
    this.error = 'Failed to load events';
    return throwError(() => error);
  })
).subscribe();
```

## Testes

### Estrutura AAA
```typescript
describe('EventService', () => {
  it('should create event when valid data is provided', async () => {
    // Arrange
    const eventData: CreateEventRequest = {
      name: 'Test Event',
      data: { userId: 123 }
    };

    // Act
    const result = await eventService.create(eventData);

    // Assert
    expect(result.isRight()).toBe(true);
    expect(result.value.name).toBe(eventData.name);
  });
});
```

### Nomenclatura de Testes
- **Unit Tests**: `*.spec.ts`
- **E2E Tests**: `*.e2e-spec.ts`
- **Descrição**: "should [expected behavior] when [condition]"

## Documentação

### JSDoc
```typescript
/**
 * Creates a new event with the provided data
 * @param data - Event creation data
 * @returns Either containing the created event or an error
 * @throws BadRequestException when validation fails
 */
async createEvent(data: CreateEventRequest): Promise<Either<Error, Event>> {
  // Implementation
}
```

### README
- Atualize README.md para mudanças significativas
- Documente novos endpoints e funcionalidades
- Inclua exemplos de uso

## Git Workflow

### Commits
```
feat: add event retry functionality
fix: resolve pagination issue in event list
docs: update API documentation
refactor: improve error handling in EventService
test: add unit tests for EventController
```

### Branches
- `main`: Branch principal
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `docs/*`: Atualizações de documentação

### Pull Requests
- Título descritivo
- Descrição detalhada das mudanças
- Testes incluídos
- Documentação atualizada

## Performance

### Backend
- Use paginação para listagens
- Implemente cache quando apropriado
- Otimize queries do banco
- Use lazy loading para relações opcionais

### Frontend
- Lazy loading para módulos
- OnPush change detection
- TrackBy functions para *ngFor
- Otimize bundle size

## Segurança

### Backend
- Valide todas as entradas
- Use HTTPS em produção
- Implemente rate limiting
- Sanitize dados de saída

### Frontend
- Sanitize dados do usuário
- Use Content Security Policy
- Valide dados no cliente
- Não exponha informações sensíveis

## Monitoramento

### Logs
```typescript
// ✅ Use logs estruturados
logger.log('Event created', {
  eventId: event.id,
  eventName: event.name,
  userId: context.userId
});
```

### Métricas
- Tempo de resposta das APIs
- Taxa de erro por endpoint
- Uso de recursos do sistema
- Performance do frontend

## Deploy

### Ambiente de Desenvolvimento
```bash
npm run dev  # Executa API e WEB simultaneamente
```

### Docker (Desenvolvimento)
```bash
# Subir containers
npm run docker:up

# Logs (API/WEB/DB)
npm run docker:logs:api
npm run docker:logs:web
npm run docker:logs:db

# Parar
npm run docker:down

# Reset do banco
npm run docker:reset:db

# Executar migrations dentro do container da API
npm run docker:migrate
```

### Ambiente de Produção
```bash
# Build
npm run build

# Deploy
npm run start:prod
```

### Healthchecks no Docker
- API: verifica `GET /api/health` automaticamente.
- WEB: verifica a raiz `GET /` do dev server Angular.

## Ferramentas Recomendadas

### VS Code Extensions
- TypeScript Importer
- Angular Language Service
- ESLint
- Prettier
- GitLens

### Debugging
- Chrome DevTools
- Angular DevTools
- VS Code Debugger
- Postman/Insomnia

## Checklist de Desenvolvimento

### Antes de Commitar
- [ ] Código compila sem erros
- [ ] Testes passando
- [ ] ESLint sem erros
- [ ] Prettier formatado
- [ ] Documentação atualizada

### Antes de Fazer PR
- [ ] Funcionalidade testada
- [ ] Testes unitários incluídos
- [ ] Documentação atualizada
- [ ] Breaking changes documentados
- [ ] Performance considerada

### Antes de Fazer Deploy
- [ ] Todos os testes passando
- [ ] Build de produção funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco realizado
- [ ] Rollback plan definido

---

Seguir estes padrões garante código limpo, manutenível e consistente em todo o projeto.
