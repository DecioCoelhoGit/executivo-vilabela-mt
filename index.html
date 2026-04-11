(() => {
  "use strict";

  const STORAGE_KEYS = {
    session: "executivoSession"
  };

  const DATA = {
    atualizadoEm: "2026-01-31",
    servidores: 10,
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

  const $ = (id) => document.getElementById(id);
  const page = document.body.dataset.page || "";

  function brl(v) {
    return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function pct(v) {
    return `${Number(v || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    })}%`;
  }

  function total(field) {
    return DATA.secretarias.reduce((s, item) => s + Number(item[field] || 0), 0);
  }

  function avg(field) {
    return total(field) / DATA.secretarias.length;
  }

  function risk(item) {
    if (item.execucao > 110 || item.saldo < 0) return "alert";
    if (item.execucao >= 95) return "warn";
    return "ok";
  }

  function riskLabel(level) {
    if (level === "alert") return "Risco alto";
    if (level === "warn") return "Atenção";
    return "Estável";
  }

  function initMenu() {
    const btn = $("menuToggle");
    const menu = $("mobileMenu");
    if (!btn || !menu) return;

    btn.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setSession(obj) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(obj));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  function fillHomeKPIs() {
    if ($("homeReceitaTotal")) $("homeReceitaTotal").textContent = brl(total("receita"));
    if ($("homeDespesaTotal")) $("homeDespesaTotal").textContent = brl(total("despesa"));
    if ($("homeSaldoTotal")) $("homeSaldoTotal").textContent = brl(total("saldo"));
    if ($("homeExecucaoMedia")) $("homeExecucaoMedia").textContent = pct(avg("execucao"));
  }

  function renderMonitoramentoHome() {
    const box = $("monitoramentoSecretarias");
    if (!box) return;

    box.innerHTML = "";
    DATA.secretarias.forEach((item) => {
      const level = risk(item);
      const card = document.createElement("article");
      card.className = "monitor-card";
      card.innerHTML = `
        <h4>${item.nome}</h4>
        <p>Receita: <strong>${brl(item.receita)}</strong></p>
        <p>Despesa: <strong>${brl(item.despesa)}</strong></p>
        <p>Saldo: <strong>${brl(item.saldo)}</strong></p>
        <p>Execução: <strong>${pct(item.execucao)}</strong></p>
        <span class="badge ${level}">${riskLabel(level)}</span>
      `;
      box.appendChild(card);
    });
  }

  function destroyCharts() {
    charts.forEach((c) => c && c.destroy());
    charts = [];
  }

  function createHomeCharts() {
    if (typeof Chart === "undefined") return;
    destroyCharts();

    const labels = DATA.secretarias.map((s) => s.nome);
    const receitas = DATA.secretarias.map((s) => s.receita);
    const despesas = DATA.secretarias.map((s) => s.despesa);
    const saldos = DATA.secretarias.map((s) => s.saldo);
    const execucoes = DATA.secretarias.map((s) => s.execucao);

    const riskCounts = {
      ok: DATA.secretarias.filter((s) => risk(s) === "ok").length,
      warn: DATA.secretarias.filter((s) => risk(s) === "warn").length,
      alert: DATA.secretarias.filter((s) => risk(s) === "alert").length
    };

    const opt = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#eaf2ff" } }
      },
      scales: {
        x: { ticks: { color: "#d3def0" }, grid: { color: "rgba(255,255,255,.05)" } },
        y: { ticks: { color: "#d3def0" }, grid: { color: "rgba(255,255,255,.05)" } }
      }
    };

    if ($("chartReceitaDespesa")) {
      charts.push(new Chart($("chartReceitaDespesa"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "Receita", data: receitas, backgroundColor: "rgba(58,188,255,.85)", borderRadius: 8 },
            { label: "Despesa", data: despesas, backgroundColor: "rgba(196,55,45,.85)", borderRadius: 8 }
          ]
        },
        options: opt
      }));
    }

    if ($("chartSaldo")) {
      charts.push(new Chart($("chartSaldo"), {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Saldo",
            data: saldos,
            borderColor: "rgba(80,255,120,1)",
            backgroundColor: "rgba(80,255,120,.14)",
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: 4
          }]
        },
        options: opt
      }));
    }

    if ($("chartExecucao")) {
      charts.push(new Chart($("chartExecucao"), {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Execução (%)",
            data: execucoes,
            backgroundColor: execucoes.map(v => v > 110 ? "rgba(255,90,90,.88)" : v >= 95 ? "rgba(255,212,90,.82)" : "rgba(57,255,61,.76)"),
            borderRadius: 8
          }]
        },
        options: opt
      }));
    }

    if ($("chartRisco")) {
      charts.push(new Chart($("chartRisco"), {
        type: "doughnut",
        data: {
          labels: ["Estável", "Atenção", "Risco alto"],
          datasets: [{
            data: [riskCounts.ok, riskCounts.warn, riskCounts.alert],
            backgroundColor: [
              "rgba(57,255,61,.76)",
              "rgba(255,212,90,.82)",
              "rgba(255,90,90,.88)"
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#eaf2ff" } }
          }
        }
      }));
    }
  }

  function initLogin() {
    const perfil = $("perfil");
    const msg = $("loginMensagem");
    const form = $("loginForm");

    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const perfilQuery = params.get("perfil");
    if (perfilQuery && perfil) perfil.value = perfilQuery;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const selected = perfil.value;
      const usuario = ($("usuario").value || "Usuário").trim();
      const senha = ($("senha").value || "").trim();

      if (senha !== "1234") {
        msg.textContent = "Senha inválida. Use 1234.";
        return;
      }

      setSession({
        usuario,
        perfil: selected,
        autenticado: true,
        data: new Date().toISOString()
      });

      if (selected === "executivo") window.location.href = "executivo.html";
      if (selected === "legislativo") window.location.href = "legislativo.html";
      if (selected === "controle") window.location.href = "controle.html";
      if (selected === "admin") window.location.href = "admin.html";
    });
  }

  function initAdmin() {
    const status = $("adminStatusGrid");
    const msg = $("adminMensagem");
    const session = getSession();

    if (status) {
      status.innerHTML = `
        <div class="card"><strong>Receitas locais:</strong> inativo</div>
        <div class="card"><strong>Despesas locais:</strong> inativo</div>
        <div class="card"><strong>Servidores locais:</strong> inativo</div>
        <div class="card"><strong>Sessão ativa:</strong> ${session ? "ativo" : "inativo"}</div>
      `;
    }

    if ($("btnLimparSessao")) {
      $("btnLimparSessao").addEventListener("click", () => {
        clearSession();
        if (msg) msg.textContent = "Sessão removida com sucesso.";
        setTimeout(() => location.reload(), 500);
      });
    }

    if ($("btnLimparBase")) {
      $("btnLimparBase").addEventListener("click", () => {
        clearSession();
        if (msg) msg.textContent = "Base local limpa com sucesso.";
      });
    }

    if ($("logoutLink")) {
      $("logoutLink").addEventListener("click", (e) => {
        e.preventDefault();
        clearSession();
        window.location.href = "login.html";
      });
    }
  }

  function fillExecutivo() {
    if ($("executivoAtualizado")) $("executivoAtualizado").textContent = DATA.atualizadoEm;
    if ($("execReceita")) $("execReceita").textContent = brl(total("receita"));
    if ($("execDespesa")) $("execDespesa").textContent = brl(total("despesa"));
    if ($("execSaldo")) $("execSaldo").textContent = brl(total("saldo"));
    if ($("execServidores")) $("execServidores").textContent = String(DATA.servidores);

    const filtro = $("filtroExecutivo");
    const tabela = $("tabelaExecutivo");
    const alertas = $("alertasExecutivo");
    const resumo = $("resumoExecutivo");
    const insights = $("insightsExecutivo");

    if (filtro) {
      filtro.innerHTML = `<option value="todas">Todas as Secretarias</option>` +
        DATA.secretarias.map(s => `<option value="${s.nome}">${s.nome}</option>`).join("");
    }

    function render(selected = "todas") {
      const list = selected === "todas"
        ? DATA.secretarias
        : DATA.secretarias.filter(s => s.nome === selected);

      if (tabela) {
        tabela.innerHTML = list.map(item => `
          <tr>
            <td>${item.nome}</td>
            <td>${brl(item.receita)}</td>
            <td>${brl(item.despesa)}</td>
            <td>${brl(item.saldo)}</td>
            <td>${pct(item.execucao)}</td>
          </tr>
        `).join("");
      }

      if (alertas) {
        const criticos = DATA.secretarias.filter(s => risk(s) === "alert");
        alertas.innerHTML = criticos.length
          ? criticos.map(item => `<div class="monitor-card"><strong>Alerta:</strong> ${item.nome} com execução de ${pct(item.execucao)} e saldo de ${brl(item.saldo)}.</div>`).join("")
          : `<div class="monitor-card">Nenhum alerta crítico foi identificado na leitura atual.</div>`;
      }

      if (resumo) {
        resumo.innerHTML = `
          <p><strong>Execução geral:</strong> ${pct(avg("execucao"))}</p>
          <p><strong>Receita consolidada:</strong> ${brl(total("receita"))}</p>
          <p><strong>Despesa consolidada:</strong> ${brl(total("despesa"))}</p>
          <p><strong>Saldo apurado:</strong> ${brl(total("saldo"))}</p>
          <p><strong>Secretarias críticas:</strong> ${DATA.secretarias.filter(s => risk(s) === "alert").length}</p>
        `;
      }

      if (insights) {
        insights.innerHTML = `
          <p>Há ${DATA.secretarias.filter(s => risk(s) === "alert").length} secretaria(s) com execução crítica, exigindo verificação imediata de empenho, liquidação e saldo orçamentário.</p>
          <p>${DATA.secretarias.filter(s => s.saldo >= 0).length} secretaria(s) mantêm saldo positivo, o que favorece planejamento preventivo.</p>
          <p>Sugestão de IA: consolidar relatórios mensais por secretaria e gerar parecer executivo automatizado.</p>
        `;
      }
    }

    render();

    if (filtro) {
      filtro.addEventListener("change", () => render(filtro.value));
    }

    if ($("btnExportarExecutivo")) {
      $("btnExportarExecutivo").addEventListener("click", () => window.print());
    }
  }

  function fillLegislativo() {
    if ($("legAtualizado")) $("legAtualizado").textContent = DATA.atualizadoEm;
    if ($("legExecucaoMedia")) $("legExecucaoMedia").textContent = pct(avg("execucao"));
    if ($("legDespesaTotal")) $("legDespesaTotal").textContent = brl(total("despesa"));
    if ($("legAreasCriticas")) $("legAreasCriticas").textContent = String(DATA.secretarias.filter(s => risk(s) === "alert").length);
    if ($("legSaldoTotal")) $("legSaldoTotal").textContent = brl(total("saldo"));

    if ($("focosLegislativos")) {
      $("focosLegislativos").innerHTML = `
        <p>Obras, Planejamento, Agricultura, Saúde e Meio Ambiente concentram maior atenção legislativa.</p>
        <p>Essas áreas merecem leitura por comissão, requerimentos e eventual convocação técnica.</p>
      `;
    }

    if ($("fiscalizacaoLegislativa")) {
      $("fiscalizacaoLegislativa").innerHTML = `
        <p>Priorizar verificação de saldo negativo e execução acima de 100%.</p>
        <p>Comparar tendência por secretaria e registrar justificativas gerenciais.</p>
      `;
    }

    if ($("listaLegislativo")) {
      $("listaLegislativo").innerHTML = DATA.secretarias.map(item => `
        <article class="monitor-card">
          <h4>${item.nome}</h4>
          <p>Receita: <strong>${brl(item.receita)}</strong></p>
          <p>Despesa: <strong>${brl(item.despesa)}</strong></p>
          <p>Saldo: <strong>${brl(item.saldo)}</strong></p>
          <p>Execução: <strong>${pct(item.execucao)}</strong></p>
          <span class="badge ${risk(item)}">${riskLabel(risk(item))}</span>
        </article>
      `).join("");
    }
  }

  function fillControle() {
    const ok = DATA.secretarias.filter(s => risk(s) === "ok").length;
    const warn = DATA.secretarias.filter(s => risk(s) === "warn").length;
    const alert = DATA.secretarias.filter(s => risk(s) === "alert").length;

    if ($("ctrlAtualizado")) $("ctrlAtualizado").textContent = DATA.atualizadoEm;
    if ($("ctrlRiscoAlto")) $("ctrlRiscoAlto").textContent = String(alert);
    if ($("ctrlAtencao")) $("ctrlAtencao").textContent = String(warn);
    if ($("ctrlEstavel")) $("ctrlEstavel").textContent = String(ok);
    if ($("ctrlSaldoTotal")) $("ctrlSaldoTotal").textContent = brl(total("saldo"));

    if ($("pontosControle")) {
      $("pontosControle").innerHTML = `
        <p>Monitorar secretarias com saldo negativo.</p>
        <p>Verificar execução acima de 110%.</p>
        <p>Priorizar Obras, Planejamento, Agricultura, Saúde e Meio Ambiente.</p>
      `;
    }

    if ($("conformidadeControle")) {
      $("conformidadeControle").innerHTML = `
        <p>Foco em trilhas de auditoria, justificativas formais e revisão preventiva.</p>
        <p>Organizar leitura por órgão e consolidar base para conformidade institucional.</p>
      `;
    }

    if ($("listaControle")) {
      $("listaControle").innerHTML = DATA.secretarias.map(item => `
        <article class="monitor-card">
          <h4>${item.nome}</h4>
          <p>Receita: <strong>${brl(item.receita)}</strong></p>
          <p>Despesa: <strong>${brl(item.despesa)}</strong></p>
          <p>Saldo: <strong>${brl(item.saldo)}</strong></p>
          <p>Execução: <strong>${pct(item.execucao)}</strong></p>
          <span class="badge ${risk(item)}">${riskLabel(risk(item))}</span>
        </article>
      `).join("");
    }
  }

  function initHome() {
    fillHomeKPIs();
    renderMonitoramentoHome();
    createHomeCharts();
  }

  function boot() {
    initMenu();

    if (page === "home") initHome();
    if (page === "login") initLogin();
    if (page === "admin") initAdmin();
    if (page === "executivo") fillExecutivo();
    if (page === "legislativo") fillLegislativo();
    if (page === "controle") fillControle();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
