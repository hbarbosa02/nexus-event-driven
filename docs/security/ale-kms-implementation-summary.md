# Resumo: Implementação de ALE com AWS KMS e DEK no Nexus Event Driven

## Visão Geral

Este documento apresenta uma estratégia completa para implementar Application Layer Encryption (ALE) utilizando AWS Key Management Service (KMS) e Data Encryption Keys (DEK) no sistema Nexus Event Driven, garantindo que dados sensíveis sejam criptografados antes de serem armazenados no banco de dados e descriptografados após a recuperação.

## Arquitetura de Criptografia ALE

### 1. Conceitos Fundamentais

#### Application Layer Encryption (ALE)
- **Definição**: Criptografia aplicada na camada da aplicação, antes dos dados chegarem ao banco
- **Benefício**: Dados permanecem criptografados mesmo se o banco for comprometido
- **Transparência**: Aplicação gerencia criptografia/descriptografia automaticamente

#### AWS KMS (Key Management Service)
- **Customer Master Key (CMK)**: Chave principal gerenciada pela AWS
- **Data Encryption Key (DEK)**: Chave gerada pelo KMS para criptografar dados
- **Envelope Encryption**: Padrão onde DEK criptografa dados e CMK criptografa DEK

### 2. Estrutura de Serviços de Criptografia

#### KMS Service
```typescript
@Injectable()
export class KmsService {
  private readonly kmsClient: KMSClient;
  private readonly cmkId: string;

  constructor(private readonly envService: EnvService) {
    this.kmsClient = new KMSClient({
      region: this.envService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.cmkId = this.envService.get('AWS_KMS_CMK_ID');
  }

  async generateDataKey(): Promise<Either<Error, DataKeyPair>> {
    try {
      const command = new GenerateDataKeyCommand({
        KeyId: this.cmkId,
        KeySpec: 'AES_256',
      });

      const response = await this.kmsClient.send(command);

      if (!response.Plaintext || !response.CiphertextBlob) {
        return left(new Error('Failed to generate data key'));
      }

      return right({
        plaintextKey: Buffer.from(response.Plaintext),
        encryptedKey: Buffer.from(response.CiphertextBlob),
      });
    } catch (error) {
      return left(new Error(`KMS error: ${error.message}`));
    }
  }

  async decryptDataKey(encryptedKey: Buffer): Promise<Either<Error, Buffer>> {
    try {
      const command = new DecryptCommand({
        CiphertextBlob: encryptedKey,
      });

      const response = await this.kmsClient.send(command);

      if (!response.Plaintext) {
        return left(new Error('Failed to decrypt data key'));
      }

      return right(Buffer.from(response.Plaintext));
    } catch (error) {
      return left(new Error(`KMS decrypt error: ${error.message}`));
    }
  }
}
```

