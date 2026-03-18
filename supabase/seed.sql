-- =============================================
-- Talent Review — Seed Data (Sushi Neko demo)
-- =============================================
-- Demo credentials:
--   sophie@sushineko.fr  / password123 (Admin)
--   thomas@sushineko.fr  / password123 (Directeur — Lyon + Bordeaux)
--   kenji@sushineko.fr   / password123 (Manager)
--   maxime@sushineko.fr  / password123 (Employee)
-- =============================================

-- =============================================
-- Company
-- =============================================
INSERT INTO companies (id, name, slug, owner_id, logo) VALUES
  ('00000000-0000-4000-b000-000000000001', 'Sushi Neko', 'sushineko', NULL, '');

-- =============================================
-- Establishments
-- =============================================
INSERT INTO establishments (id, name, description, company_id) VALUES
  ('10000000-0000-4000-a000-000000000001', 'Sushi Neko — Paris Opéra', 'Restaurant flagship, 80 couverts, ouvert 7j/7', '00000000-0000-4000-b000-000000000001'),
  ('10000000-0000-4000-a000-000000000002', 'Sushi Neko — Lyon Part-Dieu', 'Restaurant centre commercial, 50 couverts', '00000000-0000-4000-b000-000000000001'),
  ('10000000-0000-4000-a000-000000000003', 'Sushi Neko — Bordeaux Chartrons', 'Nouveau restaurant, ouverture récente', '00000000-0000-4000-b000-000000000001');

-- =============================================
-- Teams
-- =============================================
INSERT INTO teams (id, establishment_id, name, description, company_id) VALUES
  -- Paris
  ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', 'Cuisine Paris', 'Équipe cuisine du restaurant Paris Opéra', '00000000-0000-4000-b000-000000000001'),
  ('20000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', 'Salle Paris', 'Équipe salle et service du restaurant Paris Opéra', '00000000-0000-4000-b000-000000000001'),
  -- Lyon
  ('20000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000002', 'Cuisine Lyon', 'Équipe cuisine du restaurant Lyon Part-Dieu', '00000000-0000-4000-b000-000000000001'),
  ('20000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000002', 'Salle Lyon', 'Équipe salle et service du restaurant Lyon Part-Dieu', '00000000-0000-4000-b000-000000000001'),
  -- Bordeaux
  ('20000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000003', 'Cuisine Bordeaux', 'Équipe cuisine du restaurant Bordeaux Chartrons', '00000000-0000-4000-b000-000000000001'),
  ('20000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000003', 'Salle Bordeaux', 'Équipe salle et service du restaurant Bordeaux Chartrons', '00000000-0000-4000-b000-000000000001');

