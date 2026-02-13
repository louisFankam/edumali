# Configuration des collections PocketBase

Les collections suivantes doivent être créées dans PocketBase pour qu'EduMali fonctionne correctement.

## Collections requises

### 1. Collection : `edumali_user_preferences`
Permet de stocker les préférences utilisateur (thème, couleurs, etc.)

**Schema JSON :**
```json
{
  "id": "user_preferences_id_1234567890",
  "user_id": "relation_to_users",
  "theme": "light",
  "primary_color": "#dc2626",
  "secondary_color": "#3b82f6",
  "accent_color": "#f59e0b",
  "sidebar_color": "#374151",
  "sidebar_text_color": "#ffffff",
  "border_radius": "medium",
  "font_size": "medium",
  "font_family": "Inter, sans-serif",
  "dense_mode": false,
  "compact_sidebar": false,
  "animations": true,
  "high_contrast": false,
  "created": "2024-01-01 00:00:00.000Z",
  "updated": "2024-01-01 00:00:00.000Z"
}
```

**Configuration :**
- **ID Field** : `id`
- **Name** : `edumali_user_preferences`
- **Type** : Base

**API Rules :**
- Enable all CRUD operations (Create, Read, Update, Delete)
- No special rules needed

---

### 2. Collection : `edumali_report_cards`
Permet de stocker les bulletins scolaires générés

**Schema JSON :**
```json
{
  "id": "report_card_id_1234567890",
  "student_id": "relation_to_edumali_students",
  "academic_year": "2024-2025",
  "term": "trimestre1",
  "general_average": 14.5,
  "class_rank": 5,
  "remarks": "Bon trimestre",
  "created": "2024-01-01 00:00:00.000Z",
  "updated": "2024-01-01 00:00:00.000Z"
}
```

---

## Instructions de création dans PocketBase

1. Allez sur http://127.0.0.1:8090/_/ (ou votre URL PocketBase)
2. Cliquez sur **Settings** (roue dentée en bas à gauche)
3. Cliquez sur **New Collection**
4. Configurez la collection selon le schema ci-dessus
5. Cliquez sur **Create**

## Alternative : Création via API

Vous pouvez aussi créer les collections via l'API PocketBase :

```bash
# Via curl
curl -X POST http://127.0.0.1:8090/api/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "edumali_user_preferences",
    "type": "base",
    "schema": [...]
  }'
```

## Vérification

Après création, vérifiez que la collection apparaît :
http://127.0.0.1:8090/_/collections