#### Encryption Service
```typescript
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyCache = new Map<string, Buffer>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly kmsService: KmsService,
    private readonly contextService: ContextService
  ) {}

  async encryptField(plaintext: string, context?: EncryptionContext): Promise<Either<Error, EncryptedField>> {
    try {
      // Gerar nova DEK para cada campo sensível
      const dataKeyResult = await this.kmsService.generateDataKey();
      if (dataKeyResult.isLeft()) {
        return left(dataKeyResult.value);
      }

      const { plaintextKey, encryptedKey } = dataKeyResult.value;

      // Gerar IV aleatório
      const iv = crypto.randomBytes(16);

      // Criar cipher
      const cipher = crypto.createCipher(this.algorithm, plaintextKey);
      cipher.setAAD(this.buildAAD(context));

      // Criptografar dados
      let encrypted = cipher.update(plaintext, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      // Obter tag de autenticação
      const authTag = cipher.getAuthTag();

      return right({
        encryptedData: encrypted.toString('base64'),
        encryptedKey: encryptedKey.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        algorithm: this.algorithm,
        keyId: this.kmsService.cmkId,
        context: context || {},
      });
    } catch (error) {
      return left(new Error(`Encryption failed: ${error.message}`));
    }
  }

  async decryptField(encryptedField: EncryptedField, context?: EncryptionContext): Promise<Either<Error, string>> {
    try {
      // Verificar contexto de descriptografia
      if (!this.validateContext(encryptedField.context, context)) {
        return left(new Error('Invalid decryption context'));
      }

      // Descriptografar DEK
      const encryptedKeyBuffer = Buffer.from(encryptedField.encryptedKey, 'base64');
      const plaintextKeyResult = await this.kmsService.decryptDataKey(encryptedKeyBuffer);
      
      if (plaintextKeyResult.isLeft()) {
        return left(plaintextKeyResult.value);
      }

      const plaintextKey = plaintextKeyResult.value;

      // Preparar dados para descriptografia
      const iv = Buffer.from(encryptedField.iv, 'base64');
      const authTag = Buffer.from(encryptedField.authTag, 'base64');
      const encryptedData = Buffer.from(encryptedField.encryptedData, 'base64');

      // Criar decipher
      const decipher = crypto.createDecipher(encryptedField.algorithm, plaintextKey);
      decipher.setAuthTag(authTag);
      decipher.setAAD(this.buildAAD(context));

      // Descriptografar dados
      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return right(decrypted.toString('utf8'));
    } catch (error) {
      return left(new Error(`Decryption failed: ${error.message}`));
    }
  }

  private buildAAD(context?: EncryptionContext): Buffer {
    const aadData = {
      userId: context?.userId || 'anonymous',
      timestamp: context?.timestamp || new Date().toISOString(),
      purpose: context?.purpose || 'data_encryption',
    };
    return Buffer.from(JSON.stringify(aadData), 'utf8');
  }

  private validateContext(storedContext: any, providedContext?: EncryptionContext): boolean {
    if (!providedContext) return true;
    
    return storedContext.userId === providedContext.userId &&
           storedContext.purpose === providedContext.purpose;
  }
}
```

### 3. Entidades com Campos Criptografados

#### Encrypted Field Type
```typescript
export interface EncryptedField {
  encryptedData: string;      // Dados criptografados (base64)
  encryptedKey: string;       // DEK criptografada pelo CMK (base64)
  iv: string;                 // Initialization Vector (base64)
  authTag: string;            // Tag de autenticação (base64)
  algorithm: string;          // Algoritmo usado
  keyId: string;              // ID da CMK no KMS
  context: Record<string, any>; // Contexto de criptografia
}

export interface EncryptionContext {
  userId?: string;
  purpose?: string;
  timestamp?: string;
  organizationId?: string;
}
```

#### User Entity com Dados Sensíveis
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

  // Campo sensível - CPF criptografado
  @Column({ type: 'jsonb', nullable: true })
  @Exclude()
  encryptedCpf: EncryptedField | null;

  // Campo sensível - Telefone criptografado
  @Column({ type: 'jsonb', nullable: true })
  @Exclude()
  encryptedPhone: EncryptedField | null;

  // Campo sensível - Endereço criptografado
  @Column({ type: 'jsonb', nullable: true })
  @Exclude()
  encryptedAddress: EncryptedField | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Campos virtuais para acesso transparente
  @Expose()
  get cpf(): string | null {
    return this._decryptedCpf;
  }

  set cpf(value: string | null) {
    this._decryptedCpf = value;
    this._cpfChanged = true;
  }

  @Expose()
  get phone(): string | null {
    return this._decryptedPhone;
  }

  set phone(value: string | null) {
    this._decryptedPhone = value;
    this._phoneChanged = true;
  }

  @Expose()
  get address(): string | null {
    return this._decryptedAddress;
  }

  set address(value: string | null) {
    this._decryptedAddress = value;
    this._addressChanged = true;
  }

  // Campos privados para controle de estado
  private _decryptedCpf: string | null = null;
  private _decryptedPhone: string | null = null;
  private _decryptedAddress: string | null = null;
  private _cpfChanged = false;
  private _phoneChanged = false;
  private _addressChanged = false;
}
```

### 4. Repository com Criptografia Automática

#### Encrypted Repository Base
```typescript
export abstract class EncryptedBaseRepository<T extends BaseEntity> extends TypeOrmBaseRepository<T> {
  constructor(
    repository: Repository<T>,
    private readonly encryptionService: EncryptionService,
    private readonly contextService: ContextService
  ) {
    super(repository);
  }

