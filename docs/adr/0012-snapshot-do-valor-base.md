# 0012. Congelar o valor base da mensalidade como snapshot

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

A mensalidade é criada ao abrir o mês a partir do cadastro do aluno
([ADR 0006](0006-mensalidade-persistida-por-aluno-mes.md)), e esse cadastro pode mudar depois
(dias de aula, promoção, valor da hora-aula). Isso deixou em aberto (pendência do ADR 0006) se o
valor base recalcula ou é congelado.

## Motivação / Drivers

- **Estabilidade da cobrança:** uma vez lançada, o mês não deve mudar sozinho.
- **Confiança:** o valor cobrado precisa ser reprodutível e não surpreender a professora nem o
  aluno.
- **Combinação com ajustes:** alterações intencionais já são registradas como ajustes
  ([ADR 0011](0011-ajustes-da-mensalidade-como-lista.md)).

## Opções Consideradas

- **A. Snapshot** — congelar o valor base (e os parâmetros que o geraram) na criação.
- **B. Recalcular base sempre, mantendo ajustes.**
- **C. Recalcular tudo a cada abertura.**

## Decisão

Escolhemos a **A**. Na criação, a mensalidade grava o **valor base** já calculado (com o número
de aulas considerado). Alterações posteriores no cadastro do aluno **não** afetam mensalidades
já criadas; qualquer mudança intencional é feita via ajuste.

## Prós e Contras das Opções

### A. Snapshot
+ Valores estáveis e reprodutíveis; meses passados não mudam; separa "cálculo" de "mudança
  intencional".
- Cadastro corrigido depois não reflete automaticamente no mês; exige ajuste manual.

### B. Recalcular base sempre
+ Reflete correções de cadastro automaticamente.
- Valores já vistos/ comunicados podem mudar sozinhos; gera desconfiança.

### C. Recalcular tudo
+ Estado sempre "atual".
- Reescreve histórico; imprevisível; conflita com status persistido.

## Consequências

- **Positivas:** cobrança estável e auditável; base e ajustes bem separados.
- **Negativas:** correções de cadastro exigem ação manual (ajuste) para valer em mês já criado.
- **Riscos / Mitigações:** risco de valor "antigo" por cadastro errado — mitigado pela tela de
  ajuste, que torna a correção explícita.

## Pendências

- Resolve a pendência de recálculo do
  [ADR 0006](0006-mensalidade-persistida-por-aluno-mes.md).
