# 0004. Autenticar a SPA com Sanctum no modo SPA (cookie/sessão)

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

O Mensalize tem **React SPA + API Laravel desacopladas** (ver
[ADR 0001](0001-adotar-react-spa-sobre-api-laravel-desacoplada.md)) e uma única usuária
autenticada. Precisamos definir como a SPA autentica na API: por sessão/cookie (Sanctum modo
SPA) ou por token Bearer.

## Motivação / Drivers

- **Segurança no frontend:** evitar guardar credenciais de longa duração em `localStorage`,
  reduzindo exposição a XSS.
- **First-party:** frontend e backend são a mesma aplicação do ponto de vista do produto.
- **Recomendação oficial:** o Laravel recomenda o modo SPA do Sanctum para SPAs próprias.
- **Simplicidade do MVP:** uma usuária; sem necessidade de tokens de API de terceiros.

## Opções Consideradas

- **A. Sanctum modo SPA (cookie/sessão, CSRF)** — autenticação stateful first-party.
- **B. Sanctum API tokens (Bearer)** — token emitido e enviado no header `Authorization`.
- **C. JWT de terceiros** — pacote externo de tokens autocontidos.

## Decisão

Escolhemos a **A (Sanctum modo SPA)**. A sessão fica em cookie `HttpOnly`; o frontend não
gerencia token. Por ser first-party e same-site, é o modo mais seguro e recomendado.

## Prós e Contras das Opções

### A. Sanctum modo SPA
+ Token fora do alcance do JavaScript (`HttpOnly`); CSRF tratado via cookie XSRF; recomendação
  oficial para SPAs first-party.
- Exige configuração de domínio/same-site, CORS com credenciais e cookies; menos direto para
  consumir de um cliente não-browser (mobile de terceiros).

### B. Sanctum API tokens
+ Simples de documentar e de consumir cross-domain; funciona para clientes externos.
- O token precisa ser armazenado no frontend, agravando risco de XSS; mais um segredo a
  gerenciar/expirar.

### C. JWT de terceiros
+ Tokens autocontidos; familiar a quem vem de outras stacks.
- Complexidade e armadilhas de invalidação/expiração; dependência externa desnecessária aqui.

## Consequências

- **Positivas:** sessão segura em cookie `HttpOnly`; menos segredo circulando no frontend;
  fluxo alinhado às recomendações do Laravel.
- **Negativas:** dependência de configuração correta de CORS/same-site entre SPA e API; exige
  `withCredentials` no cliente e `SANCTUM_STATEFUL_DOMAINS`/CSRF corretos no backend.
- **Riscos / Mitigações:** risco de quebra de sessão por domínio/CSRF mal configurado em
  deploy — mitigado documentando a configuração no TDD e testando ponta-a-ponta a autenticação.

## Pendências

- Configuração de domínios em produção (mesmo domínio vs subdomínios) será fechada na decisão
  de deploy. **(Resolvido pelo [ADR 0016](0016-hospedagem-vps-com-docker.md): mesmo domínio.)**
