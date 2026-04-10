const App = (() => {
  let dadosGlobais = [];
  let indicadoresGlobais = null;

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (!lines.length) return [];

    const headers = lines[0].split(",").map(h => h.trim());

    return lines
      .slice(1)
      .filter(line => line.trim() !== "")
      .map(line => {
        const cols = line.split(",").map(c => c.trim());
        const row = {};
        headers.forEach((h, i) => {
          row[h] = cols[i] ?? "";
        });
        return row;
      });
  }

  async function loadCSV(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Erro ao carregar ${path}`);
    const text = await res.text();
    return parseCSV(text);
  }

  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Erro ao carregar ${path}`);
    return res.json();
  }

  function salvarBaseLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
  }

  function lerBaseLocal(chave) {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : null;
  }

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
    return Number(String(value).replace(/\./g, "").replace(",", ".")) || 0;
  }

  function sumBy(rows, field) {
    return rows.reduce((acc, row) => acc + toNumber(row[field]), 0);
  }

  function uniqueCount(rows, field) {
    return new Set(rows.map(r => r[field]).filter(Boolean)).size;
  }

  function groupBySecretaria(receitas, despesas) {
    const map = new Map();

    receitas.forEach(row => {
      const key = row.secretaria || "Não informado";
      if (!map.has(key)) {
        map.set(key, {
          secretaria: key,
          receita_prevista: 0,
          receita_arrecadada: 0,
          despesa_empenhada: 0,
          despesa_liquidada: 0,
          despesa_paga: 0
        });
      }

      const item = map.get(key);
      item.receita_prevista += toNumber(row.valor_previsto);
      item.receita_arrecadada += toNumber(row.valor_arrecadado);
    });

    despesas.forEach(row => {
      const key = row.secretaria || "Não informado";
      if (!map.has(key)) {
        map.set(key, {
          secretaria: key,
          receita_prevista: 0,
          receita_arrecadada: 0,
          despesa_empenhada: 0,
          despesa_liquidada: 0,
          despesa_paga: 0
        });
      }

      const item = map.get(key);
      item.despesa_empenhada += toNumber(row.valor_empenhado);
      item.despesa_liquidada += toNumber(row.valor_liquidado);
      item.despesa_paga += toNumber(row.valor_pago);
    });

    return Array.from(map.values()).map(item => {
      const saldo = item.receita_arrecadada - item.despesa_paga;
      const execucao = item.receita_arrecadada > 0
        ? (item.despesa_paga / item.receita_arrecadada) * 100
        : 0;

      return {
        ...item,
        saldo,
        execucao
      };
    });
  }

  function enrichWithIndicadores(aggregate, indicadores) {
    if (!indicadores || !Array.isArray(indicadores.secretarias)) return aggregate;

    return aggregate.map(item => {
      const ref = indicadores.secretarias.find(s => s.nome === item.secretaria);
      return {
        ...item,
        risco: ref?.risco || "nao informado",
        alerta: ref?.alerta || "sem informação",
        observacao: ref?.observacao || "sem observação",
        meta_execucao_percentual: toNumber(ref?.meta_execucao_percentual),
        execucao_indicador: toNumber(ref?.execucao_percentual)
      };
    });
  }

  function classifyExecution(percent) {
    if (percent >= 100) return { cls: "alert", text: "Crítica" };
    if (percent >= 90) return { cls: "warn", text: "Atenção" };
    return { cls: "ok", text: "Controlada" };
  }

  function classifyRisco(risco) {
    const value = String(risco || "").toLowerCase();
    if (value === "alto") return { cls: "alert", text: "Risco alto" };
    if (value === "medio" || value === "médio") return { cls: "warn", text: "Risco médio" };
    return { cls: "ok", text: "Risco baixo" };
  }

  function renderKPIs(target, metrics) {
    if (!target) return;
    target.innerHTML = metrics.map(item => `
      <article class="kpi">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}</div>
        <div class="sub">${item.sub || ""}</div>
      </article>
    `).join("");
  }

  function renderTable(target, rows, mode) {
    if (!target) return;

    const extraHeader = mode === "controle"
      ? "<th>Risco</th>"
      : mode === "legislativo"
        ? "<th>Alerta</th>"
        : "<th>Meta</th>";

    const extraCell = (row) => {
      if (mode === "controle") {
        const risco = classifyRisco(row.risco);
        return `<td><span class="status ${risco.cls}">${risco.text}</span></td>`;
      }

      if (mode === "legislativo") {
        return `<td>${row.alerta || "sem informação"}</td>`;
      }

      return `<td>${row.meta_execucao_percentual ? `${numberBR(row.meta_execucao_percentual, 1)}%` : "-"}</td>`;
    };

    target.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Secretaria</th>
            <th>Receita</th>
            <th>Despesa paga</th>
            <th>Saldo</th>
            <th>Execução</th>
            ${extraHeader}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => {
            const status = classifyExecution(row.execucao);
            const safePercent = Math.min(Math.max(row.execucao, 0), 100);
            return `
              <tr>
                <td>${row.secretaria}</td>
                <td>${currencyBRL(row.receita_arrecadada)}</td>
                <td>${currencyBRL(row.despesa_paga)}</td>
                <td>${currencyBRL(row.saldo)}</td>
                <td>
                  <div class="progress"><span style="width:${safePercent.toFixed(1)}%"></span></div>
                  ${numberBR(row.execucao, 1)}%
                </td>
                ${extraCell(row)}
                <td><span class="status ${status.cls}">${status.text}</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  function renderInsights(target, items) {
    if (!target) return;
    target.innerHTML = items.map(text => `<div class="insight">${text}</div>`).join("");
  }

  function preencherFiltro(secretarias, mode) {
    const select = document.getElementById("filtro-secretaria");
    if (!select) return;

    select.innerHTML = `<option value="">Todas as Secretarias</option>`;

    const nomes = [...new Set(secretarias.map(s => s.secretaria))];
    nomes.forEach(nome => {
      const opt = document.createElement("option");
      opt.value = nome;
      opt.textContent = nome;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      aplicarFiltro(select.value, mode);
    });
  }

  function aplicarFiltro(secretaria, mode) {
    const target = document.getElementById("tabela-secretarias");
    if (!target) return;

    const filtrado = secretaria
      ? dadosGlobais.filter(d => d.secretaria === secretaria)
      : dadosGlobais;

    renderTable(target, filtrado, mode);
    gerarAlertas(filtrado, mode);
  }

  function gerarAlertas(data, mode) {
    const container = document.getElementById("alertas");
    if (!container) return;

    const alertas = data.filter(d =>
      d.execucao >= 100 ||
      d.saldo < 0 ||
      String(d.risco || "").toLowerCase() === "alto"
    );

    if (!alertas.length) {
      container.innerHTML = `
        <div class="insight">
          Nenhum alerta crítico foi identificado na leitura atual.
        </div>
      `;
      return;
    }

    container.innerHTML = alertas.map(a => {
      const prefixo = mode === "controle"
        ? "Conformidade"
        : mode === "legislativo"
          ? "Fiscalização"
          : "Gestão";

      return `
        <div class="insight">
          <strong>${prefixo}:</strong> ${a.secretaria} com execução de ${numberBR(a.execucao, 1)}%, saldo de ${currencyBRL(a.saldo)} e alerta: ${a.alerta || "sem informação"}.
        </div>
      `;
    }).join("");
  }

  function prepararUploadLocal() {
    const input = document.getElementById("upload-arquivo");
    const status = document.getElementById("upload-status");

    if (!input || !status) return;

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = function(evt) {
        try {
          const texto = evt.target.result;
          const dados = parseCSV(texto);

          if (!dados.length) {
            status.textContent = "Arquivo vazio ou inválido.";
            return;
          }

          const nome = file.name.toLowerCase();

          if (nome.includes("receita")) {
            salvarBaseLocal("evb_receitas", dados);
            status.textContent = "Arquivo de receitas salvo localmente.";
          } else if (nome.includes("despesa")) {
            salvarBaseLocal("evb_despesas", dados);
            status.textContent = "Arquivo de despesas salvo localmente.";
          } else if (nome.includes("servidor")) {
            salvarBaseLocal("evb_servidores", dados);
            status.textContent = "Arquivo de servidores salvo localmente.";
          } else {
            status.textContent = "Use receita, despesa ou servidor no nome do arquivo.";
            return;
          }

          setTimeout(() => {
            window.location.reload();
          }, 700);
        } catch (error) {
          console.error(error);
          status.textContent = "Erro ao processar arquivo.";
        }
      };

      reader.readAsText(file);
    });
  }

  function gerarInsightsExecutivo(data, painelGeral) {
    const out = [];
    const criticas = data.filter(item => item.execucao >= 100);
    const negativas = data.filter(item => item.saldo < 0);
    const altas = data.filter(item => String(item.risco || "").toLowerCase() === "alto");

    out.push(`Receita total arrecadada: ${currencyBRL(painelGeral.receita_total || 0)}.`);
    out.push(`Despesa paga total: ${currencyBRL(painelGeral.despesa_paga_total || 0)}.`);
    out.push(`Execução média registrada: ${numberBR(painelGeral.execucao_media_percentual || 0, 2)}%.`);

    if (criticas.length) {
      out.push(`Há ${criticas.length} secretaria(s) com execução crítica, exigindo verificação imediata de saldo e cronograma financeiro.`);
    }

    if (negativas.length) {
      out.push(`Foram identificadas ${negativas.length} secretaria(s) com saldo negativo, recomendando análise gerencial prioritária.`);
    }

    if (altas.length) {
      out.push(`Secretarias em risco alto: ${altas.map(x => x.secretaria).join(", ")}.`);
    }

    out.push("Sugestão de IA: consolidar parecer mensal por secretaria com foco em execução, risco e justificativa gerencial.");
    return out;
  }

  function gerarInsightsLegislativo(data, painelGeral) {
    const out = [];
    const maiores = [...data].sort((a, b) => b.despesa_paga - a.despesa_paga).slice(0, 3);
    const alertas = data.filter(item => item.execucao >= 100 || item.saldo < 0);

    out.push(`Execução média observada no período: ${numberBR(painelGeral.execucao_media_percentual || 0, 2)}%.`);

    if (maiores.length) {
      out.push(`As maiores despesas pagas concentram-se em ${maiores.map(x => x.secretaria).join(", ")}.`);
    }

    if (alertas.length) {
      out.push(`Há ${alertas.length} secretaria(s) que merecem aprofundamento em requerimentos, audiências ou fiscalização temática.`);
    }

    out.push("Sugestão de IA: gerar roteiro automático de fiscalização por comissão, secretaria e alerta encontrado.");
    return out;
  }

  function gerarInsightsControle(data, painelGeral) {
    const out = [];
    const riscosAltos = data.filter(item => String(item.risco || "").toLowerCase() === "alto");
    const negativos = data.filter(item => item.saldo < 0);

    out.push(`Saldo apurado no painel geral: ${currencyBRL(painelGeral.saldo_apurado || 0)}.`);
    out.push(`Quantidade de servidores na base: ${numberBR(painelGeral.quantidade_servidores || 0)}.`);

    if (riscosAltos.length) {
      out.push(`Foram identificadas ${riscosAltos.length} secretaria(s) classificadas com risco alto.`);
    }

    if (negativos.length) {
      out.push(`Foram encontradas ${negativos.length} secretaria(s) com indício de pressão orçamentária pelo saldo negativo.`);
    }

    out.push("Sugestão de IA: emitir parecer preventivo com ranking de risco, saldo e execução por secretaria.");
    return out;
  }

  function gerarRelatorioExecutivoFormal(data, painelGeral) {
    const criticas = data.filter(item => item.execucao >= 100).map(item => item.secretaria);
    const atencao = data
      .filter(item => item.execucao >= 90 && item.execucao < 100)
      .map(item => item.secretaria);

    return `
      <div class="insight">
        <strong>Relatório Automático de IA</strong><br><br>
        Receita consolidada: ${currencyBRL(painelGeral.receita_total || 0)}.<br>
        Despesa paga consolidada: ${currencyBRL(painelGeral.despesa_paga_total || 0)}.<br>
        Saldo apurado: ${currencyBRL(painelGeral.saldo_apurado || 0)}.<br>
        Execução média: ${numberBR(painelGeral.execucao_media_percentual || 0, 2)}%.<br><br>
        ${
          criticas.length
            ? `Secretarias em condição crítica: ${criticas.join(", ")}.`
            : "Não foram identificadas secretarias em condição crítica nesta leitura."
        }<br>
        ${
          atencao.length
            ? `Secretarias em atenção: ${atencao.join(", ")}.`
            : "Não foram identificadas secretarias em faixa intermediária de atenção."
        }<br><br>
        Recomendação: manter rotina de monitoramento, conciliar execução financeira com metas físicas e registrar justificativas gerenciais por secretaria.
      </div>
    `;
  }

  async function initDashboard(mode) {
    const receitasLocal = lerBaseLocal("evb_receitas");
    const despesasLocal = lerBaseLocal("evb_despesas");
    const servidoresLocal = lerBaseLocal("evb_servidores");

    const [receitasPadrao, despesasPadrao, servidoresPadrao, indicadores] = await Promise.all([
      loadCSV("/executivo-vilabela-mt/dados/receitas.csv"),
      loadCSV("/executivo-vilabela-mt/dados/despesas.csv"),
      loadCSV("/executivo-vilabela-mt/dados/servidores.csv"),
      loadJSON("/executivo-vilabela-mt/dados/indicadores.json")
    ]);

    const receitas = receitasLocal || receitasPadrao;
    const despesas = despesasLocal || despesasPadrao;
    const servidores = servidoresLocal || servidoresPadrao;

    indicadoresGlobais = indicadores;

    let aggregate = groupBySecretaria(receitas, despesas);
    aggregate = enrichWithIndicadores(aggregate, indicadores);
    dadosGlobais = aggregate;

    const totalReceita = sumBy(receitas, "valor_arrecadado");
    const totalDespesaEmpenhada = sumBy(despesas, "valor_empenhado");
    const totalDespesaLiquidada = sumBy(despesas, "valor_liquidado");
    const totalDespesaPaga = sumBy(despesas, "valor_pago");
    const saldo = totalReceita - totalDespesaPaga;
    const execucaoMedia = totalReceita > 0 ? (totalDespesaPaga / totalReceita) * 100 : 0;
    const totalServidores = servidores.length;
    const totalSecretarias = uniqueCount(aggregate, "secretaria");

    const painelGeral = indicadores?.painel_geral || {
      receita_total: totalReceita,
      despesa_empenhada_total: totalDespesaEmpenhada,
      despesa_liquidada_total: totalDespesaLiquidada,
      despesa_paga_total: totalDespesaPaga,
      saldo_apurado: saldo,
      execucao_media_percentual: execucaoMedia,
      quantidade_servidores: totalServidores
    };

    const kpiTarget = document.getElementById("kpis");
    const tableTarget = document.getElementById("tabela-secretarias");
    const insightsTarget = document.getElementById("insights");
    const updatedAt = document.getElementById("atualizado-em");
    const resumo = document.getElementById("resumo-extra");

    if (updatedAt) {
      updatedAt.textContent = indicadores.atualizado_em || "sem data";
    }

    const kpis = mode === "executivo"
      ? [
          { label: "Receita Arrecadada", value: currencyBRL(totalReceita), sub: "Base consolidada do período" },
          { label: "Despesa Paga", value: currencyBRL(totalDespesaPaga), sub: "Execução financeira" },
          { label: "Saldo", value: currencyBRL(saldo), sub: saldo >= 0 ? "Situação positiva" : "Situação deficitária" },
          { label: "Secretarias", value: numberBR(totalSecretarias), sub: "Áreas monitoradas" }
        ]
      : mode === "legislativo"
        ? [
            { label: "Execução Média", value: `${numberBR(execucaoMedia, 2)}%`, sub: "Panorama do período" },
            { label: "Despesa Empenhada", value: currencyBRL(totalDespesaEmpenhada), sub: "Compromissos assumidos" },
            { label: "Despesa Paga", value: currencyBRL(totalDespesaPaga), sub: "Pagamentos efetuados" },
            { label: "Servidores", value: numberBR(totalServidores), sub: "Base funcional" }
          ]
        : [
            { label: "Saldo Apurado", value: currencyBRL(saldo), sub: saldo >= 0 ? "Sem déficit global" : "Pressão orçamentária" },
            { label: "Execução Média", value: `${numberBR(execucaoMedia, 2)}%`, sub: "Indicador agregado" },
            { label: "Riscos Altos", value: numberBR(aggregate.filter(x => String(x.risco || "").toLowerCase() === "alto").length), sub: "Secretarias críticas" },
            { label: "Servidores", value: numberBR(totalServidores), sub: "Base funcional" }
          ];

    renderKPIs(kpiTarget, kpis);
    renderTable(tableTarget, aggregate, mode);
    preencherFiltro(aggregate, mode);
    gerarAlertas(aggregate, mode);
    prepararUploadLocal();

    if (mode === "executivo") {
      renderInsights(insightsTarget, gerarInsightsExecutivo(aggregate, painelGeral));
      insightsTarget.innerHTML += gerarRelatorioExecutivoFormal(aggregate, painelGeral);
    } else if (mode === "legislativo") {
      renderInsights(insightsTarget, gerarInsightsLegislativo(aggregate, painelGeral));
    } else {
      renderInsights(insightsTarget, gerarInsightsControle(aggregate, painelGeral));
    }

    if (resumo) {
      resumo.innerHTML = `
        <strong>Município:</strong> ${indicadores.municipio || "-"}<br>
        <strong>Período:</strong> ${indicadores.periodo_referencia || "-"}<br>
        <strong>Receita total:</strong> ${currencyBRL(painelGeral.receita_total || 0)}<br>
        <strong>Despesa paga total:</strong> ${currencyBRL(painelGeral.despesa_paga_total || 0)}<br>
        <strong>Saldo apurado:</strong> ${currencyBRL(painelGeral.saldo_apurado || 0)}<br>
        <strong>Execução média:</strong> ${numberBR(painelGeral.execucao_media_percentual || 0, 2)}%
      `;
    }

    if (typeof preencherCabecalhoUsuario === "function") {
      preencherCabecalhoUsuario();
    }
  }

  return { initDashboard };
})();
