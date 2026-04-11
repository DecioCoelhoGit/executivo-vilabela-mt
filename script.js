/* =========================================================
   EXECUTIVOVILABELAMT — SCRIPT.JS TOTAL
   Menu blindado + login + admin + painéis + gráficos
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  iniciarApp();
});

function iniciarApp() {
  iniciarMenuBlindado();
  iniciarRodapeAno();
  iniciarLogin();
  iniciarAdmin();
  carregarPainelPagina();
}

/* =========================================================
   CONFIGURAÇÃO GERAL
   ========================================================= */

const APP_CONFIG = {
  storageKeys: {
    sessao: "evbmt_sessao",
    baseDados: "evbmt_base_dados"
  },
  usuariosTeste: {
    executivo: { senha: "1234", destino: "executivo.html", perfilNome: "Prefeito / Executivo" },
    legislativo: { senha: "1234", destino: "legislativo.html", perfilNome: "Vereador / Legislativo" },
    controle: { senha: "1234", destino: "controle.html", perfilNome: "Controle / Órgãos de Controle" },
    admin: { senha: "1234", destino: "admin.html", perfilNome: "Administração local" }
  }
};

const BASE_PADRAO = {
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
    "JSON",
    "OpenAI / ChatGPT"
  ],
  secretarias: [
    { nome: "Administração", receita: 180000, despesa: 120000, servidores: 22 },
    { nome: "Finanças", receita: 150000, despesa: 98000, servidores: 10 },
    { nome: "Saúde", receita: 300000, despesa: 345000, servidores: 140 },
    { nome: "Educação", receita: 330000, despesa: 310000, servidores: 115 },
    { nome: "Assistência Social", receita: 125000, despesa: 110000, servidores: 26 },
    { nome: "Obras", receita: 210000, despesa: 295000, servidores: 34 },
    { nome: "Cultura e Turismo", receita: 62000, despesa: 53000, servidores: 8 },
    { nome: "Meio Ambiente", receita: 46000, despesa: 47000, servidores: 7 },
    { nome: "Agricultura", receita: 72000, despesa: 89000, servidores: 12 },
    { nome: "Planejamento", receita: 428900, despesa: 552900, servidores: 9 }
  ]
};

/* =========================================================
   MENU BLINDADO
   ========================================================= */

function iniciarMenuBlindado() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const drawer = document.querySelector("[data-menu-drawer]");
  const overlay = document.querySelector("[data-menu-overlay]");
  const fechar = document.querySelectorAll("[data-menu-close]");
  const body = document.body;

  if (!toggle || !drawer) return;

  function abrirMenu() {
    drawer.classList.add("is-open");
    if (overlay) overlay.classList.add("is-open");
    toggle.classList.add("is-active");
    body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function fecharMenu() {
    drawer.classList.remove("is-open");
    if (overlay) overlay.classList.remove("is-open");
    toggle.classList.remove("is-active");
    body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function alternarMenu() {
    const aberto = drawer.classList.contains("is-open");
    if (aberto) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  }

  toggle.addEventListener("click", alternarMenu);

  fechar.forEach((item) => {
    item.addEventListener("click", fecharMenu);
  });

  if (overlay) {
    overlay.addEventListener("click", fecharMenu);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      fecharMenu();
    }
  });

  const linksMenu = drawer.querySelectorAll("a");
  linksMenu.forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });
}

/* =========================================================
   LOGIN
   ========================================================= */

function iniciarLogin() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  const perfilSelect = document.querySelector("#perfil");
  const usuarioInput = document.querySelector("#usuario");
  const senhaInput = document.querySelector("#senha");
  const statusBox = document.querySelector("#loginStatus");
  const cancelarBtn = document.querySelector("#cancelarLogin");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const perfil = normalizarPerfil(perfilSelect ? perfilSelect.value : "");
    const usuario = (usuarioInput ? usuarioInput.value : "").trim();
    const senha = (senhaInput ? senhaInput.value : "").trim();

    if (!perfil || !usuario || !senha) {
      mostrarStatusLogin("Preencha perfil, usuário e senha.", "erro");
      return;
    }

    const credencial = APP_CONFIG.usuariosTeste[perfil];
    if (!credencial) {
      mostrarStatusLogin("Perfil não reconhecido.", "erro");
      return;
    }

    if (senha !== credencial.senha) {
      mostrarStatusLogin("Senha inválida.", "erro");
      return;
    }

    salvarSessao({
      perfil,
      usuario,
      perfilNome: credencial.perfilNome,
      loginEm: new Date().toISOString()
    });

    mostrarStatusLogin("Acesso liberado. Redirecionando...", "sucesso");

    setTimeout(() => {
      window.location.href = credencial.destino;
    }, 500);
  });

  if (cancelarBtn) {
    cancelarBtn.addEventListener("click", () => {
      form.reset();
      limparStatusLogin();
    });
  }

  function mostrarStatusLogin(texto, tipo = "info") {
    if (!statusBox) return;
    statusBox.textContent = texto;
    statusBox.className = `status-box ${tipo}`;
  }

  function limparStatusLogin() {
    if (!statusBox) return;
    statusBox.textContent = "";
    statusBox.className = "status-box";
  }
}

