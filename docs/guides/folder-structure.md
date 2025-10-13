# Estrutura de Pastas

## Visão Geral do Monorepo

```
nexus-event-driven/
├── apps/
│   ├── api/                    # Backend NestJS
│   └── web/                    # Frontend Angular
├── docs/                       # Documentação técnica
├── .cursor/
│   └── rules/                  # Regras e padrões do projeto
├── package.json                # Configuração do monorepo
└── README.md
```

## API (apps/api)

### Estrutura Completa
```
apps/api/src/
├── event/                      # Módulo de eventos
│   ├── data-access/
│   │   ├── repositories/
│   │   │   └── event.repository.ts
│   │   └── services/
│   │       └── event.service.ts
│   ├── feature/
│   │   ├── schemas/
│   │   │   └── event.schema.ts
│   │   ├── event.controller.ts
│   │   └── event.module.ts
│   └── util/
│       └── types/
│           └── event.type.ts
├── example/                    # Módulo de exemplo
│   ├── data-access/
│   │   ├── repositories/
│   │   │   └── example.repository.ts
│   │   └── services/
│   │       └── example.service.ts
│   ├── feature/
│   │   ├── schemas/
│   │   │   └── example.schema.ts
│   │   ├── example.controller.ts
│   │   └── example.module.ts
│   └── util/
│       └── types/
│           └── example.type.ts
├── shared/                     # Código compartilhado
│   ├── data-access/
│   │   ├── repositories/
│   │   │   └── base.repository.ts
│   │   └── services/
│   │       └── errors/
│   │           ├── resource-not-found.error.ts
│   │           └── resource-already-exists.error.ts
│   ├── feature/
│   │   ├── base.controller.ts
│   │   └── schemas/
│   │       └── page-query-param.schema.ts
│   └── util/
│       ├── pipes/
│       │   └── zod-validation.pipe.ts
│       └── types/
│           ├── either.ts
│           └── criteria/
│               ├── criteria.ts
│               ├── filter.ts
│               ├── operator.ts
│               └── pagination.ts
├── database/                   # Configuração de banco
│   ├── feature/
│   │   ├── entities/
│   │   │   ├── base.entity.ts
│   │   │   ├── event.entity.ts
│   │   │   ├── example.entity.ts
│   │   │   └── index.ts
│   │   ├── repositories/
│   │   │   ├── typeorm-base.repository.ts
│   │   │   ├── typeorm-event.repository.ts
│   │   │   └── typeorm-example.repository.ts
│   │   └── database.module.ts
│   └── util/
│       └── typeorm/
│           ├── naming-strategy.ts
│           └── criteria-converter.ts
├── env/
│   └── env.ts
├── app.module.ts
└── main.ts
```

### Estrutura de um Módulo
Cada módulo de domínio segue a mesma estrutura:

```
[nome-modulo]/
├── data-access/               # Camada de acesso a dados
│   ├── repositories/          # Interfaces abstratas
│   │   └── [entidade].repository.ts
│   └── services/              # Lógica de negócio
│       └── [entidade].service.ts
├── feature/                   # Camada de apresentação
│   ├── schemas/               # Validação Zod
│   │   └── [entidade].schema.ts
│   ├── [entidade].controller.ts
│   └── [entidade].module.ts
└── util/                      # Utilitários específicos
    └── types/
        └── [entidade].type.ts
```

## WEB (apps/web)

