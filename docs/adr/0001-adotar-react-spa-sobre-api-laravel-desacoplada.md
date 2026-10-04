# 0001. Adotar React SPA sobre API Laravel desacoplada

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

O Mensalize (ver PRD — Sistema de Cobrança para Aulas Particulares) é uma aplicação **web**
para uma professora particular calcular e cobrar mensalidades de aulas. O MVP é de usuária
única e o domínio é pequeno: cadastro de alunos e promoções, cálculo da mensalidade, geração
de link de cobrança para WhatsApp e marcação de pagamento.

Precisamos definir a arquitetura de aplicação. O contexto **não é apenas entregar o MVP**, mas
também servir de **Trabalho de Conclusão de Curso e peça de portfólio** — critério que valoriza
uma arquitetura demonstrável, com fronteiras claras e artefatos defensáveis em banca, e não
apenas o menor esforço possível.

A questão: monólito (frontend e backend no mesmo projeto) ou frontend SPA desacoplado de uma
API backend?

## Motivação / Drivers

- **Demonstrabilidade para TCC/portfólio:** fronteira explícita entre frontend e backend dá
  material de defesa (contrato de API, autenticação por token, versionamento, tratamento de
  erros).
- **Reúso e evolução:** a API desacoplada prepara consumo futuro por app mobile e permite
  documentá-la (OpenAPI/Swagger) e testá-la isoladamente.
- **Aproveitar recursos maduros do Laravel:** é no backend exposto como API que Sanctum, Form
  Requests, Policies e API Resources brilham de verdade.
- **Roadmap do PRD:** o envio automático (Release 3) vira um caso de fila/worker/agendamento
  que evidencia arquitetura — melhor demonstrado com API separada.
- **Preferência do autor:** manter React no frontend e Laravel no backend.

## Opções Consideradas

- **A. Laravel + Inertia + React** — monólito com React na UI e Laravel roteando/validando,
  sem API pública.
- **B. React SPA + API Laravel (Sanctum)** — dois projetos; API REST autenticada por token e
  SPA React consumindo-a.
- **C. Laravel + Blade + Livewire** — monólito sem SPA.
- **D. Next.js full-stack (React + API routes + Prisma)** — um projeto só, em TypeScript.

## Decisão

Escolhemos a **B (React SPA + API Laravel com Sanctum)** porque, no contexto de TCC/portfólio,
a separação de camadas gera valor: uma API REST documentável e testável, fronteira clara entre
frontend e backend e base pronta para app mobile. O domínio é pequeno o suficiente para que o
custo adicional da opção desacoplada seja administrável.

## Prós e Contras das Opções

### A. Laravel + Inertia + React
+ Menos trabalho: um projeto, um deploy, sem CORS, sem contrato de API, sem token.
+ Excelente relação esforço-resultado para um MVP de usuária única.
- Menos material de defesa em banca; fronteira front/back implícita; acopla a stack ao Inertia.

### B. React SPA + API Laravel (Sanctum)
+ Arquitetura demonstrável e defensável; API reutilizável e documentável; duas camadas testáveis.
+ Prepara mobile futuro e o roadmap (fila/worker) com clareza.
- Mais trabalho: CORS, autenticação por token, contrato de API para manter e dois deploys.

### C. Laravel + Blade + Livewire
+ O caminho mais simples.
- Abre mão do React; menos alinhado ao perfil full-stack que se quer demonstrar.

### D. Next.js full-stack
+ Uma linguagem só; React nativo; um deploy.
- Descarta o Laravel/PHP; não há ganho relevante sobre A/B para este domínio.

## Consequências

- **Positivas:** arquitetura clara e defensável; API documentável e testável; base pronta para
  app mobile; melhor narrativa para o roadmap de envio automático.
- **Negativas:** maior custo de desenvolvimento e manutenção no MVP; dois pipelines de deploy;
  necessidade de gerenciar CORS, tokens e versionamento de contrato. Custo aceito em troca de
  valor acadêmico/portfólio.
- **Riscos / Mitigações:** risco de prazo do TCC por excesso de escopo — mitigado mantendo o
  domínio enxuto e não construindo multi-tenant agora (ver ADRs seguintes); risco de
  sobre-engenharia — mitigado por revisão com a skill `ponytail-review` e por não antecipar
  requisitos fora do MVP.

## Pendências

- Escolha do banco de dados, hospedagem/deploy e mecanismo detalhado de autenticação serão
  decididos em ADRs próprios.
