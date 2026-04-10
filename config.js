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

function urlProjeto(caminho = "") {
  return `${BASE_PATH}${caminho}`;
}

function salvarSessao(usuario, perfil) {
  localStorage.setItem("evb_usuario", usuario);
  localStorage.setItem("evb_perfil", perfil);
  localStorage.setItem("evb_logado", "true");
}

function limparSessao() {
  localStorage.removeItem("evb_usuario");
  localStorage.removeItem("evb_perfil");
  localStorage.removeItem("evb_logado");
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

  if (perfisPermitidos.length > 0 && !perfisPermitidos.includes(perfil)) {
    const destino = PERFIS[perfil]?.destino;
    if (destino) {
      window.location.href = destino;
    } else {
      sairSistema();
    }
  }
}

function obterUsuarioLogado() {
  return {
    usuario: localStorage.getItem("evb_usuario") || "Usuário",
    perfil: localStorage.getItem("evb_perfil") || "visitante"
  };
}

function preencherCabecalhoUsuario() {
  const el = document.getElementById("usuario-logado");
  if (!el) return;

  const { usuario, perfil } = obterUsuarioLogado();
  const nomePerfil = PERFIS[perfil]?.label || perfil;
  el.textContent = `${usuario} • ${nomePerfil}`;
}
