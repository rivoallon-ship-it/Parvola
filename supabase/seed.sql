-- =============================================
-- Talent Review — Seed Data (Sushi Neko demo)
-- =============================================
-- Demo credentials:
--   sophie@sushineko.fr  / password123 (RH)
--   kenji@sushineko.fr   / password123 (Manager)
--   maxime@sushineko.fr  / password123 (Employee)
-- =============================================

-- =============================================
-- Establishments
-- =============================================
INSERT INTO establishments (id, name, description) VALUES
  ('10000000-0000-4000-a000-000000000001', 'Sushi Neko — Paris Opéra', 'Restaurant flagship, 80 couverts, ouvert 7j/7'),
  ('10000000-0000-4000-a000-000000000002', 'Sushi Neko — Lyon Part-Dieu', 'Restaurant centre commercial, 50 couverts'),
  ('10000000-0000-4000-a000-000000000003', 'Sushi Neko — Bordeaux Chartrons', 'Nouveau restaurant, ouverture récente');

-- =============================================
-- Teams
-- =============================================
INSERT INTO teams (id, establishment_id, name, description) VALUES
  -- Paris
  ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', 'Cuisine Paris', 'Équipe cuisine du restaurant Paris Opéra'),
  ('20000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', 'Salle Paris', 'Équipe salle et service du restaurant Paris Opéra'),
  -- Lyon
  ('20000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000002', 'Cuisine Lyon', 'Équipe cuisine du restaurant Lyon Part-Dieu'),
  ('20000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000002', 'Salle Lyon', 'Équipe salle et service du restaurant Lyon Part-Dieu'),
  -- Bordeaux
  ('20000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000003', 'Cuisine Bordeaux', 'Équipe cuisine du restaurant Bordeaux Chartrons'),
  ('20000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000003', 'Salle Bordeaux', 'Équipe salle et service du restaurant Bordeaux Chartrons');

-- =============================================
-- Employees
-- =============================================
INSERT INTO employees (id, name, position, photo, establishment_id, team_id, salary, late_count, unjustified_absences, justified_absences) VALUES
  -- Paris Opéra — Cuisine
  ('30000000-0000-4000-a000-000000000001', 'Kenji Tanaka',    'Chef Sushi',              '👨🏻',     '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 38000, 0, 0, 2),
  ('30000000-0000-4000-a000-000000000002', 'Léa Moreau',      'Second de cuisine',       '👩🏻',     '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 30000, 1, 0, 3),
  ('30000000-0000-4000-a000-000000000003', 'Yuki Sato',       'Commis de cuisine',       '👱🏻‍♀️', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 22000, 2, 1, 4),
  ('30000000-0000-4000-a000-000000000004', 'Théo Martin',     'Commis de cuisine',       '👨🏻‍🦱', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 21500, 5, 2, 1),
  -- Paris Opéra — Salle
  ('30000000-0000-4000-a000-000000000005', 'Camille Dubois',  'Responsable de salle',    '👩🏻‍🦰', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 28000, 1, 0, 2),
  ('30000000-0000-4000-a000-000000000006', 'Maxime Bernard',  'Serveur',                 '👨🏻‍🦰', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 22000, 3, 1, 3),
  ('30000000-0000-4000-a000-000000000007', 'Inès Chevalier',  'Serveuse',                '👩🏾‍🦱', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 21500, 0, 0, 5),
  -- Paris Opéra — Management (pas de team)
  ('30000000-0000-4000-a000-000000000008', 'Sophie Laurent',  'Directrice de restaurant','👱🏾‍♀️', '10000000-0000-4000-a000-000000000001', NULL,                                   48000, 0, 0, 1),
  -- Lyon Part-Dieu — Cuisine
  ('30000000-0000-4000-a000-000000000009', 'Hiroshi Yamamoto','Chef Sushi',              '👨🏽',     '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000003', 36000, 1, 0, 2),
  ('30000000-0000-4000-a000-000000000010', 'Jules Petit',     'Commis de cuisine',       '🧑🏻‍🦱', '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000003', 21000, 4, 3, 2),
  -- Lyon Part-Dieu — Salle
  ('30000000-0000-4000-a000-000000000011', 'Clara Roux',      'Responsable de salle',    '👱🏻‍♀️', '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000004', 27000, 0, 0, 3),
  ('30000000-0000-4000-a000-000000000012', 'Amine Benali',    'Serveur',                 '👨🏽',     '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000004', 21500, 6, 2, 1),
  -- Lyon Part-Dieu — Management
  ('30000000-0000-4000-a000-000000000013', 'Thomas Girard',   'Directeur de restaurant', '👨🏻',     '10000000-0000-4000-a000-000000000002', NULL,                                   45000, 0, 0, 2),
  -- Bordeaux Chartrons — Cuisine
  ('30000000-0000-4000-a000-000000000014', 'Sakura Ito',      'Chef Sushi',              '👩🏻',     '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000005', 37000, 0, 0, 1),
  ('30000000-0000-4000-a000-000000000015', 'Lucas Faure',     'Commis de cuisine',       '👨🏻‍🦱', '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000005', 21000, 2, 1, 3),
  -- Bordeaux Chartrons — Salle
  ('30000000-0000-4000-a000-000000000016', 'Emma Lefèvre',    'Responsable de salle',    '👩🏻‍🦰', '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000006', 26000, 1, 0, 2),
  ('30000000-0000-4000-a000-000000000017', 'Noah Garcia',     'Serveur',                 '👨🏻‍🦰', '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000006', 21500, 3, 1, 4);

-- =============================================
-- Auth Users (3 demo accounts)
-- NOTE: No trigger — profiles are created explicitly below.
-- =============================================

-- Sophie Laurent — RH
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-a000-000000000001',
  'authenticated', 'authenticated',
  'sophie@sushineko.fr',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Sophie Laurent", "photo": "👱🏾‍♀️", "role": "rh"}'::jsonb,
  now(), now(), '', ''
);
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'a0000000-0000-4000-a000-000000000001',
  jsonb_build_object('sub', 'a0000000-0000-4000-a000-000000000001', 'email', 'sophie@sushineko.fr', 'email_verified', true, 'phone_verified', false),
  'email',
  'a0000000-0000-4000-a000-000000000001',
  now(), now(), now()
);

