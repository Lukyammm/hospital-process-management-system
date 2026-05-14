# Roadmap de Maturidade Operacional — SIGEP-HUC

## 1) Leitura executiva

O sistema já está em um bom nível de maturidade para operação real: existe separação entre camadas no backend (`Repository`, `Services`, `Application`), uso de lock de escrita, cache, flags de módulo e interface robusta.

O maior ganho agora não é reconstrução, e sim evolução em:

- confiabilidade operacional,
- governança de dados,
- independência da planilha,
- experiência de uso em escala.

### Resumo do que falta para ficar “redondo de verdade”

- Fortalecer governança e segurança (perfil de acesso, trilha de auditoria e mascaramento de dados sensíveis).
- Criar automações de integridade de base (jobs recorrentes, alertas e auto-correção assistida).
- Fechar lacunas de UX operacional (estados de erro/latência, edição em lote, feedback contextual).
- Padronizar evolução técnica (versionamento funcional, observabilidade e estratégia de deploy).

---

## 2) O que está bom hoje (pontos fortes)

1. **Arquitetura backend organizada**: `SigepApplication` orquestra serviços com responsabilidades distribuídas.
2. **Controle de concorrência**: `LockService` em operações críticas reduz risco de corrupção por edição simultânea.
3. **Cache no carregamento inicial**: reduz custo de leitura na planilha.
4. **Feature flags por módulo**: permite ligar/desligar áreas sem alterações front-end.
5. **Estratégia de migração da planilha original**: preserva abas-fonte e cria bases normalizadas `BASE_*`.
6. **UI moderna e consistente**: linguagem visual profissional, cards, painéis, filtros e hierarquia clara.

---

## 3) Gaps críticos para independência real do sistema

> Independência real = usuário operar tudo pelo WebApp, com segurança, rastreabilidade e baixa dependência de manutenção manual na planilha.

### 3.1 Governança de dados

- Falta formalizar contratos de dados por aba (tipos, obrigatoriedade, domínio de valores).
- Cabeçalhos e schemas ainda dependem de validação pontual; faltam regras de qualidade contínua.
- É necessário bloqueio mais explícito para evitar edição indevida nas abas `BASE_*` fora do app.

### 3.2 Segurança e perfis

- Há serviço de autorização, mas precisa evoluir para RBAC completo (papéis por módulo + ação).
- Recomenda-se distinguir claramente visualização, edição, administração e manutenção técnica.
- Falta política documentada de acesso por setor/unidade (visão segmentada dos dados).

### 3.3 Observabilidade e suporte

- Falta painel de saúde operacional com métricas-chave (erros, latência, volume de writes, locks).
- Falta rotina de alertas (e-mail) quando job falhar ou a integridade cair abaixo de limite.
- Auditoria pode evoluir para histórico comparativo “antes/depois” mais legível para gestão.

### 3.4 UX de operação diária

- Filtros podem ganhar presets operacionais (“Hoje”, “Atrasados”, “Sem atualização > 7 dias”).
- Falta edição em lote com validação (ex.: status de múltiplas unidades/processos).
- Falta modo “fila de trabalho” orientado por prioridade real (risco, prazo, pendência crítica).

---

## 4) Plano de melhoria em 4 fases (sem quebrar o que já funciona)

### Fase 1 — Blindagem operacional (prioridade imediata)

1. Health check agendado diário: schema, obrigatórios, duplicidade de IDs e datas inválidas.
2. Alertas automáticos por e-mail para administradores em erro crítico de base.
3. Trava de edição de base: proteger abas `BASE_*` contra manipulação manual indevida.
4. Backups lógicos: snapshot diário (aba histórica compactada ou arquivo de backup no Drive).

**Resultado esperado:** menos incidentes silenciosos e recuperação mais rápida.

### Fase 2 — Governança e segurança por perfil

1. Matriz RBAC completa por tela e ação (listar/criar/editar/excluir/exportar/admin).
2. Escopo por unidade/setor (usuário visualiza apenas o permitido).
3. Auditoria aprimorada com diff (`valor_anterior` x `valor_novo`) + motivo da alteração.
4. Política de sessão e autoria: toda escrita vinculada ao e-mail autenticado.

**Resultado esperado:** conformidade e confiança institucional.

### Fase 3 — Produtividade de uso (UX + fluxo)

1. Edição em lote com validação e confirmação contextual.
2. Painel de pendências (SLA, atraso, sem atualização, inconsistência).
3. Filtros avançados salvos por usuário.
4. Estados de feedback mais ricos: erro orientado à ação, carregamento por bloco e retry inteligente.

**Resultado esperado:** ganho de tempo real para equipe operacional.

### Fase 4 — Escala e sustentabilidade técnica

1. Paginação server-side padrão em listagens pesadas.
2. Camada de configuração central (chaves, limites, textos, regras).
3. Versionamento funcional (versão de schema + migração incremental).
4. Pipeline de deploy/documentação com checklist de publicação e rollback.

**Resultado esperado:** evolução contínua sem retrabalho.

---

## 5) Melhorias objetivas por módulo

### 5.1 Processos

- Score de criticidade por processo (atraso + status pendente + impacto).
- Linha do tempo de evolução por processo.
- Ações rápidas por card (status, responsável, próxima revisão).

### 5.2 Acompanhamento

- Detecção automática de unidade sem atualização recente.
- Visão semanal/mensal por unidade com tendência.
- Destaque visual de gargalo por etapa (agendamento, modelagem, validação etc.).

### 5.3 Indicadores

- Faixas de performance (acima da meta / em risco / fora da meta).
- Série temporal por competência com comparação com período anterior.
- Justificativa obrigatória para desvios críticos.

### 5.4 Administração

- Gestão de usuários por perfil com validação de domínio de e-mail.
- Configurações versionadas (quem alterou, quando, por quê).
- Relatório automático mensal de uso e integridade.

---

## 6) Riscos atuais (se nada for melhorado)

1. Dependência de manutenção manual em incidentes de dados.
2. Perda de rastreabilidade completa em alterações sensíveis.
3. Queda de performance gradual com crescimento de linhas.
4. Aumento de suporte reativo por ausência de monitoramento ativo.

---

## 7) Definição prática de “sistema independente” neste projeto

Considerar independente quando:

- Usuário comum não precisa abrir abas técnicas para operar.
- Admin consegue gerir usuários/configurações dentro do app.
- Integridade de base é monitorada automaticamente.
- Falhas geram alerta e trilha de correção.
- Existe backup e recuperação com procedimento claro.

---

## 8) Checklist de prontidão (produção madura)

- [ ] Health check diário ativo com alerta.
- [ ] RBAC completo por ação e módulo.
- [ ] Auditoria com diff completo.
- [ ] Backups automatizados e testados.
- [ ] Edição em lote com validação.
- [ ] Painel de pendências operacionais.
- [ ] Documentação técnica e operacional atualizada.
- [ ] Procedimento de rollback validado.

---

## 9) Conclusão

O SIGEP-HUC não precisa de reconstrução; precisa de endurecimento operacional, governança e produtividade.

A base atual já é boa e moderna. Com as fases acima, o sistema evolui de “WebApp funcional” para plataforma institucional confiável, reduzindo dependência de planilha manual e elevando segurança para uso hospitalar real.