-- =============================================
-- Employees
-- =============================================
INSERT INTO employees (id, name, position, photo, email, establishment_id, team_id, salary, late_count, unjustified_absences, justified_absences, company_id) VALUES
  -- Paris Opéra — Cuisine
  ('30000000-0000-4000-a000-000000000001', 'Kenji Tanaka',    'Chef Sushi',              '👨🏻',     'kenji@sushineko.fr',   '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 38000, 0, 0, 2, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000002', 'Léa Moreau',      'Second de cuisine',       '👩🏻',     'lea@sushineko.fr',     '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 30000, 1, 0, 3, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000003', 'Yuki Sato',       'Commis de cuisine',       '👱🏻‍♀️', 'yuki@sushineko.fr',    '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 22000, 2, 1, 4, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000004', 'Théo Martin',     'Commis de cuisine',       '👨🏻‍🦱', 'theo@sushineko.fr',    '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 21500, 5, 2, 1, '00000000-0000-4000-b000-000000000001'),
  -- Paris Opéra — Salle
  ('30000000-0000-4000-a000-000000000005', 'Camille Dubois',  'Responsable de salle',    '👩🏻‍🦰', 'camille@sushineko.fr', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 28000, 1, 0, 2, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000006', 'Maxime Bernard',  'Serveur',                 '👨🏻‍🦰', 'maxime@sushineko.fr',  '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 22000, 3, 1, 3, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000007', 'Inès Chevalier',  'Serveuse',                '👩🏾‍🦱', 'ines@sushineko.fr',    '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 21500, 0, 0, 5, '00000000-0000-4000-b000-000000000001'),
  -- Paris Opéra — Management (pas de team)
  ('30000000-0000-4000-a000-000000000008', 'Sophie Laurent',  'Directrice de restaurant','👱🏾‍♀️', 'sophie@sushineko.fr',  '10000000-0000-4000-a000-000000000001', NULL,                                   48000, 0, 0, 1, '00000000-0000-4000-b000-000000000001'),
  -- Lyon Part-Dieu — Cuisine
  ('30000000-0000-4000-a000-000000000009', 'Hiroshi Yamamoto','Chef Sushi',              '👨🏽',     'hiroshi@sushineko.fr', '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000003', 36000, 1, 0, 2, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000010', 'Jules Petit',     'Commis de cuisine',       '🧑🏻‍🦱', 'jules@sushineko.fr',   '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000003', 21000, 4, 3, 2, '00000000-0000-4000-b000-000000000001'),
  -- Lyon Part-Dieu — Salle
  ('30000000-0000-4000-a000-000000000011', 'Clara Roux',      'Responsable de salle',    '👱🏻‍♀️', 'clara@sushineko.fr',   '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000004', 27000, 0, 0, 3, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000012', 'Amine Benali',    'Serveur',                 '👨🏽',     'amine@sushineko.fr',   '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000004', 21500, 6, 2, 1, '00000000-0000-4000-b000-000000000001'),
  -- Lyon Part-Dieu — Management
  ('30000000-0000-4000-a000-000000000013', 'Thomas Girard',   'Directeur de restaurant', '👨🏻',     'thomas@sushineko.fr',  '10000000-0000-4000-a000-000000000002', NULL,                                   45000, 0, 0, 2, '00000000-0000-4000-b000-000000000001'),
  -- Bordeaux Chartrons — Cuisine
  ('30000000-0000-4000-a000-000000000014', 'Sakura Ito',      'Chef Sushi',              '👩🏻',     'sakura@sushineko.fr',  '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000005', 37000, 0, 0, 1, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000015', 'Lucas Faure',     'Commis de cuisine',       '👨🏻‍🦱', 'lucas@sushineko.fr',   '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000005', 21000, 2, 1, 3, '00000000-0000-4000-b000-000000000001'),
  -- Bordeaux Chartrons — Salle
  ('30000000-0000-4000-a000-000000000016', 'Emma Lefèvre',    'Responsable de salle',    '👩🏻‍🦰', 'emma@sushineko.fr',    '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000006', 26000, 1, 0, 2, '00000000-0000-4000-b000-000000000001'),
  ('30000000-0000-4000-a000-000000000017', 'Noah Garcia',     'Serveur',                 '👨🏻‍🦰', 'noah@sushineko.fr',    '10000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000006', 21500, 3, 1, 4, '00000000-0000-4000-b000-000000000001');

-- =============================================
-- Auth Users (3 demo accounts)
-- NOTE: No trigger — profiles are created explicitly below.
-- =============================================

-- Sophie Laurent — Admin
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
  '{"name": "Sophie Laurent", "photo": "👱🏾‍♀️", "role": "admin"}'::jsonb,
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

-- Thomas Girard — Directeur
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-a000-000000000004',
  'authenticated', 'authenticated',
  'thomas@sushineko.fr',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Thomas Girard", "photo": "👨🏻", "role": "directeur"}'::jsonb,
  now(), now(), '', ''
);
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'a0000000-0000-4000-a000-000000000004',
  jsonb_build_object('sub', 'a0000000-0000-4000-a000-000000000004', 'email', 'thomas@sushineko.fr', 'email_verified', true, 'phone_verified', false),
  'email',
  'a0000000-0000-4000-a000-000000000004',
  now(), now(), now()
);

-- =============================================
-- Profiles (created directly, no trigger)
-- =============================================
-- Sophie (Admin) — establishment Paris
INSERT INTO profiles (id, name, photo, role, employee_id, team_ids, establishment_id, establishment_ids, company_id) VALUES (
  'a0000000-0000-4000-a000-000000000001',
  'Sophie Laurent', '👱🏾‍♀️', 'admin',
  '30000000-0000-4000-a000-000000000008',
  '{}',
  '10000000-0000-4000-a000-000000000001',
  '{}',
  '00000000-0000-4000-b000-000000000001'
);

-- Kenji (Manager) — manages Cuisine Paris + Salle Paris teams
INSERT INTO profiles (id, name, photo, role, employee_id, team_ids, establishment_id, establishment_ids, company_id) VALUES (
  'a0000000-0000-4000-a000-000000000002',
  'Kenji Tanaka', '👨🏻', 'manager',
  '30000000-0000-4000-a000-000000000001',
  ARRAY['20000000-0000-4000-a000-000000000001'::uuid, '20000000-0000-4000-a000-000000000002'::uuid],
  '10000000-0000-4000-a000-000000000001',
  '{}',
  '00000000-0000-4000-b000-000000000001'
);

-- Maxime (Employee) — linked to his employee record
INSERT INTO profiles (id, name, photo, role, employee_id, team_ids, establishment_id, establishment_ids, company_id) VALUES (
  'a0000000-0000-4000-a000-000000000003',
  'Maxime Bernard', '👨🏻‍🦰', 'employee',
  '30000000-0000-4000-a000-000000000006',
  '{}',
  '10000000-0000-4000-a000-000000000001',
  '{}',
  '00000000-0000-4000-b000-000000000001'
);

-- Thomas (Directeur) — manages Lyon + Bordeaux establishments
INSERT INTO profiles (id, name, photo, role, employee_id, team_ids, establishment_id, establishment_ids, company_id) VALUES (
  'a0000000-0000-4000-a000-000000000004',
  'Thomas Girard', '👨🏻', 'directeur',
  '30000000-0000-4000-a000-000000000013',
  '{}',
  '10000000-0000-4000-a000-000000000002',
  ARRAY['10000000-0000-4000-a000-000000000002'::uuid, '10000000-0000-4000-a000-000000000003'::uuid],
  '00000000-0000-4000-b000-000000000001'
);

-- Update company owner now that profiles exist
UPDATE companies SET owner_id = 'a0000000-0000-4000-a000-000000000001' WHERE id = '00000000-0000-4000-b000-000000000001';

-- =============================================
-- Positions
-- =============================================
INSERT INTO positions (id, name, description, role, company_id) VALUES
  ('40000000-0000-4000-a000-000000000001', 'Chef Sushi',              'Responsable de la préparation des sushis, sashimis et makis. Garant de la qualité et de la créativité de la carte.', 'manager', '00000000-0000-4000-b000-000000000001'),
  ('40000000-0000-4000-a000-000000000002', 'Second de cuisine',       'Assiste le chef, supervise les commis, gère les stocks et les commandes fournisseurs.', 'manager', '00000000-0000-4000-b000-000000000001'),
  ('40000000-0000-4000-a000-000000000003', 'Commis de cuisine',       'Préparation des ingrédients, mise en place, nettoyage. Apprend les techniques de découpe et de présentation.', 'employee', '00000000-0000-4000-b000-000000000001'),
  ('40000000-0000-4000-a000-000000000004', 'Responsable de salle',    'Gère l''accueil, le service, la satisfaction client et l''équipe de salle.', 'manager', '00000000-0000-4000-b000-000000000001'),
  ('40000000-0000-4000-a000-000000000005', 'Serveur',                 'Accueil, prise de commande, service en salle, encaissement.', 'employee', '00000000-0000-4000-b000-000000000001'),
  ('40000000-0000-4000-a000-000000000006', 'Serveuse',                'Accueil, prise de commande, service en salle, encaissement.', 'employee', '00000000-0000-4000-b000-000000000001'),
  ('40000000-0000-4000-a000-000000000007', 'Directrice de restaurant','Pilote l''activité du restaurant : P&L, RH, qualité, satisfaction client.', 'directeur', '00000000-0000-4000-b000-000000000001'),
  ('40000000-0000-4000-a000-000000000008', 'Directeur de restaurant', 'Pilote l''activité du restaurant : P&L, RH, qualité, satisfaction client.', 'directeur', '00000000-0000-4000-b000-000000000001');

-- =============================================
-- Objective Templates
-- =============================================
INSERT INTO objective_templates (id, position_id, title, description, suggested_deadline_days, company_id) VALUES
  -- Chef Sushi
  ('50000000-0000-4000-a000-000000000001', '40000000-0000-4000-a000-000000000001', 'Créer 3 nouvelles recettes saisonnières', 'Développer 3 nouvelles recettes de makis/sushis utilisant des produits de saison, avec fiches techniques complètes et costing validé.', 90, '00000000-0000-4000-b000-000000000001'),
  ('50000000-0000-4000-a000-000000000002', '40000000-0000-4000-a000-000000000001', 'Réduire le food cost de 2 points', 'Optimiser les achats, réduire le gaspillage et ajuster les portions pour atteindre un food cost cible de 28%.', 180, '00000000-0000-4000-b000-000000000001'),
  ('50000000-0000-4000-a000-000000000003', '40000000-0000-4000-a000-000000000001', 'Former un commis à la découpe du poisson', 'Accompagner un commis dans l''apprentissage des techniques de découpe (sashimi, nigiri), avec évaluation pratique en fin de formation.', 120, '00000000-0000-4000-b000-000000000001'),
  -- Second de cuisine
  ('50000000-0000-4000-a000-000000000004', '40000000-0000-4000-a000-000000000002', 'Mettre en place l''inventaire hebdomadaire', 'Instaurer un inventaire hebdomadaire systématique avec fichier de suivi, écarts analysés et plan d''action correctif.', 60, '00000000-0000-4000-b000-000000000001'),
  ('50000000-0000-4000-a000-000000000005', '40000000-0000-4000-a000-000000000002', 'Réduire les pertes matière de 15%', 'Identifier les principales sources de pertes, mettre en place des actions correctives et suivre l''évolution mensuelle.', 120, '00000000-0000-4000-b000-000000000001'),
  -- Commis de cuisine
  ('50000000-0000-4000-a000-000000000006', '40000000-0000-4000-a000-000000000003', 'Maîtriser 5 techniques de découpe', 'Apprendre et maîtriser les techniques : julienne, brunoise, découpe sashimi, découpe maki, tournage de légumes.', 90, '00000000-0000-4000-b000-000000000001'),
  ('50000000-0000-4000-a000-000000000007', '40000000-0000-4000-a000-000000000003', 'Obtenir le certificat HACCP', 'Suivre la formation hygiène alimentaire HACCP et obtenir la certification.', 60, '00000000-0000-4000-b000-000000000001'),
  -- Responsable de salle
  ('50000000-0000-4000-a000-000000000008', '40000000-0000-4000-a000-000000000004', 'Atteindre un score Google de 4.5/5', 'Améliorer la satisfaction client mesurée par les avis Google : accueil, rapidité, qualité de service.', 180, '00000000-0000-4000-b000-000000000001'),
  ('50000000-0000-4000-a000-000000000009', '40000000-0000-4000-a000-000000000004', 'Réduire le turnover salle de 20%', 'Améliorer la rétention de l''équipe par un meilleur onboarding, des entretiens réguliers et un planning équilibré.', 180, '00000000-0000-4000-b000-000000000001'),
  -- Serveur
  ('50000000-0000-4000-a000-000000000010', '40000000-0000-4000-a000-000000000005', 'Maîtriser la carte et les allergènes', 'Connaître l''intégralité de la carte (ingrédients, techniques, allergènes) pour conseiller les clients en toute autonomie.', 30, '00000000-0000-4000-b000-000000000001'),
  ('50000000-0000-4000-a000-000000000011', '40000000-0000-4000-a000-000000000005', 'Augmenter le ticket moyen de 10%', 'Développer les techniques de vente additionnelle : suggestion de boissons, desserts, formules premium.', 90, '00000000-0000-4000-b000-000000000001'),
  -- Directrice de restaurant
  ('50000000-0000-4000-a000-000000000012', '40000000-0000-4000-a000-000000000007', 'Atteindre le CA mensuel cible', 'Piloter l''activité pour atteindre l''objectif de chiffre d''affaires mensuel défini par la direction.', 180, '00000000-0000-4000-b000-000000000001'),
  ('50000000-0000-4000-a000-000000000013', '40000000-0000-4000-a000-000000000007', 'Déployer le nouveau programme de fidélité', 'Lancer le programme de fidélité dans le restaurant : formation équipe, communication client, suivi des inscriptions.', 90, '00000000-0000-4000-b000-000000000001'),
  -- Directeur de restaurant
  ('50000000-0000-4000-a000-000000000014', '40000000-0000-4000-a000-000000000008', 'Atteindre le CA mensuel cible', 'Piloter l''activité pour atteindre l''objectif de chiffre d''affaires mensuel défini par la direction.', 180, '00000000-0000-4000-b000-000000000001');

-- =============================================
-- Semesters (Campaigns)
-- =============================================
INSERT INTO semesters (id, year, semester, name, status, closing_deadline, company_id) VALUES
  ('60000000-0000-4000-a000-000000000010', 2024, 'S1', 'S1 2024', 'closed',  '2024-06-30', '00000000-0000-4000-b000-000000000001'),
  ('60000000-0000-4000-a000-000000000011', 2024, 'S2', 'S2 2024', 'closed',  '2024-12-31', '00000000-0000-4000-b000-000000000001'),
  ('60000000-0000-4000-a000-000000000012', 2025, 'S1', 'S1 2025', 'closed',  '2025-06-30', '00000000-0000-4000-b000-000000000001'),
  ('60000000-0000-4000-a000-000000000001', 2025, 'S2', 'S2 2025', 'closed',  '2025-12-31', '00000000-0000-4000-b000-000000000001'),
  ('60000000-0000-4000-a000-000000000002', 2026, 'S1', 'S1 2026', 'active',  '2026-06-30', '00000000-0000-4000-b000-000000000001'),
  ('60000000-0000-4000-a000-000000000003', 2026, 'S2', 'S2 2026', 'draft',   '2026-12-31', '00000000-0000-4000-b000-000000000001');


-- =============================================
-- Temporarily allow NULL company_id for evaluations/objectives
-- (no auth context during seeding, so trigger can't auto-fill)
-- =============================================
ALTER TABLE evaluations ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE objectives ALTER COLUMN company_id DROP NOT NULL;

-- =============================================
-- Evaluations — S1 2024 (closed, all validated)
-- First semester of evaluation for the company
-- =============================================

-- Kenji Tanaka — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager, bilan_employee) VALUES
  ('70000000-0000-4000-a000-000000000101', '30000000-0000-4000-a000-000000000001', '60000000-0000-4000-a000-000000000010', 'validated', 2, 2,
   'Premier semestre en tant que Chef Sushi. Kenji s''adapte bien mais doit encore gagner en efficacité sur les services du soir.',
   'Je découvre mon rôle de chef. Le rythme est intense mais je m''améliore chaque semaine.');

-- Léa Moreau — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000102', '30000000-0000-4000-a000-000000000002', '60000000-0000-4000-a000-000000000010', 'validated', 2, 2,
   'Léa est fiable en cuisine mais manque encore de confiance pour prendre des initiatives.');

-- Yuki Sato — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000103', '30000000-0000-4000-a000-000000000003', '60000000-0000-4000-a000-000000000010', 'validated', 1, 2,
   'Yuki débute. Les bases sont là mais la rapidité et la précision doivent progresser. Quelques retards à corriger.');

