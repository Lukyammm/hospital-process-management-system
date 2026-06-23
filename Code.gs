/**
 * SIGEP-HUC | Backend WebApp
 * Usa as bases criadas pelo Migrador_SIGEP_HUC.gs.
 */

const SIGEP = {
  security: {
    frameOptionsMode: HtmlService.XFrameOptionsMode.SAMEORIGIN
  },
  cache: {
    ttlSeconds: 90,
    version: 'v1'
  },
  timezones: {
    operational: 'America/Fortaleza'
  },
  schema: {
    required: {
      BASE_PROCESSOS: ['ID_PROCESSO'],
      BASE_ACOMPANHAMENTO: ['ID_ACOMPANHAMENTO'],
      BASE_INDICADORES: ['ID_INDICADOR'],
      BASE_LANCAMENTOS_INDICADORES: ['ID_INDICADOR'],
      BASE_UNIDADES: ['ID_UNIDADE']
    },
    autoCreate: {
      BASE_INDICADORES: [
        'META_OPERADOR', 'POLARIDADE_META', 'PERIODICIDADE',
        'CATEGORIA_INDICADOR', 'TIPO_OPERACIONAL', 'EIXO_ASSISTENCIAL',
        'ANALISTA_RESPONSAVEL', 'GESTOR_RESPONSAVEL', 'LINK_FICHA_TECNICA_CONECTA',
        'LINK_PLANILHA_GESTAO', 'ABA_PLANILHA_GESTAO', 'FONTE_LANCAMENTO'
      ],
      BASE_ACOMPANHAMENTO: ['LINK_PLANILHA_GESTAO']
    }
  },
  mapeamentoColumns: [
    'ID_MAPEAMENTO', 'NOME_PROCESSO', 'GRUPO_PROCESSO', 'LINHA', 'COLUNA',
    'STATUS', 'RESPONSAVEL', 'ANALISTA', 'LINK_PLANILHA', 'LINK_CONECTA',
    'COMENTARIO', 'ULTIMA_ATUALIZACAO', 'ATIVO'
  ],
  gestorColumns: [
    'ID_GESTOR', 'NOME', 'FUNCAO', 'SETOR', 'EMAIL', 'TELEFONE', 'CPF',
    'VINCULO', 'NOTIFICA_LOGIN', 'NOTIFICA_SENHA', 'NOTIFICA_SITUACAO',
    'OBSERVACOES', 'ATIVO', 'ULTIMA_ATUALIZACAO'
  ],
  gestorSensitiveColumns: ['CPF', 'TELEFONE', 'NOTIFICA_LOGIN', 'NOTIFICA_SENHA'],
  metaColumns: [
    'ID_META', 'ID_INDICADOR', 'VIGENCIA_INICIO', 'META', 'META_OPERADOR',
    'POLARIDADE_META', 'ATIVO', 'ULTIMA_ATUALIZACAO'
  ],
  statusPadrao: ['Não iniciado', 'Em andamento', 'Concluído', 'Não se aplica'],
  featureFlags: {
    PROCESSOS: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_PROCESSOS', defaultValue: true },
    INDICADORES: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_INDICADORES', defaultValue: true },
    ACOMPANHAMENTO: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_ACOMPANHAMENTO', defaultValue: true },
    MAPEAMENTO: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_MAPEAMENTO', defaultValue: true },
    GESTORES: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_GESTORES', defaultValue: true },
    FILTROS_AVANCADOS: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'FILTROS_AVANCADOS', defaultValue: true }
  },
  sheets: {
    processos: 'BASE_PROCESSOS',
    acompanhamento: 'BASE_ACOMPANHAMENTO',
    indicadores: 'BASE_INDICADORES',
    lancamentos: 'BASE_LANCAMENTOS_INDICADORES',
    metas: 'BASE_METAS_INDICADORES',
    unidades: 'BASE_UNIDADES',
    mapeamento: 'BASE_MAPEAMENTO',
    gestores: 'BASE_GESTORES',
    usuarios: 'USUARIOS',
    historico: 'HISTORICO',
    dashboardBase: 'DASHBOARD_BASE',
    backups: 'BACKUPS_LOGICOS'
  },
  operations: {
    adminEmails: [],
    dailyJobHour: 6
  },
  appConfig: {
    sheet: 'CONFIG_APP',
    schemaVersionKey: 'SCHEMA_VERSION',
    defaultSchemaVersion: 1
  }
};

function doGet() {
  const output = HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle('SIGEP-HUC');

  const frameMode = getFrameOptionsMode_();
  if (frameMode) {
    output.setXFrameOptionsMode(frameMode);
  }

  return output;
}

function getFrameOptionsMode_() {
  if (
    HtmlService
    && HtmlService.XFrameOptionsMode
    && HtmlService.XFrameOptionsMode.SAMEORIGIN
  ) {
    return HtmlService.XFrameOptionsMode.SAMEORIGIN;
  }
  return null;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSigepData() {
  const app = new SigepApplication();
  return app.getInitialData();
}


function getDashboardData() {
  const app = new SigepApplication();
  return app.getDashboardData();
}

function runDashboardSnapshotJob() {
  const app = new SigepApplication();
  return app.dashboard.refreshAnalyticalSnapshot(app.repo, app.audit);
}

function runBasesHealthCheckJob() {
  const app = new SigepApplication();
  return app.runBasesHealthCheck();
}

function setupPhase1Automation() {
  const app = new SigepApplication();
  return app.setupPhase1Automation();
}

function runDailyOperationalGuardJob() {
  const app = new SigepApplication();
  return app.runDailyOperationalGuardJob();
}

function getProcessosPage(payload) {
  const app = new SigepApplication();
  return app.getProcessosPage(payload);
}

function getAcompanhamentoPage(payload) {
  const app = new SigepApplication();
  return app.getAcompanhamentoPage(payload);
}

function getIndicadoresPage(payload) {
  const app = new SigepApplication();
  return app.getIndicadoresPage(payload);
}

function atualizarEmLote(payload) {
  return runWithWriteLock_(() => withWritePermission_('GERAL', app => app.runBulkUpdate(payload)));
}

function getPainelPendencias(payload) {
  const app = new SigepApplication();
  return app.getPainelPendencias(payload);
}

function salvarFiltroAvancado(payload) {
  return withWritePermission_('GERAL', app => app.salvarFiltroAvancado(payload));
}

function listarFiltrosAvancados() {
  const app = new SigepApplication();
  return app.listarFiltrosAvancados();
}

function getAppConfig() {
  const app = new SigepApplication();
  return app.getAppConfig();
}

function runSchemaMigrations() {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.runSchemaMigrations()));
}

function withWritePermission_(screenName, callback) {
  const app = new SigepApplication();
  app.auth.assertAuthorized(screenName || 'GERAL', 'EDITAR');
  return callback(app);
}

function withAdminPermission_(screenName, callback) {
  const app = new SigepApplication();
  app.auth.assertAuthorized(screenName || 'ADMIN', 'ADMIN');
  return callback(app);
}

function atualizarStatusAcompanhamento(payload) {
  return runWithWriteLock_(() => withWritePermission_('ACOMPANHAMENTO', app => app.acompanhamento.updateStatus(payload)));
}

function criarAcompanhamento(payload) {
  return runWithWriteLock_(() => withWritePermission_('ACOMPANHAMENTO', app => app.acompanhamento.create(payload)));
}

function atualizarProcesso(payload) {
  return runWithWriteLock_(() => withWritePermission_('PROCESSOS', app => app.processos.update(payload)));
}

function criarProcesso(payload) {
  return runWithWriteLock_(() => withWritePermission_('PROCESSOS', app => app.processos.create(payload)));
}

function atualizarIndicador(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.update(payload)));
}

function criarIndicador(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.create(payload)));
}

function atualizarLancamentoIndicador(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.updateLancamento(payload)));
}

function excluirAcompanhamento(payload) {
  return runWithWriteLock_(() => withWritePermission_('ACOMPANHAMENTO', app => app.acompanhamento.remove(payload)));
}

function excluirProcesso(payload) {
  return runWithWriteLock_(() => withWritePermission_('PROCESSOS', app => app.processos.remove(payload)));
}

function excluirIndicador(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.remove(payload)));
}

function listarAbasPlanilhaIndicador(url) {
  const app = new SigepApplication();
  const abas = app.indicadores.listarAbas_(url);
  return { ok: true, abas };
}

function salvarAbaPlanilhaIndicador(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.salvarAbaPlanilha(payload)));
}

function importarTodosLancamentosAutomatico() {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => {
    app.indicadores.importarTodosLancamentos();
    const lancamentos = app.indicadores.listLancamentos();
    return { ok: true, lancamentos };
  }));
}

function criarMetaPeriodo(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.criarMetaPeriodo(payload)));
}

function atualizarMetaPeriodo(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.atualizarMetaPeriodo(payload)));
}

function excluirMetaPeriodo(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.excluirMetaPeriodo(payload)));
}

function getMapeamento() {
  const app = new SigepApplication();
  return app.mapeamento.list();
}

function criarMapeamento(payload) {
  return runWithWriteLock_(() => withWritePermission_('MAPEAMENTO', app => app.mapeamento.create(payload)));
}

function atualizarMapeamento(payload) {
  return runWithWriteLock_(() => withWritePermission_('MAPEAMENTO', app => app.mapeamento.update(payload)));
}

function excluirMapeamento(payload) {
  return runWithWriteLock_(() => withWritePermission_('MAPEAMENTO', app => app.mapeamento.remove(payload)));
}

function popularMapeamentoPadrao() {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.mapeamento.seedDefaults()));
}

function getGestores() {
  const app = new SigepApplication();
  return app.gestores.list();
}

function salvarGestor(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.gestores.save(payload)));
}

function excluirGestor(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.gestores.remove(payload)));
}

function vincularGestor(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.gestores.vincular(payload)));
}

function getHistoricoRegistro(payload) {
  const app = new SigepApplication();
  return app.audit.getHistoryFor(payload);
}

function getHistoricoRecente(payload) {
  return withAdminPermission_('ADMIN', app => app.audit.getRecent(payload));
}

function runGovernancaMensalJob() {
  const app = new SigepApplication();
  return app.runGovernancaMensal();
}

function setupGovernancaAutomation() {
  return withAdminPermission_('ADMIN', app => app.setupGovernancaAutomation());
}


function getAdminData() {
  return withAdminPermission_('ADMIN', app => app.admin.getAdminData());
}

function salvarConfiguracao(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.salvarConfiguracao(payload)));
}


function getDataReviewReport() {
  return withAdminPermission_('ADMIN', app => app.admin.getDataReviewReport());
}

function aplicarCorrecaoDados(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.aplicarCorrecaoDados(payload)));
}


function aplicarCorrecaoDadosEmLote(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.aplicarCorrecaoDadosEmLote(payload)));
}

function salvarUsuario(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.salvarUsuario(payload)));
}

function excluirUsuario(email) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.excluirUsuario(email)));
}

function alterarSenhaUsuario(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.alterarSenhaUsuario(payload)));
}

function salvarSetor(payload) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.salvarSetor(payload)));
}

function excluirSetor(setorId) {
  return runWithWriteLock_(() => withAdminPermission_('ADMIN', app => app.admin.excluirSetor(setorId)));
}

function runWithWriteLock_(callback) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Sistema ocupado no momento. Tente novamente em alguns segundos.');
  }
  try {
    const result = callback();
    SpreadsheetApp.flush();
    clearSigepRuntimeCache_();
    return result;
  } finally {
    lock.releaseLock();
  }
}

function clearSigepRuntimeCache_() {
  try {
    CacheService.getScriptCache().remove(['sigep', SIGEP.cache.version, 'initial_data'].join(':'));
  } catch (err) {
    console.warn('Falha ao limpar cache operacional:', err && err.message ? err.message : err);
  }
}

// Converte competência (MM/AAAA, MM/AA, mmm/aa) em chave ordenável (ano*12+mês).
function competenciaKey_(raw) {
  const s = String(raw || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!s) return 0;
  const meses = { jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };
  let mes = 0, ano = 0;
  let m = s.match(/^(\d{1,2})[\/-](\d{2}|\d{4})$/);
  if (m) { mes = Number(m[1]); ano = Number(m[2]); }
  else {
    m = s.match(/^([a-zç]{3})\.?[\/-]?(\d{2}|\d{4})$/);
    if (m && meses[m[1]]) { mes = meses[m[1]]; ano = Number(m[2]); }
  }
  if (!mes || !ano || mes < 1 || mes > 12) return 0;
  if (ano < 100) ano += 2000;
  return ano * 12 + mes;
}

class SigepApplication {
  constructor() {
    this.repo = new SheetRepository();
    this.repo.ensureSchemaColumns();
    this.auth = new AuthorizationService(this.repo);
    this.audit = new AuditService(this.repo, this.auth);
    this.processos = new ProcessoService(this.repo, this.audit);
    this.acompanhamento = new AcompanhamentoService(this.repo, this.audit);
    this.indicadores = new IndicadorService(this.repo, this.audit);
    this.mapeamento = new MapeamentoService(this.repo, this.audit);
    this.gestores = new GestorService(this.repo, this.audit, this.auth);
    this.dashboard = new DashboardService();
    this.admin = new AdminService(this.repo, this.audit, this.gestores);
  }

  getInitialData() {
    this.repo.validateSchemas();
    const cacheKey = this.repo.getCacheKey('initial_data');
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const featureFlags = this.repo.getFeatureFlags();
    const user = this.auth.getCurrentUser();
    const processos = featureFlags.PROCESSOS ? this.auth.applyDataScope(this.processos.list(), user) : [];
    const acompanhamento = featureFlags.ACOMPANHAMENTO ? this.auth.applyDataScope(this.acompanhamento.list(), user) : [];
    const indicadores = featureFlags.INDICADORES ? this.auth.applyDataScope(this.indicadores.list(), user) : [];
    const lancamentos = featureFlags.INDICADORES ? this.indicadores.listLancamentos() : [];
    const metasIndicadores = featureFlags.INDICADORES ? this.indicadores.listMetasPeriodo() : [];
    const unidades = this.repo.getObjects(SIGEP.sheets.unidades);
    const mapeamento = featureFlags.MAPEAMENTO ? this.mapeamento.listRows() : [];
    const result = {
      ok: true,
      generatedAt: new Date().toISOString(),
      generatedAtLocal: this.repo.formatDatePtBr(new Date()),
      user: user.email || '',
      userNome: user.nome || '',
      userPerfil: user.perfil || '',
      dashboard: this.dashboard.build(processos, acompanhamento, indicadores, lancamentos),
      processos,
      acompanhamento,
      indicadores,
      lancamentos,
      metasIndicadores,
      unidades,
      mapeamento,
      featureFlags
    };

    this.repo.cachePutSafe(cacheKey, result, SIGEP.cache.ttlSeconds);
    return result;
  }

  getDashboardData() {
    const snapshot = this.dashboard.getLatestSnapshot(this.repo);
    if (snapshot) return { ok: true, ...snapshot, source: 'DASHBOARD_BASE' };
    const data = this.getInitialData();
    return { ok: true, dashboard: data.dashboard, generatedAt: data.generatedAt, generatedAtLocal: data.generatedAtLocal, source: 'REALTIME' };
  }

  getProcessosPage(payload) {
    if (!this.repo.getFeatureFlag('PROCESSOS')) return { ok: true, data: [], page: 1, pageSize: 50, total: 0, totalPages: 1 };
    const user = this.auth.getCurrentUser();
    return this.repo.paginate(this.auth.applyDataScope(this.processos.list(), user), payload);
  }

  getAcompanhamentoPage(payload) {
    if (!this.repo.getFeatureFlag('ACOMPANHAMENTO')) return { ok: true, data: [], page: 1, pageSize: 50, total: 0, totalPages: 1 };
    const user = this.auth.getCurrentUser();
    return this.repo.paginate(this.auth.applyDataScope(this.acompanhamento.list(), user), payload);
  }

  getIndicadoresPage(payload) {
    if (!this.repo.getFeatureFlag('INDICADORES')) return { ok: true, data: [], page: 1, pageSize: 50, total: 0, totalPages: 1 };
    const user = this.auth.getCurrentUser();
    return this.repo.paginate(this.auth.applyDataScope(this.indicadores.list(), user), payload);
  }

  runBasesHealthCheck() {
    const checker = new BaseHealthService(this.repo, this.audit);
    return checker.run();
  }

  setupPhase1Automation() {
    const ops = new OperationalHardeningService(this.repo, this.audit);
    return ops.setupDailyAutomation();
  }

  runDailyOperationalGuardJob() {
    const ops = new OperationalHardeningService(this.repo, this.audit);
    return ops.runDailyGuard();
  }

  runGovernancaMensal() {
    const gov = new GovernanceService(this.repo, this.audit);
    return gov.runMonthly();
  }

