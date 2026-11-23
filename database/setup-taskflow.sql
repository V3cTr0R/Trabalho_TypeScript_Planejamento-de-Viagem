CREATE DATABASE IF NOT EXISTS taskflow
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE taskflow;

CREATE TABLE IF NOT EXISTS tarefas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(120) NOT NULL,
    descricao TEXT NULL,
    destino VARCHAR(120) NULL,
    origem VARCHAR(120) NULL,
    data_viagem DATE NULL,
    data_retorno DATE NULL,
    motivo VARCHAR(255) NULL,
    prioridade ENUM ('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
    status ENUM ('pendente', 'em_andamento', 'concluida') NOT NULL DEFAULT 'pendente',
    prazo DATE NULL,
    criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
