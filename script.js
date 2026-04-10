const App = (() => {
  let dadosGlobais = [];

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).filter(Boolean).map(line => {
      const cols = line.split(',').map(c => c.trim());
      const row = {};

      headers.forEach((h, i) => {
        row[h] = cols[i] ?? '';
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

  function currencyBRL(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value) || 0);
  }

  function integerBR(value) {
    return new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
  }

  function sumBy(rows, field) {
    return rows.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
  }

  function groupBySecretaria(receitas, despesas) {
    const map = new Map();

    receitas.forEach(row => {
      const key = row.secretaria;
      if (!map.has(key)) map.set(key, { secretaria: key, receita: 0, despesa: 0 });
      map.get(key).receita += Number(row.valor) || 0;
    });

    despesas.forEach(row => {
      const key = row.secretaria;
      if (!map.has(key)) map.set(key, { secretaria: key, receita: 0, despesa: 0 });
      map.get(key).despesa += Number(row.valor) || 0;
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      saldo: item.receita - item.despesa,
      execucao: item.receita > 0 ? (item.despesa / item.receita) * 100 : 0
    }));
  }

  function classifyExecution(percent) {
    if (percent >= 95) return { cls: 'alert', text: 'Crítica' };
    if (percent >= 75) return { cls: 'warn', text: 'Atenção' };
    return { cls: 'ok', text: 'Controlada' };
  }

  function generateExecutiveInsights(data) {
    const out = [];
    const critical = data.filter(item => item.execucao >= 95);
    const attention = data.filter(item => item.execucao >= 75 && item.execucao < 95);
    const positive = data.filter(item => item.saldo > 0);

    if (critical.length) {
      out.push(`Há ${critical.length} secretaria(s) com execução crítica, exigindo verificação imediata de empenho, liquidação e saldo orçamentário.`);
    }
    if (attention.length) {
      out.push(`Foram identificadas ${attention.length} secretaria(s) em faixa de atenção, recomendando monitoramento semanal.`);
    }
    if (positive.length) {
      out.push(`${positive.length} secretaria(s) mantêm saldo positivo, o que favorece planejamento preventivo.`);
    }
    if (!out.length) {
      out.push('Os dados analisados não indicaram alertas relevantes nesta leitura inicial.');
    }

    out.push('Sugestão de IA: consolidar relatórios mensais por secretaria e gerar parecer executivo automatizado.');
    return out;
  }

  function generateLegislativeInsights(data) {
    const out = [];
    const topExpense = [...data].sort((a, b) => b.despesa - a.despesa).slice(0, 3);

    if (topExpense.length) {
      out.push(`As maiores despesas concentram-se em ${topExpense.map(x => x.secretaria).join(', ')}.`);
    }

    out.push('Sugestão de IA: criar roteiro automático de fiscalização por comissão temática.');
    out.push('Sugestão de governança: vincular despesa, meta física e programa de governo na mesma consulta.');
    return out;
  }

  function generateControlInsights(data) {
    const out = [];
    const alerts = data.filter(item => item.execucao >= 95 || item.saldo < 0);

    if (alerts.length) {
      out.push(`Foram detectadas ${alerts.length} ocorrência(s) com potencial risco de conformidade ou pressão orçamentária.`);
    }

    out.push('Sugestão de IA: emitir parecer preventivo com ranking de risco por secretaria.');
    out.push('Próximo passo: integrar contratos, licitações e restos a pagar para análise ampliada.');
    return out;
  }

  function renderKPIs(target, metrics) {
    target.innerHTML = metrics.map(item => `
      <article class="kpi">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}</div>
        <div class="sub">${item.sub || ''}</div>
      </article>
    `).join('');
  }

  function renderTable(target, rows) {
    target.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Secretaria</th>
            <th>Receita</th>
            <th>Despesa</th>
            <th>Saldo</th>
            <th>Execução</th>
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
                <td>${currencyBRL(row.receita)}</td>
                <td>${currencyBRL(row.despesa)}</td>
                <td>${currencyBRL(row.saldo)}</td>
                <td>
                  <div class="progress"><span style="width:${safePercent.toFixed(1)}%"></span></div>
                  ${safePercent.toFixed(1)}%
                </td>
                <td><span class="status ${status.cls}">${status.text}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderInsights(target, items) {
    target.innerHTML = items.map(text => `<div class="insight">${text}</div>`).join('');
  }

  function preencherFiltro(secretarias) {
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
      aplicarFiltro(select.value);
    });
  }

  function aplicarFiltro(secretaria) {
    const target = document.getElementById("tabela-secretarias");
    if (!target) return;

    const filtrado = secretaria
      ? dadosGlobais.filter(d => d.secretaria === secretaria)
      : dadosGlobais;

    renderTable(target, filtrado);
    gerarAlertas(filtrado);
  }

  function gerarAlertas(data) {
    const container = document.getElementById("alertas");
    if (!container) return;

    const alertas = data.filter(d => d.execucao >= 90 || d.saldo < 0);

    if (!alertas.length) {
      container.innerHTML = `
        <div class="insight">
          Nenhum alerta crítico foi identificado na leitura atual.
        </div>
      `;
      return;
    }

    container.innerHTML = alertas.map(a => `
      <div class="insight">
        <strong>Alerta:</strong> ${a.secretaria} com execução de ${a.execucao.toFixed(1)}% e saldo de ${currencyBRL(a.saldo)}.
      </div>
    `).join("");
  }

  function salvarBaseLocal(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
  }

  function lerBaseLocal(chave) {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : null;
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
            status.textContent = "Nome do arquivo não identificado. Use receita, despesa ou servidor no nome.";
            return;
          }

          setTimeout(() => {
            window.location.reload();
          }, 800);
        } catch (error) {
          console.error(error);
          status.textContent = "Erro ao processar arquivo.";
        }
      };

      reader.readAsText(file);
    });
  }

  function gerarRelatorioExecutivoFormal(data, totalReceita, totalDespesa, saldo, execucaoTotal) {
    const criticas = data.filter(item => item.execucao >= 95).map(item => item.secretaria);
    const atencao = data.filter(item => item.execucao >= 75 && item.execucao < 95).map(item => item.secretaria);

    return `
      <div class="insight">
        <strong>Relatório Automático de IA</strong><br><br>
        Receita consolidada: ${currencyBRL(totalReceita)}.<br>
        Despesa consolidada: ${currencyBRL(totalDespesa)}.<br>
        Saldo apurado: ${currencyBRL(saldo)}.<br>
        Execução geral: ${execucaoTotal.toFixed(1)}%.<br><br>
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
      loadCSV("../dados/receitas.csv"),
      loadCSV("../dados/despesas.csv"),
      loadCSV("../dados/servidores.csv"),
      loadJSON("../dados/indicadores.json")
    ]);

    const receitas = receitasLocal || receitasPadrao;
    const despesas = despesasLocal || despesasPadrao;
    const servidores = servidoresLocal || servidoresPadrao;

    const aggregate = groupBySecretaria(receitas, despesas);
    dadosGlobais = aggregate;

    const totalReceita = sumBy(receitas, 'valor');
    const totalDespesa = sumBy(despesas, 'valor');
    const saldo = totalReceita - totalDespesa;
    const execucaoTotal = totalReceita > 0 ? (totalDespesa / totalReceita) * 100 : 0;
    const totalServidores = servidores.length;

    const kpiTarget = document.getElementById('kpis');
    const tableTarget = document.getElementById('tabela-secretarias');
    const insightsTarget = document.getElementById('insights');
    const updatedAt = document.getElementById('atualizado-em');
    const resumo = document.getElementById('resumo-extra');

    if (updatedAt) {
      updatedAt.textContent = indicadores.atualizado_em || 'sem data';
    }

    renderKPIs(kpiTarget, [
      { label: 'Receita Total', value: currencyBRL(totalReceita), sub: 'Base consolidada do período' },
      { label: 'Despesa Total', value: currencyBRL(totalDespesa), sub: 'Execução registrada' },
      { label: 'Saldo', value: currencyBRL(saldo), sub: saldo >= 0 ? 'Situação positiva' : 'Situação deficitária' },
      { label: 'Servidores', value: integerBR(totalServidores), sub: 'Quantidade cadastrada' }
    ]);

    renderTable(tableTarget, aggregate);
    preencherFiltro(aggregate);
    gerarAlertas(aggregate);
    prepararUploadLocal();

    if (mode === 'executivo') {
      renderInsights(insightsTarget, generateExecutiveInsights(aggregate));
      insightsTarget.innerHTML += gerarRelatorioExecutivoFormal(
        aggregate,
        totalReceita,
        totalDespesa,
        saldo,
        execucaoTotal
      );
    } else if (mode === 'legislativo') {
      renderInsights(insightsTarget, generateLegislativeInsights(aggregate));
    } else {
      renderInsights(insightsTarget, generateControlInsights(aggregate));
    }

    if (resumo) {
      resumo.innerHTML = `
        <strong>Execução geral:</strong> ${execucaoTotal.toFixed(1)}%<br>
        <strong>Meta fiscal monitorada:</strong> ${indicadores.meta_fiscal}<br>
        <strong>Observação:</strong> ${indicadores.observacao}
      `;
    }

    if (typeof preencherCabecalhoUsuario === "function") {
      preencherCabecalhoUsuario();
    }
  }

  return { initDashboard };
})();
