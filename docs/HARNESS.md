# HARNESS.md — eduvem

Contrato dos harness determinísticos: o que cada um prova, o comando, o critério
de falha e — o campo que mais importa — **o que ele NÃO prova**.

**Regra de leitura.** Harness listado aqui e não executado é pior que ausente,
porque parece cobertura. A coluna "executa em" é obrigatória e tem de apontar
para um workflow real.

Última medição: **15/08/2026**.

---

## Inventário

**Vazio.** Este repositório não tem harness determinístico nenhum.

Medido em 15/08/2026:

| | |
|---|---|
| arquivos de teste | **0** |
| workflows de CI | **nenhum** |
| `valida-skill.sh` | **não existe** |
| último commit | 4 months ago |

---

## Por que este documento existe estando vazio

Porque **ausência declarada é diferente de ausência silenciosa**. Um repositório
sem contrato de harness parece não ter sido avaliado; um com contrato vazio diz
que foi avaliado e o resultado é zero.

Foi essa distinção que custou caro no ecossistema em 14–15/08/2026: gates que
não rodavam pareciam cobertura, e um job que fechava verde publicando 3 de 5
apps deixou dois deles com build de dois dias no ar.

---

## O que NÃO está coberto — ou seja, tudo

- **Sem verificação de código antes de publicar.** Nada barra push quebrado.
- **Sem contrato de pipeline** (`H-PIPE-01`): nada impede que um
  `ssh-keyscan` sem `-t` entre num workflow e faça o Fail2Ban do droplet
  banir o IP do runner no meio do job.
- **Sem gate de componentes canônicos** (`H-SKILL-01`).
- **Sem auditoria de dependências.**
- **Sem prova de frescor:** "deploy concluído" aqui significa apenas que o
  comando não deu erro.

---

## Como sair do zero

O caminho mínimo, na ordem que funcionou nos outros repositórios em 15/08/2026:

1. **Ligar a suíte ao CI antes de instalar gate.** Instalar harness em
   repositório que não executa teste produz verde vazio — o arquivo existe e
   nunca roda. No `health`, `knowme` e `book` o passo de teste e o gate
   entraram no **mesmo commit**, e o quarto caso do gate verifica que o passo
   continua lá.
2. **Copiar `concierge/tests/pipeline-contract.test.ts`.** Ele já traz o
   conserto de exclusão de comentário e a prova negativa.
3. **Rodar a prova negativa antes de aceitar o verde:** introduzir o defeito,
   confirmar que reprova, restaurar. Gate que nunca viu vermelho não provou que
   enxerga nada.

Catálogo transversal: `~/.claude/HARNESS.md`.
Referência estrutural: `rotas/docs/HARNESS-DE-CONTROLE.md`.
