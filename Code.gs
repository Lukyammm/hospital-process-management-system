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
    dashboardBase: 'DASHBOARD_BASE'
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

function withWritePermission_(screenName, callback) {
  const app = new SigepApplication();
  app.auth.assertCanWrite(screenName || 'GERAL');
  return callback(app);
}

function withAdminPermission_(screenName, callback) {
  const app = new SigepApplication();
  app.auth.assertIsAdmin(screenName || 'ADMIN');
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
    const processos = featureFlags.PROCESSOS ? this.processos.list() : [];
    const acompanhamento = featureFlags.ACOMPANHAMENTO ? this.acompanhamento.list() : [];
    const indicadores = featureFlags.INDICADORES ? this.indicadores.list() : [];
    const lancamentos = featureFlags.INDICADORES ? this.indicadores.listLancamentos() : [];
    const unidades = this.repo.getObjects(SIGEP.sheets.unidades);
    const result = {
      ok: true,
      generatedAt: new Date().toISOString(),
      generatedAtLocal: this.repo.formatDatePtBr(new Date()),
      user: Session.getActiveUser().getEmail() || '',
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
    return this.repo.paginate(this.processos.list(), payload);
  }

  getAcompanhamentoPage(payload) {
    if (!this.repo.getFeatureFlag('ACOMPANHAMENTO')) return { ok: true, data: [], page: 1, pageSize: 50, total: 0, totalPages: 1 };
    return this.repo.paginate(this.acompanhamento.list(), payload);
  }

  getIndicadoresPage(payload) {
    if (!this.repo.getFeatureFlag('INDICADORES')) return { ok: true, data: [], page: 1, pageSize: 50, total: 0, totalPages: 1 };
    return this.repo.paginate(this.indicadores.list(), payload);
  }

  runBasesHealthCheck() {
    const checker = new BaseHealthService(this.repo, this.audit);
    return checker.run();
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
    if (!payload || !payload.ID_PROCESSO) throw new Error('ID_PROCESSO obrigatório.');
    PayloadValidator.validateProcessoUpdate(payload);
    const allowed = ['MODELAGEM_REALIZADA', 'VALIDACAO_NUGESP', 'VALIDACAO_DIRECAO', 'PUBLICACAO'];
    const patch = {};
    allowed.forEach(k => {
      if (payload[k] !== undefined) patch[k] = payload[k];
    });
    const current = this.repo.getById(SIGEP.sheets.processos, 'ID_PROCESSO', payload.ID_PROCESSO);
    patch.STATUS_GERAL = this.calcularStatus_({ ...current, ...patch });
    const updated = this.repo.updateById(SIGEP.sheets.processos, 'ID_PROCESSO', payload.ID_PROCESSO, patch);
    this.audit.logChange({ acao: 'ATUALIZAR_PROCESSO', entidade: 'PROCESSO', id: payload.ID_PROCESSO, before: current, after: updated, patch, origem: 'PROCESSOS', motivo: payload.MOTIVO_ALTERACAO || '' });
    return { ok: true, data: updated };
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
    ['NOME_INDICADOR', 'TIPO_INDICADOR', 'META', 'RESULTADO_ESPERADO'].forEach(k => {
      if (payload[k] !== undefined) patch[k] = payload[k];
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
      featureFlags: this.repo.getObjects('CONFIG_FEATURE_FLAGS'),
      unidades,
      setores: unidades.map(x => ({
        ID_SETOR: x.ID_SETOR || x.ID_UNIDADE || x.UNIDADE,
        NOME_SETOR: x.NOME_SETOR || x.UNIDADE || '',
        SIGLA: x.SIGLA || ''
      }))
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
    const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
    if (!email) throw new Error('Não foi possível identificar o usuário autenticado.');
    const user = this.repo.getObjects(SIGEP.sheets.usuarios).find(u => String(u.EMAIL || '').trim().toLowerCase() === email);
    if (!user) throw new Error('Usuário sem cadastro na aba USUARIOS.');
    return {
      email,
      nome: user.NOME || '',
      perfil: this.normalizeRole_(user.PERFIL),
      ativo: String(user.ATIVO || 'SIM').toUpperCase() !== 'NAO'
    };
  }

  assertCanWrite(origem) {
    const user = this.getCurrentUser();
    if (!user.ativo) throw new Error('Usuário inativo para alteração.');
    const allowed = ['ADMIN', 'ADMINISTRADOR', 'GESTOR', 'EDITOR'];
    if (!allowed.includes(user.perfil)) throw new Error('Sem permissão de escrita para ' + origem + '.');
    return user;
  }

  assertIsAdmin(origem) {
    const user = this.getCurrentUser();
    if (!user.ativo) throw new Error('Usuário inativo para alteração.');
    if (!['ADMIN', 'ADMINISTRADOR'].includes(user.perfil)) throw new Error('Acesso restrito ao perfil ADMIN em ' + origem + '.');
    return user;
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
    const allowed = ['MODELAGEM_REALIZADA', 'VALIDACAO_NUGESP', 'VALIDACAO_DIRECAO', 'PUBLICACAO'];
    this.validateAllowedKeys_(payload, ['ID_PROCESSO', 'MOTIVO_ALTERACAO'].concat(allowed), 'processo');
  }

  static validateAcompanhamentoUpdate(payload) {
    const allowed = ['DATA_AGENDAMENTO', 'STATUS_AGENDAMENTO', 'INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES'];
    this.validateAllowedKeys_(payload, ['ID_ACOMPANHAMENTO', 'MOTIVO_ALTERACAO'].concat(allowed), 'acompanhamento');
  }

  static validateIndicadorUpdate(payload) {
    const allowed = ['NOME_INDICADOR', 'TIPO_INDICADOR', 'META', 'RESULTADO_ESPERADO'];
    this.validateAllowedKeys_(payload, ['ID_INDICADOR', 'MOTIVO_ALTERACAO'].concat(allowed), 'indicador');
  }

  static validateAllowedKeys_(payload, allowed, context) {
    const invalidKeys = Object.keys(payload || {}).filter(k => !allowed.includes(k));
    if (invalidKeys.length) throw new Error('Campos não permitidos para ' + context + ': ' + invalidKeys.join(', '));
  }
}
