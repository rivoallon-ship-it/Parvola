# Changelog

Toutes les modifications notables du projet Parvola (ex-Talent Review) sont documentées dans ce fichier.

---

## [1.8.0] — 2026-06-11

### Entretien professionnel — Lots 2, 3 & 6 : interface complète (`00b2aa9`)

Livraison de toute la couche **UI** du domaine entretien professionnel,
posé en fondations au Lot 1 (1.6.0). Aucun changement backend : les
migrations, types, services et le `ProfessionalInterviewContext` étaient
déjà en place. Cette PR câble l'interface, la navigation, les permissions
et les traductions. Couvre les lots 2 (CRUD campagnes), 3 (saisie
entretien) et 6 (navigation/i18n/permissions) de la roadmap §8bis.5.

#### Lot 2 — CRUD campagnes pro
- `ProfessionalCampaignList` : campagnes regroupées par année, création via
  `ProfessionalCampaignForm`, cycle de vie `draft → active → closed`
  (publier / clôturer / supprimer) selon les permissions. Les managers et
  directeurs ne voient pas les brouillons.
- `ProfessionalCampaignCard` : badge de statut, barre de progression
  (`completedCount / totalEmployees`), dates planifiées et date de clôture.
- Toasts `professionalCampaignAdded` / `professionalCampaignDeleted`.

#### Lot 3 — Saisie entretien
- `ProfessionalTeamView` : liste des salariés du périmètre avec statut
  d'entretien (icônes terminé / en cours / non démarré). L'entretien est
  créé automatiquement (`addProfessionalInterview`) au premier clic du
  manager. Salariés désactivés tant que la campagne est en brouillon.
- `ProfessionalInterviewView` : formulaire en 6 sections — bilan du
  parcours, évolution & mobilité (select `none/internal/external/geographic`),
  formation, conclusions, commentaires paritaires, signatures. Le manager
  édite tout sauf le commentaire salarié ; le salarié n'édite que son
  commentaire. Lecture seule quand la campagne est clôturée. Signatures
  logiques via `signProfessionalInterview` une fois l'entretien `completed`.
- `MyProfessionalInterviewsView` : le salarié consulte ses propres
  entretiens (brouillons masqués) et les ouvre en lecture/commentaire.

#### Lot 6 — Navigation, permissions & i18n
- 4 nouvelles `ViewType` : `professional-campaigns`, `professional-team`,
  `professional-interview`, `my-professional-interviews`, câblées dans
  `NavigationContext` (états `viewingProfessionalCampaign` /
  `viewingProfessionalInterview` + setters) et le routeur `App.tsx`.
- `getNavItems` (permissions) : onglet **« Entretiens pro. »** pour
  admin/rh/directeur/manager, **« Mes entretiens pro. »** pour les employés.
- Entrée de navigation avec icône `Briefcase` dans `Navigation.tsx`.
- Traductions **FR / EN / ES** complètes pour toutes les clés
  `professionalCampaign.*` et `professionalInterview.*`.

#### Fichiers
- Nouveaux : `src/components/professional-interviews/{ProfessionalCampaignList,
  ProfessionalCampaignCard,ProfessionalCampaignForm,ProfessionalTeamView,
  ProfessionalInterviewView,MyProfessionalInterviewsView,index}.tsx`,
  `src/hooks/useProfessionalInterviews.ts`.
- Modifiés : `src/App.tsx`, `src/components/layout/Navigation.tsx`,
  `src/context/NavigationContext.tsx`, `src/hooks/index.ts`,
  `src/types/index.ts`, `src/utils/permissions.ts`,
  `src/locales/{fr,en,es}.json`.

#### Reste à faire (roadmap §8bis.5)
- Lot 4 : historique des entretiens sur la fiche employé.
- Lot 5 : agent IA de préparation d'entretien.

---

## [1.7.0] — 2026-06-08

### Renommage du projet : Talent Review → **Parvola**

Changement de marque de l'application. Le renommage a été propagé sur
toute la chaîne :

