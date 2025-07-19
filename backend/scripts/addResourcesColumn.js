import { sequelize } from '../config/database.js';

const addResourcesColumn = async () => {
  try {
    console.log('🔧 Ajout de la colonne resources à la table classes...');
    
    // Ajouter la colonne resources
    await sequelize.query(`
      ALTER TABLE classes 
      ADD COLUMN resources JSON NULL
    `);
    
    console.log('✅ Colonne resources ajoutée avec succès !');
    
    // Vérifier que la colonne a été ajoutée
    const [results] = await sequelize.query(`
      DESCRIBE classes
    `);
    
    const hasResources = results.some(row => row.Field === 'resources');
    if (hasResources) {
      console.log('✅ Vérification : colonne resources présente dans la table');
    } else {
      console.log('❌ Erreur : colonne resources non trouvée');
    }
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ La colonne resources existe déjà');
    } else {
      console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
    }
  } finally {
    await sequelize.close();
  }
};

addResourcesColumn(); 