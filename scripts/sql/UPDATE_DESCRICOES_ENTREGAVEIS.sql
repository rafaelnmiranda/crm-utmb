-- ============================================
-- Script para atualizar descrições dos entregáveis
-- Fonte: UTMB 2025 - Tabela de Cotas (págs. 3 e 4)
-- ============================================
-- Este script faz UPDATE-only: atualiza apenas os entregáveis que já existem
-- no banco de dados, sem criar novos registros.
-- ============================================

BEGIN;

-- Atualizar descrições dos entregáveis
UPDATE sponsorship_counterparts 
SET details = 'Ao adquirir os Naming Rights, sua marca não só encabeça o Paraty Brazil by UTMB, mas também se integra a cada ponto de contato com o evento. Isso oferece uma exposição ímpar, com uma visibilidade acima de qualquer outra cota de patrocínio. Incluem ativações, experiências e vivências.'
WHERE name = 'Nome da prova/Camiseta';

UPDATE sponsorship_counterparts 
SET details = 'Os Gifts Finisher são os prêmios aguardados por quem completa a corrida, marcando sua conquista no Paraty Brazil by UTMB. Associar sua marca a esses prêmios significa estar presente no auge da realização dos atletas, estabelecendo uma ligação emocional profunda e uma recordação positiva duradoura da sua contribuição à sua vitória. *até 30 de junho'
WHERE name = 'Gift Finisher';

UPDATE sponsorship_counterparts 
SET details = 'Conjunto de itens essenciais para a corrida. Incluindo seus produtos no Kit do Atleta, você cria pontos de contato diretos com participantes, transformando cada item em uma oportunidade de engajamento. Esta estratégia não só enriquece a experiência do atleta com sua marca, mas também amplia seu alcance, solidificando sua presença na memória dos corredores como um suporte vital em sua jornada.'
WHERE name = 'Kit do Atleta';

UPDATE sponsorship_counterparts 
SET details = 'A área de entrevistas para os atletas campeões no Paraty Brazil by UTMB é o palco onde os momentos de triunfo são compartilhados com o mundo. Patrocinar este espaço oferece à sua marca visibilidade exclusiva durante os entrevistas pós-corrida, onde os vencedores expressam suas emoções e conquistas.'
WHERE name = 'Champions Zone';

UPDATE sponsorship_counterparts 
SET details = 'A Área VIP e VIP Experience oferecem um espaço exclusivo para sua marca criar experiências únicas para seus clientes no Paraty Brazil by UTMB. Este é o cenário ideal para impressionar, com acesso privilegiado e vistas inigualáveis, ao tratamento especial, ampliando seu impacto e deixando uma impressão duradoura de excelência e exclusividade.'
WHERE name = 'VIP Experience';

UPDATE sponsorship_counterparts 
SET details = 'Ter sua marca anunciada pelos locutores nas corridas do Paraty Brazil by UTMB amplifica sua presença, garantindo que sua mensagem ecoe durante momentos críticos de emoção e expectativa. Esta estratégia coloca sua marca no epicentro da ação, associando-a verbalmente aos picos de entusiasmo, alcançando atletas e espectadores de forma direta e memorável.'
WHERE name = 'Anúncio speaker';

UPDATE sponsorship_counterparts 
SET details = 'Colocar sua marca nas páginas da revista digital essencial do Paraty Brazil by UTMB, que detalha todas as informações do evento. É uma oportunidade de estar em constante contato com os atletas, oferecendo-lhes orientação e apoio, e associando sua marca à confiabilidade e ao valor informativo indispensável para a sua preparação e sucesso.'
WHERE name = 'Guia do Atleta';

UPDATE sponsorship_counterparts 
SET details = 'O Backdrop Finisher é o pano de fundo para as fotos de celebração dos atletas que concluem o Paraty Brazil by UTMB, oferecendo uma visibilidade sem precedentes para sua marca. Situado na linha de chegada, este espaço captura momentos de triunfo e emoção, garantindo que sua marca seja parte integrante dessas memórias significativas e amplamente compartilhadas.'
WHERE name = 'Backdrop Finisher';

UPDATE sponsorship_counterparts 
SET details = 'O backdrop, cenário das fotos mais desejadas e compartilhadas pelos atletas no Paraty Brazil by UTMB, oferece uma visibilidade incomparável à sua marca. Associando-se a momentos de alegria e celebração, sua marca se torna parte integral dos memórias e conquistas dos participantes, garantindo um destaque emocional e visual duradouro em suas histórias.'
WHERE name = 'Backdrop';

UPDATE sponsorship_counterparts 
SET details = 'Patrocinar o Pórtico de Largada e Chegada no Paraty Brazil by UTMB posiciona sua marca nos momentos mais emblemáticos do evento. Este ponto focal, onde emoções transbordam ao iniciar e concluir a corrida, oferece uma visibilidade sem igual, associando sua marca ao início de desafios e à celebração de conquistas, criando memórias inesquecíveis.'
WHERE name = 'Pórtico de Largada/Chegada';

UPDATE sponsorship_counterparts 
SET details = 'As paredes do corredor de largada e chegada, posiciona sua marca no coração do Paraty Brazil by UTMB. Esse ponto estratégico assegura máxima exposição, vinculando sua imagem aos momentos de largada e chegada dos atletas, quando eles iniciam e realizam essa jornada extraordinária.'
WHERE name = 'Capa de Gradil';

UPDATE sponsorship_counterparts 
SET details = 'Inserir seu logo no site do Paraty Brazil by UTMB coloca sua marca em um ponto de interação digital constante com atletas, seguidores e interessados. Esta presença online não só aumenta o reconhecimento da marca, mas também associa sua imagem ao prestígio e à aventura que o evento representa, gerando engajamento e conexão direta com uma comunidade global.'
WHERE name = 'Logo/Link Site Oficial';

