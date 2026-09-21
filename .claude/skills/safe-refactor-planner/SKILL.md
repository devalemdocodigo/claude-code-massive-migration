---
name: safe-refactor-planner
description: Use quando o pedido envolver remover código morto, testes obsoletos/duplicados/skipados, ou qualquer refatoração grande de remoção/limpeza que precise ser dividida em PRs pequenos e revisáveis. Gatilhos como "limpar os testes que não servem mais", "remover código não usado", "essa refatoração está gigante, quero quebrar em PRs".
---

# Safe Refactor Planner

Guia para transformar uma remoção/refatoração grande em uma sequência de PRs
pequenos, cada um com um motivo único e fácil de revisar. O objetivo é evitar
os dois extremos: **PRs demais** (fricção de processo, revisor cansa de
aprovar trivialidades) e **PRs gigantes** (diff que ninguém revisa de
verdade, risco escondido em volume).

Esta skill NÃO deleta nada na primeira fase. Ela produz um plano escrito,
pede aprovação, e só então executa — cada PR isolado numa git worktree
própria (via subagente), com revisão e merge acontecendo um PR de cada vez.

## Regras inegociáveis

1. **Nunca apague antes de inventariar.** A primeira saída sempre é uma
   lista de candidatos, nunca um diff.
2. **Nunca marque algo como "seguro para remover" sem verificar
   referências.** Rodar `grep`/busca por uso real é obrigatório antes de
   classificar qualquer item como seguro.
3. **Nunca misture motivos num PR.** "Remover código morto" e "remover
   testes duplicados" são PRs diferentes, mesmo que toquem arquivos
   parecidos.
4. **Cada PR é implementado numa worktree isolada, por um subagente — e a
   aprovação de cada PR continua acontecendo um de cada vez.** A
   *implementação* pode paralelizar (via worktrees, quando os PRs são
   independentes), mas revisão e merge nunca acontecem em lote.
5. **Nunca resolva na dúvida.** Se a confiança não é alta, o item vai para
   "precisa verificação humana" — não é excluído do plano nem removido por
   suposição.
6. **A suíte de testes completa roda antes e depois de cada PR.** Se
   quebrar, para e investiga antes de seguir.

## Fase 1 — Inventário

Buscar candidatos na categoria pedida pelo usuário (ex.: código morto,
testes obsoletos, duplicados, skip esquecido, testes de implementação).
Para cada candidato, registrar:

| Campo | Descrição |
|---|---|
| Arquivo(s) | caminho(s) afetado(s) |
| Categoria | código morto / teste duplicado / skip esquecido / teste de implementação / outro |
| Motivo | por que parece candidato a remoção |
| Confiança | `seguro` ou `precisa verificação` |
| Tamanho estimado | linhas/arquivos que o PR vai tocar |

Não remova nada nesta fase. Apenas construa a tabela.

## Fase 2 — Verificação

Antes de marcar qualquer item como `seguro`:

- **Código**: buscar no repositório inteiro (não só na pasta vizinha) por
  imports/requires/chamadas do símbolo. Zero referências fora do próprio
  arquivo e dos testes que o cobrem = candidato forte a `seguro`.
- **Testes**: rodar o teste isoladamente e ler o que ele realmente exercita.
  Sinais de lixo:
  - testa um símbolo que nenhum código de produção chama (código morto);
  - é quase idêntico a outro arquivo de teste, com poucas variações de dados
    (duplicado copy-paste);
  - tem `it.skip`/`describe.skip`/`xit` sem explicação recente ou com
    comentário/data indicando que foi esquecido;
  - testa detalhe de implementação interno (estrutura de um objeto privado,
    ordem de chaves, helper exposto só para teste) em vez de comportamento
    observável.

Qualquer ambiguidade (ex.: o símbolo é usado só em outro serviço, ou o teste
skip tem uma razão vaga mas recente) rebaixa o item para `precisa
verificação` — nunca resolva no otimismo.

## Fase 3 — Dimensionamento dos PRs

Heurística para agrupar os itens `seguro` em PRs:

- **Um motivo por PR.** Não combine categorias diferentes no mesmo PR.
- **Orçamento por PR:** aproximadamente 150–400 linhas de diff OU até
  8–10 arquivos, o que vier primeiro. Isso é grande o bastante para não
  pulverizar o trabalho em dezenas de PRs triviais, e pequeno o bastante
  para caber numa revisão de uma sentada.
