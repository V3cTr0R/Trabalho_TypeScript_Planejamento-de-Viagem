ALTER TABLE taskflow.tarefas
    ADD COLUMN destino VARCHAR(120) NULL,
    ADD COLUMN origem VARCHAR(120) NULL,
    ADD COLUMN data_viagem DATE NULL,
    ADD COLUMN data_retorno DATE NULL,
    ADD COLUMN motivo VARCHAR(255) NULL;
