# 0010. Incluir "aula extra" no MVP como item simples de cobrança

Status: Aceito
Tipo: Produto
Data: 2026-10-05

## Contexto e Problema

Ao lançar o pagamento, a professora precisa **acrescentar aulas ministradas além dos dias fixos
do aluno** (ex.: uma reposição ou aula avulsa) e ver o valor da mensalidade atualizar. O PRD,
porém, lista "Agenda de aulas, controle de faltas e reposições" como **fora do MVP**. Era preciso
decidir se essa necessidade entra no escopo e em que profundidade.

## Motivação / Drivers

- **Necessidade real de cobrança:** aulas a mais precisam ser cobradas sem cálculo manual.
- **Manter o escopo enxuto:** não abrir a porta para agenda/faltas/reposições completas.
- **Rastreabilidade:** a professora e o aluno devem entender o que compõe o valor.

## Opções Consideradas

- **A. Item simples de cobrança** — uma linha de valor na mensalidade ("aula extra"),
  incrementando o total; sem agenda nem controle de aulas.
- **B. Fora do MVP** — depender só do ajuste manual livre do PRD.
- **C. Ampliar o escopo** — agenda de aulas, faltas e reposições.

## Decisão

Escolhemos a **A**. O MVP permite **adicionar aulas extras** ao lançar a cobrança, mas **não**
implementa agenda, controle de faltas ou fluxo de reposição. A aula extra é um item de valor,
não um evento agendado.

## Prós e Contras das Opções

### A. Item simples
+ Atende a necessidade de cobrança com custo baixo; mantém o não-objetivo de "sem agenda".
- Não modela quando/por que a aula ocorreu; é só valor.

### B. Fora do MVP
+ Escopo mínimo; usa o ajuste manual já previsto.
- A ajuste manual livre é mais propensa a erro e não registra a natureza "aula extra".

### C. Ampliar escopo
+ Cobre reposições de ponta a ponta.
- Muda substancialmente o MVP e o TCC; risco alto de prazo.

## Consequências

- **Positivas:** cobrança de aulas a mais resolvida sem inflar o escopo; compõe bem com a lista de
  ajustes (ver [ADR 0011](0011-ajustes-da-mensalidade-como-lista.md)).
- **Negativas:** não há histórico/agenda das aulas extras; possível expectativa de recurso que
  não existe.
- **Riscos / Mitigações:** risco de o recurso ser confundido com controle de aulas — mitigado
  deixando explícito no produto e no TDD que é um item de cobrança, não uma agenda.

## Pendências

- Modelagem concreta do item fica no [ADR 0011](0011-ajustes-da-mensalidade-como-lista.md).
