#!/bin/bash

# Script para remover archivos sensibles del historial de git
# ADVERTENCIA: Esto reescribirá el historial de git

echo "🔒 Removiendo archivos sensibles del historial de git..."

# Lista de archivos sensibles a remover
FILES_TO_REMOVE=(
    "test-login.html"
    "src/lib/testAuth.ts"
    "src/lib/authDebug.ts"
    "src/lib/devAuth.ts"
    "src/app/api/test-login/route.ts"
    "src/app/api/fix-admin-user/route.ts"
    "src/app/api/create-test-user/route.ts"
    "PRODUCTION_AUTH_SETUP.md"
)

# Backup del branch actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Branch actual: $CURRENT_BRANCH"

# Crear un backup tag antes de modificar el historial
git tag backup-before-cleanup-$(date +%Y%m%d-%H%M%S)

# Remover cada archivo del historial
for FILE in "${FILES_TO_REMOVE[@]}"; do
    echo "🗑️  Removiendo $FILE del historial..."
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch $FILE" \
        --prune-empty --tag-name-filter cat -- --all 2>/dev/null || true
done

echo "✅ Archivos removidos del historial"
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Revisa que todo funcione correctamente"
echo "2. Si todo está bien, ejecuta:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Todos los colaboradores deben hacer:"
echo "   git fetch --all"
echo "   git reset --hard origin/$CURRENT_BRANCH"
echo ""
echo "4. Para limpiar el espacio local:"
echo "   rm -rf .git/refs/original/"
echo "   git reflog expire --expire=now --all"
echo "   git gc --prune=now --aggressive"