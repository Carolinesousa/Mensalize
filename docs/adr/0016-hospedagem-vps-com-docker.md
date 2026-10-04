# 0016. Hospedar em VPS único com Docker Compose

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

A SPA e a API são separadas ([ADR 0001](0001-adotar-react-spa-sobre-api-laravel-desacoplada.md))
e a autenticação é por sessão/cookie no modo SPA do Sanctum
([ADR 0004](0004-autenticar-spa-com-sanctum-modo-spa.md)), que depende de configuração de domínio
e same-site. O ADR 0004 deixou em aberto a topologia de domínios em produção. Onde hospedar?

## Motivação / Drivers

- **Sanctum same-site:** SPA e API no mesmo domínio tornam a sessão/cookie simples e segura.
- **Custo e simplicidade operacional:** um único servidor a administrar.
- **Portfólio/TCC:** demonstrar empacotamento e deploy (Docker, Nginx, TLS) agrega valor.

## Opções Consideradas

- **A. VPS único + Docker Compose** — Nginx serve a SPA estática e faz reverse proxy de `/api`
  para o PHP-FPM; MySQL em container; mesmo domínio.
- **B. PaaS separado** — API em Railway/Render + banco gerenciado, SPA na Vercel.
- **C. Adiar a decisão** para depois do MVP.

## Decisão

Escolhemos a **A**. Tudo roda num **mesmo domínio** via Docker Compose: Nginx como entrada
(arquivos estáticos da SPA + proxy `/api`), PHP-FPM para a API e MySQL como banco. Isso torna o
Sanctum SPA first-party e same-site, sem CORS cross-site nem cookies `SameSite=None`.

## Prós e Contras das Opções

### A. VPS + Docker Compose
+ Mesmo domínio (Sanctum simples); um só lugar; rico para portfólio.
- Operação manual (TLS, backups, atualização) sob nossa responsabilidade.

### B. PaaS separado
+ Deploy gerenciado e escalável por serviço.
- Domínios cruzados exigem CORS com credenciais e cookies cross-site; mais superfície de erro.

### C. Adiar
+ Nada a decidir agora.
- Deixa a pendência do ADR 0004 em aberto e atrasa a config de ambiente.

## Consequências

- **Positivas:** configuração de sessão/cookie simples; ambiente único e reproduzível via
  Compose; boa narrativa de infraestrutura no TCC.
- **Negativas:** exige administrar servidor (TLS/Let's Encrypt, backup do MySQL, deploy).
- **Riscos / Mitigações:** risco de indisponibilidade/ações manuais — mitigado documentando o
  passo a passo de deploy e usando volumes/backup do banco.

## Pendências

- Resolve a pendência de domínios do [ADR 0004](0004-autenticar-spa-com-sanctum-modo-spa.md):
  **mesmo domínio**. Provedor de VPS a definir na hora do deploy.
