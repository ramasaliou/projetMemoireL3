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

async function testProfCourses() {
  try {
    console.log('🧪 Test de l\'API /classes/prof...');
    
    // Simuler un élève connecté
    const [students] = await sequelize.query('SELECT id, name, email, class FROM Users WHERE role = "student" AND class = "3ème A" LIMIT 1');
    const student = students[0];
    
    if (!student) {
      console.log('❌ Aucun élève trouvé dans la classe 3ème A');
      return;
    }
    
    console.log('👨‍🎓 Élève test:', student);
    
    // Vérifier la classe de l'élève
    const [classes] = await sequelize.query('SELECT id, name, teacher_id FROM Classes WHERE name = ?', {
      replacements: [student.class]
    });
    
    const studentClass = classes[0];
    if (!studentClass) {
      console.log('❌ Classe de l\'élève non trouvée');
      return;
    }
    
    console.log('📚 Classe de l\'élève:', studentClass);
    
    // Récupérer tous les cours du professeur
    const [profCourses] = await sequelize.query('SELECT id, name, teacher_id, subject, level, resources FROM Classes WHERE teacher_id = ? ORDER BY created_at DESC', {
      replacements: [studentClass.teacher_id]
    });
    
    console.log('📖 Cours du professeur:', profCourses);
    
    // Afficher les détails des ressources
    profCourses.forEach(course => {
      if (course.resources) {
        try {
          const resources = JSON.parse(course.resources);
          console.log(`📄 ${course.name}:`, resources);
        } catch (e) {
          console.log(`📄 ${course.name}: Pas de PDF`);
        }
      } else {
        console.log(`📄 ${course.name}: Pas de PDF`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

testProfCourses(); 