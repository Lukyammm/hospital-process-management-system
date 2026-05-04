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
