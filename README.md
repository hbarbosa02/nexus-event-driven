# Monorepo (API + WEB)

Este monorepo contém duas aplicações em `apps/`:
- `apps/api`: API Express em TypeScript
- `apps/web`: Frontend React + Vite + TypeScript

## Requisitos
- Node.js 18+
- npm 9+

## Instalação
```bash
npm install
```

## Desenvolvimento (ambos, em paralelo)
```bash
npm run dev
```
- API: `http://localhost:3001`
- WEB: `http://localhost:5173`
- O `web` consome `GET /api/health` via proxy do Vite.

## Comandos por pacote
- API
  - Dev: `npm run -w @workspace/api dev`
  - Build: `npm run -w @workspace/api build`
  - Start: `npm run -w @workspace/api start`
- WEB
  - Dev: `npm run -w @workspace/web dev`
  - Build: `npm run -w @workspace/web build`
  - Preview: `npm run -w @workspace/web preview`

## Produção
```bash
npm run build
npm run start
```
- Sobe API (`node apps/api/dist/index.js`) e pré-visualização estática do `web` (Vite preview).

## Estrutura
```
apps/
  api/
    src/index.ts
    tsconfig.json
    package.json
  web/
    src/main.tsx
    index.html
    vite.config.ts
    tsconfig.json
package.json (root com workspaces)
```