function normalizarPerfil(valor) {
  const v = String(valor || "").toLowerCase().trim();
  if (v.includes("execut")) return "executivo";
  if (v.includes("legis")) return "legislativo";
  if (v.includes("control")) return "controle";
  if (v.includes("admin")) return "admin";
  return v;
}

function salvarSessao(sessao) {
  localStorage.setItem(APP_CONFIG.storageKeys.sessao, JSON.stringify(sessao));
}

function obterSessao() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKeys.sessao);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function limparSessao() {
  localStorage.removeItem(APP_CONFIG.storageKeys.sessao);
}

/* =========================================================
   ADMIN
   ========================================================= */

function iniciarAdmin() {
  const paginaAdmin = document.body.dataset.page === "admin";
  if (!paginaAdmin) return;

  const btnLimparBase = document.querySelector("#btnLimparBase");
  const btnLimparSessao = document.querySelector("#btnLimparSessao");
  const statusNavegador = document.querySelector("#statusNavegador");
  const estadoBases = document.querySelector("#estadoBases");

  atualizarPainelAdmin();

  if (btnLimparBase) {
    btnLimparBase.addEventListener("click", () => {
      localStorage.removeItem(APP_CONFIG.storageKeys.baseDados);
      atualizarPainelAdmin("Base local removida com sucesso.");
    });
  }

  if (btnLimparSessao) {
    btnLimparSessao.addEventListener("click", () => {
      limparSessao();
      atualizarPainelAdmin("Sessão removida com sucesso.");
    });
  }

  function atualizarPainelAdmin(mensagem = "") {
    if (statusNavegador) {
      statusNavegador.innerHTML = `
        <strong>armazenamento local</strong><br>
        ${suportaStorage() ? "ativo" : "indisponível"}<br>
        Sessão e bases podem ser validadas localmente.
      `;
    }

    const base = obterBaseDados();
    const sessao = obterSessao();

    if (estadoBases) {
      estadoBases.innerHTML = `
        <div class="status-item"><strong>Receitas locais:</strong> ${base ? "ativo" : "inativo"}</div>
        <div class="status-item"><strong>Despesas locais:</strong> ${base ? "ativo" : "inativo"}</div>
        <div class="status-item"><strong>Servidores locais:</strong> ${base ? "ativo" : "inativo"}</div>
        <div class="status-item"><strong>Sessão ativa:</strong> ${sessao ? "ativo" : "inativo"}</div>
        ${mensagem ? `<div class="status-feedback">${mensagem}</div>` : ""}
      `;
    }
  }
}

function suportaStorage() {
  try {
    const teste = "__evbmt_teste__";
    localStorage.setItem(teste, "ok");
    localStorage.removeItem(teste);
    return true;
  } catch (error) {
    return false;
  }
}

/* =========================================================
   BASE DE DADOS
   ========================================================= */

function obterBaseDados() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKeys.baseDados);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn("Falha ao ler base local. Usando base padrão.");
  }
  return BASE_PADRAO;
}

function salvarBaseDados(base) {
  localStorage.setItem(APP_CONFIG.storageKeys.baseDados, JSON.stringify(base));
}

function calcularResumo(base) {
  const totalReceita = base.secretarias.reduce((acc, item) => acc + item.receita, 0);
  const totalDespesa = base.secretarias.reduce((acc, item) => acc + item.despesa, 0);
  const totalServidores = base.secretarias.reduce((acc, item) => acc + item.servidores, 0);
  const saldo = totalReceita - totalDespesa;

  const mediaExecucao =
    base.secretarias.length > 0
      ? base.secretarias.reduce((acc, item) => acc + calcularExecucao(item), 0) / base.secretarias.length
      : 0;

  return {
    totalReceita,
    totalDespesa,
    totalServidores,
    saldo,
    mediaExecucao
  };
}

function calcularExecucao(item) {
  if (!item.receita || item.receita <= 0) return 0;
  return (item.despesa / item.receita) * 100;
}

