# Revisão de UX, Fluxo e Indicadores — SIGEP-HUC

Resposta à Ordem de Mudança "Reorganização de Fluxo, Usabilidade e Indicadores".
Este documento entrega o diagnóstico, as propostas e o plano de execução, e registra
o que já foi implementado nesta entrega.

---

## 1. Diagnóstico dos problemas encontrados

**Arquitetura do frontend**
- Toda a interface está em um único `Index.html` (~5.100 linhas) com HTML, CSS e JS
  misturados. Há regras de CSS muito específicas e uso de `!important` (sobretudo no
  tema escuro), dificultando manutenção e gerando sobreposição de estilos.
- Não há componentes reutilizáveis: botões, cards, tabelas, formulários e modais são
  repetidos com pequenas variações.

**Fluxo e navegação**
- Os módulos (Acompanhamento, Modelagem de Processos, Mapeamento, Indicadores,
  Administração) não comunicam uma sequência de uso. O usuário não percebe o caminho
  "cadastrar → acompanhar → lançar dados → revisar → visualizar resultados".
- A área de Indicadores dependia exclusivamente de importação de planilha externa para
  lançar numerador/denominador/resultado — não existia lançamento manual mês a mês
  dentro do sistema (o texto da tela dizia explicitamente "sem digitação manual").

**Linguagem**
- Mistura de português com termos técnicos/inglês. Exemplos citados na ordem
  (`renderDashboard`, `loadAdminDate`, `reviewDate`, `applySuggestion`,
  `applySuggestionBatch`, `fixDataManually`, "In Analysis", "Cleanup") são nomes de
  **funções/estados internos** — não rótulos visíveis ao usuário final. A correção
  correta é garantir que **rótulos de tela** estejam 100% em português operacional
  (já estão, em sua maioria) e padronizar nomes internos numa refatoração futura, sem
  expô-los na interface.

**Modais e edição**
- Edição de registros acontece em formulários injetados no drawer; a experiência é
  funcional, mas visualmente densa e pouco padronizada entre módulos.

---

## 2. Lista de melhorias propostas

| # | Melhoria | Prioridade |
|---|----------|-----------|
| 1 | Lançamento mensal manual em formato de planilha (num/den/resultado/meta/status) | Urgente — **feito** |
| 2 | Cálculo automático do resultado e status por mês na própria grade | Urgente — **feito** |
| 3 | Texto da tela de planilha de gestão atualizado para citar o lançamento manual | Urgente — **feito** |
| 4 | Padronização de modais/formulários (componente único) | Importante |
| 5 | Barra de fluxo guiado entre módulos | Importante |
| 6 | Padrões únicos de botão/card/tabela/modal em CSS | Importante |
| 7 | Glossário de linguagem operacional e revisão de rótulos | Importante |
| 8 | Refatoração do frontend em componentes e separação CSS/JS | Melhoria futura |

---

## 3. Redesenho do fluxo principal

Sequência operacional proposta, a ser reforçada por uma barra de etapas no topo de
cada módulo:

```
1. Cadastrar    → criar processo / indicador / acompanhamento
2. Acompanhar   → ver status por unidade e etapa
3. Lançar dados → preencher resultados mensais (planilha do sistema)
4. Revisar      → conferir desvios e justificar fora da meta
5. Visualizar   → histórico, tendência e painéis executivos
```

Cada módulo deve indicar em qual etapa o usuário está e qual é o próximo passo.

---

## 4. Nova organização da área de Indicadores

A ficha do indicador passa a ter abas com ordem lógica de uso:

1. **Resumo** — ficha técnica, meta, resultado atual e planilha de gestão.
2. **Lançamento mensal** — *(novo)* grade tipo planilha para preencher os dados do mês.
3. **Histórico** — série histórica, gráfico e tabela por competência.
4. **Metas por período** — vigências de meta.
5. **Auditoria** — comentários e trilha de alterações.

Fica claro **onde lançar** (aba Lançamento mensal) e **onde acompanhar** (Histórico).

---

## 5. Tela de lançamento mensal em formato de planilha — IMPLEMENTADA

Nova aba **"Lançamento mensal"** na ficha do indicador (`Index.html`):

- Tabela com uma linha por competência. Colunas: **Competência · Numerador ·
  Denominador · Resultado · Meta · Status · Ações**.
- As últimas 12 competências (respeitando a periodicidade do indicador — mensal,
  bimestral, trimestral, etc.) já aparecem em aberto, junto das competências que já
  têm lançamento.
- Numerador ÷ denominador **calcula o resultado automaticamente**; o usuário também
  pode digitar o resultado direto.
- O **status** (Dentro da meta / Fora da meta) é recalculado ao vivo conforme o
  usuário digita, usando a meta vigente da competência.
- Botão **Salvar** por linha grava a competência via backend já existente
  (`atualizarLancamentoIndicador` → `IndicadorService.updateLancamento`), que faz
  *upsert* na planilha `BASE_LANCAMENTOS_INDICADORES` com trilha de auditoria.
- **Justificativa obrigatória** quando o resultado fica fora da meta (mesma regra do
  backend), solicitada em modal no momento de salvar.
- Botão **"+ Adicionar competência"** para lançar um mês fora da janela padrão.
- Indicadores conectados a planilha de gestão recebem aviso de que a sincronização
  sobrescreve os meses importados.

Assim o lançamento manual deixa de depender de importação de planilha externa.

---

## 6. Padronização visual de modais, formulários e tabelas (proposta)

- Criar um único componente de modal/drawer com cabeçalho, corpo e rodapé de ações
  consistentes; aplicar a todos os fluxos de edição.
- Tabelas devem reusar a base `.history-table` (agora estendida por `.ledger-table`
  para grades editáveis), em vez de estilos avulsos.
- Inputs com um estado de foco único (`.ledger-input` já estabelece esse padrão:
  borda + halo na cor primária).
- Estados vazios, mensagens de erro e confirmações com a mesma linguagem visual
  (`.empty`, toasts, `ui.dialog`).

---

## 7. Padronização de linguagem

- Rótulos visíveis: manter 100% em português operacional. Substituir qualquer
  resquício técnico por termos como "Lançar dados", "Em análise", "Limpeza de dados".
- Nomes internos (`renderDashboard`, `applySuggestion`, etc.): renomear apenas na
  refatoração (item 8), pois não aparecem para o usuário; o risco/custo de renomear
  agora não traz benefício de UX imediato.
- Manter um glossário em `docs/` com o termo canônico de cada conceito.

---

## 8. Plano de execução priorizado

**Urgente (entregue nesta mudança)**
- [x] Aba de lançamento mensal em formato de planilha.
- [x] Numerador, denominador, resultado, meta e status por mês.
- [x] Cálculo de resultado e status automáticos + justificativa de desvio.
- [x] Atualização do texto sobre digitação manual.

**Importante (próximas iterações)**
- [ ] Barra de fluxo guiado entre módulos.
- [ ] Componente único de modal/formulário.
- [ ] Padrões únicos de botão/card/tabela em CSS, reduzindo `!important`.
- [ ] Glossário e revisão final de rótulos.

**Melhoria futura**
- [ ] Refatorar frontend em componentes e separar CSS/JS do `Index.html`.
- [ ] Onboarding guiado para novos usuários.
</content>
</invoke>
