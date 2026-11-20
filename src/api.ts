import type { Prioridade, Status, Tarefa } from "./tipos";

function isObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function isPrioridade(valor: unknown): valor is Prioridade {
  return valor === "baixa" || valor === "media" || valor === "alta";
}

function isStatus(valor: unknown): valor is Status {
  return valor === "pendente" || valor === "a fazer" || valor === "feito";
}

function isListaDeStrings(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((item: unknown) => typeof item === "string");
}

function converterTarefa(valor: unknown): Tarefa {
  if (!isObjeto(valor)) {
    throw new Error("A API retornou uma tarefa inválida.");
  }

  const { id, titulo, descricao, prioridade, status, tags, criadaEm } = valor;
  const dataCriacao = typeof criadaEm === "string" ? new Date(criadaEm) : null;

  if (
    typeof id !== "number" ||
    typeof titulo !== "string" ||
    (descricao !== undefined && descricao !== null && typeof descricao !== "string") ||
    !isPrioridade(prioridade) ||
    !isStatus(status) ||
    !isListaDeStrings(tags) ||
    dataCriacao === null ||
    Number.isNaN(dataCriacao.getTime())
  ) {
    throw new Error("A API retornou uma tarefa com dados inválidos.");
  }

  return {
    id,
    titulo,
    ...(typeof descricao === "string" ? { descricao } : {}),
    prioridade,
    status,
    tags,
    criadaEm: dataCriacao,
  };
}

export async function buscarTarefas(): Promise<Tarefa[]> {
  const resposta = await fetch("/api/tarefas");

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar as tarefas (HTTP ${resposta.status}).`);
  }

  const dados: unknown = await resposta.json();
  if (!Array.isArray(dados)) {
    throw new Error("A API retornou uma lista inválida.");
  }

  return dados.map(converterTarefa);
}
