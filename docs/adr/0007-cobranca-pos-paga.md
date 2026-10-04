# 0007. Adotar cobrança pós-paga com vencimento no mês seguinte

Status: Aceito
Tipo: Produto
Data: 2026-10-05

## Contexto e Problema

O PRD deixa em aberto se a cobrança é enviada antes (pré-paga) ou depois (pós-paga) das aulas.
Isso determina **qual mês** é cobrado e como interpretar "as aulas reais do mês".

## Motivação / Drivers

- **Aulas reais, não previstas:** o PRD fala em contar "as aulas reais do mês", o que combina
  com cobrar por aulas já dadas.
- **Menos conflito com faltas/feriados:** cobrar depois reduz divergência com cancelamentos,
  que o PRD trata por ajuste manual.
- **Clareza da dívida:** o aluno deve pelas aulas efetivamente ocorridas.

## Opções Consideradas

- **A. Pré-pago** — cobrar no início do mês pelas aulas previstas (contagem no calendário).
- **B. Pós-pago** — cobrar no início do mês seguinte pelas aulas já dadas.

## Decisão

Escolhemos **B (pós-pago)**. A mensalidade tem uma **competência** (o mês das aulas) e vence no
**mês seguinte à competência, no dia de vencimento do aluno**.

## Prós e Contras das Opções

### A. Pré-pago
+ Dinheiro entra antes; contagem de aulas é fixa pelo calendário.
- Cobrança pode divergir de cancelamentos/faltas; exige crédito/estorno.

### B. Pós-pago
+ Cobra pelo que foi efetivamente dado; menos divergência com cancelamentos.
- Recebimento mais tardio; a professora precisa do ajuste manual para exceções.

## Consequências

- **Positivas:** alinhado ao "aulas reais"; menos casos de divergência; dívida clara.
- **Negativas:** o caixa entra com atraso; cobrar o mês anterior exige deixar claro na mensagem
  qual mês de aulas está sendo cobrado.
- **Riscos / Mitigações:** risco de a aluna estranhar a defasagem — mitigado pela mensagem
  pronta informando a quantidade de aulas (já previsto no PRD).

## Pendências

- Feriados/férias continuam fora do cálculo automático (ajuste manual), conforme o PRD.
