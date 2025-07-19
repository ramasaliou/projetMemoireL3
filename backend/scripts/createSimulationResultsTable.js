import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'virtual_lab_svt'
};

async function createSimulationResultsTable() {
  let connection;
  
  try {
    console.log('🔧 Création de la table simulation_results...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('✅ Connexion MySQL établie');

    // Créer la table simulation_results
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS simulation_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        simulation_type VARCHAR(50) NOT NULL,
        class_code VARCHAR(10) NOT NULL,
        note INT NOT NULL,
        completion_time INT,
        details JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.query(createTableQuery);
    console.log('✅ Table simulation_results créée avec succès');

    // Vérifier si la table existe
    const [rows] = await connection.query('SHOW TABLES LIKE "simulation_results"');
    if (rows.length > 0) {
      console.log('✅ Table simulation_results existe bien');
    } else {
      console.log('❌ Table simulation_results n\'existe pas');
    }

    console.log('\n🎉 Script terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de la table :', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createSimulationResultsTable(); 