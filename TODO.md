# TODO — Dettes & incidents à traiter

Liste des éléments connus à résoudre, hors fonctionnalités prévues sur la
roadmap (qui sont elles dans `DECISIONS.md`).

---

## Sécurité

### [P1] Rotation du `SUPABASE_ACCESS_TOKEN` personnel

> ⚠️ **BLOQUANT MISE EN PRODUCTION** : la rotation de ce token est
> **obligatoire avant la mise en production finale**. Ne pas livrer tant
> que le token exposé n'est pas révoqué et remplacé (voir Lot final —
> Sécurité). Ce point est volontairement différé pendant le chantier EPP,
> mais reste ouvert.

**Contexte** : lors du déploiement de la migration 008 (Lot 1 entretiens
professionnels, 2026-05-13), un personal access token Supabase a été
fourni en clair dans une conversation Claude Code (préfixe `sbp_`,
valeur volontairement non recopiée ici — voir le transcript de la
session du 2026-05-13). Le token a été utilisé inline dans une commande
`SUPABASE_ACCESS_TOKEN=… npx supabase db push`.

**Risque** : portée du token = full admin sur tous les projets Supabase
du compte. Tant qu'il n'est pas révoqué, toute personne ayant lu le
transcript peut pousser des migrations, gérer les Edge Functions, etc.

**À faire** :
1. Révoquer le token actuel sur
   <https://supabase.com/dashboard/account/tokens>.
2. Générer un nouveau token et le stocker dans une variable d'env du
   shell local (`~/.zshrc` ou `~/.config/direnv/`), **pas** dans le repo
   ni dans `.claude/settings.json`.
3. Pour les opérations futures Claude Code → Supabase :
   - soit ajouter une règle de permission durable dans
     `.claude/settings.json` autorisant `Bash(npx supabase …)` afin que
     l'agent n'ait jamais à manipuler le token,
   - soit utiliser un token "scoped" si Supabase l'expose un jour.

**Statut** : à faire.

---

## Migrations en attente d'application

### [P1] Appliquer les migrations 011 → 014 puis activer les flags

Les migrations `011_epp_framework_4_8_years.sql` (documentaire),
`012_epp_proof_and_audit.sql` (preuve/verrouillage EPP, amendée post-audit),
`013_employee_hire_date.sql` (date d'embauche, échéances EPP 1 an/8 ans) et
`014_evaluation_followup_audit.sql` (suivi RH Talent Review : relances +
audit validation) sont **préparées mais non poussées** — application sur
Supabase uniquement après validation explicite (voir la règle sécurité en
tête de chantier).

**Séquence au moment de l'application** :
1. `npx supabase db push --linked` (011 → 014).
2. Dans `src/constants/config.ts`, passer à `true` :
   - `PROFESSIONAL_INTERVIEW_CONFIG.deliveryTrackingEnabled` (remise EPP),
   - `EMPLOYEE_CONFIG.hireDateEnabled` (date d'embauche),
   - `TALENT_REVIEW_CONFIG.reminderTrackingEnabled` (traçabilité relances),
   puis déployer le frontend — ces actions restent masquées/inactives tant
   que les flags sont à `false`.
3. Vérifier les scénarios de recette :
   - EPP : signature salarié → signature manager → snapshot créé →
     modification refusée → remise acceptée → export conforme au snapshot ;
   - EPP : renseigner une date d'embauche et vérifier les échéances
     dans l'historique ;
   - Talent Review : valider une évaluation (audit `validated_by/at`
     stampé), relancer un retardataire (mail + `last_reminder_at`),
     exporter la synthèse de campagne.

⚠️ Tant que 012 n'est pas appliquée, le verrouillage post-signature n'est
appliqué que côté applicatif (contournable par appel API direct) : les EPP
signés ne sont pas encore opposables.

**Statut** : en attente de validation pour le push.

---

## Dépendances Lot 1 → Lots suivants

### [P3] Backfill éventuel des entretiens pro existants

Si l'entreprise pilote a déjà des entretiens professionnels papier, on
pourra prévoir un import (CSV ou interface dédiée) pour alimenter
l'historique côté DB. À discuter avec le client avant Lot 4 (historique
sur fiche employé) — sinon l'historique restera vide jusqu'au premier
cycle pro mené dans l'app.

**Statut** : à arbitrer avec le client.
