# 0006. Persistir a mensalidade por aluno/mês, criada ao abrir o mês

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

A mensalidade tem estado próprio: o valor pode ser **ajustado manualmente** e o status é
**pago/pendente**. Isso exige persistência. A questão é como e quando o registro de mensalidade
nasce, já que o valor calculado pode ser recalculado a partir do cadastro do aluno.

## Motivação / Drivers

- **Estado mutável:** ajuste manual e status pago/pendente precisam sobreviver a recarregamentos
  e a mudanças no cadastro do aluno.
- **Experiência da usuária:** a "visão do mês" deve listar valor, vencimento e status de cada
  aluno sem comandos extras.
- **Simplicidade operacional:** evitar uma etapa manual de "fechar mês" no MVP.

## Opções Consideradas

- **A. Persistir por aluno/mês, criada automaticamente ao abrir o mês (lazy).**
- **B. Calcular on the fly; persistir só ajuste/pagamento.**
- **C. Criar por ação explícita da professora ("gerar/fechar o mês").**

## Decisão

Escolhemos a **A**. Existe um registro de mensalidade por **aluno × mês de competência**; ele é
criado na primeira vez que o mês é aberto, já com o valor calculado, e a partir daí carrega
ajuste manual e status.

## Prós e Contras das Opções

### A. Persistida, criada ao abrir o mês
+ Estado pago/pendente e ajuste têm onde viver; a visão do mês é direta; sem passo manual.
- Introduz o momento de criação e a questão de recálculo vs snapshot; exige unicidade por
  (professor, aluno, mês).

### B. Calculada on the fly
+ Menos linhas no banco.
- Espalha a lógica de cálculo pelo caminho de leitura e torna status/ajuste desconexos da
  mensalidade; mais difícil de raciocinar.

### C. Criada por ação explícita
+ Controle claro de quando o mês "fecha".
- Adiciona cerimônia e um passo que a usuária pode esquecer; fere a métrica de pouco esforço.

## Consequências

- **Positivas:** estado e cálculo convivem no mesmo registro; visão do mês simples; sem comando
  de fechamento.
- **Negativas:** necessidade de constraint única por (professor, aluno, competência) e de
  definir política de recálculo; cria registros automaticamente, inclusive para alunos
  cadastrados depois (requer critério).
- **Riscos / Mitigações:** risco de valor divergir se o cadastro do aluno mudar após a criação —
  mitigado definindo explicitamente a política de snapshot/recálculo (ver Pendências).

## Pendências

- Política de recálculo: se o cadastro do aluno (dias de aula, promoção) mudar depois da
  criação da mensalidade, o valor é recalculado ou mantido como snapshot? Será fechado antes do
  modelo de dados no TDD. **(Resolvido pelo [ADR 0012](0012-snapshot-do-valor-base.md): snapshot.)**
- Critério para alunos cadastrados no meio do mês.