  setupGovernancaAutomation() {
    const gov = new GovernanceService(this.repo, this.audit);
    return gov.setupTrigger();
  }

  runBulkUpdate(payload) {
    const ops = new ProductivityService(this.repo, this.audit, this.auth);
    return ops.runBulkUpdate(payload);
  }

  getPainelPendencias(payload) {
    const ops = new ProductivityService(this.repo, this.audit, this.auth);
    return ops.getPainelPendencias(payload);
  }

  salvarFiltroAvancado(payload) {
    const ops = new ProductivityService(this.repo, this.audit, this.auth);
    return ops.salvarFiltroAvancado(payload);
  }

  listarFiltrosAvancados() {
    const ops = new ProductivityService(this.repo, this.audit, this.auth);
    return ops.listarFiltrosAvancados();
  }

  getAppConfig() {
    const cfg = new ConfigService(this.repo, this.audit, this.auth);
    return cfg.getPublicConfig();
  }

  runSchemaMigrations() {
    const cfg = new ConfigService(this.repo, this.audit, this.auth);
    return cfg.runMigrations();
  }
}


class DomainNormalizer {
  static processo(raw) {
    return {
      ...raw,
      ID_PROCESSO: this.asText(raw.ID_PROCESSO),
      NOME_PROCESSO: this.asText(raw.NOME_PROCESSO),
      STATUS_GERAL: this.asText(raw.STATUS_GERAL),
      MODELAGEM_REALIZADA: this.asText(raw.MODELAGEM_REALIZADA),
      VALIDACAO_NUGESP: this.asText(raw.VALIDACAO_NUGESP),
      VALIDACAO_DIRECAO: this.asText(raw.VALIDACAO_DIRECAO),
      PUBLICACAO: this.asText(raw.PUBLICACAO)
    };
  }

  static acompanhamento(raw) {
    return {
      ...raw,
      ID_ACOMPANHAMENTO: this.asText(raw.ID_ACOMPANHAMENTO),
      UNIDADE: this.asText(raw.UNIDADE),
      DATA_AGENDAMENTO: this.asText(raw.DATA_AGENDAMENTO),
      STATUS_AGENDAMENTO: this.asText(raw.STATUS_AGENDAMENTO),
      STATUS_GERAL: this.asText(raw.STATUS_GERAL),
      ETAPAS_CONCLUIDAS: this.asNumber(raw.ETAPAS_CONCLUIDAS),
      ETAPAS_TOTAL: this.asNumber(raw.ETAPAS_TOTAL),
      PROGRESSO_PERCENTUAL: this.asNumber(raw.PROGRESSO_PERCENTUAL)
    };
  }

  static indicador(raw) {
    const metaRaw = this.asText(raw.META);
    const metaOperadorRaw = this.asText(raw.META_OPERADOR);
    const operadoresValidos = ['>=', '>', '<=', '<', '='];
    const operadoresPorCodigo = { '1': '>=', '2': '>', '3': '<=', '4': '<', '5': '=' };

    const extrairOperadorMeta = (valor) => {
      const texto = this.asText(valor);
      if (!texto) return { operador: '', meta: '' };
      const match = texto.match(/^(>=|<=|>|<|=)\s*(.+)$/);
      if (match) return { operador: match[1], meta: this.asText(match[2]) };
      return { operador: '', meta: texto };
    };

    const normalizarOperador = (valor) => {
      const texto = this.asText(valor);
      if (!texto) return '';
      if (operadoresValidos.includes(texto)) return texto;
      if (operadoresPorCodigo[texto]) return operadoresPorCodigo[texto];
      return '';
    };

    const metaExtraida = extrairOperadorMeta(metaRaw);
    const operador = normalizarOperador(metaOperadorRaw)
      || normalizarOperador(metaExtraida.operador)
      || '>=';

    const meta = metaExtraida.meta && !operadoresValidos.includes(metaExtraida.meta)
      ? metaExtraida.meta
      : this.asText(raw.META_VALOR || raw.VALOR_META || '');

    const categoria = this.asText(raw.CATEGORIA_INDICADOR) || this.asText(raw.CATEGORIA);
    return {
      ...raw,
      ID_INDICADOR: this.asText(raw.ID_INDICADOR),
      NOME_INDICADOR: this.asText(raw.NOME_INDICADOR),
      TIPO_INDICADOR: this.asText(raw.TIPO_INDICADOR),
      META: meta || metaRaw,
      META_OPERADOR: operador,
      POLARIDADE_META: this.asText(raw.POLARIDADE_META),
      PERIODICIDADE: this.asText(raw.PERIODICIDADE),
      CATEGORIA: categoria,
      CATEGORIA_INDICADOR: categoria,
      TIPO_OPERACIONAL: this.asText(raw.TIPO_OPERACIONAL),
      EIXO_ASSISTENCIAL: this.asText(raw.EIXO_ASSISTENCIAL),
      ANALISTA_RESPONSAVEL: this.asText(raw.ANALISTA_RESPONSAVEL),
      GESTOR_RESPONSAVEL: this.asText(raw.GESTOR_RESPONSAVEL),
      LINK_FICHA_TECNICA_CONECTA: this.asText(raw.LINK_FICHA_TECNICA_CONECTA),
      LINK_PLANILHA_GESTAO: this.asText(raw.LINK_PLANILHA_GESTAO),
      ABA_PLANILHA_GESTAO: this.asText(raw.ABA_PLANILHA_GESTAO),
      RESULTADO_ESPERADO: this.asText(raw.RESULTADO_ESPERADO)
    };
  }


  static asText(v) { return String(v || '').trim(); }
  static asNumber(v) {
    if (v === '' || v === null || v === undefined) return 0;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
}


class SheetRepository {
  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    this.headersCache = {};
    this.objectsCache = {};
    this.parameterCache = null;
  }

  cachePutSafe(key, value, ttlSeconds) {
    const cache = CacheService.getScriptCache();
    const serialized = JSON.stringify(value);
    const maxCacheEntryBytes = 95 * 1024;
    if (serialized.length > maxCacheEntryBytes) {
      return false;
    }
    cache.put(key, serialized, ttlSeconds);
    return true;
  }

  getSheet(name) {
    const sh = this.ss.getSheetByName(name);
    if (!sh) throw new Error('Aba não encontrada: ' + name + '. Rode primeiro o migrador criarBasesSigepHuc().');
    return sh;
  }

  getObjects(sheetName) {
    if (this.objectsCache[sheetName]) {
      return this.cloneRows_(this.objectsCache[sheetName]);
    }

    const sh = this.getSheet(sheetName);
    const values = sh.getDataRange().getDisplayValues();
    if (values.length < 2) {
      this.objectsCache[sheetName] = [];
      return [];
    }

    const headers = values[0].map(h => String(h).trim());
    const rows = values.slice(1)
      .filter(row => row.some(cell => String(cell).trim() !== ''))
      .map((row, index) => this.rowToObject_(headers, row, index + 2));
    this.objectsCache[sheetName] = rows;
    return this.cloneRows_(rows);
  }

  getObjectsSafe(sheetName, fallback) {
    try {
      return this.getObjects(sheetName);
    } catch (err) {
      const message = String(err && err.message || '');
      if (message.indexOf('Aba não encontrada: ') === 0) {
        return Array.isArray(fallback) ? fallback : [];
      }
      throw err;
    }
  }

  updateById(sheetName, idColumn, id, patch, currentRow) {
    const sh = this.getSheet(sheetName);
    const headers = this.getHeaders(sheetName);
    const rowNumber = currentRow && currentRow._rowNumber
      ? Number(currentRow._rowNumber)
      : this.findRowNumberById_(sheetName, idColumn, id, headers);
    if (!rowNumber) throw new Error('Registro não encontrado: ' + id);

    const updatedRow = sh.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
    const indexByHeader = this.indexHeaders_(headers);
    Object.keys(patch || {}).forEach(key => {
      const col = indexByHeader[key];
      if (col !== undefined) updatedRow[col] = patch[key];
    });
    sh.getRange(rowNumber, 1, 1, updatedRow.length).setValues([updatedRow]);
    delete this.objectsCache[sheetName];
    if (String(sheetName).indexOf('CONFIG_') === 0 || sheetName === SIGEP.appConfig.sheet) this.parameterCache = null;
    const displayRow = sh.getRange(rowNumber, 1, 1, headers.length).getDisplayValues()[0];
    return this.rowToObject_(headers, displayRow, rowNumber);
  }

  getById(sheetName, idColumn, id) {
    const headers = this.getHeaders(sheetName);
    const rowNumber = this.findRowNumberById_(sheetName, idColumn, id, headers);
    if (!rowNumber) throw new Error('Registro não encontrado: ' + id);
    const row = this.getSheet(sheetName).getRange(rowNumber, 1, 1, headers.length).getDisplayValues()[0];
    return this.rowToObject_(headers, row, rowNumber);
  }

  append(sheetName, row) {
    this.appendRows(sheetName, [row]);
  }

  getHeaders(sheetName) {
    if (this.headersCache[sheetName]) return this.headersCache[sheetName].slice();
    const sh = this.getSheet(sheetName);
    const lastColumn = Math.max(1, sh.getLastColumn());
    const headers = sh.getRange(1, 1, 1, lastColumn).getValues()[0].map(h => String(h || '').trim());
    this.headersCache[sheetName] = headers;
    return headers.slice();
  }

  ensureSchemaColumns() {
    const cacheKey = this.getCacheKey('schema_columns_ok');
    const cooldownKey = this.getCacheKey('schema_columns_cooldown');
    const cache = CacheService.getScriptCache();
    if (cache.get(cacheKey) === '1') return;
    // Evita tentar recriar colunas em toda requisição quando há falha recorrente.
    if (cache.get(cooldownKey) === '1') return;
    // Criação de colunas é "best-effort": uma falha (ex.: aba protegida ou
    // usuário sem permissão de escrita) NÃO pode derrubar a leitura inicial,
    // pois as leituras toleram colunas ausentes (campo vira string vazia).
    let allOk = true;
    const ensure = (bySheet) => {
      Object.keys(bySheet || {}).forEach(sheetName => {
        try {
          this.ensureColumnsForSheet_(sheetName, bySheet[sheetName] || []);
        } catch (err) {
          allOk = false;
          console.warn('Não foi possível garantir colunas em ' + sheetName + ': ' + (err && err.message ? err.message : err));
        }
      });
    };
    ensure(SIGEP.schema.required || {});
    ensure(SIGEP.schema.autoCreate || {});
    if (allOk) cache.put(cacheKey, '1', 21600);
    else cache.put(cooldownKey, '1', 300);
  }

  ensureColumnsForSheet_(sheetName, columns) {
    if (!columns || !columns.length) return;
    const sh = this.getSheet(sheetName);
    const headers = this.getHeaders(sheetName).map(h => String(h || '').trim());
    const missing = columns.filter(col => col && !headers.includes(col));
    if (!missing.length) return;
    const lastColumn = sh.getLastColumn();
    sh.insertColumnsAfter(lastColumn, missing.length);
    sh.getRange(1, lastColumn + 1, 1, missing.length).setValues([missing]);
    delete this.headersCache[sheetName];
    delete this.objectsCache[sheetName];
    this.parameterCache = null;
  }

  validateSchemas() {
    const requiredBySheet = SIGEP.schema.required || {};
    Object.keys(requiredBySheet).forEach(sheetName => {
      const requiredHeaders = requiredBySheet[sheetName] || [];
      if (!requiredHeaders.length) return;
      const headers = this.getHeaders(sheetName).map(h => String(h).trim());
      const missing = requiredHeaders.filter(h => !headers.includes(h));
      if (missing.length) {
        throw new Error('Schema inválido na aba ' + sheetName + '. Cabeçalhos faltando: ' + missing.join(', '));
      }
    });
  }

  getCacheKey(prefix) {
    return ['sigep', SIGEP.cache.version, prefix].join(':');
  }

  getFeatureFlags() {
    const flags = {};
    const parameterSheets = this.getParameterSheets_();
    Object.keys(SIGEP.featureFlags || {}).forEach(name => {
      flags[name] = this.resolveFeatureFlag_(name, parameterSheets);
    });
    return flags;
  }

  getFeatureFlag(name) {
    return this.resolveFeatureFlag_(name, this.getParameterSheets_());
  }

  getParameterSheets_() {
    if (this.parameterCache) return this.parameterCache;
    const sheetNames = new Set(['CONFIG_STATUS', 'CONFIG_TIPOS_PROCESSO', SIGEP.appConfig.sheet]);
    Object.keys(SIGEP.featureFlags || {}).forEach(name => {
      const cfg = SIGEP.featureFlags[name];
      if (cfg && cfg.sheet) sheetNames.add(cfg.sheet);
    });
    this.parameterCache = {};
    sheetNames.forEach(sheetName => {
      this.parameterCache[sheetName] = this.getObjectsSafe(sheetName, []);
    });
    return this.parameterCache;
  }

  resolveFeatureFlag_(name, parameterSheets) {
    const cfg = (SIGEP.featureFlags || {})[name];
    if (!cfg) return false;
    try {
      const rows = (parameterSheets && parameterSheets[cfg.sheet]) || this.getObjectsSafe(cfg.sheet, []);
      const hit = rows.find(r => String(r.CHAVE || '').trim().toUpperCase() === String(cfg.key || '').trim().toUpperCase());
      if (!hit) return !!cfg.defaultValue;
      const value = String(hit.VALOR || '').trim().toUpperCase();
      return ['1', 'TRUE', 'SIM', 'ATIVO', 'ON'].includes(value);
    } catch (err) {
      return !!cfg.defaultValue;
    }
  }

  clearCache() {
    this.objectsCache = {};
    this.parameterCache = null;
    CacheService.getScriptCache().remove(this.getCacheKey('initial_data'));
  }

  formatDatePtBr(date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
  }

  formatDateOperational(date) {
    return Utilities.formatDate(date, SIGEP.timezones.operational, "dd/MM/yyyy HH:mm:ss");
  }

