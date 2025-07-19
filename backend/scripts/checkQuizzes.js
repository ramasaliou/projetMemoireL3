import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'virtual_lab_svt'
};

async function checkQuizzes() {
  let connection;
  
  try {
    console.log('🔍 Vérification des quiz et leurs assignations...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion MySQL établie');

    // Vérifier tous les quiz
    const [quizzes] = await connection.query(`
      SELECT 
        q.id,
        q.title,
        q.subject,
        q.level,
        q.status,
        q.assigned_to,
        q.created_by,
        u.name as creator_name,
        u.email as creator_email
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      ORDER BY q.created_at DESC
    `);

    console.log('\n=== TOUS LES QUIZ ===');
    quizzes.forEach(quiz => {
      console.log(`ID: ${quiz.id} | Titre: ${quiz.title} | Matière: ${quiz.subject} | Statut: ${quiz.status}`);
      console.log(`   Créé par: ${quiz.creator_name} (${quiz.creator_email})`);
      console.log(`   Assigné à: ${quiz.assigned_to || 'Aucun'} | Créateur ID: ${quiz.created_by}`);
      console.log('');
    });

    // Vérifier les classes et leurs professeurs
    const [classes] = await connection.query(`
      SELECT 
        c.id,
        c.name,
        c.teacher_id,
        u.name as teacher_name,
        u.email as teacher_email
      FROM classes c
      LEFT JOIN users u ON c.teacher_id = u.id
    `);

    console.log('\n=== CLASSES ET PROFESSEURS ===');
    classes.forEach(cls => {
      console.log(`Classe: ${cls.name} | Prof: ${cls.teacher_name} (${cls.teacher_email}) | Prof ID: ${cls.teacher_id}`);
    });

    // Vérifier les quiz pour l'étudiant Aida (ID: 7)
    console.log('\n=== QUIZ POUR AIDA (ID: 7) ===');
    const [aidaQuizzes] = await connection.query(`
      SELECT 
        q.id,
        q.title,
        q.subject,
        q.status,
        q.assigned_to,
        q.created_by,
        u.name as creator_name
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.status = 'active'
      AND (
        q.assigned_to IS NOT NULL 
        OR q.created_by = (
          SELECT c.teacher_id 
          FROM classes c 
          WHERE c.name = (
            SELECT class FROM users WHERE id = 7
          )
        )
      )
    `);

    if (aidaQuizzes.length > 0) {
      console.log(`✅ ${aidaQuizzes.length} quiz disponibles pour Aida:`);
      aidaQuizzes.forEach(quiz => {
        console.log(`   - ${quiz.title} (${quiz.subject}) par ${quiz.creator_name}`);
      });
    } else {
      console.log('❌ Aucun quiz disponible pour Aida');
    }

    // Vérifier la classe d'Aida
    const [aidaClass] = await connection.query(`
      SELECT class FROM users WHERE id = 7
    `);

    if (aidaClass.length > 0) {
      console.log(`\n📚 Classe d'Aida: ${aidaClass[0].class}`);
      
      // Vérifier le professeur de cette classe
      const [teacher] = await connection.query(`
        SELECT teacher_id FROM classes WHERE name = ?
      `, [aidaClass[0].class]);

      if (teacher.length > 0) {
        console.log(`👨‍🏫 Professeur de la classe: ID ${teacher[0].teacher_id}`);
        
        // Vérifier les quiz de ce professeur
        const [teacherQuizzes] = await connection.query(`
          SELECT id, title, subject, status, assigned_to
          FROM quizzes 
          WHERE created_by = ? AND status = 'active'
        `, [teacher[0].teacher_id]);

        console.log(`\n📝 Quiz du professeur (${teacherQuizzes.length}):`);
        teacherQuizzes.forEach(quiz => {
          console.log(`   - ${quiz.title} (${quiz.subject}) | Assigné: ${quiz.assigned_to || 'Aucun'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkQuizzes(); 