/**
 * SIGEP-HUC | Backend WebApp
 * Usa as bases criadas pelo Migrador_SIGEP_HUC.gs.
 */

const SIGEP = {
  sheets: {
    processos: 'BASE_PROCESSOS',
    acompanhamento: 'BASE_ACOMPANHAMENTO',
    indicadores: 'BASE_INDICADORES',
    lancamentos: 'BASE_LANCAMENTOS_INDICADORES',
    unidades: 'BASE_UNIDADES',
    usuarios: 'USUARIOS',
    historico: 'HISTORICO'
  }
};

function doGet() {
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle('SIGEP-HUC')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSigepData() {
  const app = new SigepApplication();
  return app.getInitialData();
}

function atualizarStatusAcompanhamento(payload) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.acompanhamento.updateStatus(payload);
  });
}

function atualizarProcesso(payload) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.processos.update(payload);
  });
}

function atualizarIndicador(payload) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.indicadores.update(payload);
  });
}


function getAdminData() {
  const app = new SigepApplication();
  return app.admin.getAdminData();
}

function salvarConfiguracao(payload) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.admin.salvarConfiguracao(payload);
  });
}

function salvarUsuario(payload) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.admin.salvarUsuario(payload);
  });
}

function excluirUsuario(email) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.admin.excluirUsuario(email);
  });
}

function alterarSenhaUsuario(payload) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.admin.alterarSenhaUsuario(payload);
  });
}

function salvarSetor(payload) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.admin.salvarSetor(payload);
  });
}

function excluirSetor(setorId) {
  return runWithWriteLock_(() => {
    const app = new SigepApplication();
    return app.admin.excluirSetor(setorId);
  });
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
    this.audit = new AuditService(this.repo);
    this.processos = new ProcessoService(this.repo, this.audit);
    this.acompanhamento = new AcompanhamentoService(this.repo, this.audit);
    this.indicadores = new IndicadorService(this.repo, this.audit);
    this.dashboard = new DashboardService();
    this.admin = new AdminService(this.repo, this.audit);
  }

  getInitialData() {
    const processos = this.processos.list();
    const acompanhamento = this.acompanhamento.list();
    const indicadores = this.indicadores.list();
    const lancamentos = this.indicadores.listLancamentos();
    const unidades = this.repo.getObjects(SIGEP.sheets.unidades);
    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      user: Session.getActiveUser().getEmail() || '',
      dashboard: this.dashboard.build(processos, acompanhamento, indicadores, lancamentos),
      processos,
      acompanhamento,
      indicadores,
      lancamentos,
      unidades
    };
  }
}

class SheetRepository {
  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
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
    return this.repo.getObjects(SIGEP.sheets.processos);
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
    this.audit.log('ATUALIZAR_PROCESSO', 'PROCESSO', payload.ID_PROCESSO, JSON.stringify(patch));
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
    return this.repo.getObjects(SIGEP.sheets.acompanhamento);
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
    this.audit.log('ATUALIZAR_ACOMPANHAMENTO', 'ACOMPANHAMENTO', payload.ID_ACOMPANHAMENTO, JSON.stringify(patch));
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
    return this.repo.getObjects(SIGEP.sheets.indicadores);
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
    const updated = this.repo.updateById(SIGEP.sheets.indicadores, 'ID_INDICADOR', payload.ID_INDICADOR, patch);
    this.audit.log('ATUALIZAR_INDICADOR', 'INDICADOR', payload.ID_INDICADOR, JSON.stringify(patch));
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
      this.repo.append(SIGEP.sheets.usuarios, row);
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
    const allowedSheets = ['CONFIG_STATUS', 'CONFIG_TIPOS_PROCESSO', 'BASE_UNIDADES'];
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

class AuditService {
  constructor(repo) {
    this.repo = repo;
  }

  log(acao, entidade, id, detalhes) {
    try {
      this.repo.append(SIGEP.sheets.historico, [new Date(), Session.getActiveUser().getEmail() || '', acao, entidade, id, detalhes]);
    } catch (e) {
      console.warn('Falha ao registrar histórico:', e.message);
    }
  }
}

class PayloadValidator {
  static validateProcessoUpdate(payload) {
    const allowed = ['MODELAGEM_REALIZADA', 'VALIDACAO_NUGESP', 'VALIDACAO_DIRECAO', 'PUBLICACAO'];
    this.validateAllowedKeys_(payload, ['ID_PROCESSO'].concat(allowed), 'processo');
  }

  static validateAcompanhamentoUpdate(payload) {
    const allowed = ['DATA_AGENDAMENTO', 'STATUS_AGENDAMENTO', 'INTRODUCAO', 'PERFIL', 'FLUXO_PROCESSO', 'MODELAGEM', 'INDICADORES', 'FICHA_TECNICA_INDICADORES'];
    this.validateAllowedKeys_(payload, ['ID_ACOMPANHAMENTO'].concat(allowed), 'acompanhamento');
  }

  static validateIndicadorUpdate(payload) {
    const allowed = ['NOME_INDICADOR', 'TIPO_INDICADOR', 'META', 'RESULTADO_ESPERADO'];
    this.validateAllowedKeys_(payload, ['ID_INDICADOR'].concat(allowed), 'indicador');
  }

  static validateAllowedKeys_(payload, allowed, context) {
    const invalidKeys = Object.keys(payload || {}).filter(k => !allowed.includes(k));
    if (invalidKeys.length) throw new Error('Campos não permitidos para ' + context + ': ' + invalidKeys.join(', '));
  }
}