  paginate(items, payload) {
    const page = Math.max(1, Number(payload && payload.page || 1));
    const pageSize = Math.min(200, Math.max(10, Number(payload && payload.pageSize || 50)));
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);
    return { ok: true, data, page, pageSize, total: items.length, totalPages: Math.ceil(items.length / pageSize) || 1 };
  }

  appendRows(sheetName, rows) {
    if (!rows || !rows.length) return;
    const sh = this.getSheet(sheetName);
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    delete this.objectsCache[sheetName];
    if (String(sheetName).indexOf('CONFIG_') === 0 || sheetName === SIGEP.appConfig.sheet) this.parameterCache = null;
  }

  insertObject(sheetName, obj, idColumn) {
    const headers = this.getHeaders(sheetName);
    const row = headers.map(h => (obj[h] !== undefined ? obj[h] : ''));
    const resolvedIdColumn = this.resolveIdColumn_(sheetName, obj, idColumn, headers);
    const resolvedIdValue = obj[resolvedIdColumn];
    if (!resolvedIdColumn || resolvedIdValue === undefined || resolvedIdValue === '') {
      throw new Error('Não foi possível identificar o ID do registro para gravar em ' + sheetName + '.');
    }
    const rowNumber = this.getSheet(sheetName).getLastRow() + 1;
    this.appendRows(sheetName, [row]);
    return this.rowToObject_(headers, row, rowNumber);
  }

  resolveIdColumn_(sheetName, obj, preferred, headers) {
    const candidates = [
      preferred,
      ...((SIGEP.schema.required || {})[sheetName] || []),
      ...Object.keys(obj || {}).filter(key => /^ID(_|$)/.test(String(key || '').toUpperCase())),
      headers && headers[0]
    ].filter(Boolean);
    return candidates.find(column => headers.includes(column) && obj[column] !== undefined) || '';
  }

  deleteById(sheetName, idColumn, id) {
    const rowNumber = this.findRowNumberById_(sheetName, idColumn, id);
    if (!rowNumber) throw new Error('Registro não encontrado: ' + id);
    this.getSheet(sheetName).deleteRow(rowNumber);
    delete this.objectsCache[sheetName];
    if (String(sheetName).indexOf('CONFIG_') === 0 || sheetName === SIGEP.appConfig.sheet) this.parameterCache = null;
    return { ok: true };
  }

  findRowNumberById_(sheetName, idColumn, id, headers) {
    const sh = this.getSheet(sheetName);
    const effectiveHeaders = headers || this.getHeaders(sheetName);
    const idIndex = effectiveHeaders.indexOf(idColumn);
    if (idIndex === -1) throw new Error('Coluna ID não encontrada: ' + idColumn);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return 0;
    const ids = sh.getRange(2, idIndex + 1, lastRow - 1, 1).getDisplayValues();
    const target = String(id);
    for (let i = 0; i < ids.length; i += 1) {
      if (String(ids[i][0]) === target) return i + 2;
    }
    return 0;
  }

  findRowNumberByCriteria_(sheetName, criteria, headers) {
    const sh = this.getSheet(sheetName);
    const effectiveHeaders = headers || this.getHeaders(sheetName);
    const keys = Object.keys(criteria || {});
    if (!keys.length) return 0;
    const indexes = keys.map(key => {
      const index = effectiveHeaders.indexOf(key);
      if (index === -1) throw new Error('Coluna não encontrada: ' + key);
      return index;
    });
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return 0;
    const minIndex = Math.min.apply(null, indexes);
    const maxIndex = Math.max.apply(null, indexes);
    const values = sh.getRange(2, minIndex + 1, lastRow - 1, maxIndex - minIndex + 1).getDisplayValues();
    for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
      const matches = keys.every((key, keyIndex) => {
        const localIndex = indexes[keyIndex] - minIndex;
        return String(values[rowIndex][localIndex]).trim() === String(criteria[key]).trim();
      });
      if (matches) return rowIndex + 2;
    }
    return 0;
  }

  cloneRows_(rows) {
    return (rows || []).map(row => ({ ...row }));
  }

  rowToObject_(headers, row, rowNumber) {
    const obj = { _rowNumber: rowNumber };
    headers.forEach((h, i) => obj[h] = row[i] !== undefined && row[i] !== null ? row[i] : '');
    return obj;
  }

  indexHeaders_(headers) {
    const out = {};
    headers.forEach((header, index) => {
      out[header] = index;
    });
    return out;
  }

  getMaxNumericSuffix_(sheetName, idColumn) {
    const headers = this.getHeaders(sheetName);
    const idIndex = headers.indexOf(idColumn);
    if (idIndex === -1) throw new Error('Coluna ID não encontrada: ' + idColumn);
    const sh = this.getSheet(sheetName);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return 0;
    const ids = sh.getRange(2, idIndex + 1, lastRow - 1, 1).getDisplayValues();
    return ids.reduce((max, row) => {
      const match = String(row[0] || '').trim().match(/(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
  }
}

class ProcessoService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  list() {
    return this.repo.getObjects(SIGEP.sheets.processos).map(DomainNormalizer.processo.bind(DomainNormalizer));
  }

  create(payload) {
    payload = this.normalizePayload_(payload);
    const processo = String(payload.PROCESSO || '').trim();
    if (!processo) throw new Error('PROCESSO é obrigatório para cadastro.');
    const row = {
      ID_PROCESSO: this.generateId_(),
      PROCESSO: processo,
      TIPO_PROCESSO: String(payload.TIPO_PROCESSO || '').trim(),
      STATUS_GERAL: String(payload.STATUS_GERAL || '').trim(),
      MODELAGEM_REALIZADA: String(payload.MODELAGEM_REALIZADA || '').trim(),
      VALIDACAO_NUGESP: String(payload.VALIDACAO_NUGESP || '').trim(),
      VALIDACAO_DIRECAO: String(payload.VALIDACAO_DIRECAO || '').trim(),
      PUBLICACAO: String(payload.PUBLICACAO || '').trim()
    };
    if (!row.STATUS_GERAL) row.STATUS_GERAL = this.calcularStatus_(row);
    const saved = this.repo.insertObject(SIGEP.sheets.processos, row, 'ID_PROCESSO');
    this.audit.logChange({ acao: 'CRIAR_PROCESSO', entidade: 'PROCESSO', id: saved.ID_PROCESSO, before: null, after: saved, patch: row, origem: 'PROCESSOS', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: saved };
  }

  update(payload) {
    payload = this.normalizePayload_(payload);
    if (!payload || !payload.ID_PROCESSO) throw new Error('ID_PROCESSO obrigatório.');
    PayloadValidator.validateProcessoUpdate(payload);
    const allowed = ['PROCESSO', 'TIPO_PROCESSO', 'STATUS_GERAL', 'MODELAGEM_REALIZADA', 'VALIDACAO_NUGESP', 'VALIDACAO_DIRECAO', 'PUBLICACAO'];
    const patch = {};
    allowed.forEach(k => {
      if (payload[k] !== undefined) patch[k] = payload[k];
    });
    const current = this.repo.getById(SIGEP.sheets.processos, 'ID_PROCESSO', payload.ID_PROCESSO);
    if (payload.STATUS_GERAL === undefined) {
      patch.STATUS_GERAL = this.calcularStatus_({ ...current, ...patch });
    }
    const updated = this.repo.updateById(SIGEP.sheets.processos, 'ID_PROCESSO', payload.ID_PROCESSO, patch, current);
    this.audit.logChange({ acao: 'ATUALIZAR_PROCESSO', entidade: 'PROCESSO', id: payload.ID_PROCESSO, before: current, after: updated, patch, origem: 'PROCESSOS', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
  }

  remove(payload) {
    if (!payload || !payload.ID_PROCESSO) throw new Error('ID_PROCESSO obrigatório para exclusão.');
    const motivo = String(payload.MOTIVO_ALTERACAO || '').trim();
    if (!motivo) throw new Error('MOTIVO_ALTERACAO obrigatório para exclusão.');
    const current = this.repo.getById(SIGEP.sheets.processos, 'ID_PROCESSO', payload.ID_PROCESSO);
    this.repo.deleteById(SIGEP.sheets.processos, 'ID_PROCESSO', payload.ID_PROCESSO);
    this.audit.logChange({ acao: 'EXCLUIR_PROCESSO', entidade: 'PROCESSO', id: payload.ID_PROCESSO, before: current, after: null, patch: null, origem: 'PROCESSOS', motivo });
    return { ok: true };
  }


  normalizePayload_(payload) {
    const source = payload || {};
    const normalized = { ...source };
    if (normalized.PROCESSO === undefined && source.NOME_PROCESSO !== undefined) normalized.PROCESSO = source.NOME_PROCESSO;
    if (normalized.TIPO_PROCESSO === undefined && source.TIPO !== undefined) normalized.TIPO_PROCESSO = source.TIPO;
    if (normalized.STATUS_GERAL === undefined && source.STATUS !== undefined) normalized.STATUS_GERAL = source.STATUS;
    return normalized;
  }
  calcularStatus_(p) {
    const campos = ['MODELAGEM_REALIZADA', 'VALIDACAO_NUGESP', 'VALIDACAO_DIRECAO', 'PUBLICACAO']
      .map(k => String(p[k] || '').toUpperCase().trim())
      .filter(Boolean);
    const sim = campos.filter(v => v === 'SIM').length;
    if (campos.length >= 4 && sim === campos.length) return 'Concluído';
    if (sim > 0) return 'Em andamento';
    return 'Não iniciado';
  }

  generateId_() {
    const max = this.repo.getMaxNumericSuffix_(SIGEP.sheets.processos, 'ID_PROCESSO');
    return `PROC-${String(max + 1).padStart(4, '0')}`;
  }
}

class AcompanhamentoService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  list() {
    return this.repo.getObjects(SIGEP.sheets.acompanhamento).map(DomainNormalizer.acompanhamento.bind(DomainNormalizer));
  }

  create(payload) {
    const unidade = String(payload.UNIDADE || '').trim();
    if (!unidade) throw new Error('UNIDADE é obrigatória para cadastro.');
    const now = new Date();
    const row = {
      ID_ACOMPANHAMENTO: this.generateId_(),
      UNIDADE: unidade,
      DATA_AGENDAMENTO: String(payload.DATA_AGENDAMENTO || '').trim(),
      STATUS_AGENDAMENTO: String(payload.STATUS_AGENDAMENTO || '').trim(),
      INTRODUCAO: String(payload.INTRODUCAO || '').trim(),
      PERFIL: String(payload.PERFIL || '').trim(),
      FLUXO_PROCESSO: String(payload.FLUXO_PROCESSO || '').trim(),
      MODELAGEM: String(payload.MODELAGEM || '').trim(),
      INDICADORES: String(payload.INDICADORES || '').trim(),
      FICHA_TECNICA_INDICADORES: String(payload.FICHA_TECNICA_INDICADORES || '').trim(),
      LINK_PLANILHA_GESTAO: String(payload.LINK_PLANILHA_GESTAO || '').trim(),
      ORDEM_AGENDAMENTO_UNIDADE: Number(payload.ORDEM_AGENDAMENTO_UNIDADE || now.getTime())
    };
    this.computeProgress_(row);
    const saved = this.repo.insertObject(SIGEP.sheets.acompanhamento, row, 'ID_ACOMPANHAMENTO');
    this.audit.logChange({ acao: 'CRIAR_ACOMPANHAMENTO', entidade: 'ACOMPANHAMENTO', id: saved.ID_ACOMPANHAMENTO, before: null, after: saved, patch: row, origem: 'ACOMPANHAMENTO', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: saved };
  }

  updateStatus(payload) {
    if (!payload || !payload.ID_ACOMPANHAMENTO) throw new Error('ID_ACOMPANHAMENTO obrigatório.');
    PayloadValidator.validateAcompanhamentoUpdate(payload);
    const allowed = ['DATA_AGENDAMENTO', 'STATUS_AGENDAMENTO', 'INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES', 'LINK_PLANILHA_GESTAO'];
    const patch = {};
    allowed.forEach(k => {
      if (payload[k] !== undefined) patch[k] = payload[k];
    });
    const current = this.repo.getById(SIGEP.sheets.acompanhamento, 'ID_ACOMPANHAMENTO', payload.ID_ACOMPANHAMENTO);
    const etapas = ['INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES'].map(k => (patch[k] !== undefined ? patch[k] : current[k]) || '');
    if (etapas.some(Boolean) || patch.STATUS_AGENDAMENTO !== undefined || patch.DATA_AGENDAMENTO !== undefined) {
      const progress = this.computeProgressValues_(etapas);
      patch.ETAPAS_CONCLUIDAS = progress.concluidas;
      patch.ETAPAS_TOTAL = progress.total;
      patch.PROGRESSO_PERCENTUAL = progress.percentual;
      patch.STATUS_GERAL = progress.statusGeral;
    }
    const updated = this.repo.updateById(SIGEP.sheets.acompanhamento, 'ID_ACOMPANHAMENTO', payload.ID_ACOMPANHAMENTO, patch, current);
    this.audit.logChange({ acao: 'ATUALIZAR_ACOMPANHAMENTO', entidade: 'ACOMPANHAMENTO', id: payload.ID_ACOMPANHAMENTO, before: current, after: updated, patch, origem: 'ACOMPANHAMENTO', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
  }

  remove(payload) {
    if (!payload || !payload.ID_ACOMPANHAMENTO) throw new Error('ID_ACOMPANHAMENTO obrigatório para exclusão.');
    const motivo = String(payload.MOTIVO_ALTERACAO || '').trim();
    if (!motivo) throw new Error('MOTIVO_ALTERACAO obrigatório para exclusão.');
    const current = this.repo.getById(SIGEP.sheets.acompanhamento, 'ID_ACOMPANHAMENTO', payload.ID_ACOMPANHAMENTO);
    this.repo.deleteById(SIGEP.sheets.acompanhamento, 'ID_ACOMPANHAMENTO', payload.ID_ACOMPANHAMENTO);
    this.audit.logChange({ acao: 'EXCLUIR_ACOMPANHAMENTO', entidade: 'ACOMPANHAMENTO', id: payload.ID_ACOMPANHAMENTO, before: current, after: null, patch: null, origem: 'ACOMPANHAMENTO', motivo });
    return { ok: true };
  }

  isConcluida_(value) {
    const normalized = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    return normalized.includes('CONCLUID') || normalized.includes('REALIZAD') || normalized === 'SIM';
  }

  isNaoSeAplica_(value) {
    const normalized = String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
    return normalized.includes('NAO SE APLICA') || normalized === 'N/A' || normalized === 'NA';
  }

  // Regra "Não se aplica": etapas marcadas como N/A não entram no cálculo de progresso.
  computeProgressValues_(etapas) {
    const consideradas = (etapas || []).filter(v => !this.isNaoSeAplica_(v));
    const total = consideradas.length;
    const concluidas = consideradas.filter(v => this.isConcluida_(v)).length;
    const percentual = total ? Math.round((concluidas / total) * 100) : 0;
    const statusGeral = total === 0
      ? 'Não se aplica'
      : concluidas === total
        ? 'Concluído'
        : concluidas === 0
          ? 'Não iniciado'
          : 'Em andamento';
    return { concluidas, total, percentual, statusGeral };
  }

  computeProgress_(target) {
    const etapas = ['INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES'].map(k => target[k] || '');
    const progress = this.computeProgressValues_(etapas);
    target.ETAPAS_CONCLUIDAS = progress.concluidas;
    target.ETAPAS_TOTAL = progress.total;
    target.PROGRESSO_PERCENTUAL = progress.percentual;
    target.STATUS_GERAL = progress.statusGeral;
  }

  generateId_() {
    const max = this.repo.getMaxNumericSuffix_(SIGEP.sheets.acompanhamento, 'ID_ACOMPANHAMENTO');
    return `ACOMP-${String(max + 1).padStart(4, '0')}`;
  }
}

class IndicadorService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  list() {
    return this.repo.getObjects(SIGEP.sheets.indicadores).map(DomainNormalizer.indicador.bind(DomainNormalizer));
  }

  listLancamentos() {
    return this.repo.getObjects(SIGEP.sheets.lancamentos);
  }

  create(payload) {
    const nome = String(payload.NOME_INDICADOR || '').trim();
    const tipo = String(payload.TIPO_INDICADOR || '').trim();
    const meta = String(payload.META || '').trim();
    if (!nome || !tipo || !meta) throw new Error('NOME_INDICADOR, TIPO_INDICADOR e META são obrigatórios para cadastro.');
    const categoria = String(payload.CATEGORIA_INDICADOR || payload.CATEGORIA || '').trim();
    const row = {
      ID_INDICADOR: this.generateId_(),
      NOME_INDICADOR: nome,
      TIPO_INDICADOR: tipo,
      META: meta,
      META_OPERADOR: String(payload.META_OPERADOR || '>=').trim(),
      POLARIDADE_META: String(payload.POLARIDADE_META || '').trim(),
      PERIODICIDADE: String(payload.PERIODICIDADE || '').trim(),
      RESULTADO_ESPERADO: String(payload.RESULTADO_ESPERADO || '').trim(),
      PROCESSO: String(payload.PROCESSO || '').trim(),
      CATEGORIA: categoria,
      CATEGORIA_INDICADOR: categoria,
      TIPO_OPERACIONAL: String(payload.TIPO_OPERACIONAL || '').trim(),
      EIXO_ASSISTENCIAL: String(payload.EIXO_ASSISTENCIAL || '').trim(),
      ANALISTA_RESPONSAVEL: String(payload.ANALISTA_RESPONSAVEL || '').trim(),
      GESTOR_RESPONSAVEL: String(payload.GESTOR_RESPONSAVEL || '').trim(),
      LINK_FICHA_TECNICA_CONECTA: String(payload.LINK_FICHA_TECNICA_CONECTA || '').trim(),
      UNIDADE: String(payload.UNIDADE || '').trim()
    };
    const saved = this.repo.insertObject(SIGEP.sheets.indicadores, row, 'ID_INDICADOR');
    this.audit.logChange({ acao: 'CRIAR_INDICADOR', entidade: 'INDICADOR', id: saved.ID_INDICADOR, before: null, after: saved, patch: row, origem: 'INDICADORES', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: saved };
  }

  update(payload) {
    if (!payload || !payload.ID_INDICADOR) throw new Error('ID_INDICADOR obrigatório.');
    PayloadValidator.validateIndicadorUpdate(payload);
    const patch = {};
    const operadorAlias = payload['META OPERADOR'] !== undefined ? payload['META OPERADOR'] : payload.OPERADOR_META;
    const normalizedPayload = Object.assign({}, payload, {
      META_OPERADOR: payload.META_OPERADOR !== undefined ? payload.META_OPERADOR : operadorAlias
    });
    ['NOME_INDICADOR', 'TIPO_INDICADOR', 'META', 'META_OPERADOR', 'RESULTADO_ESPERADO',
     'POLARIDADE_META', 'PERIODICIDADE', 'CATEGORIA_INDICADOR', 'TIPO_OPERACIONAL',
     'EIXO_ASSISTENCIAL', 'ANALISTA_RESPONSAVEL', 'GESTOR_RESPONSAVEL', 'LINK_FICHA_TECNICA_CONECTA'].forEach(k => {
      if (normalizedPayload[k] !== undefined) patch[k] = normalizedPayload[k];
    });
    // Mantém a coluna legada CATEGORIA sincronizada com CATEGORIA_INDICADOR.
    if (patch.CATEGORIA_INDICADOR !== undefined) patch.CATEGORIA = patch.CATEGORIA_INDICADOR;
    const current = this.repo.getById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR);
    const updated = this.repo.updateById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR, patch, current);
    this.audit.logChange({ acao: 'ATUALIZAR_INDICADOR', entidade: 'INDICADOR', id: payload.ID_INDICADOR, before: current, after: updated, patch, origem: 'INDICADORES', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
  }

  remove(payload) {
    if (!payload || !payload.ID_INDICADOR) throw new Error('ID_INDICADOR obrigatório para exclusão.');
    const motivo = String(payload.MOTIVO_ALTERACAO || '').trim();
    if (!motivo) throw new Error('MOTIVO_ALTERACAO obrigatório para exclusão.');
    const current = this.repo.getById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR);
    this.repo.deleteById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR);
    this.audit.logChange({ acao: 'EXCLUIR_INDICADOR', entidade: 'INDICADOR', id: payload.ID_INDICADOR, before: current, after: null, patch: null, origem: 'INDICADORES', motivo });
    return { ok: true };
  }

  updateLancamento(payload) {
    if (!payload || !payload.ID_INDICADOR) throw new Error('ID_INDICADOR obrigatório.');
    PayloadValidator.validateLancamentoIndicadorUpdate(payload);
    const comp = String(payload.COMPETENCIA || '').trim();
    const sheetName = SIGEP.sheets.lancamentos;
    const sheet = this.repo.getSheet(sheetName);
    const headers = this.repo.getHeaders(sheetName);
    const rowNumber = this.repo.findRowNumberByCriteria_(sheetName, {
      ID_INDICADOR: String(payload.ID_INDICADOR).trim(),
      COMPETENCIA: comp
    }, headers);
    if (!rowNumber) throw new Error('Lançamento não encontrado para o indicador/competência informados.');

    const beforeValues = sheet.getRange(rowNumber, 1, 1, headers.length).getDisplayValues()[0];
    const before = this.repo.rowToObject_(headers, beforeValues, rowNumber);
    const patch = {};
    ['VALOR', 'STATUS', 'OBSERVACAO'].forEach(k => {
      if (payload[k] !== undefined) patch[k] = payload[k];
    });
    // Justificativa obrigatória quando o resultado fica fora da meta (governança de desvios).
    // Usa a meta vigente na competência do lançamento (metas por período).
    if (patch.VALOR !== undefined) {
      const ind = this.repo.getObjects(SIGEP.sheets.indicadores)
        .find(r => String(r.ID_INDICADOR || '').trim() === String(payload.ID_INDICADOR).trim());
      const valorNum = IndicadorService.parseNum_(patch.VALOR);
      if (ind && Number.isFinite(valorNum)) {
        const metasInd = this.listMetasPeriodo().filter(mt => String(mt.ID_INDICADOR || '').trim() === String(payload.ID_INDICADOR).trim());
        const vig = IndicadorService.resolveMeta_(ind, comp, metasInd);
        const metaNum = IndicadorService.parseNum_(vig.meta);
        if (Number.isFinite(metaNum)) {
          const dentro = IndicadorService.metaAtingida_(valorNum, metaNum, vig.operador, vig.polaridade);
          const justificativa = String(patch.OBSERVACAO !== undefined ? patch.OBSERVACAO : (before.OBSERVACAO || '')).trim();
          if (!dentro && !justificativa) {
            throw new Error('Resultado fora da meta: a observação/justificativa é obrigatória para registrar o desvio.');
          }
        }
      }
    }
    const updatedRow = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
    const indexByHeader = this.repo.indexHeaders_(headers);
    Object.keys(patch).forEach(key => {
      const idx = indexByHeader[key];
      if (idx !== undefined) updatedRow[idx] = patch[key];
    });
    sheet.getRange(rowNumber, 1, 1, updatedRow.length).setValues([updatedRow]);
    const refreshedValues = sheet.getRange(rowNumber, 1, 1, headers.length).getDisplayValues()[0];
    const refreshed = this.repo.rowToObject_(headers, refreshedValues, rowNumber);
    this.audit.logChange({ acao: 'ATUALIZAR_LANCAMENTO_INDICADOR', entidade: 'LANCAMENTO_INDICADOR', id: `${payload.ID_INDICADOR}:${comp}`, before, after: refreshed, patch, origem: 'INDICADORES', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: refreshed };
  }

  generateId_() {
    const max = this.repo.getMaxNumericSuffix_(SIGEP.sheets.indicadores, 'ID_INDICADOR');
    return `IND-${String(max + 1).padStart(4, '0')}`;
  }

  salvarAbaPlanilha(payload) {
    if (!payload || !payload.ID_INDICADOR) throw new Error('ID_INDICADOR obrigatório.');
    const current = this.repo.getById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR);
    const patch = {
      LINK_PLANILHA_GESTAO: String(payload.LINK_PLANILHA_GESTAO || '').trim(),
      ABA_PLANILHA_GESTAO: String(payload.ABA_PLANILHA_GESTAO || '').trim()
    };
    const updated = this.repo.updateById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR, patch, current);
    this.audit.logChange({ acao: 'CONFIGURAR_PLANILHA_INDICADOR', entidade: 'INDICADOR', id: payload.ID_INDICADOR, before: current, after: updated, patch, origem: 'INDICADORES', motivo: 'Configuração de planilha de gestão' });
    // Importa imediatamente após salvar
    this.importarLancamentos_(Object.assign({}, current, patch));
    return { ok: true, data: updated };
  }

  listarAbas_(url) {
    const ss = SpreadsheetApp.openByUrl(url);
    const sheets = ss.getSheets();
    const normalizeStr = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    const valid = [];
    sheets.forEach(sh => {
      try {
        const lastCol = sh.getLastColumn();
        const lastRow = sh.getLastRow();
        if (lastRow < 4 || lastCol < 1) return;

        // Testa A4:B4 para "META"
        const a4b4 = sh.getRange(4, 1, 1, Math.min(2, lastCol)).getDisplayValues()[0].join(' ');
        const hasMeta = normalizeStr(a4b4).indexOf('META') > -1;

        // Testa G4:I4 para "RESPONSÁVEL PELA META:"
        let hasResp = false;
        if (lastCol >= 9) {
          const g4i4 = sh.getRange(4, 7, 1, 3).getDisplayValues()[0].join(' ');
          hasResp = normalizeStr(g4i4).indexOf('RESPONSAVEL PELA META') > -1;
        }

        if (hasMeta || hasResp) valid.push(sh.getName());
      } catch (e) { /* aba inacessível, ignora */ }
    });
    return valid;
  }

  deleteLancamentosDaPlanilha_(indicadorId) {
    const sheetName = SIGEP.sheets.lancamentos;
    const sheet = this.repo.getSheet(sheetName);
    const headers = this.repo.getHeaders(sheetName);
    const idIdx = headers.indexOf('ID_INDICADOR');
    const fonteIdx = headers.indexOf('FONTE');
    if (idIdx === -1) return;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
    const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    const rowsToDelete = [];
    values.forEach((row, i) => {
      const rowId = String(row[idIdx] || '').trim();
      const fonte = fonteIdx > -1 ? String(row[fonteIdx] || '').trim() : '';
      if (rowId === String(indicadorId).trim() && fonte === 'PLANILHA_GESTAO') {
        rowsToDelete.push(i + 2);
      }
    });
    // Deleta de baixo pra cima pra não deslocar índices
    rowsToDelete.reverse().forEach(rowNum => sheet.deleteRow(rowNum));
    delete this.repo.objectsCache[sheetName];
  }

  importarLancamentos_(indicador) {
    const url = String(indicador.LINK_PLANILHA_GESTAO || '').trim();
    const aba = String(indicador.ABA_PLANILHA_GESTAO || '').trim();
    if (!url || !aba) return 0;
    try {
      const ss = SpreadsheetApp.openByUrl(url);
      const sheet = ss.getSheetByName(aba);
      if (!sheet) return 0;
      const lastRow = sheet.getLastRow();
      if (lastRow < 5) return 0;
      const numRows = lastRow - 4;
      // V=22, W=23, X=24, Y=25 (1-indexed)
      const data = sheet.getRange(5, 22, numRows, 4).getValues();
      const novas = data
        .filter(r => r[0] !== null && r[0] !== undefined && String(r[0]).trim() !== '')
        .map(r => ({
          ID_INDICADOR: indicador.ID_INDICADOR,
          COMPETENCIA: String(r[0]).trim(),
          NUMERADOR: r[1] !== '' && r[1] !== null ? String(r[1]) : '',
          DENOMINADOR: r[2] !== '' && r[2] !== null ? String(r[2]) : '',
          VALOR: r[3] !== '' && r[3] !== null ? String(r[3]) : '',
          FONTE: 'PLANILHA_GESTAO'
        }));
      if (!novas.length) return 0;
      this.deleteLancamentosDaPlanilha_(indicador.ID_INDICADOR);
      novas.forEach(lan => {
        try { this.repo.insertObject(SIGEP.sheets.lancamentos, lan, 'ID_INDICADOR'); } catch (e) { /* ignora linha com erro */ }
      });
      return novas.length;
    } catch (e) {
      console.error('importarLancamentos_ error for ' + indicador.ID_INDICADOR + ': ' + e.message);
      return 0;
    }
  }

  importarTodosLancamentos() {
    const inds = this.repo.getObjects(SIGEP.sheets.indicadores)
      .filter(ind => String(ind.ABA_PLANILHA_GESTAO || '').trim() && String(ind.LINK_PLANILHA_GESTAO || '').trim());
    let total = 0;
    inds.forEach(ind => { total += this.importarLancamentos_(ind); });
    return total;
  }

  // Converte texto (ex.: ">= 90", "92,3%", "1.234,5") em número.
  static parseNum_(raw) {
    const txt = String(raw == null ? '' : raw).replace(/[^0-9.,-]/g, '').trim();
    if (!txt) return NaN;
    const norm = txt.indexOf(',') > -1 ? txt.replace(/\./g, '').replace(',', '.') : txt;
    const n = Number(norm);
    return Number.isFinite(n) ? n : NaN;
  }

  // Avalia se o valor atinge a meta, priorizando a POLARIDADE quando informada.
  static metaAtingida_(valor, meta, operador, polaridade) {
    const pol = String(polaridade || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    if (pol.indexOf('menor') === 0 || pol.indexOf('menor e melhor') > -1) return valor <= meta;
    if (pol.indexOf('igual') === 0 || pol.indexOf('igual ao alvo') > -1) return valor === meta;
    if (pol.indexOf('maior') === 0 || pol.indexOf('maior e melhor') > -1) return valor >= meta;
    const op = String(operador || '>=').trim();
    if (op === '>') return valor > meta;
    if (op === '<') return valor < meta;
    if (op === '<=') return valor <= meta;
    if (op === '=') return valor === meta;
    return valor >= meta;
  }

  // Resolve a meta vigente em uma competência: a meta por período com a maior
  // VIGENCIA_INICIO <= competência; se não houver, a meta base do indicador.
  static resolveMeta_(indicador, competencia, metasDoIndicador) {
    const base = {
      meta: (indicador && indicador.META) || '',
      operador: (indicador && indicador.META_OPERADOR) || '>=',
      polaridade: (indicador && indicador.POLARIDADE_META) || '',
      vigencia: '',
      origem: 'base'
    };
    const compK = competenciaKey_(competencia);
    if (!compK || !Array.isArray(metasDoIndicador) || !metasDoIndicador.length) return base;
    let escolhido = null;
    metasDoIndicador.forEach(mt => {
      if (String(mt.ATIVO || 'SIM').toUpperCase() === 'NAO' || String(mt.ATIVO || 'SIM').toUpperCase() === 'NÃO') return;
      const k = competenciaKey_(mt.VIGENCIA_INICIO);
      if (!k || k > compK) return;
      if (!escolhido || k > escolhido.k) escolhido = { k, mt };
    });
    if (!escolhido) return base;
    return {
      meta: escolhido.mt.META,
      operador: escolhido.mt.META_OPERADOR || base.operador,
      polaridade: escolhido.mt.POLARIDADE_META || '',
      vigencia: escolhido.mt.VIGENCIA_INICIO || '',
      origem: 'periodo'
    };
  }

  listMetasPeriodo() {
    return this.repo.getObjectsSafe(SIGEP.sheets.metas, [])
      .filter(r => String(r.ID_INDICADOR || '').trim());
  }

  ensureMetasSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SIGEP.sheets.metas);
    if (!sh) {
      sh = ss.insertSheet(SIGEP.sheets.metas);
      sh.getRange(1, 1, 1, SIGEP.metaColumns.length).setValues([SIGEP.metaColumns]);
      this.repo.headersCache[SIGEP.sheets.metas] = SIGEP.metaColumns.slice();
      delete this.repo.objectsCache[SIGEP.sheets.metas];
    }
    return sh;
  }

  criarMetaPeriodo(payload) {
    this.ensureMetasSheet_();
    const idInd = String(payload && payload.ID_INDICADOR || '').trim();
    const vigencia = String(payload && payload.VIGENCIA_INICIO || '').trim();
    const meta = String(payload && payload.META || '').trim();
    if (!idInd) throw new Error('ID_INDICADOR obrigatório.');
    if (!competenciaKey_(vigencia)) throw new Error('VIGENCIA_INICIO inválida. Use MM/AAAA.');
    if (!meta || !Number.isFinite(IndicadorService.parseNum_(meta))) throw new Error('META numérica obrigatória.');
    const row = {
      ID_META: this.generateMetaId_(),
      ID_INDICADOR: idInd,
      VIGENCIA_INICIO: vigencia,
      META: meta,
      META_OPERADOR: String(payload.META_OPERADOR || '>=').trim(),
      POLARIDADE_META: String(payload.POLARIDADE_META || '').trim(),
      ATIVO: 'SIM',
      ULTIMA_ATUALIZACAO: this.repo.formatDateOperational(new Date())
    };
    const saved = this.repo.insertObject(SIGEP.sheets.metas, row, 'ID_META');
    this.audit.logChange({ acao: 'CRIAR_META_PERIODO', entidade: 'INDICADOR', id: idInd, before: null, after: saved, patch: row, origem: 'INDICADORES', motivo: payload.MOTIVO_ALTERACAO || ('Meta vigente a partir de ' + vigencia) });
    return { ok: true, data: saved };
  }

  atualizarMetaPeriodo(payload) {
    this.ensureMetasSheet_();
    const id = String(payload && payload.ID_META || '').trim();
    if (!id) throw new Error('ID_META obrigatório.');
    const patch = {};
    ['VIGENCIA_INICIO', 'META', 'META_OPERADOR', 'POLARIDADE_META', 'ATIVO'].forEach(k => {
      if (payload[k] !== undefined) patch[k] = payload[k];
    });
    if (patch.VIGENCIA_INICIO !== undefined && !competenciaKey_(patch.VIGENCIA_INICIO)) throw new Error('VIGENCIA_INICIO inválida. Use MM/AAAA.');
    if (patch.META !== undefined && !Number.isFinite(IndicadorService.parseNum_(patch.META))) throw new Error('META numérica obrigatória.');
    patch.ULTIMA_ATUALIZACAO = this.repo.formatDateOperational(new Date());
    const current = this.repo.getById(SIGEP.sheets.metas, 'ID_META', id);
    const updated = this.repo.updateById(SIGEP.sheets.metas, 'ID_META', id, patch, current);
    this.audit.logChange({ acao: 'ATUALIZAR_META_PERIODO', entidade: 'INDICADOR', id: current.ID_INDICADOR || id, before: current, after: updated, patch, origem: 'INDICADORES', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
  }

  excluirMetaPeriodo(payload) {
    this.ensureMetasSheet_();
    const id = String(payload && payload.ID_META || '').trim();
    if (!id) throw new Error('ID_META obrigatório.');
    const current = this.repo.getById(SIGEP.sheets.metas, 'ID_META', id);
    this.repo.deleteById(SIGEP.sheets.metas, 'ID_META', id);
    this.audit.logChange({ acao: 'EXCLUIR_META_PERIODO', entidade: 'INDICADOR', id: current.ID_INDICADOR || id, before: current, after: null, patch: null, origem: 'INDICADORES', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true };
  }

  generateMetaId_() {
    const max = this.repo.getMaxNumericSuffix_(SIGEP.sheets.metas, 'ID_META');
    return `META-${String(max + 1).padStart(4, '0')}`;
  }
}

class MapeamentoService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  // Lista usada pelo carregamento inicial: nunca lança erro caso a base ainda não exista.
  listRows() {
    return this.repo.getObjectsSafe(SIGEP.sheets.mapeamento, [])
      .filter(r => String(r.ATIVO || 'SIM').toUpperCase() !== 'NAO' && String(r.ATIVO || 'SIM').toUpperCase() !== 'NÃO');
  }

  list() {
    const exists = !!SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SIGEP.sheets.mapeamento);
    return { ok: true, data: this.listRows(), canSeed: !exists || this.listRows().length === 0 };
  }

  ensureSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SIGEP.sheets.mapeamento);
    if (!sh) {
      sh = ss.insertSheet(SIGEP.sheets.mapeamento);
      sh.getRange(1, 1, 1, SIGEP.mapeamentoColumns.length).setValues([SIGEP.mapeamentoColumns]);
      this.repo.headersCache[SIGEP.sheets.mapeamento] = SIGEP.mapeamentoColumns.slice();
      delete this.repo.objectsCache[SIGEP.sheets.mapeamento];
    }
    return sh;
  }

  create(payload) {
    this.ensureSheet_();
    const nome = String(payload.NOME_PROCESSO || '').trim();
    const grupo = this.normalizeGrupo_(payload.GRUPO_PROCESSO);
    if (!nome) throw new Error('NOME_PROCESSO é obrigatório.');
    if (!grupo) throw new Error('GRUPO_PROCESSO é obrigatório (Gerencial, Finalístico ou Apoio).');
    const row = this.buildRow_(payload, { ID_MAPEAMENTO: this.generateId_(), NOME_PROCESSO: nome, GRUPO_PROCESSO: grupo });
    const saved = this.repo.insertObject(SIGEP.sheets.mapeamento, row, 'ID_MAPEAMENTO');
    this.audit.logChange({ acao: 'CRIAR_MAPEAMENTO', entidade: 'MAPEAMENTO', id: saved.ID_MAPEAMENTO, before: null, after: saved, patch: row, origem: 'MAPEAMENTO', motivo: payload.COMENTARIO || '' });
    return { ok: true, data: saved };
  }

  update(payload) {
    this.ensureSheet_();
    if (!payload || !payload.ID_MAPEAMENTO) throw new Error('ID_MAPEAMENTO obrigatório.');
    const allowed = ['NOME_PROCESSO', 'GRUPO_PROCESSO', 'LINHA', 'COLUNA', 'STATUS', 'RESPONSAVEL', 'ANALISTA', 'LINK_PLANILHA', 'LINK_CONECTA', 'COMENTARIO'];
    const patch = {};
    allowed.forEach(k => {
      if (payload[k] !== undefined) patch[k] = k === 'GRUPO_PROCESSO' ? this.normalizeGrupo_(payload[k]) : payload[k];
    });
    patch.ULTIMA_ATUALIZACAO = this.repo.formatDateOperational(new Date());
    const current = this.repo.getById(SIGEP.sheets.mapeamento, 'ID_MAPEAMENTO', payload.ID_MAPEAMENTO);
    const updated = this.repo.updateById(SIGEP.sheets.mapeamento, 'ID_MAPEAMENTO', payload.ID_MAPEAMENTO, patch, current);
    this.audit.logChange({ acao: 'ATUALIZAR_MAPEAMENTO', entidade: 'MAPEAMENTO', id: payload.ID_MAPEAMENTO, before: current, after: updated, patch, origem: 'MAPEAMENTO', motivo: payload.COMENTARIO || '' });
    return { ok: true, data: updated };
  }

  remove(payload) {
    this.ensureSheet_();
    if (!payload || !payload.ID_MAPEAMENTO) throw new Error('ID_MAPEAMENTO obrigatório para exclusão.');
    const current = this.repo.getById(SIGEP.sheets.mapeamento, 'ID_MAPEAMENTO', payload.ID_MAPEAMENTO);
    this.repo.deleteById(SIGEP.sheets.mapeamento, 'ID_MAPEAMENTO', payload.ID_MAPEAMENTO);
    this.audit.logChange({ acao: 'EXCLUIR_MAPEAMENTO', entidade: 'MAPEAMENTO', id: payload.ID_MAPEAMENTO, before: current, after: null, patch: null, origem: 'MAPEAMENTO', motivo: String(payload.COMENTARIO || '').trim() });
    return { ok: true };
  }

  seedDefaults() {
    this.ensureSheet_();
    if (this.listRows().length) return { ok: true, seeded: 0, message: 'Mapeamento já possui registros.' };
    const grupos = MapeamentoService.defaultContent();
    const rows = [];
    let seq = 0;
    Object.keys(grupos).forEach(grupo => {
      grupos[grupo].forEach((nome, index) => {
        seq += 1;
        rows.push(this.buildRow_({
          STATUS: 'Não iniciado',
          LINHA: Math.floor(index / 4) + 1,
          COLUNA: (index % 4) + 1
        }, {
          ID_MAPEAMENTO: `MAP-${String(seq).padStart(4, '0')}`,
          NOME_PROCESSO: nome,
          GRUPO_PROCESSO: grupo
        }));
      });
    });
    const headers = this.repo.getHeaders(SIGEP.sheets.mapeamento);
    const matrix = rows.map(obj => headers.map(h => (obj[h] !== undefined ? obj[h] : '')));
    this.repo.appendRows(SIGEP.sheets.mapeamento, matrix);
    this.audit.log('SEED_MAPEAMENTO', 'MAPEAMENTO', String(rows.length), 'Conteúdo padrão do mapeamento criado');
    return { ok: true, seeded: rows.length };
  }

  buildRow_(payload, base) {
    return {
      ID_MAPEAMENTO: base.ID_MAPEAMENTO,
      NOME_PROCESSO: base.NOME_PROCESSO,
      GRUPO_PROCESSO: base.GRUPO_PROCESSO,
      LINHA: payload.LINHA !== undefined ? payload.LINHA : '',
      COLUNA: payload.COLUNA !== undefined ? payload.COLUNA : '',
      STATUS: String(payload.STATUS || 'Não iniciado').trim(),
      RESPONSAVEL: String(payload.RESPONSAVEL || '').trim(),
      ANALISTA: String(payload.ANALISTA || '').trim(),
      LINK_PLANILHA: String(payload.LINK_PLANILHA || '').trim(),
      LINK_CONECTA: String(payload.LINK_CONECTA || '').trim(),
      COMENTARIO: String(payload.COMENTARIO || '').trim(),
      ULTIMA_ATUALIZACAO: this.repo.formatDateOperational(new Date()),
      ATIVO: 'SIM'
    };
  }

  normalizeGrupo_(value) {
    const n = String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
    if (n.indexOf('GEREN') === 0) return 'Gerencial';
    if (n.indexOf('FINAL') === 0) return 'Finalístico';
    if (n.indexOf('APOIO') === 0) return 'Apoio';
    return '';
  }

  generateId_() {
    const max = this.repo.getMaxNumericSuffix_(SIGEP.sheets.mapeamento, 'ID_MAPEAMENTO');
    return `MAP-${String(max + 1).padStart(4, '0')}`;
  }

  static defaultContent() {
    return {
      Gerencial: [
        'Gestão da Comunicação',
        'Satisfação e Experiência dos Usuários',
        'Prevenção e Controle de Infecções Hospitalares',
        'Vigilância Epidemiológica',
        'Gestão Administrativa e Financeira',
        'Gestão da Clínica',
        'Comissões Obrigatórias',
        'Gestão da Qualidade e Segurança do Paciente'
      ],
      Finalístico: [
        'Atendimento Ambulatorial',
        'Assistência Oncológica',
        'Assistência em Cirurgia Oncológica',
        'Assistência Hemodinâmica',
        'Atendimento Cirúrgico',
        'Assistência em Obstetrícia',
        'Assistência Neonatal',
        'Ensino e Pesquisa e Inovação em Saúde',
        'Assistência em Terapia Intensiva Cardiopediátrica',
        'Casa da Gestante',
        'Assistência em Terapia Intensiva',
        'Assistência em Hematologia',
        'Assistência em Cirurgia Vascular',
        'Assistência em Cirurgia Urológica',
        'Assistência em Cirurgia de Cabeça e Pescoço',
        'Assistência em Ortopedia',
        'Assistência em Clínica Médica',
        'Assistência em Cirurgia Geral e Digestiva',
        'Assistência em Cirurgia Cardiopediatria'
      ],
      Apoio: [
        'Segurança e Medicina do Trabalho',
        'Segurança Institucional',
        'Coleta Laboratorial',
        'Diagnóstico por Imagem',
        'Nutrição e Dietética',
        'Processamento de Leite Humano',
        'Gestão do Acesso',
        'Assistência Hemoterápica',
        'Faturamento e Arquivo de Prontuários',
        'Rouparia',
        'Desenvolvimento Humano Organizacional',
        'Transporte Hospitalar',
        'Gestão de Infraestrutura',
        'Gestão de Equipamentos Tecnologia Hospitalar',
        'Gestão de Suprimentos',
        'Assistência Farmacêutica',
        'Processamento de Produtos para a Saúde',
        'Métodos Endoscópicos e Videoscópicos',
        'Tecnologia da Informação',
        'Higienização'
      ]
    };
  }
}

class GestorService {
  constructor(repo, audit, auth) {
    this.repo = repo;
    this.audit = audit;
    this.auth = auth;
  }

  listRows() {
    return this.repo.getObjectsSafe(SIGEP.sheets.gestores, []);
  }

  // Aplica mascaramento de campos sensíveis para perfis sem permissão de administrador.
  list() {
    let isAdmin = false;
    try {
      const user = this.auth.getCurrentUser();
      isAdmin = ['ADMIN', 'ADMINISTRADOR'].includes(user.perfil);
    } catch (e) {
      isAdmin = false;
    }
    const rows = this.listRows().map(row => this.maskSensitive_(row, isAdmin));
    return { ok: true, data: rows, isAdmin };
  }

  maskSensitive_(row, isAdmin) {
    if (isAdmin) return row;
    const clone = { ...row };
    (SIGEP.gestorSensitiveColumns || []).forEach(col => {
      if (clone[col] !== undefined && String(clone[col]).trim() !== '') clone[col] = '••••••';
    });
    return clone;
  }

  ensureSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SIGEP.sheets.gestores);
    if (!sh) {
      sh = ss.insertSheet(SIGEP.sheets.gestores);
      sh.getRange(1, 1, 1, SIGEP.gestorColumns.length).setValues([SIGEP.gestorColumns]);
      this.repo.headersCache[SIGEP.sheets.gestores] = SIGEP.gestorColumns.slice();
      delete this.repo.objectsCache[SIGEP.sheets.gestores];
    }
    return sh;
  }

  save(payload) {
    this.ensureSheet_();
    const nome = String(payload.NOME || '').trim();
    if (!nome) throw new Error('NOME do gestor é obrigatório.');
    const id = String(payload.ID_GESTOR || '').trim();
    const patch = {
      NOME: nome,
      FUNCAO: String(payload.FUNCAO || '').trim(),
      SETOR: String(payload.SETOR || '').trim(),
      EMAIL: String(payload.EMAIL || '').trim().toLowerCase(),
      TELEFONE: String(payload.TELEFONE || '').trim(),
      CPF: String(payload.CPF || '').trim(),
      VINCULO: String(payload.VINCULO || '').trim(),
      NOTIFICA_LOGIN: String(payload.NOTIFICA_LOGIN || '').trim(),
      NOTIFICA_SENHA: String(payload.NOTIFICA_SENHA || '').trim(),
      NOTIFICA_SITUACAO: String(payload.NOTIFICA_SITUACAO || '').trim(),
      OBSERVACOES: String(payload.OBSERVACOES || '').trim(),
      ATIVO: String(payload.ATIVO || 'SIM').trim().toUpperCase(),
      ULTIMA_ATUALIZACAO: this.repo.formatDateOperational(new Date())
    };
    // Não sobrescreve campos sensíveis em branco quando o registro já existe (mascaramento).
    const existing = id ? this.listRows().find(r => String(r.ID_GESTOR || '').trim() === id) : null;
    if (existing) {
      (SIGEP.gestorSensitiveColumns || []).forEach(col => {
        const v = String(payload[col] || '').trim();
        if (!v || v === '••••••') patch[col] = existing[col] || '';
      });
      const updated = this.repo.updateById(SIGEP.sheets.gestores, 'ID_GESTOR', id, patch, existing);
      this.audit.logChange({ acao: 'ATUALIZAR_GESTOR', entidade: 'GESTOR', id, before: this.redactForAudit_(existing), after: this.redactForAudit_(updated), patch: this.redactForAudit_(patch), origem: 'ADMIN', motivo: payload.MOTIVO_ALTERACAO || '' });
      return { ok: true, data: this.maskSensitive_(updated, true) };
    }
    patch.ID_GESTOR = id || this.generateId_();
    const saved = this.repo.insertObject(SIGEP.sheets.gestores, patch, 'ID_GESTOR');
    this.audit.logChange({ acao: 'CRIAR_GESTOR', entidade: 'GESTOR', id: saved.ID_GESTOR, before: null, after: this.redactForAudit_(saved), patch: this.redactForAudit_(patch), origem: 'ADMIN', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: saved };
  }

  remove(payload) {
    this.ensureSheet_();
    const id = String((payload && (payload.ID_GESTOR || payload)) || '').trim();
    if (!id) throw new Error('ID_GESTOR obrigatório para exclusão.');
    this.repo.deleteById(SIGEP.sheets.gestores, 'ID_GESTOR', id);
    this.audit.log('EXCLUIR_GESTOR', 'GESTOR', id, 'Exclusão de gestor');
    return { ok: true };
  }

  // Vincula o gestor a um setor, indicador ou item de mapeamento.
  vincular(payload) {
    const id = String(payload && payload.ID_GESTOR || '').trim();
    const tipo = String(payload && payload.TIPO || '').toUpperCase().trim();
    const alvo = String(payload && payload.ALVO || '').trim();
    if (!id) throw new Error('ID_GESTOR obrigatório.');
    if (!tipo || !alvo) throw new Error('Informe o tipo de vínculo e o alvo.');
    const gestor = this.listRows().find(r => String(r.ID_GESTOR || '').trim() === id);
    if (!gestor) throw new Error('Gestor não encontrado.');
    if (tipo === 'SETOR') {
      this.save({ ...gestor, SETOR: alvo, MOTIVO_ALTERACAO: 'Vínculo de setor' });
    } else if (tipo === 'INDICADOR') {
      const ind = new IndicadorService(this.repo, this.audit);
      ind.update({ ID_INDICADOR: alvo, GESTOR_RESPONSAVEL: gestor.NOME, MOTIVO_ALTERACAO: 'Vínculo de gestor responsável' });
    } else if (tipo === 'MAPEAMENTO') {
      const map = new MapeamentoService(this.repo, this.audit);
      map.update({ ID_MAPEAMENTO: alvo, RESPONSAVEL: gestor.NOME, COMENTARIO: 'Vínculo de gestor responsável' });
    } else {
      throw new Error('Tipo de vínculo não suportado: ' + tipo);
    }
    this.audit.log('VINCULAR_GESTOR', 'GESTOR', id, JSON.stringify({ tipo, alvo }));
    return { ok: true };
  }

  redactForAudit_(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const clone = { ...obj };
    (SIGEP.gestorSensitiveColumns || []).forEach(col => {
      if (clone[col] !== undefined && String(clone[col]).trim() !== '') clone[col] = '[restrito]';
    });
    return clone;
  }

  generateId_() {
    const max = this.repo.getMaxNumericSuffix_(SIGEP.sheets.gestores, 'ID_GESTOR');
    return `GEST-${String(max + 1).padStart(4, '0')}`;
  }
}

class DashboardService {
  build(processos, acompanhamento, indicadores, lancamentos) {
    const unidades = new Set(acompanhamento.map(x => x.UNIDADE).filter(Boolean));
    const agendamentosRealizados = acompanhamento.filter(x => this.norm(x.STATUS_AGENDAMENTO).includes('REALIZADA')).length;
    const reagendados = acompanhamento.filter(x => this.norm(x.STATUS_AGENDAMENTO).includes('REAGENDADO')).length;
    const processosConcluidos = processos.filter(x => this.norm(x.STATUS_GERAL).includes('CONCLUID')).length;
    const lancamentosPreenchidos = lancamentos.filter(x => String(x.VALOR || '').trim() !== '').length;
    const progressoMedio = acompanhamento.length
      ? Math.round(acompanhamento.reduce((sum, item) => sum + Number(item.PROGRESSO_PERCENTUAL || 0), 0) / acompanhamento.length)
      : 0;

    return {
      processosTotal: processos.length,
      processosConcluidos,
      acompanhamentoLinhas: acompanhamento.length,
      unidadesAcompanhadas: unidades.size,
      agendamentosRealizados,
      reagendados,
      progressoMedio,
      indicadoresTotal: indicadores.length,
      lancamentosTotal: lancamentos.length,
      lancamentosPreenchidos
    };
  }

  norm(v) {
    return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  refreshAnalyticalSnapshot(repo, audit) {
    const processos = repo.getObjects(SIGEP.sheets.processos).map(DomainNormalizer.processo.bind(DomainNormalizer));
    const acompanhamento = repo.getObjects(SIGEP.sheets.acompanhamento).map(DomainNormalizer.acompanhamento.bind(DomainNormalizer));
    const indicadores = repo.getObjects(SIGEP.sheets.indicadores).map(DomainNormalizer.indicador.bind(DomainNormalizer));
    const lancamentos = repo.getObjects(SIGEP.sheets.lancamentos);
    const now = new Date();
    const payload = {
      dashboard: this.build(processos, acompanhamento, indicadores, lancamentos),
      generatedAt: now.toISOString(),
      generatedAtLocal: repo.formatDateOperational(now)
    };
    const sh = repo.getSheet(SIGEP.sheets.dashboardBase);
    sh.clearContents();
    sh.getRange(1, 1, 1, 2).setValues([['CHAVE', 'VALOR_JSON']]);
    sh.getRange(2, 1, 1, 2).setValues([['LATEST', JSON.stringify(payload)]]);
    if (audit) audit.log('SNAPSHOT_DASHBOARD', 'DASHBOARD_BASE', 'LATEST', 'Snapshot analítico atualizado');
    return { ok: true, ...payload };
  }

  getLatestSnapshot(repo) {
    try {
      const rows = repo.getObjects(SIGEP.sheets.dashboardBase);
      const row = rows.find(r => String(r.CHAVE || '') === 'LATEST');
      if (!row || !row.VALOR_JSON) return null;
      return JSON.parse(row.VALOR_JSON);
    } catch (e) {
      return null;
    }
  }
}

class BaseHealthService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  run() {
    const findings = [];
    findings.push(...this.checkDuplicateIds_('BASE_PROCESSOS', 'ID_PROCESSO'));
    findings.push(...this.checkDuplicateIds_('BASE_ACOMPANHAMENTO', 'ID_ACOMPANHAMENTO'));
    findings.push(...this.checkDuplicateIds_('BASE_INDICADORES', 'ID_INDICADOR'));
    findings.push(...this.checkMissingHeaders_());
    findings.push(...this.checkInvalidDates_('BASE_ACOMPANHAMENTO', 'DATA_AGENDAMENTO'));
    findings.push(...this.checkOrphanRows_());
    findings.push(...this.checkCrossSheetInconsistency_());
    const severity = findings.length ? 'ALERTA' : 'OK';
    const details = JSON.stringify({ severity, findings });
    this.audit.log('HEALTHCHECK_BASES', 'BASES', severity, details);
    if (findings.length) {
      this.audit.log('ALERTA_ADMIN', 'BASES', 'HEALTHCHECK', 'Foram encontradas inconsistências nas bases');
    }
    return { ok: true, severity, findings };
  }

  checkDuplicateIds_(sheet, idColumn) {
    const rows = this.repo.getObjects(sheet);
    const seen = new Set();
    const dup = new Set();
    rows.forEach(r => {
      const id = String(r[idColumn] || '').trim();
      if (!id) return;
      if (seen.has(id)) dup.add(id);
      seen.add(id);
    });
    return [...dup].map(id => ({ type: 'DUPLICATE_ID', sheet, idColumn, id }));
  }
  checkMissingHeaders_() {
    const out = [];
    Object.keys(SIGEP.schema.required || {}).forEach(sheet => {
      const headers = this.repo.getHeaders(sheet).map(h => String(h).trim());
      (SIGEP.schema.required[sheet] || []).forEach(req => {
        if (!headers.includes(req)) out.push({ type: 'MISSING_HEADER', sheet, header: req });
      });
    });
    return out;
  }
  checkInvalidDates_(sheet, col) {
    return this.repo.getObjects(sheet)
      .filter(r => String(r[col] || '').trim() && isNaN(new Date(r[col]).getTime()))
      .map(r => ({ type: 'INVALID_DATE', sheet, col, row: r._rowNumber, value: r[col] }));
  }
  checkOrphanRows_() {
    return this.repo.getObjects('BASE_ACOMPANHAMENTO')
      .filter(r => !String(r.ID_ACOMPANHAMENTO || '').trim())
      .map(r => ({ type: 'ORPHAN_ROW', sheet: 'BASE_ACOMPANHAMENTO', row: r._rowNumber }));
  }
  checkCrossSheetInconsistency_() {
    const unidades = new Set(this.repo.getObjects('BASE_UNIDADES').map(x => String(x.UNIDADE || x.NOME_SETOR || '').trim()).filter(Boolean));
    return this.repo.getObjects('BASE_ACOMPANHAMENTO')
      .filter(r => String(r.UNIDADE || '').trim() && !unidades.has(String(r.UNIDADE || '').trim()))
      .map(r => ({ type: 'INCONSISTENT_REFERENCE', sheet: 'BASE_ACOMPANHAMENTO', row: r._rowNumber, unidade: r.UNIDADE }));
  }
}

class OperationalHardeningService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  setupDailyAutomation() {
    this.ensureBackupSheet_();
    this.protectBaseSheets_();
    const triggerCreated = this.ensureDailyTrigger_();
    this.audit.log('PHASE1_SETUP', 'AUTOMACAO', triggerCreated ? 'TRIGGER_CRIADO' : 'TRIGGER_EXISTENTE', 'Fase 1 configurada');
    return { ok: true, triggerCreated };
  }

  runDailyGuard() {
    this.ensureBackupSheet_();
    this.protectBaseSheets_();
    const health = new BaseHealthService(this.repo, this.audit).run();
    const backup = this.createLogicalBackup_();
    if (health.findings && health.findings.length) {
      this.sendHealthAlertEmail_(health, backup);
    }
    return { ok: true, health, backup };
  }

  ensureDailyTrigger_() {
    const fnName = 'runDailyOperationalGuardJob';
    const exists = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === fnName);
    if (exists) return false;
    ScriptApp.newTrigger(fnName)
      .timeBased()
      .everyDays(1)
      .atHour(SIGEP.operations.dailyJobHour)
      .create();
    return true;
  }

  protectBaseSheets_() {
    const baseNames = Object.values(SIGEP.sheets).filter(name => String(name).indexOf('BASE_') === 0);
    const ownerEmail = Session.getEffectiveUser().getEmail();
    baseNames.forEach(sheetName => {
      const sh = this.repo.getSheet(sheetName);
      const protections = sh.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      const managedDescription = '[SIGEP] PROTECAO_BASE_WEBAPP';
      const alreadyManaged = protections.find(p => p.getDescription() === managedDescription);
      if (alreadyManaged) return;
      const protection = sh.protect().setDescription(managedDescription);
      protection.setWarningOnly(false);
      protection.removeEditors(protection.getEditors());
      if (ownerEmail) protection.addEditor(ownerEmail);
    });
  }

  ensureBackupSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SIGEP.sheets.backups);
    if (!sh) {
      sh = ss.insertSheet(SIGEP.sheets.backups);
      sh.getRange(1, 1, 1, 4).setValues([['DATA_EXECUCAO', 'RESUMO_JSON', 'QTD_FINDINGS', 'SEVERIDADE']]);
    }
    return sh;
  }

  createLogicalBackup_() {
    const payload = {
      generatedAt: new Date().toISOString(),
      generatedAtLocal: this.repo.formatDateOperational(new Date()),
      BASE_PROCESSOS: this.repo.getObjects(SIGEP.sheets.processos),
      BASE_ACOMPANHAMENTO: this.repo.getObjects(SIGEP.sheets.acompanhamento),
      BASE_INDICADORES: this.repo.getObjects(SIGEP.sheets.indicadores),
      BASE_LANCAMENTOS_INDICADORES: this.repo.getObjects(SIGEP.sheets.lancamentos),
      BASE_UNIDADES: this.repo.getObjects(SIGEP.sheets.unidades)
    };
    const summary = {
      generatedAt: payload.generatedAt,
      generatedAtLocal: payload.generatedAtLocal,
      counts: Object.keys(payload).filter(k => k.indexOf('BASE_') === 0).reduce((acc, key) => {
        acc[key] = payload[key].length;
        return acc;
      }, {})
    };
    const sh = this.ensureBackupSheet_();
    this.repo.appendRows(SIGEP.sheets.backups, [[payload.generatedAtLocal, JSON.stringify(summary), 0, 'OK']]);
    return summary;
  }

  sendHealthAlertEmail_(health, backup) {
    const recipients = this.resolveAdminEmails_();
    if (!recipients.length) return;
    const subject = '[SIGEP-HUC] Alerta crítico de integridade das bases';
    const body = [
      'Foram encontradas inconsistências no health check diário.',
      '',
      'Data: ' + this.repo.formatDateOperational(new Date()),
      'Severidade: ' + health.severity,
      'Quantidade de achados: ' + health.findings.length,
      'Resumo do backup: ' + JSON.stringify(backup.counts),
      '',
      'Primeiros achados:',
      JSON.stringify(health.findings.slice(0, 15), null, 2)
    ].join('\n');
    MailApp.sendEmail(recipients.join(','), subject, body);
    this.audit.log('EMAIL_ALERTA_HEALTHCHECK', 'BASES', recipients.join(','), 'Alerta de saúde enviado');
  }

  resolveAdminEmails_() {
    const fromUsers = this.repo.getObjectsSafe(SIGEP.sheets.usuarios, [])
      .filter(u => String(u.ATIVO || '').toUpperCase() === 'SIM' && String(u.PERFIL || '').toUpperCase() === 'ADMIN')
      .map(u => String(u.EMAIL || '').trim().toLowerCase())
      .filter(Boolean);
    const fromConfig = (SIGEP.operations.adminEmails || []).map(e => String(e || '').trim().toLowerCase()).filter(Boolean);
    return [...new Set(fromUsers.concat(fromConfig))];
  }
}

