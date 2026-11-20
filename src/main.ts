import { campo, elemento, selecao } from "./dom";
import { buscarTarefas } from "./api";
import type { Prioridade, Tarefa } from "./tipos";
import { adicionarTarefa, contarPendentes, transformar } from "./servicos";

elemento("nome-do-sistema").textContent = "TaskFlow";
elemento("versao").textContent = "v0.2.0";
elemento("data-de-hoje").textContent = new Date().toLocaleDateString("pt-BR");

// O estado do programa: a lista que está valendo agora
const lista: Tarefa[] = [];

/** Uma tarefa vira um <li> pronto para a tela. */
function criarItem(tarefa: Tarefa): HTMLLIElement {
  const item = document.createElement("li");
  item.className = `tarefa tarefa--${tarefa.prioridade}`;

  const titulo = document.createElement("h3");
  titulo.className = "tarefa__titulo";
  titulo.textContent = `#${tarefa.id} ${tarefa.titulo}`;

  const etiqueta = document.createElement("span");
  etiqueta.className = `etiqueta etiqueta--${tarefa.prioridade}`;
  etiqueta.textContent = tarefa.prioridade;

  // Detalhes da viagem (só entram se existirem)
  const detalhes: string[] = [];
  if (tarefa.origem && tarefa.destino) {
    detalhes.push(`${tarefa.origem} → ${tarefa.destino}`);
  } else if (tarefa.destino) {
    detalhes.push(`Destino: ${tarefa.destino}`);
  } else if (tarefa.origem) {
    detalhes.push(`Origem: ${tarefa.origem}`);
  }
  if (tarefa.dataViagem) detalhes.push(`Ida: ${formatarData(tarefa.dataViagem)}`);
  if (tarefa.dataRetorno) detalhes.push(`Volta: ${formatarData(tarefa.dataRetorno)}`);
  if (tarefa.motivo) detalhes.push(`Motivo: ${tarefa.motivo}`);

  const meta = document.createElement("p");
  meta.className = "tarefa__meta";
  meta.textContent = detalhes.join(" · ");

  item.append(titulo, etiqueta, meta);
  return item;
}

/** "2025-11-20" -> "20/11/2025" (sem depender de fuso horário) */
function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** A função que desenha a tela inteira a partir da lista. */
function desenhar(): void {
  const itens = transformar(lista, criarItem); // a função de alta ordem
  elemento("lista").replaceChildren(...itens);

  elemento("total").textContent = String(lista.length);
  elemento("pendentes").textContent = String(contarPendentes(lista));

  const aviso = elemento("comece-por");
  aviso.textContent =
    lista.length === 0
      ? "Nenhuma viagem cadastrada ainda. Preencha o formulário acima para começar."
      : "";
  aviso.hidden = lista.length > 0;
}

async function carregarTarefas(): Promise<void> {
  try {
    lista.push(...(await buscarTarefas()));
    elemento("erro").textContent = "";
    desenhar();
  } catch (erro) {
    elemento("erro").textContent =
      erro instanceof Error ? erro.message : "Não foi possível carregar as tarefas.";
    desenhar(); // mostra pelo menos o estado vazio e as estatísticas
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
      destino: campo("destino").value,
      origem: campo("origem").value,
      dataViagem: campo("data-viagem").value,
      dataRetorno: campo("data-retorno").value,
      motivo: campo("motivo").value,
    });

    // limpa o formulário e devolve o foco para o primeiro campo
    elemento<HTMLFormElement>("formulario").reset();
    campo("titulo").focus();

    desenhar(); // mudou a lista? desenhe de novo
  } catch (erro) {
    elemento("erro").textContent =
      erro instanceof Error ? erro.message : "Não foi possível adicionar a tarefa.";
  }
});

// validação amigável: some com a mensagem assim que o usuário digitar
campo("titulo").addEventListener("input", () => {
  elemento("erro").textContent = "";
});

desenhar();
void carregarTarefas();