- **Dépôt GitHub** : remote migré vers `rivoallon-ship-it/Parvola`.
- **Vercel** : projet renommé, nouvelle URL de prod `https://parvola.vercel.app`.
- **`package.json`** : champ `name` mis à jour (commit `0cd270f`).
- **Dossier local** : `~/Desktop/TalentReview` → `~/Desktop/Parvola`.
- Le backend Supabase est inchangé (projet `nbtvwgsdnmorciniowxi`, org
  `ggcnhvocvhpamprxqncs`) — seuls le frontend et la marque changent.

#### CORS Edge Functions (`1414400`)

Ajout de la nouvelle origine de production `https://parvola.vercel.app`
à la liste `ALLOWED_ORIGINS` des 3 Edge Functions, sans retirer les
anciennes URL `talent-review-*.vercel.app` (rétro-compat) :

- `supabase/functions/ai-proxy/index.ts`
- `supabase/functions/invite-user/index.ts`
- `supabase/functions/signup-company/index.ts`

Les 3 fonctions ont été **redéployées** sur le projet `nbtvwgsdnmorciniowxi`.

### Outillage

- **CLI Supabase ajoutée en dev dependency** (`6bf2116`). Permet de
  déployer via `npx supabase` sans dépendre de Homebrew (absent de la
  machine). Voir `package.json`.

### Sécurité

- **Incident PAT Supabase #3** : un troisième Personal Access Token a été
  exposé en clair lors d'une manipulation terminal (un commentaire FR avec
  apostrophe a fait basculer zsh en mode `quote>`, court-circuitant le
  `read -rs`). Token révoqué. La procédure de déploiement documentée plus
  bas utilise désormais le pattern `read -rs` sans valeur inline.

---

## [1.6.0] — 2026-04-26

### Entretien professionnel — Lot 1 : fondations (`2593c74`)

Introduction du domaine **entretien professionnel** (dispositif RH français
biennal, distinct de l'entretien annuel d'évaluation). Architecture choisie :
domaine séparé (option B) — pas de fusion avec `Semester` / `Evaluation`.
Ce premier lot ne livre aucune UI : il pose les fondations (DB, types,
services, contexte React) pour les lots suivants (CRUD, saisie, historique, IA).

#### Base de données
- **Migration 008** : tables `professional_campaigns` et `professional_interviews`
  avec multi-tenancy (`company_id`), RLS scopée par rôle (RH = tout, manager =
  scope team, employé = soi), trigger `set_company_id`, index composite
  `(employee_id, conducted_at)` pour préparer le bilan 6 ans.
- 3 nouveaux enums : `professional_campaign_status`,
  `professional_interview_status`, `professional_mobility_wish`.
