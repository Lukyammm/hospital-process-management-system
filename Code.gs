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
      BASE_INDICADORES: ['META_OPERADOR']
    }
  },
  featureFlags: {
    PROCESSOS: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_PROCESSOS', defaultValue: true },
    INDICADORES: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_INDICADORES', defaultValue: true },
    ACOMPANHAMENTO: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'MODULO_ACOMPANHAMENTO', defaultValue: true },
    FILTROS_AVANCADOS: { sheet: 'CONFIG_FEATURE_FLAGS', key: 'FILTROS_AVANCADOS', defaultValue: true }
  },
  sheets: {
    processos: 'BASE_PROCESSOS',
    acompanhamento: 'BASE_ACOMPANHAMENTO',
    indicadores: 'BASE_INDICADORES',
    lancamentos: 'BASE_LANCAMENTOS_INDICADORES',
    unidades: 'BASE_UNIDADES',
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
    .createTemplateFromFile('Index')
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

function atualizarProcesso(payload) {
  return runWithWriteLock_(() => withWritePermission_('PROCESSOS', app => app.processos.update(payload)));
}

function atualizarIndicador(payload) {
  return runWithWriteLock_(() => withWritePermission_('INDICADORES', app => app.indicadores.update(payload)));
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
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Sistema ocupado no momento. Tente novamente em alguns segundos.');
  }
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
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
    this.dashboard = new DashboardService();
    this.admin = new AdminService(this.repo, this.audit);
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
    const unidades = this.repo.getObjects(SIGEP.sheets.unidades);
    const result = {
      ok: true,
      generatedAt: new Date().toISOString(),
      generatedAtLocal: this.repo.formatDatePtBr(new Date()),
      user: user.email || '',
      dashboard: this.dashboard.build(processos, acompanhamento, indicadores, lancamentos),
      processos,
      acompanhamento,
      indicadores,
      lancamentos,
      unidades,
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
    return {
      ...raw,
      ID_INDICADOR: this.asText(raw.ID_INDICADOR),
      NOME_INDICADOR: this.asText(raw.NOME_INDICADOR),
      TIPO_INDICADOR: this.asText(raw.TIPO_INDICADOR),
      META: this.asText(raw.META),
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
    const sh = this.getSheet(sheetName);
    const values = sh.getDataRange().getDisplayValues();
    if (values.length < 2) return [];
    const headers = values[0].map(h => String(h).trim());
    return values.slice(1)
      .filter(row => row.some(cell => String(cell).trim() !== ''))
      .map((row, index) => {
        const obj = { _rowNumber: index + 2 };
        headers.forEach((h, i) => obj[h] = row[i] || '');
        return obj;
      });
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

  updateById(sheetName, idColumn, id, patch) {
    const sh = this.getSheet(sheetName);
    const values = sh.getDataRange().getValues();
    const headers = values[0];
    const idIndex = headers.indexOf(idColumn);
    if (idIndex === -1) throw new Error('Coluna ID não encontrada: ' + idColumn);
    const rowIndex = values.findIndex((row, i) => i > 0 && String(row[idIndex]) === String(id));
    if (rowIndex === -1) throw new Error('Registro não encontrado: ' + id);

    const updatedRow = values[rowIndex].slice();
    Object.keys(patch).forEach(key => {
      const col = headers.indexOf(key);
      if (col !== -1) updatedRow[col] = patch[key];
    });
    sh.getRange(rowIndex + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
    return this.getObjects(sheetName).find(obj => String(obj[idColumn]) === String(id));
  }

  getById(sheetName, idColumn, id) {
    const rows = this.getObjects(sheetName);
    const found = rows.find(obj => String(obj[idColumn]) === String(id));
    if (!found) throw new Error('Registro não encontrado: ' + id);
    return found;
  }

  append(sheetName, row) {
    this.getSheet(sheetName).appendRow(row);
  }

  getHeaders(sheetName) {
    return this.getSheet(sheetName).getDataRange().getValues()[0] || [];
  }

  ensureSchemaColumns() {
    const requiredBySheet = SIGEP.schema.required || {};
    Object.keys(requiredBySheet).forEach(sheetName => this.ensureColumnsForSheet_(sheetName, requiredBySheet[sheetName] || []));
    const autoCreateBySheet = SIGEP.schema.autoCreate || {};
    Object.keys(autoCreateBySheet).forEach(sheetName => this.ensureColumnsForSheet_(sheetName, autoCreateBySheet[sheetName] || []));
  }

  ensureColumnsForSheet_(sheetName, columns) {
    if (!columns || !columns.length) return;
    const sh = this.getSheet(sheetName);
    const headers = this.getHeaders(sheetName).map(h => String(h || '').trim());
    const missing = columns.filter(col => col && !headers.includes(col));
    if (!missing.length) return;
    missing.forEach(col => {
      sh.insertColumnAfter(sh.getLastColumn());
      sh.getRange(1, sh.getLastColumn()).setValue(col);
    });
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
    Object.keys(SIGEP.featureFlags || {}).forEach(name => {
      flags[name] = this.getFeatureFlag(name);
    });
    return flags;
  }

  getFeatureFlag(name) {
    const cfg = (SIGEP.featureFlags || {})[name];
    if (!cfg) return false;
    try {
      const rows = this.getObjects(cfg.sheet);
      const hit = rows.find(r => String(r.CHAVE || '').trim().toUpperCase() === String(cfg.key || '').trim().toUpperCase());
      if (!hit) return !!cfg.defaultValue;
      const value = String(hit.VALOR || '').trim().toUpperCase();
      return ['1', 'TRUE', 'SIM', 'ATIVO', 'ON'].includes(value);
    } catch (err) {
      return !!cfg.defaultValue;
    }
  }

  clearCache() {
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
  }

  deleteById(sheetName, idColumn, id) {
    const sh = this.getSheet(sheetName);
    const values = sh.getDataRange().getValues();
    const headers = values[0];
    const idIndex = headers.indexOf(idColumn);
    if (idIndex === -1) throw new Error('Coluna ID não encontrada: ' + idColumn);
    const rowIndex = values.findIndex((row, i) => i > 0 && String(row[idIndex]) === String(id));
    if (rowIndex === -1) throw new Error('Registro não encontrado: ' + id);
    sh.deleteRow(rowIndex + 1);
    return { ok: true };
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
    const updated = this.repo.updateById(SIGEP.sheets.processos, 'ID_PROCESSO', payload.ID_PROCESSO, patch);
    this.audit.logChange({ acao: 'ATUALIZAR_PROCESSO', entidade: 'PROCESSO', id: payload.ID_PROCESSO, before: current, after: updated, patch, origem: 'PROCESSOS', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
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
    return 'Pendente';
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

  updateStatus(payload) {
    if (!payload || !payload.ID_ACOMPANHAMENTO) throw new Error('ID_ACOMPANHAMENTO obrigatório.');
    PayloadValidator.validateAcompanhamentoUpdate(payload);
    const allowed = ['DATA_AGENDAMENTO', 'STATUS_AGENDAMENTO', 'INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES'];
    const patch = {};
    allowed.forEach(k => {
      if (payload[k] !== undefined) patch[k] = payload[k];
    });
    const current = this.repo.getById(SIGEP.sheets.acompanhamento, 'ID_ACOMPANHAMENTO', payload.ID_ACOMPANHAMENTO);
    const etapas = ['INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES'].map(k => (patch[k] !== undefined ? patch[k] : current[k]) || '');
    if (etapas.some(Boolean) || patch.STATUS_AGENDAMENTO !== undefined || patch.DATA_AGENDAMENTO !== undefined) {
      const concluidas = etapas.filter(v => this.isConcluida_(v)).length;
      const total = etapas.filter(Boolean).length || 6;
      patch.ETAPAS_CONCLUIDAS = concluidas;
      patch.ETAPAS_TOTAL = total;
      patch.PROGRESSO_PERCENTUAL = Math.round((concluidas / total) * 100);
      patch.STATUS_GERAL = concluidas === total ? 'Concluída' : concluidas === 0 ? 'Não iniciada' : 'Em andamento';
    }
    const updated = this.repo.updateById(SIGEP.sheets.acompanhamento, 'ID_ACOMPANHAMENTO', payload.ID_ACOMPANHAMENTO, patch);
    this.audit.logChange({ acao: 'ATUALIZAR_ACOMPANHAMENTO', entidade: 'ACOMPANHAMENTO', id: payload.ID_ACOMPANHAMENTO, before: current, after: updated, patch, origem: 'ACOMPANHAMENTO', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
  }

  isConcluida_(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().includes('CONCLUIDA');
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

  update(payload) {
    if (!payload || !payload.ID_INDICADOR) throw new Error('ID_INDICADOR obrigatório.');
    PayloadValidator.validateIndicadorUpdate(payload);
    const patch = {};
    const operadorAlias = payload['META OPERADOR'] !== undefined ? payload['META OPERADOR'] : payload.OPERADOR_META;
    const normalizedPayload = Object.assign({}, payload, {
      META_OPERADOR: payload.META_OPERADOR !== undefined ? payload.META_OPERADOR : operadorAlias
    });
    ['NOME_INDICADOR', 'TIPO_INDICADOR', 'META', 'META_OPERADOR', 'RESULTADO_ESPERADO'].forEach(k => {
      if (normalizedPayload[k] !== undefined) patch[k] = normalizedPayload[k];
    });
    const current = this.repo.getById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR);
    const updated = this.repo.updateById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR, patch);
    this.audit.logChange({ acao: 'ATUALIZAR_INDICADOR', entidade: 'INDICADOR', id: payload.ID_INDICADOR, before: current, after: updated, patch, origem: 'INDICADORES', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
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
    sh.appendRow([payload.generatedAtLocal, JSON.stringify(summary), 0, 'OK']);
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
    sh.getRange(1, headers.length + 1).setValue(columnName);
  }
}


class AdminService {
  constructor(repo, audit) {
    this.repo = repo;
    this.audit = audit;
  }

  getAdminData() {
    const usuarios = this.repo.getObjects(SIGEP.sheets.usuarios);
    const unidades = this.repo.getObjects(SIGEP.sheets.unidades);
    return {
      ok: true,
      usuarios,
      status: this.repo.getObjects('CONFIG_STATUS'),
      tiposProcesso: this.repo.getObjects('CONFIG_TIPOS_PROCESSO'),
      featureFlags: this.repo.getObjectsSafe('CONFIG_FEATURE_FLAGS', []),
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
    return {
      ADMIN: { GERAL: ['LISTAR', 'CRIAR', 'EDITAR', 'EXCLUIR', 'EXPORTAR', 'ADMIN'], ADMIN: ['LISTAR', 'CRIAR', 'EDITAR', 'EXCLUIR', 'EXPORTAR', 'ADMIN'] },
      ADMINISTRADOR: { GERAL: ['LISTAR', 'CRIAR', 'EDITAR', 'EXCLUIR', 'EXPORTAR', 'ADMIN'], ADMIN: ['LISTAR', 'CRIAR', 'EDITAR', 'EXCLUIR', 'EXPORTAR', 'ADMIN'] },
      GESTOR: { GERAL: ['LISTAR', 'CRIAR', 'EDITAR', 'EXPORTAR'], ADMIN: ['LISTAR'], PROCESSOS: ['LISTAR', 'CRIAR', 'EDITAR', 'EXPORTAR'], ACOMPANHAMENTO: ['LISTAR', 'CRIAR', 'EDITAR', 'EXPORTAR'], INDICADORES: ['LISTAR', 'CRIAR', 'EDITAR', 'EXPORTAR'] },
      EDITOR: { GERAL: ['LISTAR', 'EDITAR'], PROCESSOS: ['LISTAR', 'EDITAR'], ACOMPANHAMENTO: ['LISTAR', 'EDITAR'], INDICADORES: ['LISTAR', 'EDITAR'], ADMIN: [] },
      LEITOR: { GERAL: ['LISTAR'], PROCESSOS: ['LISTAR'], ACOMPANHAMENTO: ['LISTAR'], INDICADORES: ['LISTAR'], ADMIN: [] }
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
    const allowed = ['DATA_AGENDAMENTO', 'STATUS_AGENDAMENTO', 'INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES'];
    this.validateAllowedKeys_(payload, ['ID_ACOMPANHAMENTO', 'MOTIVO_ALTERACAO'].concat(allowed), 'acompanhamento');
    this.validateRequiredChangeReason_(payload, allowed, 'acompanhamento');
  }

  static validateIndicadorUpdate(payload) {
    const allowed = ['NOME_INDICADOR', 'TIPO_INDICADOR', 'META', 'META_OPERADOR', 'RESULTADO_ESPERADO'];
    const aliases = ['META OPERADOR', 'OPERADOR_META'];
    this.validateAllowedKeys_(payload, ['ID_INDICADOR', 'MOTIVO_ALTERACAO'].concat(allowed, aliases), 'indicador');
    this.validateRequiredChangeReason_(payload, allowed.concat(aliases), 'indicador');
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
