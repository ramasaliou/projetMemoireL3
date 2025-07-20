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

async function checkQuizVisibility() {
  try {
    console.log('🔍 Vérification de la visibilité des quiz...');
    
    // Vérifier l'élève
    const [students] = await sequelize.query('SELECT id, name, email, class FROM Users WHERE role = "student" AND email = "aidaeleve@virtual-lab.com"');
    const student = students[0];
    
    if (!student) {
      console.log('❌ Élève non trouvé');
      return;
    }
    
    console.log('👨‍🎓 Élève:', student);
    
    // Vérifier tous les quiz actifs
    const [quizzes] = await sequelize.query('SELECT id, title, status, created_by, assigned_class FROM Quizzes WHERE status = "active"');
    console.log('📝 Quiz actifs:', quizzes);
    
    // Vérifier les quiz créés par le professeur weydee Hector (ID: 3)
    const [profQuizzes] = await sequelize.query('SELECT id, title, status, created_by, assigned_class FROM Quizzes WHERE created_by = 3 AND status = "active"');
    console.log('👨‍🏫 Quiz du professeur weydee Hector:', profQuizzes);
    
    // Vérifier la classe de l'élève
    const [classes] = await sequelize.query('SELECT id, name, teacher_id FROM Classes WHERE name = ?', {
      replacements: [student.class]
    });
    
    const studentClass = classes[0];
    console.log('🏫 Classe de l\'élève:', studentClass);
    
    // Vérifier si les quiz sont assignés à la bonne classe
    profQuizzes.forEach(quiz => {
      console.log(`Quiz "${quiz.title}":`);
      console.log(`  - Assigned class: ${quiz.assigned_class}`);
      console.log(`  - Student class: ${student.class}`);
      console.log(`  - Visible: ${!quiz.assigned_class || quiz.assigned_class === student.class}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkQuizVisibility(); 