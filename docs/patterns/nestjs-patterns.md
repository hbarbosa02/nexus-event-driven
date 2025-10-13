# Padrões NestJS

## Arquitetura em Camadas

### 1. Controllers (feature/)
Responsáveis por receber requisições HTTP e retornar respostas.

```typescript
// ✅ Estrutura padrão de um Controller
@Controller('events')
export class EventController extends BaseController<EventQuerySchema> {
  constructor(private readonly eventService: EventService) {
    super();
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findEvents(@Query() query: EventQuerySchema): Promise<PaginatedResult<Event>> {
    const criteria = this.parseQueryParamsToCriteria(query);
    const result = await this.eventService.findManyByCriteria(criteria);
    
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createEventSchema))
  @UseInterceptors(ClassSerializerInterceptor)
  async createEvent(@Body() data: CreateEventBodySchema): Promise<Event> {
    const result = await this.eventService.create(data);
    
    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }

    return result.value;
  }
}
```

### 2. Services (data-access/services/)
Contêm a lógica de negócio e orquestram operações.

```typescript
// ✅ Estrutura padrão de um Service
@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
  ) {}

  async create(data: CreateEventRequest): Promise<Either<Error, Event>> {
    try {
      // Validações de negócio
      if (data.capacity <= 0) {
        return left(new Error('Capacity must be greater than zero'));
      }

      const event = this.eventRepository.create({
        ...data,
        status: EventStatus.DRAFT,
      });

      const savedEvent = await this.eventRepository.save(event);
      return right(savedEvent);
    } catch (error) {
      return left(new Error('Failed to create event'));
    }
  }

  async findManyByCriteria(criteria: Criteria): Promise<Either<Error, PaginatedResult<Event>>> {
    try {
      const events = await this.eventRepository.findManyByCriteria(criteria);
      return right(events);
    } catch (error) {
      return left(new Error('Failed to fetch events'));
    }
  }
}
```

### 3. Repositories (data-access/repositories/)
Interfaces abstratas para acesso a dados.

```typescript
// ✅ Interface abstrata do Repository
export abstract class EventRepository extends BaseRepository<Event> {
  abstract findByStatus(status: EventStatus): Promise<Event[]>;
  abstract findUpcomingEvents(): Promise<Event[]>;
  abstract findByLocation(location: string): Promise<Event[]>;
}

// ✅ Implementação TypeORM
@Injectable()
export class TypeOrmEventRepository 
  extends TypeOrmBaseRepository<Event> 
  implements EventRepository {

  constructor(@InjectDataSource() repository: Repository<Event>) {
    super(repository);
  }

  async findByStatus(status: EventStatus): Promise<Event[]> {
    return this.repository.find({ where: { status } });
  }

  async findUpcomingEvents(): Promise<Event[]> {
    return this.repository
      .createQueryBuilder('event')
      .where('event.date > :now', { now: new Date() })
      .getMany();
  }

  async findByLocation(location: string): Promise<Event[]> {
    return this.repository.find({ where: { location } });
  }
}
```

## Padrões de Validação

### Zod Schemas
```typescript
// ✅ Schema de criação
export const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  date: z.date(),
  location: z.string().min(3).max(200),
  capacity: z.number().int().min(1).max(10000),
});

export type CreateEventBodySchema = z.infer<typeof createEventSchema>;

// ✅ Schema de query (com paginação)
export const eventQuerySchema = pageQueryParamSchema.extend({
  status: z.enum(['draft', 'published', 'cancelled']).optional(),
  location: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type EventQuerySchema = z.infer<typeof eventQuerySchema>;
```

### ZodValidationPipe
```typescript
// ✅ Pipe personalizado para validação Zod
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown): unknown {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw new BadRequestException('Invalid data');
    }
  }
}
```

## Padrão Either

### Implementação
```typescript
// ✅ Classes Either
export class Left<L, R> {
  constructor(public readonly value: L) {}

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }
}

export class Right<L, R> {
  constructor(public readonly value: R) {}

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }
}

export type Either<L, R> = Left<L, R> | Right<L, R>;

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
```

### Uso em Services
```typescript
// ✅ Sempre retornar Either
async findById(id: string): Promise<Either<Error, Event>> {
  try {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      return left(new ResourceNotFoundError(Resources.Event));
    }
    return right(event);
  } catch (error) {
    return left(new Error('Database error'));
  }
}
```

## Sistema Criteria

