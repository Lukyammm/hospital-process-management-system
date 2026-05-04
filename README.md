# SIGEP-HUC | Versão refeita

Esta versão foi refeita considerando a estrutura real da planilha enviada.

## Ordem de instalação

1. Abra a planilha original no Google Sheets.
2. Vá em Extensões > Apps Script.
3. Crie um arquivo chamado `Migrador_SIGEP_HUC.gs`.
4. Cole o conteúdo de `Migrador_SIGEP_HUC.gs`.
5. Rode a função `criarBasesSigepHuc()`.
6. Cole/substitua o arquivo `Code.gs`.
7. Crie/substitua o arquivo HTML chamado `Index`.
8. Cole o conteúdo de `Index.html`.
9. Publique como App da Web.

## Regra corrigida do acompanhamento

A aba original `ACOMPANHAMENTO` não é uma tabela comum. Ela é uma matriz visual com unidades mescladas e várias datas por unidade.

Nesta versão, a regra é:

- se UIB tem 3 datas, `BASE_ACOMPANHAMENTO` terá 3 linhas para UIB;
- a unidade é herdada das células mescladas;
- os status das etapas também são herdados das células mescladas;
- a interface agrupa essas linhas em cards por unidade, mantendo a linha do tempo com todas as datas.

## Abas criadas/recriadas

- BASE_PROCESSOS
- BASE_ACOMPANHAMENTO
- BASE_INDICADORES
- BASE_LANCAMENTOS_INDICADORES
- BASE_UNIDADES
- CONFIG_STATUS
- CONFIG_TIPOS_PROCESSO
- USUARIOS
- HISTORICO
- DASHBOARD_BASE
- SIGEP_README

As abas originais não são apagadas.

# README técnico para IA - SIGEP-HUC

Este documento existe para que qualquer IA, pessoa desenvolvedora ou manutenção futura entenda o sistema SIGEP-HUC sem precisar redescobrir a lógica da planilha original.

O SIGEP-HUC é um WebApp Google Apps Script criado para transformar uma planilha de gerenciamento de processos do Hospital Universitário do Ceará em um sistema visual, moderno e usável. A planilha continua sendo o banco de dados, mas o usuário final não deve precisar editar células, entender abas internas, IDs, colunas, JSON ou código para usar o sistema.

## 1. Objetivo do sistema

O sistema gerencia três grandes áreas:

1. Processos modelados do HUC.
2. Acompanhamento das unidades assistenciais por data, status de agendamento e etapas.
3. Indicadores finalísticos, de apoio e gerenciais, com metas e competências mensais.

O objetivo central é tirar o usuário da operação manual da planilha e entregar uma interface com cara de sistema:

- Dashboard executivo.
- Cards de acompanhamento por unidade.
- Cards de processos.
- Cards de indicadores.
- Filtros e busca global.
- Edição via modal.
- Registro de histórico.
- Estrutura de dados normalizada para o WebApp.

## 2. Princípio principal

A planilha original foi feita para leitura humana, com células mescladas, cores, blocos e agrupamentos visuais.

O WebApp precisa de bases em formato de banco de dados, com linhas completas, IDs e colunas estáveis.

Por isso existem dois mundos:

1. Abas originais: preservadas, com o layout atual da planilha.
2. Abas novas do SIGEP-HUC: criadas pelo migrador para o sistema consumir.

As abas originais não devem ser apagadas nem alteradas pelo migrador.

As abas novas podem ser apagadas e recriadas quando a função principal do migrador for executada.

## 3. Arquivos do projeto

O projeto está dividido em três arquivos principais.

### 3.1 `Migrador_SIGEP_HUC.gs`

Arquivo separado, usado para criar ou recriar as bases do sistema dentro da própria planilha.

Função principal:

```javascript
criarBasesSigepHuc()
```

Essa função recria as abas novas e importa/adapta os dados das abas originais.

Função segura:

```javascript
criarBasesSigepHucSemLimpar()
```

Essa função apenas garante que as abas novas existam. Ela não limpa dados existentes.

Quando houve erro de migração, mudança estrutural ou necessidade de refazer as bases, usar `criarBasesSigepHuc()`.

