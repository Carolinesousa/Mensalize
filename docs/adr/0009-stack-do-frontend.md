# 0009. Stack do frontend: Vite + React + TypeScript + TanStack Query + Tailwind

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

A SPA React (ver [ADR 0001](0001-adotar-react-spa-sobre-api-laravel-desacoplada.md)) consumirá
uma API REST autenticada por sessão (ver [ADR 0004](0004-autenticar-spa-com-sanctum-modo-spa.md)).
Precisamos fixar as ferramentas do frontend: build, tipagem, roteamento, camada de dados e
estilização.

## Motivação / Drivers

- **Produtividade e modernidade:** ferramentas amplamente usadas e bem documentadas.
- **Qualidade para portfólio:** tipagem estática e organização clara do estado de servidor.
- **Velocidade de desenvolvimento:** build rápido e estilo utilitário.

## Opções Consideradas

- **A. Vite + React + TypeScript + React Router + TanStack Query + Tailwind CSS.**
- **B. Vite + React + TypeScript + React Router + `fetch`/Axios + CSS próprio.**
- **C. Vite + React + JavaScript (sem TypeScript).**

## Decisão

Escolhemos a **A**. TypeScript para segurança de tipos; Vite como bundler/dev server; React
Router para navegação; **TanStack Query** para cache e estado de servidor; **Tailwind CSS** para
estilização.

## Prós e Contras das Opções

### A. TS + Query + Tailwind
+ Tipagem, cache/estado de servidor com pouco boilerplate, estilização rápida e consistente.
- Algumas dependências a mais; curva de aprendizado de Query/Tailwind.

### B. TS + fetch/Axios + CSS próprio
+ Menos dependências.
- Reimplementa cache/loading/erro que o Query resolve; CSS manual mais lento de manter.

### C. React sem TypeScript
- Sem segurança de tipos nem autocompletar confiável; pior para portfólio.

## Consequências

- **Positivas:** base moderna e defensável; menos código de infraestrutura de dados; UI
  consistente.
- **Negativas:** mais dependências para gerenciar; exige padronizar o uso (ex.: convenções de
  query keys).
- **Riscos / Mitigações:** risco de uso inconsistente do Query — mitigado definindo padrões de
  query keys e camada de API no TDD.

## Pendências

- Biblioteca de componentes (ex.: shadcn/ui) e testes de frontend serão decididos no TDD.
