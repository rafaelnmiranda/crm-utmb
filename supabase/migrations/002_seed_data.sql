-- Inserir eventos padrão
INSERT INTO events (name, year) VALUES 
  ('Paraty 2025', 2025),
  ('Paraty 2026', 2026);

-- Inserir estágios padrão (neutros, não comerciais - usando paleta Sunrise Glow)
INSERT INTO pipeline_stages (name, position, color, is_lost) VALUES
  ('Lead', 1, '#A0CED9', FALSE),
  ('Contato iniciado', 2, '#FFEE93', FALSE),
  ('Proposta enviada', 3, '#FFC09F', FALSE),
  ('Negociação', 4, '#FCF5C7', FALSE),
  ('Ganhou', 5, '#ADF7B6', FALSE),
  ('Perdido', 6, '#F5B7B1', TRUE);

-- Inserir cotas padrão
INSERT INTO sponsorship_tiers (name, value_brl) VALUES
  ('Title', 1500000.00),
  ('Partner', 400000.00),
  ('Supplier', 130000.00),
  ('Supplier', 90000.00),
  ('Supplier', 60000.00);

-- Inserir contra-partidas padrão para Title (R$ 1.5 MM)
DO $$
DECLARE
  title_tier_id UUID;
BEGIN
  SELECT id INTO title_tier_id FROM sponsorship_tiers WHERE name = 'Title' AND value_brl = 1500000.00 LIMIT 1;
  
  INSERT INTO sponsorship_counterparts (tier_id, name, included, details) VALUES
    (title_tier_id, 'Nome da prova/Camiseta', TRUE, 'Naming Rights - marca encabeça o evento Paraty Brazil by UTMB'),
    (title_tier_id, 'Gift Finisher', TRUE, 'Prêmios para quem completa a corrida'),
    (title_tier_id, 'Pórtico de Largada/Chegada', TRUE, 'Exposição no pórtico principal'),
    (title_tier_id, 'Champions Zone', TRUE, 'Área de entrevistas para atletas campeões'),
    (title_tier_id, 'Capa de Gradil', TRUE, 'Paredes do corredor de largada e chegada'),
    (title_tier_id, 'VIP Experience', TRUE, 'Área VIP exclusiva'),
    (title_tier_id, 'Backdrop Finisher', TRUE, 'Pano de fundo para fotos na linha de chegada'),
    (title_tier_id, 'Windflag', TRUE, 'Bandeiras ao longo do percurso'),
    (title_tier_id, 'Guia do Atleta', TRUE, '2 páginas na revista digital'),
    (title_tier_id, 'Logo/Link Site Oficial', TRUE, 'Página dedicada no site oficial'),
    (title_tier_id, 'Kit do Atleta', TRUE, 'Produtos incluídos no kit'),
    (title_tier_id, 'Backdrop', TRUE, 'Cenário para fotos'),
    (title_tier_id, 'Ânuncio speaker', TRUE, 'Anúncios durante as corridas'),
    (title_tier_id, 'Naming PC', TRUE, 'Naming Rights dos Postos de Controle'),
    (title_tier_id, 'Estande Expo', TRUE, '40m² na feira'),
    (title_tier_id, 'Social Mídia/Email MKT', TRUE, 'Inclusão nas campanhas'),
    (title_tier_id, 'Assets Videos de Fotos', TRUE, 'Acesso ao acervo visual'),
    (title_tier_id, 'Cortesia', TRUE, '30 inscrições cortesia'),
    (title_tier_id, 'Talk Expo', TRUE, '2 horas de palestra'),
    (title_tier_id, 'Vídeo Telão', TRUE, 'Exibição em telões do evento'),
    (title_tier_id, 'After Movie', TRUE, 'Inclusão no vídeo final'),
    (title_tier_id, 'Permuta', TRUE, '10% do valor pode ser em permuta');
END $$;

-- Inserir contra-partidas padrão para Partner (R$ 400 Mil)
DO $$
DECLARE
  partner_tier_id UUID;
