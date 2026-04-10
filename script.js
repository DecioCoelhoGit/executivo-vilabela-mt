const App = (() => {
  const BASE_PATH = "/executivo-vilabela-mt";
  const DATA_PATH = `${BASE_PATH}/dados`;

  const state = {
    receitas: [],
    despesas: [],
    servidores: [],
    indicadores: null,
    secretariaSelecionada: ""
  };

  function parseNumber(value) {
    if (value === null || value === undefined || value === "") return 0;
    const normalized = String(value).replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(Number(value || 0));
  }

  function formatNumber(value, digits = 1) {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(Number(value || 0));
  }

  function escapeHtml(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function csvToObjects(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (!lines.length) return [];

    const headers = splitCsvLine(lines[0]).map(h => h.trim());

    return lines.slice(1).filter(Boolean).map(line => {
      const values = splitCsvLine(line);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = (values[index] ?? "").trim();
      });

      return row;
    });
  }

  function splitCsvLine(line) {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && insideQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }

      if (char === "," && !insideQuotes) {
        result.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    result.push(current);
    return result;
  }

  async function fetchText(url) {
    const response = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha ao carregar ${url}`);
    }
    return response.text();
  }

  async function fetchJson(url) {
    const response = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha ao carregar ${url}`);
    }
    return response.json();
  }

  async function loadData() {
    const [receitasCsv, despesasCsv, servidoresCsv, indicadoresJson] = await Promise.all([
      fetchText(`${DATA_PATH}/receitas.csv`),
      fetchText(`${DATA_PATH}/despesas.csv`),
      fetchText(`${DATA_PATH}/servidores.csv`),
      fetchJson(`${DATA_PATH}/indicadores.json`)
    ]);

    state.receitas = csvToObjects(receitasCsv).map(item => ({
      ...item,
      valor_previsto: parseNumber(item.valor_previsto),
      valor_arrecadado: parseNumber(item.valor_arrecadado)
    }));

    state.despesas = csvToObjects(despesasCsv).map(item => ({
      ...item,
      valor_empenhado: parseNumber(item.valor_empenhado),
      valor_liquidado: parseNumber(item.valor_liquidado),
      valor_pago: parseNumber(item.valor_pago)
    }));

    state.servidores = csvToObjects(servidoresCsv).map(item => ({
      ...item,
      remuneracao_bruta: parseNumber(item.remuneracao_bruta),
      remuneracao_liquida: parseNumber(item.remuneracao_liquida)
    }));

    state.indicadores = indicadoresJson;
  }

  function getSecret
