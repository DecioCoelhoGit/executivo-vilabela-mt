(function () {
  "use strict";

  const STORAGE_THEME_KEY = "evbmt-theme";
  const STORAGE_SESSION_KEY = "evbmt-session";
  const STORAGE_UPDATED_AT_KEY = "evbmt-updated-at";

  const body = document.body;
  const page = body?.dataset?.page || "";

  const dadosBase = [
    { nome: "Administração", receita: 180000, despesa: 120000 },
    { nome: "Finanças", receita: 150000, despesa: 98000 },
    { nome: "Saúde", receita: 300000, despesa: 345000 },
    { nome: "Educação", receita: 330000, despesa: 310000 },
    { nome: "Assistência Social", receita: 125000, despesa: 110000 },
    { nome: "Obras", receita: 210000, despesa: 295000 },
    { nome: "Cultura", receita: 32000, despesa: 26000 },
    { nome: "Turismo", receita: 30000, despesa: 27000 },
    { nome: "Meio Ambiente", receita: 46000, despesa: 47000 },
    { nome: "Agricultura", receita: 72000, despesa: 89000 },
    { nome: "Planejamento", receita: 428900, despesa: 552900 }
  ];

  function enrichData(item) {
    const saldo = item.receita - item.despesa;
    const execucao = item.receita > 0 ? (item.despesa / item.receita) * 100 : 0;

    let status = "Estável";
    if (saldo < 0 || execucao > 100) status = "Risco alto";
    else if (execucao >= 95) status = "Atenção";

    return { ...item, saldo, execucao, status };
  }

  const dataset = dadosBase.map(enrichData);

  function formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  function formatPercent(value) {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }) + "%";
  }

  function formatDate(value) {
    if (!value) return "--";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "--";
    return d.toLocaleString("pt-BR");
  }

  function safeParse(value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function getTheme() {
    return localStorage.getItem(STORAGE_THEME_KEY) || "dark";
  }

  function applyTheme(theme) {
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }

  function toggleTheme() {
    const current = getTheme();
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);

    setTimeout(() => {
      destroyPageCharts();
      initPageCharts();
    }, 120);
  }

  function initThemeButtons() {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
    applyTheme(getTheme());
  }

  function setUpdatedAt() {
    localStorage.setItem(STORAGE_UPDATED_AT_KEY, new Date().toISOString());
  }

  function renderSessionInfo() {
    const session = safeParse(localStorage.getItem(STORAGE_SESSION_KEY));
    const updatedAt = localStorage.getItem(STORAGE_UPDATED_AT_KEY);

    const sessionTargets = document.querySelectorAll("[data-session-user]");
    sessionTargets.forEach((el) => {
      el.textContent = session?.username ? `Sessão: ${session.username}` : "Sem sessão ativa";
    });

    const perfilTargets = document.querySelectorAll("[data-session-profile]");
    perfilTargets.forEach((el) => {
      el.textContent = session?.profile || "--";
    });

    const statusTargets = document.querySelectorAll("[data-session-status]");
    statusTargets.forEach((el) => {
      el.textContent = session ? "ativa" : "inativa";
    });

    const updatedTargets = document.querySelectorAll("[data-updated-at]");
    updatedTargets.forEach((el) => {
      el.textContent = formatDate(updatedAt);
    });
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const drawer = document.querySelector("[data-menu-drawer]");
    const overlay = document.querySelector("[data-menu-overlay]");

    if (!toggle || !drawer || !overlay) return;

    function openMenu() {
      drawer.classList.add("active");
      overlay.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
      const isOpen = drawer.classList.contains("active");
      if (isOpen) closeMenu();
      else openMenu();
    });

    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  function initHolograms() {
    const hologramImages = document.querySelectorAll("[data-hologram-img]");

    hologramImages.forEach((img) => {
      img.addEventListener("load", () => {
        img.classList.add("is-loaded");
      });

      img.addEventListener("error", () => {
        img.classList.add("is-error");
        const parent = img.closest(".image-card, .hologram-card, .card");
        if (!parent) return;

        if (!parent.querySelector(".image-fallback")) {
          const fallback = document.createElement("div");
          fallback.className = "image-fallback";
          fallback.textContent = "Imagem holográfica indisponível.";
          parent.appendChild(fallback);
        }
      });

      if (img.complete && img.naturalWidth > 0) {
        img.classList.add("is-loaded");
      }
    });
  }

  function chartTextColor() {
    return body.classList.contains("theme-light") ? "#1a2740" : "#d8e2f2";
  }

  function chartGridColor() {
    return body.classList.contains("theme-light")
      ? "rgba(20,40,70,0.12)"
      : "rgba(255,255,255,0.08)";
  }

  function chartPalette() {
    return body.classList.contains("theme-light")
      ? {
          green: "rgba(0, 140, 70, 0.78)",
          blue: "rgba(40, 110, 220, 0.75)",
          red: "rgba(200, 70, 70, 0.75)",
          yellow: "rgba(190, 150, 20, 0.75)",
          teal: "rgba(0, 150, 140, 0.75)",
          purple: "rgba(120, 90, 210, 0.75)"
        }
      : {
          green: "rgba(85, 255, 140, 0.78)",
          blue: "rgba(80, 160, 255, 0.75)",
          red: "rgba(255, 110, 110, 0.75)",
          yellow: "rgba(255, 210, 90, 0.75)",
          teal: "rgba(90, 255, 220, 0.75)",
          purple: "rgba(180, 120, 255, 0.75)"
        };
  }

  function baseChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 700
      },
      plugins: {
        legend: {
          labels: {
            color: chartTextColor()
          }
        }
      },
      scales: {
        x: {
          ticks: { color: chartTextColor() },
          grid: { color: chartGridColor() }
        },
        y: {
          ticks: { color: chartTextColor() },
          grid: { color: chartGridColor() }
        }
      }
    };
  }

  function labelsFrom(data) {
    return data.map((item) => item.nome);
  }

  function destroyChartById(canvasId) {
    if (typeof Chart === "undefined") return;
    const chart = Chart.getChart(canvasId);
    if (chart) chart.destroy();
  }

  function destroyPageCharts() {
    [
      "chartExecutivoReceitaDespesa",
      "chartExecutivoSaldo",
      "chartExecutivoExecucao",
      "chartExecutivoRisco",
      "chartLegislativoExecucao",
      "chartLegislativoCriticas",
      "chartLegislativoSaldo",
      "chartLegislativoRanking",
      "chartControleCriticidade",
      "chartControleExecucao",
      "chartControleSaldoNegativo",
      "chartControleStatus"
    ].forEach(destroyChartById);
  }

  function waitForCanvas(canvasId, callback, retries = 12) {
    const canvas = document.getElementById(canvasId);

    if (canvas && canvas.offsetWidth > 0) {
      callback(canvas);
      return;
    }

    if (retries <= 0) {
      console.warn(`Canvas não disponível: ${canvasId}`);
      return;
    }

    setTimeout(() => waitForCanvas(canvasId, callback, retries - 1), 180);
  }

  function initExecutivoCharts(data = dataset) {
    if (typeof Chart === "undefined") return;

    const palette = chartPalette();
    const labels = labelsFrom(data);

    waitForCanvas("chartExecutivoReceitaDespesa", (canvas) => {
      destroyChartById("chartExecutivoReceitaDespesa");
      new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Receita",
              data: data.map((i) => i.receita),
              backgroundColor: palette.green
            },
            {
              label: "Despesa",
              data: data.map((i) => i.despesa),
              backgroundColor: palette.red
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartExecutivoSaldo", (canvas) => {
      destroyChartById("chartExecutivoSaldo");
      new Chart(canvas, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Saldo",
              data: data.map((i) => i.saldo),
              borderColor: palette.yellow,
              backgroundColor: palette.yellow,
              fill: false,
              tension: 0.3
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartExecutivoExecucao", (canvas) => {
      destroyChartById("chartExecutivoExecucao");
      new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Execução %",
              data: data.map((i) => Number(i.execucao.toFixed(1))),
              backgroundColor: palette.blue
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartExecutivoRisco", (canvas) => {
      destroyChartById("chartExecutivoRisco");
      new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: ["Risco alto", "Atenção", "Estável"],
          datasets: [
            {
              data: [
                data.filter((i) => i.status === "Risco alto").length,
                data.filter((i) => i.status === "Atenção").length,
                data.filter((i) => i.status === "Estável").length
              ],
              backgroundColor: [palette.red, palette.yellow, palette.green]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: chartTextColor() }
            }
          }
        }
      });
    });
  }

  function initLegislativoCharts() {
    if (typeof Chart === "undefined") return;

    const palette = chartPalette();
    const labels = labelsFrom(dataset);

    waitForCanvas("chartLegislativoExecucao", (canvas) => {
      destroyChartById("chartLegislativoExecucao");
      new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Execução %",
              data: dataset.map((i) => Number(i.execucao.toFixed(1))),
              backgroundColor: palette.green
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartLegislativoCriticas", (canvas) => {
      destroyChartById("chartLegislativoCriticas");
      new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Criticidade",
              data: dataset.map((i) => (i.status === "Risco alto" ? 1 : 0)),
              backgroundColor: palette.red
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartLegislativoSaldo", (canvas) => {
      destroyChartById("chartLegislativoSaldo");
      new Chart(canvas, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Saldo",
              data: dataset.map((i) => i.saldo),
              borderColor: palette.yellow,
              backgroundColor: palette.yellow,
              fill: false,
              tension: 0.28
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartLegislativoRanking", (canvas) => {
      destroyChartById("chartLegislativoRanking");
      const ranking = [...dataset].sort((a, b) => b.execucao - a.execucao);

      new Chart(canvas, {
        type: "bar",
        data: {
          labels: ranking.map((i) => i.nome),
          datasets: [
            {
              label: "Ranking de atenção",
              data: ranking.map((i) => Number(i.execucao.toFixed(1))),
              backgroundColor: palette.purple
            }
          ]
        },
        options: baseChartOptions()
      });
    });
  }

  function initControleCharts() {
    if (typeof Chart === "undefined") return;

    const palette = chartPalette();

    waitForCanvas("chartControleCriticidade", (canvas) => {
      destroyChartById("chartControleCriticidade");
      new Chart(canvas, {
        type: "bar",
        data: {
          labels: labelsFrom(dataset),
          datasets: [
            {
              label: "Criticidade",
              data: dataset.map((i) => {
                if (i.status === "Risco alto") return 3;
                if (i.status === "Atenção") return 2;
                return 1;
              }),
              backgroundColor: palette.red
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartControleExecucao", (canvas) => {
      destroyChartById("chartControleExecucao");
      const acima100 = dataset.filter((i) => i.execucao > 100);

      new Chart(canvas, {
        type: "bar",
        data: {
          labels: acima100.map((i) => i.nome),
          datasets: [
            {
              label: "Execução acima de 100%",
              data: acima100.map((i) => Number(i.execucao.toFixed(1))),
              backgroundColor: palette.yellow
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartControleSaldoNegativo", (canvas) => {
      destroyChartById("chartControleSaldoNegativo");
      const negativos = dataset.filter((i) => i.saldo < 0);

      new Chart(canvas, {
        type: "bar",
        data: {
          labels: negativos.map((i) => i.nome),
          datasets: [
            {
              label: "Saldo negativo",
              data: negativos.map((i) => i.saldo),
              backgroundColor: palette.blue
            }
          ]
        },
        options: baseChartOptions()
      });
    });

    waitForCanvas("chartControleStatus", (canvas) => {
      destroyChartById("chartControleStatus");
      new Chart(canvas, {
        type: "pie",
        data: {
          labels: ["Risco alto", "Atenção", "Estável"],
          datasets: [
            {
              data: [
                dataset.filter((i) => i.status === "Risco alto").length,
                dataset.filter((i) => i.status === "Atenção").length,
                dataset.filter((i) => i.status === "Estável").length
              ],
              backgroundColor: [palette.red, palette.yellow, palette.green]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: chartTextColor() }
            }
          }
        }
      });
    });
  }

  function renderExecutivoData() {
    const filtro = document.getElementById("filtroSecretaria");
    const tbody = document.getElementById("tabelaExecutivo");
    const kpiReceita = document.getElementById("kpiReceita");
    const kpiDespesa = document.getElementById("kpiDespesa");
    const kpiSaldo = document.getElementById("kpiSaldo");
    const kpiExecucao = document.getElementById("kpiExecucao");
    const resumo = document.getElementById("resumoExecutivo");
    const alertas = document.getElementById("listaAlertas");
    const insights = document.getElementById("insightsIA");
    const btnExportar = document.getElementById("btnExportar");

    if (!tbody) return;

    if (filtro && filtro.options.length <= 1) {
      dataset.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.nome;
        option.textContent = item.nome;
        filtro.appendChild(option);
      });
    }

    function getFiltered() {
      const value = filtro?.value || "todas";
      if (value === "todas") return dataset;
      return dataset.filter((item) => item.nome === value);
    }

    function statusClass(status) {
      if (status === "Risco alto") return "status-critical";
      if (status === "Atenção") return "status-warning";
      return "status-stable";
    }

    function render() {
      const data = getFiltered();

      const receita = data.reduce((sum, i) => sum + i.receita, 0);
      const despesa = data.reduce((sum, i) => sum + i.despesa, 0);
      const saldo = receita - despesa;
      const mediaExecucao = data.length
        ? data.reduce((sum, i) => sum + i.execucao, 0) / data.length
        : 0;

      if (kpiReceita) kpiReceita.textContent = formatMoney(receita);
      if (kpiDespesa) kpiDespesa.textContent = formatMoney(despesa);
      if (kpiSaldo) kpiSaldo.textContent = formatMoney(saldo);
      if (kpiExecucao) kpiExecucao.textContent = formatPercent(mediaExecucao);

      tbody.innerHTML = "";
      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td data-label="Secretaria">${item.nome}</td>
          <td data-label="Receita">${formatMoney(item.receita)}</td>
          <td data-label="Despesa">${formatMoney(item.despesa)}</td>
          <td data-label="Saldo">${formatMoney(item.saldo)}</td>
          <td data-label="Execução">${formatPercent(item.execucao)}</td>
          <td data-label="Status"><span class="status-badge ${statusClass(item.status)}">${item.status}</span></td>
        `;
        tbody.appendChild(tr);
      });

      if (resumo) {
        resumo.innerHTML = `
          <div class="info-item">Receita consolidada: ${formatMoney(receita)}.</div>
          <div class="info-item">Despesa consolidada: ${formatMoney(despesa)}.</div>
          <div class="info-item">Saldo apurado: ${formatMoney(saldo)}.</div>
          <div class="info-item">Leitura média de execução: ${formatPercent(mediaExecucao)}.</div>
        `;
      }

      if (alertas) {
        const criticos = data.filter((i) => i.status === "Risco alto");
        alertas.innerHTML = criticos.length
          ? criticos
              .map(
                (i) =>
                  `<div class="info-item">Alerta: ${i.nome} com execução de ${formatPercent(i.execucao)} e saldo de ${formatMoney(i.saldo)}.</div>`
              )
              .join("")
          : `<div class="info-item">Nenhuma criticidade relevante na leitura atual.</div>`;
      }

      if (insights) {
        const negativos = data.filter((i) => i.saldo < 0).length;
        insights.innerHTML = `
          <div class="info-item">Há ${negativos} secretaria(s) com saldo negativo na leitura atual.</div>
          <div class="info-item">A IA recomenda acompanhamento reforçado das áreas críticas.</div>
          <div class="info-item">Sugestão: consolidar relatório mensal automatizado por secretaria.</div>
        `;
      }

      destroyPageCharts();
      setTimeout(() => initExecutivoCharts(data), 120);
    }

    if (filtro) filtro.addEventListener("change", render);
    if (btnExportar) btnExportar.addEventListener("click", () => window.print());

    render();
  }

  function initAdminPage() {
    const limparBase = document.getElementById("limparBaseLocal");
    const limparSessao = document.getElementById("limparSessao");
    const adminMensagem = document.getElementById("adminMensagem");

    function msg(text) {
      if (!adminMensagem) return;
      adminMensagem.textContent = text;
      adminMensagem.className = "status-message success";
    }

    if (limparBase) {
      limparBase.addEventListener("click", () => {
        [
          "evbmt-receitas",
          "evbmt-despesas",
          "evbmt-servidores",
          STORAGE_UPDATED_AT_KEY
        ].forEach((key) => localStorage.removeItem(key));
        msg("Base local removida com sucesso.");
        renderSessionInfo();
      });
    }

    if (limparSessao) {
      limparSessao.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        msg("Sessão removida com sucesso.");
        renderSessionInfo();
      });
    }
  }

  function initPageCharts() {
    if (page === "executivo") initExecutivoCharts();
    if (page === "legislativo") initLegislativoCharts();
    if (page === "controle") initControleCharts();
  }

  function initPageModules() {
    if (page === "executivo") renderExecutivoData();
    if (page === "admin") initAdminPage();

    const btnExportar = document.getElementById("btnExportar");
    if (btnExportar && page !== "executivo") {
      btnExportar.addEventListener("click", () => window.print());
    }
  }

  function seedBase() {
    if (!localStorage.getItem(STORAGE_UPDATED_AT_KEY)) {
      setUpdatedAt();
    }
  }

  window.addEventListener("load", () => {
    initThemeButtons();
    initMenu();
    initHolograms();
    renderSessionInfo();
    seedBase();
    initPageModules();

    setTimeout(() => {
      initPageCharts();
    }, 220);
  });

  window.addEventListener("resize", () => {
    clearTimeout(window.__evbmtResizeTimer);
    window.__evbmtResizeTimer = setTimeout(() => {
      destroyPageCharts();
      initPageCharts();
    }, 220);
  });
})();
