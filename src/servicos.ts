import type { Tarefa } from "./tipos";

/**
 * Função de alta ordem: percorre a lista e devolve uma NOVA lista
 * com o resultado da função aplicada a cada item.
 * (Se fosse forEach, devolveria void e replaceChildren quebraria.)
 */
export function transformar<T, U>(lista: T[], fn: (item: T, indice: number) => U): U[] {
  const resultado: U[] = [];
  for (let i = 0; i < lista.length; i++) {
    resultado.push(fn(lista[i], i));
  }
  return resultado;
}

/** Descobre o próximo id livre (funciona mesmo com itens vindos da API). */
export function proximoId(lista: Tarefa[]): number {
  let maior = 0;
  for (const tarefa of lista) {
    if (tarefa.id > maior) maior = tarefa.id;
  }
  return maior + 1;
}

/**
 * Valida e adiciona uma tarefa na lista (muta o array de estado).
 * Lança Error com mensagem pronta para a tela quando o título está vazio.
 */
export function adicionarTarefa(
  lista: Tarefa[],
  dados: Omit<Tarefa, "id" | "status">,
): Tarefa {
  const titulo = (dados.titulo ?? "").trim();

  if (titulo === "") {
    throw new Error("Informe o título da tarefa.");
  }

  const nova: Tarefa = {
    ...dados,
    titulo,
    destino: dados.destino?.trim() || undefined,
    origem: dados.origem?.trim() || undefined,
    motivo: dados.motivo?.trim() || undefined,
    id: proximoId(lista),
    status: "pendente",
  };

  lista.push(nova);
  return nova;
}

/** Conta quantas tarefas ainda estão pendentes. */
export function contarPendentes(lista: Tarefa[]): number {
  let pendentes = 0;
  for (const tarefa of lista) {
    if (tarefa.status === "pendente") pendentes++;
  }
  return pendentes;
}