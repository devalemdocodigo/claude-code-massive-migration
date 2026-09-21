# Notas para o mentor (não é parte do exercício)

Gabarito do que foi plantado de propósito neste repositório, para você
comparar com o inventário e o plano que a Claude Code + a mentorada vão
produzir.

## O que é "lixo" e por quê

| Arquivo | Categoria | Por que é seguro remover |
|---|---|---|
| `src/lib/legacyDiscount.js` | Código morto | Não é importado por `src/app.js`, nenhuma rota, nem por `pricing.js`. Só existe porque os testes abaixo ainda o referenciam. |
| `tests/legacyDiscount.test.js` | Testa código morto | Cobre `legacyDiscount.js`, que não é mais chamado em produção. |
| `tests/legacyDiscount.v2.test.js` | Duplicado | Copy-paste de `legacyDiscount.test.js` com dados diferentes; o comentário "TODO: consolidar" denuncia a origem. |
| `tests/legacyDiscount.edgecases.test.js` | Duplicado | Mais casos do mesmo código morto; não agrega cobertura de nada que importe. |
| `tests/pricing.internals.test.js` | Teste de implementação | Testa `_internal` (helpers expostos só para teste) em vez do comportamento público de `calculateQuote`, já coberto em `tests/pricing.test.js`. Quebra à toa se `pricing.js` for refatorado internamente. |
| `tests/pricing.old-skipped.test.js` | Skip esquecido | `describe.skip` com TODO datado de 2021, referenciando um ticket antigo (`PROJ-482`) e um recurso (multi-moeda) que nunca foi implementado. |

## O que é código legítimo (não deve ser tocado)

`src/lib/pricing.js` (exceto `_internal`), `src/lib/tax.js`,
`src/lib/formatOrder.js`, `src/routes/*.js`, `src/app.js`, `src/server.js`,
e os testes: `tests/pricing.test.js`, `tests/tax.test.js`,
`tests/formatOrder.test.js`, `tests/routes/quote.test.js`,
`tests/routes/orderStatus.test.js`.

Pegadinha proposital: o export `_internal` em `pricing.js` é código "vivo"
no sentido de que existe e é importado — mas só é importado pelo teste de
implementação que também deveria ser removido. Uma boa execução do
exercício remove tanto `pricing.internals.test.js` quanto o export
`_internal` (ele deixa de ter motivo para existir depois que o teste sai) —
vale observar se a mentorada/a skill percebem essa segunda camada.

## Agrupamento de PRs "gabarito" (referência, não a única resposta certa)

- **PR 1 — Remover código morto do antigo motor de desconto:**
  `src/lib/legacyDiscount.js` + seus três arquivos de teste
  (`legacyDiscount.test.js`, `.v2.test.js`, `.edgecases.test.js`).
- **PR 2 — Remover teste de skip esquecido:** `tests/pricing.old-skipped.test.js`.
- **PR 3 — Remover teste de detalhe de implementação:**
  `tests/pricing.internals.test.js` e, se a mentorada perceber a pegadinha,
  o export `_internal` de `src/lib/pricing.js`.

Isso dá ~3 PRs, cada um com um motivo único e diff pequeno — o ponto de
equilíbrio que a skill deve buscar. Se ela chegar em 2–4 PRs com motivos
bem separados, está no caminho certo; mais que isso sem uma boa razão é
sinal de fragmentação excessiva, e "um PR só com tudo" é sinal de que a
Fase 3 da skill (dimensionamento) não foi seguida.

Bônus didático: PR 1, PR 2 e PR 3 não tocam nenhum arquivo em comum, então
são um bom exemplo real de "conflita com: nenhum" — a skill deveria
disparar os três subagentes/worktrees em paralelo na Fase 5, e isso é uma
boa coisa pra apontar pra ela quando ela chegar nessa etapa.
