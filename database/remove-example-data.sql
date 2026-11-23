DELETE FROM taskflow.tarefas
WHERE
    (id = 1 AND titulo = 'Definir Destino' AND destino = 'Madri'
        AND origem = 'Brasil' AND data_viagem = '2026-11-17'
        AND data_retorno = '2026-11-25' AND motivo = 'Negócios') OR
    (id = 2 AND titulo = 'Comprar Passagens Aereas' AND destino = 'Buenos Aires'
        AND origem = 'São Paulo' AND data_viagem = '2027-01-10'
        AND data_retorno = '2027-01-17' AND motivo = 'Turismo') OR
    (id = 3 AND titulo = 'Fazer reserva em Hotel' AND destino = 'Lisboa'
        AND origem = 'Rio de Janeiro' AND data_viagem = '2027-02-03'
        AND data_retorno = '2027-02-10' AND motivo = 'Lazer') OR
    (id = 4 AND titulo = 'Planejar visitas' AND destino = 'Recife'
        AND origem = 'Belo Horizonte' AND data_viagem = '2027-03-05'
        AND data_retorno = '2027-03-08' AND motivo = 'Visita familiar') OR
    (id = 5 AND titulo = 'Controlar gastos durante o dia ' AND destino = 'Santiago'
        AND origem = 'Curitiba' AND data_viagem = '2027-04-20'
        AND data_retorno = '2027-04-26' AND motivo = 'Trabalho');

ALTER TABLE taskflow.tarefas AUTO_INCREMENT = 1;
