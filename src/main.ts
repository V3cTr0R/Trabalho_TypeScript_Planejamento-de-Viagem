import { campo, elemento, selecao } from "./dom";
import {
  alterarTarefa,
  buscarTarefas,
  cadastrarTarefa,
  concluirTarefa,
  excluirTarefa,
} from "./api";
import type { Prioridade, Tarefa } from "./tipos";
import { transformar } from "./servicos";
elemento("nome-do-sistema").textContent = "Planejamento De Viagem";
elemento("versao").textContent = "v0.2.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// O estado do programa: a lista que está valendo agora
const lista: Tarefa[] = [];
let viagemEmEdicao: number | null = null;
// Uma tarefa vira um <li> pronto para a tela

function formatarData(data?: string): string | undefined {
  if (!data) return undefined;
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

function criarItem(tarefa: Tarefa): HTMLLIElement {
  const item = document.createElement("li");
  item.className = `tarefa tarefa--${tarefa.prioridade}`;
  const titulo = document.createElement("h3");
  titulo.className = "tarefa__titulo";
  titulo.textContent = `#${tarefa.id} ${tarefa.titulo}`;
  const etiqueta = document.createElement("span");
  etiqueta.className = `etiqueta etiqueta--${tarefa.prioridade}`;
  etiqueta.textContent = tarefa.prioridade;
  const meta = document.createElement("p");
  meta.className = "tarefa__meta";
  const dataViagem = formatarData(tarefa.dataViagem);
  const dataRetorno = formatarData(tarefa.dataRetorno);
  meta.textContent = [
    tarefa.destino && `Destino: ${tarefa.destino}`,
    tarefa.origem && `Origem: ${tarefa.origem}`,
    dataViagem && `Ida: ${dataViagem}`,
    dataRetorno && `Retorno: ${dataRetorno}`,
    tarefa.motivo && `Motivo: ${tarefa.motivo}`,
  ]
    .filter((detalhe): detalhe is string => Boolean(detalhe))
    .join(" · ");

  const acoes = document.createElement("div");
  acoes.className = "tarefa__acoes";

  const botaoAlterar = document.createElement("button");
  botaoAlterar.type = "button";
  botaoAlterar.className = "acao acao--alterar";
  botaoAlterar.textContent = "Alterar";
  botaoAlterar.addEventListener("click", () => iniciarEdicao(tarefa));

  const botaoConcluir = document.createElement("button");
  botaoConcluir.type = "button";
  botaoConcluir.className = "acao acao--concluir";
  botaoConcluir.textContent = tarefa.status === "feito" ? "Concluída" : "Concluir";
  botaoConcluir.disabled = tarefa.status === "feito";
  botaoConcluir.addEventListener("click", () => void concluir(tarefa.id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "acao acao--excluir";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => void excluir(tarefa.id));

  acoes.append(botaoAlterar, botaoConcluir, botaoExcluir);
  item.append(titulo, etiqueta, meta, acoes);
  return item;
}

// A função que desenha a tela inteira a partir da lista
function desenhar(): void {
  const itens = transformar(lista, criarItem); // a SUA função de alta ordem
  elemento("lista").replaceChildren(...itens);
  const aviso = elemento("comece-por");
  aviso.textContent = lista.length === 0 ? "Sem itens cadastrados" : "";
  aviso.hidden = lista.length > 0;
  let pendentes = 0;
  for (const tarefa of lista) {
    if (tarefa.status !== "feito") {
      pendentes++;
    }
  }
  elemento("total").textContent = String(lista.length);
  elemento("pendentes").textContent = String(pendentes);
}

async function carregarTarefas(): Promise<void> {
  try {
    lista.push(...(await buscarTarefas()));
    elemento("erro").textContent = "";
    desenhar();
  } catch (erro) {
    elemento("erro").textContent =
      erro instanceof Error
        ? erro.message
        : "Não foi possível carregar as tarefas.";
  }
}

function limparFormulario(): void {
  for (const id of ["titulo", "destino", "origem", "data-viagem", "data-retorno", "motivo"]) {
    campo(id).value = "";
  }
  selecao("prioridade").value = "media";
  viagemEmEdicao = null;
  const botaoCadastrar = document.querySelector<HTMLButtonElement>(
    '#formulario button[type="submit"]',
  );
  if (botaoCadastrar) botaoCadastrar.textContent = "Cadastrar";
  elemento("erro").textContent = "";
}

function iniciarEdicao(tarefa: Tarefa): void {
  viagemEmEdicao = tarefa.id;
  campo("titulo").value = tarefa.titulo;
  campo("destino").value = tarefa.destino ?? "";
  campo("origem").value = tarefa.origem ?? "";
  campo("data-viagem").value = tarefa.dataViagem ?? "";
  campo("data-retorno").value = tarefa.dataRetorno ?? "";
  campo("motivo").value = tarefa.motivo ?? "";
  selecao("prioridade").value = tarefa.prioridade;
  const botaoCadastrar = document.querySelector<HTMLButtonElement>(
    '#formulario button[type="submit"]',
  );
  if (botaoCadastrar) botaoCadastrar.textContent = "Salvar alteração";
  elemento("formulario").scrollIntoView({ behavior: "smooth", block: "start" });
  campo("titulo").focus();
}

async function cadastrar(): Promise<void> {
  const botao = document.querySelector<HTMLButtonElement>(
    '#formulario button[type="submit"]',
  );
  const botaoLimpar = document.querySelector<HTMLButtonElement>("#limpar");
  if (botao) botao.disabled = true;
  if (botaoLimpar) botaoLimpar.disabled = true;
  elemento("erro").textContent = "";
  try {
    const dados = {
      titulo: campo("titulo").value.trim(),
      destino: campo("destino").value.trim() || undefined,
      origem: campo("origem").value.trim() || undefined,
      dataViagem: campo("data-viagem").value || undefined,
      dataRetorno: campo("data-retorno").value || undefined,
      motivo: campo("motivo").value.trim() || undefined,
      prioridade: selecao("prioridade").value as Prioridade,
      tags: [],
    };
    if (viagemEmEdicao !== null) {
      const tarefaAtualizada = await alterarTarefa(viagemEmEdicao, dados);
      const indice = lista.findIndex((tarefa) => tarefa.id === viagemEmEdicao);
      if (indice >= 0) lista[indice] = tarefaAtualizada;
    } else {
      lista.push(await cadastrarTarefa(dados));
    }
    desenhar();
    limparFormulario();
  } catch (erro) {
    if (erro instanceof Error) {
      elemento("erro").textContent = erro.message;
    }
  } finally {
    if (botao) botao.disabled = false;
    if (botaoLimpar) botaoLimpar.disabled = false;
  }
}

async function concluir(id: number): Promise<void> {
  try {
    const tarefaAtualizada = await concluirTarefa(id);
    const indice = lista.findIndex((tarefa) => tarefa.id === id);
    if (indice >= 0) lista[indice] = tarefaAtualizada;
    desenhar();
  } catch (erro) {
    elemento("erro").textContent =
      erro instanceof Error ? erro.message : "Não foi possível concluir a viagem.";
  }
}

async function excluir(id: number): Promise<void> {
  if (!window.confirm("Deseja excluir esta viagem?")) return;
  try {
    await excluirTarefa(id);
    const indice = lista.findIndex((tarefa) => tarefa.id === id);
    if (indice >= 0) lista.splice(indice, 1);
    desenhar();
  } catch (erro) {
    elemento("erro").textContent =
      erro instanceof Error ? erro.message : "Não foi possível excluir a viagem.";
  }
}

elemento("limpar").addEventListener("click", limparFormulario);

// O formulário: a função abaixo é um CALLBACK — quem a chama é o navegador
elemento("formulario").addEventListener("submit", (evento) => {
  evento.preventDefault();
  void cadastrar();
});

function aplicarTema(tema: "claro" | "escuro"): void {
  document.documentElement.dataset.theme = tema;
  localStorage.setItem("theme", tema);
  const botao = elemento("botao-tema");
  botao.textContent = tema === "escuro" ? "☀️ Tema claro" : "🌙 Tema escuro";
  botao.setAttribute(
    "aria-label",
    tema === "escuro" ? "Ativar tema claro" : "Ativar tema escuro",
  );
}

const temaSalvo = localStorage.getItem("theme");
aplicarTema(temaSalvo === "escuro" ? "escuro" : "claro");

elemento("botao-tema").addEventListener("click", () => {
  aplicarTema(document.documentElement.dataset.theme === "escuro" ? "claro" : "escuro");
});

function entrar(usuario: string): void {
  localStorage.setItem("usuario-logado", usuario);
  elemento("login").classList.add("login--oculto");
  elemento("erro").textContent = "";
  void carregarTarefas();
}

interface ContaLocal {
  usuario: string;
  senha: string;
}

function carregarContas(): ContaLocal[] {
  const contas = localStorage.getItem("contas");
  if (!contas) return [];
  try {
    const dados: unknown = JSON.parse(contas);
    if (!Array.isArray(dados)) return [];
    return dados.filter(
      (conta): conta is ContaLocal =>
        typeof conta === "object" &&
        conta !== null &&
        typeof (conta as Record<string, unknown>).usuario === "string" &&
        typeof (conta as Record<string, unknown>).senha === "string",
    );
  } catch {
    return [];
  }
}

let criandoConta = false;

function configurarModoLogin(criarConta: boolean): void {
  criandoConta = criarConta;
  elemento("campo-confirmar-senha").hidden = !criarConta;
  elemento("botao-criar-conta").hidden = criarConta;
  elemento("botao-voltar-login").hidden = !criarConta;
  const botaoLogin = elemento("botao-login") as HTMLButtonElement;
  botaoLogin.textContent = criarConta ? "Cadastrar conta" : "Entrar";
  elemento("login-titulo").textContent = criarConta
    ? "Crie sua conta"
    : "Acesse o Planejamento";
  elemento("login-descricao").textContent = criarConta
    ? "Preencha os dados para cadastrar seu acesso."
    : "Entre para gerenciar suas viagens.";
  elemento("erro-login").textContent = "";
  campo("usuario").focus();
}

elemento("form-login").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const usuario = campo("usuario").value.trim();
  const senha = campo("senha").value;
  if (usuario.length < 2 || senha.length < 4) {
    elemento("erro-login").textContent =
      "Informe um usuário com pelo menos 2 caracteres e uma senha com 4 caracteres.";
    return;
  }
  elemento("erro-login").textContent = "";

  const contas = carregarContas();
  if (criandoConta) {
    const confirmarSenha = campo("confirmar-senha").value;
    if (senha !== confirmarSenha) {
      elemento("erro-login").textContent = "As senhas informadas não coincidem.";
      return;
    }
    if (contas.some((conta) => conta.usuario.toLowerCase() === usuario.toLowerCase())) {
      elemento("erro-login").textContent = "Já existe uma conta com este usuário.";
      return;
    }
    contas.push({ usuario, senha });
    localStorage.setItem("contas", JSON.stringify(contas));
    entrar(usuario);
    return;
  }

  if (contas.length > 0) {
    const conta = contas.find(
      (item) => item.usuario.toLowerCase() === usuario.toLowerCase() && item.senha === senha,
    );
    if (!conta) {
      elemento("erro-login").textContent = "Usuário ou senha inválidos.";
      return;
    }
  }
  entrar(usuario);
});

elemento("botao-criar-conta").addEventListener("click", () => {
  configurarModoLogin(true);
});

elemento("botao-voltar-login").addEventListener("click", () => {
  configurarModoLogin(false);
});

elemento("botao-sair").addEventListener("click", () => {
  localStorage.removeItem("usuario-logado");
  lista.splice(0);
  desenhar();
  campo("usuario").value = "";
  campo("senha").value = "";
  campo("confirmar-senha").value = "";
  elemento("login").classList.remove("login--oculto");
  configurarModoLogin(false);
  campo("usuario").focus();
});

const usuarioLogado = localStorage.getItem("usuario-logado");
if (usuarioLogado) {
  elemento("login").classList.add("login--oculto");
  desenhar();
  void carregarTarefas();
} else {
  desenhar();
  campo("usuario").focus();
}
