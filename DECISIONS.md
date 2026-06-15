# Parvola — Documentation technique et fonctionnelle

> Anciennement **Talent Review**, renommé **Parvola** le 2026-06-08 (voir CHANGELOG 1.7.0). Le backend Supabase est inchangé.

Ce document recense l'architecture, les fonctionnalités et les choix techniques de l'application Parvola dans son état actuel.

---

## 1. Vue d'ensemble

**Parvola** est une application SaaS de gestion des revues de talents et d'entretiens d'évaluation, conçue pour la restauration et le retail multi-sites.

- **URL de production** : https://parvola.vercel.app
- **Dépôt** : https://github.com/rivoallon-ship-it/Parvola
- **Backend** : Supabase (PostgreSQL + Auth + Edge Functions + RLS)
- **Frontend** : React 18 SPA déployée sur Vercel
- **IA** : Anthropic Claude (Sonnet 4 + Haiku 4.5) via edge function proxy

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | sophie@sushineko.fr | password123 |
| Manager | kenji@sushineko.fr | password123 |
| Directeur | thomas@sushineko.fr | password123 |
| Employé | maxime@sushineko.fr | password123 |

---

## 2. Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.3 | Framework UI (SPA client-side) |
| TypeScript | 5.7 | Typage strict |
| Vite | 6 | Bundler & dev server |
| Tailwind CSS | 3.4 | Utility-first CSS |
| CVA (class-variance-authority) | 0.7 | Variants de composants (badges, boutons) |
| lucide-react | 0.469 | Icônes |
| i18next + react-i18next | 25.8 / 16.5 | Internationalisation FR/EN/ES |
| xlsx | 0.18 | Export Excel |
| Supabase JS | 2.98 | Client backend (auth, DB, fonctions) |

### Scripts npm

```bash
npm run dev        # Serveur de développement (Vite)
npm run build      # TypeScript check + Vite build
npm run preview    # Aperçu du build production
npm run lint       # ESLint strict
npm run type-check # Vérification types TS
```

---

## 3. Architecture

### 3.1 Structure du projet

```
src/
├── components/
│   ├── admin/         # SettingsView, MemberList, InviteModal
│   ├── auth/          # LoginPage, SignupPage
│   ├── common/        # Button, Card, Modal, Input, Select, Badge, ProgressBar,
│   │                    ConfirmDialog, DictationButton, EmptyState
│   ├── employees/     # EmployeeList, EmployeeCard, EmployeeForm
│   ├── evaluations/   # EvaluationView, ObjectiveCard, AIAssistant,
│   │                    AIReviewModal, InterviewGuideModal, MyEvaluationsView
│   ├── layout/        # Navigation, PageHeader, BackButton
│   ├── nine-box/      # NineBoxView, NineBoxGrid, NineBoxCell,
│   │                    NineBoxEmployeeChip, NineBoxEmployeeModal
│   ├── organization/  # EstablishmentCard/Form, TeamCard/Form
│   ├── semesters/     # SemesterList, SemesterCard, SemesterForm,
│   │                    SemesterTeamView, CampaignProgressSummary
│   └── templates/     # TemplateList, PositionCard, TemplateCard,
│                        TemplateAIAssistant
├── constants/         # config.ts (IA, campagnes, 9-box), colors.ts (palette)
├── context/           # 5 contextes domaine + AppProvider
├── hooks/             # 12 hooks custom (useAI, useSpeechToText, etc.)
├── lib/               # supabase.ts, database.types.ts
├── locales/           # fr.json, en.json, es.json (~460 clés)
├── services/          # ai.ts, supabase-data.ts, excel.ts, signup.ts
├── types/             # index.ts (tous les types & interfaces)
└── utils/             # permissions.ts, helpers.ts, cn.ts

supabase/
├── migrations/        # 5 migrations SQL
├── functions/         # 3 edge functions (ai-proxy, invite-user, signup-company)
└── seed.sql           # Données de démonstration
```

### 3.2 State management — Context API + useReducer

6 contextes React domaine par domaine (pas de Redux) :

