# Changelog

Toutes les modifications notables du projet Parvola (ex-Talent Review) sont documentées dans ce fichier.

---

## [1.13.0] — 2026-07-02

### Talent Review — Lot C : suivi RH (retardataires, relances, synthèse, audit)

Outillage de pilotage RH d'une campagne d'évaluation, pour une entreprise
d'une centaine de salariés. Domaine Talent Review **uniquement** — aucune
interaction avec les EPP.

#### Vue de suivi RH (`campaign-followup`)
- Nouveau `CampaignFollowUpView`, accessible via un bouton « Suivi RH » dans
  l'en-tête de la vue équipe d'une campagne (admin/RH/directeur/manager,
  données scopées par rôle). Campagne en brouillon exclue.
- **Tableau des retardataires** : salariés dont l'évaluation n'est pas
  validée (non démarrée / en cours / soumise), triés du plus en retard au
  plus avancé, avec bascule « retardataires seuls / tout le monde ».
- Bandeau d'échéance dépassée mis en évidence quand la date de clôture est
  passée. Compteurs par statut (réutilise `CampaignProgressSummary`).

#### Relances manuelles
- Bouton « Relancer » par retardataire : ouvre le client mail (`mailto:`)
  avec objet et corps pré-remplis (i18n) — **aucune infrastructure serveur
  d'envoi**. Désactivé si le salarié n'a pas d'e-mail.
- **Traçabilité** : `last_reminder_at` horodaté et `reminder_count`
  incrémenté côté serveur (migration 014), affichés dans la liste. L'écriture
  est gatée par `TALENT_REVIEW_CONFIG.reminderTrackingEnabled` (l'e-mail,
  lui, fonctionne sans la migration).

#### Export de synthèse
- `printCampaignSummary` (`excel.ts`) : synthèse imprimable/PDF d'avancement
  (salarié × statut × objectifs × progression × dernière relance).
  Volontairement **sans note 9-box** — la matrice garde sa propre vue.

#### Audit minimal de validation
- `validated_by` / `validated_at` stampés **côté serveur** (`auth.uid()`) à
  la transition vers `validated`, non forgeables (trigger migration 014).
  Backfill de `validated_at` pour les évaluations déjà validées.

#### Base de données
- **Migration `014_evaluation_followup_audit.sql`** (préparée, **non
  poussée**) : colonnes `last_reminder_at`, `reminder_count`, `validated_by`,
  `validated_at` + trigger (audit validation, compteur de relances,
  anti-forge). Le verrouillage post-validation existant (lecture seule)
  reste inchangé.

#### Fichiers
- Nouveaux : `CampaignFollowUpView.tsx`,
  `supabase/migrations/014_evaluation_followup_audit.sql`.
- Modifiés : `types/index.ts`, `database.types.ts`, `config.ts`
  (`TALENT_REVIEW_CONFIG`), `supabase-data.ts`, `SemesterContext.tsx`,
  `services/excel.ts`, `SemesterTeamView.tsx`, `App.tsx`, `semesters/index.ts`,
  `locales/{fr,en,es}.json`.

---

## [1.12.0] — 2026-07-02

### EPP — Lot B : historique salarié & échéances légales

Livraison du volet « historique » du domaine entretien professionnel
(roadmap §8bis.5 Lot 4), toujours sans contamination du domaine Talent
Review : l'historique a son **écran dédié**, pas un onglet dans la fiche
d'évaluation.

#### Écran « Historique EPP » (`professional-history`)
- Nouveau `ProfessionalEmployeeHistoryView` : chronologie des entretiens du
  salarié (toutes campagnes), avec date de tenue, statut (dont « Signé »
  dérivé de la double signature), date de signature et date de remise.
  Clic → ouverture de l'entretien.
