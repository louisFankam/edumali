#!/usr/bin/env python3
"""
Script pour remplacer les URLs PocketBase hardcoded par des appels à getApiUrl()
"""

import os
import re
from pathlib import Path

# Racine du projet
BASE_DIR = Path("/home/christophe/Bureau/Gestion-educative/edumali")

# Fichiers à traiter
FILES_TO_PROCESS = [
    "hooks/use-school-info.ts",
    "hooks/use-classes.ts",
    "hooks/use-exams.ts",
    "hooks/use-grades.ts",
    "hooks/use-teacher-attendance.ts",
    "hooks/use-salary-export.ts",
    "hooks/use-subjects.ts",
    "hooks/use-financial-stats.ts",
    "hooks/use-exam-stats.ts",
    "app/students/reinscription/page.tsx",
    "app/settings/page.tsx",
]

# Motifs à remplacer
URL_PATTERN = r"'http://127\.0\.0\.1:8090/api/([^']+)'"
REPLACEMENT = r"getApiUrl('\1')"

# Motif pour localStorage -> getAuthToken
AUTH_PATTERN = r"const authData = localStorage\.getItem\('pocketbase_auth'\)\s*if \(!authData\) throw new Error\('Non authentifié'\)\s*const \{ token \} = JSON\.parse\(authData\)"
AUTH_REPLACEMENT = "const token = getAuthToken()\n      if (!token) throw new Error('Non authentifié')"

# Motif pour localStorage avec userId
AUTH_USER_PATTERN = r"const authData = localStorage\.getItem\('pocketbase_auth'\)\s*if \(!authData\) throw new Error\('Non authentifié'\)\s*const \{ token, record \} = JSON\.parse\(authData\)\s*const userId = record\.id"
AUTH_USER_REPLACEMENT = "const token = getAuthToken()\n      if (!token) throw new Error('Non authentifié')\n\n      const userId = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}')?.record?.id"

def add_import_if_needed(content: str) -> str:
    """Ajoute l'import getApiUrl et getAuthToken si nécessaire"""
    if 'getApiUrl' not in content:
        # Trouver l'import existant depuis @/lib/pocketbase
        if "from '@/lib/pocketbase'" in content:
            # Ajouter après l'import existant
            content = re.sub(
                r"(from '@/lib/pocketbase'[^\n]*)",
                r"\1\nimport { getApiUrl, getAuthToken } from '@/lib/pocketbase'",
                content,
                count=1
            )
        elif 'from "@@/lib/pocketbase"' in content:
            content = re.sub(
                r"(from '@@/lib/pocketbase'[^\n]*)",
                r"\1\nimport { getApiUrl, getAuthToken } from '@@/lib/pocketbase'",
                content,
                count=1
            )
    return content

def process_file(filepath: Path) -> bool:
    """Traite un fichier et retourne True si des modifications ont été faites"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Ajouter les imports si nécessaires
        content = add_import_if_needed(content)

        # Remplacer les URLs
        content = re.sub(URL_PATTERN, REPLACEMENT, content)

        # Remplacer les patterns d'authentification
        content = re.sub(AUTH_PATTERN, AUTH_REPLACEMENT, content)
        content = re.sub(AUTH_USER_PATTERN, AUTH_USER_REPLACEMENT, content)

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Erreur lors du traitement de {filepath}: {e}")
        return False

def main():
    print("Début du traitement des fichiers...")

    for file_rel in FILES_TO_PROCESS:
        filepath = BASE_DIR / file_rel
        if filepath.exists():
            if process_file(filepath):
                print(f"✓ Mis à jour: {file_rel}")
            else:
                print(f"- Pas de changement: {file_rel}")
        else:
            print(f"✗ Fichier introuvable: {file_rel}")

    print("Traitement terminé.")

if __name__ == "__main__":
    main()
