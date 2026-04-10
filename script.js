const BASE_PATH = "/executivo-vilabela-mt";
const STORAGE_KEYS = {
  session: "evbmt_session",
  indicadores: "evbmt_indicadores_local"
};

function currencyBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value) || 0);
}

function numberBR(value, decimals = 0) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number(value) || 0);
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Number(normalized) || 0;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function riskClass(risco) {
  const r = String(risco || "").toLowerCase();
  if (r === "alto") return "alert";
  if (r === "medio" || r === "médio") return "warn";
  return "ok";
}

function riskLabel(risco) {
  const r = String(risco || "").toLowerCase();
  if (r === "alto") return "Alto";
  if (r === "medio" || r === "médio") return "Médio";
  return "Baixo";
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
  } catch {
    return null;
  }
}

function setSession(data) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function setIndicadoresLocal(data) {
  localStorage.setItem(STORAGE_KEYS.indicadores, JSON.stringify(data));
}

function getIndicadoresLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.indicadores) || "null");
  } catch {
    return null;
  }
}

function clearIndicadoresLocal() {
  localStorage.removeItem(STORAGE_KEYS.indicadores);
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Erro ao carregar ${path}`);
  return response.json();
}

async function getIndicadores() {
  const local = getIndicadoresLocal();
  if (local && local.secretarias) return local;
  return await loadJSON(`${BASE_PATH}/dados/indicadores.json`);
}

function mapSecretarias(indicadores) {
  if (!indicadores || !Array.isArray(indicadores.secretarias)) return [];

  return indicadores.secretarias.map((item) => {
    const receita = toNumber(item.receita_arrecadada || item.receita || 0);
    const empenhada = toNumber(item.despesa_empenhada || 0);
    const liquidada = toNumber(item.despesa_liquidada || 0);
    const paga = toNumber(item.despesa_paga || item.despesa || 0);
    const saldo = toNumber(item.saldo_apurado || item.saldo || receita - paga);
    const execucao = toNumber(
      item.execucao_percentual ||
      item.execucao_media_percentual ||
      (receita > 0 ? (paga / receita) * 100 : 0)
    );

    return {
      secretaria: item.nome || item.secretaria || "Não informado",
      receita,
      empenhada,
      liquidada,
      paga,
      saldo,
      execucao,
      risco: item.risco || "baixo",
      alerta: item.alerta || "Sem alerta",
      observacao: item.observacao || "Sem observação"
    };
  });
}

function setupMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
}

function setupLogoutLinks() {
  document.querySelectorAll("#logout-link, #admin-logout-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = `${BASE_PATH}/login.html`;
    });
  });
}

function fillSessionPills() {
  const session = getSession();
  const pill = document.getElementById("session-user-pill");
  if (!pill) return;

  if (!session) {
    pill.textContent = "Sessão local não identificada";
    return;
  }

  const perfilLabelMap = {
    executivo: "Prefeito / Executivo",
    legislativo: "Vereador / Legislativo",
    controle: "Controle",
    admin: "Administração"
  };

  pill.textContent = `${session.usuario} • ${perfilLabelMap[session.perfil] || session.perfil}`;
}

function requireSession(allowedProfiles = []) {
  const session = getSession();
  if (!session) {
    window.location.href = `${BASE_PATH}/login.html`;
    return null;
  }

  if (allowedProfiles.length && !allowedProfiles.includes(session.perfil)) {
    window.location.href = `${BASE_PATH}/login.html`;
    return null;
  }

  return session;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function populateFilter(secretarias) {
  const select = document.getElementById("filtro-secretaria");
  if (!select) return;

  const options = secretarias
    .map((s) => `<option value="${escapeHtml(s.secretaria)}">${escapeHtml(s.secretaria)}</option>`)
    .join("");

  select.innerHTML = `<option value="todas">Todas as Secretarias</option>${options}`;
}

function renderAlertas(secretarias) {
  const box = document.getElementById("alertas-box");
  if (!box) return;

  const criticos = secretarias.filter((s) => String(s.risco).toLowerCase() === "alto");
  const medios = secretarias.filter((s) => {
    const r = String(s.risco).toLowerCase();
    return r === "medio" || r === "médio";
  });

  const items = [];

  criticos.forEach((s) => {
    items.push(`
      <div class="insight">
        <strong>Alerta:</strong> ${escapeHtml(s.secretaria)} com execução de
        ${numberBR(s.execucao, 1)}% e saldo de ${currencyBRL(s.saldo)}.
      </div>
    `);
  });

  if (!items.length && medios.length) {
    medios.slice(0, 3).forEach((s) => {
      items.push(`
        <div class="insight">
          <strong>Atenção:</strong> ${escapeHtml(s.secretaria)} em faixa média de risco.
        </div>
      `);
    });
  }

  if (!items.length) {
    items.push(`<div class="insight">Nenhum alerta crítico foi identificado na leitura atual.</div>`);
  }

  box.innerHTML = items.join("");
}

function renderTabelaExecutivo(secretarias) {
  const tbody = document.getElementById("tabela-secretarias");
  if (!tbody) return;

  tbody.innerHTML = secretarias.map((s) => `
    <tr>
      <td>${escapeHtml(s.secretaria)}</td>
      <td>${currencyBRL(s.receita)}</td>
      <td>${currencyBRL(s.paga)}</td>
      <td>${currencyBRL(s.saldo)}</td>
      <td>
        <div class="progress"><span style="width:${Math.min(s.execucao, 100)}%"></span></div>
        ${numberBR(s.execucao, 1)}%
      </td>
      <td><span class="status ${riskClass(s.risco)}">${riskLabel(s.risco)}</span></td>
    </tr>
  `).join("");
}

function renderResumoExecutivo(painel, secretarias) {
  const box = document.getElementById("resumo-estrategico");
  if (!box) return;

  const saldo = toNumber(painel.saldo_apurado || 0);
  const criticas = secretarias.filter((s) => String(s.risco).toLowerCase() === "alto").length;

  box.innerHTML = `
    <strong>Execução geral:</strong> ${numberBR(painel.execucao_media_percentual || 0, 1)}%<br>
    <strong>Receita consolidada:</strong> ${currencyBRL(painel.receita_total || 0)}<br>
    <strong>Despesa consolidada:</strong> ${currencyBRL(painel.despesa_paga_total || 0)}<br>
    <strong>Saldo apurado:</strong> ${currencyBRL(saldo)}<br>
    <strong>Secretarias críticas:</strong> ${criticas}
  `;
}

function renderInsightsExecutivo(painel, secretarias) {
  const box = document.getElementById("insights-box");
  if (!box) return;

  const criticas = secretarias.filter((s) => String(s.risco).toLowerCase() === "alto");
  const positivas = secretarias.filter((s) => s.saldo >= 0);

  box.innerHTML = `
    <div class="insight">
      Há <strong>${criticas.length}</strong> secretaria(s) com execução crítica,
      exigindo verificação imediata de empenho, liquidação e saldo orçamentário.
    </div>
    <div class="insight">
      <strong>${positivas.length}</strong> secretaria(s) mantêm saldo positivo,
      o que favorece planejamento preventivo.
    </div>
    <div class="insight">
      Sugestão de IA: consolidar relatórios mensais por secretaria e gerar parecer executivo automatizado.
    </div>
  `;
}

function renderExecutivo(indicadores) {
  const painel = indicadores.painel_geral || {};
  let secretarias = mapSecretarias(indicadores);

  setText("data-atualizacao", painel.data_referencia || indicadores.data_referencia || "--/--/----");
  setText("kpi-receita-total", currencyBRL(painel.receita_total || 0));
  setText("kpi-despesa-total", currencyBRL(painel.despesa_paga_total || 0));
  setText("kpi-saldo-total", currencyBRL(painel.saldo_apurado || 0));
  setText("kpi-servidores-total", numberBR(painel.total_servidores || 0, 0));

  populateFilter(secretarias);

  const filtro = document.getElementById("filtro-secretaria");
  const aplicar = () => {
    const valor = filtro ? filtro.value : "todas";
    const lista = valor === "todas"
      ? secretarias
      : secretarias.filter((s) => s.secretaria === valor);

    renderAlertas(lista);
    renderTabelaExecutivo(lista);
    renderResumoExecutivo(painel, lista);
    renderInsightsExecutivo(painel, lista);
  };

  if (filtro) filtro.addEventListener("change", aplicar);
  aplicar();

  const exportar = document.getElementById("btn-exportar");
  if (exportar) {
    exportar.addEventListener("click", () => window.print());
  }

  const arquivo = document.getElementById("arquivo-json");
  if (arquivo) {
    arquivo.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      setIndicadoresLocal(data);
      renderExecutivo(data);
    });
  }
}

function renderLegislativo(indicadores) {
  const painel = indicadores.painel_geral || {};
  const secretarias = mapSecretarias(indicadores);

  setText("data-atualizacao", painel.data_referencia || indicadores.data_referencia || "--/--/----");
  setText("kpi-execucao-media", `${numberBR(painel.execucao_media_percentual || 0, 2)}%`);
  setText("kpi-empenhada-total", currencyBRL(painel.despesa_empenhada_total || 0));
  setText("kpi-liquidada-total", currencyBRL(painel.despesa_liquidada_total || 0));

  const atencao = secretarias.filter((s) => {
    const r = String(s.risco).toLowerCase();
    return r === "alto" || r === "medio" || r === "médio";
  }).length;
  setText("kpi-atencao-total", String(atencao));

  const leitura = document.getElementById("legislativo-leitura-box");
  if (leitura) {
    leitura.innerHTML = `
      <div class="insight">Priorizar análise das secretarias com risco alto e médio.</div>
      <div class="insight">Cruzar empenho, liquidação e despesa paga nas áreas sociais e estruturantes.</div>
      <div class="insight">Usar este painel como base para comissões, requerimentos e leitura em plenário.</div>
    `;
  }

  const tbody = document.getElementById("tabela-legislativo");
  if (tbody) {
    tbody.innerHTML = secretarias.map((s) => `
      <tr>
        <td>${escapeHtml(s.secretaria)}</td>
        <td>${currencyBRL(s.empenhada)}</td>
        <td>${currencyBRL(s.liquidada)}</td>
        <td>${currencyBRL(s.paga)}</td>
        <td>${numberBR(s.execucao, 1)}%</td>
        <td><span class="status ${riskClass(s.risco)}">${riskLabel(s.risco)}</span></td>
      </tr>
    `).join("");
  }

  const resumo = document.getElementById("resumo-legislativo");
  if (resumo) {
    resumo.innerHTML = `
      <strong>Execução média:</strong> ${numberBR(painel.execucao_media_percentual || 0, 2)}%<br>
      <strong>Despesa empenhada:</strong> ${currencyBRL(painel.despesa_empenhada_total || 0)}<br>
      <strong>Despesa liquidada:</strong> ${currencyBRL(painel.despesa_liquidada_total || 0)}<br>
      <strong>Secretarias em atenção:</strong> ${atencao}
    `;
  }

  const insights = document.getElementById("insights-legislativo-box");
  if (insights) {
    insights.innerHTML = `
      <div class="insight">As maiores pressões orçamentárias devem orientar a pauta de fiscalização temática.</div>
      <div class="insight">Sugestão de IA: criar roteiro automático de fiscalização por comissão temática.</div>
      <div class="insight">Sugestão de governança: vincular despesa, meta física e programa de governo na mesma consulta.</div>
    `;
  }
}

function renderControle(indicadores) {
  const painel = indicadores.painel_geral || {};
  const secretarias = mapSecretarias(indicadores);

  setText("data-atualizacao", painel.data_referencia || indicadores.data_referencia || "--/--/----");

  const riscoAlto = secretarias.filter((s) => String(s.risco).toLowerCase() === "alto").length;
  const riscoMedio = secretarias.filter((s) => {
    const r = String(s.risco).toLowerCase();
    return r === "medio" || r === "médio";
  }).length;
  const riscoBaixo = secretarias.filter((s) => String(s.risco).toLowerCase() === "baixo").length;

  setText("kpi-risco-alto", riscoAlto);
  setText("kpi-risco-medio", riscoMedio);
  setText("kpi-risco-baixo", riscoBaixo);
  setText("kpi-saldo-global-controle", currencyBRL(painel.saldo_apurado || 0));

  const tbody = document.getElementById("tabela-controle");
  if (tbody) {
    tbody.innerHTML = secretarias.map((s) => `
      <tr>
        <td>${escapeHtml(s.secretaria)}</td>
        <td>${currencyBRL(s.saldo)}</td>
        <td>${numberBR(s.execucao, 1)}%</td>
        <td><span class="status ${riskClass(s.risco)}">${riskLabel(s.risco)}</span></td>
        <td>${escapeHtml(s.alerta)}</td>
      </tr>
    `).join("");
  }

  const resumo = document.getElementById("resumo-controle");
  if (resumo) {
    resumo.innerHTML = `
      <strong>Foram detectadas ${riscoAlto}</strong> ocorrência(s) com potencial risco de conformidade.<br>
      <strong>Risco médio:</strong> ${riscoMedio}<br>
      <strong>Risco baixo:</strong> ${riscoBaixo}<br>
      <strong>Saldo global:</strong> ${currencyBRL(painel.saldo_apurado || 0)}
    `;
  }

  const insights = document.getElementById("insights-controle-box");
  if (insights) {
    insights.innerHTML = `
      <div class="insight">Sugestão de IA: emitir parecer preventivo com ranking de risco por secretaria.</div>
      <div class="insight">Próximo passo: integrar contratos, licitações e restos a pagar para análise ampliada.</div>
      <div class="insight">Recomendação: rotina mensal de conformidade e trilha de auditoria local.</div>
    `;
  }
}

function renderAdminStatus() {
  const box = document.getElementById("admin-status-box");
  if (!box) return;

  const session = getSession();
  const indicadores = getIndicadoresLocal();

  box.innerHTML = `
    <div class="insight"><strong>Receitas locais:</strong> ${indicadores ? "ativo" : "inativo"}</div>
    <div class="insight"><strong>Despesas locais:</strong> ${indicadores ? "ativo" : "inativo"}</div>
    <div class="insight"><strong>Servidores locais:</strong> ${indicadores ? "ativo" : "inativo"}</div>
    <div class="insight"><strong>Sessão ativa:</strong> ${session ? "ativo" : "inativo"}</div>
  `;
}

function setupAdminActions() {
  const feed = document.getElementById("admin-feedback");
  const btnBase = document.getElementById("btn-limpar-base");
  const btnSessao = document.getElementById("btn-limpar-sessao");

  if (btnBase) {
    btnBase.addEventListener("click", () => {
      clearIndicadoresLocal();
      renderAdminStatus();
      if (feed) {
        feed.classList.remove("hidden");
        feed.innerHTML = "Base local removida com sucesso.";
      }
    });
  }

  if (btnSessao) {
    btnSessao.addEventListener("click", () => {
      clearSession();
      renderAdminStatus();
      if (feed) {
        feed.classList.remove("hidden");
        feed.innerHTML = "Sessão local removida com sucesso.";
      }
    });
  }
}

function setupLogin() {
  const form = document.getElementById("login-form");
  const feed = document.getElementById("login-feedback");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const perfil = document.getElementById("perfil")?.value || "executivo";
    const usuario = (document.getElementById("usuario")?.value || "").trim();
    const senha = (document.getElementById("senha")?.value || "").trim();

    if (!usuario) {
      if (feed) {
        feed.classList.remove("hidden");
        feed.innerHTML = "Informe o usuário para continuar.";
      }
      return;
    }

    if (senha !== "1234") {
      if (feed) {
        feed.classList.remove("hidden");
        feed.innerHTML = "Senha inválida. Use a senha de teste 1234.";
      }
      return;
    }

    setSession({
      perfil,
      usuario,
      loginEm: new Date().toISOString()
    });

    const map = {
      executivo: `${BASE_PATH}/dashboard/executivo.html`,
      legislativo: `${BASE_PATH}/dashboard/legislativo.html`,
      controle: `${BASE_PATH}/dashboard/controle.html`,
      admin: `${BASE_PATH}/admin.html`
    };

    window.location.href = map[perfil] || map.executivo;
  });
}

function initPage() {
  const page = document.body.dataset.page;

  setupMenu();
  setupLogoutLinks();

  if (page === "login") {
    setupLogin();
    return;
  }

  if (page === "admin") {
    renderAdminStatus();
    setupAdminActions();
    return;
  }

  if (page === "executivo") {
    requireSession(["executivo"]);
    fillSessionPills();
    getIndicadores().then(renderExecutivo).catch(console.error);
    return;
  }

  if (page === "legislativo") {
    requireSession(["legislativo"]);
    fillSessionPills();
    getIndicadores().then(renderLegislativo).catch(console.error);
    return;
  }

  if (page === "controle") {
    requireSession(["controle"]);
    fillSessionPills();
    getIndicadores().then(renderControle).catch(console.error);
  }
}

document.addEventListener("DOMContentLoaded", initPage);
