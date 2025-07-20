import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT
  }
);

async function fixQuizVisibility() {
  try {
    console.log('🔍 Vérification des quiz...');
    
    // Vérifier la structure de la table Quizzes
    const [columns] = await sequelize.query('DESCRIBE Quizzes');
    console.log('📋 Colonnes de la table Quizzes:', columns.map(c => c.Field));
    
    // Vérifier les quiz actifs
    const [quizzes] = await sequelize.query('SELECT id, title, status, created_by FROM Quizzes WHERE status = "active"');
    console.log('📝 Quiz actifs:', quizzes);
    
    // Vérifier l'élève
    const [students] = await sequelize.query('SELECT id, name, email, class FROM Users WHERE role = "student" AND email = "aidaeleve@virtual-lab.com"');
    const student = students[0];
    console.log('👨‍🎓 Élève:', student);
    
    // Vérifier la route des quiz pour les élèves
    console.log('🔍 Vérification de la logique des quiz...');
    
    // Les quiz devraient être visibles pour tous les élèves du professeur
    // Vérifier si le professeur a des quiz
    const [profQuizzes] = await sequelize.query('SELECT id, title, status, created_by FROM Quizzes WHERE created_by = 3 AND status = "active"');
    console.log('👨‍🏫 Quiz du professeur weydee Hector:', profQuizzes);
    
    if (profQuizzes.length === 0) {
      console.log('❌ Aucun quiz trouvé pour le professeur weydee Hector');
    } else {
      console.log('✅ Quiz trouvés, ils devraient être visibles pour l\'élève');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

fixQuizVisibility(); 