-- Kenji Tanaka — Manager
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-a000-000000000002',
  'authenticated', 'authenticated',
  'kenji@sushineko.fr',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Kenji Tanaka", "photo": "👨🏻", "role": "manager"}'::jsonb,
  now(), now(), '', ''
);
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'a0000000-0000-4000-a000-000000000002',
  jsonb_build_object('sub', 'a0000000-0000-4000-a000-000000000002', 'email', 'kenji@sushineko.fr', 'email_verified', true, 'phone_verified', false),
  'email',
  'a0000000-0000-4000-a000-000000000002',
  now(), now(), now()
);

-- Maxime Bernard — Employee
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-a000-000000000003',
  'authenticated', 'authenticated',
  'maxime@sushineko.fr',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Maxime Bernard", "photo": "👨🏻‍🦰", "role": "employee"}'::jsonb,
  now(), now(), '', ''
);
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'a0000000-0000-4000-a000-000000000003',
  jsonb_build_object('sub', 'a0000000-0000-4000-a000-000000000003', 'email', 'maxime@sushineko.fr', 'email_verified', true, 'phone_verified', false),
  'email',
  'a0000000-0000-4000-a000-000000000003',
  now(), now(), now()
);

-- =============================================
-- Profiles (created directly, no trigger)
-- =============================================
-- Sophie (RH) — establishment Paris
INSERT INTO profiles (id, name, photo, role, employee_id, team_ids, establishment_id) VALUES (
  'a0000000-0000-4000-a000-000000000001',
  'Sophie Laurent', '👱🏾‍♀️', 'rh',
  '30000000-0000-4000-a000-000000000008',
  '{}',
  '10000000-0000-4000-a000-000000000001'
);

-- Kenji (Manager) — manages Cuisine Paris + Salle Paris teams
INSERT INTO profiles (id, name, photo, role, employee_id, team_ids, establishment_id) VALUES (
  'a0000000-0000-4000-a000-000000000002',
  'Kenji Tanaka', '👨🏻', 'manager',
  '30000000-0000-4000-a000-000000000001',
  ARRAY['20000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000002'::uuid],
  '10000000-0000-4000-a000-000000000001'
);

