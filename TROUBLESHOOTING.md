# 🚨 Dépannage GitHub Actions - Erreur SSH

## ❌ Erreur rencontrée
```
Error: can't connect without a private SSH key or password
```

## 🔍 Diagnostic

Cette erreur indique que les **secrets GitHub ne sont pas configurés** ou sont incorrects.

## ✅ Solution étape par étape

### 1. Vérifier les secrets GitHub

Allez dans votre repository GitHub :
**Settings → Secrets and variables → Actions**

Vous devez avoir ces 5 secrets configurés :

| Secret | Statut | Action |
|--------|--------|--------|
| `SERVER_HOST` | ❓ À vérifier | Doit contenir `31.207.36.151` |
| `SERVER_USER` | ❓ À vérifier | Doit contenir `root` |
| `SERVER_PORT` | ❓ À vérifier | Doit contenir `22` |
| `SSH_PRIVATE_KEY` | ❓ À vérifier | Doit contenir la clé privée complète |
| `SSH_KNOWN_HOSTS` | ❓ À vérifier | Doit contenir la signature du serveur |

### 2. Récupérer les valeurs correctes

**Clé privée SSH (SSH_PRIVATE_KEY) :**
```bash
cat ~/.ssh/github_actions_deploy
```

**Signature du serveur (SSH_KNOWN_HOSTS) :**
```bash
ssh-keyscan -t ed25519 31.207.36.151 2>/dev/null
```

### 3. Configuration dans GitHub

1. **Supprimez tous les anciens secrets** (s'ils existent)
2. **Créez les nouveaux secrets** avec les valeurs exactes :

#### SERVER_HOST
```
31.207.36.151
```

#### SERVER_USER  
```
root
```

#### SERVER_PORT
```
22
```

#### SSH_PRIVATE_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
[COPIEZ LA CLÉ PRIVÉE COMPLÈTE ICI]
-----END OPENSSH PRIVATE KEY-----
```

#### SSH_KNOWN_HOSTS
```
31.207.36.151 ssh-ed25519 [SIGNATURE_DU_SERVEUR]
```

### 4. Points importants

**❗ Clé privée :**
- Doit commencer par `-----BEGIN OPENSSH PRIVATE KEY-----`
- Doit finir par `-----END OPENSSH PRIVATE KEY-----`
- Doit inclure TOUTES les lignes (même les retours à la ligne)
- Pas d'espaces avant/après

**❗ Known hosts :**
- Une seule ligne
- Format : `IP ssh-ed25519 SIGNATURE`
- Pas de retour à la ligne à la fin

### 5. Test manuel

Avant de pousser à nouveau, testez la connexion manuellement :
```bash
ssh -i ~/.ssh/github_actions_deploy root@31.207.36.151 "echo 'Test OK'"
```

### 6. Workflow alternatif (si problème persiste)

Si les secrets ne fonctionnent toujours pas, utilisez le workflow simplifié :

```yaml
- name: Deploy via SSH
  run: |
    echo "$SSH_KEY" > /tmp/ssh_key
    chmod 600 /tmp/ssh_key
    ssh -i /tmp/ssh_key -o StrictHostKeyChecking=no root@31.207.36.151 "
      cd /root/foodDeliver/projectFront && 
      git pull && 
      npm ci && 
      npm run build && 
      pm2 restart fooddelivery
    "
  env:
    SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

## 🧪 Script de vérification automatique

Utilisez ce script pour régénérer tous les secrets :
```bash
cd /root/foodDeliver/projectFront
./setup-github-secrets.sh
```

## ✅ Une fois corrigé

1. **Sauvegardez** tous les secrets dans GitHub
2. **Relancez** le workflow (push ou re-run dans Actions)
3. **Surveillez** les logs dans l'onglet Actions

Le workflow devrait maintenant fonctionner ! 🚀