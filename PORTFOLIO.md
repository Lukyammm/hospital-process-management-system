# SIGEP-HUC — Sistema de Gestão Estratégica de Processos Hospitalares

> Uma solução web operacional construída sobre Google Apps Script + Google Sheets para transformar controle manual em gestão orientada por dados.

---

## ✨ Introdução estratégica

O **SIGEP-HUC** foi concebido para resolver um desafio comum em ambientes hospitalares: informações críticas dispersas em planilhas complexas, com alto esforço operacional e baixa previsibilidade para tomada de decisão.

A proposta foi clara: manter a praticidade do ecossistema Google, mas elevar o nível de operação para um produto digital real — com experiência de uso moderna, fluxo padronizado, governança e rastreabilidade.

---

## 🏥 Contexto do problema operacional

No cenário anterior, as equipes lidavam com:

- controles em abas extensas e visualmente heterogêneas;
- dependência de conhecimento tácito para atualizar dados;
- baixa padronização de status e etapas;
- dificuldade para consolidar visão executiva entre setores.

Em um contexto hospitalar, esse tipo de fragilidade afeta diretamente agilidade, qualidade da gestão e segurança da informação operacional.

---

## 🔄 Como o sistema melhorou o processo

Com o SIGEP-HUC, a operação saiu da lógica “planilha como tela” para “planilha como banco + WebApp como sistema”.

### Ganhos práticos

- **Padronização do fluxo operacional** com regras claras de atualização.
- **Centralização da informação** em módulos organizados por contexto.
- **Redução de erros manuais** com validação e escrita controlada.
- **Rastreabilidade das mudanças** por histórico/auditoria.
- **Leitura executiva mais rápida** via dashboard e filtros inteligentes.

---

## 🧠 Diferenciais técnicos e funcionais

- Arquitetura com separação entre **migração de dados**, **serviços de negócio** e **interface**.
- Organização por classes no backend para manutenção sustentável.
- Uso de **LockService** para evitar concorrência em gravações críticas.
- Uso de **CacheService** para melhorar performance de leitura.
- Modelo de permissões com foco em governança por perfil.
- Interface responsiva, com cards, estados visuais e linguagem de produto.

---

## 🤖 Principais automações

- Normalização das bases a partir de estruturas legadas.
- Atualizações em lote para operações com volume.
- Rotinas de verificação de consistência de dados.
- Snapshot analítico para apoio ao monitoramento gerencial.
- Registro de eventos relevantes em histórico.

---

## 📈 Resultados e impacto

Resultados observados no uso operacional do sistema:

- menor tempo para localizar pendências e atualizar status;
- redução de retrabalho entre áreas;
- maior confiança no dado para reuniões de gestão;
- visibilidade ampliada sobre evolução de processos e indicadores;
- operação mais estável mesmo com múltiplos usuários.

> Impacto central: o time passa a gastar menos energia com manutenção manual de planilhas e mais energia com análise e execução.

---

## 🛠️ Tecnologias utilizadas

- **Google Apps Script**
- **Google Sheets**
- **HTML5 / CSS3 / JavaScript (Vanilla)**
- **HtmlService, CacheService e LockService**

---

## 🖼️ Prints / mockups destacados

> Espaço reservado para evidências visuais do produto em uso.

### 1) Visão executiva
![Visão executiva do SIGEP-HUC](./docs/images/portfolio-dashboard.png)

### 2) Gestão operacional por unidade
![Gestão operacional por unidade](./docs/images/portfolio-unidades.png)

### 3) Painel de indicadores
![Painel de indicadores](./docs/images/portfolio-indicadores.png)

---

## ✅ Conclusão (produto e solução real)

O SIGEP-HUC demonstra como é possível construir um sistema corporativo robusto sem stack excessivamente complexa, aproveitando infraestrutura Google já disponível e adicionando camada de produto, governança e experiência do usuário.

Mais do que “automatizar planilha”, a solução estrutura processo, melhora decisão e reduz risco operacional — com aderência ao contexto real de uma instituição de saúde.