| Contexte | Responsabilité |
|----------|---------------|
| `UserContext` | Authentification, profil courant, rôle |
| `NavigationContext` | Vue courante, employé/semestre sélectionné, recherche |
| `EmployeeContext` | CRUD employés, import Excel |
| `OrganizationContext` | Établissements et équipes |
| `SemesterContext` | Campagnes (entretien annuel), évaluations, objectifs, workflow |
| `TemplateContext` | Postes et templates d'objectifs |
| `ProfessionalInterviewContext` | Campagnes biennales d'entretien professionnel et entretiens individuels (domaine séparé) |

Le composant `AppProvider` combine tous les contextes. Un hook `useApp()` fournit une API de compatibilité.

### 3.3 Navigation

Pas de routing URL (React Router). Navigation par état (`currentView`) dans le contexte.

**Vues disponibles** : `semesters` | `semester-team` | `team` | `templates` | `evaluation` | `nine-box` | `my-evaluations` | `settings`

---

## 4. Authentification et multi-tenancy

### 4.1 Auth

- **Supabase Auth** avec email/password
- **Signup** : edge function `signup-company` (crée l'utilisateur, la company, le profil)
- **Invitation** : edge function `invite-user` (crée l'utilisateur + profil, envoi d'email)
- **Rate limiting** : 5 signups/h par IP, 10 invitations/h par utilisateur

### 4.2 Multi-tenancy

Chaque table a une colonne `company_id`. Les Row Level Security (RLS) policies isolent complètement les données par entreprise via la fonction `get_user_company_id()`.

---

## 5. Système de rôles (5 niveaux)

### 5.1 Hiérarchie

```
admin > rh > directeur > manager > employee
```

| Rôle | Description | Scope |
|------|------------|-------|
| **Admin** | Propriétaire de l'entreprise (1 par company) | Accès total + invitation RH |
| **RH** | Ressources Humaines | Accès total (sauf invitation RH) |
| **Directeur** | Manager étendu multi-sites | Scope = ses établissements assignés |
| **Manager** | Responsable d'équipe | Scope = ses équipes assignées |
| **Employee** | Collaborateur | Lecture seule de ses propres évaluations |

### 5.2 Permissions (fichier central : `src/utils/permissions.ts`)

**Helpers de groupement** :
- `hasFullAccess(role)` → `admin` ou `rh`
- `isEvaluator(role)` → `admin`, `rh`, `directeur` ou `manager`

| Action | Rôles autorisés |
|--------|----------------|
| Créer/publier/clôturer une campagne | admin, rh |
| Gérer les employés et postes | admin, rh |
| Éditer une évaluation | admin, rh, directeur, manager |
| Soumettre une évaluation | directeur, manager |
| Valider une évaluation | admin, rh |
| Inviter des utilisateurs | admin (→ rh, directeur, manager, employee), rh (→ directeur, manager, employee) |
| Voir la 9-Box | admin, rh, directeur, manager |
| Voir ses évaluations | employee |

### 5.3 Scope des données

- **Admin/RH** : voient tous les employés de la company
- **Directeur** : voient les employés des établissements dans `user.establishmentIds`
- **Manager** : voient les employés de leurs équipes dans `user.teamIds`
- **Employee** : voient uniquement leurs propres évaluations

### 5.4 Implémentation côté DB

**Fonctions RLS helpers** (migration 004) :
- `get_user_role()` → rôle du profil courant
- `get_user_company_id()` → company du profil courant
- `get_user_establishment_ids()` → établissements assignés (directeur)
- `is_full_access_role()` → admin ou rh
- `is_evaluator_role()` → admin, rh, directeur ou manager

Toutes les tables (11) ont des policies RLS qui utilisent ces helpers.

---

## 6. Organisation hiérarchique

**Structure** : Établissement → Équipe → Employé

| Entité | Champs clés |
|--------|------------|
| Établissement | `id`, `name`, `description` |
| Équipe | `id`, `establishmentId`, `name`, `description` |
| Employé | `id`, `name`, `position`, `photo`, `email`, `establishmentId`, `teamId`, `salary`, `lateCount`, `unjustifiedAbsences`, `justifiedAbsences` |

- Les employés sans équipe sont autorisés (affichés sous "Sans équipe")
- Les employés sans établissement sont autorisés (section "Non assignés")
- Drag & drop d'affectation dans la vue employés

---

## 7. Postes et templates

### 7.1 Postes

Chaque poste définit un type de fonction dans l'entreprise. Un poste est associé à un **rôle** (niveau d'accès) qui sera utilisé lors de l'invitation d'un employé occupant ce poste.

