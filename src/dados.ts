import type { Tarefa } from "./tipos";
export const tarefas: Tarefa[] = [
  {
    id: 1,
    titulo: "Definir Destino",
    prioridade: "alta",
    status: "pendente",
    tags: ["destino", "ts"],
    criadaEm: new Date(),
  },
  {
    id: 2,
    titulo: "Comprar Passagens Aereas",
    prioridade: "alta",
    status: "pendente",
    tags: ["ticket"],
    criadaEm: new Date(),
  },
  {
    id: 3,
    titulo: "Fazer reserva em Hotel",
    descricao: "#110",
    prioridade: "alta",
    status: "a fazer",
    tags: ["reserva"],
    criadaEm: new Date(),
  },
  {
    id: 4,
    titulo: "Planejar visitas",
    prioridade: "media",
    status: "pendente",
    tags: ["locais", "ts"],
    criadaEm: new Date(),
  },
  {
    id: 5,
    titulo: "Controlar gastos durante o dia ",
    prioridade: "media",
    status: "pendente",
    tags: ["controle"],
    criadaEm: new Date(),
  },
 
];