### Implementação
```typescript
// ✅ Classes do sistema Criteria
export class Criteria {
  constructor(
    public filters: Filter[] = [],
    public pagination: Pagination = new Pagination(),
    public sorts: Sort[] = []
  ) {}
}

export class Filter {
  constructor(
    public field: string,
    public operator: Operator,
    public value: unknown
  ) {}
}

export class EqualOperator extends Operator {
  constructor() {
    super('equals');
  }
}

export class Pagination {
  constructor(
    public take: number = 10,
    public skip: number = 0
  ) {}
}
```

### BaseController
```typescript
// ✅ Controller base com conversão de query params
export abstract class BaseController<QuerySchema> {
  protected parseQueryParamsToCriteria(params: QuerySchema): Criteria {
    const criteria = new Criteria();
    
    // Converter query params em filters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && key !== 'page' && key !== 'limit') {
        criteria.filters.push(new Filter(key, new EqualOperator(), value));
      }
    });

    // Configurar paginação
    if (params.page && params.limit) {
      criteria.pagination = new Pagination(
        params.limit,
        (params.page - 1) * params.limit
      );
    }

    return criteria;
  }
}
```

## Padrões de Módulo

### Módulo de Domínio
```typescript
// ✅ Estrutura padrão de um módulo
@Module({
  imports: [],
  controllers: [EventController],
  providers: [
    EventService,
    {
      provide: EventRepository,
      useClass: TypeOrmEventRepository,
    },
  ],
  exports: [EventService],
})
export class EventModule {}
```

### Módulo Global (Database)
```typescript
// ✅ Módulo global para database
@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
      entities: [EventEntity, ExampleEntity],
      synchronize: false,
      logging: ['error'],
      namingStrategy: new SnakeNamingStrategy(),
    }),
  ],
  providers: [
    {
      provide: EventRepository,
      useClass: TypeOrmEventRepository,
    },
    {
      provide: ExampleRepository,
      useClass: TypeOrmExampleRepository,
    },
  ],
  exports: [EventRepository, ExampleRepository],
})
export class DatabaseModule {}
```

## Padrões de Entity

### BaseEntity
```typescript
// ✅ Entity base com campos comuns
@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

### Entity Específica
```typescript
// ✅ Entity específica
@Entity('events')
export class EventEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 200 })
  location: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ 
    type: 'enum', 
    enum: EventStatus, 
    default: EventStatus.DRAFT 
  })
  status: EventStatus;
}
```

## Padrões de Error Handling

### Error Classes
```typescript
// ✅ Classes de erro específicas
export class ResourceNotFoundError extends Error {
  constructor(resource: Resources) {
    super(`${resource} not found`);
    this.name = 'ResourceNotFoundError';
  }
}

export class ResourceAlreadyExistsError extends Error {
  constructor(resource: Resources) {
    super(`${resource} already exists`);
    this.name = 'ResourceAlreadyExistsError';
  }
}

export enum Resources {
  Event = 'Event',
  Example = 'Example',
}
```

### Exception Filter
```typescript
// ✅ Filter global para tratamento de erros
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

## Padrões de Configuração

### Environment Configuration
```typescript
// ✅ Configuração de ambiente com validação
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.number().default(3001),
  DATABASE_URL: z.string(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.number().default(5432),
  DATABASE_NAME: z.string(),
  JWT_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;

@Injectable()
export class EnvService {
  private env: Env;

  constructor() {
    this.env = envSchema.parse(process.env);
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }
}
```

## Padrões de Teste

### Unit Tests
```typescript
// ✅ Estrutura de teste unitário
describe('EventService', () => {
  let service: EventService;
  let repository: jest.Mocked<EventRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findManyByCriteria: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repository = module.get(EventRepository);
  });

  describe('create', () => {
    it('should create event when valid data is provided', async () => {
      // Arrange
      const eventData: CreateEventRequest = {
        title: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        capacity: 100,
      };

      const expectedEvent = { ...eventData, id: 'uuid', status: EventStatus.DRAFT };
      repository.create.mockReturnValue(expectedEvent as Event);
      repository.save.mockResolvedValue(expectedEvent as Event);

      // Act
      const result = await service.create(eventData);

      // Assert
      expect(result.isRight()).toBe(true);
      expect(result.value).toEqual(expectedEvent);
      expect(repository.create).toHaveBeenCalledWith({
        ...eventData,
        status: EventStatus.DRAFT,
      });
    });
  });
});
```

---

Estes padrões garantem consistência, manutenibilidade e testabilidade no código NestJS, seguindo as melhores práticas da arquitetura hexagonal e programação funcional.
