# 0014. Permitir múltiplos dias de aula por aluno

Status: Aceito
Tipo: Produto
Data: 2026-10-05

## Contexto e Problema

O PRD fala em "dias da semana em que tem aula" (plural), mas era ambíguo se um aluno pode ter
mais de um dia fixo por semana. Isso define diretamente a contagem de aulas do mês — base do
cálculo ([ADR 0005](0005-calculo-da-mensalidade.md)).

## Motivação / Drivers

- **Fidelidade à realidade:** alunos frequentemente têm aula em mais de um dia (ex.: seg e qua).
- **Cálculo correto sem ajuste manual:** se o sistema só aceitasse um dia, o segundo viraria
  ajuste manual recorrente.
- **Alinhamento ao PRD:** o texto usa o plural.

## Opções Consideradas

- **A. Múltiplos dias** — o aluno tem um conjunto de dias da semana; a contagem do mês é a soma
  das ocorrências de todos os dias.
- **B. Um único dia** — mais simples, mas exige ajuste manual para o segundo dia.

## Decisão

Escolhemos a **A**: cada aluno pode ter **um ou mais dias de aula na semana**; o número de aulas
do mês é a soma das ocorrências de todos os dias marcados no mês de competência.

## Prós e Contras das Opções

### A. Múltiplos dias
+ Reflete a realidade; reduz ajustes manuais; aderente ao PRD.
- Modelo com relação aluno × dias (tabela/ coleção), contagem um pouco mais elaborada.

### B. Um único dia
+ Modelo e contagem triviais.
- Empurra o caso comum para o ajuste manual; pior experiência.

## Consequências

- **Positivas:** cálculo automático cobre alunos com mais de um dia; menos ajustes.
- **Negativas:** necessidade de modelar a relação aluno × dias da semana e de testar a contagem
  com sobreposições e meses de tamanhos diferentes.
- **Riscos / Mitigações:** risco de erro de contagem — mitigado com testes unitários do Service
  de cálculo cobrindo 4/5 ocorrências no mês.

## Pendências

- Representação concreta (tabela associativa vs coleção) fica para o TDD.