BEGIN
  SELECT id INTO partner_tier_id FROM sponsorship_tiers WHERE name = 'Partner' AND value_brl = 400000.00 LIMIT 1;
  
  INSERT INTO sponsorship_counterparts (tier_id, name, included, details) VALUES
    (partner_tier_id, 'Pórtico de Largada/Chegada', TRUE, 'Exposição no pórtico'),
    (partner_tier_id, 'Champions Zone', TRUE, 'Área de entrevistas'),
    (partner_tier_id, 'Capa de Gradil', TRUE, 'Paredes do corredor'),
    (partner_tier_id, 'VIP Experience', TRUE, 'Área VIP'),
    (partner_tier_id, 'Backdrop Finisher', TRUE, 'Pano de fundo na chegada'),
    (partner_tier_id, 'Windflag', TRUE, 'Bandeiras no percurso'),
    (partner_tier_id, 'Guia do Atleta', TRUE, '1 página na revista digital'),
    (partner_tier_id, 'Logo/Link Site Oficial', TRUE, 'Logotipo no site'),
    (partner_tier_id, 'Kit do Atleta', TRUE, 'Produtos no kit'),
    (partner_tier_id, 'Backdrop', TRUE, 'Cenário para fotos'),
    (partner_tier_id, 'Ânuncio speaker', TRUE, 'Anúncios durante corridas'),
    (partner_tier_id, 'Naming PC', TRUE, 'Naming Rights dos Postos de Controle'),
    (partner_tier_id, 'Estande Expo', TRUE, '20m² na feira'),
    (partner_tier_id, 'Social Mídia/Email MKT', TRUE, 'Inclusão nas campanhas'),
    (partner_tier_id, 'Assets Videos de Fotos', TRUE, 'Acesso ao acervo'),
    (partner_tier_id, 'Cortesia', TRUE, '20 inscrições cortesia'),
    (partner_tier_id, 'Talk Expo', TRUE, '1 hora de palestra'),
    (partner_tier_id, 'Vídeo Telão', TRUE, 'Exibição em telões'),
    (partner_tier_id, 'After Movie', TRUE, 'Inclusão no vídeo final'),
    (partner_tier_id, 'Permuta', TRUE, '10% do valor pode ser em permuta');
END $$;

-- Inserir contra-partidas padrão para Supplier R$ 130 Mil
DO $$
DECLARE
  supplier_130_id UUID;
BEGIN
  SELECT id INTO supplier_130_id FROM sponsorship_tiers WHERE name = 'Supplier' AND value_brl = 130000.00 LIMIT 1;
  
  INSERT INTO sponsorship_counterparts (tier_id, name, included, details) VALUES
    (supplier_130_id, 'Capa de Gradil', TRUE, 'Paredes do corredor'),
    (supplier_130_id, 'VIP Experience', TRUE, 'Área VIP'),
    (supplier_130_id, 'Backdrop Finisher', TRUE, 'Pano de fundo na chegada'),
    (supplier_130_id, 'Windflag', TRUE, 'Bandeiras no percurso'),
    (supplier_130_id, 'Guia do Atleta', TRUE, '1/2 página na revista digital'),
    (supplier_130_id, 'Logo/Link Site Oficial', TRUE, 'Logotipo no site'),
    (supplier_130_id, 'Kit do Atleta', TRUE, 'Produtos no kit'),
    (supplier_130_id, 'Backdrop', TRUE, 'Cenário para fotos'),
    (supplier_130_id, 'Ânuncio speaker', TRUE, 'Anúncios durante corridas'),
    (supplier_130_id, 'Naming PC', TRUE, 'Naming Rights dos Postos de Controle'),
    (supplier_130_id, 'Estande Expo', TRUE, '20m² na feira'),
    (supplier_130_id, 'Social Mídia/Email MKT', TRUE, 'Inclusão nas campanhas'),
    (supplier_130_id, 'Assets Videos de Fotos', TRUE, 'Acesso ao acervo'),
    (supplier_130_id, 'Cortesia', TRUE, '10 inscrições cortesia'),
    (supplier_130_id, 'Talk Expo', TRUE, '30 minutos de palestra'),
    (supplier_130_id, 'Vídeo Telão', TRUE, 'Exibição em telões'),
    (supplier_130_id, 'After Movie', TRUE, 'Inclusão no vídeo final'),
    (supplier_130_id, 'Permuta', TRUE, '10% do valor pode ser em permuta');
END $$;

-- Inserir contra-partidas padrão para Supplier R$ 90 Mil
DO $$
DECLARE
  supplier_90_id UUID;
BEGIN
  SELECT id INTO supplier_90_id FROM sponsorship_tiers WHERE name = 'Supplier' AND value_brl = 90000.00 LIMIT 1;
  
  INSERT INTO sponsorship_counterparts (tier_id, name, included, details) VALUES
    (supplier_90_id, 'Guia do Atleta', TRUE, '1/2 página na revista digital'),
    (supplier_90_id, 'Logo/Link Site Oficial', TRUE, 'Régua de patrocinadores'),
    (supplier_90_id, 'Kit do Atleta', TRUE, 'Produtos no kit'),
    (supplier_90_id, 'Backdrop', TRUE, 'Cenário para fotos'),
    (supplier_90_id, 'Ânuncio speaker', TRUE, 'Anúncios durante corridas'),
    (supplier_90_id, 'Naming PC', TRUE, 'Extra'),
    (supplier_90_id, 'Estande Expo', TRUE, '12m² na feira'),
    (supplier_90_id, 'Social Mídia/Email MKT', TRUE, 'Inclusão nas campanhas'),
    (supplier_90_id, 'Assets Videos de Fotos', TRUE, 'Acesso ao acervo'),
    (supplier_90_id, 'Cortesia', TRUE, '5 inscrições cortesia'),
    (supplier_90_id, 'Talk Expo', TRUE, '15 minutos de palestra'),
    (supplier_90_id, 'Vídeo Telão', TRUE, 'Exibição em telões'),
    (supplier_90_id, 'After Movie', TRUE, 'Inclusão no vídeo final'),
    (supplier_90_id, 'Permuta', TRUE, '30% do valor pode ser em permuta');
