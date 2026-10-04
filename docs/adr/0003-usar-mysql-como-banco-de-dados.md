# 0003. Usar MySQL como banco de dados

Status: Aceito
Tipo: Técnica
Data: 2026-10-05

## Contexto e Problema

O Mensalize precisa de um banco relacional para o domínio (professor, alunos, promoções,
mensalidades) e para os recursos do Laravel (migrations, Eloquent, Sanctum). A aplicação é
pequena, com uma usuária no MVP e crescimento incerto. Qual banco adotar?

## Motivação / Drivers

- **Maturidade e familiaridade:** um banco amplamente conhecido reduz atrito de aprendizado.
- **Ecossistema Laravel:** integração primeira-classe e boa documentação.
- **Simplicidade operacional:** provisionamento e hospedagem acessíveis.
- **Portfólio/TCC:** escolha comum no mercado, fácil de justificar.

## Opções Consideradas

- **A. PostgreSQL**
- **B. MySQL**
- **C. SQLite**

## Decisão

Escolhemos o **MySQL** por maturidade, ampla adoção no mercado e integração direta com o
Laravel, atendendo com folga ao volume e à modelagem do MVP.

## Prós e Contras das Opções

### A. PostgreSQL
+ Recursos avançados e forte apelo no portfólio; ótima hospedagem gerenciada.
- Levemente mais "diferenciado", porém introduz vocabulário e detalhes próprios sem ganho
  concreto para este domínio.

### B. MySQL
+ Extremamente difundido; fácil de hospedar; integração simples com Laravel.
- Menos recursos avançados que o PostgreSQL; escolha pouco diferenciada em portfólio.

### C. SQLite
+ Zero configuração; perfeito para uma usuária e para desenvolvimento local.
- Estrangula o deploy remoto concorrente e enfraquece a narrativa de arquitetura.

## Consequências

- **Positivas:** operação simples; familiaridade acelera o desenvolvimento; ampla
  compatibilidade de hospedagem.
- **Negativas:** perde-se o diferencial técnico do PostgreSQL; migração futura, se necessária,
  exige cuidado (tipos e recursos).
- **Riscos / Mitigações:** risco de lock-in leve — mitigado escrevendo migrations e queries
  compatíveis com ANSI sempre que razoável e evitando extensões específicas do MySQL.

## Pendências

- Provedor de hospedagem do banco será escolhido junto da decisão de deploy.
