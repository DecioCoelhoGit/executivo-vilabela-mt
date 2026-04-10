const BASE_PATH = "/executivo-vilabela-mt";

const PERFIS = {
  prefeito: {
    senha: "1234",
    destino: `${BASE_PATH}/dashboard/executivo.html`,
    label: "Prefeito / Executivo"
  },
  vereador: {
    senha: "1234",
    destino: `${BASE_PATH}/dashboard/legislativo.html`,
    label: "Vereador / Legislativo"
  },
  controle: {
    senha: "1234",
    destino: `${BASE_PATH}/dashboard/controle.html`,
    label: "Controle / Auditoria"
  }
};

function urlProjeto(path = "") {
  return `${BASE_PATH}${path}`;
}

function salvarSessao(usuario, perfil) {
  localStorage.setItem("evb_usuario", usuario);
  localStorage.setItem("evb_perfil", perfil);
  localStorage.setItem("evb_logado", "true");
}

function limparSessao() {
  localStorage.clear();
}

function sairSistema() {
  limparSessao();
  window.location.href = urlProjeto("/login.html");
}

function verificarSessao(perfisPermitidos = []) {
  const logado = localStorage.getItem("evb_logado") === "true";
  const perfil = localStorage.getItem("evb_perfil");

  if (!logado) {
    window.location.href = urlProjeto("/login.html");
    return;
  }

  if (perfisPermitidos.length && !perfisPermitidos.includes(perfil)) {
    window.location.href = PERFIS[perfil]?.destino || urlProjeto("/login.html");
  }
}

function preencherCabecalhoUsuario() {
  const el = document.getElementById("usuario-logado");
  if (!el) return;

  const usuario = localStorage.getItem("evb_usuario") || "Usuário";
  const perfil = localStorage.getItem("evb_perfil") || "";
  const label = PERFIS[perfil]?.label || perfil;

  el.textContent = `${usuario} • ${label}`;
    }
