# SIGEP-HUC

Sistema de Gestão Estratégica de Processos do Hospital Universitário do Ceará (HUC), desenvolvido em **Google Apps Script + Google Sheets + WebApp** para transformar uma operação baseada em planilhas em uma rotina digital mais confiável, rastreável e simples de operar.

---

## 📌 Descrição objetiva

O **SIGEP-HUC** centraliza o acompanhamento de processos institucionais, monitoramento por unidade assistencial e gestão de indicadores em uma única interface web.

A planilha continua como base de dados, mas a experiência do usuário acontece no WebApp — com cards, filtros, busca, atualização guiada e histórico de alterações.

---

## 🧩 Problema que o sistema resolve

Antes do sistema, o trabalho dependia de abas extensas, células mescladas, atualizações manuais e baixa padronização entre setores.

Na prática, isso gerava:

- retrabalho para localizar e atualizar dados;
- risco de inconsistência entre unidades e períodos;
- baixa visibilidade executiva sobre pendências e evolução;
- dificuldade para manter governança dos indicadores.

O SIGEP-HUC resolve esse cenário ao estruturar os dados e oferecer uma camada de operação com regras claras, reduzindo falhas manuais e acelerando decisões.

---

## ⚙️ Principais funcionalidades

- **Dashboard executivo** com visão consolidada de processos, acompanhamento e indicadores.
- **Gestão de processos** com atualização de status, responsáveis e trilha de execução.
- **Acompanhamento por unidade** com organização em cards e timeline operacional.
- **Gestão de indicadores** (finalísticos, apoio e gerenciais), metas e evolução mensal.
- **Filtros avançados** e busca global para navegação rápida.
- **Atualização em lote** para rotinas com alto volume.
- **Histórico/Auditoria** para rastreabilidade das alterações.
- **Controle de acesso** por perfis e permissões.
- **Jobs operacionais** para rotinas de consistência e manutenção de dados.

---

## 🛠️ Tecnologias utilizadas

- **Google Apps Script** (backend e regras de negócio)
- **Google Sheets** (persistência de dados)
- **HTML5 + CSS3 + JavaScript Vanilla** (frontend WebApp)
- **Google HtmlService** (renderização do app)
- **Google CacheService** (otimização de leitura)
- **Google LockService** (concorrência segura em escrita)

---

## 🗂️ Estrutura do projeto

```text
SIGEP_HUC/
├── Code.gs                          # Backend principal (serviços, auth, auditoria, APIs do WebApp)
├── Index.html                       # Frontend completo (layout, estilos e interações)
├── Migrador_SIGEP_HUC.gs            # Criação/recriação das bases normalizadas
├── ROADMAP_MATURIDADE_SIGEP_HUC.md  # Evolução planejada do produto
└── README.md                        # Documentação principal
```

### Abas-base utilizadas no Google Sheets

- `BASE_PROCESSOS`
- `BASE_ACOMPANHAMENTO`
- `BASE_INDICADORES`
- `BASE_LANCAMENTOS_INDICADORES`
- `BASE_UNIDADES`
- `USUARIOS`
- `HISTORICO`
- `DASHBOARD_BASE`

> As abas originais operacionais podem ser preservadas para referência, enquanto o WebApp consome as bases normalizadas.

---

## 🔄 Fluxo de funcionamento

1. **Migração/normalização:** o migrador estrutura as abas-base para consumo do sistema.
2. **Carga inicial:** o backend consolida dados e entrega payload inicial ao frontend.
3. **Operação diária:** equipes atualizam processos, acompanhamentos e indicadores via interface.
4. **Validação e controle:** regras de negócio, permissões e lock evitam gravações conflitantes.
5. **Rastreabilidade:** cada atualização relevante pode ser registrada em histórico.
6. **Gestão executiva:** dashboard e filtros permitem leitura rápida para decisão.

---

## 🖼️ Capturas de tela

> Substitua os caminhos abaixo pelas imagens reais do projeto.

### Dashboard
![Dashboard SIGEP-HUC](./docs/images/dashboard.png)

### Acompanhamento por unidade
![Acompanhamento por unidade](./docs/images/acompanhamento.png)

### Gestão de indicadores
![Gestão de indicadores](./docs/images/indicadores.png)

---

## 🚀 Como executar

### Pré-requisitos

- Conta Google com acesso ao Google Sheets e Apps Script.
- Planilha base do projeto com as abas de origem.

### Passo a passo

1. Abra a planilha no Google Sheets.
2. Acesse **Extensões → Apps Script**.
3. Crie/atualize os arquivos do projeto:
   - `Migrador_SIGEP_HUC.gs`
   - `Code.gs`
   - `Index.html`
4. Execute a função de migração inicial:
   - `criarBasesSigepHuc()` para recriar bases;
   - ou `criarBasesSigepHucSemLimpar()` para preservar dados existentes.
5. Publique em **Implantar → Nova implantação → Aplicativo da Web**.
6. Defina permissões de execução conforme política interna.
7. Acesse a URL do WebApp e valide os módulos principais.

---

## 🔭 Melhorias futuras

- Painel de SLA com alertas proativos por unidade/processo.
- Exportação gerencial em PDF e relatórios periódicos automatizados.
- Camada de notificações (e-mail/chat) para pendências críticas.
- Ampliação da trilha de auditoria com comparativo antes/depois.
- Evolução para métricas de desempenho em tempo real.

---

## 👤 Autor

**Projeto SIGEP-HUC**

Se quiser, você pode complementar esta seção com:
- nome completo,
- cargo/função,
- LinkedIn,
- e-mail institucional,
- portfólio técnico.
