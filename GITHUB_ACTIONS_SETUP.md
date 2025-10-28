# 🚀 Configuration GitHub Actions - Déploiement Automatique

## 📋 Secrets à ajouter dans GitHub

Allez dans votre repository GitHub : **Settings → Secrets and variables → Actions → New repository secret**

### 🔑 Secrets requis

| Nom du secret | Valeur | Description |
|---------------|--------|-------------|
| `SERVER_HOST` | `31.207.36.151` | IP de votre serveur VPS |
| `SERVER_USER` | `root` | Utilisateur SSH |
| `SERVER_PORT` | `22` | Port SSH (généralement 22) |
| `SSH_PRIVATE_KEY` | *(voir ci-dessous)* | Clé privée SSH pour l'authentification |
| `SSH_KNOWN_HOSTS` | *(voir ci-dessous)* | Signature du serveur pour sécurité |

### 🔑 SSH_PRIVATE_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAZrKQc22nFEUQZG4Ia7BFm1n+Lt03fvhJQKsybMZ3L5QAAAJjWj+vQ1o/r
0AAAAAtzc2gtZWQyNTUxOQAAACAZrKQc22nFEUQZG4Ia7BFm1n+Lt03fvhJQKsybMZ3L5Q
AAAEAuayrwpg/XUr8eZUmMrULzkBcZVra0UrG+ntML/Pti3xmspBzbacURRBkbghrsEWbW
f4u3Td++ElAqzJsxncvlAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

### 🔐 SSH_KNOWN_HOSTS
```
31.207.36.151 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEFZ4CkOn0jD4tq7R1Vd1bxmiZCbP62I91cauTEaz2Mg
```

## 🎯 Comment ça fonctionne

1. **Vous poussez du code** vers la branche `master`
2. **GitHub Actions se déclenche** automatiquement
3. **Connexion SSH sécurisée** vers votre VPS
4. **Déploiement automatique** :
   - `git pull` pour récupérer les dernières modifications
   - `npm ci` pour installer les dépendances
   - `npm run build` pour compiler l'application
   - `pm2 restart` pour redémarrer l'application

## ✅ Vérification

Une fois les secrets configurés :
1. Faites une petite modification dans votre code
2. Committez et poussez vers `master`
3. Allez dans **Actions** sur GitHub pour voir le déploiement
4. Votre application sera automatiquement mise à jour sur http://31.207.36.151

## 🔧 Debugging

Si le déploiement échoue :
- Vérifiez les logs dans l'onglet **Actions** de GitHub
- Assurez-vous que tous les secrets sont correctement configurés
- Vérifiez que PM2 fonctionne : `pm2 status`

## 🛡️ Sécurité

- ✅ Clé SSH dédiée uniquement pour GitHub Actions
- ✅ Vérification des known_hosts pour éviter les attaques MITM
- ✅ Connexion SSH sécurisée avec timeout
- ✅ Secrets stockés de manière sécurisée dans GitHub