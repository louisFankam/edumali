#!/usr/bin/env python3
"""
Script complet pour remplacer toutes les URLs PocketBase hardcoded
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/home/christophe/Bureau/Gestion-educative/edumali")

# Remplacements à faire
def add_pocketbase_imports(content: str) -> str:
    """Ajoute les imports getApiUrl et getAuthToken depuis @/lib/pocketbase"""
    if 'getApiUrl' in content and 'getAuthToken' in content:
        return content  # Déjà importé

    # Trouver si import existant
    if "from '@/lib/pocketbase'" in content or "from '@/lib/pocketbase'" in content:
        # Remplacer l'import existant
        content = re.sub(
            r"import \{([^}]*)\} from '@@/lib/pocketbase'",
            lambda m: f"import {{{m.group(1)}, getApiUrl, getAuthToken}} from '@/lib/pocketbase'",
            content
        )
        content = re.sub(
            r"import \{([^}]*)\} from '@/lib/pocketbase'",
            lambda m: f"import {{{m.group(1)}, getApiUrl, getAuthToken}} from '@/lib/pocketbase'",
            content
        )
        return content
    elif "import { pb" in content and "from '@/lib/pocketbase'" in content:
        # Import avec pb
        content = re.sub(
            r"(import \{[^}]*\} from '@/lib/pocketbase')",
            r"\1\nimport { getApiUrl, getAuthToken } from '@/lib/pocketbase'",
            content,
            count=1
        )
        return content
    elif "import { pb" in content and 'from "@/lib/pocketbase"' in content:
        content = re.sub(
            r"(import \{[^}]*\} from \"@/lib/pocketbase\")",
            r'\1\nimport { getApiUrl, getAuthToken } from "@/lib/pocketbase"',
            content,
            count=1
        )
        return content
    else:
        # Ajouter après les autres imports
        lines = content.split('\n')
        import_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') and '@/lib/pocketbase' in line:
                import_idx = i
                break
            elif line.strip().startswith('import ') and 'react' in line:
                import_idx = i

        if import_idx >= 0:
            lines.insert(import_idx + 1, "import { getApiUrl, getAuthToken } from '@/lib/pocketbase'")
            return '\n'.join(lines)
        # Sinon, ajouter au début
        return "import { getApiUrl, getAuthToken } from '@/lib/pocketbase'\n" + content

def replace_urls(content: str) -> str:
    """Remplace les URLs hardcoded"""
    # Pattern pour URLs avec guillemets simples
    content = re.sub(
        r"'http://127\.0\.0\.1:8090/api/([^']+)'",
        r"getApiUrl('\1')",
        content
    )
    # Pattern pour URLs avec guillemets doubles
    content = re.sub(
        r'"http://127\.0\.0\.1:8090/api/([^"]+)"',
        r'getApiUrl("\1")',
        content
    )
    return content

def replace_auth_pattern(content: str) -> str:
    """Remplace les patterns d'authentification"""
    # Pattern: const authData = localStorage...; const { token } = JSON.parse
    pattern1 = r"const authData = localStorage\.getItem\('pocketbase_auth'\)[\s\n]*if \(!authData\) throw new Error\('Non authentifié'\)[\s\n]*const \{ token \} = JSON\.parse\(authData\)"
    replacement1 = "const token = getAuthToken()\n      if (!token) throw new Error('Non authentifié')"
    content = re.sub(pattern1, replacement1, content, flags=re.MULTILINE)

    # Pattern avec record aussi
    pattern2 = r"const authData = localStorage\.getItem\('pocketbase_auth'\)[\s\n]*if \(!authData\) throw new Error\('Non authentifié'\)[\s\n]*const \{ token, record \} = JSON\.parse\(authData\)"
    replacement2 = "const authData = localStorage.getItem('pocketbase_auth')\n      if (!authData) throw new Error('Non authentifié')\n      const { record } = JSON.parse(authData)\n      const token = getAuthToken()"
    content = re.sub(pattern2, replacement2, content, flags=re.MULTILINE)

    return content

def process_file(filepath: Path) -> bool:
    """Traite un fichier et retourne True si modifié"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Appliquer les transformations
        if '127.0.0.1:8090' in content or 'localStorage.getItem' in content:
            content = add_pocketbase_imports(content)
            content = replace_urls(content)
            content = replace_auth_pattern(content)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Erreur: {filepath}: {e}")
        return False

def main():
    # Traiter tous les fichiers .ts, .tsx, .jsx
    extensions = ['.ts', '.tsx', '.jsx']
    modified_count = 0

    for ext in extensions:
        for filepath in BASE_DIR.rglob(f'*{ext}'):
            # Exclure node_modules et .next
            if 'node_modules' in str(filepath) or '.next' in str(filepath):
                continue
            if process_file(filepath):
                print(f"✓ {filepath.relative_to(BASE_DIR)}")
                modified_count += 1

    print(f"\nTotal: {modified_count} fichiers modifiés")

if __name__ == "__main__":
    main()