-- Théo Martin — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000104', '30000000-0000-4000-a000-000000000004', '60000000-0000-4000-a000-000000000010', 'validated', 1, 1,
   'Théo a des difficultés d''assiduité et de motivation. Plusieurs retards non justifiés. Un recadrage a été fait.');

-- Camille Dubois — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000105', '30000000-0000-4000-a000-000000000005', '60000000-0000-4000-a000-000000000010', 'validated', 2, 2,
   'Camille gère bien la salle au quotidien. Elle doit travailler la gestion des pics d''affluence.');

-- Maxime Bernard — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000106', '30000000-0000-4000-a000-000000000006', '60000000-0000-4000-a000-000000000010', 'validated', 1, 2,
   'Maxime apprend le métier. Bon contact client mais encore lent sur le service. Potentiel intéressant.');

-- Inès Chevalier — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000107', '30000000-0000-4000-a000-000000000007', '60000000-0000-4000-a000-000000000010', 'validated', 2, 2,
   'Inès est très professionnelle et appréciée des clients. Ponctuelle et rigoureuse.');

-- Sophie Laurent — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000108', '30000000-0000-4000-a000-000000000008', '60000000-0000-4000-a000-000000000010', 'validated', 2, 3,
   'Sophie a bien lancé le restaurant Paris Opéra. La montée en puissance est progressive, le CA est en ligne avec les prévisions.');

-- Hiroshi Yamamoto — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000109', '30000000-0000-4000-a000-000000000009', '60000000-0000-4000-a000-000000000010', 'validated', 2, 1,
   'Hiroshi est solide techniquement. Il fait un travail régulier sans éclat. Peu d''initiative sur la carte.');

-- Jules Petit — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000110', '30000000-0000-4000-a000-000000000010', '60000000-0000-4000-a000-000000000010', 'validated', 1, 1,
   'Jules a du mal à tenir le rythme. Absences fréquentes et niveau technique insuffisant. Point de vigilance.');

-- Clara Roux — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000111', '30000000-0000-4000-a000-000000000011', '60000000-0000-4000-a000-000000000010', 'validated', 2, 2,
   'Clara fait du bon travail en salle à Lyon. Service fluide et bien organisé.');

-- Amine Benali — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000112', '30000000-0000-4000-a000-000000000012', '60000000-0000-4000-a000-000000000010', 'validated', 1, 1,
   'Amine accumule les retards et les absences injustifiées. Le service client est correct mais l''assiduité pose problème.');

-- Thomas Girard — S1 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000113', '30000000-0000-4000-a000-000000000013', '60000000-0000-4000-a000-000000000010', 'validated', 2, 2,
   'Thomas gère le restaurant Lyon avec sérieux. Le CA est stable et l''équipe fonctionne. Doit développer le volet commercial.');

-- =============================================
-- Objectives — S1 2024
-- =============================================

-- Kenji (eval-101)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000101', '70000000-0000-4000-a000-000000000101', 'Structurer la carte de lancement', 'Créer la carte initiale du restaurant avec 20 références minimum.', 'completed', 100, '2024-03-31', 'Carte lancée avec 22 références', 0),
  ('80000000-0000-4000-a000-000000000102', '70000000-0000-4000-a000-000000000101', 'Organiser le poste de travail', 'Définir l''organisation du poste sushi : rangement, flux, mise en place.', 'completed', 100, '2024-04-30', 'Organisation validée et documentée', 1);

-- Léa (eval-102)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000103', '70000000-0000-4000-a000-000000000102', 'Maîtriser le processus de commande', 'Gérer les commandes fournisseurs de manière autonome.', 'completed', 100, '2024-05-31', 'Autonome depuis avril', 0),
  ('80000000-0000-4000-a000-000000000104', '70000000-0000-4000-a000-000000000102', 'Réduire le temps de mise en place', 'Passer de 90 à 60 minutes pour la mise en place du service.', 'in_progress', 70, '2024-06-30', 'Temps moyen à 68 minutes', 1);

-- Yuki (eval-103)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000105', '70000000-0000-4000-a000-000000000103', 'Maîtriser les techniques de base', 'Découpe légumes, riz à sushi, assemblage maki de base.', 'in_progress', 60, '2024-06-30', '2 techniques sur 3 validées', 0),
  ('80000000-0000-4000-a000-000000000106', '70000000-0000-4000-a000-000000000103', 'Zéro retard sur le semestre', 'Améliorer la ponctualité.', 'blocked', 30, '2024-06-30', '3 retards enregistrés', 1);

-- Théo (eval-104)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000107', '70000000-0000-4000-a000-000000000104', 'Respecter les horaires', 'Aucun retard injustifié sur le semestre.', 'blocked', 20, '2024-06-30', '4 retards injustifiés, 1 absence', 0),
  ('80000000-0000-4000-a000-000000000108', '70000000-0000-4000-a000-000000000104', 'Maîtriser la mise en place', 'Être autonome sur la mise en place complète du poste.', 'in_progress', 50, '2024-06-30', 'Progrès lents mais réels', 1);

-- Camille (eval-105)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000109', '70000000-0000-4000-a000-000000000105', 'Mettre en place le plan de salle', 'Optimiser le plan de salle pour améliorer le flux de service.', 'completed', 100, '2024-04-30', 'Nouveau plan en place, +8 couverts/service', 0),
  ('80000000-0000-4000-a000-000000000110', '70000000-0000-4000-a000-000000000105', 'Former 2 nouveaux serveurs', 'Intégrer et former les 2 serveurs recrutés en mars.', 'completed', 100, '2024-05-31', 'Les 2 serveurs sont autonomes', 1);

-- Maxime (eval-106)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000111', '70000000-0000-4000-a000-000000000106', 'Apprendre la carte de base', 'Connaître les 20 plats principaux et les allergènes courants.', 'in_progress', 65, '2024-06-30', '14 plats maîtrisés sur 20', 0),
  ('80000000-0000-4000-a000-000000000112', '70000000-0000-4000-a000-000000000106', 'Maîtriser l''encaissement', 'Être autonome sur le logiciel de caisse.', 'completed', 100, '2024-04-30', 'Autonome depuis mi-avril', 1);

-- Inès (eval-107)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000113', '70000000-0000-4000-a000-000000000107', 'Obtenir 5 avis positifs nominatifs', 'Être citée par les clients dans les avis Google.', 'completed', 100, '2024-06-30', '7 avis positifs la mentionnant', 0),
  ('80000000-0000-4000-a000-000000000114', '70000000-0000-4000-a000-000000000107', 'Maîtriser le service des boissons', 'Connaître la carte des boissons et le service du saké.', 'completed', 100, '2024-05-31', 'Parfaitement à l''aise', 1);

-- Sophie (eval-108)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000115', '70000000-0000-4000-a000-000000000108', 'Atteindre 250K€ de CA mensuel', 'Objectif d''ouverture : atteindre le seuil de rentabilité.', 'in_progress', 80, '2024-06-30', 'CA moyen : 240K€, proche de l''objectif', 0),
  ('80000000-0000-4000-a000-000000000116', '70000000-0000-4000-a000-000000000108', 'Recruter l''équipe complète', 'Finaliser le recrutement des 7 postes restants.', 'completed', 100, '2024-04-30', 'Équipe au complet depuis fin avril', 1);

-- Hiroshi (eval-109)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000117', '70000000-0000-4000-a000-000000000109', 'Maintenir la régularité qualité', 'Zéro retour négatif majeur sur la qualité des plats.', 'completed', 100, '2024-06-30', '1 seul retour mineur en 6 mois', 0),
  ('80000000-0000-4000-a000-000000000118', '70000000-0000-4000-a000-000000000109', 'Créer 2 plats signature Lyon', 'Développer 2 recettes spécifiques pour le restaurant Lyon.', 'in_progress', 50, '2024-06-30', '1 plat créé, le second en test', 1);

-- Jules (eval-110)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000119', '70000000-0000-4000-a000-000000000110', 'Maîtriser les bases cuisine', 'Être autonome sur la préparation des ingrédients et la mise en place.', 'in_progress', 40, '2024-06-30', 'Progression lente, manque d''assiduité', 0);

