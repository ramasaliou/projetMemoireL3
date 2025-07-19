import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'virtual_lab_svt'
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Configuration de la base de données...');
    
    // Connexion sans spécifier la base de données
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('✅ Connexion MySQL établie');

    // Créer la base de données si elle n'existe pas
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Base de données '${dbConfig.database}' créée ou existante`);

    // Utiliser la base de données
    await connection.query(`USE ${dbConfig.database}`);

    // Créer les tables
    const tables = [
      `CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
        class VARCHAR(100),
        subject VARCHAR(255),
        avatar VARCHAR(500),
        status ENUM('active', 'inactive') DEFAULT 'active',
        lastLogin DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS Simulations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        duration INT,
        instructions TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS TPs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT,
        duration INT,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        category VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS Results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        simulationId INT,
        tpId INT,
        score DECIMAL(5,2),
        completed BOOLEAN DEFAULT FALSE,
        timeSpent INT,
        answers JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (simulationId) REFERENCES Simulations(id) ON DELETE CASCADE,
        FOREIGN KEY (tpId) REFERENCES TPs(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS Messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        senderId INT,
        receiverId INT,
        subject VARCHAR(255),
        content TEXT,
        isRead BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiverId) REFERENCES Users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS News (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        authorId INT,
        status ENUM('published', 'draft') DEFAULT 'draft',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE SET NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS Resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('document', 'video', 'link', 'image') DEFAULT 'document',
        url VARCHAR(500),
        category VARCHAR(100),
        tags JSON,
        status ENUM('active', 'inactive') DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS quiz_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        quiz_id INT,
        score DECIMAL(5,2),
        answers JSON,
        correct_answers INT,
        total_questions INT,
        time_spent INT,
        status ENUM('completed', 'in_progress') DEFAULT 'in_progress',
        attempt_number INT,
        passed BOOLEAN,
        teacher_feedback TEXT,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )`
    ];

    for (const table of tables) {
      await connection.query(table);
    }

    console.log('✅ Toutes les tables créées avec succès');

    // Insérer des données de démonstration
    console.log('📝 Insertion des données de démonstration...');
    
    // Utilisateurs de démonstration
    const users = [
      {
        name: 'Admin Virtual Lab',
        email: 'admin@virtual-lab.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', // admin123
        role: 'admin'
      },
      {
        name: 'Dr. Rama Niang',
        email: 'teacher@virtual-lab.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', // teacher123
        role: 'teacher',
        subject: 'Sciences de la Vie et de la Terre'
      },
      {
        name: 'Lewis Diatta',
        email: 'student@virtual-lab.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', // student123
        role: 'student',
        class: '3ème A'
      }
    ];

    for (const user of users) {
      await connection.query(
        `INSERT IGNORE INTO Users (name, email, password, role, class, subject) VALUES ('${user.name}', '${user.email}', '${user.password}', '${user.role}', ${user.class ? `'${user.class}'` : 'NULL'}, ${user.subject ? `'${user.subject}'` : 'NULL'})`
      );
    }

    console.log('✅ Données de démonstration insérées');
    console.log('\n🎉 Configuration terminée avec succès !');
    console.log('\n📋 Comptes de test :');
    console.log('- Admin: admin@virtual-lab.com / admin123');
    console.log('- Enseignant: teacher@virtual-lab.com / teacher123');
    console.log('- Étudiant: student@virtual-lab.com / student123');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solutions possibles :');
      console.log('1. Vérifiez que MySQL est démarré');
      console.log('2. Vérifiez le mot de passe root dans le fichier .env');
      console.log('3. Créez un utilisateur MySQL avec les bonnes permissions');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 