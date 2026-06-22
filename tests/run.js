'use strict';
/**
 * Suíte de testes do SIGEP-HUC — sem dependências externas.
 * - Backend (Code.gs): valida sintaxe (via vm) e regras de negócio puras.
 * - Frontend (index.html): smoke test com um DOM stub, cobrindo o caminho de
 *   sucesso (init + render) e o de falha (a navegação precisa sobreviver a um
 *   erro de carregamento — regressão "bugou tudo").
 * Uso: node tests/run.js   (sai com código != 0 se algo falhar)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let failures = 0;
let passed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log('  ✓ ' + msg); }
  else { failures++; console.error('  ✗ ' + msg); }
}
function section(name) { console.log('\n# ' + name); }

/* ------------------------------------------------------------------ */
/* Backend — Code.gs                                                    */
/* ------------------------------------------------------------------ */
section('Backend (Code.gs) — sintaxe e regras de negócio');
(function backendTests() {
  const code = fs.readFileSync(path.join(ROOT, 'Code.gs'), 'utf8');
  // Stubs mínimos do Apps Script (apenas o que é avaliado no carregamento).
  const sandbox = {
    console,
    HtmlService: { XFrameOptionsMode: { SAMEORIGIN: 'SAMEORIGIN' } },
    SpreadsheetApp: {}, CacheService: {}, LockService: {}, Utilities: {},
    Session: {}, PropertiesService: {}, ScriptApp: {}, MailApp: {}
  };
  let api;
  try {
    api = vm.runInNewContext(
      code + '\n;({AcompanhamentoService,ProcessoService,IndicadorService,DomainNormalizer,MapeamentoService,GovernanceService,SIGEP});',
      sandbox, { filename: 'Code.gs' }
    );
  } catch (e) {
    assert(false, 'Code.gs carrega sem erro: ' + e.message);
    return;
  }
  assert(!!(api && api.SIGEP && api.AcompanhamentoService), 'Code.gs expõe SIGEP e serviços');

  const acomp = new api.AcompanhamentoService(null, null);
  let p = acomp.computeProgressValues_(['Concluído', 'Concluído', 'Não se aplica']);
  assert(p.total === 2 && p.concluidas === 2 && p.percentual === 100 && p.statusGeral === 'Concluído',
    'Etapa "Não se aplica" sai do denominador (2/2 = 100%)');
  p = acomp.computeProgressValues_(['Não se aplica', 'Não se aplica']);
  assert(p.total === 0 && p.percentual === 0 && p.statusGeral === 'Não se aplica',
    'Tudo N/A => 0% e status "Não se aplica"');
  p = acomp.computeProgressValues_(['Concluído', 'Em andamento']);
  assert(p.percentual === 50 && p.statusGeral === 'Em andamento', '1 de 2 concluído => 50%');
  p = acomp.computeProgressValues_(['', '', '']);
  assert(p.percentual === 0 && p.statusGeral === 'Não iniciado', 'Tudo vazio => Não iniciado');

  const proc = new api.ProcessoService(null, null);
  assert(proc.calcularStatus_({ MODELAGEM_REALIZADA: 'SIM', VALIDACAO_NUGESP: 'SIM', VALIDACAO_DIRECAO: 'SIM', PUBLICACAO: 'SIM' }) === 'Concluído',
    'Processo com tudo SIM => Concluído');
  assert(proc.calcularStatus_({}) === 'Não iniciado', 'Processo vazio => Não iniciado (padronizado)');
  assert(proc.calcularStatus_({ MODELAGEM_REALIZADA: 'SIM' }) === 'Em andamento', 'Processo 1 SIM => Em andamento');

  let ind = api.DomainNormalizer.indicador({ META_OPERADOR: '2', META: '90' });
  assert(ind.META_OPERADOR === '>', 'Operador da meta por código "2" => ">"');
  ind = api.DomainNormalizer.indicador({ META: '>= 95' });
  assert(ind.META_OPERADOR === '>=', 'Extrai operador embutido em ">= 95"');
  ind = api.DomainNormalizer.indicador({ CATEGORIA_INDICADOR: 'Resultado' });
  assert(ind.CATEGORIA === 'Resultado', 'CATEGORIA espelha CATEGORIA_INDICADOR');

  const map = new api.MapeamentoService(null, null);
  assert(map.normalizeGrupo_('gerenciais') === 'Gerencial' &&
    map.normalizeGrupo_('FINALÍSTICOS') === 'Finalístico' &&
    map.normalizeGrupo_('apoio') === 'Apoio', 'normalizeGrupo_ mapeia os três grupos');

  // Avaliação de meta com polaridade
  const IS = api.IndicadorService;
  assert(IS.parseNum_('>= 92,5%') === 92.5 && IS.parseNum_('1.234,5') === 1234.5, 'parseNum_ entende pt-BR e operadores');
  assert(IS.metaAtingida_(80, 90, '>=', 'Menor é melhor') === true, 'Polaridade "Menor é melhor": 80 <= 90 atinge');
  assert(IS.metaAtingida_(95, 90, '>=', 'Menor é melhor') === false, 'Polaridade "Menor é melhor": 95 não atinge');
  assert(IS.metaAtingida_(95, 90, '<=', '') === false && IS.metaAtingida_(95, 90, '>=', '') === true, 'Sem polaridade usa o operador');

  const gov = new api.GovernanceService(null, null);
  assert(gov.compKey_('05/2026') === 2026 * 12 + 5 && gov.compKey_('abr./25') === 2025 * 12 + 4, 'compKey_ ordena competências (MM/AAAA e mmm/aa)');
  assert(gov.sameComp_('5/2026', '05/2026') === true, 'sameComp_ normaliza competências equivalentes');

  // Metas por período (vigência)
  const indBase = { META: '90', META_OPERADOR: '>=', POLARIDADE_META: '' };
  const metas = [
    { ID_INDICADOR: 'IND-1', VIGENCIA_INICIO: '01/2026', META: '95', META_OPERADOR: '>=', ATIVO: 'SIM' },
    { ID_INDICADOR: 'IND-1', VIGENCIA_INICIO: '06/2026', META: '80', META_OPERADOR: '>=', ATIVO: 'SIM' }
  ];
  assert(IS.resolveMeta_(indBase, '03/2026', metas).meta === '95', 'resolveMeta_: 03/2026 usa a vigência de 01/2026 (95)');
  assert(IS.resolveMeta_(indBase, '07/2026', metas).meta === '80', 'resolveMeta_: 07/2026 usa a vigência de 06/2026 (80)');
  assert(IS.resolveMeta_(indBase, '12/2025', metas).meta === '90' && IS.resolveMeta_(indBase, '12/2025', metas).origem === 'base', 'resolveMeta_: antes de qualquer vigência cai na meta base (90)');
  assert(IS.resolveMeta_(indBase, '03/2026', []).meta === '90', 'resolveMeta_: sem metas por período usa a base');

  // Conteúdo padrão do mapeamento deve cobrir os três blocos.
  const def = api.MapeamentoService.defaultContent();
  assert(def.Gerencial.length === 8 && def.Finalístico.length === 19 && def.Apoio.length === 20,
    'Conteúdo padrão do mapeamento: 8 / 19 / 20 processos');
})();

