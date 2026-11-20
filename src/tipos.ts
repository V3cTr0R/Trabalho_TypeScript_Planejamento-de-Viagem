export type Prioridade = "baixa" | "media" | "alta";

export type Status = "pendente" | "concluida";

export interface Tarefa {
  id: number;
  titulo: string;
  prioridade: Prioridade;
  status: Status;
  tags: string[];
  // Campos da viagem (opcionais: a tarefa pode existir só com título)
  destino?: string;
  origem?: string;
  dataViagem?: string;
  dataRetorno?: string;
  motivo?: string;
}