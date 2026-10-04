# 0005. Calcular a mensalidade apenas por nº de aulas e valor da hora-aula

Status: Aceito
Tipo: Produto
Data: 2026-10-05

## Contexto e Problema

O PRD define o cálculo como "conta as aulas reais do mês a partir dos dias da semana do aluno,
multiplica pela hora-aula e aplica o desconto da promoção", mas lista também "duração da aula"
como campo do aluno e deixa em aberto se a duração varia (ex.: 1h30). Era preciso fixar a
fórmula, pois ela define o valor exibido na cobrança — o núcleo do produto.

## Motivação / Drivers

- **Simplicidade do MVP:** uma usuária; regra de cálculo precisa ser previsível e aceita sem
  edição na maioria dos casos (métrica do PRD).
- **Evitar dado morto:** campo cadastrado que não influi em nada confunde o modelo e quem lê o
  código.
- **Uma fonte de verdade:** valor da hora-aula padrão no perfil da professora.

## Opções Consideradas

- **A. `nº de aulas × duração (h) × hora-aula × (1 − desconto)`** — usa a duração por aluno.
- **B. `nº de aulas × hora-aula × (1 − desconto)`** — assume aulas de 1 hora.
- **C. Valor fixo por aluno** — mensalidade fixa, sem hora-aula nem duração.

## Decisão

Escolhemos a **B**: `valor = nº de aulas no mês × valor da hora-aula × (1 − desconto)`. O
cálculo assume que toda aula tem 1 hora. Em consequência, o campo **"duração da aula" é removido**
do cadastro do aluno no MVP (era um campo sem uso na fórmula escolhida).

## Prós e Contras das Opções

### A. Usar duração
+ Suporta aulas de duração variável (ex.: 1h30) sem ajuste manual.
- Exige mais um dado por aluno e torna o cálculo menos previsível sem um ganho real no MVP.

### B. Ignorar duração (1h)
+ Fórmula mínima e previsível; menos campos; alinhada à hora-aula como fonte única.
- Não representa aulas com duração diferente de 1h; dependem de ajuste manual.

### C. Valor fixo por aluno
+ Ainda mais simples de calcular.
- Perde o modelo "hora-aula" central ao produto e a variação por quantidade de aulas no mês.

## Consequências

- **Positivas:** cálculo simples, previsível e fácil de testar; menos dados cadastrais.
- **Negativas:** aulas de duração variável ficam fora do cálculo automático (dependem de ajuste
  manual).
- **Riscos / Mitigações:** risco de a professora precisar de duração variável — mitigado pelo
  ajuste manual já previsto; reintroduzir duração exige um novo ADR que substitua este.

## Pendências

- Valor de hora-aula diferente por aluno, aulas em grupo ou por nível não fazem parte deste
  cálculo e ficam para ADR futuro, se virarem escopo.