-- Maxime (Employee) — linked to his employee record
INSERT INTO profiles (id, name, photo, role, employee_id, team_ids, establishment_id) VALUES (
  'a0000000-0000-4000-a000-000000000003',
  'Maxime Bernard', '👨🏻‍🦰', 'employee',
  '30000000-0000-4000-a000-000000000006',
  '{}',
  '10000000-0000-4000-a000-000000000001'
);

-- =============================================
-- Positions
-- =============================================
INSERT INTO positions (id, name, description) VALUES
  ('40000000-0000-4000-a000-000000000001', 'Chef Sushi',              'Responsable de la préparation des sushis, sashimis et makis. Garant de la qualité et de la créativité de la carte.'),
  ('40000000-0000-4000-a000-000000000002', 'Second de cuisine',       'Assiste le chef, supervise les commis, gère les stocks et les commandes fournisseurs.'),
  ('40000000-0000-4000-a000-000000000003', 'Commis de cuisine',       'Préparation des ingrédients, mise en place, nettoyage. Apprend les techniques de découpe et de présentation.'),
  ('40000000-0000-4000-a000-000000000004', 'Responsable de salle',    'Gère l''accueil, le service, la satisfaction client et l''équipe de salle.'),
  ('40000000-0000-4000-a000-000000000005', 'Serveur',                 'Accueil, prise de commande, service en salle, encaissement.'),
  ('40000000-0000-4000-a000-000000000006', 'Serveuse',                'Accueil, prise de commande, service en salle, encaissement.'),
  ('40000000-0000-4000-a000-000000000007', 'Directrice de restaurant','Pilote l''activité du restaurant : P&L, RH, qualité, satisfaction client.'),
  ('40000000-0000-4000-a000-000000000008', 'Directeur de restaurant', 'Pilote l''activité du restaurant : P&L, RH, qualité, satisfaction client.');

-- =============================================
-- Objective Templates
-- =============================================
INSERT INTO objective_templates (id, position_id, title, description, suggested_deadline_days) VALUES
  -- Chef Sushi
  ('50000000-0000-4000-a000-000000000001', '40000000-0000-4000-a000-000000000001', 'Créer 3 nouvelles recettes saisonnières', 'Développer 3 nouvelles recettes de makis/sushis utilisant des produits de saison, avec fiches techniques complètes et costing validé.', 90),
  ('50000000-0000-4000-a000-000000000002', '40000000-0000-4000-a000-000000000001', 'Réduire le food cost de 2 points', 'Optimiser les achats, réduire le gaspillage et ajuster les portions pour atteindre un food cost cible de 28%.', 180),
  ('50000000-0000-4000-a000-000000000003', '40000000-0000-4000-a000-000000000001', 'Former un commis à la découpe du poisson', 'Accompagner un commis dans l''apprentissage des techniques de découpe (sashimi, nigiri), avec évaluation pratique en fin de formation.', 120),
  -- Second de cuisine
  ('50000000-0000-4000-a000-000000000004', '40000000-0000-4000-a000-000000000002', 'Mettre en place l''inventaire hebdomadaire', 'Instaurer un inventaire hebdomadaire systématique avec fichier de suivi, écarts analysés et plan d''action correctif.', 60),
  ('50000000-0000-4000-a000-000000000005', '40000000-0000-4000-a000-000000000002', 'Réduire les pertes matière de 15%', 'Identifier les principales sources de pertes, mettre en place des actions correctives et suivre l''évolution mensuelle.', 120),
  -- Commis de cuisine
  ('50000000-0000-4000-a000-000000000006', '40000000-0000-4000-a000-000000000003', 'Maîtriser 5 techniques de découpe', 'Apprendre et maîtriser les techniques : julienne, brunoise, découpe sashimi, découpe maki, tournage de légumes.', 90),
  ('50000000-0000-4000-a000-000000000007', '40000000-0000-4000-a000-000000000003', 'Obtenir le certificat HACCP', 'Suivre la formation hygiène alimentaire HACCP et obtenir la certification.', 60),
  -- Responsable de salle
  ('50000000-0000-4000-a000-000000000008', '40000000-0000-4000-a000-000000000004', 'Atteindre un score Google de 4.5/5', 'Améliorer la satisfaction client mesurée par les avis Google : accueil, rapidité, qualité de service.', 180),
  ('50000000-0000-4000-a000-000000000009', '40000000-0000-4000-a000-000000000004', 'Réduire le turnover salle de 20%', 'Améliorer la rétention de l''équipe par un meilleur onboarding, des entretiens réguliers et un planning équilibré.', 180),
  -- Serveur
  ('50000000-0000-4000-a000-000000000010', '40000000-0000-4000-a000-000000000005', 'Maîtriser la carte et les allergènes', 'Connaître l''intégralité de la carte (ingrédients, techniques, allergènes) pour conseiller les clients en toute autonomie.', 30),
  ('50000000-0000-4000-a000-000000000011', '40000000-0000-4000-a000-000000000005', 'Augmenter le ticket moyen de 10%', 'Développer les techniques de vente additionnelle : suggestion de boissons, desserts, formules premium.', 90),
  -- Directrice de restaurant
  ('50000000-0000-4000-a000-000000000012', '40000000-0000-4000-a000-000000000007', 'Atteindre le CA mensuel cible', 'Piloter l''activité pour atteindre l''objectif de chiffre d''affaires mensuel défini par la direction.', 180),
  ('50000000-0000-4000-a000-000000000013', '40000000-0000-4000-a000-000000000007', 'Déployer le nouveau programme de fidélité', 'Lancer le programme de fidélité dans le restaurant : formation équipe, communication client, suivi des inscriptions.', 90),
  -- Directeur de restaurant
  ('50000000-0000-4000-a000-000000000014', '40000000-0000-4000-a000-000000000008', 'Atteindre le CA mensuel cible', 'Piloter l''activité pour atteindre l''objectif de chiffre d''affaires mensuel défini par la direction.', 180);

