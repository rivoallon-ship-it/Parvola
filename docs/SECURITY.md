# Architecture de sécurité — Talent Review

Ce document décrit les mesures de sécurité implémentées dans l'application.

---

## 1. Authentification

| Couche | Mécanisme |
|--------|-----------|
| Frontend | Supabase Auth (JWT) — session gérée côté client |
| Edge Functions | Vérification du token JWT via `supabase.auth.getUser()` |
| Base de données | Row Level Security (RLS) sur toutes les tables |

---

## 2. Multi-tenancy & RLS

Chaque table est protégée par des policies RLS basées sur `company_id`.

```sql
-- Exemple de policy (sélection)
CREATE POLICY "Users can view own company data"
  ON employees FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
```

### Tables protégées (9)
`profiles`, `employees`, `teams`, `establishments`, `semesters`, `evaluations`, `positions`, `objective_templates`, `companies`

### Table `companies` — protection renforcée
- **INSERT bloqué** : les entreprises ne peuvent être créées que via l'Edge Function `signup-company` (service_role).
- **DELETE bloqué** : aucune suppression directe par un utilisateur authentifié.
- Migration : `007_security_hardening.sql`

---

## 3. Système de rôles

Hiérarchie stricte avec permissions granulaires :

```
admin > rh > directeur > manager > employee
```

| Rôle | Permissions clés |
|------|-----------------|
| `admin` | Tout accès, gestion des membres, paramètres, peut inviter tous les rôles sauf admin |
| `rh` | Gestion des évaluations, templates, paramètres, invitation de directeur/manager/employee |
| `directeur` | Lecture multi-établissements, pas d'accès aux paramètres |
| `manager` | Gestion de son équipe uniquement |
| `employee` | Lecture seule de sa propre évaluation |

Les rôles sont validés côté serveur dans les Edge Functions (pas uniquement côté client).

---

## 4. Edge Functions — Sécurité

### 4.1 CORS
Seules les origines autorisées reçoivent des headers CORS. Les requêtes d'origines inconnues sont rejetées avec **HTTP 403**.

```typescript
const ALLOWED_ORIGINS = [
  'https://talent-review-eta.vercel.app',
  'https://talent-review.vercel.app',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return null; // → 403 Forbidden
  }
  return { 'Access-Control-Allow-Origin': origin, ... };
}
```

### 4.2 Rate Limiting
Chaque Edge Function implémente un rate limiter en mémoire :

| Fonction | Limite | Fenêtre | Clé |
|----------|--------|---------|-----|
| `ai-proxy` | 30 req | 1 heure | `user.id` |
| `invite-user` | 10 req | 1 heure | `user.id` |
| `signup-company` | 5 req | 1 heure | IP (`x-forwarded-for`) |

### 4.3 Proxy IA (`ai-proxy`)
- **Whitelist de modèles** : seuls `claude-sonnet-4-20250514` et `claude-haiku-4-5-20251001` sont autorisés.
- **Cap de tokens** : maximum 4 000 tokens par requête.
- **Validation des messages** : max 20 messages, max 15 000 caractères par message, seuls les rôles `user`/`assistant` sont acceptés.
- **Pas d'exposition de clé** : la clé API Anthropic reste côté serveur (Deno env), jamais exposée au client.
- **Erreurs sanitisées** : les erreurs Anthropic sont remplacées par un message générique (pas de leak d'infos internes).

---

## 5. Protection des données sensibles

### 5.1 Données exclues des prompts IA
Les informations suivantes ne sont **pas** envoyées à l'API Anthropic :
- Salaire
- Informations personnelles identifiantes (adresse, numéro de sécurité sociale, etc.)

Seuls le nom, le poste, les objectifs et les métriques de performance sont transmis.

### 5.2 Revue IA juridique
La fonction `reviewEvaluation` analyse les évaluations pour détecter :
- Risques de discrimination (Art. L1132-1 Code du travail)
- Jugements de valeur sur la personne
- Formulations exploitables aux Prud'hommes
- Sanctions déguisées

---

## 6. Sécurité Frontend

### 6.1 Headers HTTP (Vercel)
```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=()"
}
```

### 6.2 XSS — Export HTML
Toutes les données utilisateur injectées dans le HTML d'export/impression sont échappées via `escapeHtml()` :
```typescript
const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
     .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
     .replace(/'/g, '&#39;');
```

### 6.3 Sourcemaps
Désactivés en production (`sourcemap: false` dans `vite.config.ts`).

### 6.4 Boutons de démo
Les boutons de connexion rapide (avec emails/mots de passe de démo) sont affichés en permanence pour faciliter les démonstrations. Les mots de passe de démo sont des comptes de test uniquement.

---

## 7. Import Excel — Validation

| Contrôle | Valeur |
|----------|--------|
| Taille max du fichier | 5 Mo |
| Extensions autorisées | `.xlsx`, `.xls`, `.csv` |
| Nombre de lignes max | 5 000 |
| Sanitisation formules | Suppression des caractères `= + - @` en début de cellule |

---

## 8. Secrets & Configuration

| Secret | Emplacement | Exposition client |
|--------|------------|-------------------|
| `ANTHROPIC_API_KEY` | Deno env (Edge Function) | Non |
| `SUPABASE_SERVICE_ROLE_KEY` | Deno env (Edge Functions) | Non |
| `SUPABASE_ANON_KEY` | Variable d'env Vite | Oui (limité par RLS) |
| `SUPABASE_URL` | Variable d'env Vite | Oui (endpoint public) |

La `SUPABASE_ANON_KEY` est conçue pour être publique — toute la sécurité repose sur les policies RLS côté base de données.

---

## 9. Améliorations futures recommandées

- [ ] Content Security Policy (CSP) header
- [ ] Rotation automatique des tokens Supabase
- [ ] Monitoring des erreurs 403/429 côté Edge Functions
- [ ] Audit logging des actions admin (création d'utilisateurs, modification de rôles)
- [ ] Chiffrement des champs sensibles en base (ex: `ai_prompts`)
- [ ] Tests de pénétration automatisés (OWASP ZAP)
