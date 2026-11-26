import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import express from "express";
import type { ErrorRequestHandler } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { banco } from "./banco";
const app = express();
app.use(express.json());
// Aula 3: a lista mostra as tarefas de TODOS os usuários
// O SELECT que as duas rotas usam. Os "AS" trocam o nome da coluna
// do jeito do banco (criada_em) para o jeito do TypeScript (criadaEm).
const SELECT_TAREFAS = `
SELECT id, titulo, descricao, destino, origem,
DATE_FORMAT(data_viagem, '%Y-%m-%d') AS dataViagem,
DATE_FORMAT(data_retorno, '%Y-%m-%d') AS dataRetorno,
motivo, prioridade,
CASE status
  WHEN 'em_andamento' THEN 'a fazer'
  WHEN 'concluida' THEN 'feito'
  ELSE status
END AS status,
DATE_FORMAT(prazo, '%Y-%m-%d') AS prazo,
criada_em AS criadaEm
FROM tarefas`;
// Todas as tarefas
app.get("/api/tarefas", async (_req, res) => {
const [linhas] = await banco.execute<RowDataPacket[]>(
`${SELECT_TAREFAS} ORDER BY id`,
[] // sem filtro: nenhum ? nesta consulta
);
// as tags chegam na Aula 6; por enquanto, uma lista vazia em cada tarefa
res.json(linhas.map((linha) => ({ ...linha, tags: [] })));
});
// Uma tarefa: pode não existir!
app.get("/api/tarefas/:id", async (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0) {
res.status(400).json({ erro: "O id da tarefa deve ser um número inteiro positivo." });
return;
}
const [linhas] = await banco.execute<RowDataPacket[]>(
`${SELECT_TAREFAS} WHERE id = ?`,
[id]);
if (linhas.length === 0) {
res.status(404).json({ erro: `Tarefa #${req.params.id} não encontrada.` });
return;
}
res.json({ ...linhas[0], tags: [] });
});