-- =============================================
-- Semesters (Campaigns)
-- =============================================
INSERT INTO semesters (id, year, semester, name, status, closing_deadline) VALUES
  ('60000000-0000-4000-a000-000000000001', 2025, 'S2', 'S2 2025', 'closed',  '2025-12-31'),
  ('60000000-0000-4000-a000-000000000002', 2026, 'S1', 'S1 2026', 'active',  '2026-06-30'),
  ('60000000-0000-4000-a000-000000000003', 2026, 'S2', 'S2 2026', 'draft',   '2026-12-31');

-- =============================================
-- Evaluations — S2 2025 (closed, all validated)
-- =============================================

-- eval-1: Kenji Tanaka (Chef Sushi Paris) — validated
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager, bilan_employee) VALUES
  ('70000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', '60000000-0000-4000-a000-000000000001', 'validated', 3, 2,
   'Kenji a été excellent ce semestre. Sa créativité sur la carte d''automne a boosté le CA de 12%. Il doit maintenant davantage déléguer aux commis.',
   'Je suis satisfait de mon travail sur les nouvelles recettes. J''aimerais participer à un stage au Japon pour me perfectionner.');

-- eval-2: Sophie Laurent (Directrice Paris) — validated
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000008', '60000000-0000-4000-a000-000000000001', 'validated', 3, 3,
   'Sophie pilote le restaurant avec brio. Le CA a progressé de 15% et la note Google est passée à 4.6. Potentiel pour un rôle régional.');

-- eval-3: Camille Dubois (Resp salle Paris) — validated
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000005', '60000000-0000-4000-a000-000000000001', 'validated', 2, 3,
   'Camille a amélioré la satisfaction client mais doit encore progresser sur la gestion des conflits en équipe.');

-- eval-4: Hiroshi Yamamoto (Chef Lyon) — validated
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000009', '60000000-0000-4000-a000-000000000001', 'validated', 2, 2,
   'Hiroshi fait un travail régulier et fiable. La qualité est constante. Il pourrait prendre plus d''initiatives sur la carte.');

-- eval-5: Thomas Girard (Directeur Lyon) — validated
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000013', '60000000-0000-4000-a000-000000000001', 'validated', 2, 2,
   'Thomas gère bien le quotidien. Le restaurant est rentable et l''équipe stable. Marge de progression sur le développement commercial.');

