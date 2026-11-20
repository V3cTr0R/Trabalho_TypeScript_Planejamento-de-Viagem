import { campo, elemento, selecao } from "./dom";
import { buscarTarefas } from "./api";
import type { Prioridade, Tarefa } from "./tipos";
import { adicionarTarefa, transformar } from "./servicos";
elemento("nome-do-sistema").textContent = "TaskFlow";
elemento("versao").textContent = "v0.2.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");


// O estado do programa: a lista que está valendo agora
const lista: Tarefa[] = [];
// Uma tarefa vira um <li> pronto para a tela

function criarItem(tarefa: Tarefa): HTMLLIElement {
  const item = document.createElement("li");
  item.className = `tarefa tarefa--${tarefa.prioridade}`;
  const titulo = document.createElement("h3");
  titulo.className = "tarefa__titulo";
  titulo.textContent = `#${tarefa.id} ${tarefa.titulo}`;
  const etiqueta = document.createElement("span");
  etiqueta.className = `etiqueta etiqueta--${tarefa.prioridade}`;
  etiqueta.textContent = tarefa.prioridade;
  item.append(titulo, etiqueta);
  return item;
}

// A função que desenha a tela inteira a partir da lista
function desenhar(): void {
  const itens = transformar(lista, criarItem); // a SUA função de alta ordem
  elemento("lista").replaceChildren(...itens);
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
      erro instanceof Error ? erro.message : "Não foi possível carregar as tarefas.";
  }
}


// O formulário: a função abaixo é um CALLBACK — quem a chama é o navegador
elemento("formulario").addEventListener("submit", (evento) => {
  evento.preventDefault(); // sem isto, a página recarrega e tudo se perde
  elemento("erro").textContent = "";
  try {
    adicionarTarefa(lista, {
      titulo: campo("titulo").value.trim(),
      prioridade: selecao("prioridade").value as Prioridade,
      tags: [],
    });
    campo("titulo").value = "";
    desenhar(); // mudou a lista? desenhe de novo
  } catch (erro) {
    if (erro instanceof Error) {
      elemento("erro").textContent = erro.message;
    }
  }
});
8;
desenhar();
void carregarTarefas();

