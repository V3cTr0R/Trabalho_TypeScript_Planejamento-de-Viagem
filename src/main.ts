import { campo, elemento, selecao } from "./dom";
import { buscarTarefas, cadastrarTarefa } from "./api";
import type { Prioridade, Tarefa } from "./tipos";
import { transformar } from "./servicos";
elemento("nome-do-sistema").textContent = "Planejamento De Viagem";
elemento("versao").textContent = "v0.2.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// O estado do programa: a lista que está valendo agora
const lista: Tarefa[] = [];
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
  item.append(titulo, etiqueta, meta);
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
    if (tarefa.status === "pendente") {
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
  elemento("erro").textContent = "";
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
    const tarefa = await cadastrarTarefa({
      titulo: campo("titulo").value.trim(),
      destino: campo("destino").value.trim() || undefined,
      origem: campo("origem").value.trim() || undefined,
      dataViagem: campo("data-viagem").value || undefined,
      dataRetorno: campo("data-retorno").value || undefined,
      motivo: campo("motivo").value.trim() || undefined,
      prioridade: selecao("prioridade").value as Prioridade,
      tags: [],
    });
    lista.push(tarefa);
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

elemento("limpar").addEventListener("click", limparFormulario);

// O formulário: a função abaixo é um CALLBACK — quem a chama é o navegador
elemento("formulario").addEventListener("submit", (evento) => {
  evento.preventDefault();
  void cadastrar();
});
8;
desenhar();
void carregarTarefas();