-- =============================================
-- Evaluations — S1 2026 (active, mixed statuses)
-- =============================================

-- eval-10: Kenji Tanaka — in_progress
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000010', '30000000-0000-4000-a000-000000000001', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- eval-11: Léa Moreau — submitted
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000011', '30000000-0000-4000-a000-000000000002', '60000000-0000-4000-a000-000000000002', 'submitted',
   'Léa a pris en main les inventaires avec rigueur. Elle est prête à remplacer le chef en son absence.');

-- eval-12: Yuki Sato — in_progress
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000012', '30000000-0000-4000-a000-000000000003', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- eval-13: Théo Martin — not_started
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000013', '30000000-0000-4000-a000-000000000004', '60000000-0000-4000-a000-000000000002', 'not_started');

-- eval-14: Camille Dubois — in_progress
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000014', '30000000-0000-4000-a000-000000000005', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- eval-15: Maxime Bernard — validated
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000015', '30000000-0000-4000-a000-000000000006', '60000000-0000-4000-a000-000000000002', 'validated', 2, 2,
   'Maxime est un serveur fiable et apprécié des clients. Bonne progression sur la vente additionnelle.');

-- eval-16: Sophie Laurent — in_progress
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000016', '30000000-0000-4000-a000-000000000008', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- eval-17: Hiroshi Yamamoto — submitted
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000017', '30000000-0000-4000-a000-000000000009', '60000000-0000-4000-a000-000000000002', 'submitted',
   'Hiroshi est plus proactif ce semestre. Belle initiative sur le menu bento. À encourager dans cette direction.');

-- eval-18: Clara Roux — in_progress
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000018', '30000000-0000-4000-a000-000000000011', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- eval-19: Sakura Ito — in_progress
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000019', '30000000-0000-4000-a000-000000000014', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- eval-20: Thomas Girard — in_progress
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000020', '30000000-0000-4000-a000-000000000013', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- =============================================
-- Objectives — S2 2025
-- =============================================

-- Kenji Tanaka (eval-1)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000001', '70000000-0000-4000-a000-000000000001', 'Lancer la carte d''automne', 'Créer 5 nouvelles recettes saisonnières avec des produits d''automne (courge, champignons, châtaigne).', 'completed', 100, '2025-10-15', 'Carte lancée le 1er octobre, très bon retour client', 0),
  ('80000000-0000-4000-a000-000000000002', '70000000-0000-4000-a000-000000000001', 'Réduire le food cost à 29%', 'Optimiser les commandes et réduire le gaspillage pour passer de 31% à 29% de food cost.', 'completed', 100, '2025-12-31', 'Objectif atteint : 28.7% en décembre', 1),
  ('80000000-0000-4000-a000-000000000003', '70000000-0000-4000-a000-000000000001', 'Former Yuki à la découpe sashimi', 'Accompagner Yuki dans la maîtrise de la découpe sashimi niveau intermédiaire.', 'completed', 100, '2025-11-30', 'Yuki est autonome sur la découpe sashimi depuis novembre', 2);

-- Sophie Laurent (eval-2)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000004', '70000000-0000-4000-a000-000000000002', 'Atteindre 320K€ de CA mensuel', 'Piloter l''activité pour atteindre un CA moyen de 320K€/mois sur le semestre.', 'completed', 100, '2025-12-31', 'CA moyen S2 : 335K€/mois', 0),
  ('80000000-0000-4000-a000-000000000005', '70000000-0000-4000-a000-000000000002', 'Lancer le programme fidélité', 'Déployer le programme de fidélité Sushi Neko Rewards dans le restaurant Paris Opéra.', 'completed', 100, '2025-10-31', '1200 inscrits au programme en 2 mois', 1);

-- Camille Dubois (eval-3)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000006', '70000000-0000-4000-a000-000000000003', 'Score Google 4.5/5', 'Porter la note Google du restaurant à 4.5 minimum.', 'completed', 100, '2025-12-31', 'Note atteinte : 4.6/5', 0),
  ('80000000-0000-4000-a000-000000000007', '70000000-0000-4000-a000-000000000003', 'Former les nouveaux serveurs', 'Mettre en place un parcours d''intégration structuré pour les nouveaux serveurs (3 jours).', 'in_progress', 70, '2025-12-31', 'Parcours créé, pas encore testé sur tous les profils', 1);

