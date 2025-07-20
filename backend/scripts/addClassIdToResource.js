import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

async function addClassIdColumn() {
  try {
    console.log('🔄 Ajout de la colonne class_id à la table resources...');

    // Ajouter la colonne class_id
    await sequelize.getQueryInterface().addColumn('resources', 'class_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'classes',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    console.log('✅ Colonne class_id ajoutée avec succès');

  } catch (error) {
    if (error.message.includes('column "class_id" of relation "resources" already exists')) {
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