- **Categoria pequena demais** (abaixo de ~30 linhas): funda com outra
  categoria de baixo risco e mesmo tipo de mudança (ex.: "duplicados" +
  "skip esquecido" podem virar um único PR de "limpeza de testes órfãos" se
  ambos forem pequenos), mas nunca funda com remoção de código morto de
  produção — riscos diferentes não se misturam.
- **Categoria grande demais:** divida por diretório/módulo, mantendo o
  mesmo motivo em cada parte (ex.: "remover testes duplicados de
  `legacyDiscount`" pode ser um PR próprio se isso sozinho já passar do
  orçamento).
- **Meta de contagem total:** para uma limpeza de porte médio, mire em
  3–8 PRs no total. Se o inventário sugerir muito mais que isso, procure
  fusões de baixo risco antes de aceitar a fragmentação. Se sugerir apenas
  1 PR gigante, é sinal de que falta dividir por categoria/módulo.

## Fase 4 — Plano escrito

Produza (ou atualize) `REFACTOR_PLAN.md` na raiz do repo com:

```markdown
# Plano de refatoração: <descrição curta>

## PR 1 — <motivo único>
- Arquivos: ...
- Por quê: ...
- Tamanho estimado: ~N linhas / M arquivos
- Risco: baixo/médio/alto
- Conflita com: PR N (mesmos arquivos) ou "nenhum" (pode rodar em paralelo)

## PR 2 — ...

## Itens que precisam verificação humana
- <arquivo>: <por que ficou ambíguo>
```

Pare aqui e peça confirmação do usuário antes de tocar em qualquer arquivo
de código. Este é o ponto de checkpoint mais importante da skill.

## Fase 5 — Execução: um subagente por PR, em worktree isolada

Só após aprovação do plano. Cada PR do `REFACTOR_PLAN.md` é implementado
por um **subagente rodando numa git worktree isolada** (no Claude Code:
`Agent` com `isolation: "worktree"`), nunca diretamente no diretório de
trabalho principal. Isso importa por três motivos:

- **Isolamento real.** Cada worktree é uma cópia própria do repositório,
  numa branch própria. Mudanças de um PR não vazam para outro nem para o
  diretório principal enquanto o trabalho está em andamento — mesmo que
  algo dê errado num PR, os outros não são afetados.
- **Paralelismo seguro quando faz sentido.** Se dois PRs do plano não tocam
  nos mesmos arquivos (ex.: "remover código morto do módulo X" e "remover
  teste skipado do módulo Y"), os subagentes podem ser disparados em
  paralelo, um por worktree, sem risco de conflito. PRs que tocam os
  mesmos arquivos continuam sendo feitos em sequência, um de cada vez.
- **Diretório principal sempre limpo.** Enquanto os PRs estão sendo
  trabalhados, `git status` no diretório principal continua limpo — sem
  branches meio-prontas nem mudanças de PRs diferentes se misturando no
  contexto de quem está revisando.

Fluxo por PR:

1. Disparar um subagente em worktree isolada com um prompt contendo *só* o
   escopo daquele PR: os arquivos, o motivo (copiado do plano) e o comando
   de teste a rodar antes/depois. Não dar ao subagente o plano inteiro —
   ele não deve "aproveitar" e tocar em outro PR.
2. O subagente roda a suíte de testes completa na sua worktree (baseline
   verde), aplica somente as mudanças descritas naquele PR, roda a suíte
   de novo, e para se algo quebrar — sem tentar consertar mudando o
   escopo combinado.
3. O subagente commita na branch da própria worktree com uma mensagem que
   referencie o motivo do PR (ex.: "remove dead legacy discount engine,
   unused since coupon system") e reporta o caminho da worktree e o nome
   da branch.
4. Push e abertura de PR remoto continuam sendo passos manuais e
   explícitos — esta skill não empurra nada para um repositório
   compartilhado sozinha.
5. Revisão e merge acontecem PR a PR, mesmo quando a implementação rodou
   em paralelo: mostrar o resultado de um PR, esperar aprovação, só então
   seguir para o merge/push do próximo.

## Fase 6 — Escalonamento

Qualquer item que ficou como `precisa verificação` na Fase 2 é levantado
para o usuário decidir explicitamente, com o motivo da dúvida. Nunca é
resolvido "no chute" nem silenciosamente excluído do plano.