// Governança mensal de indicadores: pendências de preenchimento + desvios de meta.
class GovernanceService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  buildMonthlyDigest(competencia) {
    const comp = competencia || this.currentCompetencia_();
    const indicadores = this.repo.getObjectsSafe(SIGEP.sheets.indicadores, []).map(DomainNormalizer.indicador.bind(DomainNormalizer));
    const lancamentos = this.repo.getObjectsSafe(SIGEP.sheets.lancamentos, []);
    const porIndicador = {};
    lancamentos.forEach(l => {
      const id = String(l.ID_INDICADOR || '').trim();
      if (!id) return;
      (porIndicador[id] = porIndicador[id] || []).push(l);
    });

    const pendentesPreenchimento = [];
    const foraDaMeta = [];
    indicadores.forEach(ind => {
      const periodic = String(ind.PERIODICIDADE || '').toLowerCase();
      const mensal = !periodic || periodic.indexOf('mensal') > -1;
      const lans = porIndicador[ind.ID_INDICADOR] || [];
      if (mensal) {
        const temComp = lans.some(l => this.sameComp_(l.COMPETENCIA, comp) && String(l.VALOR || '').trim() !== '');
        if (!temComp) {
          pendentesPreenchimento.push({
            id: ind.ID_INDICADOR, nome: ind.NOME_INDICADOR, processo: ind.PROCESSO,
            analista: ind.ANALISTA_RESPONSAVEL || '', gestor: ind.GESTOR_RESPONSAVEL || ''
          });
        }
      }
      const consec = this.consecutiveOutOfTarget_(lans, ind);
      if (consec.meses >= 1) {
        foraDaMeta.push({
          id: ind.ID_INDICADOR, nome: ind.NOME_INDICADOR, processo: ind.PROCESSO,
          mesesForaDaMeta: consec.meses, ultimoValor: consec.ultimoValor,
          gestor: ind.GESTOR_RESPONSAVEL || '', analista: ind.ANALISTA_RESPONSAVEL || ''
        });
      }
    });
    foraDaMeta.sort((a, b) => b.mesesForaDaMeta - a.mesesForaDaMeta);
    return { ok: true, competencia: comp, pendentesPreenchimento, foraDaMeta };
  }

  runMonthly() {
    const digest = this.buildMonthlyDigest();
    this.audit.log('GOVERNANCA_MENSAL', 'INDICADORES', digest.competencia,
      JSON.stringify({ pendentes: digest.pendentesPreenchimento.length, foraDaMeta: digest.foraDaMeta.length }));
    const enviado = this.sendDigestEmail_(digest);
    return { ok: true, competencia: digest.competencia, pendentes: digest.pendentesPreenchimento.length, foraDaMeta: digest.foraDaMeta.length, emailEnviado: enviado };
  }

  setupTrigger() {
    const fn = 'runGovernancaMensalJob';
    const exists = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === fn);
    if (exists) return { ok: true, triggerCreated: false };
    ScriptApp.newTrigger(fn).timeBased().onMonthDay(1).atHour(7).create();
    this.audit.log('GOVERNANCA_SETUP', 'AUTOMACAO', 'TRIGGER', 'Trigger mensal de governança criado');
    return { ok: true, triggerCreated: true };
  }

  sendDigestEmail_(digest) {
    const ops = new OperationalHardeningService(this.repo, this.audit);
    const recipients = ops.resolveAdminEmails_();
    if (!recipients.length) return false;
    if (!digest.pendentesPreenchimento.length && !digest.foraDaMeta.length) return false;
    const linhasPend = digest.pendentesPreenchimento.slice(0, 30)
      .map(p => `- ${p.nome} (${p.processo || 'sem processo'}) · resp.: ${p.analista || p.gestor || 'não definido'}`).join('\n');
    const linhasMeta = digest.foraDaMeta.slice(0, 30)
      .map(p => `- ${p.nome}: ${p.mesesForaDaMeta} mês(es) fora da meta (último: ${p.ultimoValor})`).join('\n');
    const body = [
      'Resumo mensal de governança de indicadores — competência ' + digest.competencia,
      '',
      'Pendências de preenchimento: ' + digest.pendentesPreenchimento.length,
      linhasPend || '(nenhuma)',
      '',
      'Indicadores fora da meta: ' + digest.foraDaMeta.length,
      linhasMeta || '(nenhum)'
    ].join('\n');
    MailApp.sendEmail(recipients.join(','), '[SIGEP-HUC] Governança mensal de indicadores — ' + digest.competencia, body);
    return true;
  }

  consecutiveOutOfTarget_(lans, ind) {
    const meta = IndicadorService.parseNum_(ind.META);
    if (!Number.isFinite(meta)) return { meses: 0, ultimoValor: '' };
    const ordered = lans
      .map(l => ({ comp: l.COMPETENCIA, valor: l.VALOR, num: IndicadorService.parseNum_(l.VALOR), key: this.compKey_(l.COMPETENCIA) }))
      .filter(l => Number.isFinite(l.num) && l.key > 0)
      .sort((a, b) => a.key - b.key);
    let meses = 0;
    let ultimoValor = '';
    for (let i = ordered.length - 1; i >= 0; i--) {
      const dentro = IndicadorService.metaAtingida_(ordered[i].num, meta, ind.META_OPERADOR, ind.POLARIDADE_META);
      if (i === ordered.length - 1) ultimoValor = String(ordered[i].valor || '');
      if (dentro) break;
      meses++;
    }
    return { meses, ultimoValor };
  }

  currentCompetencia_() {
    const tz = (SIGEP.timezones && SIGEP.timezones.operational) || Session.getScriptTimeZone();
    return Utilities.formatDate(new Date(), tz, 'MM/yyyy');
  }

  sameComp_(a, b) {
    return this.compKey_(a) === this.compKey_(b) && this.compKey_(a) > 0;
  }

  // Converte competência (MM/AAAA, MM/AA, mmm/aa) em chave ordenável (ano*12+mês).
  compKey_(raw) {
    return competenciaKey_(raw);
  }
}