-- Clara (eval-111)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000120', '70000000-0000-4000-a000-000000000111', 'Organiser le service Lyon', 'Structurer le service en salle : répartition des rangs, planning.', 'completed', 100, '2024-04-30', 'Organisation en place et fonctionnelle', 0),
  ('80000000-0000-4000-a000-000000000121', '70000000-0000-4000-a000-000000000111', 'Score Google ≥ 4.0', 'Atteindre une note Google de 4.0 minimum pour le lancement.', 'completed', 100, '2024-06-30', 'Note : 4.1 en juin', 1);

-- Amine (eval-112)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000122', '70000000-0000-4000-a000-000000000112', 'Réduire les retards à 0', 'Être ponctuel à chaque service.', 'blocked', 10, '2024-06-30', '5 retards et 2 absences injustifiées', 0),
  ('80000000-0000-4000-a000-000000000123', '70000000-0000-4000-a000-000000000112', 'Maîtriser le service', 'Être autonome sur un rang de 6 tables.', 'in_progress', 60, '2024-06-30', 'Gère 4 tables correctement', 1);

-- Thomas (eval-113)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000124', '70000000-0000-4000-a000-000000000113', 'Atteindre 150K€ de CA mensuel', 'Objectif de montée en puissance du restaurant Lyon.', 'in_progress', 85, '2024-06-30', 'CA moyen : 142K€', 0),
  ('80000000-0000-4000-a000-000000000125', '70000000-0000-4000-a000-000000000113', 'Stabiliser l''équipe', 'Réduire le turnover pendant la phase de lancement.', 'completed', 100, '2024-06-30', '1 seul départ en 6 mois', 1);


-- =============================================
-- Evaluations — S2 2024 (closed, all validated)
-- =============================================

-- Kenji — S2 2024 (progression: 2→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager, bilan_employee) VALUES
  ('70000000-0000-4000-a000-000000000201', '30000000-0000-4000-a000-000000000001', '60000000-0000-4000-a000-000000000011', 'validated', 2, 2,
   'Kenji est plus à l''aise dans son rôle. La carte d''été a été un succès. Il doit travailler la gestion d''équipe et la délégation.',
   'Je suis content de la carte d''été. Je voudrais apprendre de nouvelles techniques pour la carte d''hiver.');

-- Léa — S2 2024 (progression: 2→2 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000202', '30000000-0000-4000-a000-000000000002', '60000000-0000-4000-a000-000000000011', 'validated', 2, 3,
   'Léa progresse bien. Elle prend de plus en plus d''initiatives et gère les commandes de manière autonome. Fort potentiel pour devenir sous-chef.');

-- Yuki — S2 2024 (progression: 1→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000203', '30000000-0000-4000-a000-000000000003', '60000000-0000-4000-a000-000000000011', 'validated', 2, 2,
   'Nette amélioration de Yuki. Les retards sont réduits et la technique progresse. Elle commence à être autonome sur le poste maki.');

-- Théo — S2 2024 (stagnation: 1→1 perf, 1→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000204', '30000000-0000-4000-a000-000000000004', '60000000-0000-4000-a000-000000000011', 'validated', 1, 2,
   'Légère amélioration de l''assiduité mais pas suffisante. Théo a du potentiel technique quand il est présent. Dernier semestre d''avertissement.');

-- Camille — S2 2024 (progression: 2→2 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000205', '30000000-0000-4000-a000-000000000005', '60000000-0000-4000-a000-000000000011', 'validated', 2, 3,
   'Camille a beaucoup progressé sur la gestion de l''équipe. La note Google est passée à 4.4. Elle est prête pour plus de responsabilités.');

-- Maxime — S2 2024 (progression: 1→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager, bilan_employee) VALUES
  ('70000000-0000-4000-a000-000000000206', '30000000-0000-4000-a000-000000000006', '60000000-0000-4000-a000-000000000011', 'validated', 2, 2,
   'Maxime a progressé sur la rapidité de service et la connaissance de la carte. Bon relationnel client.',
   'Je me sens plus à l''aise maintenant. Je voudrais essayer la vente de saké.');

-- Inès — S2 2024 (progression: 2→3 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000207', '30000000-0000-4000-a000-000000000007', '60000000-0000-4000-a000-000000000011', 'validated', 3, 2,
   'Inès est devenue la meilleure serveuse de l''équipe. Son ticket moyen est le plus élevé. Excellente ambassadrice du restaurant.');

-- Sophie — S2 2024 (progression: 2→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000208', '30000000-0000-4000-a000-000000000008', '60000000-0000-4000-a000-000000000011', 'validated', 3, 3,
   'Excellente performance de Sophie. Le CA a dépassé les objectifs de 8%. Elle pilote le restaurant avec maturité et vision stratégique.');

-- Hiroshi — S2 2024 (stagnation: 2→2 perf, 1→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000209', '30000000-0000-4000-a000-000000000009', '60000000-0000-4000-a000-000000000011', 'validated', 2, 2,
   'Hiroshi reste constant. La qualité est au rendez-vous. Il commence à proposer quelques idées de plats, c''est encourageant.');

-- Jules — S2 2024 (stagnation: 1→1 perf, 1→1 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000210', '30000000-0000-4000-a000-000000000010', '60000000-0000-4000-a000-000000000011', 'validated', 1, 1,
   'Jules ne progresse pas assez. Absences toujours fréquentes. Un plan d''amélioration individuel sera mis en place.');

-- Clara — S2 2024 (progression: 2→2 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000211', '30000000-0000-4000-a000-000000000011', '60000000-0000-4000-a000-000000000011', 'validated', 2, 3,
   'Clara a amélioré la satisfaction client et commence à former les nouveaux serveurs. Potentiel pour un rôle élargi.');

-- Amine — S2 2024 (léger progrès: 1→1 perf, 1→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000212', '30000000-0000-4000-a000-000000000012', '60000000-0000-4000-a000-000000000011', 'validated', 1, 2,
   'Amine a réduit ses retards mais reste en dessous des attentes. Le service client s''améliore légèrement.');

-- Thomas — S2 2024 (stagnation: 2→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000213', '30000000-0000-4000-a000-000000000013', '60000000-0000-4000-a000-000000000011', 'validated', 2, 2,
   'Thomas est un gestionnaire fiable. Le restaurant tourne bien. Il doit maintenant passer à une dynamique de croissance.');


-- =============================================
-- Objectives — S2 2024
-- =============================================

-- Kenji (eval-201)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000201', '70000000-0000-4000-a000-000000000201', 'Créer la carte d''été', 'Développer 4 nouvelles recettes estivales (tataki thon, maki mangue, etc.).', 'completed', 100, '2024-07-15', 'Carte lancée le 1er juillet, excellent accueil', 0),
  ('80000000-0000-4000-a000-000000000202', '70000000-0000-4000-a000-000000000201', 'Food cost ≤ 30%', 'Maintenir le food cost en dessous de 30%.', 'in_progress', 80, '2024-12-31', 'Food cost à 30.2%, presque atteint', 1),
  ('80000000-0000-4000-a000-000000000203', '70000000-0000-4000-a000-000000000201', 'Déléguer la mise en place', 'Former Léa pour qu''elle gère la mise en place en autonomie.', 'completed', 100, '2024-10-31', 'Léa est autonome depuis octobre', 2);

-- Léa (eval-202)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000204', '70000000-0000-4000-a000-000000000202', 'Gérer les commandes seule', 'Passer et réceptionner les commandes fournisseurs sans supervision.', 'completed', 100, '2024-09-30', 'Totalement autonome', 0),
  ('80000000-0000-4000-a000-000000000205', '70000000-0000-4000-a000-000000000202', 'Remplacer le chef 1 service', 'Assurer un service complet en l''absence du chef.', 'completed', 100, '2024-11-30', 'Premier service solo réussi en novembre', 1);

-- Yuki (eval-203)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000206', '70000000-0000-4000-a000-000000000203', 'Valider les 3 techniques de base', 'Obtenir la validation sur découpe légumes, riz, assemblage maki.', 'completed', 100, '2024-09-30', 'Les 3 techniques sont validées', 0),
  ('80000000-0000-4000-a000-000000000207', '70000000-0000-4000-a000-000000000203', 'Améliorer la ponctualité', 'Maximum 1 retard sur le semestre.', 'in_progress', 70, '2024-12-31', '2 retards, en amélioration', 1);

-- Théo (eval-204)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000208', '70000000-0000-4000-a000-000000000204', 'Zéro absence injustifiée', 'Aucune absence injustifiée sur le semestre.', 'in_progress', 60, '2024-12-31', '1 absence injustifiée, en progrès par rapport à S1', 0),
  ('80000000-0000-4000-a000-000000000209', '70000000-0000-4000-a000-000000000204', 'Apprendre la découpe sashimi', 'Maîtriser la découpe sashimi niveau débutant.', 'in_progress', 40, '2024-12-31', 'Technique en cours d''acquisition', 1);

-- Camille (eval-205)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000210', '70000000-0000-4000-a000-000000000205', 'Score Google 4.4/5', 'Faire progresser la note Google de 4.2 à 4.4.', 'completed', 100, '2024-12-31', 'Note atteinte : 4.4', 0),
  ('80000000-0000-4000-a000-000000000211', '70000000-0000-4000-a000-000000000205', 'Gérer les réclamations', 'Mettre en place un processus de gestion des réclamations clients.', 'completed', 100, '2024-10-31', 'Processus en place, 95% de résolution positive', 1);