- Statuts entretien : `scheduled → in_progress → completed` (pas de
  soumission/validation hiérarchique — c'est un échange paritaire documenté).
- Fichier : `supabase/migrations/008_professional_interviews.sql`

#### Types
- Domaine : `ProfessionalCampaign`, `ProfessionalInterview`, `MobilityWish`,
  `ProfessionalCampaignStatus`, `ProfessionalInterviewStatus`,
  `NewProfessionalCampaignForm`, `ProfessionalInterviewContextType`.
- DB : `DbProfessionalCampaign`, `DbProfessionalInterview`.
- `StorageData` étendu pour inclure les deux nouvelles collections.
- Fichiers : `src/types/index.ts`, `src/lib/database.types.ts`

#### Services Supabase
- CRUD complet : `fetchProfessionalCampaigns`, `insertProfessionalCampaign`,
  `updateProfessionalCampaignDb`, `deleteProfessionalCampaignDb`,
  `fetchProfessionalInterviews`, `insertProfessionalInterview`,
  `updateProfessionalInterviewDb` (mise à jour partielle via column map),
  `deleteProfessionalInterviewDb`.
- `fetchAllData()` charge désormais les campagnes pro et entretiens en parallèle.
- Fichier : `src/services/supabase-data.ts`

#### Contexte React
- Nouveau `ProfessionalInterviewProvider` (reducer + 9 actions :
  add/update/delete/publish/close campagne, add/update/delete entretien,
  `signProfessionalInterview('employee' | 'manager')`).
- Hook `useProfessionalInterviewContext()` exporté depuis `src/context/index.ts`.
- Provider branché sous `TemplateProvider` dans `AppProvider`.
- Fichiers : `src/context/ProfessionalInterviewContext.tsx`,
  `src/context/AppProvider.tsx`, `src/context/index.ts`

#### Déploiement DB
- Migration appliquée sur le projet Supabase `nbtvwgsdnmorciniowxi`
  le 2026-05-13 (`supabase db push --linked --include-all`).
- État remote vérifié : `Local 008 / Remote 008`.

---

## [1.5.0] — 2025-03-23

### Security Hardening (`c860d23`)

Audit de sécurité complet et corrections appliquées sur l'ensemble de l'application.

#### CORS — Edge Functions
- Les 3 Edge Functions (`ai-proxy`, `invite-user`, `signup-company`) rejettent désormais les origines non autorisées avec un **HTTP 403** au lieu de tomber sur l'origine par défaut.
- Fichiers : `supabase/functions/*/index.ts`

#### XSS — Export HTML
- Ajout d'une fonction `escapeHtml()` dans `src/services/excel.ts` pour échapper toutes les données utilisateur (nom, poste, titres d'objectifs, descriptions, commentaires, bilans) avant injection dans le HTML d'export/impression.

#### Validation Import Excel
- Taille maximale : 5 Mo
- Extensions autorisées : `.xlsx`, `.xls`, `.csv`
- Nombre de lignes max : 5 000
- Sanitisation des formules : les caractères `= + - @` en début de cellule sont supprimés pour prévenir les attaques par injection CSV.
- Fichier : `src/services/excel.ts`

#### Headers de sécurité (Vercel)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(self), geolocation=()`
- Fichier : `vercel.json`

#### Sourcemaps
- Désactivés en production (`sourcemap: false` dans `vite.config.ts`) pour empêcher l'exposition du code source.

#### Boutons de démo
- Les boutons de connexion rapide (demo credentials) restent visibles pour faciliter les démonstrations.
- Fichier : `src/components/auth/LoginPage.tsx`

#### Base de données
- **Migration 007** : ajout de policies RLS `INSERT` et `DELETE` sur la table `companies` qui bloquent toute opération directe par les utilisateurs authentifiés. La création de company passe exclusivement par l'Edge Function `signup-company` (service_role).
- Fichier : `supabase/migrations/007_security_hardening.sql`

#### Données sensibles
- Le salaire (`employee.salary`) a été retiré du prompt envoyé à l'API Anthropic dans `generateInterviewGuide`.
- Les mots de passe en clair ont été supprimés des commentaires de `supabase/seed.sql`.

---

## [1.4.0] — 2025-03-23

### Prompts IA personnalisables par entreprise (`b929259`)

Les RH et admins peuvent désormais personnaliser le contexte envoyé à l'assistant IA lors de la génération d'objectifs et de templates.

#### Base de données
- **Migration 006** : ajout de la colonne `ai_prompts JSONB DEFAULT '{}'` sur la table `companies`.
- Fichier : `supabase/migrations/006_company_ai_prompts.sql`

#### Types
- Nouveau type `AiPrompts` avec champs optionnels `objectivesContext` et `templatesContext`.
- Ajout du champ `aiPrompts?: AiPrompts` à l'interface `Company`.
- Fichiers : `src/types/index.ts`, `src/lib/database.types.ts`

#### Services
- `fetchCompany` mappe désormais `ai_prompts` → `aiPrompts`.
- `updateCompany` accepte le champ `aiPrompts` et le convertit en `ai_prompts` pour la DB.
- `generateObjectives` et `generateTemplates` acceptent un paramètre optionnel `companyContext` injecté dans le prompt IA.
- Fichiers : `src/services/supabase-data.ts`, `src/services/ai.ts`

