# Talent Review — Décisions techniques et fonctionnelles

Ce document recense tous les choix architecturaux, fonctionnels et techniques faits au cours du développement de l'application Talent Review.

---

## 1. Stack technique

| Choix | Détail | Raison |
|-------|--------|--------|
| **React 18.3** | SPA client-side | Écosystème riche, équipe familière |
| **TypeScript 5.7** | Typage strict | Sécurité du code, autocomplétion, refactoring sûr |
| **Vite 6** | Bundler / dev server | Rapidité de build, HMR instantané, config minimale |
| **Tailwind CSS 3.4** | Utility-first CSS | Développement rapide, consistance visuelle, pas de CSS custom à maintenir |
| **class-variance-authority (CVA)** | Variants de composants | Pattern systématique pour les badges et boutons (StatusBadge, CampaignStatusBadge, etc.) |
| **lucide-react** | Icônes | Léger, tree-shakeable, cohérent visuellement |
| **i18next + react-i18next** | Internationalisation | Support FR/EN/ES, détection automatique de la langue navigateur |
| **xlsx** | Export Excel | Export des évaluations en format Excel pour impression/archivage |

---

## 2. Architecture applicative

### 2.1 State management — Context API + useReducer (pas Redux)

**Choix** : 5 contextes React domaine par domaine, pas de store global.

**Raison** : L'application n'a pas la complexité qui justifie Redux. Le pattern Context + useReducer est suffisant et évite une dépendance supplémentaire.

**Structure des contextes** :

| Contexte | Responsabilité |
|----------|---------------|
| `NavigationContext` | Vue courante, employé/semestre sélectionné, recherche |
| `EmployeeContext` | CRUD employés, import |
| `OrganizationContext` | Établissements et équipes |
| `SemesterContext` | Campagnes, évaluations, objectifs, workflow |
| `TemplateContext` | Postes et templates d'objectifs |

**Pourquoi 5 contextes plutôt qu'un seul** : Le contexte monolithique initial (`AppContext.tsx`) provoquait des re-renders inutiles. Chaque composant ne s'abonne qu'au(x) domaine(s) dont il a besoin. Le refactoring a été fait sans casser l'API existante grâce à un hook de compatibilité `useApp()`.

### 2.2 Communication inter-contextes

**Choix** : Callbacks props + refs dans `AppProvider.tsx`, pas d'event bus ni de store partagé.

