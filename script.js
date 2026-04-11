(function () {
  "use strict";

  const APP = {
    storageKeys: {
      session: "evbmt_session",
      data: "evbmt_dados_reais"
    },

    defaults: {
      atualizadoEm: "2026-01-31",
      resumo: {
        receitaTotal: 1903900,
        despesaTotal: 2019000,
        saldoTotal: -116000,
        execucaoMedia: 101.0,
        servidores: 0
      },
      secretarias: [
        {
          nome: "Administração",
          receita: 180000,
          despesa: 120000,
          saldo: 60000,
          execucao: 66.7,
          risco: "Estável"
        },
        {
          nome: "Finanças",
          receita: 150000,
          despesa: 98000,
          saldo: 52000,
          execucao: 65.3,
          risco: "Estável"
        },
        {
          nome: "Saúde",
          receita: 300000,
          despesa: 345000,
          saldo: -45000,
          execucao: 115.0,
          risco: "Risco alto"
        },
        {
          nome: "Educação",
          receita: 330000,
          despesa: 310000,
          saldo: 20000,
          execucao: 93.9,
          risco: "Atenção"
        },
        {
          nome: "Assistência Social",
          receita: 125000,
          despesa: 110000,
          saldo: 15000,
          execucao: 88.0,
          risco: "Estável"
        },
        {
          nome: "Obras",
          receita: 210000,
          despesa: 295000,
          saldo: -85000,
          execucao: 140.5,
          risco: "Risco alto"
        },
        {
          nome: "Cultura e Turismo",
          receita: 62000,
          despesa: 53000,
          saldo: 9000,
          execucao: 85.5,
          risco: "Estável"
        },
        {
          nome: "Meio Ambiente",
          receita: 46000,
          despesa: 47000,
          saldo: -1000,
          execucao: 102.2,
          risco: "Risco alto"
        },
        {
          nome: "Agricultura",
          receita: 72000,
          despesa: 89000,
          saldo: -17000,
          execucao: 123.6,
          risco: "Risco alto"
        },
        {
          nome: "Planejamento",
          receita: 428900,
          despesa: 552900,
          saldo: -124000,
          execucao: 128.9,
          risco: "Risco alto"
        }
      ],
      leituras: {
        governanca: [
          "Leitura integrada das secretarias e áreas finalísticas.",
          "Resumo executivo com foco em receita, despesa, saldo e risco.",
          "Base para decisões orientadas por dados.",
          "Compatível com evolução para dados oficiais."
        ],
        legislativo: [
          "Acompanhamento temático por secretaria.",
          "Base para fiscalização, requerimentos e comissões.",
          "Identificação de alertas de execução e saldo.",
          "Visão consolidada para atividade parlamentar."
        ],
        controle: [
          "Suporte para auditoria preventiva.",
          "Foco em execução crítica, desequilíbrio e risco fiscal.",
          "Organização institucional da leitura por órgão.",
          "Pronto para expansão com indicadores formais."
        ],
        ia: [
          "Insights automáticos para leitura executiva.",
          "Priorização de áreas com maior atenção.",
          "Apoio a pareceres, notas e resumos gerenciais.",
          "Camada estratégica de interpretação institucional."
        ]
      },
      parcerias: {
        institucionais: [
          "Prefeitura Municipal",
          "Câmara Municipal",
          "TCE-MT",
          "TCU",
          "AMM"
        ],
        tecnologicas: [
          "GitHub Pages",
          "Termux",
          "Git",
          "Notion",
          "OpenAI / ChatGPT"
        ]
      }
    },

    state: {
      dados: null,
      sessao: null,
      charts: {}
    }
  };

  function $(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function $all(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function formatCurrency(value) {
    const number = Number(value || 0);
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatNumber(value, digits = 1) {
    const number = Number(value || 0);
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function formatPercent(value, digits = 1) {
    return `${formatNumber(value, digits)}%`;
  }

  function normalizeRisk(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw.includes("alto")) return "risco";
    if (raw.includes("aten")) return "atencao";
    return "estavel";
  }

  function getRiskLabel(value) {
    const risk = normalizeRisk(value);
    if (risk === "risco") return "Risco alto";
    if (risk === "atencao") return "Atenção";
    return "Estável";
  }

  function safeParse(jsonText, fallback = null) {
    try {
      return JSON.parse(jsonText);
    } catch {
      return fallback;
    }
  }

  function cloneData(data) {
    return safeParse(JSON.stringify(data), APP.defaults);
  }

  function getStoredData() {
    const local = localStorage.getItem(APP.storageKeys.data);
    const parsed = local ? safeParse(local, null) : null;
    return parsed || cloneData(APP.defaults);
  }

  function saveData(data) {
    localStorage.setItem(APP.storageKeys.data, JSON.stringify(data));
    APP.state.dados = data;
  }

  function getSession() {
    const raw = localStorage.getItem(APP.storageKeys.session);
    return raw ? safeParse(raw, null) : null;
  }

  function saveSession(session) {
    localStorage.setItem(APP.storageKeys.session, JSON.stringify(session));
    APP.state.sessao = session;
  }

  function clearSession() {
    localStorage.removeItem(APP.storageKeys.session);
    APP.state.sessao = null;
  }

  function clearData() {
    localStorage.removeItem(APP.storageKeys.data);
    APP.state.dados = cloneData(APP.defaults);
  }

  function ensureDataShape(data) {
    const base = cloneData(APP.defaults);
    if (!data || typeof data !== "object") return base;

    return {
      atualizadoEm: data.atualizadoEm || base.atualizadoEm,
      resumo: {
        receitaTotal: Number(data?.resumo?.receitaTotal ?? base.resumo.receitaTotal),
        despesaTotal: Number(data?.resumo?.despesaTotal ?? base.resumo.despesaTotal),
        saldoTotal: Number(data?.resumo?.saldoTotal ?? base.resumo.saldoTotal),
        execucaoMedia: Number(data?.resumo?.execucaoMedia ?? base.resumo.execucaoMedia),
        servidores: Number(data?.resumo?.servidores ?? base.resumo.servidores)
      },
      secretarias: Array.isArray(data.secretarias) && data.secretarias.length
        ? data.secretarias.map((item) => ({
            nome: item.nome || "Secretaria",
            receita: Number(item.receita || 0),
            despesa: Number(item.despesa || 0),
            saldo: Number(item.saldo ?? (Number(item.receita || 0) - Number(item.despesa || 0))),
            execucao: Number(item.execucao || 0),
            risco: item.risco || "Estável"
          }))
        : base.secretarias,
      leituras: {
        governanca: Array.isArray(data?.leituras?.governanca) ? data.leituras.governanca : base.leituras.governanca,
        legislativo: Array.isArray(data?.leituras?.legislativo) ? data.leituras.legislativo : base.leituras.legislativo,
        controle: Array.isArray(data?.leituras?.controle) ? data.leituras.controle : base.leituras.controle,
        ia: Array.isArray(data?.leituras?.ia) ? data.leituras.ia : base.leituras.ia
      },
      parcerias: {
        institucionais: Array.isArray(data?.parcerias?.institucionais)
          ? data.parcerias.institucionais
          : base.parcerias.institucionais,
        tecnologicas: Array.isArray(data?.parcerias?.tecnologicas)
          ? data.parcerias.tecnologicas
          : base.parcerias.tecnologicas
      }
    };
  }

  function recalcResumo(data) {
    const receitaTotal = data.secretarias.reduce((sum, item) => sum + Number(item.receita || 0), 0);
    const despesaTotal = data.secretarias.reduce((sum, item) => sum + Number(item.despesa || 0), 0);
    const saldoTotal = data.secretarias.reduce((sum, item) => sum + Number(item.saldo || 0), 0);
    const execucaoMedia = data.secretarias.length
      ? data.secretarias.reduce((sum, item) => sum + Number(item.execucao || 0), 0) / data.secretarias.length
      : 0;

    data.resumo.receitaTotal = receitaTotal;
    data.resumo.despesaTotal = despesaTotal;
    data.resumo.saldoTotal = saldoTotal;
    data.resumo.execucaoMedia = Number(execucaoMedia.toFixed(1));

    return data;
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = value;
  }

  function setHtml(selector, value) {
    const el = $(selector);
    if (el) el.innerHTML = value;
  }

  function buildList(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return `<ul class="list-clean">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function renderParcerias(data) {
    setHtml("[data-parcerias-institucionais]", buildList(data.parcerias.institucionais));
    setHtml("[data-parcerias-tecnologicas]", buildList(data.parcerias.tecnologicas));
  }

  function renderLeituras(data) {
    setHtml("[data-leitura-governanca]", buildList(data.leituras.governanca));
    setHtml("[data-leitura-legislativo]", buildList(data.leituras.legislativo));
    setHtml("[data-leitura-controle]", buildList(data.leituras.controle));
    setHtml("[data-leitura-ia]", buildList(data.leituras.ia));
  }

  function renderResumo(data) {
    setText("[data-atualizado-em]", data.atualizadoEm || "--/--/----");
    setText("[data-receita-total]", formatCurrency(data.resumo.receitaTotal));
    setText("[data-despesa-total]", formatCurrency(data.resumo.despesaTotal));
    setText("[data-saldo-total]", formatCurrency(data.resumo.saldoTotal));
    setText("[data-execucao-media]", formatPercent(data.resumo.execucaoMedia, 1));
    setText("[data-servidores]", String(data.resumo.servidores ?? 0));
  }

  function buildMonitorCards(secretarias) {
    return secretarias
      .map((item) => {
        const riskClass = normalizeRisk(item.risco);
        const riskLabel = getRiskLabel(item.risco);

        return `
          <article class="monitor-card">
            <h3>${item.nome}</h3>
            <div class="monitor-card__stats">
              <div>Receita: <strong>${formatCurrency(item.receita)}</strong></div>
              <div>Despesa: <strong>${formatCurrency(item.despesa)}</strong></div>
              <div>Saldo: <strong>${formatCurrency(item.saldo)}</strong></div>
              <div>Execução: <strong>${formatPercent(item.execucao, 1)}</strong></div>
            </div>
            <span class="risk-chip ${riskClass}">${riskLabel}</span>
          </article>
        `;
      })
      .join("");
  }

  function buildTableRows(secretarias) {
    return secretarias
      .map((item) => `
        <tr>
          <td><strong>${item.nome}</strong></td>
          <td>${formatCurrency(item.receita)}</td>
          <td>${formatCurrency(item.despesa)}</td>
          <td>${formatCurrency(item.saldo)}</td>
          <td>${formatPercent(item.execucao, 1)}</td>
          <td><span class="risk-chip ${normalizeRisk(item.risco)}">${getRiskLabel(item.risco)}</span></td>
        </tr>
      `)
      .join("");
  }

  function buildAlerts(secretarias) {
    const critical = secretarias.filter((item) => Number(item.execucao) >= 100 || Number(item.saldo) < 0);

    if (!critical.length) {
      return `
        <article class="alert-card is-success">
          <strong>Nenhum alerta crítico</strong>
          <div>Não foi identificado risco alto na leitura atual.</div>
        </article>
      `;
    }

    return critical
      .map((item) => {
        const isNegative = Number(item.saldo) < 0;
        const isCritical = Number(item.execucao) >= 110 || isNegative;
        const typeClass = isCritical ? "is-danger" : "is-warning";

        return `
          <article class="alert-card ${typeClass}">
            <strong>Alerta: ${item.nome}</strong>
            <div>Execução de ${formatPercent(item.execucao, 1)} e saldo de ${formatCurrency(item.saldo)}.</div>
          </article>
        `;
      })
      .join("");
  }

  function buildInsights(secretarias) {
    const criticas = secretarias.filter((item) => Number(item.execucao) >= 100 || Number(item.saldo) < 0);
    const estaveis = secretarias.filter((item) => Number(item.saldo) >= 0);
    const maiorDespesa = [...secretarias].sort((a, b) => b.despesa - a.despesa)[0];

    const insights = [];

    if (criticas.length) {
      insights.push(
        `Há ${criticas.length} secretaria(s) com execução crítica, exigindo verificação imediata de empenho, liquidação e saldo orçamentário.`
      );
    }

    if (estaveis.length) {
      insights.push(
        `${estaveis.length} secretaria(s) mantêm saldo positivo, o que favorece planejamento preventivo.`
      );
    }

    if (maiorDespesa) {
      insights.push(
        `${maiorDespesa.nome} lidera a despesa consolidada do período, recomendando monitoramento prioritário.`
      );
    }

    insights.push("Sugestão de IA: consolidar relatórios mensais por secretaria e gerar parecer executivo automatizado.");

    return buildList(insights);
  }

  function renderFilter(secretarias) {
    const select = $("#filtroSecretaria");
    if (!select) return;

    const current = select.value || "Todas as Secretarias";
    const options = [
      `<option value="Todas as Secretarias">Todas as Secretarias</option>`,
      ...secretarias.map((item) => `<option value="${item.nome}">${item.nome}</option>`)
    ];

    select.innerHTML = options.join("");
    select.value = current;
  }

  function getFilteredSecretarias(data) {
    const select = $("#filtroSecretaria");
    if (!select || !select.value || select.value === "Todas as Secretarias") {
      return data.secretarias;
    }
    return data.secretarias.filter((item) => item.nome === select.value);
  }

  function renderPanels(data) {
    const filtered = getFilteredSecretarias(data);

    setHtml("[data-monitoramento-secretarias]", buildMonitorCards(filtered));
    setHtml("[data-execucao-secretarias]", buildTableRows(filtered));
    setHtml("[data-alertas]", buildAlerts(filtered));
    setHtml("[data-insights-ia]", buildInsights(filtered));

    renderCharts(filtered);
  }

  function destroyCharts() {
    Object.values(APP.state.charts).forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });
    APP.state.charts = {};
  }

  function chartAvailable() {
    return typeof window.Chart !== "undefined";
  }

  function renderCharts(secretarias) {
    destroyCharts();

    if (!chartAvailable()) {
      return;
    }

    const labels = secretarias.map((item) => item.nome);
    const receitas = secretarias.map((item) => Number(item.receita || 0));
    const despesas = secretarias.map((item) => Number(item.despesa || 0));
    const saldos = secretarias.map((item) => Number(item.saldo || 0));
    const execucoes = secretarias.map((item) => Number(item.execucao || 0));

    const stableCount = secretarias.filter((item) => normalizeRisk(item.risco) === "estavel").length;
    const warnCount = secretarias.filter((item) => normalizeRisk(item.risco) === "atencao").length;
    const riskCount = secretarias.filter((item) => normalizeRisk(item.risco) === "risco").length;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#f3f7ff"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#d7e3ff" },
          grid: { color: "rgba(255,255,255,0.06)" }
        },
        y: {
          ticks: { color: "#d7e3ff" },
          grid: { color: "rgba(255,255,255,0.06)" }
        }
      }
    };

    const ctxReceitaDespesa = $("#chartReceitaDespesa");
    if (ctxReceitaDespesa) {
      APP.state.charts.receitaDespesa = new Chart(ctxReceitaDespesa, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Receita",
              data: receitas,
              backgroundColor: "rgba(84, 199, 255, 0.75)",
              borderColor: "rgba(84, 199, 255, 1)",
              borderWidth: 1
            },
            {
              label: "Despesa",
              data: despesas,
              backgroundColor: "rgba(179, 15, 15, 0.75)",
              borderColor: "rgba(226, 64, 64, 1)",
              borderWidth: 1
            }
          ]
        },
        options: commonOptions
      });
    }

    const ctxSaldo = $("#chartSaldo");
    if (ctxSaldo) {
      APP.state.charts.saldo = new Chart(ctxSaldo, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Saldo",
              data: saldos,
              borderColor: "#39ff5a",
              backgroundColor: "rgba(57, 255, 90, 0.18)",
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: commonOptions
      });
    }

    const ctxExecucao = $("#chartExecucao");
    if (ctxExecucao) {
      APP.state.charts.execucao = new Chart(ctxExecucao, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Execução (%)",
              data: execucoes,
              backgroundColor: execucoes.map((value) => {
                if (value >= 110) return "rgba(226, 64, 64, 0.8)";
                if (value >= 95) return "rgba(216, 184, 71, 0.85)";
                return "rgba(57, 255, 90, 0.75)";
              }),
              borderWidth: 1
            }
          ]
        },
        options: commonOptions
      });
    }

    const ctxRisco = $("#chartRisco");
    if (ctxRisco) {
      APP.state.charts.risco = new Chart(ctxRisco, {
        type: "doughnut",
        data: {
          labels: ["Estável", "Atenção", "Risco alto"],
          datasets: [
            {
              data: [stableCount, warnCount, riskCount],
              backgroundColor: [
                "rgba(57, 255, 90, 0.75)",
                "rgba(216, 184, 71, 0.85)",
                "rgba(226, 64, 64, 0.85)"
              ],
              borderColor: "rgba(3,17,43,0.95)",
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#f3f7ff"
              }
            }
          }
        }
      });
    }
  }

  function renderAdminStatus() {
    const data = APP.state.dados || getStoredData();
    const session = APP.state.sessao || getSession();

    const statusReceitas = data?.resumo?.receitaTotal ? "ativo" : "inativo";
    const statusDespesas = data?.resumo?.despesaTotal ? "ativo" : "inativo";
    const statusServidores = Number.isFinite(Number(data?.resumo?.servidores)) ? "ativo" : "inativo";
    const statusSessao = session ? "ativo" : "inativo";

    const target = $("[data-admin-status]");
    if (!target) return;

    target.innerHTML = `
      <div class="status-stack">
        <article class="status-card">
          <strong>Receitas locais:</strong> ${statusReceitas}
        </article>
        <article class="status-card">
          <strong>Despesas locais:</strong> ${statusDespesas}
        </article>
        <article class="status-card">
          <strong>Servidores locais:</strong> ${statusServidores}
        </article>
        <article class="status-card">
          <strong>Sessão ativa:</strong> ${statusSessao}
        </article>
      </div>
    `;
  }

  function renderSessionIdentity() {
    const session = APP.state.sessao || getSession();
    const target = $("[data-session-label]");

    if (!target) return;

    if (!session) {
      target.textContent = "Acesso institucional";
      return;
    }

    target.textContent = `${session.usuario} • ${session.perfil}`;
  }

  function getPanelRouteByPerfil(perfil) {
    const value = String(perfil || "").toLowerCase();

    if (value.includes("legisl")) return "legislativo.html";
    if (value.includes("control")) return "controle.html";
    if (value.includes("admin")) return "admin.html";
    return "executivo.html";
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    const perfil = $("#perfil");
    const usuario = $("#usuario");
    const senha = $("#senha");

    const perfilValue = perfil ? perfil.value : "Prefeito / Executivo";
    const usuarioValue = usuario ? usuario.value.trim() : "";
    const senhaValue = senha ? senha.value.trim() : "";

    if (!usuarioValue || !senhaValue) {
      window.alert("Preencha usuário e senha.");
      return;
    }

    if (senhaValue !== "1234") {
      window.alert("Senha de teste inválida. Use 1234.");
      return;
    }

    const session = {
      perfil: perfilValue,
      usuario: usuarioValue,
      loginEm: new Date().toISOString()
    };

    saveSession(session);
    window.location.href = getPanelRouteByPerfil(perfilValue);
  }

  function handleLogout(event) {
    if (event) event.preventDefault();
    clearSession();
    window.location.href = "login.html";
  }

  function handleImportData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (loadEvent) {
      const content = String(loadEvent.target?.result || "");
      const parsed = safeParse(content, null);

      if (!parsed) {
        window.alert("Arquivo JSON inválido.");
        event.target.value = "";
        return;
      }

      const shaped = recalcResumo(ensureDataShape(parsed));
      saveData(shaped);
      renderAll();
      window.alert("Base local atualizada com sucesso.");
      event.target.value = "";
    };
    reader.readAsText(file, "utf-8");
  }

  function exportData() {
    const data = APP.state.dados || getStoredData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "executivo-vilabela-mt-dados.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportPrint() {
    window.print();
  }

  function bindMenu() {
    const toggle = $(".menu-toggle");
    const nav = $(".main-nav");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    $all(".main-nav a, .main-nav button", nav).forEach((item) => {
      item.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function bindLogin() {
    const form = $("#loginForm");
    if (form) {
      form.addEventListener("submit", handleLoginSubmit);
    }

    const cancel = $("[data-login-cancel]");
    if (cancel) {
      cancel.addEventListener("click", function () {
        window.location.href = "index.html";
      });
    }
  }

  function bindAdmin() {
    const inputFile = $("#inputJsonDados");
    if (inputFile) {
      inputFile.addEventListener("change", handleImportData);
    }

    const btnExport = $("[data-export-json]");
    if (btnExport) {
      btnExport.addEventListener("click", exportData);
    }

    const btnPrint = $("[data-export-print]");
    if (btnPrint) {
      btnPrint.addEventListener("click", exportPrint);
    }

    const btnClearData = $("[data-clear-data]");
    if (btnClearData) {
      btnClearData.addEventListener("click", function () {
        const ok = window.confirm("Deseja limpar a base local?");
        if (!ok) return;
        clearData();
        saveData(recalcResumo(ensureDataShape(APP.state.dados)));
        renderAll();
      });
    }

    const btnClearSession = $("[data-clear-session]");
    if (btnClearSession) {
      btnClearSession.addEventListener("click", function () {
        const ok = window.confirm("Deseja limpar a sessão local?");
        if (!ok) return;
        clearSession();
        renderAll();
      });
    }
  }

  function bindGlobalActions() {
    $all("[data-logout]").forEach((btn) => {
      btn.addEventListener("click", handleLogout);
    });

    $all("[data-export-relatorio]").forEach((btn) => {
      btn.addEventListener("click", exportPrint);
    });

    const filtro = $("#filtroSecretaria");
    if (filtro) {
      filtro.addEventListener("change", function () {
        renderPanels(APP.state.dados);
      });
    }
  }

  function requireSessionIfNeeded() {
    const body = document.body;
    if (!body) return;

    const requiresSession = body.hasAttribute("data-require-session");
    if (!requiresSession) return;

    const session = APP.state.sessao || getSession();
    if (!session) {
      window.location.href = "login.html";
    }
  }

  function markActiveMenu() {
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    $all("[data-nav]").forEach((item) => {
      const target = String(item.getAttribute("data-nav") || "").toLowerCase();
      if (
        (page === "" && target === "index.html") ||
        target === page
      ) {
        item.classList.add("is-active");
      } else {
        item.classList.remove("is-active");
      }
    });
  }

  function renderAll() {
    APP.state.dados = recalcResumo(ensureDataShape(getStoredData()));
    APP.state.sessao = getSession();

    renderSessionIdentity();
    renderResumo(APP.state.dados);
    renderLeituras(APP.state.dados);
    renderParcerias(APP.state.dados);
    renderFilter(APP.state.dados.secretarias);
    renderPanels(APP.state.dados);
    renderAdminStatus();
    markActiveMenu();
  }

  function init() {
    APP.state.dados = recalcResumo(ensureDataShape(getStoredData()));
    APP.state.sessao = getSession();

    requireSessionIfNeeded();
    bindMenu();
    bindLogin();
    bindAdmin();
    bindGlobalActions();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