-- Hiroshi Yamamoto (eval-4)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000008', '70000000-0000-4000-a000-000000000004', 'Maintenir la qualité constante', 'Zéro retour négatif sur la qualité des plats pendant le semestre.', 'completed', 100, '2025-12-31', '2 retours mineurs en 6 mois, très bon résultat', 0),
  ('80000000-0000-4000-a000-000000000009', '70000000-0000-4000-a000-000000000004', 'Proposer 2 recettes hiver', 'Créer 2 nouvelles recettes pour la carte d''hiver.', 'completed', 100, '2025-11-15', 'Maki foie gras et chirashi truffe ajoutés à la carte', 1);

-- Thomas Girard (eval-5)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000010', '70000000-0000-4000-a000-000000000005', 'Atteindre 180K€ de CA mensuel', 'Piloter l''activité pour atteindre un CA moyen de 180K€/mois.', 'in_progress', 85, '2025-12-31', 'CA moyen : 172K€. Proche de l''objectif.', 0);

-- =============================================
-- Objectives — S1 2026
-- =============================================

-- Kenji Tanaka (eval-10)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000020', '70000000-0000-4000-a000-000000000010', 'Lancer la carte printemps-été', 'Créer 4 nouvelles recettes avec des produits de saison (fleur de cerisier, mangue, concombre).', 'in_progress', 40, '2026-04-01', '2 recettes finalisées, 2 en test', 0),
  ('80000000-0000-4000-a000-000000000021', '70000000-0000-4000-a000-000000000010', 'Réduire le food cost à 27%', 'Poursuivre l''optimisation : négociation fournisseurs, réduction du gaspillage.', 'in_progress', 30, '2026-06-30', 'Actuellement à 28.5%', 1),
  ('80000000-0000-4000-a000-000000000022', '70000000-0000-4000-a000-000000000010', 'Former Théo aux sushis nigiri', 'Accompagner Théo Martin dans l''apprentissage de la préparation des nigiri.', 'not_started', 0, '2026-05-31', '', 2);

-- Léa Moreau (eval-11)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000023', '70000000-0000-4000-a000-000000000011', 'Inventaire hebdomadaire systématique', 'Mettre en place un inventaire hebdomadaire avec suivi des écarts.', 'completed', 100, '2026-03-31', 'Inventaire en place depuis février, écarts < 2%', 0),
  ('80000000-0000-4000-a000-000000000024', '70000000-0000-4000-a000-000000000011', 'Réduire les pertes de 15%', 'Analyser les pertes par poste et mettre en place des actions correctives.', 'in_progress', 65, '2026-06-30', 'Pertes réduites de 10% pour l''instant', 1),
  ('80000000-0000-4000-a000-000000000025', '70000000-0000-4000-a000-000000000011', 'Gérer 3 services en autonomie', 'Assurer le rôle de chef pendant 3 services complets sans supervision.', 'completed', 100, '2026-05-31', '4 services gérés avec succès', 2);

-- Yuki Sato (eval-12)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000026', '70000000-0000-4000-a000-000000000012', 'Maîtriser 5 techniques de découpe', 'Julienne, brunoise, sashimi, maki, tournage légumes.', 'in_progress', 60, '2026-06-30', '3 techniques validées', 0),
  ('80000000-0000-4000-a000-000000000027', '70000000-0000-4000-a000-000000000012', 'Obtenir le certificat HACCP', 'Suivre la formation et passer l''examen.', 'completed', 100, '2026-03-31', 'Certificat obtenu le 15 mars', 1);

-- Théo Martin (eval-13) — no objectives

-- Camille Dubois (eval-14)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000028', '70000000-0000-4000-a000-000000000014', 'Maintenir le score Google ≥ 4.5', 'Garantir un niveau de service qui maintient la note Google au-dessus de 4.5.', 'in_progress', 80, '2026-06-30', 'Note actuelle : 4.6', 0),
  ('80000000-0000-4000-a000-000000000029', '70000000-0000-4000-a000-000000000014', 'Réduire le turnover salle de 20%', 'Améliorer l''intégration et la fidélisation des serveurs.', 'in_progress', 45, '2026-06-30', '1 départ sur le semestre vs 3 au S2 2025', 1);

