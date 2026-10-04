# 0015. Modelo de mensagem de cobrança editável com placeholders

Status: Aceito
Tipo: Produto
Data: 2026-10-05

## Contexto e Problema

O PRD pergunta se ela quer poder editar o texto da mensagem de cobrança. A mensagem é gerada
como link do WhatsApp (detalhe de implementação a definir no TDD), e o texto precisa comportar
variações entre professoras.

## Motivação / Drivers

- **Controle da usuária:** professora quer o tom próprio na cobrança.
- **Reuso:** um mesmo modelo serve para todos os alunos, com dados preenchidos automaticamente.
- **Menos digitação:** a mensagem sai pronta, como pede a métrica do PRD.

## Opções Consideradas

- **A. Modelo editável com placeholders** — texto salvo no perfil da professora, com variáveis
  substituídas na geração.
- **B. Texto fixo no código** — sem customização.
- **C. Montada na hora sem modelo salvo** — placeholders fixos, sem texto próprio.

## Decisão

Escolhemos a **A**: a professora mantém **um modelo de mensagem editável** no seu perfil, com
**placeholders** (ex.: nome do aluno, competência, número de aulas, valor, vencimento). Na
cobrança, o sistema preenche os placeholders e gera o link do WhatsApp.

## Prós e Contras das Opções

### A. Modelo editável
+ Personalização; menos digitação; um só modelo por professora.
- Precisa validar placeholders e lidar com modelo vazio/inválido; campo extra no perfil.

### B. Texto fixo
+ Implantação trivial.
- Todas as professoras ficam engessadas no mesmo texto; pior produto.

### C. Sem modelo salvo
+ Nada a armazenar.
- Sem texto próprio; placeholders rígidos.

## Consequências

- **Positivas:** mensagem personalizável e alinhada à voz da professora; boa experiência.
- **Negativas:** mais um campo no perfil e validação de placeholders; necessidade de um modelo
  padrão inicial.
- **Riscos / Mitigações:** risco de placeholder inválido quebrar a geração — mitigado validando
  o modelo ao salvar e usando um texto padrão como fallback.

## Pendências

- Conjunto exato de placeholders será fixado no TDD.
