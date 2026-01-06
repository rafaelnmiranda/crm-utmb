-- Migração: Tornar campo 'title' opcional na tabela deals
-- O campo Observações (title) não é mais obrigatório

ALTER TABLE deals
ALTER COLUMN title DROP NOT NULL;