-- Maxime Bernard (eval-15)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000030', '70000000-0000-4000-a000-000000000015', 'Maîtriser la carte complète', 'Connaître tous les plats, ingrédients et allergènes pour conseiller les clients.', 'completed', 100, '2026-02-28', 'Test réussi à 95%', 0),
  ('80000000-0000-4000-a000-000000000031', '70000000-0000-4000-a000-000000000015', 'Augmenter le ticket moyen de 10%', 'Vente additionnelle : boissons, desserts, formules premium.', 'in_progress', 70, '2026-06-30', 'Ticket moyen +7% pour l''instant', 1);

-- Sophie Laurent (eval-16)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000032', '70000000-0000-4000-a000-000000000016', 'Atteindre 350K€ de CA mensuel', 'Croissance de 10% par rapport au S2 2025.', 'in_progress', 55, '2026-06-30', 'CA février : 340K€, en bonne voie', 0),
  ('80000000-0000-4000-a000-000000000033', '70000000-0000-4000-a000-000000000016', 'Ouvrir le service livraison', 'Lancer un service de livraison via Uber Eats et Deliveroo.', 'in_progress', 30, '2026-04-30', 'Contrats en cours de négociation', 1),
  ('80000000-0000-4000-a000-000000000034', '70000000-0000-4000-a000-000000000016', 'Réduire le turnover global de 25%', 'Mettre en place des actions de fidélisation : prime d''assiduité, planning flexible, entretiens mensuels.', 'not_started', 0, '2026-06-30', '', 2);

-- Hiroshi Yamamoto (eval-17)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000035', '70000000-0000-4000-a000-000000000017', 'Créer un menu bento du midi', 'Développer 4 formules bento pour le service du midi (cible : employés du centre commercial).', 'completed', 100, '2026-03-15', 'Menu lancé le 1er mars, très bien accueilli', 0),
  ('80000000-0000-4000-a000-000000000036', '70000000-0000-4000-a000-000000000017', 'Food cost ≤ 29%', 'Maintenir le food cost en dessous de 29%.', 'in_progress', 75, '2026-06-30', 'Actuellement à 29.2%, en amélioration', 1);

-- Clara Roux (eval-18)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000037', '70000000-0000-4000-a000-000000000018', 'Score Google 4.3/5', 'Améliorer la note Google du restaurant Lyon (actuellement 4.1).', 'in_progress', 50, '2026-06-30', 'Note actuelle : 4.2', 0);

-- Sakura Ito (eval-19)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000038', '70000000-0000-4000-a000-000000000019', 'Définir la carte d''ouverture', 'Créer la carte complète du restaurant Bordeaux : 25 références minimum, fiches techniques, costing.', 'completed', 100, '2026-02-15', 'Carte validée avec 28 références', 0),
  ('80000000-0000-4000-a000-000000000039', '70000000-0000-4000-a000-000000000019', 'Former l''équipe cuisine', 'Former Lucas et le futur second aux standards Sushi Neko.', 'in_progress', 50, '2026-04-30', 'Lucas en bonne progression, second pas encore recruté', 1),
  ('80000000-0000-4000-a000-000000000040', '70000000-0000-4000-a000-000000000019', 'Food cost d''ouverture ≤ 32%', 'Maintenir un food cost acceptable pendant la phase de montée en puissance.', 'in_progress', 40, '2026-06-30', 'Actuellement à 33%, normal en phase de lancement', 2);

-- Thomas Girard (eval-20)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000041', '70000000-0000-4000-a000-000000000020', 'Atteindre 200K€ de CA mensuel', 'Augmenter le CA de 15% par rapport au S2 2025.', 'in_progress', 40, '2026-06-30', 'CA février : 185K€', 0),
  ('80000000-0000-4000-a000-000000000042', '70000000-0000-4000-a000-000000000020', 'Déployer le programme fidélité', 'Lancer Sushi Neko Rewards au restaurant Lyon.', 'not_started', 0, '2026-05-31', '', 1);