| Champ | Type | Description |
|-------|------|------------|
| `name` | string | Nom du poste (ex: "Chef Sushi") |
| `description` | string | Description du poste |
| `role` | UserRole | Rôle associé (employee, manager, directeur, rh, admin) |

### 7.2 Templates d'objectifs

Modèles réutilisables d'objectifs rattachés à un poste. Contiennent un titre, une description, et une durée suggérée en jours.

### 7.3 Génération IA de templates

L'assistant IA (`TemplateAIAssistant`) génère 3-5 templates SMART pour un poste donné via Claude Sonnet 4.

---

## 8. Campagnes d'évaluation

### 8.1 Cycle de vie campagne

```
Brouillon (draft) → En cours (active) → Clôturée (closed)
```

- **Draft** : configuration, aucune évaluation visible aux managers
- **Active** : managers peuvent évaluer, date de clôture optionnelle
- **Closed** : tout en lecture seule

### 8.2 Cycle de vie évaluation

```
Non démarré → En cours → Soumis → Validé
```

| Transition | Déclencheur |
|-----------|------------|
| Non démarré → En cours | Automatique au 1er objectif ajouté |
| En cours → Soumis | Manager clique "Soumettre" (après revue IA) |
| Soumis → Validé | RH/Admin clique "Valider" |

### 8.3 Règles de verrouillage

| Condition | Résultat |
|-----------|----------|
| Campagne `draft` | Aucune évaluation créable/éditable |
| Campagne `active` + éval `in_progress` | Manager peut éditer + soumettre |
| Campagne `active` + éval `submitted` | Lecture seule. RH peut valider |
| Campagne `active` + éval `validated` | Lecture seule |
| Campagne `closed` | Tout en lecture seule |

---

## 8bis. Entretien professionnel (domaine séparé)

L'entretien professionnel est un dispositif RH français **distinct** de
l'entretien annuel d'évaluation : périodicité biennale, pas de notation,
centré sur le projet pro / la formation / l'évolution, avec un bilan
récapitulatif obligatoire à 6 ans.

### 8bis.1 Choix d'architecture

Domaine **totalement séparé** de `Semester` / `Evaluation` :

- Tables dédiées (`professional_campaigns`, `professional_interviews`),
  pas de discriminator sur les tables existantes.
- Contexte React dédié (`ProfessionalInterviewContext`).
- Statuts propres : `scheduled → in_progress → completed` (pas de
  soumission/validation hiérarchique).

**Raison** : pas de champs communs significatifs (pas d'objectifs, pas de
9-box, pas de rating), et workflow paritaire vs hiérarchique. Une fusion
aurait pollué tous les composants `Evaluation` avec des `if (type === …)`.

### 8bis.2 Cycle de vie campagne

```
Brouillon (draft) → En cours (active) → Clôturée (closed)
```

Identique en surface aux campagnes d'évaluation, mais sans réutilisation
de code — la cohérence visuelle se fera côté UI (briques `Badge`, layout
partagés) et non côté domaine.

### 8bis.3 Champs d'un entretien

| Champ | Type | Cadre légal |
|-------|------|-------------|
| `careerReview` | TEXT | Bilan du parcours depuis le dernier entretien |
| `skillsAcquired` | TEXT | Compétences acquises / développées |
| `evolutionMobility` | enum (none, internal, external, geographic) | Souhait de mobilité |
| `evolutionNotes` | TEXT | Détail du projet professionnel |
| `trainingWishes` | TEXT | CPF, VAE, bilan de compétences |
| `conclusions` | TEXT | Engagements pris à l'issue de l'entretien |
| `employeeComment`, `managerComment` | TEXT | Commentaires paritaires |
| `employeeSignedAt`, `managerSignedAt` | TIMESTAMPTZ | Signatures logiques (preuve de tenue) |

### 8bis.4 Préparation du bilan 6 ans

L'index composite `(employee_id, conducted_at)` sur
`professional_interviews` permettra une lecture rétrospective rapide des
3 entretiens d'un même salarié sur 6 ans. Le bilan lui-même est différé
à un lot ultérieur.

### 8bis.5 Roadmap