  async save(entity: T): Promise<T> {
    // Criptografar campos sensíveis antes de salvar
    await this.encryptSensitiveFields(entity);
    
    const savedEntity = await super.save(entity);
    
    // Descriptografar campos após salvar para manter transparência
    await this.decryptSensitiveFields(savedEntity);
    
    return savedEntity;
  }

  async findById(id: string): Promise<T | null> {
    const entity = await super.findById(id);
    
    if (entity) {
      await this.decryptSensitiveFields(entity);
    }
    
    return entity;
  }

  async findManyByCriteria(criteria: Criteria): Promise<PaginatedResult<T>> {
    const result = await super.findManyByCriteria(criteria);
    
    // Descriptografar todos os itens encontrados
    await Promise.all(
      result.items.map(item => this.decryptSensitiveFields(item))
    );
    
    return result;
  }

  protected async encryptSensitiveFields(entity: T): Promise<void> {
    const context = this.buildEncryptionContext();
    
    // Identificar campos que precisam ser criptografados
    const sensitiveFields = this.getSensitiveFields(entity);
    
    for (const field of sensitiveFields) {
      const plaintext = entity[field.propertyName];
      
      if (plaintext && entity[field.changedFlag]) {
        const encryptResult = await this.encryptionService.encryptField(
          plaintext,
          context
        );
        
        if (encryptResult.isRight()) {
          entity[field.encryptedPropertyName] = encryptResult.value;
          entity[field.changedFlag] = false;
        } else {
          throw new Error(`Failed to encrypt ${field.propertyName}`);
        }
      }
    }
  }

  protected async decryptSensitiveFields(entity: T): Promise<void> {
    const context = this.buildEncryptionContext();
    
    const sensitiveFields = this.getSensitiveFields(entity);
    
    for (const field of sensitiveFields) {
      const encryptedField = entity[field.encryptedPropertyName];
      
      if (encryptedField) {
        const decryptResult = await this.encryptionService.decryptField(
          encryptedField,
          context
        );
        
        if (decryptResult.isRight()) {
          entity[field.propertyName] = decryptResult.value;
        } else {
          // Log error mas não falha - campo fica null
          console.error(`Failed to decrypt ${field.propertyName}:`, decryptResult.value);
          entity[field.propertyName] = null;
        }
      }
    }
  }

  protected abstract getSensitiveFields(entity: T): SensitiveFieldConfig[];

  private buildEncryptionContext(): EncryptionContext {
    const user = this.contextService.getCurrentUser();
    
    return {
      userId: user?.id,
      organizationId: user?.organizationId,
      purpose: 'data_storage',
      timestamp: new Date().toISOString(),
    };
  }
}

