  Audit complet du SaaS

   Voici un diagnostic exhaustif de ce qu'il manque, classé par criticité.


   ───────────────────────────────────────────────────────────────────────

   🚨 CRITIQUE — Bloquant pour la production

   | # | Manque | Détail |
   |---|--------|--------|
   | 1 | Mot de passe oublié | Aucune route /api/auth/forgot-password, aucun lien "Mot de passe oublié" sur la
   page de login. Les utilisateurs bloqués ne peuvent pas récupérer leur compte. |
   | 2 | Changement de mot de passe | La page Settings permet de changer le nom, mais pas le mot de passe.
   Aucun endpoint côté backend non plus. |
   | 3 | Suppression de compte | Aucun "Delete account" dans Settings. Problème légal (RGPD). |
   | 4 | Page de landing publique | L'app redirige directement vers /login. Il n'existe aucune homepage
   publique : pas de hero, pas de features, pas de CTA, pas de social proof. C'est un énorme problème de
   conversion. |
   | 5 | Confirmation de paiement | Stripe redirige vers /dashboard?session_id=... mais le Dashboard ne lit pas
    ce paramètre. L'utilisateur arrive sur le dashboard sans aucune confirmation visible de son paiement. |
   | 6 | Vérification d'email | Le champ email_verified existe en DB et dans /api/auth/me mais il n'y a aucun
   flow de vérification — ni envoi d'email, ni page de confirmation, ni blocage si non-vérifié. |


   ─────────────────────────────────────────────────

   ⚠️ IMPORTANT — Fonctions SaaS standard manquantes

   | # | Manque | Détail |
   |---|--------|--------|
   | 7 | Emails transactionnels | Zéro email envoyé : ni welcome à l'inscription, ni confirmation de paiement,
   ni annulation d'abonnement, ni reset de mot de passe. Il n'y a aucune intégration SendGrid / Resend /
   Mailgun. |
   | 8 | Historique de facturation | Le webhook Stripe sauvegarde dans payment_history mais il n'existe aucune
   UI pour voir ses factures ou les télécharger. |
   | 9 | Page 404 | Aucune route catch-all ou page 404 personnalisée. Une URL incorrecte ne renvoie rien. |
   | 10 | Page Pricing publique | La PricingPage est derrière ProtectedRoute. Un visiteur non connecté ne peut
   pas voir les prix sans créer un compte. |
   | 11 | Recherche / filtre sur les outils | La ToolsPage liste 21 outils sans aucune barre de recherche.
   Quand il y aura 50 outils, c'est inutilisable. |
   | 12 | Admin panel | Seul un hack hardcodé pour astowny@gmail.com permet de changer de plan. Aucune
   interface pour voir les utilisateurs, revenus, tickets de support, etc. |
   | 13 | Onboarding nouveaux utilisateurs | Après l'inscription, l'utilisateur atterrit sur le dashboard sans
   aucun guide, tooltip, ou wizard d'onboarding. |
   | 14 | Refresh token | Les JWT expirent en 7 jours. Quand ça expire, l'utilisateur est silencieusement
   déconnecté. Aucun mécanisme de refresh. |


   ───────────────────────────────────────────────────────────────────────────────────────────────────────

   📊 MOYEN — UX & croissance

   | # | Manque | Détail |
   |---|--------|--------|
   | 15 | Graphiques d'usage | UsageStats affiche juste une liste. Pas de graphique (ligne, barres) pour
   visualiser la tendance sur la semaine/mois. |
   | 16 | Favoris / outils épinglés | Aucun moyen de marquer des outils favoris. Le Dashboard n'a pas de "Mes
   outils récents". |
   | 17 | Notifications in-app | Aucun système de notifications (quota proche, upgrade réussi, ticket répondu,
   etc.). |
   | 18 | Pages légales | Aucune page CGU (Terms of Service), Politique de confidentialité, ni liens dans un
   footer. Problème légal. |
   | 19 | Footer | L'application n'a aucun footer (liens légaux, réseaux sociaux, contact, copyright). |
   | 20 | RGPD | Pas de bannière de consentement cookies, pas d'export de données personnelles
   (/api/user/export), pas de "droit à l'oubli". |
   | 21 | Gestion de l'équipe (Enterprise) | Le plan Enterprise est vendu comme "for teams & businesses" mais
   il n'y a aucune fonctionnalité d'équipe : inviter des membres, rôles, partage de quotas. |
   | 22 | Scopes des API keys | Les API keys Enterprise n'ont aucune granularité de permissions. Toutes les
   clés accèdent à tout. |
   | 23 | Changement d'email | Il est impossible de changer son email (marqué "Email cannot be changed"). |


   ────────────────────────────────────────────────────────────────────────────────────────────────────────

   🔮 NICE TO HAVE

   | # | Manque | Détail |
   |---|--------|--------|
   | 24 | Analytics | Aucune intégration (Plausible, GA4, PostHog). Impossible de savoir d'où viennent les
   utilisateurs, quels outils convertissent, etc. |
   | 25 | Monitoring d'erreurs | Pas de Sentry ou équivalent. Les erreurs frontend ne sont pas capturées. |
   | 26 | Dark mode | Pas de support du dark mode. |
   | 27 | Auth sociale | Pas de login Google / GitHub (augmente le taux de conversion à l'inscription). |
   | 28 | 2FA | Aucune double authentification disponible, même pour les comptes Enterprise. |
   | 29 | Erreurs backend en FR/EN | Les messages d'erreur du backend sont tous en français, même pour les
   utilisateurs en anglais. |
   | 30 | Webhooks Enterprise | Les Enterprise users ne peuvent pas configurer de webhooks pour être notifiés
   d'événements. |
   | 31 | Historique des outputs | Aucun outil ne sauvegarde son historique (ex: QR codes générés, mots de
   passe générés récemment). |
   | 32 | SEO | Aucune meta tag, sitemap.xml, robots.txt. Pas de pages publiques indexables. |
   | 33 | PWA | Pas de Progressive Web App (manifest, service worker). |
   | 34 | Partage social | Aucun bouton pour partager le résultat d'un outil directement. |
   | 35 | Internationalisation supplémentaire | Uniquement EN/FR. Pas d'espagnol, allemand, etc. |


   ───────────────────────────────────────────────────────────────────────────────────────────────

   Résumé par priorité

   🚨 CRITIQUE (6)  → À faire avant tout lancement sérieux
   ⚠️ IMPORTANT (8) → À faire dans les 2 premières itérations
   📊 MOYEN (9)     → Road-map court terme
   🔮 NICE TO HAVE (12) → Road-map moyen/long terme

