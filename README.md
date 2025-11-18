# ProjectFront - Plateforme de Commande de Restaurants

![Nuxt](https://img.shields.io/badge/Nuxt-4.1.3-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.2-FFD43B?style=for-the-badge&logo=vue.js&logoColor=black)
![Playwright](https://img.shields.io/badge/Playwright-1.40-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-4%2F4%20Passing-brightgreen?style=flat-square)
![Coverage](https://img.shields.io/badge/Coverage-E2E-blue?style=flat-square)
![Security](https://img.shields.io/badge/Security-Auth%20Protected-orange?style=flat-square)

## Description

Application web moderne de commande de restaurants avec authentification sécurisée, gestion de panier et interface multilingue. Construite avec Nuxt 4 et TypeScript pour une expérience utilisateur optimale.

## Fonctionnalités

- **Authentification sécurisée** avec persistance localStorage
- **Panier protégé** - connexion obligatoire pour commander
- **Gestion multi-restaurants** avec filtres et recherche
- **3 rôles utilisateurs** : Admin, Restaurateur, Client
- **Multilingue** (FR/EN) avec i18n
- **Responsive design** et PWA
- **Accessibilité WCAG** avec navigation clavier
- **Tests E2E** complets avec Playwright

## Technologies

### Frontend

- **Nuxt 4.1.3** - Framework Vue.js full-stack
- **Vue 3.5** - Framework JavaScript réactif
- **TypeScript** - Typage statique
- **Pinia** - Gestion d'état moderne
- **Nuxt I18n** - Internationalisation

### Tests & Qualité

- **Playwright** - Tests end-to-end
- **Vitest** - Tests unitaires
- **ESLint & Prettier** - Qualité de code

### Déploiement

- **PM2** - Gestionnaire de processus
- **GitHub Actions** - CI/CD

## 👥 Comptes de Test

| Rôle             | Nom          | Email | Mot de passe | Accès                |
| ---------------- | ------------ | ----- | ------------ | -------------------- |
| **Admin**        | Jean Dupont  | `a`   | `a`          | Back-office complet  |
| **Client**       | Marie Martin | `b`   | `b`          | Commande restaurants |
| **Restaurateur** | Pierre Leroy | `c`   | `c`          | Gestion restaurant   |

## Installation & Démarrage

```bash
# Cloner le projet
git clone https://github.com/GHOSTUSA/projectFront.git
cd projectFront

# Installer les dépendances
npm install

# Démarrage développement
npm run dev

# Accéder à l'application
# http://localhost:300*
```

## Tests

```bash
# Tests E2E complets
npm run test:e2e

# Tests E2E spécifiques
npm run test:e2e -- --grep "authentification"

# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage
```

## Architecture

```
app/
├── components/          # Composants Vue réutilisables
├── pages/              # Pages et routing automatique
│   ├── index.vue       # Page d'accueil
│   ├── login.vue       # Connexion
│   ├── register.vue    # Inscription
│   └── utilisateur/    # Pages clients
├── stores/             # Stores Pinia
│   ├── authentification/
│   ├── panier/         # Gestion panier sécurisée
│   └── restaurant/     # Cache restaurants
├── composables/        # Fonctions réutilisables
├── types/              # Types TypeScript
└── services/           # Services API

tests/
└── e2e/                # Tests Playwright
    ├── auth.spec.ts    # Tests authentification
    └── auth-cart.spec.ts # Tests sécurité panier
```

## Sécurité

- ✅ **Authentification obligatoire** pour le panier
- ✅ **Validation côté client et store**
- ✅ **Persistance sécurisée** localStorage
- ✅ **Protection CSRF** et validation d'entrées
- ✅ **Rôles et permissions** utilisateurs

## Pages Principales

| Route                          | Description        | Accès        |
| ------------------------------ | ------------------ | ------------ |
| `/`                            | Accueil            | Public       |
| `/login`                       | Connexion          | Public       |
| `/register`                    | Inscription        | Public       |
| `/utilisateur/restaurant`      | Liste restaurants  | Connecté     |
| `/utilisateur/restaurant/[id]` | Détail restaurant  | Connecté     |
| `/Admin/backOffice`            | Administration     | Admin        |
| `/Admin/restaurateur`          | Gestion restaurant | Restaurateur |

## Statut du Projet

| Composant        | Statut         | Tests               |
| ---------------- | -------------- | ------------------- |
| Authentification | ✅ Fonctionnel | ✅ 6/6              |
| Panier Sécurisé  | ✅ Fonctionnel | ✅ 4/4              |
| Restaurants      | ✅ Fonctionnel | ✅ Validé           |
| I18n             | ✅ Fonctionnel | ⚠️ Warnings mineurs |
| Responsive       | ✅ Fonctionnel | ✅ Validé           |
| Accessibilité    | ✅ Fonctionnel | ✅ WCAG AA          |

## Scripts Disponibles

```bash
npm run dev          # Démarrage développement
npm run build        # Build production
npm run preview      # Aperçu production
npm run test         # Tests unitaires
npm run test:e2e     # Tests E2E
npm run lint         # Vérification code
npm run type-check   # Vérification TypeScript
```

## Déploiement

```bash
# Build pour production
npm run build

# Démarrage avec PM2
npm run start:pm2

# Monitoring
npm run monitor
```

## Debugging

- **Port par défaut** : 3003 (configuré dans nuxt.config.ts)
- **API mock** : `/api/data.json`
- **Logs** : Console navigateur + terminal
- **Tests** : `npm run test:e2e -- --headed` pour mode visuel

## Licence

MIT © [GHOSTUSA](https://github.com/GHOSTUSA)
