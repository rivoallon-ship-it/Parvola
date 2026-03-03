import type { StorageData } from '@/types';

// ============================================
// Données de démonstration — Sushi Neko (chaîne de restaurants de sushi)
// ============================================

export const seedData: StorageData = {
  // ---------- Établissements ----------
  establishments: [
    {
      id: 'est-1',
      name: 'Sushi Neko — Paris Opéra',
      description: 'Restaurant flagship, 80 couverts, ouvert 7j/7',
    },
    {
      id: 'est-2',
      name: 'Sushi Neko — Lyon Part-Dieu',
      description: 'Restaurant centre commercial, 50 couverts',
    },
    {
      id: 'est-3',
      name: 'Sushi Neko — Bordeaux Chartrons',
      description: 'Nouveau restaurant, ouverture récente',
    },
  ],

  // ---------- Équipes ----------
  teams: [
    // Paris
    { id: 'team-1', establishmentId: 'est-1', name: 'Cuisine Paris', description: 'Équipe cuisine du restaurant Paris Opéra' },
    { id: 'team-2', establishmentId: 'est-1', name: 'Salle Paris', description: 'Équipe salle et service du restaurant Paris Opéra' },
    // Lyon
    { id: 'team-3', establishmentId: 'est-2', name: 'Cuisine Lyon', description: 'Équipe cuisine du restaurant Lyon Part-Dieu' },
    { id: 'team-4', establishmentId: 'est-2', name: 'Salle Lyon', description: 'Équipe salle et service du restaurant Lyon Part-Dieu' },
    // Bordeaux
    { id: 'team-5', establishmentId: 'est-3', name: 'Cuisine Bordeaux', description: 'Équipe cuisine du restaurant Bordeaux Chartrons' },
    { id: 'team-6', establishmentId: 'est-3', name: 'Salle Bordeaux', description: 'Équipe salle et service du restaurant Bordeaux Chartrons' },
  ],

  // ---------- Employés ----------
  employees: [
    // --- Paris Opéra - Cuisine ---
    { id: 'emp-1', name: 'Kenji Tanaka', position: 'Chef Sushi', photo: '👨🏻', establishmentId: 'est-1', teamId: 'team-1', salary: 38000, lateCount: 0, unjustifiedAbsences: 0, justifiedAbsences: 2 },
    { id: 'emp-2', name: 'Léa Moreau', position: 'Second de cuisine', photo: '👩🏻', establishmentId: 'est-1', teamId: 'team-1', salary: 30000, lateCount: 1, unjustifiedAbsences: 0, justifiedAbsences: 3 },
    { id: 'emp-3', name: 'Yuki Sato', position: 'Commis de cuisine', photo: '👱🏻‍♀️', establishmentId: 'est-1', teamId: 'team-1', salary: 22000, lateCount: 2, unjustifiedAbsences: 1, justifiedAbsences: 4 },
    { id: 'emp-4', name: 'Théo Martin', position: 'Commis de cuisine', photo: '👨🏻‍🦱', establishmentId: 'est-1', teamId: 'team-1', salary: 21500, lateCount: 5, unjustifiedAbsences: 2, justifiedAbsences: 1 },
    // --- Paris Opéra - Salle ---
    { id: 'emp-5', name: 'Camille Dubois', position: 'Responsable de salle', photo: '👩🏻‍🦰', establishmentId: 'est-1', teamId: 'team-2', salary: 28000, lateCount: 1, unjustifiedAbsences: 0, justifiedAbsences: 2 },
    { id: 'emp-6', name: 'Maxime Bernard', position: 'Serveur', photo: '👨🏻‍🦰', establishmentId: 'est-1', teamId: 'team-2', salary: 22000, lateCount: 3, unjustifiedAbsences: 1, justifiedAbsences: 3 },
    { id: 'emp-7', name: 'Inès Chevalier', position: 'Serveuse', photo: '👩🏾‍🦱', establishmentId: 'est-1', teamId: 'team-2', salary: 21500, lateCount: 0, unjustifiedAbsences: 0, justifiedAbsences: 5 },
    // --- Paris Opéra - Management ---
    { id: 'emp-8', name: 'Sophie Laurent', position: 'Directrice de restaurant', photo: '👱🏾‍♀️', establishmentId: 'est-1', salary: 48000, lateCount: 0, unjustifiedAbsences: 0, justifiedAbsences: 1 },

    // --- Lyon Part-Dieu - Cuisine ---
    { id: 'emp-9', name: 'Hiroshi Yamamoto', position: 'Chef Sushi', photo: '👨🏽', establishmentId: 'est-2', teamId: 'team-3', salary: 36000, lateCount: 1, unjustifiedAbsences: 0, justifiedAbsences: 2 },
    { id: 'emp-10', name: 'Jules Petit', position: 'Commis de cuisine', photo: '🧑🏻‍🦱', establishmentId: 'est-2', teamId: 'team-3', salary: 21000, lateCount: 4, unjustifiedAbsences: 3, justifiedAbsences: 2 },
    // --- Lyon Part-Dieu - Salle ---
    { id: 'emp-11', name: 'Clara Roux', position: 'Responsable de salle', photo: '👱🏻‍♀️', establishmentId: 'est-2', teamId: 'team-4', salary: 27000, lateCount: 0, unjustifiedAbsences: 0, justifiedAbsences: 3 },
    { id: 'emp-12', name: 'Amine Benali', position: 'Serveur', photo: '👨🏽', establishmentId: 'est-2', teamId: 'team-4', salary: 21500, lateCount: 6, unjustifiedAbsences: 2, justifiedAbsences: 1 },
    // --- Lyon Part-Dieu - Management ---
    { id: 'emp-13', name: 'Thomas Girard', position: 'Directeur de restaurant', photo: '👨🏻', establishmentId: 'est-2', salary: 45000, lateCount: 0, unjustifiedAbsences: 0, justifiedAbsences: 2 },

    // --- Bordeaux Chartrons - Cuisine ---
    { id: 'emp-14', name: 'Sakura Ito', position: 'Chef Sushi', photo: '👩🏻', establishmentId: 'est-3', teamId: 'team-5', salary: 37000, lateCount: 0, unjustifiedAbsences: 0, justifiedAbsences: 1 },
    { id: 'emp-15', name: 'Lucas Faure', position: 'Commis de cuisine', photo: '👨🏻‍🦱', establishmentId: 'est-3', teamId: 'team-5', salary: 21000, lateCount: 2, unjustifiedAbsences: 1, justifiedAbsences: 3 },
    // --- Bordeaux Chartrons - Salle ---
    { id: 'emp-16', name: 'Emma Lefèvre', position: 'Responsable de salle', photo: '👩🏻‍🦰', establishmentId: 'est-3', teamId: 'team-6', salary: 26000, lateCount: 1, unjustifiedAbsences: 0, justifiedAbsences: 2 },
    { id: 'emp-17', name: 'Noah Garcia', position: 'Serveur', photo: '👨🏻‍🦰', establishmentId: 'est-3', teamId: 'team-6', salary: 21500, lateCount: 3, unjustifiedAbsences: 1, justifiedAbsences: 4 },
  ],

  // ---------- Postes ----------
  positions: [
    { id: 'pos-1', name: 'Chef Sushi', description: 'Responsable de la préparation des sushis, sashimis et makis. Garant de la qualité et de la créativité de la carte.' },
    { id: 'pos-2', name: 'Second de cuisine', description: 'Assiste le chef, supervise les commis, gère les stocks et les commandes fournisseurs.' },
    { id: 'pos-3', name: 'Commis de cuisine', description: 'Préparation des ingrédients, mise en place, nettoyage. Apprend les techniques de découpe et de présentation.' },
    { id: 'pos-4', name: 'Responsable de salle', description: 'Gère l\'accueil, le service, la satisfaction client et l\'équipe de salle.' },
    { id: 'pos-5', name: 'Serveur', description: 'Accueil, prise de commande, service en salle, encaissement.' },
    { id: 'pos-6', name: 'Serveuse', description: 'Accueil, prise de commande, service en salle, encaissement.' },
    { id: 'pos-7', name: 'Directrice de restaurant', description: 'Pilote l\'activité du restaurant : P&L, RH, qualité, satisfaction client.' },
    { id: 'pos-8', name: 'Directeur de restaurant', description: 'Pilote l\'activité du restaurant : P&L, RH, qualité, satisfaction client.' },
  ],

  // ---------- Templates d'objectifs ----------
  templates: [
    // Chef Sushi
    { id: 'tmpl-1', positionId: 'pos-1', title: 'Créer 3 nouvelles recettes saisonnières', description: 'Développer 3 nouvelles recettes de makis/sushis utilisant des produits de saison, avec fiches techniques complètes et costing validé.', suggestedDeadlineDays: 90 },
    { id: 'tmpl-2', positionId: 'pos-1', title: 'Réduire le food cost de 2 points', description: 'Optimiser les achats, réduire le gaspillage et ajuster les portions pour atteindre un food cost cible de 28%.', suggestedDeadlineDays: 180 },
    { id: 'tmpl-3', positionId: 'pos-1', title: 'Former un commis à la découpe du poisson', description: 'Accompagner un commis dans l\'apprentissage des techniques de découpe (sashimi, nigiri), avec évaluation pratique en fin de formation.', suggestedDeadlineDays: 120 },
    // Second de cuisine
    { id: 'tmpl-4', positionId: 'pos-2', title: 'Mettre en place l\'inventaire hebdomadaire', description: 'Instaurer un inventaire hebdomadaire systématique avec fichier de suivi, écarts analysés et plan d\'action correctif.', suggestedDeadlineDays: 60 },
    { id: 'tmpl-5', positionId: 'pos-2', title: 'Réduire les pertes matière de 15%', description: 'Identifier les principales sources de pertes, mettre en place des actions correctives et suivre l\'évolution mensuelle.', suggestedDeadlineDays: 120 },
    // Commis de cuisine
    { id: 'tmpl-6', positionId: 'pos-3', title: 'Maîtriser 5 techniques de découpe', description: 'Apprendre et maîtriser les techniques : julienne, brunoise, découpe sashimi, découpe maki, tournage de légumes.', suggestedDeadlineDays: 90 },
    { id: 'tmpl-7', positionId: 'pos-3', title: 'Obtenir le certificat HACCP', description: 'Suivre la formation hygiène alimentaire HACCP et obtenir la certification.', suggestedDeadlineDays: 60 },
    // Responsable de salle
    { id: 'tmpl-8', positionId: 'pos-4', title: 'Atteindre un score Google de 4.5/5', description: 'Améliorer la satisfaction client mesurée par les avis Google : accueil, rapidité, qualité de service.', suggestedDeadlineDays: 180 },
    { id: 'tmpl-9', positionId: 'pos-4', title: 'Réduire le turnover salle de 20%', description: 'Améliorer la rétention de l\'équipe par un meilleur onboarding, des entretiens réguliers et un planning équilibré.', suggestedDeadlineDays: 180 },
    // Serveur
    { id: 'tmpl-10', positionId: 'pos-5', title: 'Maîtriser la carte et les allergènes', description: 'Connaître l\'intégralité de la carte (ingrédients, techniques, allergènes) pour conseiller les clients en toute autonomie.', suggestedDeadlineDays: 30 },
    { id: 'tmpl-11', positionId: 'pos-5', title: 'Augmenter le ticket moyen de 10%', description: 'Développer les techniques de vente additionnelle : suggestion de boissons, desserts, formules premium.', suggestedDeadlineDays: 90 },
    // Directeur/Directrice
    { id: 'tmpl-12', positionId: 'pos-7', title: 'Atteindre le CA mensuel cible', description: 'Piloter l\'activité pour atteindre l\'objectif de chiffre d\'affaires mensuel défini par la direction.', suggestedDeadlineDays: 180 },
    { id: 'tmpl-13', positionId: 'pos-7', title: 'Déployer le nouveau programme de fidélité', description: 'Lancer le programme de fidélité dans le restaurant : formation équipe, communication client, suivi des inscriptions.', suggestedDeadlineDays: 90 },
    { id: 'tmpl-14', positionId: 'pos-8', title: 'Atteindre le CA mensuel cible', description: 'Piloter l\'activité pour atteindre l\'objectif de chiffre d\'affaires mensuel défini par la direction.', suggestedDeadlineDays: 180 },
  ],

  // ---------- Semestres (campagnes) ----------
  semesters: [
    {
      id: 'sem-1',
      year: 2025,
      semester: 'S2',
      name: 'S2 2025',
      status: 'closed',
      closingDeadline: '2025-12-31',
    },
    {
      id: 'sem-2',
      year: 2026,
      semester: 'S1',
      name: 'S1 2026',
      status: 'active',
      closingDeadline: '2026-06-30',
    },
    {
      id: 'sem-3',
      year: 2026,
      semester: 'S2',
      name: 'S2 2026',
      status: 'draft',
      closingDeadline: '2026-12-31',
    },
  ],

  // ---------- Évaluations ----------
  evaluations: [
    // ====== S2 2025 (clôturée) — Toutes validées ======

    // Kenji Tanaka — Chef Sushi Paris (validé)
    {
      id: 'eval-1',
      employeeId: 'emp-1',
      semesterId: 'sem-1',
      validationStatus: 'validated',
      performanceRating: 3,
      potentialRating: 2,
      bilanManager: 'Kenji a été excellent ce semestre. Sa créativité sur la carte d\'automne a boosté le CA de 12%. Il doit maintenant davantage déléguer aux commis.',
      bilanEmployee: 'Je suis satisfait de mon travail sur les nouvelles recettes. J\'aimerais participer à un stage au Japon pour me perfectionner.',
      objectives: [
        { id: 'obj-1', title: 'Lancer la carte d\'automne', description: 'Créer 5 nouvelles recettes saisonnières avec des produits d\'automne (courge, champignons, châtaigne).', status: 'completed', progress: 100, deadline: '2025-10-15', comments: 'Carte lancée le 1er octobre, très bon retour client', evaluation: '' },
        { id: 'obj-2', title: 'Réduire le food cost à 29%', description: 'Optimiser les commandes et réduire le gaspillage pour passer de 31% à 29% de food cost.', status: 'completed', progress: 100, deadline: '2025-12-31', comments: 'Objectif atteint : 28.7% en décembre', evaluation: '' },
        { id: 'obj-3', title: 'Former Yuki à la découpe sashimi', description: 'Accompagner Yuki dans la maîtrise de la découpe sashimi niveau intermédiaire.', status: 'completed', progress: 100, deadline: '2025-11-30', comments: 'Yuki est autonome sur la découpe sashimi depuis novembre', evaluation: '' },
      ],
    },

    // Sophie Laurent — Directrice Paris (validé)
    {
      id: 'eval-2',
      employeeId: 'emp-8',
      semesterId: 'sem-1',
      validationStatus: 'validated',
      performanceRating: 3,
      potentialRating: 3,
      bilanManager: 'Sophie pilote le restaurant avec brio. Le CA a progressé de 15% et la note Google est passée à 4.6. Potentiel pour un rôle régional.',
      objectives: [
        { id: 'obj-4', title: 'Atteindre 320K€ de CA mensuel', description: 'Piloter l\'activité pour atteindre un CA moyen de 320K€/mois sur le semestre.', status: 'completed', progress: 100, deadline: '2025-12-31', comments: 'CA moyen S2 : 335K€/mois', evaluation: '' },
        { id: 'obj-5', title: 'Lancer le programme fidélité', description: 'Déployer le programme de fidélité Sushi Neko Rewards dans le restaurant Paris Opéra.', status: 'completed', progress: 100, deadline: '2025-10-31', comments: '1200 inscrits au programme en 2 mois', evaluation: '' },
      ],
    },

    // Camille Dubois — Resp salle Paris (validé)
    {
      id: 'eval-3',
      employeeId: 'emp-5',
      semesterId: 'sem-1',
      validationStatus: 'validated',
      performanceRating: 2,
      potentialRating: 3,
      bilanManager: 'Camille a amélioré la satisfaction client mais doit encore progresser sur la gestion des conflits en équipe.',
      objectives: [
        { id: 'obj-6', title: 'Score Google 4.5/5', description: 'Porter la note Google du restaurant à 4.5 minimum.', status: 'completed', progress: 100, deadline: '2025-12-31', comments: 'Note atteinte : 4.6/5', evaluation: '' },
        { id: 'obj-7', title: 'Former les nouveaux serveurs', description: 'Mettre en place un parcours d\'intégration structuré pour les nouveaux serveurs (3 jours).', status: 'in_progress', progress: 70, deadline: '2025-12-31', comments: 'Parcours créé, pas encore testé sur tous les profils', evaluation: '' },
      ],
    },

    // Hiroshi Yamamoto — Chef Lyon (validé)
    {
      id: 'eval-4',
      employeeId: 'emp-9',
      semesterId: 'sem-1',
      validationStatus: 'validated',
      performanceRating: 2,
      potentialRating: 2,
      bilanManager: 'Hiroshi fait un travail régulier et fiable. La qualité est constante. Il pourrait prendre plus d\'initiatives sur la carte.',
      objectives: [
        { id: 'obj-8', title: 'Maintenir la qualité constante', description: 'Zéro retour négatif sur la qualité des plats pendant le semestre.', status: 'completed', progress: 100, deadline: '2025-12-31', comments: '2 retours mineurs en 6 mois, très bon résultat', evaluation: '' },
        { id: 'obj-9', title: 'Proposer 2 recettes hiver', description: 'Créer 2 nouvelles recettes pour la carte d\'hiver.', status: 'completed', progress: 100, deadline: '2025-11-15', comments: 'Maki foie gras et chirashi truffe ajoutés à la carte', evaluation: '' },
      ],
    },

    // Thomas Girard — Directeur Lyon (validé)
    {
      id: 'eval-5',
      employeeId: 'emp-13',
      semesterId: 'sem-1',
      validationStatus: 'validated',
      performanceRating: 2,
      potentialRating: 2,
      bilanManager: 'Thomas gère bien le quotidien. Le restaurant est rentable et l\'équipe stable. Marge de progression sur le développement commercial.',
      objectives: [
        { id: 'obj-10', title: 'Atteindre 180K€ de CA mensuel', description: 'Piloter l\'activité pour atteindre un CA moyen de 180K€/mois.', status: 'in_progress', progress: 85, deadline: '2025-12-31', comments: 'CA moyen : 172K€. Proche de l\'objectif.', evaluation: '' },
      ],
    },

    // ====== S1 2026 (active) — Statuts variés ======

    // Kenji Tanaka — En cours
    {
      id: 'eval-10',
      employeeId: 'emp-1',
      semesterId: 'sem-2',
      validationStatus: 'in_progress',
      objectives: [
        { id: 'obj-20', title: 'Lancer la carte printemps-été', description: 'Créer 4 nouvelles recettes avec des produits de saison (fleur de cerisier, mangue, concombre).', status: 'in_progress', progress: 40, deadline: '2026-04-01', comments: '2 recettes finalisées, 2 en test', evaluation: '' },
        { id: 'obj-21', title: 'Réduire le food cost à 27%', description: 'Poursuivre l\'optimisation : négociation fournisseurs, réduction du gaspillage.', status: 'in_progress', progress: 30, deadline: '2026-06-30', comments: 'Actuellement à 28.5%', evaluation: '' },
        { id: 'obj-22', title: 'Former Théo aux sushis nigiri', description: 'Accompagner Théo Martin dans l\'apprentissage de la préparation des nigiri.', status: 'not_started', progress: 0, deadline: '2026-05-31', comments: '', evaluation: '' },
      ],
    },

    // Léa Moreau — Soumis (en attente validation)
    {
      id: 'eval-11',
      employeeId: 'emp-2',
      semesterId: 'sem-2',
      validationStatus: 'submitted',
      bilanManager: 'Léa a pris en main les inventaires avec rigueur. Elle est prête à remplacer le chef en son absence.',
      objectives: [
        { id: 'obj-23', title: 'Inventaire hebdomadaire systématique', description: 'Mettre en place un inventaire hebdomadaire avec suivi des écarts.', status: 'completed', progress: 100, deadline: '2026-03-31', comments: 'Inventaire en place depuis février, écarts < 2%', evaluation: '' },
        { id: 'obj-24', title: 'Réduire les pertes de 15%', description: 'Analyser les pertes par poste et mettre en place des actions correctives.', status: 'in_progress', progress: 65, deadline: '2026-06-30', comments: 'Pertes réduites de 10% pour l\'instant', evaluation: '' },
        { id: 'obj-25', title: 'Gérer 3 services en autonomie', description: 'Assurer le rôle de chef pendant 3 services complets sans supervision.', status: 'completed', progress: 100, deadline: '2026-05-31', comments: '4 services gérés avec succès', evaluation: '' },
      ],
    },

    // Yuki Sato — En cours
    {
      id: 'eval-12',
      employeeId: 'emp-3',
      semesterId: 'sem-2',
      validationStatus: 'in_progress',
      objectives: [
        { id: 'obj-26', title: 'Maîtriser 5 techniques de découpe', description: 'Julienne, brunoise, sashimi, maki, tournage légumes.', status: 'in_progress', progress: 60, deadline: '2026-06-30', comments: '3 techniques validées', evaluation: '' },
        { id: 'obj-27', title: 'Obtenir le certificat HACCP', description: 'Suivre la formation et passer l\'examen.', status: 'completed', progress: 100, deadline: '2026-03-31', comments: 'Certificat obtenu le 15 mars', evaluation: '' },
      ],
    },

    // Théo Martin — Non démarré
    {
      id: 'eval-13',
      employeeId: 'emp-4',
      semesterId: 'sem-2',
      validationStatus: 'not_started',
      objectives: [],
    },

    // Camille Dubois — En cours
    {
      id: 'eval-14',
      employeeId: 'emp-5',
      semesterId: 'sem-2',
      validationStatus: 'in_progress',
      objectives: [
        { id: 'obj-28', title: 'Maintenir le score Google ≥ 4.5', description: 'Garantir un niveau de service qui maintient la note Google au-dessus de 4.5.', status: 'in_progress', progress: 80, deadline: '2026-06-30', comments: 'Note actuelle : 4.6', evaluation: '' },
        { id: 'obj-29', title: 'Réduire le turnover salle de 20%', description: 'Améliorer l\'intégration et la fidélisation des serveurs.', status: 'in_progress', progress: 45, deadline: '2026-06-30', comments: '1 départ sur le semestre vs 3 au S2 2025', evaluation: '' },
      ],
    },

    // Maxime Bernard — Validé
    {
      id: 'eval-15',
      employeeId: 'emp-6',
      semesterId: 'sem-2',
      validationStatus: 'validated',
      performanceRating: 2,
      potentialRating: 2,
      bilanManager: 'Maxime est un serveur fiable et apprécié des clients. Bonne progression sur la vente additionnelle.',
      objectives: [
        { id: 'obj-30', title: 'Maîtriser la carte complète', description: 'Connaître tous les plats, ingrédients et allergènes pour conseiller les clients.', status: 'completed', progress: 100, deadline: '2026-02-28', comments: 'Test réussi à 95%', evaluation: '' },
        { id: 'obj-31', title: 'Augmenter le ticket moyen de 10%', description: 'Vente additionnelle : boissons, desserts, formules premium.', status: 'in_progress', progress: 70, deadline: '2026-06-30', comments: 'Ticket moyen +7% pour l\'instant', evaluation: '' },
      ],
    },

    // Sophie Laurent — En cours
    {
      id: 'eval-16',
      employeeId: 'emp-8',
      semesterId: 'sem-2',
      validationStatus: 'in_progress',
      objectives: [
        { id: 'obj-32', title: 'Atteindre 350K€ de CA mensuel', description: 'Croissance de 10% par rapport au S2 2025.', status: 'in_progress', progress: 55, deadline: '2026-06-30', comments: 'CA février : 340K€, en bonne voie', evaluation: '' },
        { id: 'obj-33', title: 'Ouvrir le service livraison', description: 'Lancer un service de livraison via Uber Eats et Deliveroo.', status: 'in_progress', progress: 30, deadline: '2026-04-30', comments: 'Contrats en cours de négociation', evaluation: '' },
        { id: 'obj-34', title: 'Réduire le turnover global de 25%', description: 'Mettre en place des actions de fidélisation : prime d\'assiduité, planning flexible, entretiens mensuels.', status: 'not_started', progress: 0, deadline: '2026-06-30', comments: '', evaluation: '' },
      ],
    },

    // Hiroshi Yamamoto — Soumis
    {
      id: 'eval-17',
      employeeId: 'emp-9',
      semesterId: 'sem-2',
      validationStatus: 'submitted',
      bilanManager: 'Hiroshi est plus proactif ce semestre. Belle initiative sur le menu bento. À encourager dans cette direction.',
      objectives: [
        { id: 'obj-35', title: 'Créer un menu bento du midi', description: 'Développer 4 formules bento pour le service du midi (cible : employés du centre commercial).', status: 'completed', progress: 100, deadline: '2026-03-15', comments: 'Menu lancé le 1er mars, très bien accueilli', evaluation: '' },
        { id: 'obj-36', title: 'Food cost ≤ 29%', description: 'Maintenir le food cost en dessous de 29%.', status: 'in_progress', progress: 75, deadline: '2026-06-30', comments: 'Actuellement à 29.2%, en amélioration', evaluation: '' },
      ],
    },

    // Clara Roux — En cours
    {
      id: 'eval-18',
      employeeId: 'emp-11',
      semesterId: 'sem-2',
      validationStatus: 'in_progress',
      objectives: [
        { id: 'obj-37', title: 'Score Google 4.3/5', description: 'Améliorer la note Google du restaurant Lyon (actuellement 4.1).', status: 'in_progress', progress: 50, deadline: '2026-06-30', comments: 'Note actuelle : 4.2', evaluation: '' },
      ],
    },

    // Sakura Ito — En cours (nouveau restaurant)
    {
      id: 'eval-19',
      employeeId: 'emp-14',
      semesterId: 'sem-2',
      validationStatus: 'in_progress',
      objectives: [
        { id: 'obj-38', title: 'Définir la carte d\'ouverture', description: 'Créer la carte complète du restaurant Bordeaux : 25 références minimum, fiches techniques, costing.', status: 'completed', progress: 100, deadline: '2026-02-15', comments: 'Carte validée avec 28 références', evaluation: '' },
        { id: 'obj-39', title: 'Former l\'équipe cuisine', description: 'Former Lucas et le futur second aux standards Sushi Neko.', status: 'in_progress', progress: 50, deadline: '2026-04-30', comments: 'Lucas en bonne progression, second pas encore recruté', evaluation: '' },
        { id: 'obj-40', title: 'Food cost d\'ouverture ≤ 32%', description: 'Maintenir un food cost acceptable pendant la phase de montée en puissance.', status: 'in_progress', progress: 40, deadline: '2026-06-30', comments: 'Actuellement à 33%, normal en phase de lancement', evaluation: '' },
      ],
    },

    // Thomas Girard — En cours
    {
      id: 'eval-20',
      employeeId: 'emp-13',
      semesterId: 'sem-2',
      validationStatus: 'in_progress',
      objectives: [
        { id: 'obj-41', title: 'Atteindre 200K€ de CA mensuel', description: 'Augmenter le CA de 15% par rapport au S2 2025.', status: 'in_progress', progress: 40, deadline: '2026-06-30', comments: 'CA février : 185K€', evaluation: '' },
        { id: 'obj-42', title: 'Déployer le programme fidélité', description: 'Lancer Sushi Neko Rewards au restaurant Lyon.', status: 'not_started', progress: 0, deadline: '2026-05-31', comments: '', evaluation: '' },
      ],
    },
  ],
};
