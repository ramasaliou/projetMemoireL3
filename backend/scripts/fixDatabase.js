import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const fixDatabase = async () => {
  let connection;
  
  try {
    console.log('🔧 Début de la réparation de la base de données...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'virtual_lab_svt'
    });

    console.log('✅ Connexion à la base de données établie');

    // 1. Vérifier les index existants sur la table users
    console.log('📊 Vérification des index existants...');
    const [indexes] = await connection.execute(`
      SELECT 
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'virtual_lab_svt'}' 
      AND TABLE_NAME = 'users'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `);

    console.log('Index trouvés:', indexes);

    // 2. Supprimer les index en double ou problématiques
    console.log('🗑️ Suppression des index problématiques...');
    
    // Supprimer les index en double sur email
    const emailIndexes = indexes.filter(idx => idx.COLUMN_NAME === 'email');
    if (emailIndexes.length > 1) {
      console.log('Suppression des index en double sur email...');
      for (let i = 1; i < emailIndexes.length; i++) {
        try {
          await connection.execute(`DROP INDEX ${emailIndexes[i].INDEX_NAME} ON users`);
          console.log(`Index ${emailIndexes[i].INDEX_NAME} supprimé`);
        } catch (error) {
          console.log(`Impossible de supprimer l'index ${emailIndexes[i].INDEX_NAME}:`, error.message);
        }
      }
    }

    // 3. Recréer l'index unique sur email proprement
    console.log('🔧 Recréation de l\'index unique sur email...');
    try {
      await connection.execute(`
        ALTER TABLE users 
        ADD UNIQUE INDEX idx_email_unique (email)
      `);
      console.log('✅ Index unique sur email recréé');
    } catch (error) {
      console.log('Index unique sur email déjà présent ou erreur:', error.message);
    }

    // 4. Optimiser la table
    console.log('⚡ Optimisation de la table users...');
    try {
      await connection.execute('OPTIMIZE TABLE users');
      console.log('✅ Table users optimisée');
    } catch (error) {
      console.log('Erreur lors de l\'optimisation:', error.message);
    }

    // 5. Vérifier le nombre total d'index
    console.log('🔍 Vérification finale des index...');
    const [finalIndexes] = await connection.execute(`
      SELECT COUNT(*) as total_indexes
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'virtual_lab_svt'}' 
      AND TABLE_NAME = 'users'
    `);

    console.log(`📊 Nombre total d'index: ${finalIndexes[0].total_indexes}`);

    if (finalIndexes[0].total_indexes > 60) {
      console.log('⚠️ Attention: Encore trop d\'index. Suppression des index non essentiels...');
      
      // Supprimer les index non essentiels
      const [allIndexes] = await connection.execute(`
        SELECT INDEX_NAME
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'virtual_lab_svt'}' 
        AND TABLE_NAME = 'users'
        AND INDEX_NAME NOT IN ('PRIMARY', 'idx_email_unique')
        ORDER BY INDEX_NAME
      `);

      // Garder seulement les premiers index essentiels
      const indexesToKeep = 10;
      for (let i = indexesToKeep; i < allIndexes.length; i++) {
        try {
          await connection.execute(`DROP INDEX ${allIndexes[i].INDEX_NAME} ON users`);
          console.log(`Index ${allIndexes[i].INDEX_NAME} supprimé`);
        } catch (error) {
          console.log(`Impossible de supprimer l'index ${allIndexes[i].INDEX_NAME}:`, error.message);
        }
      }
    }

    console.log('✅ Réparation de la base de données terminée avec succès !');
    console.log('🔄 Redémarrez maintenant le serveur avec: npm start');

  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion à la base de données fermée');
    }
  }
};

// Exécuter le script
fixDatabase(); 