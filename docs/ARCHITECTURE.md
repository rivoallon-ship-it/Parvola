# Architecture — Talent Review

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS 3 |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| IA | Anthropic Claude (Sonnet 4, Haiku 4.5) via Edge Function proxy |
| Hébergement | Vercel (frontend) + Supabase Cloud (backend) |
| i18n | i18next (FR, EN, ES) |

---

## Structure du projet

```
Parvola/
├── src/
│   ├── components/
│   │   ├── admin/          # SettingsView, MemberList
│   │   ├── auth/           # LoginPage, SignupPage, AuthGate
│   │   ├── common/         # Button, Card, Input, TextArea, Select, Modal, ...
│   │   ├── employees/      # EmployeeList, EmployeeCard, EmployeeView
│   │   ├── evaluations/    # EvaluationView, AIAssistant, AIReviewPanel
│   │   ├── layout/         # Sidebar, PageHeader, DataLoader
│   │   ├── organization/   # EstablishmentList, TeamList
│   │   └── templates/      # TemplateList, PositionCard, TemplateAIAssistant
│   ├── constants/          # colors.ts, config.ts
│   ├── context/            # Providers (User, Toast, Semester, Employee, ...)
│   ├── hooks/              # useUser, useAI, useTemplates, useToast, ...
│   ├── i18n/               # Configuration i18next
│   ├── lib/                # supabase.ts, database.types.ts
│   ├── locales/            # fr.json, en.json, es.json
│   ├── services/           # supabase-data.ts, ai.ts, excel.ts
│   ├── types/              # index.ts (tous les types applicatifs)
│   └── utils/              # helpers.ts, permissions.ts
├── supabase/
│   ├── functions/
│   │   ├── ai-proxy/       # Proxy sécurisé vers Anthropic
│   │   ├── invite-user/    # Invitation d'utilisateurs (admin/RH)
│   │   └── signup-company/ # Création de compte entreprise
│   ├── migrations/         # 001 → 007
│   └── seed.sql            # Données de démo (Sushi Neko)
├── vercel.json             # Config Vercel (headers, rewrites)
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Flux de données

### Authentification
```
LoginPage → supabase.auth.signInWithPassword()
         → AuthGate vérifie la session
         → UserProvider charge le profil (role, company_id)
         → Navigation conditionnelle par rôle
```

### Appels IA
```
Composant (AIAssistant / TemplateAIAssistant)
  → Hook (useAIObjectives / useAITemplates)
    → Service (ai.ts → generateObjectives / generateTemplates)
      → supabase.functions.invoke('ai-proxy')
        → Edge Function (auth check + rate limit + validation)
          → API Anthropic (Claude Sonnet 4 / Haiku 4.5)
```

### Données
```
Composant → Hook / Service (supabase-data.ts)
  → Supabase Client (avec JWT utilisateur)
    → PostgreSQL (filtré par RLS + company_id)
```

---

## Providers (ordre d'imbrication)

```tsx
<ToastProvider>
  <UserProvider>
    <NavigationProvider>
      <AuthGate>
        <DataLoader>
          <EmployeeProvider>
            <OrganizationProvider>
              <SemesterProvider>
                <TemplateProvider>
                  <ProfessionalInterviewProvider>
                    {/* App content */}
                  </ProfessionalInterviewProvider>
                </TemplateProvider>
              </SemesterProvider>
            </OrganizationProvider>
          </EmployeeProvider>
        </DataLoader>
      </AuthGate>
    </NavigationProvider>
  </UserProvider>
</ToastProvider>
```

---

## Migrations SQL

| # | Fichier | Description |
|---|---------|-------------|
| 001 | `001_initial_schema.sql` | Schéma initial (employees, teams, establishments, semesters, evaluations) |
| 002 | `002_multi_tenant.sql` | Ajout de `company_id` sur toutes les tables, RLS par entreprise |
| 003 | `003_roles_directeur_admin.sql` | Ajout des rôles directeur et admin |
| 004 | `004_roles_policies_functions.sql` | Policies RLS granulaires par rôle, fonction `get_user_company_id()` |
| 005 | `005_position_role_employee_email.sql` | Champ `role` sur positions, champ `email` sur employees |
| 006 | `006_company_ai_prompts.sql` | Colonne `ai_prompts JSONB` sur companies |
| 007 | `007_security_hardening.sql` | Policies INSERT/DELETE sur companies |
| 008 | `008_professional_interviews.sql` | Domaine entretien professionnel (tables `professional_campaigns`, `professional_interviews`, enums, RLS multi-tenant) |

---

## Edge Functions

| Fonction | Accès | Auth | Rate Limit | Description |
|----------|-------|------|------------|-------------|
| `ai-proxy` | Authentifié | JWT | 30/h par user | Proxy vers Anthropic avec whitelist modèles + validation |
| `invite-user` | Admin/RH | JWT | 10/h par user | Invitation par email avec rôle contrôlé |
| `signup-company` | Public | Aucune | 5/h par IP | Création entreprise + compte admin |

---

## Modèles IA

| Fonction | Modèle | Max Tokens |
|----------|--------|------------|
| Génération d'objectifs | Claude Sonnet 4 | 2 000 |
| Génération de templates | Claude Sonnet 4 | 2 000 |
| Analyse d'objectif | Claude Sonnet 4 | 2 000 |
| Revue d'évaluation | Claude Sonnet 4 | 4 000 |
| Guide d'entretien | Claude Haiku 4.5 | 3 000 |
| Nettoyage de dictée | Claude Haiku 4.5 | 1 000 |

---

## Déploiement

### Frontend (Vercel)
```bash
npx vercel --prod
```

### Edge Functions (Supabase)
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy <function-name> --project-ref nbtvwgsdnmorciniowxi
```

### Migrations
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase db push --project-ref nbtvwgsdnmorciniowxi
```

### URLs
- **Production** : https://talent-review-eta.vercel.app
- **Supabase Dashboard** : https://supabase.com/dashboard/project/nbtvwgsdnmorciniowxi