-- Maxime (eval-206)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000212', '70000000-0000-4000-a000-000000000206', 'Maîtriser 20 plats de la carte', 'Connaître la carte complète, ingrédients et allergènes.', 'completed', 100, '2024-10-31', '20/20 plats maîtrisés', 0),
  ('80000000-0000-4000-a000-000000000213', '70000000-0000-4000-a000-000000000206', 'Développer la vente boissons', 'Augmenter le CA boissons en suggérant des accords saké/plats.', 'in_progress', 60, '2024-12-31', 'CA boissons +5%, en progression', 1);

-- Inès (eval-207)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000214', '70000000-0000-4000-a000-000000000207', 'Ticket moyen le plus élevé', 'Avoir le ticket moyen le plus élevé de l''équipe salle.', 'completed', 100, '2024-12-31', 'Ticket moyen : 42€ vs 36€ équipe', 0),
  ('80000000-0000-4000-a000-000000000215', '70000000-0000-4000-a000-000000000207', 'Former Maxime au service', 'Accompagner Maxime sur les techniques de service premium.', 'completed', 100, '2024-11-30', 'Maxime a bien progressé grâce au tutorat', 1);

-- Sophie (eval-208)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000216', '70000000-0000-4000-a000-000000000208', 'Atteindre 280K€ de CA mensuel', 'Objectif de croissance S2 2024.', 'completed', 100, '2024-12-31', 'CA moyen : 295K€', 0),
  ('80000000-0000-4000-a000-000000000217', '70000000-0000-4000-a000-000000000208', 'Préparer le programme fidélité', 'Sélectionner la solution technique et préparer le lancement S1 2025.', 'completed', 100, '2024-12-31', 'Solution choisie, lancement prévu en mars', 1);

-- Hiroshi (eval-209)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000218', '70000000-0000-4000-a000-000000000209', 'Finaliser les plats signature', 'Terminer le 2e plat signature du restaurant Lyon.', 'completed', 100, '2024-09-30', 'Maki lyon et chirashi lyonnais au menu', 0),
  ('80000000-0000-4000-a000-000000000219', '70000000-0000-4000-a000-000000000209', 'Food cost ≤ 30%', 'Maintenir le food cost sous 30%.', 'in_progress', 80, '2024-12-31', 'Food cost à 30.5%, pas tout à fait atteint', 1);

-- Jules (eval-210)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000220', '70000000-0000-4000-a000-000000000210', 'Réduire les absences à 0', 'Aucune absence injustifiée.', 'blocked', 20, '2024-12-31', '2 absences injustifiées', 0),
  ('80000000-0000-4000-a000-000000000221', '70000000-0000-4000-a000-000000000210', 'Progresser en technique', 'Valider la mise en place complète du poste.', 'in_progress', 50, '2024-12-31', 'Progrès insuffisants', 1);

-- Clara (eval-211)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000222', '70000000-0000-4000-a000-000000000211', 'Score Google 4.2/5', 'Améliorer la note Google.', 'completed', 100, '2024-12-31', 'Note : 4.2 atteinte', 0),
  ('80000000-0000-4000-a000-000000000223', '70000000-0000-4000-a000-000000000211', 'Former les serveurs aux allergènes', 'S''assurer que toute l''équipe maîtrise les allergènes.', 'completed', 100, '2024-10-31', 'Formation faite, 100% de réussite au test', 1);

-- Amine (eval-212)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000224', '70000000-0000-4000-a000-000000000212', 'Ponctualité : max 2 retards', 'Réduire drastiquement les retards.', 'in_progress', 50, '2024-12-31', '3 retards, en légère amélioration', 0),
  ('80000000-0000-4000-a000-000000000225', '70000000-0000-4000-a000-000000000212', 'Gérer 6 tables', 'Être autonome sur un rang complet.', 'in_progress', 70, '2024-12-31', 'Gère 5 tables correctement', 1);

-- Thomas (eval-213)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000226', '70000000-0000-4000-a000-000000000213', 'Atteindre 160K€ de CA mensuel', 'Croissance de 10% par rapport à S1 2024.', 'completed', 100, '2024-12-31', 'CA moyen : 163K€', 0),
  ('80000000-0000-4000-a000-000000000227', '70000000-0000-4000-a000-000000000213', 'Développer la clientèle entreprise', 'Prospecter les entreprises du centre commercial pour les plateaux repas.', 'in_progress', 40, '2024-12-31', '3 entreprises contactées, 1 contrat signé', 1);


-- =============================================
-- Evaluations — S1 2025 (closed, all validated)
-- =============================================

-- Kenji — S1 2025 (progression: 2→3 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager, bilan_employee) VALUES
  ('70000000-0000-4000-a000-000000000301', '30000000-0000-4000-a000-000000000001', '60000000-0000-4000-a000-000000000012', 'validated', 3, 2,
   'Kenji est au top de sa forme. Le food cost est maîtrisé et sa carte de printemps a été plébiscitée. Il forme efficacement les commis.',
   'Je suis très fier de la carte de printemps. Mon objectif est de passer sous les 28% de food cost.');

-- Léa — S1 2025 (progression: 2→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000302', '30000000-0000-4000-a000-000000000002', '60000000-0000-4000-a000-000000000012', 'validated', 3, 3,
   'Léa est devenue un pilier de la cuisine. Elle gère les services en autonomie. Prête pour le poste de sous-chef.');

-- Yuki — S1 2025 (progression: 2→2 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000303', '30000000-0000-4000-a000-000000000003', '60000000-0000-4000-a000-000000000012', 'validated', 2, 3,
   'Yuki progresse régulièrement. Les retards sont rares maintenant. Elle montre un vrai potentiel créatif sur les présentations.');

-- Théo — S1 2025 (léger progrès: 1→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000304', '30000000-0000-4000-a000-000000000004', '60000000-0000-4000-a000-000000000012', 'validated', 2, 2,
   'Théo s''est ressaisi après l''avertissement. L''assiduité s''améliore nettement et il progresse en technique. Il faut maintenir l''effort.');

-- Camille — S1 2025 (progression: 2→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000305', '30000000-0000-4000-a000-000000000005', '60000000-0000-4000-a000-000000000012', 'validated', 3, 3,
   'Camille excelle. La note Google est à 4.5 et l''équipe est stable. Elle est prête pour diriger un restaurant.');

-- Maxime — S1 2025 (progression: 2→2 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager, bilan_employee) VALUES
  ('70000000-0000-4000-a000-000000000306', '30000000-0000-4000-a000-000000000006', '60000000-0000-4000-a000-000000000012', 'validated', 2, 3,
   'Maxime maîtrise la carte et développe de bonnes compétences en vente. Fort potentiel pour évoluer vers responsable de rang.',
   'J''adore mon travail. Le conseil aux clients sur les sakés me passionne, j''aimerais aller plus loin.');

-- Inès — S1 2025 (stable: 3→3 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000307', '30000000-0000-4000-a000-000000000007', '60000000-0000-4000-a000-000000000012', 'validated', 3, 3,
   'Inès continue d''exceller. Elle forme naturellement les nouveaux et est le modèle de l''équipe. Potentiel pour responsable de salle.');

-- Sophie — S1 2025 (stable: 3→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000308', '30000000-0000-4000-a000-000000000008', '60000000-0000-4000-a000-000000000012', 'validated', 3, 3,
   'Sophie confirme son excellente gestion. Le CA est en hausse continue. Elle pilote le lancement du programme fidélité avec succès.');

-- Hiroshi — S1 2025 (léger progrès: 2→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000309', '30000000-0000-4000-a000-000000000009', '60000000-0000-4000-a000-000000000012', 'validated', 2, 2,
   'Hiroshi est plus proactif cette année. L''idée du menu bento est de lui. La qualité reste irréprochable.');

-- Jules — S1 2025 (stagnation: 1→1 perf, 1→1 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000310', '30000000-0000-4000-a000-000000000010', '60000000-0000-4000-a000-000000000012', 'validated', 1, 1,
   'Malgré le plan d''amélioration, Jules ne montre pas de progrès significatif. Une décision sera prise au prochain semestre.');

-- Clara — S1 2025 (progression: 2→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000311', '30000000-0000-4000-a000-000000000011', '60000000-0000-4000-a000-000000000012', 'validated', 3, 3,
   'Clara a fait un bond en avant. La note Google Lyon est à 4.3 et elle gère la formation des nouveaux. Prête pour le poste adjoint.');

-- Amine — S1 2025 (léger progrès: 1→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000312', '30000000-0000-4000-a000-000000000012', '60000000-0000-4000-a000-000000000012', 'validated', 2, 2,
   'Amine fait enfin des progrès visibles. Les retards sont moins fréquents et le service s''améliore. À encourager.');

-- Thomas — S1 2025 (progression: 2→2 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000313', '30000000-0000-4000-a000-000000000013', '60000000-0000-4000-a000-000000000012', 'validated', 2, 3,
   'Thomas développe enfin le volet commercial. Les plateaux repas entreprise marchent bien. Le CA progresse régulièrement.');


-- =============================================
-- Objectives — S1 2025
-- =============================================