function classificarRisco(item) {
  const execucao = calcularExecucao(item);
  const saldo = item.receita - item.despesa;

  if (execucao > 100 || saldo < 0) return "Risco alto";
  if (execucao >= 90) return "Atenção";
  return "Estável";
}

function obterCorRisco(status) {
  if (status === "Risco alto") return "#ff5c5c";
  if (status === "Atenção") return "#f3c64f";
  return "#35e06f";
}

/* =========================================================
   CARREGAMENTO POR PÁGINA
   ========================================================= */

function carregarPainelPagina() {
  const page = document.body.dataset.page;
  if (!page) return;

  const base = obterBaseDados();
  const resumo = calcularResumo(base);
  const sessao = obterSessao();

  preencherCabecalhoSessao(page, sessao);

  if (page === "executivo") {
    renderExecutivo(base, resumo);
  }

  if (page === "legislativo") {
    renderLegislativo(base, resumo);
  }

  if (page === "controle") {
    renderControle(base, resumo);
  }

  if (page === "home") {
    renderHome(base, resumo);
  }
}

function preencherCabecalhoSessao(page, sessao) {
  const elUsuario = document.querySelector("[data-sessao-usuario]");
  const elPerfil = document.querySelector("[data-sessao-perfil]");

  if (elUsuario) {
    elUsuario.textContent = sessao?.usuario || "Visitante";
  }

  if (elPerfil) {
    if (page === "executivo") elPerfil.textContent = sessao?.perfilNome || "Prefeito / Executivo";
    if (page === "legislativo") elPerfil.textContent = sessao?.perfilNome || "Vereador / Legislativo";
    if (page === "controle") elPerfil.textContent = sessao?.perfilNome || "Controle / Órgãos de Controle";
    if (page === "admin") elPerfil.textContent = "Administração local";
  }
}

/* =========================================================
   RENDER HOME
   ========================================================= */

function renderHome(base, resumo) {
  preencherTexto("#homeReceitaTotal", moeda(resumo.totalReceita));
  preencherTexto("#homeDespesaTotal", moeda(resumo.totalDespesa));
  preencherTexto("#homeSaldoTotal", moeda(resumo.saldo));
  preencherTexto("#homeExecucaoMedia", percentual(resumo.mediaExecucao));
  renderMonitoramentoSecretarias("#monitoramentoSecretarias", base.secretarias);
  renderParcerias("#listaParceriasInstitucionais", base.parceriasInstitucionais);
  renderParcerias("#listaParceriasTecnologicas", base.parceriasTecnologicas);
  renderGraficos(base.secretarias);
}

/* =========================================================
   RENDER EXECUTIVO
   ========================================================= */

