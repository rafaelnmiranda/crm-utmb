-- Garantir que nomes de organizações sejam sempre em caixa alta (UPPERCASE)
-- Esta migration cria um trigger que converte automaticamente o nome para maiúsculas

-- Função para converter o nome para UPPERCASE
CREATE OR REPLACE FUNCTION uppercase_organization_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name = UPPER(NEW.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que executa antes de INSERT ou UPDATE
CREATE TRIGGER trigger_uppercase_organization_name
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION uppercase_organization_name();

-- Atualizar todos os registros existentes para maiúsculas
UPDATE organizations
SET name = UPPER(name)
WHERE name != UPPER(name);