class ProductivityService {
  constructor(repo, audit, auth) {
    this.repo = repo;
    this.audit = audit;
    this.auth = auth;
  }

  runBulkUpdate(payload) {
    const data = payload || {};
    const modulo = String(data.modulo || '').toUpperCase();
    const updates = Array.isArray(data.updates) ? data.updates : [];
    if (!updates.length) throw new Error('Nenhuma atualização enviada para operação em lote.');
    const reason = String(data.motivo || '').trim();
    if (!reason) throw new Error('Motivo é obrigatório para atualização em lote.');
    let success = 0;
    const errors = [];
    updates.forEach((u, index) => {
      try {
        if (modulo === 'PROCESSOS') {
          const service = new ProcessoService(this.repo, this.audit);
          service.update({ ...u, MOTIVO_ALTERACAO: reason });
        } else if (modulo === 'ACOMPANHAMENTO') {
          const service = new AcompanhamentoService(this.repo, this.audit);
          service.updateStatus({ ...u, MOTIVO_ALTERACAO: reason });
        } else if (modulo === 'INDICADORES') {
          const service = new IndicadorService(this.repo, this.audit);
          service.update({ ...u, MOTIVO_ALTERACAO: reason });
        } else {
          throw new Error('Módulo não suportado para lote: ' + modulo);
        }
        success++;
      } catch (err) {
        errors.push({ index, error: err.message });
      }
    });
    return { ok: errors.length === 0, modulo, total: updates.length, success, errors };
  }