function renderExecutivo(base, resumo) {
  preencherTexto("#executivoAtualizadoEm", formatarData(base.atualizadoEm));
  preencherTexto("#executivoReceitaTotal", moeda(resumo.totalReceita));
  preencherTexto("#executivoDespesaTotal", moeda(resumo.totalDespesa));
  preencherTexto("#executivoSaldoTotal", moeda(resumo.saldo));
  preencherTexto("#executivoServidores", String(resumo.totalServidores));

  const filtro = document.querySelector("#filtroSecretaria");
  const tabela = document.querySelector("#tabelaExecutivoBody");
  const alertas = document.querySelector("#executivoAlertas");
  const resumoBox = document.querySelector("#executivoResumo");
  const insights = document.querySelector("#executivoInsights");
  const exportarBtn = document.querySelector("#btnExportarRelatorio");
  const uploadJson = document.querySelector("#uploadJson");

  if (filtro) {
    popularFiltroSecretarias(filtro, base.secretarias);
    filtro.addEventListener("change", () => {
      atualizarPainelExecutivo(base.secretarias, filtro.value);
    });
  }

  if (uploadJson) {
    uploadJson.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(String(e.target?.result || "{}"));
          if (!json.secretarias || !Array.isArray(json.secretarias)) {
            alert("Arquivo JSON inválido.");
            return;
          }
          salvarBaseDados(json);
          location.reload();
        } catch (error) {
          alert("Não foi possível ler o JSON.");
        }
      };
      reader.readAsText(file, "utf-8");
    });
  }

  if (exportarBtn) {
    exportarBtn.addEventListener("click", () => window.print());
  }

  atualizarPainelExecutivo(base.secretarias, "todas");

  function atualizarPainelExecutivo(secretarias, filtroNome) {
    const lista =
      filtroNome && filtroNome !== "todas"
        ? secretarias.filter((item) => item.nome === filtroNome)
        : secretarias;

    if (tabela) {
      tabela.innerHTML = lista
        .map((item) => {
          const saldo = item.receita - item.despesa;
          return `
            <tr>
              <td>${item.nome}</td>
              <td>${moeda(item.receita)}</td>
              <td>${moeda(item.despesa)}</td>
              <td>${moeda(saldo)}</td>
              <td>${percentual(calcularExecucao(item))}</td>
            </tr>
          `;
        })
        .join("");
    }

    if (alertas) {
      const itensCriticos = lista.filter((item) => classificarRisco(item) !== "Estável");
      alertas.innerHTML =
        itensCriticos.length > 0
          ? itensCriticos
              .map((item) => {
                const saldo = item.receita - item.despesa;
                return `<div class="alert-item">Alerta: ${item.nome} com execução de ${percentual(calcularExecucao(item))} e saldo de ${moeda(saldo)}.</div>`;
              })
              .join("")
          : `<div class="alert-item ok">Nenhum alerta crítico foi identificado na leitura atual.</div>`;
    }

    if (resumoBox) {
      const listaResumo = calcularResumo({ secretarias: lista });
      const criticos = lista.filter((item) => classificarRisco(item) === "Risco alto").length;
      resumoBox.innerHTML = `
        <strong>Execução geral:</strong> ${percentual(listaResumo.mediaExecucao)}<br>
        <strong>Receita consolidada:</strong> ${moeda(listaResumo.totalReceita)}<br>
        <strong>Despesa consolidada:</strong> ${moeda(listaResumo.totalDespesa)}<br>
        <strong>Saldo apurado:</strong> ${moeda(listaResumo.saldo)}<br>
        <strong>Secretarias críticas:</strong> ${criticos}
      `;
    }

    if (insights) {
      const criticos = lista.filter((item) => classificarRisco(item) === "Risco alto");
      const positivos = lista.filter((item) => item.receita - item.despesa > 0);
      insights.innerHTML = `
        <p>Há ${criticos.length} secretaria(s) com execução crítica, exigindo verificação imediata de empenho, liquidação e saldo orçamentário.</p>
        <p>${positivos.length} secretaria(s) mantêm saldo positivo, o que favorece planejamento preventivo.</p>
        <p>Sugestão de IA: consolidar relatórios mensais por secretaria e gerar parecer executivo automatizado.</p>
      `;
    }
  }
}

/* =========================================================
   RENDER LEGISLATIVO
   ========================================================= */

function renderLegislativo(base, resumo) {
  preencherTexto("#legAtualizadoEm", formatarData(base.atualizadoEm));
  preencherTexto("#legExecucaoMedia", percentual(resumo.mediaExecucao));
  preencherTexto("#legDespesaEmpenhada", moeda(resumo.totalDespesa));
  preencherTexto("#legSaldoApurado", moeda(resumo.saldo));

  const container = document.querySelector("#legTemasFiscalizacao");
  if (container) {
    container.innerHTML = base.secretarias
      .map((item) => {
        const risco = classificarRisco(item);
        return `
          <article class="monitor-card">
            <h3>${item.nome}</h3>
            <p><strong>Receita:</strong> ${moeda(item.receita)}</p>
            <p><strong>Despesa:</strong> ${moeda(item.despesa)}</p>
            <p><strong>Saldo:</strong> ${moeda(item.receita - item.despesa)}</p>
            <p><strong>Execução:</strong> ${percentual(calcularExecucao(item))}</p>
            <span class="status-pill" style="border-color:${obterCorRisco(risco)};color:${obterCorRisco(risco)}">${risco}</span>
          </article>
        `;
      })
      .join("");
  }
}

/* =========================================================
   RENDER CONTROLE
   ========================================================= */

function renderControle(base) {
  preencherTexto("#controleAtualizadoEm", formatarData(base.atualizadoEm));

  const riscos = document.querySelector("#controleRiscos");
  const conformidade = document.querySelector("#controleConformidade");

  if (riscos) {
    const lista = base.secretarias
      .filter((item) => classificarRisco(item) !== "Estável")
      .map((item) => {
        return `<li>${item.nome}: execução ${percentual(calcularExecucao(item))} e saldo ${moeda(item.receita - item.despesa)}.</li>`;
      });

    riscos.innerHTML = lista.length
      ? `<ul>${lista.join("")}</ul>`
      : `<p>Nenhum risco crítico identificado.</p>`;
  }

  if (conformidade) {
    conformidade.innerHTML = `
      <ul>
        <li>Base pronta para auditoria preventiva.</li>
        <li>Leitura consolidada por secretaria.</li>
        <li>Estrutura inicial compatível com Portal da Transparência, TCE-MT e TCU.</li>
        <li>Ponto de expansão para API oficial e trilha de evidências.</li>
      </ul>
    `;
  }
}

