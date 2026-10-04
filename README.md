# Mensalize

Sistema de cobrança de mensalidades para aulas particulares.

Calcula automaticamente o valor do mês a partir dos dias de aula do aluno e da hora-aula, aplica promoções e gera a mensagem de cobrança para envio pelo WhatsApp — para a professora revisar e enviar com um clique.

## Estado (MVP)

O MVP está funcional: autenticação Sanctum SPA, CRUD de alunos e promoções, criação lazy de mensalidades, ajustes/aulas extras, geração da mensagem e link do WhatsApp, visão do mês e perfil da professora.

- **API**: Laravel 12 + Sanctum (PHP 8.3), banco SQLite em desenvolvimento/testes.
- **Web**: React 19 + Vite + TypeScript + Tailwind, dados via TanStack Query.
- **Qualidade**: Pest (API), Vitest + Testing Library (web) e Playwright (E2E).

## Pré-requisitos

- PHP 8.3+ e Composer
- Node.js 22+ e npm
- (Opcional, para a stack completa) Docker e Docker Compose

## Rodando local (sem Docker)

Backend:

```bash
cd api
cp .env.example .env
composer install
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve --port=8080
```

Frontend (em outro terminal):

```bash
cd web
npm install
npm run dev
```

A SPA sobe em `http://localhost:5173` e faz proxy de `/api` e `/sanctum` para a API em `http://localhost:8080` (ver `web/vite.config.ts`).

## Rodando com Docker Compose

A stack sobe Nginx (SPA), PHP-FPM (API) e MySQL. O container da API executa `php artisan migrate --force` automaticamente no entrypoint (`docker/entrypoint.sh`) antes de iniciar o PHP-FPM.

```bash
cp .env.example .env
# Gere uma APP_KEY e cole em APP_KEY no .env:
docker compose run --rm api php artisan key:generate --show
docker compose up --build
```

A aplicação fica disponível em `http://localhost` (ou na porta definida em `APP_PORT`).

## Testes

API (Pest):

```bash
cd api
php artisan test
```

Web (Vitest):

```bash
cd web
npx vitest run
```

E2E (Playwright) — sobe a API e a SPA automaticamente:

```bash
cd web
npx playwright install chromium   # apenas na primeira vez
npx playwright test
```
