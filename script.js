const BASE_PATH = "/executivo-vilabela-mt";

let charts = {
  receitaDespesa: null,
  saldo: null,
  execucao: null,
  risco: null
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

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Erro ao carregar ${path}`);
  }
  return response.json();
}

function riscoClass(risco) {
  const r = String(risco || "").toLowerCase();
  if (r === "alto") return "risk-high";
  if (r === "medio" || r === "médio") return "risk-mid";
  return "risk-low";
}

function riscoTexto(risco) {
  const r = String(risco || "").toLowerCase();
  if (r === "alto") return "ALTO";
  if (r === "medio" || r === "médio") return "MÉDIO";
  return "BAIXO";
}

function destroyCharts() {
  if (charts.receitaDespesa) charts.receitaDespesa.destroy();
  if (charts.saldo) charts.saldo.destroy();
  if (charts.execucao) charts.execucao.destroy();
  if (charts.risco) charts.risco.destroy();
}

function buildSecretariasFromIndicadores(indicadores) {
  if (!indicadores || !Array.isArray(indicadores.secretarias)) return [];

  return indicadores.secretarias.map((item) => {
    const receita = toNumber(item.receita_arrecadada || item.receita || 0);
    const despesaEmpenhada = toNumber(item.despesa_empenhada || 0);
    const despesaLiquidada = toNumber(item.despesa_liquidada || 0);
    const despesaPaga = toNumber(item.despesa_paga || item.despesa || 0);
    const saldo = toNumber(item.saldo_apurado || item.saldo || receita - despesaPaga);
    const execucao = toNumber(
      item.execucao_percentual ||
      item.execucao_media_percentual ||
      (receita > 0 ? (despesaPaga / receita) * 100 : 0)
    );

    return {
      secretaria: item.nome || item.secretaria || "Não informado",
      receita_arrecadada: receita,
      despesa_empenhada: despesaEmpenhada,
      despesa_liquidada: despesaLiquidada,
      despesa_paga: despesaPaga,
      saldo,
      execucao,
      risco: item.risco || "baixo",
      alerta: item.alerta || "sem informação",
      observacao: item.observacao || "sem observação",
      meta_execucao_percentual: toNumber(item.meta_execucao_percentual || 0)
    };
  });
}

function renderQuickKpis(painelGeral) {
  const target = document.getElementById("home-kpis");
  if (!target || !painelGeral) return;

  target.innerHTML = `
    <div class="quick-kpi">
      <div class="label">Receita total</div>
      <div class="value">${currencyBRL(painelGeral.receita_total)}</div>
      <div class="sub">Arrecadação consolidada do período</div>
    </div>

    <div class="quick-kpi">
      <div class="label">Despesa paga</div>
      <div class="value">${currencyBRL(painelGeral.despesa_paga_total)}</div>
      <div class="sub">Execução financeira registrada</div>
    </div>

    <div class="quick-kpi">
      <div class="label">Saldo apurado</div>
      <div class="value">${currencyBRL(painelGeral.saldo_apurado)}</div>
      <div class="sub">
        ${toNumber(painelGeral.saldo_apurado) >= 0 ? "Situação positiva" : "Pressão orçamentária"}
      </div>
    </div>

    <div class="quick-kpi">
      <div class="label">Execução média</div>
      <div class="value">${numberBR(painelGeral.execucao_media_percentual, 2)}%</div>
      <div class="sub">Leitura institucional do período</div>
    </div>
  `;
}

function renderRiskStrip(secretarias) {
  const target = document.getElementById("risk-strip");
  if (!target) return;

  const ordered = [...secretarias]
    .sort((a, b) => {
      const peso = { alto: 3, medio: 2, médio: 2, baixo: 1 };
      const pa = peso[String(a.risco).toLowerCase()] || 0;
      const pb = peso[String(b.risco).toLowerCase()] || 0;
      if (pb !== pa) return pb - pa;
      return (b.execucao || 0) - (a.execucao || 0);
    })
    .slice(0, 4);

  target.innerHTML = ordered.map((item) => `
    <div class="risk-item">
      <div>
        <div class="risk-name">${item.secretaria}</div>
        <div class="risk-note">${item.alerta} • Execução: ${numberBR(item.execucao, 1)}%</div>
      </div>
      <span class="risk-badge ${riscoClass(item.risco)}">${riscoTexto(item.risco)}</span>
    </div>
  `).join("");
}

function renderCharts(secretarias) {
  if (typeof Chart === "undefined") return;

  const c1 = document.getElementById("chartReceitaDespesa");
  const c2 = document.getElementById("chartSaldo");
  const c3 = document.getElementById("chartExecucao");
  const c4 = document.getElementById("chartRisco");

  if (!c1 || !c2 || !c3 || !c4) return;

  destroyCharts();

  const labels = secretarias.map((s) => s.secretaria);
  const receitas = secretarias.map((s) => s.receita_arrecadada);
  const despesas = secretarias.map((s) => s.despesa_paga);
  const saldos = secretarias.map((s) => s.saldo);
  const execucoes = secretarias.map((s) => Number((s.execucao || 0).toFixed(2)));

  const riscos = { alto: 0, medio: 0, baixo: 0 };
  secretarias.forEach((s) => {
    const r = String(s.risco || "").toLowerCase();
    if (r === "alto") riscos.alto += 1;
    else if (r === "medio" || r === "médio") riscos.medio += 1;
    else riscos.baixo += 1;
  });

  charts.receitaDespesa = new Chart(c1, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Receita", data: receitas },
        { label: "Despesa paga", data: despesas }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  charts.saldo = new Chart(c2, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Saldo", data: saldos }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  charts.execucao = new Chart(c3, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Execução %", data: execucoes, fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  charts.risco = new Chart(c4, {
    type: "doughnut",
    data: {
      labels: ["Risco alto", "Risco médio", "Risco baixo"],
      datasets: [
        {
          data: [riscos.alto, riscos.medio, riscos.baixo]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function setupMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

async function initHome() {
  if (document.body.dataset.page !== "home") return;

  try {
    const indicadores = await loadJSON(`${BASE_PATH}/dados/indicadores.json`);
    const painelGeral = indicadores.painel_geral || {};
    const secretarias = buildSecretariasFromIndicadores(indicadores);

    renderQuickKpis({
      receita_total: toNumber(painelGeral.receita_total || 0),
      despesa_paga_total: toNumber(painelGeral.despesa_paga_total || 0),
      saldo_apurado: toNumber(painelGeral.saldo_apurado || 0),
      execucao_media_percentual: toNumber(painelGeral.execucao_media_percentual || 0)
    });

    renderRiskStrip(secretarias);
    renderCharts(secretarias);
  } catch (error) {
    console.error("Erro ao carregar HOME:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupMenu();
  await initHome();
});
