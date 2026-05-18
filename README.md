# SIGEP-HUC — Sistema de Gestão Estratégica de Processos

Plataforma web para gestão operacional hospitalar construída com **Google Apps Script + Google Sheets + WebApp**, projetada para transformar rotinas críticas em fluxos digitais padronizados, rastreáveis e confiáveis.

---

## 🧭 Nome do sistema

**SIGEP-HUC** (Sistema de Gestão Estratégica de Processos do Hospital Universitário do Ceará).

---

## 📌 Descrição objetiva

O SIGEP-HUC é um sistema institucional para organizar processos, acompanhamentos e indicadores em uma única interface operacional.  
A base continua no Google Sheets, mas o uso diário acontece no WebApp, com módulos de consulta, atualização e monitoramento.

---

## 🚨 Problema que o sistema resolve

Antes da implantação, a operação dependia de controles manuais distribuídos em várias abas e layouts heterogêneos. Isso gerava:

- tempo excessivo para localizar informações e pendências;
- retrabalho entre setores;
- inconsistências de preenchimento;
- baixa visibilidade gerencial para decisões rápidas.

O SIGEP-HUC resolve esse cenário ao separar **dados (planilha)** de **experiência operacional (WebApp)**, aplicando regras claras de atualização e visão consolidada por unidade, processo e indicador.

---

## ⚙️ Principais funcionalidades

- **Dashboard executivo** com KPIs e visão rápida de situação operacional;
- **Gestão de processos** com atualização de status e responsáveis;
- **Acompanhamento por unidade** com filtros e priorização visual;
- **Módulo de indicadores** com metas e lançamentos periódicos;
- **Busca e filtros avançados** para navegação ágil;
- **Atualizações em lote** para reduzir trabalho repetitivo;
- **Controle de acesso por perfil**;
- **Auditoria/histórico** para rastreabilidade de alterações;
- **Rotinas administrativas** para consistência e saúde das bases.

---

## 🧰 Tecnologias utilizadas

- **Google Apps Script** (backend e regras de negócio)
- **Google Sheets** (persistência de dados)
- **HTML5 + CSS3 + JavaScript Vanilla** (frontend)
- **HtmlService** (renderização do WebApp)
- **CacheService** (otimização de leitura)
- **LockService** (escrita concorrente segura)

---

## 🗂️ Estrutura do projeto

```bash
SIGEP_HUC/
├── Code.gs                                # Backend principal e serviços do WebApp
├── Index.html                             # Frontend completo (UI, estilos e interação)
├── README.md                              # Documentação técnica para GitHub
├── PORTFOLIO.md                           # Versão estratégica para apresentação
├── ROADMAP_MATURIDADE_SIGEP_HUC.md        # Evolução planejada do produto
└── Gerenciamento planilhas de processos HUC.xlsx
```

---

## 🔄 Fluxo de funcionamento

1. **Acesso ao WebApp:** usuário autenticado entra no sistema.
2. **Carga inicial:** backend consolida dados das bases e entrega ao front.
3. **Operação diária:** equipes atualizam processos, acompanhamentos e indicadores.
4. **Validação e controle:** regras de permissão + lock previnem erros de concorrência.
5. **Rastreabilidade:** alterações relevantes podem ser registradas em histórico.
6. **Leitura gerencial:** dashboard e filtros permitem análise rápida por cenário.

---

## 🖼️ Capturas de tela

> Espaço reservado para prints oficiais do sistema em produção.

### 1) Dashboard geral
![Dashboard SIGEP-HUC](./docs/images/dashboard-geral.png)

### 2) Gestão de processos
![Gestão de processos](./docs/images/gestao-processos.png)

### 3) Acompanhamento por unidade
![Acompanhamento por unidade](./docs/images/acompanhamento-unidade.png)

### 4) Painel de indicadores
![Painel de indicadores](./docs/images/painel-indicadores.png)

---

## 🚀 Como executar

### Pré-requisitos

- Conta Google com acesso ao Google Sheets e Apps Script;
- Planilha base do projeto;
- Permissões para implantação de WebApp.

### Passo a passo

1. Abra a planilha base no Google Sheets.
2. Vá em **Extensões → Apps Script**.
3. Garanta que os arquivos principais do projeto estejam no script editor (`Code.gs` e `Index.html`).
4. Configure as abas-base obrigatórias (processos, acompanhamento, indicadores, usuários, histórico).
5. Execute funções administrativas necessárias para validação inicial da base.
6. Publique em **Implantar → Nova implantação → Aplicativo da Web**.
7. Defina quem pode acessar e executar conforme política interna.
8. Acesse a URL gerada e valide os módulos com usuários de teste.

---

## 🔭 Melhorias futuras

- Alertas automáticos de SLA por processo/unidade;
- Relatórios executivos em PDF com envio programado;
- Notificações por e-mail para pendências críticas;
- Painéis comparativos de desempenho por período;
- Camada adicional de observabilidade e trilhas de auditoria.

---

## 👤 Autor

**Equipe SIGEP-HUC**

Se desejar, inclua aqui:

- nome do responsável técnico;
- cargo/função;
- LinkedIn;
- e-mail institucional;
- portfólio profissional.