END $$;

-- Inserir contra-partidas padrão para Supplier R$ 60 Mil
DO $$
DECLARE
  supplier_60_id UUID;
BEGIN
  SELECT id INTO supplier_60_id FROM sponsorship_tiers WHERE name = 'Supplier' AND value_brl = 60000.00 LIMIT 1;
  
  INSERT INTO sponsorship_counterparts (tier_id, name, included, details) VALUES
    (supplier_60_id, 'Guia do Atleta', TRUE, '1/2 página na revista digital'),
    (supplier_60_id, 'Logo/Link Site Oficial', TRUE, 'Régua de patrocinadores'),
    (supplier_60_id, 'Kit do Atleta', TRUE, 'Produtos no kit'),
    (supplier_60_id, 'Backdrop', TRUE, 'Cenário para fotos'),
    (supplier_60_id, 'Ânuncio speaker', TRUE, 'Anúncios durante corridas'),
    (supplier_60_id, 'Naming PC', TRUE, 'Extra'),
    (supplier_60_id, 'Estande Expo', TRUE, '12m² na feira'),
    (supplier_60_id, 'Social Mídia/Email MKT', TRUE, 'Inclusão nas campanhas'),
    (supplier_60_id, 'Assets Videos de Fotos', TRUE, 'Acesso ao acervo'),
    (supplier_60_id, 'Cortesia', TRUE, '2 inscrições cortesia'),
    (supplier_60_id, 'Talk Expo', TRUE, '15 minutos de palestra'),
    (supplier_60_id, 'Vídeo Telão', TRUE, 'Exibição em telões'),
    (supplier_60_id, 'After Movie', TRUE, 'Inclusão no vídeo final'),
    (supplier_60_id, 'Permuta', TRUE, '20% do valor pode ser em permuta');
END $$;

-- Inserir setores UTMB (Event Requirement Categories)
INSERT INTO sectors (name, category) VALUES
  ('Energy Bars', 'event_requirement'),
  ('Energy Candy', 'event_requirement'),
  ('Energy Drinks', 'event_requirement'),
  ('Energy Gels', 'event_requirement'),
  ('Energy Waffles', 'event_requirement'),
  ('Energy Purees', 'event_requirement'),
  ('Performance/Sports Drinks', 'event_requirement');

-- Inserir setores UTMB (Protected Categories - Transitional)
INSERT INTO sectors (name, category) VALUES
  ('Compression products', 'protected_transitional'),
  ('Hand/wrist devices', 'protected_transitional'),
  ('Headphones', 'protected_transitional'),
  ('Headwear', 'protected_transitional'),
  ('Neckgaiters', 'protected_transitional'),
  ('Bandanas', 'protected_transitional'),
  ('Headbands', 'protected_transitional'),
  ('Balaclavas', 'protected_transitional'),
  ('Non-medical facemask', 'protected_transitional'),
  ('Hydration bag', 'protected_transitional'),
  ('Handheld flasks', 'protected_transitional'),
  ('Reusable water bottles', 'protected_transitional'),
  ('Technical sports footwear', 'protected_transitional'),
  ('Technical sports Apparel', 'protected_transitional'),
  ('Recovery footwear', 'protected_transitional'),
  ('Socks', 'protected_transitional'),
  ('Technical Soles', 'protected_transitional'),
  ('Footcare', 'protected_transitional'),
  ('Soap dispenser', 'protected_transitional');

-- Inserir setores UTMB (Restricted 1 Categories)
INSERT INTO sectors (name, category) VALUES
  ('Eyewear', 'restricted_1'),
  ('Coaching application', 'restricted_1'),
  ('Travel & accommodation services', 'restricted_1');

-- Inserir setores UTMB (Restricted 2 Categories)
INSERT INTO sectors (name, category) VALUES
  ('Automaker (including electric cars)', 'restricted_2'),
  ('Energy management & energy supplier', 'restricted_2'),
  ('Financial services', 'restricted_2'),
  ('Headlamps', 'restricted_2'),
  ('Insurance', 'restricted_2'),
  ('Personal care/cosmetics', 'restricted_2'),
  ('Poles', 'restricted_2'),
  ('Sports retailers', 'restricted_2');

-- Inserir setores UTMB (Prohibited Categories)
INSERT INTO sectors (name, category) VALUES
  ('Tobacco products', 'prohibited'),
  ('Recreational drugs', 'prohibited'),
  ('Illegal products', 'prohibited'),
  ('Sex-related items', 'prohibited'),
  ('Firearms/ammunition', 'prohibited'),
  ('Gambling', 'prohibited'),
  ('Oil & Gas', 'prohibited'),
  ('Fast food & quick services restaurants', 'prohibited'),
  ('Religious organizations', 'prohibited'),
  ('Prohibited Substances', 'prohibited');




