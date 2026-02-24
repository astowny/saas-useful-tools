# 📊 Étude de marché — Optimiseur de CV ATS

## C'est quoi un ATS ?

**ATS = Applicant Tracking System** (Système de Suivi des Candidatures)

C'est un logiciel utilisé par les RH et les entreprises pour **trier automatiquement les CV** avant qu'un humain ne les lise.

**Comment ça marche :**
1. Tu postules en ligne → ton CV est uploadé dans l'ATS
2. L'ATS extrait les mots-clés de l'offre d'emploi
3. Il compare ces mots-clés avec le contenu de ton CV
4. Il attribue un **score de correspondance**
5. Si le score est trop bas → ton CV est **éliminé automatiquement**, sans jamais être lu

**Chiffre clé :** ~75% des candidatures sont rejetées par les ATS avant qu'un recruteur ne les voie.

Un outil d'optimisation ATS aide le candidat à analyser son CV face à une offre précise, identifier les mots-clés manquants, et réécrire son CV pour passer ces filtres.

---

## 🌍 Marché mondial — Les concurrents

| Outil | Modèle | Prix | Ce qu'il fait |
|-------|--------|------|---------------|
| **Jobscan** | Abonnement | $49.95/mois | ⭐ Référence absolue. Analyse CV vs offre, score ATS, mots-clés manquants |
| **ResumeWorded** | Abonnement | ~$19/mois | Score ATS + feedback ligne par ligne |
| **Rezi.ai** | Freemium | ~$29/mois | Builder IA + ATS score |
| **Teal HQ** | Freemium | ~$29/mois | Job tracker + ATS check + builder |
| **Resume.io** | Freemium | $49.95/trimestre (~$16.65/mois) | Builder + ATS check, templates |
| **Kickresume** | Freemium | ~$10/mois | Builder + ATS basique |
| **LandThisJob** | Abonnement | $19/mois | Tailoring rapide (60 sec) |

**Limite commune à tous :** anglais uniquement, optimisé pour le marché US/UK.

---

## 🇫🇷 Marché français — Les acteurs locaux

| Outil | Prix | ATS réel ? | Note |
|-------|------|------------|------|
| **AttractiveCV** | €2.99/mois | ⚠️ Superficiel | Test ATS gratuit basique, pas d'analyse CV vs offre |
| **CVmaker.fr** | ~€5.99/mois | ❌ Non | Builder seulement. Signalé pour abonnements cachés (Signal-Arnaques) |
| **MakeMyCV** | €8.99 par CV (one-shot) | ❌ Non | Guides éditoriaux seulement, pas d'analyse algorithmique |
| **MonCVParfait** | ~€2.99/mois | ❌ Non | Groupe LiveCareer. Abonnements opaques, connu pour pratiques douteuses |
| **Canva** | €13.99/mois (Pro) | ❌ Non | Design pur, anti-ATS par nature |

**Outils étrangers utilisés en France :**

| Outil | Prix | Problème |
|-------|------|---------|
| Jobscan | $49.95/mois | Anglais uniquement, pas adapté au marché FR |
| ResumeWorded | ~$19/mois | Anglais uniquement |
| Teal HQ | ~$29/mois | Anglais uniquement |

---

## 💡 Lacune identifiée : le vide du marché français

**Constat clé :** Il n'existe pas un seul outil français qui analyse réellement la compatibilité CV ↔ offre d'emploi.

Les outils français font tous la même chose : **créer un beau CV**.
Aucun ne fait ce que Jobscan fait : coller une offre d'emploi + analyser le match avec le CV.

**Spécificités françaises ignorées par tous les outils anglo-saxons :**
- Format CV français (photo optionnelle, pas d'âge obligatoire, structure différente)
- Wording français (titres de postes FR, compétences formulées différemment)
- Plateformes FR : Welcome to the Jungle, Indeed FR, Pôle Emploi, LinkedIn FR
- Types de contrats FR : CDI, CDD, alternance, freelance, stage
- Secteurs spécifiques FR : fonction publique, grandes écoles, etc.

---

## 🎯 Positionnement potentiel

| Critère | Jobscan (US) | AttractiveCV (FR) | **Notre outil** |
|---------|-------------|-------------------|-----------------|
| Analyse CV vs offre réelle | ✅ Oui | ❌ Non | ✅ Oui |
| En français | ❌ Non | ✅ Oui | ✅ Oui |
| Contexte marché français | ❌ Non | ⚠️ Partiel | ✅ Oui |
| Prix | $49.95/mois | €2.99/mois | inclus Pro €9.99 |
| Coût API (GPT-4o mini) | — | — | ~€0.001/analyse |

**Résumé :** premier outil 100% français à faire du vrai matching CV ↔ offre d'emploi, à 20% du prix de Jobscan.

---

## 💰 Potentiel économique

- **Coût par analyse** : ~€0.001 (GPT-4o mini, ~500 tokens input + 300 output)
- **Concurrent principal** : Jobscan à $49.95/mois → gap de prix ×5 possible
- **Marché cible** : ~3.5M de demandeurs d'emploi actifs en France à tout moment
- **Conversion estimée** : 0.1% → 3 500 utilisateurs payants = ~€35 000 MRR potentiel
- **Coût API à 1 000 analyses/mois** : ~€1 — marges quasi 100%

---

*Étude réalisée : février 2026*