/* ------------------------------------------------------------------ */
/* Frontend — index.html                                               */
/* ------------------------------------------------------------------ */
section('Frontend (index.html) — smoke (sucesso e falha)');
(function frontendTests() {
  // Busca o arquivo HTML de forma insensível à caixa (o repo usa "Index.html").
  const htmlFile = fs.readdirSync(ROOT).find(f => /^index\.html$/i.test(f)) || 'Index.html';
  const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
  const start = html.lastIndexOf('<script>');
  const end = html.lastIndexOf('</script>');
  const code = html.slice(start + '<script>'.length, end);
  const realIds = new Set();
  const idRe = /\bid="([^"]+)"/g;
  let m;
  while ((m = idRe.exec(html))) realIds.add(m[1]);

  function makeEl(id) {
    return {
      _id: id, style: {}, dataset: {}, tabIndex: 0,
      classList: {
        _s: new Set(),
        add() { for (const c of arguments) this._s.add(c); },
        remove() { for (const c of arguments) this._s.delete(c); },
        toggle(c, f) { if (f === undefined) f = !this._s.has(c); f ? this._s.add(c) : this._s.delete(c); return f; },
        contains(c) { return this._s.has(c); }
      },
      _html: '', set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
      _text: '', set textContent(v) { this._text = v; }, get textContent() { return this._text; },
      value: '', checked: false, offsetParent: null,
      setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
      addEventListener() {}, removeEventListener() {}, appendChild(c) { return c; }, remove() {},
      querySelector() { return makeEl('q'); }, querySelectorAll() { return []; },
      scrollIntoView() {}, focus() {}, reportValidity() { return true; }
    };
  }

  const sampleData = {
    ok: true, user: 'lukyam@huc.gov.br', userNome: 'Lukyam', userPerfil: 'ADMIN',
    dashboard: { progressoMedio: 50, processosTotal: 2, processosConcluidos: 1, unidadesAcompanhadas: 1, acompanhamentoLinhas: 1, agendamentosRealizados: 1, reagendados: 0, indicadoresTotal: 1, lancamentosTotal: 1, lancamentosPreenchidos: 1 },
    processos: [{ ID_PROCESSO: 'PROC-0001', PROCESSO: 'Proc A', STATUS_GERAL: 'Em andamento', MODELAGEM_REALIZADA: 'SIM' }],
    acompanhamento: [{ ID_ACOMPANHAMENTO: 'ACOMP-0001', UNIDADE: 'UTI', DATA_AGENDAMENTO: '01/06/2026', STATUS_AGENDAMENTO: 'Realizada', INTRODUCAO: 'Concluído', PERFIL: 'Em andamento', FLUXO_PROCESSO: 'Não se aplica', MODELAGEM: '', INDICADORES: '', FICHA_TECNICA_INDICADORES: '', LINK_PLANILHA_GESTAO: '' }],
    indicadores: [{ ID_INDICADOR: 'IND-0001', NOME_INDICADOR: 'Taxa X', TIPO_INDICADOR: 'Resultado', META: '90', META_OPERADOR: '>=', CATEGORIA: 'Resultado', CATEGORIA_INDICADOR: 'Resultado', TIPO_OPERACIONAL: 'Finalista', EIXO_ASSISTENCIAL: 'Cirúrgico', ANALISTA_RESPONSAVEL: 'Lukyam', GESTOR_RESPONSAVEL: 'Maria', PERIODICIDADE: 'Mensal', POLARIDADE_META: 'Maior é melhor', LINK_FICHA_TECNICA_CONECTA: '', PROCESSO: 'Proc A', UNIDADE: 'UTI' }],
    lancamentos: [{ ID_INDICADOR: 'IND-0001', COMPETENCIA: '05/2026', VALOR: '92' }],
    metasIndicadores: [{ ID_META: 'META-0001', ID_INDICADOR: 'IND-0001', VIGENCIA_INICIO: '01/2026', META: '95', META_OPERADOR: '>=', POLARIDADE_META: 'Maior é melhor', ATIVO: 'SIM' }],
    unidades: [{ ID_UNIDADE: 'U1', UNIDADE: 'UTI' }],
    mapeamento: [{ ID_MAPEAMENTO: 'MAP-0001', NOME_PROCESSO: 'Gestão da Clínica', GRUPO_PROCESSO: 'Gerencial', STATUS: 'Em andamento', RESPONSAVEL: 'Ana', ATIVO: 'SIM' }],
    featureFlags: { PROCESSOS: true, INDICADORES: true, ACOMPANHAMENTO: true, MAPEAMENTO: true, GESTORES: true, FILTROS_AVANCADOS: true }
  };

  function buildContext(mode) {
    const byId = {};
    const getEl = (id) => { if (byId[id]) return byId[id]; if (realIds.has(id)) return (byId[id] = makeEl(id)); return null; };
    const navButtons = ['acompanhamento', 'processos', 'mapeamento', 'indicadores', 'admin'].map(v => { const e = makeEl('nav-' + v); e.dataset.view = v; e.classList.add(v === 'acompanhamento' ? 'active' : 'x'); return e; });
    const document = {
      getElementById: getEl,
      querySelector: (s) => (s === '.main' ? makeEl('main') : makeEl('sel')),
      querySelectorAll: (s) => {
        if (s === '.nav button') return navButtons;
        if (s === '.view') return ['dashboard', 'acompanhamento', 'processos', 'mapeamento', 'indicadores', 'admin'].map(makeEl);
        return [];
      },
      addEventListener() {}, createElement: () => makeEl('new'),
      body: { style: {} }, documentElement: { setAttribute() {} }, activeElement: null
    };
    const runner = {};
    runner.withSuccessHandler = (f) => { runner._s = f; return runner; };
    runner.withFailureHandler = (f) => { runner._f = f; return runner; };
    runner.getAdminData = () => {};
    runner.getHistoricoRegistro = () => {};
    runner.getSigepData = () => {
      if (mode === 'failure') { if (runner._f) runner._f(new Error('Falha simulada no servidor')); }
      else { if (runner._s) runner._s(sampleData); }
    };
    const google = { script: { run: new Proxy(runner, { get(t, p) { return (p in t) ? t[p] : () => t; } }) } };
    const sandbox = {
      document, window: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
      setTimeout: () => 0, clearTimeout: () => {}, console, google
    };
    return { sandbox, getEl };
  }

  // Caminho de sucesso
  (function () {
    const { sandbox, getEl } = buildContext('success');
    let threw = null;
    try { vm.runInNewContext(code, sandbox, { filename: 'index.html' }); }
    catch (e) { threw = e; }
    assert(!threw, 'init + render no caminho de sucesso não lança' + (threw ? ': ' + threw.message : ''));
    const board = getEl('mapeamentoBoard');
    assert(board && /Processos Gerenciais/.test(board.innerHTML) && /map-legend/.test(board.innerHTML),
      'Mapeamento renderiza blocos + legenda');
    assert(board && /Maturidade/.test(board.innerHTML) && /map-mat/.test(board.innerHTML),
      'Mapeamento mostra maturidade por processo');
    const grid = getEl('indicatorGrid');
    assert(grid && /Taxa X/.test(grid.innerHTML), 'Indicadores renderiza a lista');
  })();

  // Caminho de falha — a navegação precisa sobreviver
  (function () {
    const { sandbox, getEl } = buildContext('failure');
    let threw = null;
    try { vm.runInNewContext(code, sandbox, { filename: 'index.html' }); }
    catch (e) { threw = e; }
    assert(!threw, 'init no caminho de falha não lança' + (threw ? ': ' + threw.message : ''));
    let navThrew = null;
    try {
      ['processos', 'mapeamento', 'indicadores', 'admin', 'acompanhamento'].forEach(v => sandbox.window.ui.setView(v));
    } catch (e) { navThrew = e; }
    assert(!navThrew, 'Navegação (setView) sobrevive a erro de carregamento' + (navThrew ? ': ' + navThrew.message : ''));
    const acomp = getEl('acompGrid');
    assert(acomp && /Tentar novamente/.test(acomp.innerHTML), 'Erro de carregamento mostra "Tentar novamente" (shell preservado)');
  })();
})();

/* ------------------------------------------------------------------ */
console.log('\n' + '-'.repeat(48));
console.log(`Resultado: ${passed} passaram, ${failures} falharam.`);
process.exit(failures ? 1 : 0);
