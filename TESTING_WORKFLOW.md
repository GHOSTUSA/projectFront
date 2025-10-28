# 🧪 Configuration des Tests dans le Workflow CI/CD

## ✅ Workflow amélioré

Votre workflow GitHub Actions a été optimisé avec les meilleures pratiques :

### 🔄 Séparation des responsabilités

**Job 1: Tests** 
- Exécute les tests unitaires avec Vitest
- Construit l'application pour vérifier
- Bloque le déploiement si les tests échouent

**Job 2: Déploiement**
- Ne s'exécute que si les tests passent
- Se connecte au VPS et déploie
- Redémarre l'application avec PM2

### 📋 Scripts de test utilisés

| Script | Commande | Usage |
|--------|----------|-------|
| `test:ci` | `vitest run` | Tests unitaires en mode CI (one-shot) |
| `test:e2e` | `playwright test` | Tests end-to-end (optionnel) |
| `test:coverage` | `vitest --coverage` | Tests avec couverture de code |

### 🚀 Avantages de cette configuration

1. **✅ Feedback rapide** : Les tests s'exécutent en parallèle
2. **🛡️ Protection** : Pas de déploiement si les tests échouent  
3. **🔍 Visibilité** : Jobs séparés = logs plus clairs
4. **⚡ Performance** : Cache npm pour accélérer les builds

### 🧪 Ajout des tests E2E (optionnel)

Si vous voulez ajouter les tests E2E au workflow :

```yaml
      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
```

### 📊 Tests de performance (optionnel)

Pour ajouter des tests de performance avec Lighthouse :

```yaml
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

### 🎯 Configuration actuelle optimale

Votre workflow actuel est parfait pour :
- ✅ Tests unitaires automatiques
- ✅ Build validation
- ✅ Déploiement sécurisé
- ✅ Rollback automatique si échec

## 🔧 Commandes utiles

```bash
# Tester localement comme sur CI
npm run test:ci

# Tester avec couverture
npm run test:coverage

# Tester tout (unit + e2e)
npm run test:all

# Lancer les tests en mode développement
npm run test
```

## 📈 Métriques et monitoring

Pour surveiller la qualité de votre code, vous pouvez ajouter :
- **Code coverage** avec Codecov
- **Security scanning** avec Snyk
- **Performance monitoring** avec Lighthouse CI

Le workflow est maintenant optimisé pour une CI/CD robuste ! 🚀