### Estrutura Completa
```
apps/web/src/
├── app/
│   ├── core/                  # Serviços singleton
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   └── doc.service.ts
│   │   └── interceptors/
│   │       └── api.interceptor.ts
│   ├── shared/                # Componentes compartilhados
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── header.component.html
│   │   │   │   └── header.component.scss
│   │   │   └── footer/
│   │   ├── pipes/
│   │   │   ├── date-format.pipe.ts
│   │   │   └── truncate.pipe.ts
│   │   └── directives/
│   │       └── highlight.directive.ts
│   ├── features/              # Módulos de funcionalidades
│   │   ├── events/
│   │   │   ├── components/
│   │   │   │   ├── event-list/
│   │   │   │   ├── event-detail/
│   │   │   │   └── event-form/
│   │   │   ├── services/
│   │   │   │   └── event.service.ts
│   │   │   └── events.module.ts
│   │   └── examples/
│   │       ├── components/
│   │       ├── services/
│   │       └── examples.module.ts
│   ├── pages/                 # Páginas principais
│   │   ├── home/
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   └── home.component.scss
│   │   └── doc/
│   │       ├── components/
│   │       │   ├── doc-navigation/
│   │       │   └── doc-content/
│   │       ├── doc.component.ts
│   │       ├── doc.component.html
│   │       ├── doc.component.scss
│   │       └── doc.routes.ts
│   ├── layouts/               # Layouts da aplicação
│   │   └── main-layout/
│   │       ├── main-layout.component.ts
│   │       ├── main-layout.component.html
│   │       └── main-layout.component.scss
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.routes.ts
│   └── app.config.ts
├── assets/                    # Recursos estáticos
│   ├── images/
│   ├── icons/
│   └── docs/                  # Arquivos markdown
│       ├── api/
│       ├── web/
│       └── development.md
├── environments/              # Configurações de ambiente
│   ├── environment.ts
│   └── environment.prod.ts
└── styles/                    # Estilos globais
    ├── _variables.scss
    ├── _mixins.scss
    └── styles.scss
```

### Estrutura de um Componente
```
[component-name]/
├── [component-name].component.ts
├── [component-name].component.html
├── [component-name].component.scss
└── [component-name].component.spec.ts
```

### Estrutura de um Feature Module
```
[feature-name]/
├── components/                # Componentes específicos do feature
│   ├── [component-1]/
│   └── [component-2]/
├── services/                  # Serviços específicos do feature
│   └── [feature].service.ts
├── models/                    # Interfaces e tipos
│   └── [feature].model.ts
└── [feature].module.ts
```

## Documentação (docs/)

### Estrutura
```
docs/
├── README.md                  # Índice da documentação
├── architecture.md            # Arquitetura geral
├── api/                       # Documentação da API
│   ├── getting-started.md
│   ├── modules.md
│   ├── patterns.md
│   └── endpoints.md
├── web/                       # Documentação do frontend
│   ├── getting-started.md
│   ├── structure.md
│   ├── components.md
│   └── services.md
├── deployment.md              # Guia de deploy
└── development.md             # Guia de desenvolvimento
```

## Rules (.cursor/rules/)

### Estrutura
```
.cursor/rules/
├── README.md                  # Índice das regras
├── ARCHITECTURE.md            # Arquitetura do sistema
├── coding-standards.md        # Padrões de código
├── naming-conventions.md      # Convenções de nomenclatura
├── folder-structure.md        # Este arquivo
├── nestjs-patterns.md         # Padrões NestJS
└── angular-patterns.md        # Padrões Angular
```

## Convenções de Organização

### Separação por Responsabilidade
- **data-access/**: Acesso a dados e lógica de negócio
- **feature/**: Controllers, módulos e validação
- **util/**: Tipos, enums e utilitários específicos
- **shared/**: Código reutilizável entre módulos

### Agrupamento por Funcionalidade
- Cada módulo é autocontido
- Dependências claras entre camadas
- Interfaces bem definidas
- Separação de responsabilidades

### Nomenclatura Consistente
- Arquivos em `kebab-case`
- Diretórios em `kebab-case`
- Classes em `PascalCase`
- Variáveis em `camelCase`

## Boas Práticas

### Estrutura de Módulos
1. **Um módulo por domínio**: Cada funcionalidade tem seu próprio módulo
2. **Separação de camadas**: data-access, feature, util
3. **Dependências claras**: Módulos dependem apenas do que precisam
4. **Interfaces bem definidas**: Contratos claros entre camadas

### Organização de Componentes
1. **Agrupamento por feature**: Componentes relacionados ficam juntos
2. **Separação de responsabilidades**: Cada componente tem uma responsabilidade
3. **Reutilização**: Componentes compartilhados em `shared/`
4. **Testabilidade**: Estrutura que facilita testes

### Gestão de Estado
1. **Serviços singleton**: Estado global em `core/services/`
2. **Estado local**: Estado específico em cada componente
3. **Comunicação**: Services para comunicação entre componentes
4. **Imutabilidade**: Preferir objetos imutáveis

---

Esta estrutura garante organização, escalabilidade e manutenibilidade do projeto, facilitando o desenvolvimento e colaboração entre equipes.