  getPainelPendencias(payload) {
    const limiteDias = Math.max(1, Number(payload && payload.limiteDiasSemAtualizacao || 7));
    const now = new Date();
    const acompanhamento = this.auth.applyDataScope(
      this.repo.getObjects(SIGEP.sheets.acompanhamento).map(DomainNormalizer.acompanhamento.bind(DomainNormalizer))
    );
    const pendencias = acompanhamento.map(row => {
      const status = String(row.STATUS_AGENDAMENTO || '').toUpperCase();
      const data = row.DATA_AGENDAMENTO ? new Date(row.DATA_AGENDAMENTO) : null;
      const diasSemAtualizacao = data && !isNaN(data.getTime()) ? Math.floor((now.getTime() - data.getTime()) / 86400000) : null;
      return {
        id: row.ID_ACOMPANHAMENTO,
        unidade: row.UNIDADE || '',
        status: row.STATUS_AGENDAMENTO || '',
        progresso: Number(row.PROGRESSO_PERCENTUAL || 0),
        diasSemAtualizacao,
        emAtraso: status.includes('ATRAS') || (diasSemAtualizacao !== null && diasSemAtualizacao > limiteDias),
        semAtualizacaoCritica: diasSemAtualizacao !== null && diasSemAtualizacao > limiteDias
      };
    });
    const atrasados = pendencias.filter(x => x.emAtraso);
    const semAtualizacaoCritica = pendencias.filter(x => x.semAtualizacaoCritica);
    const baixoProgresso = pendencias.filter(x => x.progresso < 50);
    return {
      ok: true,
      total: pendencias.length,
      resumo: {
        atrasados: atrasados.length,
        semAtualizacaoCritica: semAtualizacaoCritica.length,
        baixoProgresso: baixoProgresso.length
      },
      itens: pendencias.sort((a, b) => Number(b.emAtraso) - Number(a.emAtraso) || (b.diasSemAtualizacao || 0) - (a.diasSemAtualizacao || 0))
    };
  }

