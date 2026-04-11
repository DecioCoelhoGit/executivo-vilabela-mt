(function () {
  "use strict";

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  }

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

  function loadRealData() {
    try {
      const raw =
        localStorage.getItem("executivoRealData") ||
        localStorage.getItem("dadosExecutivo") ||
        localStorage.getItem("executivo_vilabela_dados");

      if (!raw) return fallbackData;

      const parsed = JSON.parse(raw);

      if (!parsed || !Array.isArray(parsed.secretarias)) {
        return fallbackData;
      }

      return parsed;
    } catch (error) {
      console.error("Falha ao ler dados locais:", error);
      return fallbackData;
    }
  }

  function currencyBRL(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function percentBR(value) {
    return `${Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}%`;
  }

  function sum(items, field) {
    return items.reduce((acc, item) => acc + Number(item[field] || 0), 0);
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

  function updateKPIs(data) {
    const secretarias = data.secretarias || [];
    const receitaTotal = sum(secretarias, "receita");
    const despesaTotal = sum(secretarias, "despesa");
    const saldoTotal = sum(secretarias, "saldo");
    const execucaoMedia = average(secretarias, "execucao");

    const receitaEl = document.getElementById("kpiReceita");
    const despesaEl = document.getElementById("kpiDespesa");
    const saldoEl = document.getElementById("kpiSaldo");
    const execucaoEl = document.getElementById("kpiExecucao");

    if (receitaEl) receitaEl.textContent = currencyBRL(receitaTotal);
    if (despesaEl) despesaEl.textContent = currencyBRL(despesaTotal);
    if (saldoEl) saldoEl.textContent = currencyBRL(saldoTotal);
    if (execucaoEl) execucaoEl.textContent = percentBR(execucaoMedia);
  }

  function renderSecretarias(data) {
    const target = document.getElementById("listaSecretarias");
    if (!target) return;

    target.innerHTML = "";

    data.secretarias.forEach((item) => {
      const level = riskLevel(item);

      const article = document.createElement("article");
      article.className = "monitor-card";

      article.innerHTML = `
        <h4>${item.nome}</h4>
        <p>Receita: <strong>${currencyBRL(item.receita)}</strong></p>
        <p>Despesa: <strong>${currencyBRL(item.despesa)}</strong></p>
        <p>Saldo: <strong>${currencyBRL(item.saldo)}</strong></p>
        <p>Execução: <strong>${percentBR(item.execucao)}</strong></p>
        <div class="status-row">
          <span class="badge ${level}">${riskLabel(level)}</span>
        </div>
      `;

      target.appendChild(article);
    });
  }

  let charts = [];

  function destroyCharts() {
    charts.forEach((chart) => {
      if (chart) chart.destroy();
    });
    charts = [];
  }

  function createCharts(data) {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js não carregado.");
      return;
    }

    destroyCharts();

    const labels = data.secretarias.map((s) => s.nome);
    const receitas = data.secretarias.map((s) => Number(s.receita || 0));
    const despesas = data.secretarias.map((s) => Number(s.despesa || 0));
    const saldos = data.secretarias.map((s) => Number(s.saldo || 0));
    const execucoes = data.secretarias.map((s) => Number(s.execucao || 0));
    const riscos = data.secretarias.map((s) => {
      const level = riskLevel(s);
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

    const receitaDespesaCtx = document.getElementById("chartReceitaDespesa");
    if (receitaDespesaCtx) {
      charts.push(new Chart(receitaDespesaCtx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Receita",
              data: receitas,
              backgroundColor: "rgba(54, 220, 255, 0.75)",
              borderColor: "rgba(54, 220, 255, 1)",
              borderWidth: 1,
              borderRadius: 8
            },
            {
              label: "Despesa",
              data: despesas,
              backgroundColor: "rgba(213, 53, 40, 0.78)",
              borderColor: "rgba(213, 53, 40, 1)",
              borderWidth: 1,
              borderRadius: 8
            }
          ]
        },
        options: commonOptions
      }));
    }

    const saldoCtx = document.getElementById("chartSaldo");
    if (saldoCtx) {
      charts.push(new Chart(saldoCtx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Saldo",
              data: saldos,
              borderColor: "rgba(80, 255, 120, 1)",
              backgroundColor: "rgba(80, 255, 120, 0.16)",
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

    const execucaoCtx = document.getElementById("chartExecucao");
    if (execucaoCtx) {
      charts.push(new Chart(execucaoCtx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Execução (%)",
              data: execucoes,
              backgroundColor: execucoes.map((value) =>
                value > 110
                  ? "rgba(255, 98, 84, 0.82)"
                  : value >= 95
                  ? "rgba(255, 211, 92, 0.80)"
                  : "rgba(57, 255, 79, 0.72)"
              ),
              borderWidth: 1,
              borderRadius: 8
            }
          ]
        },
        options: commonOptions
      }));
    }

    const riscoCtx = document.getElementById("chartRisco");
    if (riscoCtx) {
      const riscoLabels = ["Estável", "Atenção", "Risco alto"];
      const riscoCount = [
        riscos.filter((r) => r === 1).length,
        riscos.filter((r) => r === 2).length,
        riscos.filter((r) => r === 3).length
      ];

      charts.push(new Chart(riscoCtx, {
        type: "doughnut",
        data: {
          labels: riscoLabels,
          datasets: [
            {
              data: riscoCount,
              backgroundColor: [
                "rgba(57,255,79,.75)",
                "rgba(255,211,92,.82)",
                "rgba(255,98,84,.86)"
              ],
              borderColor: [
                "rgba(57,255,79,1)",
                "rgba(255,211,92,1)",
                "rgba(255,98,84,1)"
              ],
              borderWidth: 1
            }
          ]
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

  function init() {
    const data = loadRealData();
    updateKPIs(data);
    renderSecretarias(data);
    createCharts(data);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