#### Hooks
- `useAIObjectives.generate()` et `useAITemplates.generate()` propagent le `companyContext` aux services IA.
- Fichier : `src/hooks/useAI.ts`

#### Composants
- `AIAssistant` et `TemplateAIAssistant` acceptent une nouvelle prop `companyContext`.
- `EvaluationView` et `TemplateList` récupèrent la company pour passer le contexte IA aux assistants.
- `PositionCard` reçoit `companyAiPrompts` et le transmet à `TemplateAIAssistant`.

#### Interface — Onglet IA dans Paramètres
- Nouvel onglet "Intelligence Artificielle" (icône Sparkles) dans `SettingsView`.
- 2 champs `TextArea` pour le contexte objectifs et le contexte templates.
- Bouton de sauvegarde avec feedback visuel.
- Fichier : `src/components/admin/SettingsView.tsx`

#### Traductions
- ~10 nouvelles clés dans `fr.json`, `en.json`, `es.json` (namespace `settings.ai*` + `aiPrompt.companyContext`).

---

## [1.3.0] — 2025-03-16

### Multi-tenancy, 5 rôles, IA, Signup, Toasts (`18ec255`)

Refonte majeure introduisant l'isolation par entreprise et un système de rôles complet.

#### Multi-tenancy
- Colonne `company_id` sur toutes les tables (profiles, employees, teams, establishments, semesters, evaluations, positions, objective_templates).
- Fonction SQL `get_user_company_id()` utilisée dans toutes les policies RLS.
- 9 tables avec RLS activé et scoped par `company_id`.

#### Système de 5 rôles
- Hiérarchie : `admin > rh > directeur > manager > employee`.
- Permissions granulaires par rôle (lecture, écriture, gestion des membres, accès aux paramètres).
- `directeur` : accès multi-établissements, lecture de toutes les évaluations de ses établissements.

#### Edge Functions
- **`signup-company`** : création d'un compte entreprise + admin (public, rate-limited par IP).
- **`invite-user`** : invitation d'un utilisateur par email avec rôle contrôlé (admin/RH uniquement).
- **`ai-proxy`** : proxy sécurisé vers l'API Anthropic avec whitelist de modèles, cap de tokens, validation des messages, rate limiting par utilisateur.

#### Fonctionnalités IA
- 6 fonctions IA : génération d'objectifs, de templates, analyse d'objectifs, guide d'entretien, nettoyage de dictée, revue d'évaluation.
- Modèles utilisés : Claude Sonnet 4 (objectifs, templates, analyse, revue) et Claude Haiku 4.5 (guide d'entretien, dictée).

#### Speech-to-text
- Intégration Web Speech API pour la dictée vocale dans les bilans.

#### Système de toasts
- `ToastProvider` avec notifications success/error/info/warning.
- Hook `useToast()` disponible dans toute l'application.

#### Association poste-rôle
- Les postes (`positions`) ont un champ `role` qui détermine le rôle par défaut des employés associés.

#### Invitation par email
- Les employés ont un champ `email` optionnel.
- Bouton "Inviter" dans le profil employé (admin/RH uniquement) via l'Edge Function `invite-user`.

---

## [1.2.0] — 2025-03-12

### i18n, vues par rôle, champs employé, guide d'entretien IA (`bce55d9`)

- Internationalisation complète (FR, EN, ES) via i18next.
- Vues adaptées par rôle (employee, manager, RH).
- Champs employé enrichis (retards, absences justifiées/injustifiées).
- Guide d'entretien généré par IA.

---

## [1.1.0] — 2025-03-10

### Configuration Git pour Vercel (`f9045c2`)

- Fix de l'auteur Git pour les déploiements Vercel.

---

## [1.0.0] — 2025-03-10

### Commit initial (`958f7bd`)

- Application Talent Review : gestion des évaluations semestrielles.
- Stack : React 18 + TypeScript + Vite + TailwindCSS + Supabase.
- Objectifs SMART, évaluations, templates, import/export Excel, impression PDF.
