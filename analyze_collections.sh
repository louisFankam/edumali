#!/bin/bash

# URL de base de PocketBase
BASE_URL="http://127.0.0.1:8090"

# Authentification en tant qu'admin
echo "Authentification en tant qu'admin..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admins/auth-with-password" \
  -H "Content-Type: application/json" \
  -d '{"identity": "admin@gmail.com", "password": "administrateur"}')

# Extraire le token d'authentification
TOKEN=$(echo $AUTH_RESPONSE | jq -r '.token')
ADMIN_ID=$(echo $AUTH_RESPONSE | jq -r '.admin.id')

if [ "$TOKEN" == "null" ]; then
  echo "Erreur d'authentification:"
  echo $AUTH_RESPONSE
  exit 1
fi

echo "✓ Authentification réussie"
echo "Admin ID: $ADMIN_ID"

# Fonction pour récupérer la structure d'une collection
get_collection_structure() {
  local collection_name=$1
  echo ""
  echo "=== Analyse de la collection: $collection_name ==="
  
  # Récupérer la structure de la collection
  STRUCTURE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/collections/$collection_name" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Structure de la collection:"
  echo $STRUCTURE_RESPONSE | jq '.'
  
  # Récupérer quelques exemples d'enregistrements
  echo ""
  echo "Exemples d'enregistrements:"
  RECORDS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/collections/$collection_name/records?perPage=3" \
    -H "Authorization: Bearer $TOKEN")
  
  echo $RECORDS_RESPONSE | jq '.'
}

# Analyser chaque collection demandée
get_collection_structure "edumali_teachers"
get_collection_structure "edumali_subjects"
get_collection_structure "edumali_teachers_substitute"

echo ""
echo "Analyse terminée"