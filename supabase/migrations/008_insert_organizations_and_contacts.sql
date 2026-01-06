-- Insert organizations and their contacts
-- This migration adds organizations with their primary contacts

-- First, get existing organizations or insert new ones
WITH org_data AS (
  SELECT * FROM (VALUES
    ('SEC DE ESPORTE RJ', 'Marcel', '+55 21 99920-9980'),
    ('HOKA', 'Stephanie Rittschner', '+55 11 98202-3232'),
    ('COMPRESSPORT', 'Fernanda Maciel', '+33 6 49 57 27 13'),
    ('SHOKZ', 'Anna Palhares Proparts', '+55 11 99384-9572'),
    ('AMINO VITAL', 'Ricardo Oliveira', '+55 11 98650-8966'),
    ('GRUPO NAUTIKA', 'Guilherme Braziel', '+55 11 98070-5276'),
    ('KAILASH', 'Tani', '+55 11 99221-0080'),
    ('NORMAL | COROS', 'Valter', '+55 11 98258-9899'),
    ('PARATY TOURS', 'Samanta', '+55 21 99963-4016'),
    ('ANNY SPORT', 'Sara (@corremineira)', '+55 11 93201-9720'),
    ('GU (FEPASE)', 'Marcelo', '+55 19 99648-1649'),
    ('PINK CHEECKS', 'Leonardo', '+55 19 99891-0429'),
    ('BROOKLIN', 'Gustavo Maia', '+55 11 98426-0900'),
    ('SUMACA', 'Eric Porto', '+55 24 99968-1301'),
    ('YOPP', 'Fernanda', '+55 21 98118-1167'),
    ('YOPP', 'Felipe', '+55 11 97425-1100'),
    ('YOGA VILLAGE', 'Antônio (Darma Shala)', '+55 24 99872-6253'),
    ('BHUMI', 'Sérgio', '+55 24 99969-9104'),
    ('PROBIÓTICA', 'Guilherme', '+55 16 99727-7418'),
    ('UTMB FOR THE PLANET', 'Marina', '+55 92 9325-2938'),
    ('MOMBORA', 'Isabela', '+55 11 97260-9453'),
    ('BANANINHA PARAIBUNA', 'Guilherme Paiola', '+55 12 98855-2210'),
    ('STRAVA', 'Fernanda', '+55 11 97061-2112'),
    ('STRAVA', 'Rosana', '+55 11 98949-6749'),
    ('DOBRO', 'Julia', '+55 11 93337-7731'),
    ('TRICKY', 'Bernardo Oliveira', '+55 31 99668-6798'),
    ('HOUSEWHEY', 'Luciana Polini', '+55 11 99970-1030')
  ) AS t(org_name, contact_name, contact_phone)
),
existing_orgs AS (
  SELECT DISTINCT o.id, LOWER(TRIM(o.name)) AS org_name_normalized
  FROM org_data od
  INNER JOIN organizations o ON LOWER(TRIM(o.name)) = LOWER(TRIM(od.org_name))
),
new_orgs AS (
  INSERT INTO organizations (name)
  SELECT DISTINCT od.org_name
  FROM org_data od
  WHERE NOT EXISTS (
    SELECT 1 FROM organizations o WHERE LOWER(TRIM(o.name)) = LOWER(TRIM(od.org_name))
  )
  RETURNING id, name
),
all_orgs AS (
  SELECT id, LOWER(TRIM(name)) AS org_name_normalized FROM new_orgs
  UNION
  SELECT id, org_name_normalized FROM existing_orgs
)
INSERT INTO contacts (organization_id, name, phone)
SELECT 
  ao.id,
  od.contact_name,
  od.contact_phone
FROM all_orgs ao
INNER JOIN org_data od ON LOWER(TRIM(od.org_name)) = ao.org_name_normalized
WHERE NOT EXISTS (
  SELECT 1 FROM contacts c 
  WHERE c.organization_id = ao.id 
  AND LOWER(TRIM(c.name)) = LOWER(TRIM(od.contact_name))
  AND c.phone = od.contact_phone
);


