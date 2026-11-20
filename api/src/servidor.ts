import "dotenv/config"; // primeira linha: carrega o .env antes de tudo
import express from "express";
import type { ErrorRequestHandler } from "express";
import type { RowDataPacket } from "mysql2";
import { banco } from "./banco";
const app = express();
app.use(express.json());
// Aula 3: a lista mostra as tarefas de TODOS os usuários
// O SELECT que as duas rotas usam. Os "AS" trocam o nome da coluna
// do jeito do banco (criada_em) para o jeito do TypeScript (criadaEm).
const SELECT_TAREFAS = `
SELECT id, titulo, descricao, prioridade,
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

app.listen(3000, "0.0.0.0", () => console.log("API do TaskFlow em http://localhost:3000"));