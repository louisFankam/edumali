#!/usr/bin/env python3
"""
Script complet pour remplacer toutes les URLs PocketBase hardcoded (y compris backticks)
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/home/christophe/Bureau/Gestion-educative/edumali")

def add_pocketbase_imports(content: str) -> str:
    """Ajoute les imports getApiUrl et getAuthToken depuis @/lib/pocketbase"""
    if 'getApiUrl' in content and 'getAuthToken' in content:
        return content  # Déjà importé

    # Trouver la fin des imports
    lines = content.split('\n')
    import_end_idx = -1

    for i, line in enumerate(lines):
        if line.strip().startswith('import ') and ('@/lib/pocketbase' in line or '@/lib/pocketbase' in line or '@/lib' in line):
            import_end_idx = i
        elif line.strip().startswith('import ') and import_end_idx == -1:
            import_end_idx = i

    if import_end_idx >= 0:
        indent = ''
        for char in lines[import_end_idx]:
            if char in ' \t':
                indent += char
            else:
                break
        lines.insert(import_end_idx + 1, f"{indent}import {{ getApiUrl, getAuthToken }} from '@/lib/pocketbase'")
        return '\n'.join(lines)
    else:
        # Ajouter au début
        return "import { getApiUrl, getAuthToken } from '@/lib/pocketbase'\n" + content

def replace_urls_in_content(content: str) -> str:
    """Remplace les URLs hardcoded avec tous les types de guillemets"""

    # Fonction helper pour remplacer dans un match
    def replacer(match):
        quote_type = match.group(1)  # ', ", ou `
        url_path = match.group(2)
        return f"getApiUrl({quote_type}{url_path}{quote_type})"

    # Pattern pour URL avec backticks (template literals)
    content = re.sub(
        r'([`\'"])http://127\.0\.0\.1:8090/api/([^\'"`]+)(\1)',
        lambda m: f"getApiUrl({m.group(1)}{m.group(2)}{m.group(1)})",
        content
    )

    return content

def replace_auth_in_content(content: str) -> str:
    """Remplace les patterns d'authentification"""

    # Simplifier le pattern - juste remplacer les lignes de récupération de token
    patterns = [
        # Pattern simple: const { token } = JSON.parse(authData)
        (
            r"const authData = localStorage\.getItem\('pocketbase_auth'\)\s*if \(!authData\) throw new Error\('Non authentifié'\)\s*const \{ token \} = JSON\.parse\(authData\)",
            "const token = getAuthToken()\n      if (!token) throw new Error('Non authentifié')"
        ),
        # Pattern avec record
        (
            r"const authData = localStorage\.getItem\('pocketbase_auth'\)\s*if \(!authData\) throw new Error\('Non authentifié'\)\s*const \{ token, record \} = JSON\.parse\(authData\)\s*const userId = record\.id",
            "const authData = localStorage.getItem('pocketbase_auth')\n      if (!authData) throw new Error('Non authentifié')\n      const { record } = JSON.parse(authData)\n      const userId = record?.id\n      const token = getAuthToken()"
        ),
        # Pattern avec record (sans userId)
        (
            r"const authData = localStorage\.getItem\('pocketbase_auth'\)\s*if \(!authData\) throw new Error\('Non authentifié'\)\s*const \{ token, record \} = JSON\.parse\(authData\)",
            "const authData = localStorage.getItem('pocketbase_auth')\n      if (!authData) throw new Error('Non authentifié')\n      const { record } = JSON.parse(authData)\n      const token = getAuthToken()"
        ),
    ]

    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

    return content

def process_file(filepath: Path) -> bool:
    """Traite un fichier et retourne True si modifié"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Appliquer les transformations
        if '127.0.0.1:8090' in content:
            content = add_pocketbase_imports(content)
            content = replace_urls_in_content(content)

        if 'localStorage.getItem' in content and '127.0.0.1:8090' in original:
            content = replace_auth_in_content(content)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Erreur: {filepath.relative_to(BASE_DIR)}: {e}")
        return False

def main():
    # Fichiers spécifiques à traiter
    files_to_process = [
        "hooks/use-classes.ts",
        "hooks/use-exams.ts",
        "hooks/use-grades.ts",
        "hooks/use-exam-stats.ts",
        "hooks/use-financial-stats.ts",
        "hooks/use-subjects.ts",
        "hooks/use-salaries.ts",
        "hooks/use-teachers.ts",
        "hooks/use-user-preferences.ts",
        "hooks/use-salary-export.ts",
        "hooks/use-school.ts",
        "app/settings/page.tsx",
        "app/students/reinscription/page.tsx",
    ]

    modified_count = 0

    for file_rel in files_to_process:
        filepath = BASE_DIR / file_rel
        if filepath.exists():
            if process_file(filepath):
                print(f"✓ {file_rel}")
                modified_count += 1
            else:
                print(f"- {file_rel} (pas de changement)")
        else:
            print(f"✗ {file_rel} (introuvable)")

    print(f"\nTotal: {modified_count} fichiers modifiés")

if __name__ == "__main__":
    main()