-- Kenji (eval-301)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000301', '70000000-0000-4000-a000-000000000301', 'Carte de printemps', 'Créer 5 recettes de printemps avec des produits de saison (fleurs, herbes fraîches).', 'completed', 100, '2025-04-01', 'Carte lancée, 5 recettes plébiscitées', 0),
  ('80000000-0000-4000-a000-000000000302', '70000000-0000-4000-a000-000000000301', 'Food cost ≤ 29%', 'Poursuivre l''optimisation des coûts matière.', 'completed', 100, '2025-06-30', 'Food cost à 28.8% en juin', 1),
  ('80000000-0000-4000-a000-000000000303', '70000000-0000-4000-a000-000000000301', 'Former Yuki à la découpe avancée', 'Enseigner les techniques de découpe sashimi et nigiri à Yuki.', 'completed', 100, '2025-06-30', 'Yuki valide la découpe sashimi intermédiaire', 2);

-- Léa (eval-302)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000304', '70000000-0000-4000-a000-000000000302', 'Gérer 5 services en autonomie', 'Assurer 5 services complets en tant que responsable cuisine.', 'completed', 100, '2025-05-31', '6 services gérés avec succès', 0),
  ('80000000-0000-4000-a000-000000000305', '70000000-0000-4000-a000-000000000302', 'Créer 2 recettes personnelles', 'Proposer et faire valider 2 recettes originales.', 'completed', 100, '2025-06-30', 'Maki avocat-truffe et california roll premium ajoutés', 1);

-- Yuki (eval-303)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000306', '70000000-0000-4000-a000-000000000303', 'Découpe sashimi intermédiaire', 'Maîtriser la découpe sashimi niveau intermédiaire.', 'completed', 100, '2025-05-31', 'Validée par Kenji', 0),
  ('80000000-0000-4000-a000-000000000307', '70000000-0000-4000-a000-000000000303', 'Ponctualité exemplaire', 'Zéro retard sur le semestre.', 'completed', 100, '2025-06-30', '0 retard ! Grande amélioration', 1);

-- Théo (eval-304)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000308', '70000000-0000-4000-a000-000000000304', 'Assiduité irréprochable', 'Zéro absence injustifiée et maximum 1 retard.', 'in_progress', 75, '2025-06-30', '1 retard et 0 absence, nette amélioration', 0),
  ('80000000-0000-4000-a000-000000000309', '70000000-0000-4000-a000-000000000304', 'Valider la découpe sashimi', 'Obtenir la validation sur la découpe sashimi débutant.', 'completed', 100, '2025-06-30', 'Technique validée en mai', 1);

-- Camille (eval-305)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000310', '70000000-0000-4000-a000-000000000305', 'Score Google 4.5/5', 'Atteindre la note cible.', 'completed', 100, '2025-06-30', 'Note : 4.5 atteinte en avril', 0),
  ('80000000-0000-4000-a000-000000000311', '70000000-0000-4000-a000-000000000305', 'Zéro départ d''équipe', 'Fidéliser l''équipe de salle.', 'completed', 100, '2025-06-30', 'Équipe stable sur tout le semestre', 1);

-- Maxime (eval-306)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000312', '70000000-0000-4000-a000-000000000306', 'Devenir référent saké', 'Passer la certification saké niveau 1 et conseiller les clients.', 'completed', 100, '2025-05-31', 'Certification obtenue, premiers accords proposés aux clients', 0),
  ('80000000-0000-4000-a000-000000000313', '70000000-0000-4000-a000-000000000306', 'Ticket moyen +8%', 'Augmenter le ticket moyen grâce à la vente additionnelle.', 'in_progress', 75, '2025-06-30', 'Ticket moyen +6%, en bonne voie', 1);

-- Inès (eval-307)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000314', '70000000-0000-4000-a000-000000000307', 'Former 3 nouveaux serveurs', 'Assurer le tutorat de 3 nouveaux serveurs.', 'completed', 100, '2025-06-30', '3 serveurs formés et autonomes', 0),
  ('80000000-0000-4000-a000-000000000315', '70000000-0000-4000-a000-000000000307', 'Préparer la certification sommelier', 'Commencer la préparation à l''examen de sommelier en vins et sakés.', 'in_progress', 50, '2025-06-30', 'Formation en cours, examen prévu en S2', 1);

-- Sophie (eval-308)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000316', '70000000-0000-4000-a000-000000000308', 'CA mensuel 310K€', 'Maintenir la croissance.', 'completed', 100, '2025-06-30', 'CA moyen : 318K€', 0),
  ('80000000-0000-4000-a000-000000000317', '70000000-0000-4000-a000-000000000308', 'Lancer le programme fidélité', 'Déployer Sushi Neko Rewards.', 'completed', 100, '2025-04-30', '800 inscrits le premier mois', 1);

-- Hiroshi (eval-309)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000318', '70000000-0000-4000-a000-000000000309', 'Proposer le menu bento', 'Concevoir un menu bento pour le déjeuner.', 'completed', 100, '2025-04-30', 'Menu bento lancé, 15 couverts/jour en moyenne', 0),
  ('80000000-0000-4000-a000-000000000319', '70000000-0000-4000-a000-000000000309', 'Food cost ≤ 29.5%', 'Améliorer le food cost.', 'in_progress', 80, '2025-06-30', 'Food cost à 29.8%, en progrès', 1);

-- Jules (eval-310)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000320', '70000000-0000-4000-a000-000000000310', 'Respecter le plan d''amélioration', 'Suivre les 5 points du plan d''amélioration individuel.', 'in_progress', 30, '2025-06-30', '2 points sur 5 respectés', 0);

-- Clara (eval-311)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000321', '70000000-0000-4000-a000-000000000311', 'Score Google 4.3/5', 'Continuer à améliorer la note.', 'completed', 100, '2025-06-30', 'Note : 4.3 atteinte', 0),
  ('80000000-0000-4000-a000-000000000322', '70000000-0000-4000-a000-000000000311', 'Créer le parcours d''intégration', 'Structurer un parcours d''intégration salle pour les nouveaux.', 'completed', 100, '2025-05-31', 'Parcours de 3 jours en place', 1);

-- Amine (eval-312)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000323', '70000000-0000-4000-a000-000000000312', 'Max 1 retard par mois', 'Continuer l''amélioration de la ponctualité.', 'in_progress', 70, '2025-06-30', '2 retards par mois en moyenne, en progrès', 0),
  ('80000000-0000-4000-a000-000000000324', '70000000-0000-4000-a000-000000000312', 'Gérer 6 tables en autonomie', 'Être pleinement autonome sur un rang.', 'completed', 100, '2025-06-30', 'Objectif atteint en mai', 1);

-- Thomas (eval-313)
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000325', '70000000-0000-4000-a000-000000000313', 'CA mensuel 175K€', 'Poursuivre la croissance.', 'completed', 100, '2025-06-30', 'CA moyen : 178K€', 0),
  ('80000000-0000-4000-a000-000000000326', '70000000-0000-4000-a000-000000000313', 'Signer 5 contrats entreprise', 'Développer l''offre plateaux repas.', 'completed', 100, '2025-06-30', '6 contrats signés', 1);


-- =============================================
-- Bordeaux employees — S2 2024 (restaurant opened mid-2024)
-- =============================================

-- Sakura Ito — S2 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000214', '30000000-0000-4000-a000-000000000014', '60000000-0000-4000-a000-000000000011', 'validated', 2, 3,
   'Sakura pose les bases du restaurant Bordeaux avec professionnalisme. Carte solide et organisation cuisine efficace malgré les contraintes de lancement.');

-- Lucas Faure — S2 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000215', '30000000-0000-4000-a000-000000000015', '60000000-0000-4000-a000-000000000011', 'validated', 1, 2,
   'Lucas découvre le métier. Les bases sont fragiles mais la motivation est là. Quelques retards à surveiller.');

-- Emma Lefèvre — S2 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000216', '30000000-0000-4000-a000-000000000016', '60000000-0000-4000-a000-000000000011', 'validated', 2, 2,
   'Emma structure bien le service en salle pour le lancement. Bonne organisation, doit développer la gestion d''équipe.');

-- Noah Garcia — S2 2024
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000217', '30000000-0000-4000-a000-000000000017', '60000000-0000-4000-a000-000000000011', 'validated', 1, 2,
   'Noah est en phase d''apprentissage. Service correct mais lent. Plusieurs retards à corriger.');

