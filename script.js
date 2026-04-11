(function () {
  "use strict";

  const STORAGE_KEYS = {
    session: "executivoSession",
    dataA: "executivoRealData",
    dataB: "dadosExecutivo",
    dataC: "executivo_vilabela_dados"
  };

  const fallbackData = {
    atualizadoEm: "2026-01-31",
    secretarias: [
      { nome: "Administração", receita: 180000, despesa: 120000, saldo: 60000, execucao: 66.7 },
      { nome: "Finanças", receita: 150000, despesa: 98000, saldo: 52000, execucao: 65.3 },
      { nome: "Saúde", receita: 300000, despesa: 345000, saldo: -45000, execucao: 115.0 },
      { nome: "Educação", receita: 330000, despesa: 310000, saldo: 20000, execucao: 93.9 },
      { nome: "Assistência Social", receita: 125000, despesa: 110000, saldo: 15000, execucao: 88.0 },
      { nome: "Obras", receita: 210000, despesa: 295000, saldo: -85000, execucao: 140.5 },
      { nome: "Cultura e Turismo", receita: 62000, despesa: 53000, saldo: 9000, execucao: 85.5 },
      { nome: "Meio Ambiente", receita: 46000, despesa: 47000, saldo: -1000, execucao: 102.2 },
      { nome: "Agricultura", receita: 72000, despesa: 89000, saldo: -17000, execucao: 123.6 },
      { nome: "Planejamento", receita: 428900, despesa: 552900, saldo: -124000, execucao: 128.9 }
    ]
  };

  let charts = [];

  function qs(selector) {
    return document.querySelector(selector);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function getPage() {
    return document.body.dataset.page || "";
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatPercent(value) {
    return `${Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}%`;
  }

  function sum(items, field) {
    return items.reduce((total, item) => total + Number(item[field] || 0), 0);
  }

  function average(items, field) {
    if (!items.length) return 0;
    return sum(items, field) / items.length;
  }

  function riskLevel(item) {
    const execucao = Number(item.execucao || 0);
    const saldo = Number(item.saldo || 0);

    if (execucao > 110 || saldo < 0) return "alert";
    if (execucao >= 95 && execucao <= 110) return "warn";
    return "ok";
  }

  function riskLabel(level) {
    if (level === "alert") return "Risco alto";
    if (level === "warn") return "Atenção";
    return "Estável";
  }

  function loadData() {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEYS.dataA) ||
        localStorage.getItem(STORAGE_KEYS.dataB) ||
        localStorage.getItem(STORAGE_KEYS.dataC);

      if (!raw) return fallbackData;

      const parsed = JSON.parse(raw);

      if (!parsed || !Array.isArray(parsed.secretarias)) {
        return fallbackData;
      }

      return parsed;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      return fallbackData;
    }
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function setSession(session) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  function clearData() {
    localStorage.removeItem(STORAGE_KEYS.dataA);
    localStorage.removeItem(STORAGE_KEYS.dataB);
    localStorage.removeItem(STORAGE_KEYS.dataC);
  }

  function initMenu() {
    const menuToggle = byId("menuToggle");
    const mobileMenu = byId("mobileMenu");

    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

  function applyPerfilFromQuery() {
    const perfilEl = byId("perfil");
    if (!perfilEl) return;

    const params = new URLSearchParams(window.location.search);
    const perfil = params.get("perfil");

    if (perfil && ["executivo", "legislativo", "controle", "admin"].includes(perfil)) {
      perfilEl.value = perfil;
    }
  }

  function updateKPIs(data) {
    const secretarias = data.secretarias || [];
    const receita = sum(secretarias, "receita");
    const despesa = sum(secretarias, "despesa");
    const saldo = sum(secretarias, "saldo");
    const execucao = average(secretarias, "execucao");

    const receitaEl = byId("kpiReceita");
    const despesaEl = byId("kpiDespesa");
    const saldoEl = byId("kpiSaldo");
    const execucaoEl = byId("kpiExecucao");

    if (receitaEl) receitaEl.textContent = formatCurrency(receita);
    if (despesaEl) despesaEl.textContent = formatCurrency(despesa);
    if (saldoEl) saldoEl.textContent = formatCurrency(saldo);
    if (execucaoEl) execucaoEl.textContent = formatPercent(execucao);
  }

  function renderSecretarias(data) {
    const target = byId("listaSecretarias");
    if (!target) return;

    target.innerHTML = "";

    data.secretarias.forEach((item) => {
      const level = riskLevel(item);

      const article = document.createElement("article");
      article.className = "monitor-card";
      article.innerHTML = `
        <h4>${item.nome}</h4>
        <p>Receita: <strong>${formatCurrency(item.receita)}</strong></p>
        <p>Despesa: <strong>${formatCurrency(item.despesa)}</strong></p>
        <p>Saldo: <strong>${formatCurrency(item.saldo)}</strong></p>
        <p>Execução: <strong>${formatPercent(item.execucao)}</strong></p>
        <div class="status-row">
          <span class="badge ${level}">${riskLabel(level)}</span>
        </div>
      `;
      target.appendChild(article);
    });
  }

  function destroyCharts() {
    charts.forEach((chart) => {
      if (chart) chart.destroy();
    });
    charts = [];
  }

  function createCharts(data) {
    if (typeof Chart === "undefined") return;

    destroyCharts();

    const labels = data.secretarias.map((item) => item.nome);
    const receitas = data.secretarias.map((item) => Number(item.receita || 0));
    const despesas = data.secretarias.map((item) => Number(item.despesa || 0));
    const saldos = data.secretarias.map((item) => Number(item.saldo || 0));
    const execucoes = data.secretarias.map((item) => Number(item.execucao || 0));
    const riscos = data.secretarias.map((item) => {
      const level = riskLevel(item);
      if (level === "alert") return 3;
      if (level === "warn") return 2;
      return 1;
    });

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#dbe7ff"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#c6d4ea" },
          grid: { color: "rgba(255,255,255,.05)" }
        },
        y: {
          ticks: { color: "#c6d4ea" },
          grid: { color: "rgba(255,255,255,.05)" }
        }
      }
    };

    const c1 = byId("chartReceitaDespesa");
    if (c1) {
      charts.push(new Chart(c1, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Receita",
              data: receitas,
              backgroundColor: "rgba(54, 220, 255, 0.78)",
              borderColor: "rgba(54, 220, 255, 1)",
              borderWidth: 1,
              borderRadius: 8
            },
            {
              label: "Despesa",
              data: despesas,
              backgroundColor: "rgba(213, 53, 40, 0.82)",
              borderColor: "rgba(213, 53, 40, 1)",
              borderWidth: 1,
              borderRadius: 8
            }
          ]
        },
        options: commonOptions
      }));
    }

    const c2 = byId("chartSaldo");
    if (c2) {
      charts.push(new Chart(c2, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Saldo",
              data: saldos,
              borderColor: "rgba(80,255,120,1)",
              backgroundColor: "rgba(80,255,120,.16)",
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointRadius: 4,
              pointBackgroundColor: "#80ff98"
            }
          ]
        },
        options: commonOptions
      }));
    }

    const c3 = byId("chartExecucao");
    if (c3) {
      charts.push(new Chart(c3, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Execução (%)",
              data: execucoes,
              backgroundColor: execucoes.map((value) =>
                value > 110
                  ? "rgba(255, 98, 84, 0.85)"
                  : value >= 95
                  ? "rgba(255, 211, 92, 0.82)"
                  : "rgba(57,255,79,.74)"
              ),
              borderWidth: 1,
              borderRadius: 8
            }
          ]
        },
        options: commonOptions
      }));
    }

    const c4 = byId("chartRisco");
    if (c4) {
      const riscoCount = [
        riscos.filter((r) => r === 1).length,
        riscos.filter((r) => r === 2).length,
        riscos.filter((r) => r === 3).length
      ];

      charts.push(new Chart(c4, {
        type: "doughnut",
        data: {
          labels: ["Estável", "Atenção", "Risco alto"],
          datasets: [{
            data: riscoCount,
            backgroundColor: [
              "rgba(57,255,79,.76)",
              "rgba(255,211,92,.82)",
              "rgba(255,98,84,.88)"
            ],
            borderColor: [
              "rgba(57,255,79,1)",
              "rgba(255,211,92,1)",
              "rgba(255,98,84,1)"
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#dbe7ff"
              }
            }
          }
        }
      }));
    }
  }

  function initHome() {
    const data = loadData();
    updateKPIs(data);
    renderSecretarias(data);
    createCharts(data);
  }

  function initLogin() {
    applyPerfilFromQuery();

    const form = byId("loginForm");
    const msg = byId("loginMensagem");

    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const perfil = byId("perfil").value;
      const usuario = byId("usuario").value.trim();
      const senha = byId("senha").value.trim();

      if (!senha) {
        if (msg) msg.textContent = "Informe a senha.";
        return;
      }

      if (senha !== "1234") {
        if (msg) msg.textContent = "Senha inválida. Use 1234 para testes.";
        return;
      }

      const session = {
        perfil,
        usuario: usuario || "Usuário",
        autenticado: true,
        em: new Date().toISOString()
      };

      setSession(session);

      if (perfil === "admin") {
        window.location.href = "admin.html";
        return;
      }

      window.location.href = "index.html";
    });
  }

  function initAdmin() {
    const statusGrid = byId("adminStatusGrid");
    const msg = byId("adminMensagem");
    const session = getSession();

    if (statusGrid) {
      const dataA = !!localStorage.getItem(STORAGE_KEYS.dataA);
      const dataB = !!localStorage.getItem(STORAGE_KEYS.dataB);
      const dataC = !!localStorage.getItem(STORAGE_KEYS.dataC);

      statusGrid.innerHTML = `
        <div class="status-item"><strong>Receitas locais:</strong> ${dataA || dataB || dataC ? "ativo" : "inativo"}</div>
        <div class="status-item"><strong>Despesas locais:</strong> ${dataA || dataB || dataC ? "ativo" : "inativo"}</div>
        <div class="status-item"><strong>Servidores locais:</strong> ${dataA || dataB || dataC ? "ativo" : "inativo"}</div>
        <div class="status-item"><strong>Sessão ativa:</strong> ${session ? "ativo" : "inativo"}</div>
      `;
    }

    const btnLimparBase = byId("btnLimparBase");
    const btnLimparSessao = byId("btnLimparSessao");
    const logoutLink = byId("logoutLink");

    if (btnLimparBase) {
      btnLimparBase.addEventListener("click", () => {
        clearData();
        if (msg) msg.textContent = "Base local removida com sucesso.";
        setTimeout(() => window.location.reload(), 500);
      });
    }

    if (btnLimparSessao) {
      btnLimparSessao.addEventListener("click", () => {
        clearSession();
        if (msg) msg.textContent = "Sessão removida com sucesso.";
        setTimeout(() => window.location.reload(), 500);
      });
    }

    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        clearSession();
        window.location.href = "login.html";
      });
    }
  }

  function boot() {
    initMenu();

    const page = getPage();

    if (page === "home") initHome();
    if (page === "login") initLogin();
    if (page === "admin") initAdmin();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