UPDATE sponsorship_counterparts 
SET details = 'Os Windflags no Paraty Brazil by UTMB são bandeiras estilizadas que oferecem uma exposição contínua da sua marca ao longo do percurso, capturando a atenção de atletas, espectadores e mídias. Sua presença em pontos estratégicos garante que sua marca seja vista em momentos de determinação e triunfo, associando-a à energia vibrante e ao espírito dinâmico do evento.'
WHERE name = 'Windflag';

UPDATE sponsorship_counterparts 
SET details = 'Os Naming Rights dos Postos de Controle permitem que sua marca nomeie e ative espaços cruciais de abastecimento para os atletas no Paraty Brazil by UTMB. Isso significa presença constante onde o suporte é mais necessário, vinculando sua marca à energia e ao alívio em momentos de desafio, e criando uma associação positiva de cuidado e apoio na mente dos participantes.'
WHERE name = 'Naming . Posto de Controle (PC)';

UPDATE sponsorship_counterparts 
SET details = 'A principal feira do mercado outdoor do Paraty Brazil by UTMB é sua vitrine para destacar produtos e inovações o um público apaixonado e especializado. Participar ativamente neste espaço não apenas aumenta a visibilidade da sua marca, mas também a posiciona como referência no setor, aproveitando a oportunidade de interagir diretamente com entusiastas, atletas e parceiros.'
WHERE name = 'Estande Expo';

UPDATE sponsorship_counterparts 
SET details = 'Ao integrar sua marca às campanhas de Social Media e Mail Marketing do Paraty Brazil by UTMB, você alcança diretamente um público engajado e interessado, ampliando seu alcance e fortalecendo sua presença online. Esta parceria estratégica não só eleva a visibilidade da sua marca, mas também permite comunicações personalizadas que ressoam com a comunidade, cultivando uma relação mais próxima e significativa com os entusiastas do evento.'
WHERE name = 'Social Mídia/E-mail MKT';

UPDATE sponsorship_counterparts 
SET details = 'Sua marca ganha acesso a um rico acervo de conteúdo visual exclusivo do evento. Esta vantagem permite que você utilize imagens impactantes e momentos emocionantes em suas próprias publicações, reforçando a associação da sua marca com as aventuras e histórias inspiradoras do evento, enriquecendo sua comunicação e engajando seu público de maneira autêntica e vibrante.'
WHERE name = 'Assets Vídeos de Fotos';

UPDATE sponsorship_counterparts 
SET details = 'Oferecer inscrições cortesias do Paraty Brazil by UTMB é uma forma elegante de engajar sua equipe, clientes ou parceiros, proporcionando-lhes uma experiência inesquecível. Este gesto de generosidade não só fortalece relacionamentos, mas também associa sua marca aos valores de superação e aventura do evento, incentivando o espírito de equipe e o paixão pelo esporte ao vivo, enraizando sua marca na memória coletiva dos participantes.'
WHERE name = 'Cortesia';

UPDATE sponsorship_counterparts 
SET details = 'Promover um talk na Expo do Paraty Brazil by UTMB posiciona sua marca como uma voz de autoridade e inovação no universo outdoor. Este plataforma de palestras oferece uma oportunidade ímpar de se conectar diretamente com um público apaixonado, compartilhando conhecimentos, experiências e valores que ressoam com a comunidade. Além de reforçar o posicionamento da sua marca, estimula o diálogo, a educação e a construção de uma relação mais profunda e significativa com os atletas e entusiastas.'
WHERE name = 'Talk Expo';

UPDATE sponsorship_counterparts 
SET details = 'Utilizar os telões do evento para exibir vídeos promocionais da sua marca é uma estratégia poderosa de ativação no Paraty Brazil by UTMB. Esta exposição em grande escala garante que sua mensagem alcance atletas, espectadores e participantes, criando um impacto visual memorável. É uma chance única de destacar sua marca, produtos ou iniciativas, engajando a audiência em tempo real e ampliando significativamente sua visibilidade durante momentos chave do evento.'
WHERE name = 'Vídeo Telão';

UPDATE sponsorship_counterparts 
SET details = 'O After Movie do Paraty Brazil by UTMB eterniza sua marca nos melhores momentos desta edição épica. Este vídeo, uma cápsula do tempo de triunfos e emoções, será compartilhado e revisto por uma audiência global, garantindo que sua marca seja lembrada não apenas como patrocinadora, mas como parte integral da história e do legado do evento.'
WHERE name = 'After Movie';

UPDATE sponsorship_counterparts 
SET details = 'A permuta oferece uma oportunidade estratégica para sua marca se envolver no Paraty Brazil by UTMB, permitindo o abatimento do valor de patrocínio mediante o fornecimento de produtos ou serviços. Esta abordagem enriquece a experiência dos participantes, destacando sua marca como um colaborador vital que contribui para o sucesso e a qualidade do evento.'
WHERE name = 'Permuta';

COMMIT;

-- ============================================
-- PÓS-EXECUÇÃO: Query de validação
-- Execute esta query DEPOIS do script para verificar o resultado
-- ============================================
-- SELECT 
--   st.name AS "Cota",
--   TO_CHAR(st.value_brl, 'FM999,999,999.00') AS "Valor (R$)",
--   sc.name AS "Entregável",
--   CASE 
--     WHEN stc.included = TRUE THEN '✓ Sim'
--     ELSE '✗ Não'
--   END AS "Incluído",
--   COALESCE(stc.tier_details, sc.details) AS "Detalhes"
-- FROM sponsorship_tiers st
-- INNER JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
-- INNER JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
-- ORDER BY 
--   st.value_brl DESC,
--   stc.sort_order ASC,
--   sc.name ASC;