-- Bordeaux objectives S2 2024
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000401', '70000000-0000-4000-a000-000000000214', 'Créer la carte de lancement Bordeaux', 'Développer 20 références pour l''ouverture.', 'completed', 100, '2024-09-30', 'Carte prête avec 21 références', 0),
  ('80000000-0000-4000-a000-000000000402', '70000000-0000-4000-a000-000000000214', 'Recruter et former l''équipe cuisine', 'Recruter 1 commis et former l''équipe.', 'completed', 100, '2024-10-31', 'Lucas recruté et en formation', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000403', '70000000-0000-4000-a000-000000000215', 'Maîtriser la mise en place', 'Être autonome sur la mise en place du poste.', 'in_progress', 60, '2024-12-31', 'En progression, pas encore autonome', 0),
  ('80000000-0000-4000-a000-000000000404', '70000000-0000-4000-a000-000000000215', 'Apprendre les techniques de base', 'Découpe légumes, riz, assemblage maki simple.', 'in_progress', 40, '2024-12-31', '1 technique sur 3 validée', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000405', '70000000-0000-4000-a000-000000000216', 'Organiser le service d''ouverture', 'Mettre en place le plan de salle et les procédures.', 'completed', 100, '2024-09-30', 'Service opérationnel dès l''ouverture', 0),
  ('80000000-0000-4000-a000-000000000406', '70000000-0000-4000-a000-000000000216', 'Score Google ≥ 4.0', 'Objectif de lancement : obtenir une bonne note dès le départ.', 'in_progress', 70, '2024-12-31', 'Note : 3.9, presque atteint', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000407', '70000000-0000-4000-a000-000000000217', 'Maîtriser la carte et les allergènes', 'Connaître les plats principaux et allergènes.', 'in_progress', 50, '2024-12-31', '10 plats sur 21 maîtrisés', 0),
  ('80000000-0000-4000-a000-000000000408', '70000000-0000-4000-a000-000000000217', 'Zéro retard', 'Être ponctuel à chaque service.', 'blocked', 20, '2024-12-31', '4 retards en 3 mois', 1);


-- =============================================
-- Bordeaux employees — S1 2025
-- =============================================

-- Sakura Ito — S1 2025 (progression: 2→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000314', '30000000-0000-4000-a000-000000000014', '60000000-0000-4000-a000-000000000012', 'validated', 3, 3,
   'Sakura excelle. Le restaurant Bordeaux est bien lancé. Sa carte est originale et le food cost maîtrisé. Fort potentiel régional.');

-- Lucas Faure — S1 2025 (progression: 1→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000315', '30000000-0000-4000-a000-000000000015', '60000000-0000-4000-a000-000000000012', 'validated', 2, 2,
   'Lucas progresse bien. Il est devenu autonome sur la mise en place et commence la découpe. Moins de retards.');

-- Emma Lefèvre — S1 2025 (progression: 2→2 perf, 2→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000316', '30000000-0000-4000-a000-000000000016', '60000000-0000-4000-a000-000000000012', 'validated', 2, 3,
   'Emma a bien structuré la salle. La note Google est en hausse et l''équipe est stable. Potentiel pour un rôle élargi.');

-- Noah Garcia — S1 2025 (progression: 1→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000317', '30000000-0000-4000-a000-000000000017', '60000000-0000-4000-a000-000000000012', 'validated', 2, 2,
   'Noah s''améliore. Le service est plus rapide et les retards diminuent. Il maîtrise mieux la carte.');

-- Bordeaux objectives S1 2025
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000409', '70000000-0000-4000-a000-000000000314', 'Optimiser la carte Bordeaux', 'Renouveler 30% de la carte avec des produits locaux.', 'completed', 100, '2025-04-30', '8 plats renouvelés avec des produits du Sud-Ouest', 0),
  ('80000000-0000-4000-a000-000000000410', '70000000-0000-4000-a000-000000000314', 'Food cost ≤ 30%', 'Maîtriser les coûts en phase de croissance.', 'completed', 100, '2025-06-30', 'Food cost à 29.5%', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000411', '70000000-0000-4000-a000-000000000315', 'Autonomie mise en place', 'Gérer la mise en place seul en 60 minutes.', 'completed', 100, '2025-04-30', 'Autonome depuis mars', 0),
  ('80000000-0000-4000-a000-000000000412', '70000000-0000-4000-a000-000000000315', 'Valider 2 techniques de découpe', 'Découpe légumes et assemblage maki.', 'completed', 100, '2025-06-30', 'Les 2 techniques validées', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000413', '70000000-0000-4000-a000-000000000316', 'Score Google 4.1/5', 'Améliorer la note de lancement.', 'completed', 100, '2025-06-30', 'Note : 4.1 atteinte', 0),
  ('80000000-0000-4000-a000-000000000414', '70000000-0000-4000-a000-000000000316', 'Former Noah aux allergènes', 'S''assurer que Noah maîtrise les allergènes.', 'completed', 100, '2025-05-31', 'Test réussi à 90%', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000415', '70000000-0000-4000-a000-000000000317', 'Maîtriser la carte complète', 'Connaître tous les plats et allergènes.', 'completed', 100, '2025-05-31', '19 plats sur 21 maîtrisés, suffisant', 0),
  ('80000000-0000-4000-a000-000000000416', '70000000-0000-4000-a000-000000000317', 'Réduire les retards', 'Maximum 1 retard par mois.', 'in_progress', 70, '2025-06-30', '2 retards par mois en moyenne, mieux', 1);

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


-- =============================================
-- Additional Evaluations — S2 2025 (missing employees)
-- =============================================

-- Léa Moreau — S2 2025 (3→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000002', '60000000-0000-4000-a000-000000000001', 'validated', 3, 3,
   'Léa confirme son excellent niveau. Elle gère la cuisine en autonomie et forme les commis efficacement. Promotion sous-chef validée.');

-- Yuki Sato — S2 2025 (2→2 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000007', '30000000-0000-4000-a000-000000000003', '60000000-0000-4000-a000-000000000001', 'validated', 2, 3,
   'Yuki est devenue fiable et créative. Ses présentations sont remarquées par les clients. Potentiel pour devenir second de cuisine.');

-- Théo Martin — S2 2025 (2→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000008', '30000000-0000-4000-a000-000000000004', '60000000-0000-4000-a000-000000000001', 'validated', 2, 2,
   'Théo maintient ses efforts d''assiduité. La technique progresse. Il est sur la bonne voie.');

-- Maxime Bernard — S2 2025 (2→2 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager, bilan_employee) VALUES
  ('70000000-0000-4000-a000-000000000009', '30000000-0000-4000-a000-000000000006', '60000000-0000-4000-a000-000000000001', 'validated', 2, 3,
   'Maxime est devenu le référent saké du restaurant. Son ticket moyen est en hausse constante. Prêt pour le poste de chef de rang.',
   'Je suis vraiment épanoui dans mon rôle. Le conseil saké est ce qui me motive le plus. J''aimerais aller au Japon pour approfondir.');

-- Inès Chevalier — S2 2025 (3→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000051', '30000000-0000-4000-a000-000000000007', '60000000-0000-4000-a000-000000000001', 'validated', 3, 3,
   'Inès est exemplaire. Son examen sommelier est en préparation. Elle est la référente formation de l''équipe salle.');

-- Jules Petit — S2 2025 (1→1 perf, 1→1 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000052', '30000000-0000-4000-a000-000000000010', '60000000-0000-4000-a000-000000000001', 'validated', 1, 1,
   'Jules n''a pas progressé malgré le plan d''amélioration. Un recadrage formel est en cours. Dernier semestre de sursis.');

-- Clara Roux — S2 2025 (3→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000053', '30000000-0000-4000-a000-000000000011', '60000000-0000-4000-a000-000000000001', 'validated', 3, 3,
   'Clara est devenue une vraie leader. La salle Lyon tourne parfaitement. Elle peut prétendre au poste d''adjointe.');

-- Amine Benali — S2 2025 (2→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000054', '30000000-0000-4000-a000-000000000012', '60000000-0000-4000-a000-000000000001', 'validated', 2, 2,
   'Amine est enfin régulier. Son service est bon et les retards sont rares. L''effort doit être maintenu.');

-- Sakura Ito — S2 2025 (3→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000055', '30000000-0000-4000-a000-000000000014', '60000000-0000-4000-a000-000000000001', 'validated', 3, 3,
   'Sakura a parfaitement installé le restaurant Bordeaux. La carte est reconnue et le food cost maîtrisé. Elle devrait piloter l''ouverture du prochain.');

-- Lucas Faure — S2 2025 (2→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000056', '30000000-0000-4000-a000-000000000015', '60000000-0000-4000-a000-000000000001', 'validated', 2, 2,
   'Lucas a bien progressé en technique. Il est autonome sur la mise en place et commence la découpe sashimi.');

-- Emma Lefèvre — S2 2025 (2→3 perf, 3→3 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000057', '30000000-0000-4000-a000-000000000016', '60000000-0000-4000-a000-000000000001', 'validated', 3, 3,
   'Emma a fait un excellent travail. La note Google Bordeaux est passée à 4.2. Elle gère l''équipe avec assurance.');

-- Noah Garcia — S2 2025 (2→2 perf, 2→2 pot)
INSERT INTO evaluations (id, employee_id, semester_id, validation_status, performance_rating, potential_rating, bilan_manager) VALUES
  ('70000000-0000-4000-a000-000000000058', '30000000-0000-4000-a000-000000000017', '60000000-0000-4000-a000-000000000001', 'validated', 2, 2,
   'Noah continue sa progression. Il maîtrise la carte et les retards sont en baisse. Service plus fluide.');

-- Objectives S2 2025 for new evals
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000501', '70000000-0000-4000-a000-000000000006', 'Gérer la cuisine en autonomie 50% du temps', 'Assurer le rôle de responsable cuisine une semaine sur deux.', 'completed', 100, '2025-12-31', 'Objectif dépassé : gère 60% des services seule', 0),
  ('80000000-0000-4000-a000-000000000502', '70000000-0000-4000-a000-000000000006', 'Réduire les pertes de 20%', 'Optimiser les processus pour réduire les pertes matière.', 'completed', 100, '2025-12-31', 'Pertes réduites de 22%', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000503', '70000000-0000-4000-a000-000000000007', 'Maîtriser 4 techniques de découpe', 'Julienne, brunoise, sashimi intermédiaire, tournage.', 'completed', 100, '2025-11-30', '4 techniques validées', 0),
  ('80000000-0000-4000-a000-000000000504', '70000000-0000-4000-a000-000000000007', 'Proposer 1 recette créative', 'Créer et faire valider une recette originale.', 'completed', 100, '2025-12-31', 'Maki yuzu-framboise ajouté à la carte', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000505', '70000000-0000-4000-a000-000000000008', 'Zéro absence injustifiée', 'Maintenir l''assiduité acquise.', 'completed', 100, '2025-12-31', 'Aucune absence injustifiée !', 0),
  ('80000000-0000-4000-a000-000000000506', '70000000-0000-4000-a000-000000000008', 'Maîtriser la découpe nigiri', 'Progresser vers la découpe nigiri.', 'in_progress', 60, '2025-12-31', 'Technique en cours d''acquisition', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000507', '70000000-0000-4000-a000-000000000009', 'Ticket moyen +10%', 'Poursuivre la progression en vente additionnelle.', 'completed', 100, '2025-12-31', 'Ticket moyen +11%, objectif dépassé', 0),
  ('80000000-0000-4000-a000-000000000508', '70000000-0000-4000-a000-000000000009', 'Former 1 serveur au conseil saké', 'Transmettre les bases du conseil saké à un collègue.', 'completed', 100, '2025-11-30', 'Inès formée aux accords saké', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000509', '70000000-0000-4000-a000-000000000051', 'Passer l''examen sommelier', 'Obtenir la certification sommelier.', 'completed', 100, '2025-11-30', 'Certification obtenue avec mention', 0),
  ('80000000-0000-4000-a000-000000000510', '70000000-0000-4000-a000-000000000051', 'Ticket moyen ≥ 45€', 'Maintenir le meilleur ticket moyen de l''équipe.', 'completed', 100, '2025-12-31', 'Ticket moyen : 47€', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000511', '70000000-0000-4000-a000-000000000052', 'Respecter le plan d''amélioration', 'Atteindre les 5 objectifs du plan.', 'in_progress', 40, '2025-12-31', 'Seulement 2 objectifs sur 5 atteints', 0);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000512', '70000000-0000-4000-a000-000000000053', 'Score Google Lyon 4.4/5', 'Continuer la progression.', 'completed', 100, '2025-12-31', 'Note : 4.4 atteinte en novembre', 0),
  ('80000000-0000-4000-a000-000000000513', '70000000-0000-4000-a000-000000000053', 'Former 2 serveurs juniors', 'Assurer l''intégration des nouveaux.', 'completed', 100, '2025-10-31', '2 serveurs formés et autonomes', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000514', '70000000-0000-4000-a000-000000000054', 'Ponctualité : max 1 retard/mois', 'Maintenir la progression.', 'completed', 100, '2025-12-31', '0-1 retard par mois, objectif atteint', 0),
  ('80000000-0000-4000-a000-000000000515', '70000000-0000-4000-a000-000000000054', 'Augmenter le ticket moyen de 5%', 'Développer la vente additionnelle.', 'in_progress', 70, '2025-12-31', 'Ticket moyen +3%', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000516', '70000000-0000-4000-a000-000000000055', 'Créer la carte d''hiver Bordeaux', 'Renouveler la carte avec des produits d''hiver du Sud-Ouest.', 'completed', 100, '2025-10-15', 'Carte d''hiver lancée, excellente réception', 0),
  ('80000000-0000-4000-a000-000000000517', '70000000-0000-4000-a000-000000000055', 'Food cost ≤ 29%', 'Optimiser les coûts en routine.', 'completed', 100, '2025-12-31', 'Food cost à 28.5%, excellent', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000518', '70000000-0000-4000-a000-000000000056', 'Découpe sashimi débutant', 'Valider la technique de découpe sashimi.', 'completed', 100, '2025-11-30', 'Technique validée', 0),
  ('80000000-0000-4000-a000-000000000519', '70000000-0000-4000-a000-000000000056', 'Autonomie complète mise en place', 'Gérer la mise en place en moins de 50 minutes.', 'completed', 100, '2025-12-31', 'Temps moyen : 48 minutes', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000520', '70000000-0000-4000-a000-000000000057', 'Score Google Bordeaux 4.2/5', 'Améliorer la note.', 'completed', 100, '2025-12-31', 'Note : 4.2 atteinte', 0),
  ('80000000-0000-4000-a000-000000000521', '70000000-0000-4000-a000-000000000057', 'Réduire le turnover salle', 'Fidéliser l''équipe sur le semestre.', 'completed', 100, '2025-12-31', '0 départ en 6 mois', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000522', '70000000-0000-4000-a000-000000000058', 'Maîtriser les allergènes à 100%', 'Test sans faute sur les allergènes.', 'completed', 100, '2025-10-31', 'Test à 100%', 0),
  ('80000000-0000-4000-a000-000000000523', '70000000-0000-4000-a000-000000000058', 'Ticket moyen +5%', 'Développer la vente additionnelle.', 'in_progress', 60, '2025-12-31', 'Ticket moyen +3%, en progression', 1);


-- =============================================
-- Additional Evaluations — S1 2026 (missing employees)
-- =============================================

-- Inès Chevalier — S1 2026
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000021', '30000000-0000-4000-a000-000000000007', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- Jules Petit — S1 2026
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000022', '30000000-0000-4000-a000-000000000010', '60000000-0000-4000-a000-000000000002', 'not_started');

-- Amine Benali — S1 2026
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000023', '30000000-0000-4000-a000-000000000012', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- Lucas Faure — S1 2026
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000024', '30000000-0000-4000-a000-000000000015', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- Emma Lefèvre — S1 2026
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000025', '30000000-0000-4000-a000-000000000016', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- Noah Garcia — S1 2026
INSERT INTO evaluations (id, employee_id, semester_id, validation_status) VALUES
  ('70000000-0000-4000-a000-000000000026', '30000000-0000-4000-a000-000000000017', '60000000-0000-4000-a000-000000000002', 'in_progress');

-- Objectives S1 2026 for new evals
INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000601', '70000000-0000-4000-a000-000000000021', 'Préparer l''examen sommelier niveau 2', 'Approfondir les connaissances en oenologie et sakés premium.', 'in_progress', 30, '2026-06-30', 'Formation commencée en février', 0),
  ('80000000-0000-4000-a000-000000000602', '70000000-0000-4000-a000-000000000021', 'Former 2 serveurs à la vente premium', 'Transmettre les techniques de vente haut de gamme.', 'in_progress', 40, '2026-06-30', '1 serveur en formation', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000603', '70000000-0000-4000-a000-000000000023', 'Maintenir la ponctualité', 'Maximum 1 retard sur le semestre.', 'in_progress', 60, '2026-06-30', '1 retard en 2 mois, en bonne voie', 0),
  ('80000000-0000-4000-a000-000000000604', '70000000-0000-4000-a000-000000000023', 'Ticket moyen +8%', 'Poursuivre la progression.', 'in_progress', 35, '2026-06-30', 'Ticket moyen +3% pour l''instant', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000605', '70000000-0000-4000-a000-000000000024', 'Maîtriser 3 techniques de découpe', 'Valider julienne, sashimi débutant et maki avancé.', 'in_progress', 40, '2026-06-30', '1 technique validée, 2 en cours', 0),
  ('80000000-0000-4000-a000-000000000606', '70000000-0000-4000-a000-000000000024', 'Obtenir le certificat HACCP', 'Suivre la formation hygiène.', 'not_started', 0, '2026-05-31', 'Formation prévue en avril', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000607', '70000000-0000-4000-a000-000000000025', 'Score Google Bordeaux 4.3/5', 'Continuer l''amélioration.', 'in_progress', 50, '2026-06-30', 'Note actuelle : 4.2', 0),
  ('80000000-0000-4000-a000-000000000608', '70000000-0000-4000-a000-000000000025', 'Créer le parcours d''intégration', 'Structurer l''onboarding pour les nouveaux serveurs.', 'in_progress', 60, '2026-04-30', 'Parcours en cours de rédaction', 1);

INSERT INTO objectives (id, evaluation_id, title, description, status, progress, deadline, comments, order_index) VALUES
  ('80000000-0000-4000-a000-000000000609', '70000000-0000-4000-a000-000000000026', 'Ticket moyen +10%', 'Développer la vente additionnelle.', 'in_progress', 25, '2026-06-30', 'Ticket moyen +2% pour l''instant', 0),
  ('80000000-0000-4000-a000-000000000610', '70000000-0000-4000-a000-000000000026', 'Réduire les retards à 0', 'Objectif ponctualité.', 'in_progress', 50, '2026-06-30', '1 retard en février', 1);

-- =============================================
-- Backfill company_id for evaluations & objectives
-- =============================================
UPDATE evaluations SET company_id = '00000000-0000-4000-b000-000000000001' WHERE company_id IS NULL;
UPDATE objectives SET company_id = '00000000-0000-4000-b000-000000000001' WHERE company_id IS NULL;

-- Restore NOT NULL constraints
ALTER TABLE evaluations ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE objectives ALTER COLUMN company_id SET NOT NULL;
