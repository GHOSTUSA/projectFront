#!/bin/bash

echo "🔐 Configuration des secrets GitHub Actions pour le déploiement automatique"
echo "=================================================================="
echo ""

# Vérifier si on est sur le serveur
if [[ $(hostname) == *"vps"* ]] || [[ -f /etc/debian_version ]]; then
    echo "✅ Détection : vous êtes sur le serveur VPS"
    IS_SERVER=true
else
    echo "ℹ️  Vous n'êtes pas sur le serveur VPS. Ce script générera les informations à copier."
    IS_SERVER=false
fi

echo ""
echo "📋 Secrets à configurer dans GitHub (Settings → Secrets and variables → Actions)"
echo ""

# 1. SERVER_HOST
echo "1️⃣  SERVER_HOST"
if $IS_SERVER; then
    SERVER_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d'/' -f1)
    echo "   Valeur: $SERVER_IP"
else
    echo "   Valeur: 31.207.36.151 (remplacez par l'IP de votre serveur)"
fi
echo ""

# 2. SERVER_USER
echo "2️⃣  SERVER_USER"
echo "   Valeur: root (ou l'utilisateur SSH que vous utilisez)"
echo ""

# 3. SERVER_PORT
echo "3️⃣  SERVER_PORT"
echo "   Valeur: 22 (port SSH, généralement 22)"
echo ""

# 4. SSH_PRIVATE_KEY
echo "4️⃣  SSH_PRIVATE_KEY"
echo "   📝 Génération d'une nouvelle paire de clés SSH..."

# Créer le répertoire SSH si nécessaire
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Générer une nouvelle clé spécifiquement pour GitHub Actions
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_deploy -N "" -C "github-actions-deploy"

echo "   ✅ Clé générée dans ~/.ssh/github_actions_deploy"
echo ""
echo "   🔑 COPIEZ cette clé privée dans le secret SSH_PRIVATE_KEY:"
echo "   =================================================================="
cat ~/.ssh/github_actions_deploy
echo "   =================================================================="
echo ""

# 5. SSH_KNOWN_HOSTS
echo "5️⃣  SSH_KNOWN_HOSTS"
if $IS_SERVER; then
    echo "   📝 Génération de la signature du serveur..."
    # Obtenir la signature du serveur local
    KNOWN_HOST=$(ssh-keyscan -t ed25519 localhost 2>/dev/null | sed "s/localhost/$SERVER_IP/")
    if [ ! -z "$KNOWN_HOST" ]; then
        echo "   ✅ Signature générée:"
        echo "   =================================================================="
        echo "$KNOWN_HOST"
        echo "   =================================================================="
    else
        echo "   ⚠️  Impossible de générer automatiquement. Utilisez:"
        echo "   ssh-keyscan -t ed25519 VOTRE_IP > known_hosts_temp"
    fi
else
    echo "   ⚠️  À générer depuis votre machine locale avec:"
    echo "   ssh-keyscan -t ed25519 31.207.36.151"
fi
echo ""

# 6. Configuration de la clé publique sur le serveur
echo "6️⃣  Configuration de la clé publique sur le serveur"
echo "   📝 Ajout de la clé publique à authorized_keys..."

if $IS_SERVER; then
    # Ajouter la clé publique aux authorized_keys
    cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "   ✅ Clé publique ajoutée à ~/.ssh/authorized_keys"
else
    echo "   📋 Clé publique à ajouter sur le serveur:"
    echo "   =================================================================="
    cat ~/.ssh/github_actions_deploy.pub 2>/dev/null || echo "   (Générez d'abord la clé privée)"
    echo "   =================================================================="
    echo "   Commande à exécuter sur le serveur:"
    echo "   echo 'CLÉ_PUBLIQUE_CI_DESSUS' >> ~/.ssh/authorized_keys"
fi
echo ""

echo "🚀 Configuration terminée!"
echo ""
echo "📝 Récapitulatif des étapes:"
echo "1. Copiez les 5 secrets dans GitHub (Settings → Secrets and variables → Actions)"
echo "2. Si pas fait automatiquement, ajoutez la clé publique sur le serveur"
echo "3. Commitez et poussez du code - le déploiement se fera automatiquement!"
echo ""
echo "🔍 Test de connexion SSH (optionnel):"
echo "ssh -i ~/.ssh/github_actions_deploy root@VOTRE_IP"