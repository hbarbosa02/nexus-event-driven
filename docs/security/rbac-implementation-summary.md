# Resumo: Implementação de RBAC (Roles e Permissions) no Nexus Event Driven

## Visão Geral

Este documento apresenta uma estratégia completa para implementar controle de acesso baseado em papéis (RBAC - Role-Based Access Control) no sistema Nexus Event Driven, limitando o acesso a dados específicos dos usuários através de roles e permissions.

## Arquitetura de Segurança RBAC

### 1. Estrutura de Entidades

#### User Entity
```typescript
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => RoleEntity, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: RoleEntity[];
}
```

#### Role Entity
```typescript
@Entity('roles')
export class RoleEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToMany(() => UserEntity, user => user.roles)
  users: UserEntity[];

  @ManyToMany(() => PermissionEntity, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: PermissionEntity[];
}
```

#### Permission Entity
```typescript
@Entity('permissions')
export class PermissionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  resource: string; // 'events', 'users', 'reports'

  @Column({ type: 'varchar', length: 50 })
  action: string; // 'create', 'read', 'update', 'delete'

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ManyToMany(() => RoleEntity, role => role.permissions)
  roles: RoleEntity[];
}
```

### 2. Sistema de Autenticação JWT

#### Auth Service
```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(credentials: LoginRequest): Promise<Either<Error, AuthResponse>> {
    try {
      const userResult = await this.userRepository.findByEmail(credentials.email);
      if (userResult.isLeft()) {
        return left(new UnauthorizedError('Invalid credentials'));
      }

      const user = userResult.value;
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      
      if (!isPasswordValid) {
        return left(new UnauthorizedError('Invalid credentials'));
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map(role => ({
          id: role.id,
          name: role.name,
          permissions: role.permissions.map(p => ({
            resource: p.resource,
            action: p.action
          }))
        }))
      };

      const accessToken = this.jwtService.sign(payload);
      
      return right({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles
        }
      });
    } catch (error) {
      return left(new Error('Authentication failed'));
    }
  }
}
```

### 3. Guards de Autorização

#### Permissions Guard
```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    return this.hasRequiredPermissions(user.roles, requiredPermissions);
  }

  private hasRequiredPermissions(userRoles: Role[], requiredPermissions: Permission[]): boolean {
    const userPermissions = userRoles
      .flatMap(role => role.permissions)
      .map(p => `${p.resource}:${p.action}`);

    return requiredPermissions.every(required => 
      userPermissions.includes(`${required.resource}:${required.action}`)
    );
  }
}
```

#### Decorator para Permissions
```typescript
export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Uso no controller
@Controller('events')
export class EventController {
  @Get()
  @RequirePermissions({ resource: 'events', action: 'read' })
  async findEvents(@Query() query: EventQuerySchema) {
    // Implementação
  }

  @Post()
  @RequirePermissions({ resource: 'events', action: 'create' })
  async createEvent(@Body() data: CreateEventBodySchema) {
    // Implementação
  }
}
```

### 4. Filtros de Dados Baseados em Contexto

#### Context Service
```typescript
@Injectable()
export class ContextService {
  private readonly contextStore = new AsyncLocalStorage<RequestContext>();

  getContext(): RequestContext | undefined {
    return this.contextStore.getStore();
  }

  runWithContext<T>(context: RequestContext, callback: () => T): T {
    return this.contextStore.run(context, callback);
  }

  getCurrentUser(): UserContext | undefined {
    return this.getContext()?.user;
  }

  hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return user.permissions.some(p => 
      p.resource === resource && p.action === action
    );
  }
}
```

#### Data Filter Service
```typescript
@Injectable()
export class DataFilterService {
  constructor(private readonly contextService: ContextService) {}

  applyUserDataFilters<T>(query: SelectQueryBuilder<T>, entityAlias: string): SelectQueryBuilder<T> {
    const user = this.contextService.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('No user context');
    }

    // Aplicar filtros baseados no papel do usuário
    const userRoles = user.roles.map(r => r.name);

    if (userRoles.includes('ADMIN')) {
      // Admin vê todos os dados
      return query;
    }

    if (userRoles.includes('MANAGER')) {
      // Manager vê dados da sua organização
      return query.andWhere(`${entityAlias}.organizationId = :orgId`, { 
        orgId: user.organizationId 
      });
    }

    if (userRoles.includes('USER')) {
      // Usuário comum vê apenas seus próprios dados
      return query.andWhere(`${entityAlias}.createdBy = :userId`, { 
        userId: user.id 
      });
    }

    // Por padrão, não retorna nenhum dado
    return query.andWhere('1 = 0');
  }
}
```

### 5. Repository com Filtros Automáticos

#### Enhanced Base Repository
```typescript
export abstract class SecureBaseRepository<T extends BaseEntity> extends TypeOrmBaseRepository<T> {
  constructor(
    repository: Repository<T>,
    private readonly dataFilterService: DataFilterService,
    private readonly contextService: ContextService
  ) {
    super(repository);
  }

  async findManyByCriteria(criteria: Criteria): Promise<PaginatedResult<T>> {
    const queryBuilder = this.repository.createQueryBuilder(this.entityName);
    
    // Aplicar filtros de segurança automaticamente
    this.dataFilterService.applyUserDataFilters(queryBuilder, this.entityName);
    
    // Aplicar critérios normais
    this.applyCriteria(queryBuilder, criteria);
    
    const [items, total] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      total,
      page: Math.floor(criteria.pagination.skip / criteria.pagination.take) + 1,
      limit: criteria.pagination.take,
      totalPages: Math.ceil(total / criteria.pagination.take)
    };
  }

  async findById(id: string): Promise<T | null> {
    const queryBuilder = this.repository
      .createQueryBuilder(this.entityName)
      .where(`${this.entityName}.id = :id`, { id });
    
    // Aplicar filtros de segurança
    this.dataFilterService.applyUserDataFilters(queryBuilder, this.entityName);
    
    return queryBuilder.getOne();
  }
}
```

