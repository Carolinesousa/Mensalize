# 0017. Estratégia de testes: Pest, Vitest/RTL e Playwright

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

Um projeto de TCC/portfólio precisa demonstrar qualidade e regressão sob controle. Cada camada
tem necessidades diferentes: regra de cálculo do backend, componentes do frontend e o fluxo
crítico ponta-a-ponta. Como testar?

## Motivação / Drivers

- **Confiança nas regras:** o cálculo da mensalidade e o isolamento por professor precisam de
  testes fortes.
- **Feedback rápido:** testes de backend e frontend rodando de forma independente.
- **Demonstração de ponta a ponta:** cobrir o caminho crítico (cadastro → aluno → cobrança →
  pago) para banca/portfólio.

## Opções Consideradas

- **A. Pest (backend) + Vitest + React Testing Library (frontend) + Playwright (E2E).**
- **B. PHPUnit + Jest + Cypress.**
- **C. Apenas Pest (backend) no MVP.**

## Decisão

Escolhemos a **A**. Pest para unit (cálculo) e feature (API, isolamento) no backend; Vitest +
RTL para componentes/lógica do frontend; Playwright para o fluxo crítico ponta-a-ponta.

## Prós e Contras das Opções

### A. Pest + Vitest/RTL + Playwright
+ Cobertura por camada; ferramentas modernas e agradáveis; E2E real no navegador.
- Três ferramentas a configurar; Playwright adiciona tempo de execução.

### B. PHPUnit + Jest + Cypress
+ Stack clássica e muito documentada.
- Mais verboso; Cypress é mais pesado que o Playwright para CI.

### C. Só Pest
+ Menos setup.
- Sem garantia das camadas de UI e do fluxo ponta-a-ponta; fraco para portfólio.

## Consequências

- **Positivas:** regras críticas cobertas; regressão sob controle; evidência de qualidade.
- **Negativas:** mais configuração inicial e tempo de pipeline.
- **Riscos / Mitigações:** risco de suíte lenta — mitigado mantendo Playwright restrito ao
  fluxo crítico e o restante nos testes de camada.

## Pendências

- Ferramenta de CI (ex.: GitHub Actions) e alvo de cobertura serão definidos no TDD/plano.
