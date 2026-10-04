# 0002. Preparar o modelo de dados para múltiplos professores desde o início

Status: Aceito
Tipo: Produto
Data: 2026-10-05

## Contexto e Problema

O MVP do Mensalize atende **uma única professora**. Porém o roadmap do PRD prevê que "outros
professores / escolas poderão usar o sistema no futuro", e o próprio PRD lista como risco
"Crescer para vários professores exigir retrabalho", com a mitigação de pensar o produto como
"conta de um professor" desde o início.

O problema: modelar os dados assumindo apenas uma professora global (sem vínculo de dono) ou
já vincular cada registro a uma conta de professor?

## Motivação / Drivers

- **Evitar migração destrutiva:** introduzir dono depois obriga a migrar todas as tabelas e
  reatribuir dados existentes.
- **Custo baixo agora:** adicionar o vínculo no início é praticamente sem custo sobre o
  modelo já planejado.
- **Alinhamento ao PRD:** o produto já se declara pensado como "conta de um professor".

## Opções Consideradas

- **A. Single-teacher puro** — sem vínculo de dono; uma instância = uma professora.
- **B. `teacher_id` em todas as entidades, um único login no MVP** — o modelo já é por conta,
  mas só existe uma conta agora.
- **C. Multi-tenant completo já no MVP** — cadastro de vários professores, convites,
  isolamento e, possivelmente, multi-schema.

## Decisão

Escolhemos a **B**. Todo dado pertencente a um professor carrega `teacher_id` e é escopado por
ele, mas o MVP oferece **apenas uma conta**. Não construímos o fluxo de múltiplos professores
(cadastro, convites, gestão) agora — isso é YAGNI para o MVP.

## Prós e Contras das Opções

### A. Single-teacher puro
+ Modelo mais simples; nenhuma coluna extra.
- Refatoração ampla e migração de dados no futuro; contradiz o PRD.

### B. `teacher_id` desde já, um login
+ Zero retrabalho estrutural para o multi-professor; custo mínimo hoje; alinhado ao PRD.
- Coluna sempre presente mesmo no MVP de uma conta; exige disciplina de escopo em toda query.

### C. Multi-tenant completo já
+ Pronto para escalar imediatamente.
- Escopo muito maior que o MVP; risco de prazo e de sobre-engenharia.

## Consequências

- **Positivas:** caminho aberto para multi-professor sem migração destrutiva; modelo coerente
  desde o começo; bom argumento de TCC/portfólio.
- **Negativas:** pequeno overhead de modelagem e de disciplina de escopo (toda consulta filtra
  pelo professor autenticado).
- **Riscos / Mitigações:** risco de "construir multi-tenant sem perceber" — mitigado mantendo
  o MVP com uma conta e sem fluxos de convite/gestão; escopo reforçado em revisão com
  `ponytail-review`.

## Pendências

- Fluxo de onboarding/convite de novos professores e política de isolamento (por linha vs por
  schema) ficam para um ADR futuro, se e quando o multi-professor virar escopo.