### 6. Middleware de Contexto

#### Context Middleware
```typescript
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly contextService: ContextService,
    private readonly userRepository: UserRepository
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        const userResult = await this.userRepository.findByIdWithRoles(payload.sub);
        
        if (userResult.isRight()) {
          const user = userResult.value;
          const context: RequestContext = {
            user: {
              id: user.id,
              email: user.email,
              organizationId: user.organizationId,
              roles: user.roles,
              permissions: user.roles.flatMap(r => r.permissions)
            },
            requestId: req.headers['x-request-id'] as string || crypto.randomUUID()
          };

          return this.contextService.runWithContext(context, () => next());
        }
      } catch (error) {
        // Token inválido, continua sem contexto
      }
    }
    
    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### 7. Schemas de Validação com RBAC

#### User Management Schemas
```typescript
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
  roleIds: z.array(z.string().uuid()).optional()
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid()
});

export const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
  permissionIds: z.array(z.string().uuid())
});
```

### 8. Auditoria e Logging

#### Audit Service
```typescript
@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logAction(action: AuditAction): Promise<void> {
    const context = this.contextService.getCurrentUser();
    
    const auditLog = {
      userId: context?.id,
      action: action.type,
      resource: action.resource,
      resourceId: action.resourceId,
      details: action.details,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      timestamp: new Date()
    };

    await this.auditRepository.create(auditLog);
  }
}

// Decorator para auditoria automática
export const Audit = (resource: string, action: string) =>
  SetMetadata('audit', { resource, action });
```

## Implementação por Etapas

### Fase 1: Estrutura Base (Semana 1-2)
1. **Criar entidades**: User, Role, Permission
2. **Implementar autenticação JWT**
3. **Configurar guards básicos**
4. **Testes unitários das entidades**

### Fase 2: Sistema de Permissões (Semana 3-4)
1. **Implementar PermissionsGuard**
2. **Criar decorators para controle de acesso**
3. **Desenvolver sistema de contexto**
4. **Testes de integração dos guards**

### Fase 3: Filtros de Dados (Semana 5-6)
1. **Implementar DataFilterService**
2. **Atualizar repositories com filtros automáticos**
3. **Criar middleware de contexto**
4. **Testes end-to-end do sistema completo**

### Fase 4: Auditoria e Monitoramento (Semana 7-8)
1. **Implementar sistema de auditoria**
2. **Adicionar logging de segurança**
3. **Criar dashboards de monitoramento**
4. **Documentação completa**

## Configuração de Roles Padrão

### Roles Iniciais
```typescript
// Seed data para roles e permissions
const defaultRoles = [
  {
    name: 'SUPER_ADMIN',
    description: 'Acesso total ao sistema',
    permissions: ['*:*'] // Todas as permissões
  },
  {
    name: 'ADMIN',
    description: 'Administrador organizacional',
    permissions: [
      'users:read', 'users:create', 'users:update',
      'events:*', 'reports:read'
    ]
  },
  {
    name: 'MANAGER',
    description: 'Gerente de eventos',
    permissions: [
      'events:read', 'events:create', 'events:update',
      'reports:read'
    ]
  },
  {
    name: 'USER',
    description: 'Usuário padrão',
    permissions: [
      'events:read', 'profile:update'
    ]
  }
];
```

## Benefícios da Implementação

### Segurança
- **Controle granular**: Permissões específicas por recurso e ação
- **Isolamento de dados**: Usuários veem apenas dados autorizados
- **Auditoria completa**: Log de todas as ações sensíveis
- **Prevenção de escalação**: Validação rigorosa de privilégios

### Manutenibilidade
- **Arquitetura modular**: Componentes independentes e testáveis
- **Padrões consistentes**: Uso dos padrões estabelecidos do projeto
- **Configuração flexível**: Roles e permissions configuráveis
- **Integração transparente**: Funciona com a arquitetura existente

### Performance
- **Filtros automáticos**: Aplicados no nível do banco de dados
- **Cache de permissões**: Permissões carregadas no JWT
- **Queries otimizadas**: Uso eficiente de índices
- **Lazy loading**: Carregamento sob demanda de dados relacionados

## Considerações de Segurança

### Boas Práticas
1. **Princípio do menor privilégio**: Usuários recebem apenas permissões necessárias
2. **Validação dupla**: Verificação no frontend e backend
3. **Tokens com expiração**: JWT com tempo de vida limitado
4. **Refresh tokens**: Renovação segura de tokens
5. **Rate limiting**: Proteção contra ataques de força bruta

### Monitoramento
1. **Alertas de segurança**: Notificações para ações suspeitas
2. **Métricas de acesso**: Dashboards de uso do sistema
3. **Logs estruturados**: Facilitam análise e investigação
4. **Backup de auditoria**: Preservação de logs críticos

Este sistema RBAC fornece uma base sólida e escalável para controle de acesso no Nexus Event Driven, garantindo que os dados dos usuários sejam protegidos através de um sistema robusto de roles e permissions.