  salvarFiltroAvancado(payload) {
    const user = this.auth.getCurrentUser();
    const name = String(payload && payload.nome || '').trim();
    const filtros = payload && payload.filtros;
    if (!name) throw new Error('Nome do filtro é obrigatório.');
    if (!filtros || typeof filtros !== 'object') throw new Error('Filtros inválidos.');
    const key = ['sigep:filtros', user.email, name].join(':');
    PropertiesService.getUserProperties().setProperty(key, JSON.stringify({ nome: name, filtros, updatedAt: new Date().toISOString() }));
    return { ok: true, nome: name };
  }

  listarFiltrosAvancados() {
    const user = this.auth.getCurrentUser();
    const prefix = ['sigep:filtros', user.email, ''].join(':');
    const all = PropertiesService.getUserProperties().getProperties();
    const list = Object.keys(all)
      .filter(k => k.indexOf(prefix) === 0)
      .map(k => JSON.parse(all[k]))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return { ok: true, filtros: list };
  }
}

class ConfigService {
  constructor(repo, audit, auth) {
    this.repo = repo;
    this.audit = audit;
    this.auth = auth;
  }

  getPublicConfig() {
    const currentVersion = this.getCurrentSchemaVersion_();
    return {
      ok: true,
      schemaVersion: currentVersion,
      targetVersion: this.getTargetSchemaVersion_(),
      timezone: SIGEP.timezones.operational,
      limits: { pageSizeDefault: 50, pageSizeMax: 200 }
    };
  }

  runMigrations() {
    const user = this.auth.assertAuthorized('ADMIN', 'ADMIN');
    this.ensureConfigSheet_();
    let current = this.getCurrentSchemaVersion_();
    const target = this.getTargetSchemaVersion_();
    const steps = [];
    while (current < target) {
      const next = current + 1;
      this.applyMigrationStep_(next);
      steps.push(next);
      current = next;
      this.setSchemaVersion_(current);
    }
    this.audit.log('SCHEMA_MIGRATION', 'CONFIG_APP', String(current), JSON.stringify({ actor: user.email, steps }));
    return { ok: true, from: this.getCurrentSchemaVersion_() - steps.length, to: current, steps };
  }

  getCurrentSchemaVersion_() {
    const scriptProp = PropertiesService.getScriptProperties().getProperty(SIGEP.appConfig.schemaVersionKey);
    if (scriptProp) return Number(scriptProp) || SIGEP.appConfig.defaultSchemaVersion;
    const rows = this.repo.getObjectsSafe(SIGEP.appConfig.sheet, []);
    const row = rows.find(r => String(r.CHAVE || '').trim() === SIGEP.appConfig.schemaVersionKey);
    if (!row) return SIGEP.appConfig.defaultSchemaVersion;
    return Number(row.VALOR || SIGEP.appConfig.defaultSchemaVersion) || SIGEP.appConfig.defaultSchemaVersion;
  }

  getTargetSchemaVersion_() {
    return 4;
  }

  setSchemaVersion_(version) {
    const value = String(version);
    PropertiesService.getScriptProperties().setProperty(SIGEP.appConfig.schemaVersionKey, value);
    const rows = this.repo.getObjectsSafe(SIGEP.appConfig.sheet, []);
    const row = rows.find(r => String(r.CHAVE || '').trim() === SIGEP.appConfig.schemaVersionKey);
    if (row) {
      this.repo.updateById(SIGEP.appConfig.sheet, 'CHAVE', SIGEP.appConfig.schemaVersionKey, { CHAVE: SIGEP.appConfig.schemaVersionKey, VALOR: value });
    } else {
      this.repo.append(SIGEP.appConfig.sheet, [SIGEP.appConfig.schemaVersionKey, value, 'versão de schema']);
    }
  }

  applyMigrationStep_(version) {
    if (version === 2) this.ensureConfigSheet_();
    if (version === 3) this.ensureColumnIfMissing_(SIGEP.sheets.usuarios, 'SETOR');
    if (version === 4) this.ensureBackupSheet_();
  }

  ensureConfigSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SIGEP.appConfig.sheet);
    if (!sh) {
      sh = ss.insertSheet(SIGEP.appConfig.sheet);
      sh.getRange(1, 1, 1, 3).setValues([['CHAVE', 'VALOR', 'DESCRICAO']]);
    }
    return sh;
  }

  ensureBackupSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss.getSheetByName(SIGEP.sheets.backups)) {
      const sh = ss.insertSheet(SIGEP.sheets.backups);
      sh.getRange(1, 1, 1, 4).setValues([['DATA_EXECUCAO', 'RESUMO_JSON', 'QTD_FINDINGS', 'SEVERIDADE']]);
    }
  }

  ensureColumnIfMissing_(sheetName, columnName) {
    const sh = this.repo.getSheet(sheetName);
    const headers = this.repo.getHeaders(sheetName).map(h => String(h).trim());
    if (headers.includes(columnName)) return;
    sh.insertColumnAfter(headers.length);
    sh.getRange(1, headers.length + 1, 1, 1).setValues([[columnName]]);
  }
}


class AdminService {
  constructor(repo, audit, gestores) {
    this.repo = repo;
    this.audit = audit;
    this.gestores = gestores;
  }

  getAdminData() {
    const usuarios = this.repo.getObjects(SIGEP.sheets.usuarios);
    const unidades = this.repo.getObjects(SIGEP.sheets.unidades);
    const parameterSheets = this.repo.getParameterSheets_();
    const gestores = this.gestores ? this.gestores.list() : { data: [], isAdmin: true };
    return {
      gestores: gestores.data || [],
      gestoresIsAdmin: gestores.isAdmin !== false,
      ok: true,
      usuarios,
      status: parameterSheets.CONFIG_STATUS || [],
      tiposProcesso: parameterSheets.CONFIG_TIPOS_PROCESSO || [],
      featureFlags: parameterSheets.CONFIG_FEATURE_FLAGS || [],
      unidades,
      review: this.getDataReviewReport(),
      setores: unidades.map(x => ({
        ID_SETOR: x.ID_SETOR || x.ID_UNIDADE || x.UNIDADE,
        NOME_SETOR: x.NOME_SETOR || x.UNIDADE || '',
        SIGLA: x.SIGLA || ''
      }))
    };
  }

  getDataReviewReport() {
    const report = [];
    report.push(...this.reviewLancamentos_());
    report.push(...this.reviewUnidades_());
    return { ok: true, generatedAt: new Date().toISOString(), findings: report, totalFindings: report.length };
  }

  aplicarCorrecaoDados(payload) {
    if (!payload || !payload.sheetName || !payload.rowNumber || !payload.fieldName) throw new Error('Payload de correção inválido.');
    const result = this.aplicarCorrecaoDadosEmLote({
      updates: [{
        sheetName: payload.sheetName,
        rowNumber: payload.rowNumber,
        fieldName: payload.fieldName,
        newValue: payload.newValue
      }]
    });
    if (result.failed > 0) {
      throw new Error(result.errors[0] && result.errors[0].message ? result.errors[0].message : 'Falha ao aplicar correção.');
    }
    return { ok: true };
  }

  aplicarCorrecaoDadosEmLote(payload) {
    const updates = payload && Array.isArray(payload.updates) ? payload.updates : [];
    if (!updates.length) throw new Error('Nenhuma correção informada para o lote.');

    const headersCache = {};
    const sheetCache = {};
    const errors = [];
    let success = 0;

    const groupedBySheetAndColumn = {};

    updates.forEach((item, idx) => {
      try {
        if (!item || !item.sheetName || !item.rowNumber || !item.fieldName) throw new Error('Item inválido no índice ' + idx + '.');

        if (!sheetCache[item.sheetName]) sheetCache[item.sheetName] = this.repo.getSheet(item.sheetName);
        if (!headersCache[item.sheetName]) headersCache[item.sheetName] = this.repo.getHeaders(item.sheetName).map(h => String(h || '').trim());

        const rowNumber = Number(item.rowNumber);
        if (!rowNumber || rowNumber < 2) throw new Error('Linha inválida para atualização: ' + item.rowNumber);

        const colIndex = this.findHeaderIndex_(headersCache[item.sheetName], item.fieldName);
        if (colIndex === -1) throw new Error('Campo não encontrado para correção: ' + item.fieldName);

        const groupKey = item.sheetName + '::' + colIndex;
        if (!groupedBySheetAndColumn[groupKey]) {
          groupedBySheetAndColumn[groupKey] = {
            sheetName: item.sheetName,
            colIndex,
            rows: []
          };
        }
        groupedBySheetAndColumn[groupKey].rows.push({
          rowNumber,
          value: item.newValue || '',
          audit: {
            sheetName: item.sheetName,
            rowNumber: String(rowNumber),
            payload: JSON.stringify(item)
          }
        });
      } catch (error) {
        errors.push({
          index: idx,
          sheetName: item && item.sheetName ? item.sheetName : '',
          rowNumber: item && item.rowNumber ? item.rowNumber : '',
          fieldName: item && item.fieldName ? item.fieldName : '',
          message: error && error.message ? error.message : String(error)
        });
      }
    });

    const auditEntries = [];

    Object.keys(groupedBySheetAndColumn).forEach(groupKey => {
      const group = groupedBySheetAndColumn[groupKey];
      const sheet = sheetCache[group.sheetName];
      const colNumber = group.colIndex + 1;
      const rows = group.rows;
      if (!rows.length) return;

      rows.sort((a, b) => a.rowNumber - b.rowNumber);

      let segmentStart = rows[0].rowNumber;
      let segmentValues = [[rows[0].value]];
      let previousRow = rows[0].rowNumber;

      const flushSegment = () => {
        sheet.getRange(segmentStart, colNumber, segmentValues.length, 1).setValues(segmentValues);
      };

      for (let i = 1; i < rows.length; i += 1) {
        const current = rows[i];
        if (current.rowNumber === previousRow + 1) {
          segmentValues.push([current.value]);
          previousRow = current.rowNumber;
          continue;
        }

        flushSegment();
        segmentStart = current.rowNumber;
        segmentValues = [[current.value]];
        previousRow = current.rowNumber;
      }
      flushSegment();

      rows.forEach(entry => {
        auditEntries.push({
          acao: 'CORRECAO_DADO_ADMIN',
          entidade: entry.audit.sheetName,
          id: entry.audit.rowNumber,
          detalhes: entry.audit.payload,
          origem: 'N/A'
        });
        success += 1;
      });
    });

    if (auditEntries.length) this.audit.logMany(auditEntries);
    if (success > 0) this.repo.clearCache();
    return { ok: errors.length === 0, total: updates.length, success, failed: errors.length, errors };
  }


  findHeaderIndex_(headers, requestedField) {
    const rawField = String(requestedField || '').trim();
    if (!rawField) return -1;
    const exact = headers.indexOf(rawField);
    if (exact !== -1) return exact;

    const target = this.normalizeHeaderKey_(rawField);
    for (let i = 0; i < headers.length; i += 1) {
      if (this.normalizeHeaderKey_(headers[i]) === target) return i;
    }
    return -1;
  }

  normalizeHeaderKey_(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();
  }

  reviewLancamentos_() {
    const rows = this.repo.getObjects(SIGEP.sheets.lancamentos);
    return rows.flatMap(row => {
      const findings = [];
      const comp = String(row.COMPETENCIA || row.COMPETÊNCIA || '').trim();
      const normalized = this.normalizeCompetencia_(comp);
      if (!comp) {
        findings.push(this.buildFinding_(SIGEP.sheets.lancamentos, row, 'COMPETENCIA', 'Campo de competência vazio.', 'ALTO', 'Preencher no formato MM/AAAA.'));
      } else if (!normalized.valid) {
        findings.push(this.buildFinding_(SIGEP.sheets.lancamentos, row, 'COMPETENCIA', 'Competência inválida: ' + comp, 'ALTO', 'Use MM/AAAA, MM/AA ou mês abreviado (ex.: abr./25).'));
      } else if (normalized.value !== comp) {
        findings.push(this.buildFinding_(SIGEP.sheets.lancamentos, row, 'COMPETENCIA', 'Competência fora do padrão: ' + comp, 'MEDIO', 'Padronizar para ' + normalized.value + '.', normalized.value));
      }
      const ano = normalized.year;
      if (comp && normalized.valid && (ano < 2000 || ano > 2100)) {
        findings.push(this.buildFinding_(SIGEP.sheets.lancamentos, row, 'COMPETENCIA', 'Ano de competência fora da faixa esperada: ' + comp, 'ALTO', 'Ajustar para ano válido (2000-2100).'));
      }
      if (!String(row.ID_INDICADOR || '').trim()) {
        findings.push(this.buildFinding_(SIGEP.sheets.lancamentos, row, 'ID_INDICADOR', 'Lançamento sem ID_INDICADOR.', 'ALTO', 'Vincular lançamento a um indicador válido.'));
      }
      return findings;
    });
  }

  reviewUnidades_() {
    const rows = this.repo.getObjects(SIGEP.sheets.unidades);
    const seen = {};
    rows.forEach(row => {
      const key = String(row.UNIDADE || row.NOME_SETOR || '').trim().toUpperCase();
      if (!key) return;
      seen[key] = seen[key] || [];
      seen[key].push(row);
    });
    const findings = [];
    Object.keys(seen).forEach(key => {
      if (seen[key].length > 1) {
        seen[key].forEach(row => findings.push(this.buildFinding_(SIGEP.sheets.unidades, row, 'UNIDADE', 'Nome de setor/unidade duplicado: ' + key, 'MEDIO', 'Revisar duplicidade e manter apenas cadastro válido.')));
      }
    });
    return findings;
  }

  normalizeCompetencia_(raw) {
    const s = String(raw || '').trim();
    if (!s) return { valid: false, value: '', month: null, year: null };

    const compact = s.replace(/\s+/g, '');
    const monthMap = {
      jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
      jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12
    };

    let month = null;
    let year = null;

    const numeric = compact.match(/^(\d{1,2})[\/-](\d{2}|\d{4})$/);
    if (numeric) {
      month = Number(numeric[1]);
      year = Number(numeric[2]);
    } else {
      const textual = compact.toLowerCase().match(/^([a-zç]{3})\.?[\/-]?(\d{2}|\d{4})$/i);
      if (textual && monthMap[textual[1]]) {
        month = monthMap[textual[1]];
        year = Number(textual[2]);
      }
    }

    if (!month || !year || month < 1 || month > 12) {
      return { valid: false, value: compact, month: month || null, year: year || null };
    }

    if (year < 100) {
      year += year >= 70 ? 1900 : 2000;
    }

    if (year < 2000 || year > 2100) {
      return { valid: false, value: compact, month, year };
    }

    return { valid: true, value: String(month).padStart(2, '0') + '/' + String(year), month, year };
  }

