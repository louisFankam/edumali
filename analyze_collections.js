const PocketBase = require('pocketbase');

const pb = new PocketBase('http://127.0.0.1:8090');

async function analyzeCollections() {
  try {
    // Authentification en tant qu'admin
    console.log('Authentification en tant qu\'admin...');
    await pb.admins.authWithPassword('admin@gmail.com', 'administrateur');
    console.log('✓ Authentification réussie');

    // Fonction pour récupérer la structure d'une collection
    async function getCollectionStructure(collectionName) {
      try {
        const response = await pb.send(`/api/collections/${collectionName}`, {
          method: 'GET',
        });
        return response;
      } catch (error) {
        console.error(`Erreur lors de la récupération de la collection ${collectionName}:`, error.message);
        return null;
      }
    }

    // Analyser chaque collection demandée
    const collections = ['edumali_teachers', 'edumali_subjects', 'edumali_teachers_substitute'];
    
    for (const collectionName of collections) {
      console.log(`\n=== Analyse de la collection: ${collectionName} ===`);
      
      const structure = await getCollectionStructure(collectionName);
      if (structure) {
        console.log(`Nom: ${structure.name}`);
        console.log(`Type: ${structure.type}`);
        console.log(`Schéma: ${structure.schema ? 'Oui' : 'Non'}`);
        
        if (structure.schema) {
          console.log('\nChamps:');
          structure.schema.forEach(field => {
            console.log(`  - ${field.name}: ${field.type} ${field.required ? '(requis)' : ''}`);
            if (field.options) {
              Object.keys(field.options).forEach(optionKey => {
                console.log(`    ${optionKey}: ${JSON.stringify(field.options[optionKey])}`);
              });
            }
          });
        }
        
        // Récupérer quelques exemples d'enregistrements
        try {
          const records = await pb.collection(collectionName).getList(1, 3);
          console.log(`\nExemples d'enregistrements (${records.totalItems} total):`);
          records.items.forEach((record, index) => {
            console.log(`  Enregistrement ${index + 1}:`, JSON.stringify(record, null, 2));
          });
        } catch (error) {
          console.log(`Impossible de récupérer les enregistrements: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

analyzeCollections();