**Raison** : Les dépendances entre contextes sont limitées (ex: `SemesterContext` a besoin de l'employé sélectionné pour `addObjectiveFromTemplate`). On les résout via des `getSelectedEmployee` passés en props au Provider, alimentés par des refs dans `AppProvider`.

### 2.3 Persistance — localStorage (mode local) / API REST (mode API)

**Choix** : Abstraction `StorageProvider` avec deux implémentations :
- `LocalStorageProvider` : tout en localStorage
- `ApiStorageProvider` : appels REST vers un backend

**Raison** : L'app doit fonctionner standalone (démo, POC) mais aussi s'intégrer dans une solution existante de planning/paie. Le mode est configurable via `VITE_STORAGE_MODE`.

### 2.4 Pas de routing (React Router)

**Choix** : Navigation par état (`currentView`) dans le contexte, pas de routes URL.

**Raison** : L'app est destinée à être intégrée comme module dans une solution existante (pas un site web autonome). Les URLs sont gérées par l'application hôte.

---

## 3. Workflow de validation multi-étapes

### 3.1 Cycle de vie Campagne

```
Brouillon (draft) → En cours (active) → Clôturée (closed)
```

**Choix et alternatives écartées** :

| Question | Choix retenu | Alternative écartée | Raison |
|----------|-------------|-------------------|--------|
| Nombre d'états campagne | 3 (draft/active/closed) | 5+ (avec planifiée, archivée) | Simplicité pour les clients restauration/retail, managers opérationnels |
| Dates | Une seule date de clôture par campagne | Dates de début/fin + jalons | Les managers retail ne consultent pas les deadlines complexes |
| Visibilité brouillon | Campagne brouillon invisible aux managers | Visible mais en lecture seule | Évite la confusion, les managers ne voient que ce qui les concerne |

### 3.2 Cycle de vie Évaluation

```
Non démarré (not_started) → En cours (in_progress) → Soumis (submitted) → Validé (validated)
```

**Choix et alternatives écartées** :

| Question | Choix retenu | Alternative écartée | Raison |
|----------|-------------|-------------------|--------|
| Auto-évaluation collaborateur | Non, le manager seul remplit | Double saisie manager + collaborateur | Trop complexe pour le contexte retail, les collaborateurs n'ont pas toujours accès à un poste |
| Renvoi RH → manager | Non, validation simple et définitive | Boucle de renvoi avec commentaires | Surcharge pour les RH, les retours se font verbalement dans ce contexte |
| Qui peut valider | Tout le monde (en attendant l'auth) | Restriction par rôle | L'authentification n'est pas encore implémentée, on sécurisera quand les rôles existeront |
| Transition automatique not_started → in_progress | Oui, dès l'ajout du 1er objectif | Manuelle | UX naturelle, évite un clic inutile |

### 3.3 Règles de verrouillage (lecture seule)

| Condition | Résultat |
|-----------|----------|
| Campagne `draft` | Aucune évaluation créable/éditable |
| Campagne `active` + éval `in_progress` | Manager peut éditer + soumettre |
| Campagne `active` + éval `submitted` | Lecture seule. RH peut valider |
| Campagne `active` + éval `validated` | Lecture seule |
| Campagne `closed` | Tout en lecture seule, quel que soit le statut éval |

**Implémentation** : fonction pure `isEvaluationReadOnly(campaignStatus, evalStatus)` dans `utils/helpers.ts`, utilisée par tous les composants.

### 3.4 Migration des données existantes

**Choix** : Migration automatique au chargement dans `AppProvider.tsx`.

- Semestres sans `status` → `'active'` (ils étaient déjà utilisés)
- Évaluations sans `validationStatus` → `'in_progress'` si elles ont des objectifs, sinon `'not_started'`
- Persistance immédiate pour ne migrer qu'une fois

**Raison** : Rétro-compatibilité totale, aucune perte de données pour les utilisateurs existants.

---

## 4. Organisation hiérarchique

**Choix** : Établissement → Équipe → Employé (3 niveaux).

| Question | Choix retenu | Raison |
|----------|-------------|--------|
| Structure | Établissement > Équipe > Employé | Correspond aux groupes de restauration multi-sites |
| Employés sans équipe | Autorisé (affichés sous "Sans équipe") | Flexibilité, tous les sites n'ont pas d'équipes formalisées |
| Employés sans établissement | Autorisé (section "Non assignés") | Import progressif possible |
| Drag & drop d'affectation | Oui, dans la vue employés | UX intuitive pour les RH |

---

## 5. Matrice 9-Box

**Choix** : Intégrée directement dans l'évaluation, pas dans un module séparé.

| Question | Choix retenu | Raison |
|----------|-------------|--------|
| Axes | Performance (1-3) × Potentiel (1-3) | Standard RH international |
| Labels | Bas / Moyen / Haut | Simplicité, compréhensible sans formation |
| Saisie | Dans la fiche d'évaluation de chaque employé | Le manager évalue en contexte, pas dans une grille abstraite |
| Visualisation | Vue dédiée "Matrice" avec placement automatique | Vue macro pour les RH |
| Couleurs des cellules | Rouge (risque), Amber (attention), Bleu (pilier), Vert (talent) | Code couleur intuitif |

---

## 6. Intelligence Artificielle

**Choix** : API Anthropic (Claude) via proxy, 3 services.

| Service | Fonction | Raison du choix |
|---------|----------|----------------|
| `generateObjectives` | Suggère des objectifs SMART pour un employé | Aide les managers opérationnels à rédiger |
| `generateTemplates` | Suggère des templates pour un poste | Accélère le setup initial |
| `analyzeObjective` | Analyse SMART d'un objectif existant | Coaching en temps réel |

**Choix d'architecture** :
- Appel via proxy (`/api/anthropic/v1/messages`) pour ne pas exposer la clé API côté client
- Modèle configurable via `VITE_ANTHROPIC_API_KEY` et `AI_CONFIG`
- Parsing tolérant (`parseAIResponse`) : extraction JSON même si l'IA ajoute du texte autour

---

## 7. Internationalisation (i18n)

**Choix** : 3 langues (FR/EN/ES), détection automatique.

| Question | Choix retenu | Raison |
|----------|-------------|--------|
| Langues | Français, Anglais, Espagnol | Clientèle restauration/retail en France, avec franchises internationales |
| Détection | `i18next-browser-languagedetector` | Adaptation automatique à la langue du navigateur |
| Fallback | Français | Marché principal |
| Stockage des traductions | Fichiers JSON statiques dans `src/locales/` | Simple, pas besoin de CMS de traduction |
| Format des clés | Notation pointée par domaine (`campaign.statusDraft`, `evaluation.submit`) | Organisation claire, évite les collisions |

---

## 8. Composants UI

### 8.1 Système de design

**Choix** : Composants maison avec CVA, pas de librairie tierce (pas de Shadcn, MUI, Ant).

**Raison** : Contrôle total sur le design, bundle léger, pas de dépendance lourde. Les composants sont peu nombreux (~12) et simples.

### 8.2 Pattern des badges (CVA)

Tous les badges suivent le même pattern :
1. `cva()` pour les variants (status × size)
2. Dot coloré + label i18n
3. Props typées avec `VariantProps`

Badges existants :
- `StatusBadge` — statut d'objectif (not_started, in_progress, completed, blocked)
- `CampaignStatusBadge` — statut de campagne (draft, active, closed)
- `EvaluationStatusBadge` — statut d'évaluation (not_started, in_progress, submitted, validated)

### 8.3 Palette de couleurs

**Choix** : Couleurs centralisées dans `constants/colors.ts`.

| Domaine | Couleurs |
|---------|---------|
| Navigation | Fond sombre `#2C2C2C`, accent vert `#4AFFC3` |
| Accent app | Teal `#008D7E` |
| Campagne draft | Amber (attention) |
| Campagne active | Bleu (en cours) |
| Campagne closed | Gris (terminé) |
| Éval submitted | Amber (en attente) |
| Éval validated | Vert émeraude (OK) |

---

## 9. Export et impression

**Choix** : Export Excel via la librairie `xlsx`, pas de PDF.

**Raison** : Les RH en restauration utilisent Excel pour archiver. Le PDF est moins flexible pour les modifications ultérieures. L'export inclut objectifs, bilan, commentaires.

---

## 10. Sujets différés (décisions à prendre)

### 10.1 Authentification et rôles

**Statut** : Différé. Exploration commencée puis arrêtée par choix ("j'ai besoin de plus d'info").

**Décisions prises** :
- L'auth sera **simulée** dans un premier temps (pas de vrai backend auth)
- Le manager gère **une seule équipe**
- 3 rôles prévus : Manager (voit son équipe), RH (voit tout), Collaborateur (voit ses propres évaluations)
- L'intégration se fera avec la solution existante de planning/paie

**Ce qui reste à décider** :
- Source d'authentification (SSO de la solution hôte ? Token JWT ?)
- Stockage des rôles (dans l'app ou dans la solution hôte ?)
- Granularité des permissions (par établissement ? par équipe ?)

### 10.2 Services IA supplémentaires identifiés

| Service | Effort | Impact | Statut |
|---------|--------|--------|--------|
| Bilan manager auto-généré | Moyen | Fort | Non implémenté |
| Suggestion 9-Box | Faible | Fort | Non implémenté |
| Reformulation d'objectifs | Faible | Moyen | Non implémenté |
| Détection d'incohérences | Moyen | Moyen | Non implémenté |
| Analyse de tendances | Fort | Fort | Non implémenté |
| Benchmark objectifs | Fort | Moyen | Non implémenté |
| Chatbot RH | Fort | Moyen | Non implémenté |

### 10.3 Autres fonctionnalités identifiées mais non implémentées

- Dashboard RH (vue macro, statistiques)
- Notifications (rappels deadlines, évaluations en attente)
- Historique / audit trail
- Gestion des compétences
- Plan de formation
- Export PDF

---

## 11. Structure du projet

```
src/
├── components/
│   ├── common/          # Button, Card, Modal, Input, Badges, ProgressBar...
│   ├── employees/       # EmployeeList, EmployeeForm
│   ├── evaluations/     # EvaluationView, ObjectiveCard, AIAssistant
│   ├── layout/          # Navigation, PageHeader, BackButton
│   ├── ninebox/         # NineBoxView, NineBoxEmployeeModal
│   ├── semesters/       # SemesterList, SemesterCard, SemesterForm, SemesterTeamView, CampaignProgressSummary
│   └── templates/       # TemplateList
├── constants/           # config.ts, colors.ts
├── context/             # 5 contextes domaine + AppProvider
├── hooks/               # useNavigation, useEmployees, useSemesters, useOrganization, useTemplates, useApp, useAI, useConfirmDialog
├── locales/             # fr.json, en.json, es.json
├── services/            # storage.ts, ai.ts, excel.ts
├── styles/              # index.css (Tailwind)
├── types/               # index.ts (tous les types)
└── utils/               # helpers.ts, cn.ts
```
