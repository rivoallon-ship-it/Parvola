# TODO — Dettes & incidents à traiter

Liste des éléments connus à résoudre, hors fonctionnalités prévues sur la
roadmap (qui sont elles dans `DECISIONS.md`).

---

## Sécurité

### [P1] Rotation du `SUPABASE_ACCESS_TOKEN` personnel

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

## Dépendances Lot 1 → Lots suivants

### [P3] Backfill éventuel des entretiens pro existants

Si l'entreprise pilote a déjà des entretiens professionnels papier, on
pourra prévoir un import (CSV ou interface dédiée) pour alimenter
l'historique côté DB. À discuter avec le client avant Lot 4 (historique
sur fiche employé) — sinon l'historique restera vide jusqu'au premier
cycle pro mené dans l'app.

**Statut** : à arbitrer avec le client.