function isObjeto(valor: unknown): valor is Record<string, unknown> {
return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function isPrioridade(valor: unknown): valor is "baixa" | "media" | "alta" {
return valor === "baixa" || valor === "media" || valor === "alta";
}

function isDataValida(valor: string): boolean {
if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
const data = new Date(`${valor}T00:00:00.000Z`);
return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

app.post("/api/tarefas", async (req, res) => {
if (!isObjeto(req.body)) {
res.status(400).json({ erro: "O corpo da requisição deve ser um objeto JSON." });
return;
}

const { titulo, prioridade } = req.body;
if (typeof titulo !== "string" || titulo.trim().length < 3 || titulo.trim().length > 120) {
res.status(400).json({ erro: "O título deve ter entre 3 e 120 caracteres." });
return;
}
if (!isPrioridade(prioridade)) {
res.status(400).json({ erro: "A prioridade deve ser baixa, media ou alta." });
return;
}

const camposTexto = ["destino", "origem", "motivo"] as const;
if (camposTexto.some((campo) =>
req.body[campo] !== undefined &&
req.body[campo] !== null &&
typeof req.body[campo] !== "string"
)) {
res.status(400).json({ erro: "Destino, origem e motivo devem ser textos." });
return;
}

const destino = typeof req.body.destino === "string" ? req.body.destino.trim() || null : null;
const origem = typeof req.body.origem === "string" ? req.body.origem.trim() || null : null;
const motivo = typeof req.body.motivo === "string" ? req.body.motivo.trim() || null : null;
if ((destino?.length ?? 0) > 120 || (origem?.length ?? 0) > 120 || (motivo?.length ?? 0) > 255) {
res.status(400).json({ erro: "Destino e origem aceitam até 120 caracteres; motivo, até 255." });
return;
}

const dataViagem = typeof req.body.dataViagem === "string" && req.body.dataViagem !== ""
? req.body.dataViagem
: null;
const dataRetorno = typeof req.body.dataRetorno === "string" && req.body.dataRetorno !== ""
? req.body.dataRetorno
: null;
if (
(req.body.dataViagem !== undefined && req.body.dataViagem !== null && typeof req.body.dataViagem !== "string") ||
(req.body.dataRetorno !== undefined && req.body.dataRetorno !== null && typeof req.body.dataRetorno !== "string") ||
(dataViagem !== null && !isDataValida(dataViagem)) ||
(dataRetorno !== null && !isDataValida(dataRetorno))
) {
res.status(400).json({ erro: "As datas devem estar no formato AAAA-MM-DD." });
return;
}
if (dataViagem && dataRetorno && dataRetorno < dataViagem) {
res.status(400).json({ erro: "A data de retorno não pode ser anterior à data da viagem." });
return;
}

const [resultado] = await banco.execute<ResultSetHeader>(
`INSERT INTO tarefas
(titulo, destino, origem, data_viagem, data_retorno, motivo, prioridade)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
[titulo.trim(), destino, origem, dataViagem, dataRetorno, motivo, prioridade]
);
const [linhas] = await banco.execute<RowDataPacket[]>(
`${SELECT_TAREFAS} WHERE id = ?`,
[resultado.insertId]
);
res.status(201).json({ ...linhas[0], tags: [] });
});

app.put("/api/tarefas/:id", async (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0) {
res.status(400).json({ erro: "O id da tarefa deve ser um número inteiro positivo." });
return;
}
if (!isObjeto(req.body)) {
res.status(400).json({ erro: "O corpo da requisição deve ser um objeto JSON." });
return;
}

const { titulo, prioridade } = req.body;
if (typeof titulo !== "string" || titulo.trim().length < 3 || titulo.trim().length > 120) {
res.status(400).json({ erro: "O título deve ter entre 3 e 120 caracteres." });
return;
}
if (!isPrioridade(prioridade)) {
res.status(400).json({ erro: "A prioridade deve ser baixa, media ou alta." });
return;
}

const camposTexto = ["destino", "origem", "motivo"] as const;
if (camposTexto.some((campo) =>
req.body[campo] !== undefined &&
req.body[campo] !== null &&
typeof req.body[campo] !== "string"
)) {
res.status(400).json({ erro: "Destino, origem e motivo devem ser textos." });
return;
}

const destino = typeof req.body.destino === "string" ? req.body.destino.trim() || null : null;
const origem = typeof req.body.origem === "string" ? req.body.origem.trim() || null : null;
const motivo = typeof req.body.motivo === "string" ? req.body.motivo.trim() || null : null;
if ((destino?.length ?? 0) > 120 || (origem?.length ?? 0) > 120 || (motivo?.length ?? 0) > 255) {
res.status(400).json({ erro: "Destino e origem aceitam até 120 caracteres; motivo, até 255." });
return;
}

const dataViagem = typeof req.body.dataViagem === "string" && req.body.dataViagem !== "" ? req.body.dataViagem : null;
const dataRetorno = typeof req.body.dataRetorno === "string" && req.body.dataRetorno !== "" ? req.body.dataRetorno : null;
if (
(req.body.dataViagem !== undefined && req.body.dataViagem !== null && typeof req.body.dataViagem !== "string") ||
(req.body.dataRetorno !== undefined && req.body.dataRetorno !== null && typeof req.body.dataRetorno !== "string") ||
(dataViagem !== null && !isDataValida(dataViagem)) ||
(dataRetorno !== null && !isDataValida(dataRetorno))
) {
res.status(400).json({ erro: "As datas devem estar no formato AAAA-MM-DD." });
return;
}
if (dataViagem && dataRetorno && dataRetorno < dataViagem) {
res.status(400).json({ erro: "A data de retorno não pode ser anterior à data da viagem." });
return;
}

const [resultado] = await banco.execute<ResultSetHeader>(
`UPDATE tarefas SET titulo = ?, destino = ?, origem = ?, data_viagem = ?, data_retorno = ?, motivo = ?, prioridade = ? WHERE id = ?`,
[titulo.trim(), destino, origem, dataViagem, dataRetorno, motivo, prioridade, id]
);
if (resultado.affectedRows === 0) {
res.status(404).json({ erro: `Tarefa #${id} não encontrada.` });
return;
}
const [linhas] = await banco.execute<RowDataPacket[]>(
`${SELECT_TAREFAS} WHERE id = ?`,
[id]);
res.json({ ...linhas[0], tags: [] });
});

app.patch("/api/tarefas/:id/concluir", async (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0) {
res.status(400).json({ erro: "O id da tarefa deve ser um número inteiro positivo." });
return;
}
const [resultado] = await banco.execute<ResultSetHeader>(
"UPDATE tarefas SET status = 'concluida' WHERE id = ?",
[id]);
if (resultado.affectedRows === 0) {
res.status(404).json({ erro: `Tarefa #${id} não encontrada.` });
return;
}
const [linhas] = await banco.execute<RowDataPacket[]>(
`${SELECT_TAREFAS} WHERE id = ?`,
[id]);
res.json({ ...linhas[0], tags: [] });
});

app.delete("/api/tarefas/:id", async (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0) {
res.status(400).json({ erro: "O id da tarefa deve ser um número inteiro positivo." });
return;
}
const [resultado] = await banco.execute<ResultSetHeader>(
"DELETE FROM tarefas WHERE id = ?",
[id]);
if (resultado.affectedRows === 0) {
res.status(404).json({ erro: `Tarefa #${id} não encontrada.` });
return;
}
res.status(204).send();
});

app.use("/api", (_req, res) => {
res.status(404).json({ erro: "Rota da API não encontrada." });
});

const tratarErro: ErrorRequestHandler = (erro, _req, res, next) => {
console.error("Erro na API:", erro);
if (res.headersSent) {
next(erro);
return;
}
const codigo = typeof erro === "object" && erro !== null && "code" in erro
? erro.code
: undefined;
const bancoIndisponivel = ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"].includes(String(codigo));
res.status(bancoIndisponivel ? 503 : 500).json({
erro: bancoIndisponivel ? "Banco de dados indisponível." : "Erro interno da API.",
});
};
app.use(tratarErro);

app.listen(3001, "0.0.0.0", () => console.log("API do TaskFlow em http://localhost:3001"));