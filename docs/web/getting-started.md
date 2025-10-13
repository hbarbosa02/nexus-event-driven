# Guia de Início - Frontend

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Angular CLI** (instalado globalmente ou via npx)

## Instalação

### 1. Instalar Dependências
```bash
cd apps/web
npm install
```

### 2. Configurar Ambiente

O frontend está configurado para usar proxy durante desenvolvimento, redirecionando requisições `/api/*` para `http://localhost:3001`.

Se necessário, ajuste as configurações em `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: '/api'  // Usa proxy em desenvolvimento
};
```

## Execução

### Desenvolvimento
```bash
npm run start
# ou
ng serve
```

A aplicação estará disponível em http://localhost:3000

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
ng serve --configuration production
```

## Estrutura do Projeto

```
apps/web/src/app/
├── core/                       # Serviços singleton
│   ├── services/               # Serviços globais
│   └── interceptors/           # Interceptors HTTP
├── shared/                     # Componentes compartilhados
│   ├── components/             # Componentes reutilizáveis
│   ├── models/                 # Interfaces e tipos
│   ├── pipes/                  # Pipes personalizados
│   └── directives/             # Diretivas personalizadas
├── features/                   # Módulos de funcionalidades
│   ├── events/                 # Módulo de eventos
│   │   ├── components/         # Componentes específicos
│   │   ├── services/           # Serviços específicos
│   │   └── events.routes.ts    # Rotas do módulo
│   └── examples/               # Módulo de exemplos
├── pages/                      # Páginas principais
│   ├── home/                   # Página inicial
│   └── doc/                    # Documentação
├── layouts/                    # Layouts da aplicação
│   └── main-layout/            # Layout principal
├── environments/               # Configurações de ambiente
├── app.component.ts            # Componente raiz
├── app.routes.ts               # Rotas principais
└── app.config.ts               # Configuração da aplicação
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start                   # Servidor de desenvolvimento
npm run serve                   # Alias para start

# Build
npm run build                   # Build para produção
npm run watch                   # Build em watch mode

# Testes
npm run test                    # Executa testes unitários

# Qualidade de Código
npm run lint                    # Executa ESLint
```

## Configuração

### Proxy para API
O arquivo `proxy.conf.json` está configurado para redirecionar requisições da API:

```json
{
  "/api/*": {
    "target": "http://localhost:3001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Angular CLI
Configuração em `angular.json`:
- **Build**: Otimizado para produção
- **Development**: Source maps e hot reload
- **Assets**: Inclui pasta `docs/` para documentação

### TypeScript
Configuração em `tsconfig.json`:
- **Target**: ES2022
- **Strict Mode**: Habilitado
- **Path Mapping**: `@/*` para imports absolutos

## Componentes Principais

### Layout Principal
- **Header**: Navegação principal
- **Footer**: Informações do projeto
- **Main Content**: Área de conteúdo das páginas

### Páginas
- **Home**: Página inicial com overview do sistema
- **Events**: Gerenciamento de eventos nativos
- **Examples**: Módulo de exemplos
- **Documentation**: Sistema de documentação integrado

### Componentes Compartilhados
- **Loading**: Spinner de carregamento
- **Error**: Tratamento de erros
- **Pagination**: Componente de paginação
- **Search**: Componente de busca

## Serviços

### EventService
```typescript
@Injectable({ providedIn: 'root' })
export class EventService {
  getEvents(params?: EventQueryParams): Observable<PaginatedResult<Event>>;
  getEventById(id: string): Observable<Event>;
  createEvent(event: CreateEventRequest): Observable<Event>;
  updateEvent(id: string, event: UpdateEventRequest): Observable<Event>;
  deleteEvent(id: string): Observable<{ message: string }>;
  retryEvent(id: string, maxRetries?: number): Observable<Event>;
}
```

### ExampleService
```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  getExamples(params?: ExampleQueryParams): Observable<PaginatedResult<Example>>;
  getActiveExamples(): Observable<PaginatedResult<Example>>;
  getExampleById(id: string): Observable<Example>;
  createExample(example: CreateExampleRequest): Observable<Example>;
  updateExample(id: string, example: UpdateExampleRequest): Observable<Example>;
  deleteExample(id: string): Observable<{ message: string }>;
}
```

### DocService
```typescript
@Injectable({ providedIn: 'root' })
export class DocService {
  getDocSections(): Observable<DocSection[]>;
  getDocSection(id: string): Observable<DocSection>;
  searchDocs(query: string): Observable<DocSection[]>;
}
```

## Roteamento

### Rotas Principais
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component') },
  { path: 'events', loadChildren: () => import('./features/events/events.routes') },
  { path: 'examples', loadChildren: () => import('./features/examples/examples.routes') },
  { path: 'doc', loadChildren: () => import('./pages/doc/doc.routes') },
  { path: '**', redirectTo: '/home' }
];
```

### Lazy Loading
Todos os módulos utilizam lazy loading para otimizar performance:
- Carregamento sob demanda
- Redução do bundle inicial
- Melhor experiência do usuário

## Estilos

### SCSS Global
- **Variáveis**: Cores, tipografia, espaçamentos
- **Mixins**: Funções reutilizáveis
- **Reset**: Normalização de estilos
- **Utilities**: Classes utilitárias

### Design System
- **Cores**: Paleta consistente
- **Tipografia**: Inter font family
- **Componentes**: Estilos padronizados
- **Responsivo**: Mobile-first approach

## Interceptors

### ApiInterceptor
```typescript
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adiciona headers padrão
    // Trata erros globais
    // Log de requisições
  }
}
```

## Troubleshooting

### Erro de Build
```
ERROR in Cannot find module '@angular/core'
```
**Solução**: Execute `npm install` para instalar dependências.

### Erro de Proxy
```
Error: ECONNREFUSED localhost:3001
```
**Solução**: Certifique-se de que a API está rodando na porta 3001.

### Erro de Rota
```
Error: Cannot match any routes
```
**Solução**: Verifique se a rota está definida em `app.routes.ts` ou no módulo correspondente.

## Próximos Passos

1. [Estrutura do Projeto](./structure.md)
2. [Componentes](./components.md)
3. [Arquitetura Geral](../architecture.md)