Quando o sistema já está em uso e não se quer apagar dados das bases novas, usar `criarBasesSigepHucSemLimpar()`.

### 3.2 `Code.gs`

Backend do WebApp.

Responsabilidades:

- Servir o HTML do sistema.
- Ler as abas `BASE_*`.
- Entregar dados iniciais para o front-end.
- Atualizar processos, acompanhamentos e indicadores.
- Registrar histórico de alterações.
- Separar responsabilidades usando classes.

Principais funções públicas:

```javascript
doGet()
getSigepData()
atualizarStatusAcompanhamento(payload)
atualizarProcesso(payload)
atualizarIndicador(payload)
```

Principais classes:

```javascript
SigepApplication
SheetRepository
ProcessoService
AcompanhamentoService
IndicadorService
DashboardService
AuditService
```

### 3.3 `Index.html`

Front-end completo do WebApp, com HTML, CSS e JavaScript no mesmo arquivo.

Responsabilidades:

- Renderizar dashboard.
- Renderizar acompanhamento em cards agrupados por unidade.
- Renderizar processos.
- Renderizar indicadores.
- Fornecer busca global.
- Abrir modal de edição.
- Chamar o backend via `google.script.run`.

A interface usa:

- Fonte Inter.
- CSS leve.
- Ícones SVG inline.
- Sem emojis na interface.
- Sem bibliotecas pesadas.
- Sem Bootstrap, sem Font Awesome, sem Material Icons externo.

## 4. Abas originais usadas como fonte

O migrador procura estas abas originais:

```text
PAINEL MODELAGENS DE PROCESSO
ACOMPANHAMENTO
LISTA DE INDICADORES FINALÍSTIC
LISTA DE INDICADORES APOIOS
LISTA DE INDICADORES GERENCIAIS
```

A busca por aba é tolerante a espaços e acentos, porque a aba `ACOMPANHAMENTO` pode aparecer com espaço invisível antes do nome na planilha original.

Exemplo tratado pelo código:

```text
"ACOMPANHAMENTO"
" ACOMPANHAMENTO"
```

## 5. Abas novas criadas pelo SIGEP-HUC

O migrador cria ou recria estas abas:

```text
BASE_PROCESSOS
BASE_ACOMPANHAMENTO
BASE_INDICADORES
BASE_LANCAMENTOS_INDICADORES
BASE_UNIDADES
CONFIG_STATUS
CONFIG_TIPOS_PROCESSO
USUARIOS
HISTORICO
DASHBOARD_BASE
SIGEP_README
```

Essas abas são a fonte oficial do WebApp.

O WebApp não deve ler diretamente as abas originais, exceto em uma rotina específica de migração.

## 6. Regra crítica da aba ACOMPANHAMENTO

A aba `ACOMPANHAMENTO` original não é uma tabela simples. Ela é uma matriz visual com células mescladas.

A regra correta atual é:

Se uma unidade tem 3 datas, então `BASE_ACOMPANHAMENTO` precisa ter 3 linhas para essa unidade.

Exemplo conceitual:

Na aba original:

```text
UIB
23/07 - Reagendado pelo Gestor
23/08 - Reagendado pelo Gestor
23/09 - Realizada
```

Na base nova:

```text
ACO-001 | UIB | 1 | 23/07 | Reagendado pelo Gestor | etapas herdadas
ACO-002 | UIB | 2 | 23/08 | Reagendado pelo Gestor | etapas herdadas
ACO-003 | UIB | 3 | 23/09 | Realizada | etapas herdadas
```

Ou seja: não existe mais `BASE_AGENDAMENTOS` separada nesta versão. A própria `BASE_ACOMPANHAMENTO` contém uma linha por data/status.

Essa decisão foi tomada para refletir exatamente o funcionamento atual da planilha.

### 6.1 Colunas da `BASE_ACOMPANHAMENTO`

```text
ID_ACOMPANHAMENTO
UNIDADE
ORDEM_AGENDAMENTO_UNIDADE
DATA_AGENDAMENTO
STATUS_AGENDAMENTO
INTRODUCAO
PERFIL
FLUXO_PROCESSO
MODELAGEM
INDICADORES
FICHA_TECNICA_INDICADORES
ETAPAS_CONCLUIDAS
ETAPAS_TOTAL
PROGRESSO_PERCENTUAL
STATUS_GERAL
```