| Lot | Contenu | Statut |
|-----|---------|--------|
| **1** | Fondations (DB, types, services, contexte) | **Livré (1.6.0)** |
| **2** | CRUD campagnes pro (création, liste, statuts) | **Livré (1.8.0)** |
| **3** | Saisie entretien (formulaire multi-sections) | **Livré (1.8.0)** |
| 4 | Historique sur fiche employé | À venir |
| 5 | Agent IA de préparation d'entretien | À venir |
| **6** | Navigation + i18n + permissions transverses | **Livré (1.8.0)** |
| **7** | Signatures manuscrites (pro + évaluations) | **Livré (1.9.0)** |

### 8bis.6 Signatures manuscrites (1.9.0)

- Composant `SignaturePad` réutilisable : `<canvas>` natif (Pointer Events,
  souris + tactile), nom du signataire, export PNG en data URL, lecture
  seule une fois signé. Pas de dépendance ajoutée.
- Stockage : colonnes `*_signature` (base64 PNG) + `*_signature_name` en
  base, plutôt que Supabase Storage — quelques Ko par signature, suffisant.
- **Sécurité** : les salariés n'ayant que `SELECT`, leur signature passe par
  des fonctions RPC `SECURITY DEFINER` (`sign_*_as_employee`) qui n'écrivent
  que les colonnes de signature de leur propre ligne. Managers/RH/directeurs
  signent via l'UPDATE direct déjà autorisé. Corrige un bug latent (bouton
  « Signer » salarié bloqué par la RLS sur les entretiens pro).
- Moment : entretien pro → à l'état `completed` (signatures déjà prévues) ;
  évaluation → dès l'état `submitted` (le manager signe avant le verrouillage
  `validated`, le salarié peut signer même après via RPC).

---

## 9. Invitation d'employés

### 9.1 Flux

1. RH/Admin crée un employé avec un email dans `EmployeeForm`
2. En mode édition, un bouton **"Envoyer l'invitation"** apparaît
3. Le rôle est déduit automatiquement du poste de l'employé (ex: poste "Chef Sushi" → rôle `manager`)
4. L'invitation appelle la edge function `invite-user` avec l'`employeeId`
5. Un compte Supabase Auth est créé et un email d'invitation envoyé
6. Le profil créé est automatiquement lié à l'employé via `employee_id`

### 9.2 États du bouton

- **Envoyer l'invitation** : email renseigné, pas encore invité
- **Invitation envoyée** : invitation réussie (session courante)
- **Déjà invité** : un profil est déjà lié à cet `employee_id`

---

## 10. Matrice 9-Box

### 10.1 Configuration

Grille 3×3 : Performance (axe X) × Potentiel (axe Y), chaque axe de 1 (Bas) à 3 (Haut).

| Potentiel ↑ | Perf 1 (Bas) | Perf 2 (Moyen) | Perf 3 (Haut) |
|-------------|-------------|---------------|---------------|
| 3 (Haut) | Enigme | Futur Leader | Star |
| 2 (Moyen) | Inconsistant | Pilier | Performer clé |
| 1 (Bas) | Risque | Sous-performer | Professionnel |

### 10.2 Fonctionnalités

- Saisie des ratings dans la fiche d'évaluation
- Drag & drop des employés non positionnés vers les cellules
- Filtres : semestre, établissement, équipe, poste
- Compteur positionné / total
- Clic sur un employé → modal avec détail de l'évaluation

---

## 11. Intelligence Artificielle (Claude)

Toutes les fonctionnalités IA passent par la edge function `ai-proxy` qui sécurise les appels vers l'API Anthropic.

### 11.1 Services IA

| Service | Modèle | Max tokens | Description |
|---------|--------|-----------|-------------|
| **Génération d'objectifs** | Claude Sonnet 4 | 1000 | Suggère 3-5 objectifs SMART pour un employé |
| **Génération de templates** | Claude Sonnet 4 | 1000 | Suggère 3-5 templates pour un poste |
| **Analyse d'objectif** | Claude Sonnet 4 | 1000 | Suggestions pour rendre un objectif plus SMART |
| **Guide d'entretien** | Claude Haiku 4.5 | 2000 | Points de discussion, questions ouvertes, bilan semestre |
| **Dictée vocale** | Claude Haiku 4.5 | 500 | Nettoyage du speech-to-text en français professionnel RH |
| **Revue pré-soumission** | Claude Sonnet 4 | 4000 | Conformité légale (droit du travail FR) |

