(function () {
  const STORAGE_THEME_KEY = "evbmt-theme";
  const STORAGE_SESSION_KEY = "evbmt-session";
  const STORAGE_ATUALIZACAO_KEY = "evbmt-updated-at";
  const STORAGE_RECEITAS_KEY = "evbmt-receitas";
  const STORAGE_DESPESAS_KEY = "evbmt-despesas";
  const STORAGE_SERVIDORES_KEY = "evbmt-servidores";

  const body = document.body;
  const root = document.documentElement;
  const page = body?.dataset?.page || "";

  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuDrawer = document.querySelector("[data-menu-drawer]");
  const menuOverlay = document.querySelector("[data-menu-overlay]");

  const dadosSecretariasBase = [
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
    if (execucao > 100 || saldo < 0) {
      status = "Risco alto";
    } else if (execucao >= 95) {
      status = "Atenção";
    }

    return {
      ...item,
      saldo,
      execucao,
      status
    };
  }

  const dataset = dadosSecretariasBase.map(enrichData);

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

  function formatDate(isoString) {
    if (!isoString) return "--";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString("pt-BR");
  }

  function getStatusClass(status) {
    if (status === "Risco alto") return "status-critical";
    if (status === "Atenção") return "status-warning";
    return "status-stable";
  }

  function setUpdatedAt() {
    localStorage.setItem(STORAGE_ATUALIZACAO_KEY, new Date().toISOString());
  }

  function safeParse(json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  function getSession() {
    return safeParse(localStorage.getItem(STORAGE_SESSION_KEY));
  }

  function applyTheme(theme) {
    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    root.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || "dark";
    applyTheme(savedTheme);
  }

  function toggleTheme() {
    const current = body.classList.contains("theme-light") ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);

    if (page === "executivo") {
      initExecutivoCharts();
    } else if (page === "legislativo") {
      initLegislativoCharts();
    } else if (page === "controle") {
      initControleCharts();
    }
  }

  themeButtons.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });

  function openMenu() {
    if (!menuDrawer || !menuOverlay || !menuToggle) return;
    menuDrawer.classList.add("active");
    menuOverlay.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!menuDrawer || !menuOverlay || !menuToggle) return;
    menuDrawer.classList.remove("active");
    menuOverlay.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      const isOpen = menuDrawer && menuDrawer.classList.contains("active");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMenu);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  function renderSessionBadges(selectors) {
    const session = getSession();
    const updatedAt = localStorage.getItem(STORAGE_ATUALIZACAO_KEY);

    if (selectors.userBadge) {
      const el = document.getElementById(selectors.userBadge);
      if (el) {
        el.textContent = session?.username ? `Sessão: ${session.username}` : "Sem sessão ativa";
      }
    }

    if (selectors.statusSessao) {
      const el = document.getElementById(selectors.statusSessao);
      if (el) {
        el.textContent = session ? "ativa" : "inativa";
      }
    }

    if (selectors.statusPerfil) {
      const el = document.getElementById(selectors.statusPerfil);
      if (el) {
        el.textContent = session?.profile || "--";
      }
    }

    if (selectors.statusAtualizacao) {
      const el = document.getElementById(selectors.statusAtualizacao);
      if (el) {
        el.textContent = formatDate(updatedAt);
      }
    }
  }

  function initHomePage() {
    if (!localStorage.getItem(STORAGE_RECEITAS_KEY)) {
      localStorage.setItem(
        STORAGE_RECEITAS_KEY,
        JSON.stringify(dataset.map((item) => ({ nome: item.nome, valor: item.receita })))
      );
    }

    if (!localStorage.getItem(STORAGE_DESPESAS_KEY)) {
      localStorage.setItem(
        STORAGE_DESPESAS_KEY,
        JSON.stringify(dataset.map((item) => ({ nome: item.nome, valor: item.despesa })))
      );
    }

    if (!localStorage.getItem(STORAGE_SERVIDORES_KEY)) {
      localStorage.setItem(
        STORAGE_SERVIDORES_KEY,
        JSON.stringify(dataset.map((item, index) => ({ nome: item.nome, quantidade: (index + 1) * 3 })))
      );
    }

    if (!localStorage.getItem(STORAGE_ATUALIZACAO_KEY)) {
      setUpdatedAt();
    }
  }

  function initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    const perfil = document.getElementById("perfil");
    const usuario = document.getElementById("usuario");
    const senha = document.getElementById("senha");
    const loginMensagem = document.getElementById("loginMensagem");
    const cancelarLogin = document.getElementById("cancelarLogin");

    if (!loginForm || !perfil || !usuario || !senha || !loginMensagem) return;

    function showMessage(message, type) {
      loginMensagem.textContent = message || "";
      loginMensagem.className = "status-message";
      if (type) {
        loginMensagem.classList.add(type);
      }
    }

    function getRedirectByProfile(profileValue) {
      const redirects = {
        executivo: "dashboard/executivo.html",
        legislativo: "dashboard/legislativo.html",
        controle: "dashboard/controle.html",
        admin: "admin.html"
      };
      return redirects[profileValue] || "index.html";
    }

    if (cancelarLogin) {
      cancelarLogin.addEventListener("click", function () {
        loginForm.reset();
        showMessage("", "");
      });
    }

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const perfilValue = (perfil.value || "").trim();
      const usuarioValue = (usuario.value || "").trim();
      const senhaValue = (senha.value || "").trim();

      if (!perfilValue || !usuarioValue || !senhaValue) {
        showMessage("Preencha perfil, usuário e senha.", "error");
        return;
      }

      if (senhaValue !== "1234") {
        showMessage("Senha inválida. Use 1234 para os testes locais.", "error");
        return;
      }

      const sessionData = {
        profile: perfilValue,
        username: usuarioValue,
        loginAt: new Date().toISOString(),
        authenticated: true
      };

      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
      setUpdatedAt();

      showMessage("Acesso autorizado. Redirecionando...", "success");

      const redirect = getRedirectByProfile(perfilValue);
      window.location.href = redirect;
    });
  }

  function initAdminPage() {
    const statusStorage = document.getElementById("statusStorage");
    const statusSessao = document.getElementById("statusSessao");
    const statusAtualizacao = document.getElementById("statusAtualizacao");

    const baseReceitas = document.getElementById("baseReceitas");
    const baseDespesas = document.getElementById("baseDespesas");
    const baseServidores = document.getElementById("baseServidores");
    const baseSessao = document.getElementById("baseSessao");

    const limparBaseLocal = document.getElementById("limparBaseLocal");
    const limparSessao = document.getElementById("limparSessao");
    const adminMensagem = document.getElementById("adminMensagem");

    function setMessage(message, type) {
      if (!adminMensagem) return;
      adminMensagem.textContent = message || "";
      adminMensagem.className = "status-message";
      if (type) {
        adminMensagem.classList.add(type);
      }
    }

    function hasLocalStorage() {
      try {
        const testKey = "__evbmt_test__";
        localStorage.setItem(testKey, "ok");
        localStorage.removeItem(testKey);
        return true;
      } catch (error) {
        return false;
      }
    }

    function getItemCount(key) {
      const raw = localStorage.getItem(key);
      if (!raw) return 0;
      const parsed = safeParse(raw);
      if (Array.isArray(parsed)) return parsed.length;
      if (parsed && typeof parsed === "object") return 1;
      return 0;
    }

    function refreshAdminStatus() {
      const storageOk = hasLocalStorage();
      const sessionRaw = localStorage.getItem(STORAGE_SESSION_KEY);
      const updatedAt = localStorage.getItem(STORAGE_ATUALIZACAO_KEY);

      if (statusStorage) statusStorage.textContent = storageOk ? "ativo" : "indisponível";
      if (statusSessao) statusSessao.textContent = sessionRaw ? "ativa" : "inativa";
      if (statusAtualizacao) statusAtualizacao.textContent = formatDate(updatedAt);

      if (baseReceitas) {
        baseReceitas.textContent = getItemCount(STORAGE_RECEITAS_KEY) > 0
          ? `${getItemCount(STORAGE_RECEITAS_KEY)} registro(s)`
          : "inativo";
      }

      if (baseDespesas) {
        baseDespesas.textContent = getItemCount(STORAGE_DESPESAS_KEY) > 0
          ? `${getItemCount(STORAGE_DESPESAS_KEY)} registro(s)`
          : "inativo";
      }

      if (baseServidores) {
        baseServidores.textContent = getItemCount(STORAGE_SERVIDORES_KEY) > 0
          ? `${getItemCount(STORAGE_SERVIDORES_KEY)} registro(s)`
          : "inativo";
      }

      if (baseSessao) {
        baseSessao.textContent = sessionRaw ? "ativo" : "inativo";
      }
    }

    if (limparBaseLocal) {
      limparBaseLocal.addEventListener("click", function () {
        localStorage.removeItem(STORAGE_RECEITAS_KEY);
        localStorage.removeItem(STORAGE_DESPESAS_KEY);
        localStorage.removeItem(STORAGE_SERVIDORES_KEY);
        localStorage.removeItem(STORAGE_ATUALIZACAO_KEY);
        refreshAdminStatus();
        setMessage("Base local removida com sucesso.", "success");
      });
    }

    if (limparSessao) {
      limparSessao.addEventListener("click", function () {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        refreshAdminStatus();
        setMessage("Sessão removida com sucesso.", "success");
      });
    }

    refreshAdminStatus();
  }

  function initExecutivoPage() {
    const kpiReceita = document.getElementById("kpiReceita");
    const kpiDespesa = document.getElementById("kpiDespesa");
    const kpiSaldo = document.getElementById("kpiSaldo");
    const kpiExecucao = document.getElementById("kpiExecucao");

    const filtroSecretaria = document.getElementById("filtroSecretaria");
    const tabelaExecutivo = document.getElementById("tabelaExecutivo");
    const listaAlertas = document.getElementById("listaAlertas");
    const resumoExecutivo = document.getElementById("resumoExecutivo");
    const insightsIA = document.getElementById("insightsIA");
    const btnExportar = document.getElementById("btnExportar");

    if (!tabelaExecutivo) return;

    renderSessionBadges({
      userBadge: "executivoUsuario",
      statusSessao: "statusSessao",
      statusPerfil: "statusPerfil",
      statusAtualizacao: "statusAtualizacao"
    });

    if (filtroSecretaria && filtroSecretaria.options.length <= 1) {
      dataset.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.nome;
        option.textContent = item.nome;
        filtroSecretaria.appendChild(option);
      });
    }

    function getFilteredData() {
      const selected = filtroSecretaria?.value || "todas";
      if (selected === "todas") return dataset;
      return dataset.filter((item) => item.nome === selected);
    }

    function renderKPIs(data) {
      const totalReceita = data.reduce((sum, item) => sum + item.receita, 0);
      const totalDespesa = data.reduce((sum, item) => sum + item.despesa, 0);
      const totalSaldo = totalReceita - totalDespesa;
      const mediaExecucao = data.length
        ? data.reduce((sum, item) => sum + item.execucao, 0) / data.length
        : 0;

      if (kpiReceita) kpiReceita.textContent = formatMoney(totalReceita);
      if (kpiDespesa) kpiDespesa.textContent = formatMoney(totalDespesa);
      if (kpiSaldo) kpiSaldo.textContent = formatMoney(totalSaldo);
      if (kpiExecucao) kpiExecucao.textContent = formatPercent(mediaExecucao);
    }

    function renderTable(data) {
      tabelaExecutivo.innerHTML = "";
      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td data-label="Secretaria">${item.nome}</td>
          <td data-label="Receita">${formatMoney(item.receita)}</td>
          <td data-label="Despesa">${formatMoney(item.despesa)}</td>
          <td data-label="Saldo">${formatMoney(item.saldo)}</td>
          <td data-label="Execução">${formatPercent(item.execucao)}</td>
          <td data-label="Status"><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
        `;
        tabelaExecutivo.appendChild(tr);
      });
    }

    function renderAlerts(data) {
      if (!listaAlertas) return;
      listaAlertas.innerHTML = "";

      const alerts = [];
      data.forEach((item) => {
        if (item.status === "Risco alto") {
          alerts.push(`Alerta: ${item.nome} com execução de ${formatPercent(item.execucao)} e saldo de ${formatMoney(item.saldo)}.`);
        } else if (item.status === "Atenção") {
          alerts.push(`Atenção: ${item.nome} opera com execução de ${formatPercent(item.execucao)}.`);
        }
      });

      if (!alerts.length) {
        alerts.push("Nenhuma criticidade relevante foi identificada na leitura atual.");
      }

      alerts.forEach((text) => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = text;
        listaAlertas.appendChild(div);
      });
    }

    function renderSummary(data) {
      if (!resumoExecutivo) return;
      resumoExecutivo.innerHTML = "";

      const totalReceita = data.reduce((sum, item) => sum + item.receita, 0);
      const totalDespesa = data.reduce((sum, item) => sum + item.despesa, 0);
      const totalSaldo = totalReceita - totalDespesa;
      const criticas = data.filter((item) => item.status === "Risco alto").length;

      [
        `Receita consolidada: ${formatMoney(totalReceita)}.`,
        `Despesa consolidada: ${formatMoney(totalDespesa)}.`,
        `Saldo apurado: ${formatMoney(totalSaldo)}.`,
        `Secretarias críticas: ${criticas}.`
      ].forEach((text) => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = text;
        resumoExecutivo.appendChild(div);
      });
    }

    function renderInsights(data) {
      if (!insightsIA) return;
      insightsIA.innerHTML = "";

      const negatives = data.filter((item) => item.saldo < 0);
      const positive = data.filter((item) => item.saldo >= 0);

      const lines = [];
      if (negatives.length) {
        lines.push(`Há ${negatives.length} secretaria(s) com saldo negativo, exigindo atenção imediata em empenho, liquidação e equilíbrio orçamentário.`);
      }
      if (positive.length) {
        lines.push(`${positive.length} secretaria(s) mantêm saldo positivo, o que favorece planejamento preventivo.`);
      }
      lines.push("Sugestão de IA: consolidar relatórios mensais por secretaria e gerar parecer executivo automatizado.");

      lines.forEach((text) => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = text;
        insightsIA.appendChild(div);
      });
    }

    function renderAll() {
      const filtered = getFilteredData();
      renderKPIs(filtered);
      renderTable(filtered);
      renderAlerts(filtered);
      renderSummary(filtered);
      renderInsights(filtered);
      initExecutivoCharts(filtered);
    }

    if (filtroSecretaria) {
      filtroSecretaria.addEventListener("change", renderAll);
    }

    if (btnExportar) {
      btnExportar.addEventListener("click", function () {
        window.print();
      });
    }

    renderAll();
  }

  function initLegislativoPage() {
    const kpiExecucaoMedia = document.getElementById("kpiExecucaoMedia");
    const kpiDespesaTotal = document.getElementById("kpiDespesaTotal");
    const kpiSaldoTotal = document.getElementById("kpiSaldoTotal");
    const kpiAreasCriticas = document.getElementById("kpiAreasCriticas");

    const legTemasFiscalizacao = document.getElementById("legTemasFiscalizacao");
    const pontosAtencaoLegislativo = document.getElementById("pontosAtencaoLegislativo");
    const sinteseLegislativa = document.getElementById("sinteseLegislativa");
    const btnExportar = document.getElementById("btnExportar");

    if (!legTemasFiscalizacao) return;

    renderSessionBadges({
      userBadge: "legislativoUsuario",
      statusSessao: "statusSessao",
      statusPerfil: "statusPerfil",
      statusAtualizacao: "statusAtualizacao"
    });

    const totalDespesa = dataset.reduce((sum, item) => sum + item.despesa, 0);
    const totalSaldo = dataset.reduce((sum, item) => sum + item.saldo, 0);
    const mediaExecucao = dataset.reduce((sum, item) => sum + item.execucao, 0) / dataset.length;
    const criticas = dataset.filter((item) => item.status === "Risco alto").length;

    if (kpiExecucaoMedia) kpiExecucaoMedia.textContent = formatPercent(mediaExecucao);
    if (kpiDespesaTotal) kpiDespesaTotal.textContent = formatMoney(totalDespesa);
    if (kpiSaldoTotal) kpiSaldoTotal.textContent = formatMoney(totalSaldo);
    if (kpiAreasCriticas) kpiAreasCriticas.textContent = String(criticas);

    legTemasFiscalizacao.innerHTML = "";
    dataset.forEach((item) => {
      const card = document.createElement("article");
      card.className = "monitor-card";
      card.innerHTML = `
        <h3>${item.nome}</h3>
        <p><strong>Receita:</strong> ${formatMoney(item.receita)}</p>
        <p><strong>Despesa:</strong> ${formatMoney(item.despesa)}</p>
        <p><strong>Saldo:</strong> ${formatMoney(item.saldo)}</p>
        <p><strong>Execução:</strong> ${formatPercent(item.execucao)}</p>
        <span class="status-badge ${getStatusClass(item.status)}">${item.status}</span>
      `;
      legTemasFiscalizacao.appendChild(card);
    });

    if (pontosAtencaoLegislativo) {
      pontosAtencaoLegislativo.innerHTML = "";
      [
        `Há ${criticas} secretaria(s) em risco alto, com potencial impacto na fiscalização temática.`,
        "Secretarias com saldo negativo merecem acompanhamento prioritário.",
        "Execução acima de 100% exige leitura orçamentária cuidadosa.",
        "Comparações entre receita, despesa e saldo fortalecem a fiscalização institucional."
      ].forEach((texto) => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = texto;
        pontosAtencaoLegislativo.appendChild(div);
      });
    }

    if (sinteseLegislativa) {
      sinteseLegislativa.innerHTML = "";
      [
        "O painel legislativo organiza a leitura comparativa das áreas de governo.",
        "A base visual pode subsidiar requerimentos, pareceres e debates em plenário.",
        "A estrutura temática favorece comissões, acompanhamento setorial e leitura institucional.",
        "O ecossistema está preparado para evolução futura com dados reais via JSON e APIs."
      ].forEach((texto) => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = texto;
        sinteseLegislativa.appendChild(div);
      });
    }

    if (btnExportar) {
      btnExportar.addEventListener("click", function () {
        window.print();
      });
    }
  }

  function initControlePage() {
    const kpiReceitaTotal = document.getElementById("kpiReceitaTotal");
    const kpiDespesaTotal = document.getElementById("kpiDespesaTotal");
    const kpiSaldoTotal = document.getElementById("kpiSaldoTotal");
    const kpiExecucaoMedia = document.getElementById("kpiExecucaoMedia");

    const controleRiscos = document.getElementById("controleRiscos");
    const controleConformidade = document.getElementById("controleConformidade");
    const controleSecretarias = document.getElementById("controleSecretarias");
    const pontosAuditoria = document.getElementById("pontosAuditoria");
    const btnExportar = document.getElementById("btnExportar");

    if (!controleSecretarias) return;

    renderSessionBadges({
      userBadge: "controleUsuario",
      statusSessao: "statusSessao",
      statusPerfil: "statusPerfil",
      statusAtualizacao: "statusAtualizacao"
    });

    const totalReceita = dataset.reduce((sum, item) => sum + item.receita, 0);
    const totalDespesa = dataset.reduce((sum, item) => sum + item.despesa, 0);
    const totalSaldo = dataset.reduce((sum, item) => sum + item.saldo, 0);
    const mediaExecucao = dataset.reduce((sum, item) => sum + item.execucao, 0) / dataset.length;

    if (kpiReceitaTotal) kpiReceitaTotal.textContent = formatMoney(totalReceita);
    if (kpiDespesaTotal) kpiDespesaTotal.textContent = formatMoney(totalDespesa);
    if (kpiSaldoTotal) kpiSaldoTotal.textContent = formatMoney(totalSaldo);
    if (kpiExecucaoMedia) kpiExecucaoMedia.textContent = formatPercent(mediaExecucao);

    if (controleRiscos) {
      controleRiscos.innerHTML = "";
      const criticos = dataset.filter((item) => item.status !== "Estável");
      if (!criticos.length) {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = "Nenhum risco crítico identificado na leitura atual.";
        controleRiscos.appendChild(div);
      } else {
        criticos.forEach((item) => {
          const div = document.createElement("div");
          div.className = "info-item";
          div.textContent = `${item.nome}: execução ${formatPercent(item.execucao)} e saldo ${formatMoney(item.saldo)}.`;
          controleRiscos.appendChild(div);
        });
      }
    }

    if (controleConformidade) {
      controleConformidade.innerHTML = "";
      [
        "Base pronta para auditoria preventiva.",
        "Leitura consolidada por secretaria.",
        "Estrutura inicial compatível com Portal da Transparência, TCE-MT e TCU.",
        "Ponto de expansão para APIs e trilhas formais de evidência."
      ].forEach((texto) => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = texto;
        controleConformidade.appendChild(div);
      });
    }

    controleSecretarias.innerHTML = "";
    dataset.forEach((item) => {
      const card = document.createElement("article");
      card.className = "monitor-card";
      card.innerHTML = `
        <h3>${item.nome}</h3>
        <p><strong>Receita:</strong> ${formatMoney(item.receita)}</p>
        <p><strong>Despesa:</strong> ${formatMoney(item.despesa)}</p>
        <p><strong>Saldo:</strong> ${formatMoney(item.saldo)}</p>
        <p><strong>Execução:</strong> ${formatPercent(item.execucao)}</p>
        <span class="status-badge ${getStatusClass(item.status)}">${item.status}</span>
      `;
      controleSecretarias.appendChild(card);
    });

    if (pontosAuditoria) {
      pontosAuditoria.innerHTML = "";
      [
        "Secretarias com saldo negativo exigem rastreio preventivo.",
        "Execução acima de 100% sugere criticidade ou necessidade de leitura complementar.",
        "O confronto entre receita, despesa e saldo fortalece a análise técnica.",
        "A base local prepara a evolução futura para leitura por API e dados oficiais."
      ].forEach((texto) => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.textContent = texto;
        pontosAuditoria.appendChild(div);
      });
    }

    if (btnExportar) {
      btnExportar.addEventListener("click", function () {
        window.print();
      });
    }
  }

  function getChartLabels(data) {
    return data.map((item) => item.nome);
  }

  function getChartTextColor() {
    return getComputedStyle(document.body).getPropertyValue("--text-secondary").trim() || "#c5d0e6";
  }

  function getChartGridColor() {
    if (body.classList.contains("theme-light")) {
      return "rgba(16, 32, 56, 0.10)";
    }
    return "rgba(255,255,255,0.08)";
  }

  function getChartPalette() {
    if (body.classList.contains("theme-light")) {
      return {
        green: "rgba(0, 127, 50, 0.78)",
        blue: "rgba(30, 100, 220, 0.72)",
        red: "rgba(185, 53, 53, 0.72)",
        yellow: "rgba(173, 122, 0, 0.72)",
        teal: "rgba(5, 124, 110, 0.72)",
        purple: "rgba(116, 86, 196, 0.72)"
      };
    }

    return {
      green: "rgba(102, 255, 102, 0.72)",
      blue: "rgba(64, 156, 255, 0.72)",
      red: "rgba(255, 105, 105, 0.72)",
      yellow: "rgba(255, 210, 77, 0.72)",
      teal: "rgba(102, 255, 204, 0.72)",
      purple: "rgba(170, 120, 255, 0.72)"
    };
  }

  function destroyIfExists(canvasId) {
    if (typeof Chart === "undefined") return;
    const existing = Chart.getChart(canvasId);
    if (existing) {
      existing.destroy();
    }
  }

  function buildBaseChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: getChartTextColor()
          }
        }
      },
      scales: {
        x: {
          ticks: { color: getChartTextColor() },
          grid: { color: getChartGridColor() }
        },
        y: {
          ticks: { color: getChartTextColor() },
          grid: { color: getChartGridColor() }
        }
      }
    };
  }

  function initExecutivoCharts(data = dataset) {
    if (typeof Chart === "undefined") return;
    if (!document.getElementById("chartExecutivoReceitaDespesa")) return;

    const palette = getChartPalette();
    const labels = getChartLabels(data);

    destroyIfExists("chartExecutivoReceitaDespesa");
    new Chart(document.getElementById("chartExecutivoReceitaDespesa"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Receita",
            data: data.map((i) => i.receita),
            backgroundColor: palette.green,
            borderColor: palette.green
          },
          {
            label: "Despesa",
            data: data.map((i) => i.despesa),
            backgroundColor: palette.blue,
            borderColor: palette.blue
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    destroyIfExists("chartExecutivoSaldo");
    new Chart(document.getElementById("chartExecutivoSaldo"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Saldo",
            data: data.map((i) => i.saldo),
            tension: 0.3,
            fill: false,
            borderColor: palette.yellow,
            backgroundColor: palette.yellow
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    destroyIfExists("chartExecutivoExecucao");
    new Chart(document.getElementById("chartExecutivoExecucao"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Execução %",
            data: data.map((i) => Number(i.execucao.toFixed(1))),
            backgroundColor: palette.teal,
            borderColor: palette.teal
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    const riscoCritico = data.filter((i) => i.status === "Risco alto").length;
    const riscoAtencao = data.filter((i) => i.status === "Atenção").length;
    const riscoEstavel = data.filter((i) => i.status === "Estável").length;

    destroyIfExists("chartExecutivoRisco");
    new Chart(document.getElementById("chartExecutivoRisco"), {
      type: "doughnut",
      data: {
        labels: ["Risco alto", "Atenção", "Estável"],
        datasets: [
          {
            data: [riscoCritico, riscoAtencao, riscoEstavel],
            backgroundColor: [palette.red, palette.yellow, palette.green],
            borderColor: [palette.red, palette.yellow, palette.green]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: getChartTextColor()
            }
          }
        }
      }
    });
  }

  function initLegislativoCharts() {
    if (typeof Chart === "undefined") return;
    if (!document.getElementById("chartLegislativoExecucao")) return;

    const palette = getChartPalette();
    const labels = getChartLabels(dataset);

    destroyIfExists("chartLegislativoExecucao");
    new Chart(document.getElementById("chartLegislativoExecucao"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Execução %",
            data: dataset.map((i) => Number(i.execucao.toFixed(1))),
            backgroundColor: palette.green,
            borderColor: palette.green
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    destroyIfExists("chartLegislativoCriticas");
    new Chart(document.getElementById("chartLegislativoCriticas"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Áreas críticas",
            data: dataset.map((i) => (i.status === "Risco alto" ? 1 : 0)),
            backgroundColor: palette.red,
            borderColor: palette.red
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    destroyIfExists("chartLegislativoSaldo");
    new Chart(document.getElementById("chartLegislativoSaldo"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Saldo",
            data: dataset.map((i) => i.saldo),
            tension: 0.25,
            fill: false,
            borderColor: palette.yellow,
            backgroundColor: palette.yellow
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    const ranking = [...dataset].sort((a, b) => b.execucao - a.execucao);

    destroyIfExists("chartLegislativoRanking");
    new Chart(document.getElementById("chartLegislativoRanking"), {
      type: "bar",
      data: {
        labels: ranking.map((i) => i.nome),
        datasets: [
          {
            label: "Ranking de atenção",
            data: ranking.map((i) => Number(i.execucao.toFixed(1))),
            backgroundColor: palette.purple,
            borderColor: palette.purple
          }
        ]
      },
      options: buildBaseChartOptions()
    });
  }

  function initControleCharts() {
    if (typeof Chart === "undefined") return;
    if (!document.getElementById("chartControleCriticidade")) return;

    const palette = getChartPalette();
    const labels = getChartLabels(dataset);

    destroyIfExists("chartControleCriticidade");
    new Chart(document.getElementById("chartControleCriticidade"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Criticidade",
            data: dataset.map((i) => {
              if (i.status === "Risco alto") return 3;
              if (i.status === "Atenção") return 2;
              return 1;
            }),
            backgroundColor: palette.red,
            borderColor: palette.red
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    const acima100 = dataset.filter((i) => i.execucao > 100);

    destroyIfExists("chartControleExecucao");
    new Chart(document.getElementById("chartControleExecucao"), {
      type: "bar",
      data: {
        labels: acima100.map((i) => i.nome),
        datasets: [
          {
            label: "Execução acima de 100%",
            data: acima100.map((i) => Number(i.execucao.toFixed(1))),
            backgroundColor: palette.yellow,
            borderColor: palette.yellow
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    const saldoNegativo = dataset.filter((i) => i.saldo < 0);

    destroyIfExists("chartControleSaldoNegativo");
    new Chart(document.getElementById("chartControleSaldoNegativo"), {
      type: "bar",
      data: {
        labels: saldoNegativo.map((i) => i.nome),
        datasets: [
          {
            label: "Saldo negativo",
            data: saldoNegativo.map((i) => i.saldo),
            backgroundColor: palette.blue,
            borderColor: palette.blue
          }
        ]
      },
      options: buildBaseChartOptions()
    });

    const riscoCritico = dataset.filter((i) => i.status === "Risco alto").length;
    const riscoAtencao = dataset.filter((i) => i.status === "Atenção").length;
    const riscoEstavel = dataset.filter((i) => i.status === "Estável").length;

    destroyIfExists("chartControleStatus");
    new Chart(document.getElementById("chartControleStatus"), {
      type: "pie",
      data: {
        labels: ["Risco alto", "Atenção", "Estável"],
        datasets: [
          {
            data: [riscoCritico, riscoAtencao, riscoEstavel],
            backgroundColor: [palette.red, palette.yellow, palette.green],
            borderColor: [palette.red, palette.yellow, palette.green]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: getChartTextColor()
            }
          }
        }
      }
    });
  }

  initTheme();
  closeMenu();
  initHomePage();

  switch (page) {
    case "login":
      initLoginPage();
      break;
    case "admin":
      initAdminPage();
      break;
    case "executivo":
      initExecutivoPage();
      break;
    case "legislativo":
      initLegislativoPage();
      initLegislativoCharts();
      break;
    case "controle":
      initControlePage();
      initControleCharts();
      break;
    default:
      break;
  }
})();