### 6.2 Herança de células mescladas

Na planilha original, uma célula mesclada mostra visualmente o mesmo valor em várias linhas, mas tecnicamente só a primeira linha tem valor.

O migrador resolve isso usando memória.

Regra:

- Quando encontra uma nova unidade, guarda como `unidadeAtual`.
- Enquanto as próximas linhas não tiverem unidade preenchida, usa a última `unidadeAtual`.
- O mesmo vale para as etapas: `Introdução`, `Perfil`, `Fluxo do processo`, `Modelagem`, `Indicadores` e `Ficha técnica dos indicadores`.

Isso evita linhas vazias ou quebradas no WebApp.

## 7. Regra crítica das abas de indicadores

As abas de indicadores também usam células mescladas e agrupamentos visuais.

Abas fonte:

```text
LISTA DE INDICADORES FINALÍSTIC
LISTA DE INDICADORES APOIOS
LISTA DE INDICADORES GERENCIAIS
```

Cada aba possui lógica semelhante:

- Processo ou área.
- Resultado esperado.
- Nome do indicador.
- Tipo de indicador.
- Meta.
- Competências mensais, por exemplo `jan./26`, `fev./26`, `mar./26`.

A regra correta é separar dados fixos de indicadores e lançamentos mensais.

### 7.1 `BASE_INDICADORES`

Guarda a definição fixa do indicador.

Colunas:

```text
ID_INDICADOR
CATEGORIA
PROCESSO
RESULTADO_ESPERADO
NOME_INDICADOR
TIPO_INDICADOR
META
ABA_ORIGEM
LINHA_ORIGEM
```

Categorias possíveis:

```text
FINALÍSTICO
APOIO
GERENCIAL
```

### 7.2 `BASE_LANCAMENTOS_INDICADORES`

Guarda os valores por competência mensal.

Colunas:

```text
ID_LANCAMENTO
ID_INDICADOR
CATEGORIA
PROCESSO
NOME_INDICADOR
COMPETENCIA
MES
ANO
VALOR
META
STATUS_META
```

Cada indicador gera uma linha de lançamento para cada competência encontrada no cabeçalho mensal.

Mesmo quando o valor mensal está vazio, o lançamento é criado. Isso permite o preenchimento posterior pelo sistema.

### 7.3 Herança nos indicadores

Se a célula `PROCESSOS DE APOIO` ou `RESULTADO` estiver mesclada, o migrador herda o último valor preenchido acima.

Exemplo correto:

```text
APOIO | FARMÁCIA/CAF | DISPONIBILIZAR EM TEMPO OPORTUNO... | PGA
APOIO | FARMÁCIA/CAF | DISPONIBILIZAR EM TEMPO OPORTUNO... | CONFORMIDADE NO ABASTECIMENTO
APOIO | FARMÁCIA/CAF | DISPONIBILIZAR EM TEMPO OPORTUNO... | PERDAS
```

Nunca deixar assim:

```text
APOIO | vazio | vazio | CONFORMIDADE NO ABASTECIMENTO
```

## 8. Regra da aba de processos

Fonte:

```text
PAINEL MODELAGENS DE PROCESSO
```

Base criada:

```text
BASE_PROCESSOS
```

Colunas:

```text
ID_PROCESSO
SETOR
TIPO_PROCESSO
QUANTIDADE
PROCESSO
MODELAGEM_REALIZADA
REVISAO_2027_UNIDADE
VALIDACAO_NUGESP
VALIDACAO_DIRECAO
PUBLICACAO
STATUS_GERAL
```

A base remove duplicidades simples por combinação normalizada de:

```text
SETOR + TIPO_PROCESSO + PROCESSO
```

O status geral é calculado com base nos campos:

```text
MODELAGEM_REALIZADA
REVISAO_2027_UNIDADE
VALIDACAO_NUGESP
VALIDACAO_DIRECAO
PUBLICACAO
```