### 11.2 Revue IA pré-soumission (détail)

Analyse automatique avant soumission d'une évaluation :
- **Corrections** : orthographe, grammaire (original → suggestion)
- **Suggestions** : rendre factuel, mesurable, objectif
- **Alertes légales** avec sévérité (info / warning / critical) :
  - Discrimination (Art. L1132-1 Code du travail)
  - Jugements de valeur sur la personne vs le travail
  - Formulations vagues ou exploitables
  - Objectifs irréalistes ou non mesurables
  - Sanctions déguisées
  - Atteinte à la dignité
- **Bloque la soumission** si des alertes critiques sont non résolues

### 11.3 Dictée vocale

Bouton `DictationButton` qui :
1. Active le micro via Web Speech API (`useSpeechToText`)
2. Transcrit en temps réel
3. Envoie à Claude Haiku pour nettoyage (grammaire, ponctuation, style RH professionnel)
4. Insère le texte nettoyé dans le champ

---

## 12. Internationalisation

- **Langues** : Français (défaut), Anglais, Espagnol
- **Détection** : automatique via `i18next-browser-languagedetector`
- **~460 clés** de traduction organisées par domaine
- **Prompts IA** : traduits (actuellement en français)
- **Sélecteur de langue** intégré dans la navigation

---

## 13. Export

- **Excel** : export des évaluations via la librairie `xlsx` (objectifs, bilans, commentaires, signatures)
- **PDF** : non implémenté

---

## 14. Base de données

### 14.1 Schéma (11 tables + auth)

```
companies
├── profiles (auth users)
├── establishments
│   └── teams
├── employees (email, position name)
├── positions (name, role)
│   └── objective_templates
└── semesters
    └── evaluations
        └── objectives
```

### 14.2 Migrations

| # | Fichier | Contenu |
|---|---------|---------|
| 001 | `001_initial_schema.sql` | Schéma initial : tables, enum `user_role`, RLS basique |
| 002 | `002_multi_tenant.sql` | Multi-tenancy : `company_id` sur toutes les tables, RLS par company |
| 003 | `003_roles_directeur_admin.sql` | Extension enum : ajout `admin` et `directeur` |
| 004 | `004_roles_policies_functions.sql` | `establishment_ids` sur profiles, helpers RLS, réécriture complète des policies pour 5 rôles |
| 005 | `005_position_role_employee_email.sql` | Colonne `role` sur positions, colonne `email` sur employees |
| 006 | `006_company_ai_prompts.sql` | Colonne `ai_prompts JSONB` sur companies |
| 007 | `007_security_hardening.sql` | Policies INSERT/DELETE sur companies (verrou Edge Function) |
| 008 | `008_professional_interviews.sql` | Domaine entretien professionnel : tables `professional_campaigns` et `professional_interviews`, enums dédiés, RLS multi-tenant scopée par rôle, index `(employee_id, conducted_at)` pour bilan 6 ans |

### 14.3 Edge Functions

| Fonction | Auth | Description |
|----------|------|-------------|
| `signup-company` | Non (publique) | Créer un compte entreprise + admin |
| `invite-user` | Oui (admin/rh) | Inviter un utilisateur dans l'entreprise |
| `ai-proxy` | Oui (JWT) | Proxy sécurisé vers l'API Anthropic Claude |

---

## 15. Déploiement

| Service | Plateforme |
|---------|-----------|
| Frontend | Vercel (`parvola.vercel.app`) |
| Backend | Supabase (projet `nbtvwgsdnmorciniowxi`) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Auth | Supabase Auth |
| Base de données | Supabase PostgreSQL |

### Commandes de déploiement

> ⚠️ **Sécurité tokens** : ne JAMAIS écrire `SUPABASE_ACCESS_TOKEN=sbp_...` en
> clair (historique shell + risque de partage). Exporter le token via `read -rs`
> qui n'affiche rien et ne laisse pas de trace. Le token doit provenir du compte
> propriétaire du projet (org `ggcnhvocvhpamprxqncs`). Voir docs/SECURITY.md.