interface SensitiveFieldConfig {
  propertyName: string;
  encryptedPropertyName: string;
  changedFlag: string;
}
```

#### User Repository Implementation
```typescript
@Injectable()
export class TypeOrmUserRepository 
  extends EncryptedBaseRepository<UserEntity> 
  implements UserRepository {

  constructor(
    @InjectRepository(UserEntity) repository: Repository<UserEntity>,
    encryptionService: EncryptionService,
    contextService: ContextService
  ) {
    super(repository, encryptionService, contextService);
  }

  protected getSensitiveFields(entity: UserEntity): SensitiveFieldConfig[] {
    return [
      {
        propertyName: 'cpf',
        encryptedPropertyName: 'encryptedCpf',
        changedFlag: '_cpfChanged'
      },
      {
        propertyName: 'phone',
        encryptedPropertyName: 'encryptedPhone',
        changedFlag: '_phoneChanged'
      },
      {
        propertyName: 'address',
        encryptedPropertyName: 'encryptedAddress',
        changedFlag: '_addressChanged'
      }
    ];
  }

  async findByEncryptedCpf(cpf: string): Promise<Either<Error, UserEntity | null>> {
    try {
      // Para buscar por campo criptografado, precisamos de uma abordagem diferente
      // Opção 1: Usar hash do CPF para indexação
      // Opção 2: Implementar busca com descriptografia (menos eficiente)
      
      const users = await this.repository.find({
        where: { isActive: true }
      });

      for (const user of users) {
        await this.decryptSensitiveFields(user);
        if (user.cpf === cpf) {
          return right(user);
        }
      }

      return right(null);
    } catch (error) {
      return left(new Error('Failed to search by encrypted CPF'));
    }
  }
}
```

### 5. Service Layer com Criptografia

#### User Service com ALE
```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly auditService: AuditService
  ) {}

  async create(data: CreateUserRequest): Promise<Either<Error, UserEntity>> {
    try {
      // Validações de negócio
      if (data.cpf) {
        const existingUser = await this.userRepository.findByEncryptedCpf(data.cpf);
        if (existingUser.isRight() && existingUser.value) {
          return left(new Error('CPF already registered'));
        }
      }

      // Criar usuário com dados sensíveis
      const user = new UserEntity();
      user.email = data.email;
      user.name = data.name;
      user.password = await bcrypt.hash(data.password, 10);
      
      // Definir campos sensíveis (serão criptografados automaticamente no save)
      user.cpf = data.cpf;
      user.phone = data.phone;
      user.address = data.address;

      const savedUser = await this.userRepository.save(user);

      // Auditar criação com dados sensíveis
      await this.auditService.logSensitiveDataAccess({
        action: 'CREATE_USER',
        resourceId: savedUser.id,
        sensitiveFields: ['cpf', 'phone', 'address'],
        reason: 'User registration'
      });

      return right(savedUser);
    } catch (error) {
      return left(new Error('Failed to create user'));
    }
  }

  async updateSensitiveData(
    userId: string, 
    data: UpdateSensitiveDataRequest
  ): Promise<Either<Error, UserEntity>> {
    try {
      const userResult = await this.userRepository.findById(userId);
      if (userResult.isLeft()) {
        return left(new Error('User not found'));
      }

      const user = userResult.value;
      if (!user) {
        return left(new Error('User not found'));
      }

      // Atualizar apenas campos fornecidos
      if (data.cpf !== undefined) user.cpf = data.cpf;
      if (data.phone !== undefined) user.phone = data.phone;
      if (data.address !== undefined) user.address = data.address;

      const updatedUser = await this.userRepository.save(user);

      // Auditar atualização
      await this.auditService.logSensitiveDataAccess({
        action: 'UPDATE_SENSITIVE_DATA',
        resourceId: userId,
        sensitiveFields: Object.keys(data),
        reason: 'User data update'
      });

      return right(updatedUser);
    } catch (error) {
      return left(new Error('Failed to update sensitive data'));
    }
  }
}
```

### 6. Indexação e Busca de Dados Criptografados

#### Searchable Hash Service
```typescript
@Injectable()
export class SearchableHashService {
  private readonly hashAlgorithm = 'sha256';
  private readonly searchSalt: string;

  constructor(private readonly envService: EnvService) {
    this.searchSalt = this.envService.get('SEARCH_HASH_SALT');
  }

  generateSearchableHash(plaintext: string): string {
    // Criar hash determinístico para permitir busca
    const hmac = crypto.createHmac(this.hashAlgorithm, this.searchSalt);
    hmac.update(plaintext);
    return hmac.digest('hex');
  }

  // Para campos que precisam de busca parcial (como nome)
  generatePartialSearchHashes(plaintext: string): string[] {
    const hashes: string[] = [];
    const normalized = plaintext.toLowerCase().trim();
    
    // Gerar hashes para diferentes tamanhos de substring
    for (let i = 3; i <= normalized.length; i++) {
      for (let j = 0; j <= normalized.length - i; j++) {
        const substring = normalized.substring(j, j + i);
        hashes.push(this.generateSearchableHash(substring));
      }
    }
    
    return [...new Set(hashes)]; // Remove duplicatas
  }
}
```

#### Enhanced User Entity com Hashes
```typescript
@Entity('users')
export class UserEntity extends BaseEntity {
  // ... campos existentes ...

  // Hashes para busca (não são dados sensíveis)
  @Column({ type: 'varchar', length: 64, nullable: true })
  @Index()
  cpfHash: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  @Index()
  phoneHash: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  @Index()
  nameSearchHashes: string[] | null;

