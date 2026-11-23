# Planejamento de Viagem

Aplicação TypeScript com FrontEnd servido pelo Vite e uma API Express que lê a lista de tarefas de viagem no MariaDB/MySQL.

## Requisitos

- Node.js 20.19+ (ou 22.12+) e npm
- MariaDB ou MySQL em execução
- Cliente de linha de comando `mariadb` ou `mysql`

## Configuração do banco

Na raiz do projeto, crie o banco e a tabela. A tabela começa vazia:

```bash
mariadb -u root -p < database/setup-taskflow.sql
```

Em instalações Linux em que o usuário `root` do banco usa autenticação por socket, execute `sudo mariadb < database/setup-taskflow.sql`.

Crie um usuário local para a API. Abra o cliente (`mariadb -u root -p` ou `sudo mariadb`) e execute os comandos abaixo, trocando o texto da senha por uma senha local:

```sql
CREATE USER 'taskflow_api'@'127.0.0.1' IDENTIFIED BY 'SENHA_LOCAL_FORTE';
GRANT SELECT, INSERT ON taskflow.* TO 'taskflow_api'@'127.0.0.1';
```

Copie o exemplo de configuração e use a mesma senha:

```bash
cp api/.env.exemplo api/.env
```

Edite `api/.env` e substitua `DB_SENHA`. Esse arquivo é local e não deve ser enviado ao Git. A permissão `INSERT` é necessária para o botão **Cadastrar** salvar novos registros.

> Não use `database/viagens.sql` para inicializar este projeto: ele contém `DROP DATABASE IF EXISTS taskflow` e pode apagar dados existentes. O arquivo `database/setup-taskflow.sql` cria a estrutura sem inserir dados de exemplo.

Se você já criou o banco com uma versão anterior do projeto, aplique uma vez a migração de campos de viagem:

```bash
mariadb -u root -p < database/migrate-travel-fields.sql
```

No Linux com autenticação por socket, use `sudo mariadb < database/migrate-travel-fields.sql`.

Se o banco ainda contém os itens de exemplo de uma versão anterior, depois da migração remova somente esses registros conhecidos com:

```bash
mariadb -u root -p < database/remove-example-data.sql
```

No Linux com autenticação por socket, use `sudo mariadb < database/remove-example-data.sql`.

## Instalação

Na raiz do projeto:

```bash
npm install
cd api
npm install
```

## Executar

Inicie os servidores em **dois terminais**, a partir da raiz do projeto.

Terminal 1 — API:

```bash
cd api
npm run dev
```

Terminal 2 — FrontEnd:

```bash
npm run dev
```

Abra o endereço local mostrado pelo Vite, normalmente <http://localhost:5173>. O FrontEnd busca a lista em `/api/tarefas`; o Vite encaminha essa rota para a API na porta **3001**.

Para testar a API diretamente, abra <http://localhost:3001/api/tarefas>. Com o banco configurado, ela deve retornar a lista de tarefas em JSON. O botão **Cadastrar** envia os campos do formulário para `POST /api/tarefas` e só adiciona o cartão à tela depois da confirmação do banco.

## Verificação de tipos

Na raiz:

```bash
npm run verificar
```

Na pasta `api`:

```bash
npm run verificar
```