Regra geral:

- Todos `SIM`: `Concluído`.
- Algum `SIM`: `Em andamento`.
- Nenhum `SIM`: `Pendente`.

## 9. Outras bases

### 9.1 `BASE_UNIDADES`

Consolida unidades/setores encontrados em:

- Processos.
- Acompanhamento.
- Indicadores.

Colunas:

```text
ID_UNIDADE
UNIDADE
ORIGEM
```

### 9.2 `CONFIG_STATUS`

Lista status usados no sistema, principalmente no acompanhamento.

Colunas:

```text
TIPO
STATUS
ORDEM
COR_SUGERIDA
```

Alguns status esperados:

```text
Não iniciada
Em andamento
Em andamento pela Epidemio
Concluída
Realizada
Reagendado pelo Gestor
Reagendado Nugesp
Não agendada
```

### 9.3 `CONFIG_TIPOS_PROCESSO`

Lista tipos de processo encontrados na aba de modelagens.

Colunas:

```text
TIPO_PROCESSO
DESCRICAO
```

### 9.4 `USUARIOS`

Base inicial para controle futuro de permissões.

Colunas:

```text
EMAIL
NOME
PERFIL
UNIDADE
ATIVO
```

A versão atual cria o usuário ativo como administrador inicial.

### 9.5 `HISTORICO`

Registra ações feitas pelo sistema.

Colunas:

```text
DATA_HORA
USUARIO
ACAO
ENTIDADE
ID_REGISTRO
DETALHES
```

### 9.6 `DASHBOARD_BASE`

Resumo estático criado na migração.

Colunas:

```text
INDICADOR
VALOR
OBSERVACAO
```

O WebApp também calcula dashboard dinamicamente pelo `DashboardService`.

### 9.7 `SIGEP_README`

Aba simples dentro da planilha com resumo da migração.

Não substitui este README técnico.

## 10. Backend e arquitetura POO

O `Code.gs` foi organizado para separar responsabilidades.

### 10.1 `SigepApplication`

Classe de orquestração.

Cria repositório, serviços e monta o pacote inicial de dados.

Método principal:

```javascript
getInitialData()
```

Retorna:

```javascript
{
  ok: true,
  generatedAt: "...",
  user: "email@dominio",
  dashboard: {...},
  processos: [...],
  acompanhamento: [...],
  indicadores: [...],
  lancamentos: [...],
  unidades: [...]
}
```

### 10.2 `SheetRepository`

Camada de acesso à planilha.

Responsabilidades:

- Buscar aba por nome.
- Converter linhas em objetos usando o cabeçalho.
- Atualizar registro por ID.
- Inserir nova linha.

Métodos principais:

```javascript
getSheet(name)
getObjects(sheetName)
updateById(sheetName, idColumn, id, patch)
append(sheetName, row)
```

Qualquer acesso direto a `SpreadsheetApp` deve ficar preferencialmente aqui.

### 10.3 `ProcessoService`

Regra de negócio dos processos.

Responsabilidades:

- Listar processos.
- Atualizar status/campos do processo.
- Recalcular `STATUS_GERAL`.
- Registrar histórico via `AuditService`.

### 10.4 `AcompanhamentoService`

Regra de negócio do acompanhamento.

Responsabilidades:

- Listar linhas de acompanhamento.
- Atualizar data, status de agendamento e etapas.
- Recalcular etapas concluídas, total, percentual e status geral.
- Registrar histórico.

Atenção: cada linha representa uma data/status de uma unidade. Se uma unidade tem 3 datas, existem 3 registros editáveis.

### 10.5 `IndicadorService`

Regra de negócio dos indicadores.

Responsabilidades:

- Listar indicadores.
- Listar lançamentos.
- Atualizar definição do indicador.
- Registrar histórico.

A versão atual não possui uma função pública específica para editar `BASE_LANCAMENTOS_INDICADORES`. Isso pode ser evoluído depois.

### 10.6 `DashboardService`

Calcula indicadores do painel inicial.

Exemplos:

- Total de processos.
- Processos concluídos.
- Linhas de acompanhamento.
- Unidades acompanhadas.
- Agendamentos realizados.
- Reagendamentos.
- Progresso médio.
- Total de indicadores.
- Lançamentos mensais preparados.
- Lançamentos preenchidos.

### 10.7 `AuditService`

Registra alterações na aba `HISTORICO`.

Se o histórico falhar, o sistema não deve quebrar a operação principal.

## 11. Front-end e experiência do usuário

O `Index.html` foi feito para parecer sistema, não uma tabela dentro do navegador.

### 11.1 Padrão visual

- Fonte Inter.
- Verde institucional como cor principal.
- Cards com cantos arredondados.
- Ícones SVG inline.
- Sombras leves.
- Sem emojis na interface.
- Sem bibliotecas externas pesadas.
- Visual limpo e responsivo.

### 11.2 Estrutura visual

O sistema possui navegação lateral com seções como:

- Dashboard.
- Acompanhamento.
- Processos.
- Indicadores.

A busca global filtra os dados exibidos.

### 11.3 Acompanhamento no front-end

Acompanhamento deve ser agrupado por unidade.

A unidade aparece como card.

Dentro do card devem aparecer:

- Nome da unidade.
- Progresso geral.
- Etapas.
- Linha do tempo com todas as datas/status.

Importante: embora `BASE_ACOMPANHAMENTO` tenha uma linha por data, visualmente o usuário deve entender como um acompanhamento por unidade.

### 11.4 Processos no front-end

Processos devem aparecer como cards ou lista visual rica.

Evitar aparência de tabela crua.

Cada processo deve mostrar:

- Setor.
- Tipo de processo.
- Nome do processo.
- Status geral.
- Etapas: modelagem, revisão, validação NUGESP, validação direção e publicação.

### 11.5 Indicadores no front-end

Indicadores devem aparecer como cards agrupáveis por categoria/processo.

Cada indicador deve mostrar:

- Categoria.
- Processo.
- Resultado esperado.
- Nome do indicador.
- Tipo.
- Meta.

Lançamentos mensais podem ser mostrados como progresso, chips ou detalhes expansíveis.

## 12. Fluxo correto de instalação

1. Abrir a planilha original no Google Sheets.
2. Acessar `Extensões > Apps Script`.
3. Criar arquivo `Migrador_SIGEP_HUC.gs`.
4. Colar o código do migrador.
5. Rodar:

```javascript
criarBasesSigepHuc()
```

6. Autorizar o script.
7. Confirmar se as abas `BASE_*`, `CONFIG_*`, `USUARIOS`, `HISTORICO`, `DASHBOARD_BASE` e `SIGEP_README` foram criadas.
8. Criar ou substituir `Code.gs` com o backend do sistema.
9. Criar arquivo HTML chamado `Index`.
10. Colar o conteúdo de `Index.html`.
11. Publicar em `Implantar > Nova implantação > App da Web`.

## 13. Fluxo correto de manutenção

Quando a estrutura da planilha original mudar:

1. Rever cabeçalhos das abas originais.
2. Ajustar funções de localização de cabeçalho no migrador.
3. Rodar migração em cópia da planilha antes de rodar em produção.
4. Conferir quantidade de linhas migradas.
5. Conferir amostras dos blocos com células mescladas.
6. Só depois rodar na planilha oficial.

Quando for mudar só visual do sistema:

1. Alterar `Index.html`.
2. Não mexer no migrador.
3. Não recriar bases desnecessariamente.

Quando for mudar regra de dados:

1. Alterar `Migrador_SIGEP_HUC.gs`.
2. Alterar `Code.gs`, se o WebApp precisar consumir novas colunas.
3. Alterar `Index.html`, se o front-end precisar exibir ou editar os novos campos.

## 14. Contrato de dados do WebApp

O front-end espera receber de `getSigepData()`:

```javascript
{
  ok: true,
  generatedAt: string,
  user: string,
  dashboard: object,
  processos: array,
  acompanhamento: array,
  indicadores: array,
  lancamentos: array,
  unidades: array
}
```

Se qualquer uma dessas chaves mudar, revisar o `Index.html`.

## 15. Funções públicas disponíveis no Apps Script

### 15.1 Migração

