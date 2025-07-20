import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

async function addClassIdColumn() {
  try {
    console.log('🔄 Ajout de la colonne class_id à la table resources...');
    
    await sequelize.query(`
      ALTER TABLE resources 
      ADD COLUMN class_id INT,
      ADD FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;
    `);

    console.log('✅ Colonne class_id ajoutée avec succès');
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️ La colonne class_id existe déjà');
    } else {
      console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
      throw error;
    }
  }
}

// Exécuter la migration
addClassIdColumn()
  .then(() => {
    console.log('✅ Migration terminée');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }); 