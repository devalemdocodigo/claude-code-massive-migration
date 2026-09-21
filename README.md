# quote-service-demo

Projeto de treino para praticar **refatoração segura de remoção de código e
testes obsoletos** com o Claude Code — o mesmo tipo de problema que aparece
em projetos reais grandes, onde a suíte de testes cresce por anos e ninguém
tem coragem de mexer nela.

Este documento explica o quê, o porquê e o como: o que existe aqui, por que
o projeto foi montado dessa forma, e o passo a passo para rodar o
exercício.

## Sumário

- [O que é este projeto](#o-que-é-este-projeto)
- [Como rodar](#como-rodar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [O problema real que isso simula](#o-problema-real-que-isso-simula)
- [O exercício](#o-exercício)
- [Como a skill funciona, fase a fase](#como-a-skill-funciona-fase-a-fase)
- [Por que worktrees + subagentes](#por-que-worktrees--subagentes)
- [Passo a passo prático](#passo-a-passo-prático)
- [Como saber que deu certo](#como-saber-que-deu-certo)
- [Levando isso para o seu projeto real](#levando-isso-para-o-seu-projeto-real)

## O que é este projeto

É um serviço Node.js pequeno (Express + Jest) — um mini serviço de cotação
de pedidos, com 2 endpoints e algumas funções de cálculo. O código em si
não é o ponto: ele existe só para dar um chão realista onde a suíte de
testes foi **contaminada de propósito** com o tipo de lixo que se acumula
em qualquer projeto grande com o tempo.

Junto do código vem uma **skill do Claude Code**
(`.claude/skills/safe-refactor-planner/`) — um conjunto de instruções que
ensina o Claude Code a conduzir esse tipo de limpeza de forma segura,
dividida em PRs pequenos, em vez de sair apagando arquivos.

## Como rodar

```bash
npm install
npm test        # a suíte inteira passa verde no estado inicial
npm start        # sobe o servidor em http://localhost:3000
```

Endpoints disponíveis:

- `POST /quote` — body `{ items: [{ price, qty }], couponCode?, region? }`
- `GET /orders/:id/status` — status determinístico de um pedido fictício

## Estrutura do projeto

```
src/
  app.js, server.js        # setup do Express
  routes/                  # os 2 endpoints
  lib/                     # funções de lógica (cálculo de preço, imposto, etc.)
tests/
  *.test.js                # suíte de testes — mistura de úteis e obsoletos
.claude/
  skills/
    safe-refactor-planner/ # a skill que conduz a refatoração segura
docs/
  mentor-notes.md          # gabarito para quem está te acompanhando (não leia antes de tentar!)
```

## O problema real que isso simula

Em projetos que vivem muitos anos, é normal que código e testes fiquem
obsoletos sem que ninguém perceba na hora:

- uma feature é substituída por outra, mas a função antiga e os testes dela
  ficam esquecidos no repositório;
- alguém copia um arquivo de teste pra criar um "caso parecido" e nunca
  volta pra consolidar os dois;
- um teste quebra numa migração, alguém coloca `skip` "só até eu resolver
  isso" e nunca mais volta;
- testes passam a verificar detalhes internos de implementação (em vez do
  comportamento que importa), e viram um peso morto que quebra à toa
  sempre que alguém tenta melhorar o código por dentro.

O perigo não é só o volume — é que **um teste passando não significa que
ele é útil**. Isso engana quem está revisando: parece tudo verde e seguro,
mas boa parte daquilo não protege nada em produção. E quando alguém decide
finalmente limpar isso tudo de uma vez, o risco é fazer uma refatoração
gigante, difícil de revisar, fácil de esconder um erro real no meio do
volume.

Este projeto contém, de propósito, exemplos plantados dessas quatro
categorias de "lixo": código morto testado, testes duplicados por
copy-paste, um teste com skip esquecido, e um teste que verifica detalhe
de implementação em vez de comportamento. Misturados com um punhado de
testes legítimos, que protegem comportamento real.

## O exercício

**Não leia `docs/mentor-notes.md` antes de tentar** — ele tem o gabarito.

O desafio é pedir para o Claude Code, usando a skill `safe-refactor-planner`,
que faça a limpeza dos testes/código que não são mais úteis, dividindo o
trabalho em PRs pequenos e revisáveis. Você não precisa (nem deve) já saber
de antemão o que é lixo — é exatamente isso que o processo da skill deve
revelar, de forma verificável, antes de apagar qualquer coisa.

## Como a skill funciona, fase a fase

A skill nunca pula direto para "apagar arquivo". Ela segue seis fases:

1. **Inventário** — varre o projeto procurando candidatos na categoria
   pedida (código morto, duplicado, skip esquecido, teste de
   implementação) e monta uma tabela. Nada é removido aqui.
2. **Verificação** — para cada candidato, confirma de verdade: busca no
   repositório inteiro por quem ainda usa aquele código; roda o teste e lê
   o que ele realmente exercita. Qualquer dúvida vira "precisa verificação
   humana" em vez de "seguro".
3. **Dimensionamento dos PRs** — agrupa os itens confirmados como seguros
   em PRs, seguindo uma heurística explícita de tamanho (nem PRs
   microscópicos demais, nem um PR gigante com tudo misturado — mais
   detalhes na próxima seção).
4. **Plano escrito** — produz um `REFACTOR_PLAN.md` listando cada PR
   (arquivos, motivo, tamanho, risco) e **para para pedir sua aprovação**
   antes de tocar em qualquer arquivo de código. Este é o checkpoint mais
   importante do processo.
5. **Execução** — só depois que você aprova o plano, cada PR é implementado
   por um subagente numa worktree isolada (ver próxima seção).
6. **Escalonamento** — qualquer item que ficou "precisa verificação" na
   fase 2 volta para você decidir, nunca é resolvido no chute.

### A heurística de tamanho dos PRs

O equilíbrio que a skill busca:

- **Um motivo por PR.** Remover código morto e remover testes duplicados
  são PRs diferentes, mesmo tocando arquivos parecidos — cada PR deve
  contar uma história só.
- **Orçamento por PR:** por volta de 150–400 linhas de diff ou até
  8–10 arquivos, o que vier primeiro. Grande o bastante pra não virar uma
  enxurrada de PRs triviais; pequeno o bastante pra caber numa revisão de
  uma sentada.
- **Categoria pequena demais** funde com outra categoria de baixo risco
  parecida, em vez de virar um PR-micro.
- **Categoria grande demais** se divide por módulo/diretório.
- **Meta:** de 3 a 8 PRs no total pra uma limpeza de porte médio. Muito
  mais que isso pede uma fusão; só 1 PR gigante é sinal de que faltou
  dividir.

## Por que worktrees + subagentes

Essa é a parte que muita gente não conhece e que vale a pena entender bem,
porque é o que torna esse processo seguro mesmo quando há vários PRs pra
fazer.

**O que é uma git worktree:** normalmente, um repositório git tem um único
diretório de trabalho, e trocar de branch (`git checkout`) muda os arquivos
ali mesmo. Uma *worktree* é uma segunda cópia de trabalho do mesmo
repositório, numa pasta separada, cada uma na sua própria branch — sem
precisar clonar o repositório de novo. É como ter várias mesas de trabalho
diferentes, todas puxando do mesmo repositório, sem nunca pisar uma na
outra.

**Por que isso importa aqui:** em vez de o Claude Code fazer PR 1, trocar de
branch, fazer PR 2, trocar de novo, fazer PR 3 — tudo no mesmo diretório —,
a skill dispara **um subagente por PR, cada um trabalhando na sua própria
worktree**. Isso resolve três problemas de uma vez:

- **Isolamento de verdade.** Cada PR vive na sua própria cópia de arquivos.
  Se um subagente cometer um erro ou o PR dele quebrar um teste, isso não
  contamina os outros PRs nem o seu diretório principal, que continua
  limpo o tempo todo.
- **Paralelismo seguro.** Quando dois PRs do plano não tocam nos mesmos
  arquivos (o plano registra isso explicitamente, campo "conflita com:"),
  os subagentes podem rodar ao mesmo tempo, cada um na sua worktree, sem
  risco de um atropelar o outro. Isso acelera bastante uma limpeza com
  vários PRs independentes — que é exatamente o cenário de "muita coisa
  pra remover, mas sem relação direta entre os pedaços".
- **Você nunca revisa dois PRs misturados.** Paralelizar a *implementação*
  não significa aprovar tudo de uma vez: a revisão e o merge de cada PR
  continuam acontecendo um de cada vez, no seu ritmo. Worktree resolve o
  problema de "onde o trabalho acontece", não o de "quando você aprova".

Na prática, quando você (ou a skill, em seu nome) chega na Fase 5, o que
acontece é: para cada PR aprovado no plano, um subagente é disparado com
`isolation: "worktree"`, recebendo só o escopo daquele PR — os arquivos, o
motivo, e o comando de teste a rodar antes e depois. Ele roda a suíte,
aplica só aquela mudança, roda a suíte de novo, comita na branch da própria
worktree e reporta onde ficou o trabalho. Push e abertura de PR remoto
continuam sendo passos manuais — a skill nunca empurra nada sozinha para um
repositório compartilhado.

## Passo a passo prático

1. Rode `npm install && npm test` para confirmar que a suíte está 100%
   verde (baseline).
2. Abra o Claude Code neste projeto e peça algo como: *"quero limpar os
   testes e o código que não são mais usados aqui, dividindo em PRs
   pequenos"*. Isso aciona a skill `safe-refactor-planner`.
3. Leia o inventário que ela produz. Faz sentido? Alguma coisa te
   surpreende?
4. Leia o `REFACTOR_PLAN.md` gerado. Confira: cada PR tem um motivo só?
   O tamanho parece razoável? Tem algum item marcado como "precisa
   verificação humana" que você concorda ou discorda?
5. Aprove o plano (ou peça ajustes antes de aprovar).
6. Acompanhe a execução — repare quais PRs rodaram em paralelo (worktrees
   diferentes) e quais rodaram em sequência, e por quê.
7. Revise e aprove os PRs um de cada vez.

## Como saber que deu certo

- `npm test` continua 100% verde depois de tudo — nenhum teste que
  protegia comportamento real foi removido.
- O código morto (e só ele) saiu do `src/`.
- Você terminou com um número pequeno de PRs (poucos, mas não um só
  gigante), cada um fácil de entender em segundos por só ter um motivo.
- Nada foi removido "no chute" — qualquer coisa ambígua apareceu como
  pendência pra você decidir, em vez de sumir silenciosamente.

Depois de tentar, compare o que você chegou com `docs/mentor-notes.md`.

## Levando isso para o seu projeto real

A skill em `.claude/skills/safe-refactor-planner/` é genérica — não depende
de nada específico deste projeto de exemplo. Basta copiar a pasta
`.claude/skills/safe-refactor-planner/` para dentro do repositório real e
pedir a mesma coisa. O fluxo (inventário → verificação → plano escrito →
execução em worktrees → escalonamento) é o mesmo, só o tamanho do
inventário muda.