  buildFinding_(sheetName, row, fieldName, issue, severity, recommendation, suggestedValue) {
    return {
      id: [sheetName, row._rowNumber, fieldName].join('#'),
      sheetName,
      rowNumber: row._rowNumber,
      fieldName,
      issue,
      severity,
      recommendation,
      currentValue: row[fieldName] || row[fieldName.toUpperCase()] || '',
      suggestedValue: suggestedValue === undefined ? '' : suggestedValue
    };
  }

  salvarUsuario(payload) {
    if (!payload || !payload.EMAIL) throw new Error('EMAIL obrigatório.');
    const patch = {
      EMAIL: String(payload.EMAIL || '').trim().toLowerCase(),
      NOME: payload.NOME || '',
      PERFIL: payload.PERFIL || 'LEITOR',
      UNIDADE: payload.UNIDADE || '',
      ATIVO: payload.ATIVO || 'SIM'
    };
    const users = this.repo.getObjects(SIGEP.sheets.usuarios);
    const exists = users.find(u => String(u.EMAIL).toLowerCase() === patch.EMAIL);
    let data;
    if (exists) {
      data = this.repo.updateById(SIGEP.sheets.usuarios, 'EMAIL', patch.EMAIL, patch);
      this.audit.log('ATUALIZAR_USUARIO', 'USUARIOS', patch.EMAIL, JSON.stringify(patch));
    } else {
      const headers = this.repo.getHeaders(SIGEP.sheets.usuarios);
      const row = headers.map(h => patch[h] || '');
      this.repo.appendRows(SIGEP.sheets.usuarios, [row]);
      data = patch;
      this.audit.log('CRIAR_USUARIO', 'USUARIOS', patch.EMAIL, JSON.stringify(patch));
    }
    return { ok: true, data };
  }

  excluirUsuario(email) {
    if (!email) throw new Error('Email obrigatório para exclusão.');
    this.repo.deleteById(SIGEP.sheets.usuarios, 'EMAIL', String(email).toLowerCase());
    this.audit.log('EXCLUIR_USUARIO', 'USUARIOS', email, 'Exclusão de usuário');
    return { ok: true };
  }

  alterarSenhaUsuario(payload) {
    if (!payload || !payload.EMAIL || !payload.NOVA_SENHA) throw new Error('EMAIL e NOVA_SENHA são obrigatórios.');
    const updated = this.repo.updateById(SIGEP.sheets.usuarios, 'EMAIL', String(payload.EMAIL).toLowerCase(), { SENHA_TEMPORARIA: payload.NOVA_SENHA });
    this.audit.log('ALTERAR_SENHA_USUARIO', 'USUARIOS', payload.EMAIL, 'Senha alterada');
    return { ok: true, data: updated };
  }

  salvarSetor(payload) {
    return this.salvarConfiguracao({ sheetName: SIGEP.sheets.unidades, data: payload, idColumn: payload.idColumn || 'ID_UNIDADE' });
  }

  excluirSetor(setorId) {
    if (!setorId) throw new Error('ID do setor é obrigatório.');
    this.repo.deleteById(SIGEP.sheets.unidades, 'ID_UNIDADE', setorId);
    this.audit.log('EXCLUIR_SETOR', SIGEP.sheets.unidades, setorId, 'Exclusão de setor');
    return { ok: true };
  }

  salvarConfiguracao(payload) {
    if (!payload || !payload.sheetName || !payload.data) throw new Error('Payload inválido para configuração.');
    const allowedSheets = ['CONFIG_STATUS', 'CONFIG_TIPOS_PROCESSO', 'CONFIG_FEATURE_FLAGS', 'BASE_UNIDADES'];
    if (!allowedSheets.includes(payload.sheetName)) throw new Error('Aba não permitida para alteração.');

    const idColumn = payload.idColumn || Object.keys(payload.data)[0];
    const idValue = payload.data[idColumn];
    if (!idValue) throw new Error('Identificador é obrigatório.');

    const objects = this.repo.getObjects(payload.sheetName);
    const found = objects.find(x => String(x[idColumn]) === String(idValue));

    let registro;
    if (found) {
      registro = this.repo.updateById(payload.sheetName, idColumn, idValue, payload.data);
      this.audit.log('ATUALIZAR_CONFIG', payload.sheetName, idValue, JSON.stringify(payload.data));
    } else {
      const headers = this.repo.getHeaders(payload.sheetName);
      const row = headers.map(h => payload.data[h] || '');
      this.repo.append(payload.sheetName, row);
      registro = payload.data;
      this.audit.log('CRIAR_CONFIG', payload.sheetName, idValue, JSON.stringify(payload.data));
    }

    return { ok: true, data: registro };
  }
}

class AuthorizationService {
  constructor(repo) {
    this.repo = repo;
  }

  getCurrentUser() {
    const email = this.resolveAuthenticatedEmail_();
    const user = this.repo.getObjects(SIGEP.sheets.usuarios).find(u => String(u.EMAIL || '').trim().toLowerCase() === email);
    if (!user) throw new Error('Usuário sem cadastro na aba USUARIOS.');
    return {
      email,
      nome: user.NOME || '',
      perfil: this.normalizeRole_(user.PERFIL),
      ativo: String(user.ATIVO || 'SIM').toUpperCase() !== 'NAO',
      unidade: String(user.UNIDADE || '').trim(),
      setor: String(user.SETOR || user.NOME_SETOR || '').trim()
    };
  }


  resolveAuthenticatedEmail_() {
    const candidates = [
      Session.getActiveUser && Session.getActiveUser(),
      Session.getEffectiveUser && Session.getEffectiveUser()
    ];

    for (let i = 0; i < candidates.length; i++) {
      const user = candidates[i];
      if (!user || typeof user.getEmail !== 'function') continue;
      const email = String(user.getEmail() || '').trim().toLowerCase();
      if (email) return email;
    }

    throw new Error(
      'Não foi possível identificar o usuário autenticado. ' +
      'Verifique se o Web App está publicado para usuários autenticados e com execução em nome do usuário acessando.'
    );
  }

  assertAuthorized(modulo, acao) {
    const user = this.getCurrentUser();
    if (!user.ativo) throw new Error('Usuário inativo.');
    const acaoNorm = String(acao || 'LISTAR').toUpperCase();
    const moduloNorm = String(modulo || 'GERAL').toUpperCase();
    const rules = this.getRbacRules_();
    const allowedActions = (((rules[user.perfil] || {})[moduloNorm]) || rules[user.perfil] && rules[user.perfil].GERAL || []);
    if (!allowedActions.includes(acaoNorm)) {
      throw new Error('Acesso negado: perfil ' + user.perfil + ' sem permissão para ' + acaoNorm + ' em ' + moduloNorm + '.');
    }
    return user;
  }

  applyDataScope(rows, user) {
    const actor = user || this.getCurrentUser();
    const privileged = ['ADMIN', 'ADMINISTRADOR', 'GESTOR'];
    if (privileged.includes(actor.perfil)) return rows;
    const unidade = String(actor.unidade || '').trim().toUpperCase();
    const setor = String(actor.setor || '').trim().toUpperCase();
    if (!unidade && !setor) return rows;
    return (rows || []).filter(r => {
      const rowUnidade = String(r.UNIDADE || r.NOME_SETOR || r.SETOR || '').trim().toUpperCase();
      if (!rowUnidade) return true;
      return rowUnidade === unidade || rowUnidade === setor;
    });
  }

  getRbacRules_() {
    const full = ['LISTAR', 'CRIAR', 'EDITAR', 'EXCLUIR', 'EXPORTAR', 'ADMIN'];
    const editor = ['LISTAR', 'CRIAR', 'EDITAR', 'EXPORTAR'];
    return {
      ADMIN: { GERAL: full, ADMIN: full, MAPEAMENTO: full, GESTORES: full },
      ADMINISTRADOR: { GERAL: full, ADMIN: full, MAPEAMENTO: full, GESTORES: full },
      GESTOR: { GERAL: editor, ADMIN: ['LISTAR'], PROCESSOS: editor, ACOMPANHAMENTO: editor, INDICADORES: editor, MAPEAMENTO: editor, GESTORES: ['LISTAR'] },
      EDITOR: { GERAL: ['LISTAR', 'EDITAR'], PROCESSOS: ['LISTAR', 'EDITAR'], ACOMPANHAMENTO: ['LISTAR', 'EDITAR'], INDICADORES: ['LISTAR', 'EDITAR'], MAPEAMENTO: ['LISTAR', 'EDITAR'], GESTORES: ['LISTAR'], ADMIN: [] },
      LEITOR: { GERAL: ['LISTAR'], PROCESSOS: ['LISTAR'], ACOMPANHAMENTO: ['LISTAR'], INDICADORES: ['LISTAR'], MAPEAMENTO: ['LISTAR'], GESTORES: ['LISTAR'], ADMIN: [] }
    };
  }

  normalizeRole_(role) {
    return String(role || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
  }
}

class AuditService {
  constructor(repo, auth) {
    this.repo = repo;
    this.auth = auth;
  }

  log(acao, entidade, id, detalhes) {
    this.logChange({ acao, entidade, id, detalhes, origem: 'N/A' });
  }

  logChange(payload) {
    try {
      const now = new Date();
      const user = this.auth.getCurrentUser();
      const contexto = {
        origem: payload.origem || 'N/A',
        motivo: payload.motivo || '',
        perfil: user.perfil,
        usuario: user.email,
        timestampIso: now.toISOString(),
        timestampLocal: this.repo.formatDatePtBr(now),
        antes: this.compact_(payload.before),
        depois: this.compact_(payload.after),
        alteracoes: payload.patch || null,
        detalhes: payload.detalhes || ''
      };
      this.repo.append(SIGEP.sheets.historico, [now, user.email, payload.acao, payload.entidade, payload.id, JSON.stringify(contexto)]);
    } catch (e) {
      console.warn('Falha ao registrar histórico:', e.message);
    }
  }

  logMany(payloads) {
    if (!Array.isArray(payloads) || !payloads.length) return;
    try {
      const now = new Date();
      const user = this.auth.getCurrentUser();
      const common = {
        perfil: user.perfil,
        usuario: user.email,
        timestampIso: now.toISOString(),
        timestampLocal: this.repo.formatDatePtBr(now)
      };
      const rows = payloads.map(payload => {
        const contexto = {
          origem: payload.origem || 'N/A',
          motivo: payload.motivo || '',
          perfil: common.perfil,
          usuario: common.usuario,
          timestampIso: common.timestampIso,
          timestampLocal: common.timestampLocal,
          antes: this.compact_(payload.before),
          depois: this.compact_(payload.after),
          alteracoes: payload.patch || null,
          detalhes: payload.detalhes || ''
        };
        return [now, user.email, payload.acao, payload.entidade, payload.id, JSON.stringify(contexto)];
      });
      this.repo.appendRows(SIGEP.sheets.historico, rows);
    } catch (e) {
      console.warn('Falha ao registrar histórico em lote:', e.message);
    }
  }

  // Retorna o histórico de alterações (comentários/motivos + diff) de um registro específico.
  getHistoryFor(payload) {
    const entidade = String(payload && payload.entidade || '').toUpperCase().trim();
    const id = String(payload && payload.id || '').trim();
    if (!id) return { ok: true, historico: [] };
    let sh;
    try {
      sh = this.repo.getSheet(SIGEP.sheets.historico);
    } catch (e) {
      return { ok: true, historico: [] };
    }
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { ok: true, historico: [] };
    const values = sh.getRange(2, 1, lastRow - 1, 6).getDisplayValues();
    const historico = [];
    values.forEach(r => {
      const rowEntidade = String(r[3] || '').toUpperCase().trim();
      const rowId = String(r[4] || '').trim();
      if (entidade && rowEntidade !== entidade) return;
      if (rowId !== id) return;
      let contexto = {};
      try { contexto = JSON.parse(r[5] || '{}'); } catch (parseErr) { contexto = {}; }
      historico.push({
        data: contexto.timestampLocal || r[0] || '',
        usuario: r[1] || contexto.usuario || '',
        acao: r[2] || '',
        motivo: contexto.motivo || '',
        alteracoes: contexto.alteracoes || null
      });
    });
    return { ok: true, historico: historico.reverse() };
  }

  // Histórico geral recente (para o painel de auditoria navegável da Administração).
  getRecent(payload) {
    const limit = Math.min(500, Math.max(1, Number(payload && payload.limit || 200)));
    let sh;
    try {
      sh = this.repo.getSheet(SIGEP.sheets.historico);
    } catch (e) {
      return { ok: true, eventos: [] };
    }
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return { ok: true, eventos: [] };
    const startRow = Math.max(2, lastRow - limit + 1);
    const count = lastRow - startRow + 1;
    const values = sh.getRange(startRow, 1, count, 6).getDisplayValues();
    const eventos = values.map(r => {
      let contexto = {};
      try { contexto = JSON.parse(r[5] || '{}'); } catch (parseErr) { contexto = {}; }
      return {
        data: contexto.timestampLocal || r[0] || '',
        usuario: r[1] || contexto.usuario || '',
        perfil: contexto.perfil || '',
        acao: r[2] || '',
        entidade: r[3] || '',
        id: r[4] || '',
        motivo: contexto.motivo || '',
        origem: contexto.origem || ''
      };
    });
    return { ok: true, eventos: eventos.reverse() };
  }

  compact_(obj) {
    if (!obj || typeof obj !== 'object') return null;
    const out = {};
    Object.keys(obj).forEach(key => {
      if (key === '_rowNumber') return;
      const value = obj[key];
      if (value !== '' && value !== null && value !== undefined) out[key] = value;
    });
    return out;
  }
}

class PayloadValidator {
  static validateProcessoUpdate(payload) {
    const allowed = ['PROCESSO', 'TIPO_PROCESSO', 'STATUS_GERAL', 'MODELAGEM_REALIZADA', 'VALIDACAO_NUGESP', 'VALIDACAO_DIRECAO', 'PUBLICACAO'];
    const aliases = ['NOME_PROCESSO', 'TIPO', 'STATUS'];
    this.validateAllowedKeys_(payload, ['ID_PROCESSO', 'MOTIVO_ALTERACAO'].concat(allowed, aliases), 'processo');
    this.validateRequiredChangeReason_(payload, allowed, 'processo');
  }

  static validateAcompanhamentoUpdate(payload) {
    const allowed = ['DATA_AGENDAMENTO', 'STATUS_AGENDAMENTO', 'INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES', 'LINK_PLANILHA_GESTAO'];
    this.validateAllowedKeys_(payload, ['ID_ACOMPANHAMENTO', 'MOTIVO_ALTERACAO'].concat(allowed), 'acompanhamento');
    this.validateRequiredChangeReason_(payload, allowed, 'acompanhamento');
  }

  static validateIndicadorUpdate(payload) {
    const allowed = ['NOME_INDICADOR', 'TIPO_INDICADOR', 'META', 'META_OPERADOR', 'RESULTADO_ESPERADO',
      'POLARIDADE_META', 'PERIODICIDADE', 'CATEGORIA_INDICADOR', 'TIPO_OPERACIONAL',
      'EIXO_ASSISTENCIAL', 'ANALISTA_RESPONSAVEL', 'GESTOR_RESPONSAVEL', 'LINK_FICHA_TECNICA_CONECTA'];
    const aliases = ['META OPERADOR', 'OPERADOR_META'];
    this.validateAllowedKeys_(payload, ['ID_INDICADOR', 'MOTIVO_ALTERACAO'].concat(allowed, aliases), 'indicador');
    this.validateRequiredChangeReason_(payload, allowed.concat(aliases), 'indicador');
  }

  static validateLancamentoIndicadorUpdate(payload) {
    const allowed = ['COMPETENCIA', 'VALOR', 'STATUS', 'OBSERVACAO'];
    this.validateAllowedKeys_(payload, ['ID_INDICADOR', 'MOTIVO_ALTERACAO'].concat(allowed), 'lançamento de indicador');
    if (!String(payload.COMPETENCIA || '').trim()) {
      throw new Error('COMPETENCIA é obrigatória para atualizar lançamento.');
    }
    this.validateRequiredChangeReason_(payload, ['VALOR', 'STATUS', 'OBSERVACAO'], 'lançamento de indicador');
  }

  static validateAllowedKeys_(payload, allowed, context) {
    const invalidKeys = Object.keys(payload || {}).filter(k => !allowed.includes(k));
    if (invalidKeys.length) throw new Error('Campos não permitidos para ' + context + ': ' + invalidKeys.join(', '));
  }

  static validateRequiredChangeReason_(payload, editableFields, context) {
    const hasPatch = editableFields.some(k => payload[k] !== undefined);
    if (!hasPatch) return;
    if (!String(payload.MOTIVO_ALTERACAO || '').trim()) {
      throw new Error('MOTIVO_ALTERACAO é obrigatório para atualização de ' + context + '.');
    }
  }
}
