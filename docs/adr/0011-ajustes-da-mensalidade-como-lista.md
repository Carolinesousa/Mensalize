# 0011. Representar ajustes da mensalidade como uma lista

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

A mensalidade precisa suportar duas coisas: o **ajuste manual** do valor (previsto no PRD) e a
**aula extra** ([ADR 0010](0010-aula-extra-no-mvp.md)). Um único campo "valor final" perderia a
rastreabilidade de por que o valor mudou. Precisamos de uma representação.

## Motivação / Drivers

- **Rastreabilidade:** saber o que compõe o valor cobrado.
- **Reúso:** um só mecanismo para "aula extra" e "ajuste manual".
- **Simplicidade:** não criar dois conceitos para a mesma ideia (alterar o valor).

## Opções Consideradas

- **A. Lista de ajustes** — cada ajuste tem descrição e valor; a mensalidade é `valor base +
  soma dos ajustes`. "Aula extra" é um atalho que cria um ajuste de `+valor da hora-aula`.
- **B. Campo `aulas_extras` + override do valor final.**
- **C. Apenas override do valor final**, sem registrar a causa.

## Decisão

Escolhemos a **A**. A mensalidade guarda um **valor base** (snapshot) e uma **lista de ajustes**
(cada um com descrição e valor). A aula extra é um preset de ajuste (`+valor da hora-aula`); o
ajuste manual do PRD é um ajuste de valor livre. O valor final é a soma.

## Prós e Contras das Opções

### A. Lista de ajustes
+ Um mecanismo cobre os dois casos; histórico do que compõe o valor; fácil de exibir na mensagem.
- Uma entidade (e tabela) a mais.

### B. `aulas_extras` + override
+ Menos linhas.
- Dois conceitos sobrepostos; perde a descrição/motivo de cada mudança.

### C. Só override
+ Mínimo absoluto.
- Sem rastreabilidade; a professora não lembra por que o valor divergiu do cálculo.

## Consequências

- **Positivas:** rastreabilidade e simplicidade conceitual; o mesmo item serve à aula extra e ao
  ajuste manual; permite compor a mensagem de cobrança discriminando os itens.
- **Negativas:** mais uma entidade/tabela e mais uma tela/coleção no CRUD da mensalidade.
- **Riscos / Mitigações:** risco de excesso de granularidade — mitigado mantendo o ajuste como
  par descrição+valor, sem tipos complexos.

## Pendências

- Se haverá limites/validações para ajustes (ex.: valor negativo) será definido no TDD.