```javascript
criarBasesSigepHuc()
criarBasesSigepHucSemLimpar()
```

### 15.2 WebApp

```javascript
doGet()
getSigepData()
atualizarStatusAcompanhamento(payload)
atualizarProcesso(payload)
atualizarIndicador(payload)
```

## 16. Regras para futuras IAs

Quando uma IA for modificar este projeto, ela deve seguir estas regras:

1. Não tratar as abas originais como banco de dados final.
2. Não apagar abas originais.
3. Não quebrar a regra de acompanhamento: uma linha por data/status.
4. Não separar agendamentos em outra base nesta versão sem refatorar front-end e backend juntos.
5. Não ignorar células mescladas. Sempre herdar valores de bloco.
6. Não transformar o front-end em tabela crua.
7. Não adicionar bibliotecas pesadas sem necessidade.
8. Não usar emojis na interface.
9. Não mudar nomes de colunas das bases sem atualizar `Code.gs` e `Index.html`.
10. Não usar dados inventados para preencher lacunas.
11. Preservar o máximo possível os textos originais da planilha.
12. Preferir funções pequenas, serviços claros e acesso à planilha centralizado em repositório.

## 17. Pontos de atenção conhecidos

### 17.1 Células mescladas

O maior risco do projeto é ler célula mesclada como vazio e perder contexto.

Isso afeta principalmente:

- Unidade no acompanhamento.
- Etapas do acompanhamento.
- Processo nos indicadores.
- Resultado esperado nos indicadores.

### 17.2 Cabeçalhos com variações

A planilha pode ter acentos, espaços extras e variações de escrita.

Por isso o migrador usa normalização:

- Remove acentos.
- Converte para maiúsculas.
- Remove espaços duplicados.
- Compara nomes normalizados.

### 17.3 Acompanhamento com múltiplas datas

Não consolidar uma unidade em uma única linha se ela tiver várias datas.

A consolidação pode ocorrer apenas na visualização, agrupando cards por unidade.

A base deve manter cada data/status como linha própria.

### 17.4 Valores mensais vazios em indicadores

Não ignorar competências vazias.

Criar lançamentos mesmo sem valor, porque o sistema pode preencher depois.

## 18. Melhorias futuras recomendadas

1. Login/permissão por perfil usando a aba `USUARIOS`.
2. Edição de lançamentos mensais dos indicadores.
3. Exportação PDF do dashboard.
4. Filtros por unidade, categoria e status.
5. Página individual da unidade.
6. Página individual do indicador.
7. Histórico visual de alterações.
8. Alertas por e-mail para pendências.
9. Botão de sincronização controlada a partir das abas originais.
10. Validações de status usando `CONFIG_STATUS`.
11. Dashboard por período.
12. Exportação executiva para reunião.

## 19. Resumo mental do sistema

Pense no SIGEP-HUC assim:

A planilha original é o documento humano.

O migrador é o tradutor.

As bases `BASE_*` são o banco de dados.

O `Code.gs` é a regra de negócio.

O `Index.html` é o sistema que o usuário vê.

A aba `HISTORICO` é a memória operacional.

A regra de ouro: o usuário final deve trabalhar na interface, não na estrutura interna da planilha.

## 20. Checklist rápido para validar se está certo

Depois de rodar `criarBasesSigepHuc()`, conferir:

- `BASE_PROCESSOS` tem processos com IDs `PRO-001`, `PRO-002`, etc.
- `BASE_ACOMPANHAMENTO` tem uma linha para cada data/status da unidade.
- Se `UIB` tinha 3 datas, aparecem 3 linhas para `UIB`.
- Linhas de acompanhamento não ficam com unidade vazia.
- Etapas herdadas não ficam vazias por causa de mesclagem.
- `BASE_INDICADORES` tem indicadores com processo e resultado preenchidos.
- `BASE_LANCAMENTOS_INDICADORES` tem uma linha por indicador e por competência mensal.
- `BASE_UNIDADES` consolida unidades encontradas nas fontes.
- `HISTORICO` registra a migração.
- WebApp carrega sem pedir ao usuário para abrir ou editar base manualmente.

Fim do README técnico.