- **Échéances légales calculées** (helpers du Lot 0 enfin branchés) :
  dernier entretien mené, prochain entretien théorique (périodicité 4 ans,
  ou 1re année après l'embauche si aucun entretien), état des lieux 8 ans.
  Les échéances dépassées sont signalées en rouge.
- Accès : bouton « Historique » sur chaque carte salarié de la vue équipe
  EPP (RH/manager/directeur — l'écran est inaccessible au rôle employé).
- Côté salarié : « Mes entretiens pro » affiche sa propre prochaine
  échéance théorique.

#### Date de tenue enfin capturée
- Champ « Entretien tenu le » (`conductedAt`) dans l'en-tête de la saisie —
  il n'était **jamais renseigné** jusqu'ici, rendant les échéances 4 ans
  incalculables. À la complétion, la date du jour est posée automatiquement
  si le champ est vide.

#### Date d'embauche (migration 013, préparée non poussée)
- **Migration `013_employee_hire_date.sql`** : colonne `employees.hire_date`
  (nullable) — ancre le 1er entretien (1 an) et l'état des lieux (8 ans).
- Champ « Date d'embauche » dans le formulaire employé, **masqué derrière
  `EMPLOYEE_CONFIG.hireDateEnabled`** (même pattern que la remise Lot A) :
  aucune écriture de la colonne tant que la migration n'est pas appliquée.
  L'UI affiche « date d'embauche non renseignée » et n'affiche pas
  d'échéance 8 ans en attendant.

#### Fichiers
- Nouveaux : `ProfessionalEmployeeHistoryView.tsx`,
  `supabase/migrations/013_employee_hire_date.sql`.
- Modifiés : `types/index.ts` (ViewType `professional-history`, `hireDate`),
  `database.types.ts`, `config.ts` (`EMPLOYEE_CONFIG`), `supabase-data.ts`,
  `EmployeeForm.tsx`, `ProfessionalInterviewView.tsx`,
  `ProfessionalTeamView.tsx`, `MyProfessionalInterviewsView.tsx`, `App.tsx`,
  `locales/{fr,en,es}.json`.

---

## [1.11.1] — 2026-07-02

### EPP — Lot A amendé suite à l'audit (preuve renforcée)

Corrections issues de l'audit du Lot A. La migration 012 est réécrite et
reste **préparée, non poussée**.

#### Migration 012 (réécrite)
- **P1-1 — Base du verrou** : le trigger considère un entretien verrouillé
  dès que `employee_signed_at` ET `manager_signed_at` sont présents (et non
  plus selon l'existence du snapshot). **Backfill** inclus : les EPP déjà
  doublement signés avant la migration reçoivent leur `signed_snapshot`
  (flag `backfilled: true`, `frozenAt` = date de la 2ᵉ signature).
- **P1-2 — Colonnes non forgeables** : `signed_snapshot`, `created_by`,
  `delivered_by` (et `created_at`) sont neutralisés en tête de trigger —
  toute valeur fournie par le client est écartée, à l'INSERT comme à
  l'UPDATE. Seuls les triggers écrivent ces colonnes.
- **P2 — Snapshot enrichi** : ajoute `employeeId` et `conductedAt` (builder
  SQL unique `build_professional_interview_snapshot`, partagé entre trigger
  et backfill).
- **P2 — Remise conditionnée et one-shot** : `delivered_at` ne peut être
  posé qu'après double signature, et ne peut plus être modifié ni effacé.
- **P2 — RPC salarié** : `sign_professional_interview_as_employee` refuse
  désormais de ré-écraser une signature existante
  (`employee_signed_at IS NULL`).

#### Frontend
- **P1-4 — Feature flag remise** : nouvelle option
  `deliveryTrackingEnabled: false` dans `PROFESSIONAL_INTERVIEW_CONFIG` —
  l'action « Marquer comme remis » est masquée tant que la migration 012
  n'est pas appliquée (elle échouait systématiquement, colonnes absentes).
  À passer à `true` juste après le push de la migration (voir TODO.md).
- **P2 — Erreurs de verrouillage** : `handleSave`/`handleComplete` catchent
  et affichent un toast traduit (`professionalInterview.lockedError`) au
  lieu d'une rejection silencieuse.
- **P2 — Export durci** : les images de signature ne sont injectées que si
  elles matchent strictement `data:image/(png|jpe?g);base64,[A-Za-z0-9+/=]+`.
- Type `ProfessionalInterviewSnapshot` étendu (`employeeId`, `conductedAt`,
  `backfilled`).

---

## [1.11.0] — 2026-07-01

### EPP — Lot A : preuve, verrouillage & remise

Renforcement de l'entretien professionnel (EPP) comme **preuve opposable**,
sans toucher au domaine Talent Review (séparation stricte conservée).

#### Verrouillage post-signature
- Dès la **double signature** (salarié + manager/RH), l'entretien devient
  **non modifiable**, indépendamment du statut de la campagne.
- Appliqué à trois niveaux : **UI** (`isReadOnly`), **service/contexte**
  (garde dans `updateProfessionalInterview` qui rejette toute modification de
  contenu d'un entretien verrouillé), et **base de données** (trigger de la
  migration 012). Helper `isProfessionalInterviewLocked` (`helpers.ts`).

#### Snapshot final immuable
- Copie JSONB du contenu final **figée côté serveur au moment de la 2ᵉ
  signature** (`signed_snapshot`, migration 012). Type
  `ProfessionalInterviewSnapshot`.
- Le compte-rendu s'appuie sur ce snapshot (helper
  `getProfessionalInterviewFinalContent`), avec repli sur les champs vivants
  tant que le snapshot n'existe pas (avant application de la migration).

#### Remise au salarié (traçable séparément de la signature)
- Champs `delivered_at` / `delivered_by` ; action `deliverProfessionalInterview`
  et service `markProfessionalInterviewDelivered`. `delivered_by` est stampé
  serveur (`auth.uid()`). Bouton « Marquer comme remis » (RH/manager),
  disponible une fois l'entretien signé ; date de remise affichée ensuite.

#### Compte-rendu EPP dédié
- Nouveau service `professional-interview-export.ts` (impression/PDF via
  fenêtre navigateur), **totalement distinct** de l'export des évaluations
  (`excel.ts`). **Aucun rating, aucune 9-box, aucun vocabulaire de
  performance.** Contient les sections EPP, les signatures (image + nom +
  date) et la date de remise. Bouton « Imprimer / PDF » côté manager et
  salarié.

#### Audit minimal
- `created_by` / `updated_by` stampés côté serveur via triggers (jamais
  renseignés par le frontend). `*_signed_at` déjà présents.

#### Base de données
- **Migration `012_epp_proof_and_audit.sql`** : colonnes `signed_snapshot`,
  `delivered_at`, `delivered_by`, `created_by`, `updated_by` + triggers
  (audit à l'INSERT, verrouillage + gel du snapshot + audit à l'UPDATE).
  **Préparée mais non poussée** — application manuelle après validation.

#### Fichiers
- Nouveaux : `src/services/professional-interview-export.ts`,
  `supabase/migrations/012_epp_proof_and_audit.sql`.
- Modifiés : `src/types/index.ts`, `src/lib/database.types.ts`,
  `src/utils/helpers.ts`, `src/services/supabase-data.ts`,
  `src/context/ProfessionalInterviewContext.tsx`,
  `src/components/professional-interviews/ProfessionalInterviewView.tsx`,
  `src/locales/{fr,en,es}.json`.

---

## [1.10.0] — 2026-07-01

### EPP — Correction réglementaire : cadre 4 ans / 8 ans

Mise en conformité du domaine **entretien professionnel (EPP)** avec le
cadre légal applicable **depuis le 31 décembre 2025**, qui remplace l'ancien
rythme **biennal avec bilan à 6 ans** :

- **premier entretien dans la première année** suivant l'embauche ;
- **périodicité de 4 ans** entre deux entretiens professionnels ;
- **état des lieux récapitulatif tous les 8 ans** ;
- entretien à **proposer au retour d'absences longues** (congés
  maternité/parental/proche aidant, sabbatique, arrêt maladie prolongé,
  mandat…).

#### Code
- Nouvelle source de vérité unique `PROFESSIONAL_INTERVIEW_CONFIG`
  (`src/constants/config.ts`) : `firstInterviewWithinYears: 1`,
  `periodicityYears: 4`, `stateOfPlayYears: 8`.
- Helpers `getNextProfessionalInterviewDueDate` et
  `getNextProfessionalStateOfPlayDueDate` (`src/utils/helpers.ts`) pour
  calculer les échéances théoriques (consommés par le futur Lot historique).
- Commentaire de cadrage sur les types EPP (`src/types/index.ts`).

#### Base de données
- **Migration `011_epp_framework_4_8_years.sql`** (documentation seule :
  `COMMENT ON` tables/colonnes/index, aucune modification de structure ni de
  RLS). **Préparée mais non poussée** — application manuelle après validation
  explicite.
- Correction des commentaires obsolètes (« biennial » / « 6-year ») dans
  `008_professional_interviews.sql`, avec renvoi vers la migration 011.

#### Documentation
- `DECISIONS.md` (§8bis), `docs/ARCHITECTURE.md` : plus aucune mention de
  biennal / 6 ans pour l'EPP ; tableau des migrations complété (009 → 011).

Aucune fusion entre EPP et évaluations de performance : le domaine reste
séparé (types, tables, contexte, écrans, workflow).

---

## [1.9.0] — 2026-06-15

### Signatures manuscrites — entretiens pro & évaluations annuelles

Ajout de la signature **manuscrite** (tracé souris/tactile) avec nom du
signataire, pour le manager et le salarié, sur les entretiens
professionnels **et** les évaluations annuelles.

- **`SignaturePad`** (`components/common`) : `<canvas>` natif (Pointer
  Events, souris + tactile), capture du nom, export PNG (data URL),
  affichage en lecture seule une fois signé. Aucune dépendance ajoutée.
- **Migration `010`** : colonnes `*_signature` / `*_signature_name` sur
  `professional_interviews` et `evaluations` (+ `*_signed_at` sur
  `evaluations`, qui n'en avait pas).
- **Sécurité** : les salariés n'ont que le droit `SELECT` sur ces tables.
  La signature côté salarié passe désormais par des fonctions RPC
  `SECURITY DEFINER` (`sign_*_as_employee`) qui n'écrivent **que** les
  colonnes de signature de **sa** ligne. Corrige au passage un bug latent
  où le bouton « Signer » côté salarié échouait silencieusement contre la
  RLS sur les entretiens pro.
- **Entretiens pro** : la section Signatures remplace le bouton « Signer »
  par le pad (saisie ou lecture seule selon l'état).
- **Évaluations** : nouveau bloc Signatures visible dès l'état *soumise*.
  Le manager signe tant que l'éval n'est pas verrouillée (`validated`),
  le salarié peut signer même après validation (via RPC).
- Traductions FR / EN / ES.

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

> ℹ️ **Note (2026-07-01)** : la périodicité indiquée dans cette entrée
> historique (biennal / bilan 6 ans) est **obsolète**. Cadre corrigé en
> 1.10.0 : premier entretien à 1 an, périodicité 4 ans, état des lieux 8 ans.

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
