# PRD — Sistema de Cobrança para Aulas Particulares

- **Produto:** Mensalize
- **Data:** 2026-09-29
- **Autor:** @José Pedro

## Problema

Uma professora particular em início de carreira tem dificuldade em cobrar os alunos. Pedir
dinheiro é desconfortável, e sem controle organizado ela não sabe com segurança quanto cada
aluno deve nem quem já pagou.

O valor devido também não é trivial: depende da hora-aula, dos dias em que o aluno tem aula e de
quantas vezes esses dias caem no mês. Calcular isso de cabeça e escrever cada mensagem de
cobrança manualmente toma tempo e aumenta o constrangimento.

## Objetivos e Métricas

O sistema tira da professora o esforço de calcular e redigir cobranças: ela revisa o valor e
envia com um clique. Métricas, em ordem de prioridade (sugeridas, a validar com ela):

1. Nenhuma mensagem de cobrança escrita do zero — toda cobrança sai pelo botão de envio do
   sistema.
2. Visibilidade total do mês — ela sabe, a qualquer momento, quais alunos estão pagos e quais
   estão pendentes.
3. Poucos ajustes manuais — o valor calculado é aceito sem edição na maioria dos casos, sinal de
   que a regra de cálculo está correta.
4. Cadastro rápido — um aluno novo é cadastrado em poucos minutos.

## Personas

| Persona | Papel | Usa o sistema? |
|---|---|---|
| Professora | Cadastra alunos e promoções, revisa valores, envia cobranças e marca pagamentos | Sim — várias professoras, self-service (ADR 0013) |
| Aluno (ou responsável) | Recebe a mensagem de cobrança pelo WhatsApp e paga | Não — só recebe a mensagem |
| Outros professores / escolas | Poderão usar o sistema no futuro | Ver revisão (ADR 0013): outros professores passam a usar no MVP, self-service |

## Escopo

O MVP cobre cadastro, cálculo da mensalidade, promoções simples e envio manual da cobrança pelo
WhatsApp.

### Dentro do MVP

1. **Perfil da professora** — nome e valor padrão da hora-aula.
2. **Cadastro de aluno** — nome, telefone (WhatsApp), dias da semana em que tem aula
   (um ou mais), dia de vencimento próprio e, opcionalmente, uma promoção.
3. **Cadastro de promoções** — nome e percentual de desconto (ex.: "Indicação — 10%", "Irmãos —
   15%"). Cada aluno pode ter no máximo uma promoção ativa.
4. **Cálculo da mensalidade** — conta as aulas reais do mês a partir dos dias da semana do aluno,
   multiplica pela hora-aula e aplica o desconto da promoção.
5. **Ajuste manual e aula extra** — a professora pode ajustar o valor antes de enviar (ex.: aula
   cancelada, reposição) e adicionar aulas extras ministradas, que atualizam o valor.
6. **Envio da cobrança** — botão que abre o WhatsApp da professora com a conversa do aluno e uma
   mensagem pronta (a partir de um modelo editável) contendo o valor e o vencimento; ela revisa e
   envia.
7. **Status de pagamento** — cada mensalidade fica como pendente ou pago; a professora marca
   manualmente quando recebe.
8. **Visão do mês** — lista de alunos com valor, vencimento e status, para ela saber quem cobrar.
9. **Cadastro e login de professoras (self-service)** — várias professoras se cadastram, cada uma
   com dados isolados (ver [ADR 0013](../adr/0013-cadastro-aberto-e-multi-professor-no-mvp.md)).

### Fora do MVP (não-objetivos)

- Envio automático ou agendado de mensagens.
- Escolas, planos/assinatura e login para terceiros (alunos/funcionários).
- Rastreio de indicações (quem indicou quem) e benefícios automáticos.
- Acúmulo de promoções no mesmo aluno.
- Status atrasado e histórico de pagamentos entre meses.
- Pagamento dentro do sistema (Pix, boleto, cartão) e emissão de recibos.
- Agenda de aulas, controle de faltas e reposições.
- Acesso do aluno ao sistema.

## Roadmap

Nota de sequenciamento: o status atrasado e o histórico do Release 2 dependem do status
pago/pendente do MVP. O envio automático do Release 3 depende de uma decisão sobre a API oficial
do WhatsApp, a registrar em ADR.

## Riscos e Suposições

| Tipo | Descrição | Mitigação |
|---|---|---|
| Risco | Mensalidade varia entre meses (4 ou 5 aulas no mesmo dia da semana) e o aluno pode estranhar | Mensagem pronta mostra o número de aulas do mês; ajuste manual disponível |
| Risco | Ela esquece de marcar como pago e perde o controle | Visão do mês destaca os pendentes; lembrete visual a definir no design |
| Risco | Dados pessoais de alunos (nome, telefone, possivelmente menores de idade) | Tratar a proteção desses dados como requisito no TDD |
| Risco | Crescer para vários professores exigir retrabalho | Produto pensado como "conta de um professor" desde o início; decisão técnica registrada em ADR |
| Suposição | Ela usa WhatsApp no mesmo aparelho em que acessa o sistema (ou WhatsApp Web) | Validar com ela |
| Suposição | Cobrança é sempre mensal | Validar com ela |
| Suposição | O valor da hora-aula é o mesmo para todos os alunos, com diferenças tratadas por promoção ou ajuste | Validar com ela |

## Questões em aberto

- [ ] O valor da hora-aula pode variar por aluno (ex.: aula em grupo, nível diferente)?
- [x] Aulas têm duração diferente de 1 hora? — decisão: assumir 1h e remover o campo de duração
      ([ADR 0005](../adr/0005-calculo-da-mensalidade.md)).
- [ ] Qual o texto padrão da mensagem de cobrança? Ela quer poder editar esse modelo? — decisão:
      modelo editável ([ADR 0015](../adr/0015-modelo-de-mensagem-editavel.md)).
- [x] A cobrança é enviada antes do mês (pré-pago) ou depois (pelas aulas já dadas)? — decisão:
      pós-paga ([ADR 0007](../adr/0007-cobranca-pos-paga.md)).
- [ ] Feriados e férias descontam aulas automaticamente ou só via ajuste manual?
- [ ] Ela vai usar mais pelo celular ou pelo computador?
- [ ] Decisões técnicas (plataforma, hospedagem, armazenamento, login) ficam para o TDD e ADRs.

## Revisões

- **2026-10-05:** multi-professor movido para o MVP como cadastro self-service
  ([ADR 0013](../adr/0013-cadastro-aberto-e-multi-professor-no-mvp.md)); ajustados o não-objetivo
  de "múltiplos professores" e a persona "outros professores".
