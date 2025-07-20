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

async function checkStudentQuiz() {
  try {
    // 1. Vérifier les élèves
    const [students] = await sequelize.query('SELECT id, name, email, class, role FROM Users WHERE role = "student" LIMIT 3');
    console.log('ÉLÈVES:', students);

    // 2. Vérifier les classes
    const [classes] = await sequelize.query('SELECT id, name, teacher_id FROM Classes WHERE name LIKE "%3ème%"');
    console.log('CLASSES:', classes);

    // 3. Vérifier les quiz
    const [quizzes] = await sequelize.query('SELECT id, title, status, created_by FROM Quizzes WHERE status = "active"');
    console.log('QUIZ ACTIFS:', quizzes);

    // 4. Simuler la logique de l'API pour un élève
    const studentClass = '3ème A'; // Classe de l'élève
    const classData = classes.find(c => c.name === studentClass);
    console.log('CLASSE TROUVÉE:', classData);

    if (classData && classData.teacher_id) {
      const teacherQuizzes = quizzes.filter(q => q.created_by === classData.teacher_id);
      console.log('QUIZ DU PROF:', teacherQuizzes);
    } else {
      console.log('PROBLÈME: Pas de prof trouvé pour la classe', studentClass);
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit();
  }
}

checkStudentQuiz(); 