/* =========================================================
   EXECUTIVOVILABELAMT — SCRIPT.JS TOTAL | 2º PACOTE COMPLETO
   ========================================================= */

(() => {
  "use strict";

  const STORAGE = {
    SESSION: "evbmt_session",
    DATA: "evbmt_data",
    THEME: "evbmt_theme"
  };

  const ROUTES = {
    executivo: "executivo.html",
    legislativo: "legislativo.html",
    controle: "controle.html",
    admin: "admin.html"
  };

  const DEFAULT_DATA = {
    atualizadoEm: "2026-01-31",
    parceriasInstitucionais: [
      "Prefeitura Municipal",
      "Câmara Municipal",
      "TCE-MT",
      "TCU",
      "AMM"
    ],
    parceriasTecnologicas: [
      "GitHub Pages",
      "Termux",
      "Git",
      "Notion",
      "OpenAI / ChatGPT"
    ],
    secretarias: [
      { nome: "Administração", receita: 180000, despesa: 120000, servidores: 22 },
      { nome: "Finanças", receita: 150000, despesa: 98000, servidores: 10 },
      { nome: "Saúde", receita: 300000, despesa: 345000, servidores: 140 },
      { nome: "Educação", receita: 330000, despesa: 310000, servidores: 115 },
      { nome: "Assistência Social", receita: 125000, despesa: 110000, servidores: 26 },
      { nome: "Obras", receita: 210000, despesa: 295000, servidores: 34 },
      { nome: "Cultura", receita: 45000, despesa: 50000, servidores: 6 },
      { nome: "Turismo", receita: 40000, despesa: 40000, servidores: 5 },
      { nome: "Meio Ambiente", receita: 46000, despesa: 47000, servidores: 7 },
      { nome: "Agricultura", receita: 72000, despesa: 89000, servidores: 12 },
      { nome: "Planejamento", receita: 428900, despesa: 552900, servidores: 9 }
    ]
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureData();
    initTheme();
    initMenu();
    initYear();
    initLogoutLinks();
    initLoginPage();
    initAdminPage();
    renderPage();
  });

  /* =========================================================
     HELPERS
     ========================================================= */

  function $(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function $all(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function pageName() {
    return document.body?.dataset?.page || "";
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = value;
  }

  function setHTML(selector, value) {
    const el = $(selector);
    if (el) el.innerHTML = value;
  }

  function fmtMoney(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function fmtPercent(value) {
    return `${Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}%`;
  }

  function fmtDate(value) {
    if (!value) return "--/--/----";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("pt-BR");
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* =========================================================
     THEME
     ========================================================= */

  function initTheme() {
    const saved = localStorage.getItem(STORAGE.THEME);
    if (saved === "light") {
      document.body.classList.add("light-mode");
    }

    let btn = $(".toggle-theme");

    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "toggle-theme";
      btn.setAttribute("aria-label", "Alternar tema");
      btn.innerHTML = "🌗 <span>Tema</span>";
      document.body.appendChild(btn);
    }

    btn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      const theme = document.body.classList.contains("light-mode") ? "light" : "dark";
      localStorage.setItem(STORAGE.THEME, theme);
    });
  }

  /* =========================================================
     MENU BLINDADO
     ========================================================= */

  function initMenu() {
    const toggle =
      $("[data-menu-toggle]") ||
      $(".menu-toggle");

    const drawer =
      $("[data-menu-drawer]") ||
      $(".menu-drawer");

    const overlay =
      $("[data-menu-overlay]") ||
      $(".menu-overlay");

    if (!toggle || !drawer) return;

    const closeTargets = [
      ...$all("[data-menu-close]"),
      ...$all(".menu-close"),
      ...(overlay ? [overlay] : [])
    ];

    function openMenu() {
      drawer.classList.add("is-open");
      toggle.classList.add("is-active");
      toggle.setAttribute("aria-expanded", "true");
      if (overlay) overlay.classList.add("is-open");
      document.body.classList.add("menu-open");
    }

    function closeMenu() {
      drawer.classList.remove("is-open");
      toggle.classList.remove("is-active");
      toggle.setAttribute("aria-expanded", "false");
      if (overlay) overlay.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }

    function toggleMenu() {
      if (drawer.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener("click", toggleMenu);

    closeTargets.forEach((el) => {
      el.addEventListener("click", closeMenu);
    });

    $all("a", drawer).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* =========================================================
     SESSION
     ========================================================= */

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    localStorage.setItem(STORAGE.SESSION, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE.SESSION);
  }

  function initLogoutLinks() {
    $all("[data-logout]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        clearSession();
        window.location.href = "login.html";
      });
    });
  }

  /* =========================================================
     DATA
     ========================================================= */

  function normalizeData(data) {
    const base = clone(DEFAULT_DATA);
    if (!data || typeof data !== "object") return base;

    const merged = {
      atualizadoEm: data.atualizadoEm || base.atualizadoEm,
      parceriasInstitucionais: Array.isArray(data.parceriasInstitucionais)
        ? data.parceriasInstitucionais
        : base.parceriasInstitucionais,
      parceriasTecnologicas: Array.isArray(data.parceriasTecnologicas)
        ? data.parceriasTecnologicas
        : base.parceriasTecnologicas,
      secretarias: Array.isArray(data.secretarias) ? data.secretarias : base.secretarias
    };

    merged.secretarias = merged.secretarias.map((item) => ({
      nome: item.nome || "Secretaria",
      receita: Number(item.receita || 0),
      despesa: Number(item.despesa || 0),
      servidores: Number(item.servidores || 0)
    }));

    merged.secretarias = splitCulturaTurismo(merged.secretarias);

    return merged;
  }

  function splitCulturaTurismo(secretarias) {
    const result = [];

    secretarias.forEach((item) => {
      if (String(item.nome).trim().toLowerCase() === "cultura e turismo") {
        result.push(
          { nome: "Cultura", receita: 45000, despesa: 50000, servidores: 6 },
          { nome: "Turismo", receita: 40000, despesa: 40000, servidores: 5 }
        );
      } else {
        result.push(item);
      }
    });

    const hasCultura = result.some((s) => s.nome === "Cultura");
    const hasTurismo = result.some((s) => s.nome === "Turismo");

    if (!hasCultura) {
      result.push({ nome: "Cultura", receita: 45000, despesa: 50000, servidores: 6 });
    }
    if (!hasTurismo) {
      result.push({ nome: "Turismo", receita: 40000, despesa: 40000, servidores: 5 });
    }

    return result.filter((item, index, arr) => {
      return arr.findIndex((x) => x.nome === item.nome) === index;
    });
  }

  function ensureData() {
    const current = getData();
    if (!current) {
      localStorage.setItem(STORAGE.DATA, JSON.stringify(DEFAULT_DATA));
    } else {
      localStorage.setItem(STORAGE.DATA, JSON.stringify(normalizeData(current)));
    }
  }

  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE.DATA);
      return raw ? normalizeData(JSON.parse(raw)) : null;
    } catch {
      return normalizeData(DEFAULT_DATA);
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE.DATA, JSON.stringify(normalizeData(data)));
  }

  function calcExecucao(item) {
    if (!Number(item.receita)) return 0;
    return (Number(item.despesa) / Number(item.receita)) * 100;
  }

  function calcSaldo(item) {
    return Number(item.receita) - Number(item.despesa);
  }

  function classifyRisk(item) {
    const exec = calcExecucao(item);
    const saldo = calcSaldo(item);

    if (exec > 100 || saldo < 0) return "Risco alto";
    if (exec >= 90) return "Atenção";
    return "Estável";
  }

  function riskClassName(label) {
    if (label === "Risco alto") return "risk";
    if (label === "Atenção") return "attention";
    return "stable";
  }

  function summary(data) {
    const totalReceita = data.secretarias.reduce((acc, item) => acc + Number(item.receita), 0);
    const totalDespesa = data.secretarias.reduce((acc, item) => acc + Number(item.despesa), 0);
    const totalServidores = data.secretarias.reduce((acc, item) => acc + Number(item.servidores), 0);
    const saldo = totalReceita - totalDespesa;
    const mediaExecucao =
      data.secretarias.length > 0
        ? data.secretarias.reduce((acc, item) => acc + calcExecucao(item), 0) / data.secretarias.length
        : 0;

    return {
      totalReceita,
      totalDespesa,
      totalServidores,
      saldo,
      mediaExecucao
    };
  }

  /* =========================================================
     LOGIN PAGE
     ========================================================= */

  function initLoginPage() {
    if (pageName() !== "login") return;

    const form = $("#loginForm");
    const statusBox = $("#loginMensagem");
    const usuario = $("#usuario");
    const senha = $("#senha");
    const perfil = $("#perfil");

    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const perfilValue = String(perfil?.value || "").trim().toLowerCase();
      const usuarioValue = String(usuario?.value || "").trim();
      const senhaValue = String(senha?.value || "").trim();

      if (!perfilValue || !usuarioValue || !senhaValue) {
        showStatus(statusBox, "Preencha perfil, usuário e senha.", "erro");
        return;
      }

      const authMap = {
        executivo: "1234",
        legislativo: "1234",
        controle: "1234",
        admin: "1234"
      };

      if (senhaValue !== authMap[perfilValue]) {
        showStatus(statusBox, "Senha inválida. Use 1234.", "erro");
        return;
      }

      const perfilNomeMap = {
        executivo: "Prefeito / Executivo",
        legislativo: "Vereador / Legislativo",
        controle: "Controle / Órgãos de Controle",
        admin: "Administração local"
      };

      saveSession({
        usuario: usuarioValue,
        perfil: perfilValue,
        perfilNome: perfilNomeMap[perfilValue] || perfilValue,
        loginEm: new Date().toISOString()
      });

      showStatus(statusBox, "Acesso liberado. Redirecionando...", "sucesso");

      setTimeout(() => {
        window.location.href = ROUTES[perfilValue] || "index.html";
      }, 450);
    });
  }

  function showStatus(box, text, type) {
    if (!box) return;
    box.textContent = text;
    box.className = `status-box ${type}`;
  }

  /* =========================================================
     ADMIN PAGE
     ========================================================= */

  function initAdminPage() {
    if (pageName() !== "admin") return;

    const btnLimparBase = $("#btnLimparBaseLocal");
    const btnLimparSessao = $("#btnLimparSessao");
    const storageStatus = $("#adminStorageStatus");
    const sessionStatus = $("#adminSessionStatus");
    const lastUpdate = $("#adminLastUpdate");
    const statusReceitas = $("#statusReceitasLocais");
    const statusDespesas = $("#statusDespesasLocais");
    const statusServidores = $("#statusServidoresLocais");
    const statusSessao = $("#statusSessaoAtiva");
    const msg = $("#adminMensagem");

    const data = getData();
    const sessao = getSession();

    if (storageStatus) storageStatus.textContent = storageAvailable() ? "ativo" : "indisponível";
    if (sessionStatus) sessionStatus.textContent = sessao ? "ativa" : "inativa";
    if (lastUpdate) lastUpdate.textContent = fmtDate(data?.atualizadoEm);

    if (statusReceitas) setPill(statusReceitas, data ? "ativo" : "inativo");
    if (statusDespesas) setPill(statusDespesas, data ? "ativo" : "inativo");
    if (statusServidores) setPill(statusServidores, data ? "ativo" : "inativo");
    if (statusSessao) setPill(statusSessao, sessao ? "ativo" : "inativo");

    if (btnLimparBase) {
      btnLimparBase.addEventListener("click", () => {
        localStorage.removeItem(STORAGE.DATA);
        ensureData();
        showStatus(msg, "Base local removida com sucesso.", "sucesso");
        setTimeout(() => window.location.reload(), 350);
      });
    }

    if (btnLimparSessao) {
      btnLimparSessao.addEventListener("click", () => {
        clearSession();
        showStatus(msg, "Sessão removida com sucesso.", "sucesso");
        setTimeout(() => window.location.reload(), 350);
      });
    }
  }

  function storageAvailable() {
    try {
      localStorage.setItem("__evbmt_test__", "ok");
      localStorage.removeItem("__evbmt_test__");
      return true;
    } catch {
      return false;
    }
  }

  function setPill(el, text) {
    if (!el) return;
    el.textContent = text;
    el.className = "status-pill";
    if (text === "ativo") el.classList.add("stable");
    else el.classList.add("attention");
  }

  /* =========================================================
     PAGE RENDER
     ========================================================= */

  function renderPage() {
    const page = pageName();
    const data = getData();
    const resumo = summary(data);

    renderSessionHeader();

    if (page === "home") {
      renderHome(data, resumo);
    }

    if (page === "executivo") {
      requireSession(["executivo", "admin"]);
      renderExecutivo(data, resumo);
    }

    if (page === "legislativo") {
      requireSession(["legislativo", "admin"]);
      renderLegislativo(data, resumo);
    }

    if (page === "controle") {
      requireSession(["controle", "admin"]);
      renderControle(data, resumo);
    }
  }

  function renderSessionHeader() {
    const sessaoUsuario = $("[data-sessao-usuario]");
    const sessaoPerfil = $("[data-sessao-perfil]");
    const sessao = getSession();

    if (sessaoUsuario) sessaoUsuario.textContent = sessao?.usuario || "Visitante";
    if (sessaoPerfil) sessaoPerfil.textContent = sessao?.perfilNome || "Acesso institucional";
  }

  function requireSession(allowed) {
    const sessao = getSession();
    if (!sessao) {
      window.location.href = "login.html";
      return;
    }

    if (Array.isArray(allowed) && !allowed.includes(sessao.perfil)) {
      window.location.href = "login.html";
    }
  }

  /* =========================================================
     HOME
     ========================================================= */

  function renderHome(data, resumo) {
    setText("#homeReceitaTotal", fmtMoney(resumo.totalReceita));
    setText("#homeDespesaTotal", fmtMoney(resumo.totalDespesa));
    setText("#homeSaldoTotal", fmtMoney(resumo.saldo));
    setText("#homeExecucaoMedia", fmtPercent(resumo.mediaExecucao));

    renderSecretariasCards("#monitoramentoSecretarias", data.secretarias);
    renderSimpleList("#listaParceriasInstitucionais", data.parceriasInstitucionais);
    renderSimpleList("#listaParceriasTecnologicas", data.parceriasTecnologicas);

    renderCharts(data.secretarias);
  }

  /* =========================================================
     EXECUTIVO
     ========================================================= */

  function renderExecutivo(data, resumo) {
    setText("#executivoAtualizadoEm", fmtDate(data.atualizadoEm));
    setText("#executivoReceitaTotal", fmtMoney(resumo.totalReceita));
    setText("#executivoDespesaTotal", fmtMoney(resumo.totalDespesa));
    setText("#executivoSaldoTotal", fmtMoney(resumo.saldo));
    setText("#executivoServidores", String(resumo.totalServidores));

    const filtro = $("#filtroSecretaria");
    const tabela = $("#tabelaExecutivoBody");
    const alertas = $("#executivoAlertas");
    const resumoBox = $("#executivoResumo");
    const insights = $("#executivoInsights");
    const exportBtn = $("#btnExportarRelatorio");
    const uploadJson = $("#uploadJson");

    if (filtro) {
      fillFilter(filtro, data.secretarias);
      filtro.addEventListener("change", () => {
        updateExecutivoView(data.secretarias, filtro.value);
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => window.print());
    }

    if (uploadJson) {
      uploadJson.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(String(e.target?.result || "{}"));
            saveData(json);
            window.location.reload();
          } catch {
            window.alert("Arquivo JSON inválido.");
          }
        };
        reader.readAsText(file, "utf-8");
      });
    }

    updateExecutivoView(data.secretarias, "todas");

    function updateExecutivoView(secretarias, filtroNome) {
      const lista =
        filtroNome && filtroNome !== "todas"
          ? secretarias.filter((item) => item.nome === filtroNome)
          : secretarias;

      if (tabela) {
        tabela.innerHTML = lista
          .map((item) => {
            return `
              <tr>
                <td>${item.nome}</td>
                <td>${fmtMoney(item.receita)}</td>
                <td>${fmtMoney(item.despesa)}</td>
                <td>${fmtMoney(calcSaldo(item))}</td>
                <td>${fmtPercent(calcExecucao(item))}</td>
              </tr>
            `;
          })
          .join("");
      }

      if (alertas) {
        const criticos = lista.filter((item) => classifyRisk(item) !== "Estável");
        alertas.innerHTML =
          criticos.length > 0
            ? criticos
                .map((item) => {
                  return `
                    <div class="alert-item">
                      <strong>${item.nome}</strong><br>
                      Execução de ${fmtPercent(calcExecucao(item))} e saldo de ${fmtMoney(calcSaldo(item))}.
                    </div>
                  `;
                })
                .join("")
            : `<div class="alert-item ok">Nenhum alerta crítico foi identificado na leitura atual.</div>`;
      }

      if (resumoBox) {
        const parcial = summary({ secretarias: lista });
        const criticas = lista.filter((item) => classifyRisk(item) === "Risco alto").length;

        resumoBox.innerHTML = `
          <strong>Execução geral:</strong> ${fmtPercent(parcial.mediaExecucao)}<br>
          <strong>Receita consolidada:</strong> ${fmtMoney(parcial.totalReceita)}<br>
          <strong>Despesa consolidada:</strong> ${fmtMoney(parcial.totalDespesa)}<br>
          <strong>Saldo apurado:</strong> ${fmtMoney(parcial.saldo)}<br>
          <strong>Secretarias críticas:</strong> ${criticas}
        `;
      }

      if (insights) {
        const criticas = lista.filter((item) => classifyRisk(item) === "Risco alto").length;
        const positivas = lista.filter((item) => calcSaldo(item) >= 0).length;

        insights.innerHTML = `
          <p>Há ${criticas} secretaria(s) com execução crítica, exigindo verificação imediata.</p>
          <p>${positivas} secretaria(s) mantêm saldo positivo, favorecendo planejamento preventivo.</p>
          <p>Sugestão de IA: consolidar relatórios mensais por secretaria e gerar parecer executivo automatizado.</p>
        `;
      }
    }
  }

  /* =========================================================
     LEGISLATIVO
     ========================================================= */

  function renderLegislativo(data, resumo) {
    setText("#legAtualizadoEm", fmtDate(data.atualizadoEm));
    setText("#legExecucaoMedia", fmtPercent(resumo.mediaExecucao));
    setText("#legDespesaEmpenhada", fmtMoney(resumo.totalDespesa));
    setText("#legSaldoApurado", fmtMoney(resumo.saldo));

    const target = $("#legTemasFiscalizacao");
    if (!target) return;

    target.innerHTML = data.secretarias
      .map((item) => {
        const risco = classifyRisk(item);
        return `
          <article class="monitor-card">
            <h3>${item.nome}</h3>
            <p><strong>Receita:</strong> ${fmtMoney(item.receita)}</p>
            <p><strong>Despesa:</strong> ${fmtMoney(item.despesa)}</p>
            <p><strong>Saldo:</strong> ${fmtMoney(calcSaldo(item))}</p>
            <p><strong>Execução:</strong> ${fmtPercent(calcExecucao(item))}</p>
            <span class="label-chip ${riskClassName(risco)}">${risco}</span>
          </article>
        `;
      })
      .join("");
  }

  /* =========================================================
     CONTROLE
     ========================================================= */

  function renderControle(data, resumo) {
    setText("#controleAtualizadoEm", fmtDate(data.atualizadoEm));
    setText("#controleReceitaTotal", fmtMoney(resumo.totalReceita));
    setText("#controleDespesaTotal", fmtMoney(resumo.totalDespesa));
    setText("#controleSaldoTotal", fmtMoney(resumo.saldo));
    setText("#controleExecucaoMedia", fmtPercent(resumo.mediaExecucao));

    const riscos = $("#controleRiscos");
    const conformidade = $("#controleConformidade");

    if (riscos) {
      const criticos = data.secretarias.filter((item) => classifyRisk(item) !== "Estável");
      riscos.innerHTML = criticos.length
        ? `
          <ul class="list-clean">
            ${criticos
              .map((item) => `<li>${item.nome}: execução ${fmtPercent(calcExecucao(item))} e saldo ${fmtMoney(calcSaldo(item))}.</li>`)
              .join("")}
          </ul>
        `
        : `<p class="muted">Nenhum risco crítico identificado.</p>`;
    }

    if (conformidade) {
      conformidade.innerHTML = `
        <ul class="list-clean">
          <li>Base pronta para auditoria preventiva.</li>
          <li>Leitura consolidada por secretaria.</li>
          <li>Estrutura inicial compatível com Portal da Transparência, TCE-MT e TCU.</li>
          <li>Ponto de expansão para API oficial e trilha de evidências.</li>
        </ul>
      `;
    }
  }

  /* =========================================================
     RENDER AUXILIAR
     ========================================================= */

  function renderSecretariasCards(selector, secretarias) {
    const container = $(selector);
    if (!container) return;

    container.innerHTML = secretarias
      .map((item) => {
        const risco = classifyRisk(item);
        return `
          <article class="monitor-card">
            <h3>${item.nome}</h3>
            <p>Receita: <strong>${fmtMoney(item.receita)}</strong></p>
            <p>Despesa: <strong>${fmtMoney(item.despesa)}</strong></p>
            <p>Saldo: <strong>${fmtMoney(calcSaldo(item))}</strong></p>
            <p>Execução: <strong>${fmtPercent(calcExecucao(item))}</strong></p>
            <span class="label-chip ${riskClassName(risco)}">${risco}</span>
          </article>
        `;
      })
      .join("");
  }

  function renderSimpleList(selector, items) {
    const container = $(selector);
    if (!container) return;
    container.innerHTML = `
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;
  }

  function fillFilter(select, secretarias) {
    select.innerHTML = `
      <option value="todas">Todas as Secretarias</option>
      ${secretarias.map((item) => `<option value="${item.nome}">${item.nome}</option>`).join("")}
    `;
  }

  function initYear() {
    $all("[data-ano-atual]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* =========================================================
     CHARTS
     ========================================================= */

  function renderCharts(secretarias) {
    if (typeof Chart === "undefined") return;

    buildChartReceitaDespesa(secretarias);
    buildChartSaldo(secretarias);
    buildChartExecucao(secretarias);
    buildChartRisco(secretarias);
  }

  function destroyChart(id) {
    const existing = Chart.getChart(id);
    if (existing) existing.destroy();
  }

  function defaultChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "#dbe7ff" },
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        y: {
          ticks: { color: "#dbe7ff" },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#eaf2ff"
          }
        }
      }
    };
  }

  function buildChartReceitaDespesa(secretarias) {
    const canvas = $("#chartReceitaDespesa");
    if (!canvas) return;

    destroyChart("chartReceitaDespesa");

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: secretarias.map((item) => item.nome),
        datasets: [
          {
            label: "Receita",
            data: secretarias.map((item) => item.receita),
            backgroundColor: "#28c7fa"
          },
          {
            label: "Despesa",
            data: secretarias.map((item) => item.despesa),
            backgroundColor: "#c0392b"
          }
        ]
      },
      options: defaultChartOptions()
    });
  }

  function buildChartSaldo(secretarias) {
    const canvas = $("#chartSaldo");
    if (!canvas) return;

    destroyChart("chartSaldo");

    new Chart(canvas, {
      type: "line",
      data: {
        labels: secretarias.map((item) => item.nome),
        datasets: [
          {
            label: "Saldo",
            data: secretarias.map((item) => calcSaldo(item)),
            borderColor: "#52ff7a",
            backgroundColor: "rgba(82,255,122,0.15)",
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: defaultChartOptions()
    });
  }

  function buildChartExecucao(secretarias) {
    const canvas = $("#chartExecucao");
    if (!canvas) return;

    destroyChart("chartExecucao");

    new Chart(canvas, {
      type: "bar",
      data: {
        labels: secretarias.map((item) => item.nome),
        datasets: [
          {
            label: "Execução (%)",
            data: secretarias.map((item) => Number(calcExecucao(item).toFixed(1))),
            backgroundColor: secretarias.map((item) => {
              const risco = classifyRisk(item);
              if (risco === "Risco alto") return "#e74c3c";
              if (risco === "Atenção") return "#f1c40f";
              return "#2ecc71";
            })
          }
        ]
      },
      options: defaultChartOptions()
    });
  }

  function buildChartRisco(secretarias) {
    const canvas = $("#chartRisco");
    if (!canvas) return;

    destroyChart("chartRisco");

    const estavel = secretarias.filter((item) => classifyRisk(item) === "Estável").length;
    const atencao = secretarias.filter((item) => classifyRisk(item) === "Atenção").length;
    const riscoAlto = secretarias.filter((item) => classifyRisk(item) === "Risco alto").length;

    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Estável", "Atenção", "Risco alto"],
        datasets: [
          {
            data: [estavel, atencao, riscoAlto],
            backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#eaf2ff" }
          }
        }
      }
    });
  }
})();
