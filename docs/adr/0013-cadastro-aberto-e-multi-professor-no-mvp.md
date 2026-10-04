# 0013. Adotar cadastro aberto e multi-professor no MVP

Status: Aceito
Tipo: Produto
Data: 2026-10-05
Substitui: [0002](0002-preparar-modelo-para-multiplos-professores.md)

## Contexto e Problema

Durante o brainstorming técnico do TDD, ao decidir como a conta da professora nasce, optou-se
por **registro aberto** — qualquer professora cria a própria conta. Isso entra em contradição
com o não-objetivo do PRD ("Múltiplos professores, escolas e login para terceiros") e com o
[ADR 0002](0002-preparar-modelo-para-multiplos-professores.md), que previa **uma única conta** no
MVP. Era preciso resolver a tensão explicitamente.

## Motivação / Drivers

- **Produto self-service:** registro aberto elimina um passo manual de provisionamento e deixa o
  produto utilizável por qualquer professora.
- **Custo baixo de habilitação:** o [ADR 0002](0002-preparar-modelo-para-multiplos-professores.md)
  já vinculou `teacher_id` a todas as entidades, então ligar o cadastro é barato.
- **Valor para TCC/portfólio:** um fluxo de cadastro real amplia o que se demonstra.

## Opções Consideradas

- **A. Conta única criada por seeder/CLI** — mantém o não-objetivo do PRD (era a decisão do
  ADR 0002).
- **B. Registro aberto self-service** — cada professora cria a própria conta e enxerga só os
  seus dados; multi-professor entra no MVP.
- **C. Registro por convite** — intermediário, com fluxo de convites.

## Decisão

Escolhemos a **B (registro aberto self-service)**. O **multi-professor passa a integrar o MVP**
na sua forma mínima: cadastro e login de várias professoras, com **isolamento total dos dados
por professor**. Cada professora vê e gerencia apenas os próprios alunos, promoções e
mensalidades.

Ficam **fora** deste escopo (mantidos como não-objetivos): planos/assinatura, escolar, convites,
perfis administrativos e qualquer visão compartilhada entre professores.

## Prós e Contras das Opções

### A. Conta única (seeder)
+ Escopo mínimo; nenhum fluxo de cadastro a construir.
- Dependência de provisionamento manual; produto não é self-service; menos material de TCC.

### B. Registro aberto self-service
+ Produto utilizável por qualquer professora; aproveita o `teacher_id` já modelado; rico para
  TCC/portfólio.
- Amplia o escopo do MVP; exige isolamento por professor disciplinado e tratamento de dados
  pessoais (LGPD).

### C. Registro por convite
+ Controla quem entra.
- Fluxo de convites é escopo extra sem ganho claro no MVP.

## Consequências

- **Positivas:** produto self-service; multi-professor sem migração estrutural; demonstração mais
  completa.
- **Negativas:** mais escopo (cadastro, confirmação de e-mail/verificação, isolamento de dados);
  atenção a proteção de dados pessoais.
- **Riscos / Mitigações:** risco de vazamento entre contas — mitigado por escopo global por
  `teacher_id` e policies em toda consulta, com testes de isolamento; risco de escopo (planos,
  escola) — mitigado mantendo esses itens explicitamente fora.
- **Atualizações decorrentes:** o PRD passa a listar multi-professor como **dentro do MVP** (ver
  [PRD](../prd/2026-09-29-mensalize-prd.md)); o [ADR 0002](0002-preparar-modelo-para-multiplos-professores.md)
  fica **substituído por este**.

## Pendências

- Fluxo de confirmação de e-mail/verificação de conta a definir no TDD.
- Persistem fora do escopo: planos/assinatura, escolar e convites.