```bash
# Exporter le token une fois par session (valeur masquee, hors historique)
read -rs SUPABASE_ACCESS_TOKEN
export SUPABASE_ACCESS_TOKEN

# Frontend
npm run build && npx vercel --prod

# Migrations
npx supabase db push --linked

# Edge Functions
npx supabase functions deploy ai-proxy --project-ref nbtvwgsdnmorciniowxi
npx supabase functions deploy invite-user --project-ref nbtvwgsdnmorciniowxi
npx supabase functions deploy signup-company --project-ref nbtvwgsdnmorciniowxi
```

---

## 16. Design system

### 16.1 Palette de couleurs (`constants/colors.ts`)

| Zone | Couleur | Hex |
|------|---------|-----|
| Navigation fond | Sombre | `#2C2C2C` |
| Navigation accent | Vert menthe | `#4AFFC3` |
| Accent app | Teal | `#008D7E` |
| Fond body | Crème | `#FAF7F2` |
| Card fond | Blanc | `#FFFFFF` |
| Card bordure | Gris clair | `#D7D6D3` |
| Bouton primaire | Sombre | `#2C2C2C` |
| Warning | Amber | `#F59E0B` |
| Danger | Rouge | `#EF4444` |
| Success | Vert émeraude | `#10B981` |
| Info | Bleu | `#3B82F6` |

### 16.2 Couleurs des rôles

| Rôle | Badge fond | Badge texte |
|------|-----------|------------|
| Admin | `#EDE9FE` (violet clair) | `#5B21B6` |
| RH | `#DBEAFE` (bleu clair) | `#1E40AF` |
| Directeur | `#CFFAFE` (cyan clair) | `#155E75` |
| Manager | `#FEF3C7` (amber clair) | `#92400E` |
| Employee | `#D1FAE5` (vert clair) | `#065F46` |

### 16.3 Composants UI maison (CVA pattern)

- `Button` : primary, secondary, accent, warning, danger (+ icon, loading, disabled)
- `Card` : avec bordure optionnelle colorée
- `Input` / `TextArea` / `Select` : avec label, erreur, variants
- `Modal` : overlay + contenu centré
- `StatusBadge` : objectif (4 statuts)
- `CampaignStatusBadge` : campagne (3 statuts)
- `EvaluationStatusBadge` : évaluation (4 statuts)
- `ProgressBar` : barre de progression avec %
- `ConfirmDialog` : dialogue de confirmation
- `DictationButton` : bouton micro avec indicateurs visuels
- `EmptyState` : état vide avec icône et message

---

## 17. Données de démonstration (seed)

L'entreprise de démo est **Sushi Neko**, chaîne de restaurants japonais.

### Établissements

| Établissement | Équipes |
|--------------|---------|
| Paris Opéra | Cuisine, Salle |
| Lyon Part-Dieu | Cuisine, Salle |
| Bordeaux Chartrons | Cuisine, Salle |

### Postes (8)

| Poste | Rôle associé |
|-------|-------------|
| Chef Sushi | Manager |
| Second de cuisine | Manager |
| Commis de cuisine | Employee |
| Responsable de salle | Manager |
| Serveur / Serveuse | Employee |
| Directrice de restaurant | Directeur |
| Directeur de restaurant | Directeur |

### Employés (17)

Répartis sur les 3 établissements avec salaires, compteurs d'assiduité et emails.

### Templates d'objectifs (14)

2-3 templates SMART par poste.

### Campagnes, évaluations et objectifs

2 semestres (S1 2025 actif, S2 2024 clôturé), 17 évaluations, ~34 objectifs avec progression et commentaires.

---

## 18. Fonctionnalités futures identifiées

| Fonctionnalité | Impact | Statut |
|----------------|--------|--------|
| Dashboard RH (vue macro, statistiques) | Fort | Non implémenté |
| Notifications (rappels deadlines) | Moyen | Non implémenté |
| Historique / audit trail | Moyen | Non implémenté |
| Gestion des compétences | Fort | Non implémenté |
| Plan de formation | Fort | Non implémenté |
| Export PDF | Moyen | Non implémenté |
| Bilan manager auto-généré (IA) | Fort | Non implémenté |
| Suggestion 9-Box (IA) | Fort | Non implémenté |
| Analyse de tendances (IA) | Fort | Non implémenté |
