# 0018. Aplicar a promoção apenas sobre a mensalidade base

Status: Aceito
Tipo: Produto
Data: 2026-10-05

## Contexto e Problema

Com a entrada das aulas extras ([ADR 0010](0010-aula-extra-no-mvp.md)) e da lista de ajustes
([ADR 0011](0011-ajustes-da-mensalidade-como-lista.md)), surgiu a dúvida: o desconto da promoção
incide também sobre as aulas extras, ou apenas sobre a mensalidade base
([ADR 0005](0005-calculo-da-mensalidade.md))?

## Motivação / Drivers

- **Coerência do benefício:** a promoção é um benefício mensal do aluno (ex.: irmãos), não um
  desconto por aula.
- **Previsibilidade:** aula extra é uma cobrança pontual pelo serviço prestado, a valor cheio.
- **Simplicidade de cálculo e de mensagem:** separa claramente "mensalidade" de "extras".

## Opções Consideradas

- **A. Desconto só na base** — extras a valor cheio.
- **B. Desconto sobre base e extras.**

## Decisão

Escolhemos a **A**: `valor base = nº de aulas no mês × hora-aula × (1 − desconto)`; as aulas
extras e ajustes somam ao valor **sem** desconto.

## Prós e Contras das Opções

### A. Desconto só no base
+ Coerente com "benefício mensal"; cálculo e mensagem mais simples; extras previsíveis.
- Aluno com promoção paga a aula extra cheia (pode gerar dúvida — esclarecer na mensagem).

### B. Desconto em tudo
+ Uniformidade de preço por aula.
- Mistura benefício mensal com serviço pontual; cálculo menos óbvio.

## Consequências

- **Positivas:** regra clara e fácil de explicar/testar; separação entre mensalidade e extras.
- **Negativas:** possível estranhamento do aluno com promoção numa aula extra.
- **Riscos / Mitigações:** risco de dúvida do aluno — mitigado discriminando os itens na
  mensagem de cobrança.

## Pendências

- Nenhuma.