/* =========================================================
   COMPONENTES AUXILIARES
   ========================================================= */

function renderMonitoramentoSecretarias(selector, secretarias) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = secretarias
    .map((item) => {
      const risco = classificarRisco(item);
      return `
        <article class="monitor-card">
          <h3>${item.nome}</h3>
          <p>Receita: <strong>${moeda(item.receita)}</strong></p>
          <p>Despesa: <strong>${moeda(item.despesa)}</strong></p>
          <p>Saldo: <strong>${moeda(item.receita - item.despesa)}</strong></p>
          <p>Execução: <strong>${percentual(calcularExecucao(item))}</strong></p>
          <span class="status-pill" style="border-color:${obterCorRisco(risco)};color:${obterCorRisco(risco)}">${risco}</span>
        </article>
      `;
    })
    .join("");
}

function renderParcerias(selector, lista) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = `
    <ul>
      ${lista.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function popularFiltroSecretarias(select, secretarias) {
  select.innerHTML = `
    <option value="todas">Todas as Secretarias</option>
    ${secretarias.map((item) => `<option value="${item.nome}">${item.nome}</option>`).join("")}
  `;
}

function preencherTexto(selector, valor) {
  const el = document.querySelector(selector);
  if (el) el.textContent = valor;
}

function iniciarRodapeAno() {
  const els = document.querySelectorAll("[data-ano-atual]");
  const ano = new Date().getFullYear();
  els.forEach((el) => {
    el.textContent = String(ano);
  });
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function percentual(valor) {
  return `${Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

function formatarData(dataIso) {
  if (!dataIso) return "--/--/----";
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return dataIso;
  return data.toLocaleDateString("pt-BR");
}

/* =========================================================
   GRÁFICOS (CHART.JS)
   ========================================================= */

function renderGraficos(secretarias) {
  if (typeof Chart === "undefined") return;

  criarGraficoReceitaDespesa(secretarias);
  criarGraficoSaldo(secretarias);
  criarGraficoExecucao(secretarias);
  criarGraficoRisco(secretarias);
}

function destruirGrafico(idCanvas) {
  const chart = Chart.getChart(idCanvas);
  if (chart) chart.destroy();
}

function criarGraficoReceitaDespesa(secretarias) {
  const canvas = document.getElementById("chartReceitaDespesa");
  if (!canvas) return;

  destruirGrafico("chartReceitaDespesa");

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
    options: opcoesPadraoGrafico()
  });
}

function criarGraficoSaldo(secretarias) {
  const canvas = document.getElementById("chartSaldo");
  if (!canvas) return;

  destruirGrafico("chartSaldo");

  new Chart(canvas, {
    type: "line",
    data: {
      labels: secretarias.map((item) => item.nome),
      datasets: [
        {
          label: "Saldo",
          data: secretarias.map((item) => item.receita - item.despesa),
          borderColor: "#52ff7a",
          backgroundColor: "rgba(82,255,122,0.15)",
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: opcoesPadraoGrafico()
  });
}

function criarGraficoExecucao(secretarias) {
  const canvas = document.getElementById("chartExecucao");
  if (!canvas) return;

  destruirGrafico("chartExecucao");

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: secretarias.map((item) => item.nome),
      datasets: [
        {
          label: "Execução (%)",
          data: secretarias.map((item) => Number(calcularExecucao(item).toFixed(1))),
          backgroundColor: secretarias.map((item) => {
            const risco = classificarRisco(item);
            if (risco === "Risco alto") return "#e74c3c";
            if (risco === "Atenção") return "#f1c40f";
            return "#2ecc71";
          })
        }
      ]
    },
    options: opcoesPadraoGrafico()
  });
}

function criarGraficoRisco(secretarias) {
  const canvas = document.getElementById("chartRisco");
  if (!canvas) return;

  destruirGrafico("chartRisco");

  const estavel = secretarias.filter((item) => classificarRisco(item) === "Estável").length;
  const atencao = secretarias.filter((item) => classificarRisco(item) === "Atenção").length;
  const riscoAlto = secretarias.filter((item) => classificarRisco(item) === "Risco alto").length;

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
          labels: {
            color: "#eaf2ff"
          }
        }
      }
    }
  });
}

function opcoesPadraoGrafico() {
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
