const PERFIS = {
  prefeito: {
    senha: "1234",
    destino: "dashboard/executivo.html",
    label: "Prefeito / Executivo"
  },
  vereador: {
    senha: "1234",
    destino: "dashboard/legislativo.html",
    label: "Vereador / Legislativo"
  },
  controle: {
    senha: "1234",
    destino: "dashboard/controle.html",
    label: "Controle / Auditoria"
  }
};

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
  const naPastaDashboard = window.location.pathname.includes("/dashboard/");
  window.location.href = naPastaDashboard ? "../login.html" : "login.html";
}

function verificarSessao(perfisPermitidos = []) {
  const logado = localStorage.getItem("evb_logado") === "true";
  const perfil = localStorage.getItem("evb_perfil");

  if (!logado) {
    const naPastaDashboard = window.location.pathname.includes("/dashboard/");
    window.location.href = naPastaDashboard ? "../login.html" : "login.html";
    return;
  }

  if (perfisPermitidos.length > 0 && !perfisPermitidos.includes(perfil)) {
    const destino = PERFIS[perfil]?.destino;
    if (destino) {
      const naPastaDashboard = window.location.pathname.includes("/dashboard/");
      window.location.href = naPastaDashboard ? `../${destino}` : destino;
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
