import type { Tarefa } from "./tipos";

/**
 * Carrega as tarefas iniciais de ./dados/tarefas.json.
 * Se o arquivo não existir (404) devolve lista vazia em vez de estourar erro,
 * então o app abre normalmente para você cadastrar do zero.
 */
export async function buscarTarefas(): Promise<Tarefa[]> {
  const resposta = await fetch("./dados/tarefas.json", { cache: "no-store" });

  if (resposta.status === 404) {
    return [];
  }

  if (!resposta.ok) {
    throw new Error(`Falha ao carregar as tarefas (HTTP ${resposta.status}).`);
  }

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error("O arquivo de dados não contém uma lista de tarefas.");
  }

  return dados as Tarefa[];
}