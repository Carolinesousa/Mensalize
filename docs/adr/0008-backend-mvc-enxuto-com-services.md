# 0008. Organizar o backend com MVC enxuto + Services

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

A API Laravel precisa de uma organização de código defensável para um TCC/portfólio sem
transformar um domínio pequeno (professor, alunos, promoções, mensalidades) em um exercício de
cerimônia arquitetural. Onde colocar a lógica de cálculo e as regras de negócio?

## Motivação / Drivers

- **Legibilidade para o domínio:** o cálculo da mensalidade e as regras de cobrança precisam ter
  um lugar claro e testável.
- **Escopo do MVP:** poucas entidades; evitar sobre-engenharia.
- **Defensabilidade acadêmica:** uma organização simples e explicável vale mais que um padrão
  rebuscado mal justificado.

## Opções Consideradas

- **A. MVC enxuto + Service** — Controller → Service (regras/cálculo) → Eloquent.
- **B. Actions** — um caso de uso por classe.
- **C. DDD/camadas** — Domain / Application / Infrastructure.

## Decisão

Escolhemos a **A**. Controllers finos delegam para **Services** as regras de negócio (em especial
o cálculo da mensalidade); o acesso a dados fica no Eloquent. Sem camadas extras.

## Prós e Contras das Opções

### A. MVC enxuto + Service
+ Poucas camadas; regras concentradas e testáveis; fácil de explicar em banca.
- Exige disciplina para o Controller não voltar a engordar com regra.

### B. Actions
+ Casos de uso explícitos e granulares.
- Muita classe para pouco domínio; mais navegação.

### C. DDD/camadas
+ Separação rica; bom para domínios complexos.
- Escopo e abstração desproporcionais ao MVP; alto risco de sobre-engenharia.

## Consequências

- **Positivas:** baixo atrito, código direto, lógica de cálculo isolada e testável.
- **Negativas:** requer disciplina para não acumular regra nos controllers.
- **Riscos / Mitigações:** risco de "controller gordo" — mitigado por revisão de código
  (`revisar-pr`/`ponytail-review`) e por testes focados nos Services.

## Pendências

- Nenhuma.