  // Métodos para atualizar hashes automaticamente
  @BeforeInsert()
  @BeforeUpdate()
  async updateSearchHashes() {
    if (this._cpfChanged && this.cpf) {
      this.cpfHash = this.searchableHashService.generateSearchableHash(this.cpf);
    }
    
    if (this._phoneChanged && this.phone) {
      this.phoneHash = this.searchableHashService.generateSearchableHash(this.phone);
    }
    
    if (this.name) {
      this.nameSearchHashes = this.searchableHashService.generatePartialSearchHashes(this.name);
    }
  }
}
```

### 7. Configuração e Ambiente

#### Environment Variables
```typescript
export const envSchema = z.object({
  // ... variáveis existentes ...
  
  // AWS KMS Configuration
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_KMS_CMK_ID: z.string(),
  
  // Encryption Configuration
  SEARCH_HASH_SALT: z.string().min(32),
  ENCRYPTION_CACHE_TTL: z.number().default(300), // 5 minutos
  
  // Security Configuration
  SENSITIVE_DATA_AUDIT: z.boolean().default(true),
  ENCRYPTION_KEY_ROTATION_DAYS: z.number().default(90),
});
```

#### KMS Module Configuration
```typescript
@Module({
  imports: [ConfigModule],
  providers: [
    KmsService,
    EncryptionService,
    SearchableHashService,
    {
      provide: 'AWS_KMS_CLIENT',
      useFactory: (envService: EnvService) => {
        return new KMSClient({
          region: envService.get('AWS_REGION'),
          credentials: {
            accessKeyId: envService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: envService.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [EnvService],
    },
  ],
  exports: [KmsService, EncryptionService, SearchableHashService],
})
export class EncryptionModule {}
```

### 8. Monitoramento e Auditoria

#### Sensitive Data Audit Service
```typescript
@Injectable()
export class SensitiveDataAuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logSensitiveDataAccess(event: SensitiveDataAccessEvent): Promise<void> {
    const auditEntry = {
      eventType: 'SENSITIVE_DATA_ACCESS',
      userId: event.userId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      sensitiveFields: event.sensitiveFields,
      reason: event.reason,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
      success: event.success,
      errorMessage: event.errorMessage,
    };

    await this.auditRepository.create(auditEntry);

    // Alertas para ações suspeitas
    if (this.isSuspiciousActivity(event)) {
      await this.sendSecurityAlert(auditEntry);
    }
  }

  private isSuspiciousActivity(event: SensitiveDataAccessEvent): boolean {
    // Detectar padrões suspeitos
    return (
      event.action === 'BULK_ACCESS' ||
      event.sensitiveFields.length > 5 ||
      event.reason === 'AUTOMATED_PROCESS'
    );
  }

  async generateComplianceReport(period: DateRange): Promise<ComplianceReport> {
    // Gerar relatório de conformidade para auditoria
    const accessLogs = await this.auditRepository.findSensitiveDataAccess(period);
    
    return {
      period,
      totalAccesses: accessLogs.length,
      uniqueUsers: new Set(accessLogs.map(log => log.userId)).size,
      fieldAccessCounts: this.aggregateFieldAccess(accessLogs),
      suspiciousActivities: accessLogs.filter(log => log.suspicious),
      complianceScore: this.calculateComplianceScore(accessLogs),
    };
  }
}
```

### 9. Performance e Cache

#### Encryption Cache Service
```typescript
@Injectable()
export class EncryptionCacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxCacheSize = 1000;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos

  async getCachedDecryption(
    encryptedField: EncryptedField,
    context: EncryptionContext
  ): Promise<string | null> {
    const cacheKey = this.generateCacheKey(encryptedField, context);
    const entry = this.cache.get(cacheKey);

    if (entry && !this.isExpired(entry)) {
      return entry.decryptedValue;
    }

    return null;
  }

  async setCachedDecryption(
    encryptedField: EncryptedField,
    context: EncryptionContext,
    decryptedValue: string
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(encryptedField, context);
    
    // Limpar cache se necessário
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestEntries();
    }

    this.cache.set(cacheKey, {
      decryptedValue,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });
  }

  private generateCacheKey(
    encryptedField: EncryptedField,
    context: EncryptionContext
  ): string {
    const keyData = {
      encryptedData: encryptedField.encryptedData,
      userId: context.userId,
      purpose: context.purpose,
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex');
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove 10% das entradas mais antigas
    const toRemove = Math.floor(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }
}

interface CacheEntry {
  decryptedValue: string;
  timestamp: number;
  ttl: number;
}
```

## Implementação por Etapas

### Fase 1: Infraestrutura Base (Semana 1-2)
1. **Configurar AWS KMS**: Criar CMK e configurar permissões
2. **Implementar KmsService**: Integração com AWS SDK
3. **Criar EncryptionService**: Lógica de criptografia/descriptografia
4. **Testes unitários**: Validar operações de criptografia

### Fase 2: Integração com Entidades (Semana 3-4)
1. **Atualizar entidades**: Adicionar campos criptografados
2. **Implementar EncryptedBaseRepository**: Repository com criptografia automática
3. **Criar SearchableHashService**: Sistema de hashes para busca
4. **Migração de dados**: Scripts para criptografar dados existentes

### Fase 3: Otimização e Cache (Semana 5-6)
1. **Implementar cache de criptografia**: Melhorar performance
2. **Otimizar queries**: Índices em hashes de busca
3. **Monitoramento**: Métricas de performance de criptografia
4. **Testes de carga**: Validar performance sob carga

### Fase 4: Auditoria e Compliance (Semana 7-8)
1. **Sistema de auditoria**: Log de acesso a dados sensíveis
2. **Relatórios de compliance**: Dashboards e relatórios
3. **Alertas de segurança**: Detecção de atividades suspeitas
4. **Documentação**: Procedimentos de segurança e compliance

## Configuração AWS KMS

### 1. Criação da CMK
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable IAM User Permissions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:root"
      },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "Allow use of the key for Nexus Event Driven",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT-ID:user/nexus-event-driven-app"
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. IAM Policy para Aplicação
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "kms:GenerateDataKey",
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:REGION:ACCOUNT-ID:key/CMK-ID",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "application.REGION.amazonaws.com"
        }
      }
    }
  ]
}
```

## Benefícios da Implementação ALE

### Segurança
- **Proteção em repouso**: Dados criptografados no banco de dados
- **Controle de chaves**: AWS KMS gerencia chaves com alta segurança
- **Isolamento**: Cada campo tem sua própria DEK
- **Auditoria completa**: Log de todos os acessos a dados sensíveis

### Compliance
- **LGPD/GDPR**: Criptografia forte de dados pessoais
- **PCI DSS**: Proteção de dados de cartão (se aplicável)
- **SOX**: Controles de acesso e auditoria
- **ISO 27001**: Gestão de segurança da informação

### Performance
- **Cache inteligente**: Reduz chamadas ao KMS
- **Criptografia assíncrona**: Não bloqueia operações principais
- **Índices otimizados**: Busca eficiente em dados criptografados
- **Lazy loading**: Descriptografia sob demanda

### Operacional
- **Transparência**: Aplicação funciona normalmente
- **Escalabilidade**: Suporta crescimento do volume de dados
- **Backup seguro**: Backups já contêm dados criptografados
- **Disaster recovery**: Chaves gerenciadas pela AWS

## Considerações de Segurança

### Boas Práticas
1. **Rotação de chaves**: Política de rotação automática
2. **Separação de ambientes**: CMKs diferentes por ambiente
3. **Princípio do menor privilégio**: Permissões mínimas necessárias
4. **Monitoramento contínuo**: Alertas para atividades anômalas
5. **Backup de chaves**: Estratégia de recuperação de desastres

### Limitações e Mitigações
1. **Performance**: Cache e otimizações de query
2. **Custo**: Monitoramento de uso do KMS
3. **Complexidade**: Documentação e treinamento da equipe
4. **Busca**: Sistema de hashes para campos pesquisáveis
5. **Migração**: Processo gradual de criptografia de dados existentes

Este sistema ALE com AWS KMS fornece uma camada robusta de proteção para dados sensíveis no Nexus Event Driven, garantindo compliance com regulamentações de privacidade e mantendo alta performance operacional.