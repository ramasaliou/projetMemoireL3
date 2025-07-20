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

async function checkAndFixClasses() {
  try {
    console.log('🔍 Vérification des classes...');
    
    // Vérifier les classes existantes
    const [classes] = await sequelize.query('SELECT id, name, teacher_id, subject, level FROM Classes ORDER BY id');
    console.log('📚 CLASSES EXISTANTES:', classes);
    
    // Vérifier les professeurs
    const [teachers] = await sequelize.query('SELECT id, name, email FROM Users WHERE role = "teacher"');
    console.log('👨‍🏫 PROFESSEURS:', teachers);
    
    // Vérifier les élèves et leurs classes
    const [students] = await sequelize.query('SELECT id, name, email, class FROM Users WHERE role = "student"');
    console.log('👨‍🎓 ÉLÈVES:', students);
    
    // Chercher la classe "3ème A"
    const classe3emeA = classes.find(c => c.name === '3ème A');
    
    if (!classe3emeA) {
      console.log('❌ Classe "3ème A" manquante !');
      
      // Trouver un professeur pour l'assigner
      const teacher = teachers.find(t => t.name.includes('weyde') || t.name.includes('Hector'));
      if (!teacher) {
        console.log('❌ Aucun professeur trouvé pour assigner à la classe 3ème A');
        return;
      }
      
      console.log(`✅ Création de la classe "3ème A" avec le professeur ${teacher.name}...`);
      
      // Créer la classe 3ème A
      await sequelize.query(`
        INSERT INTO Classes (name, level, subject, teacher_id, max_students, description, room, academic_year, current_students, average_score, completion_rate, status, created_at, updated_at)
        VALUES ('3ème A', '3ème', 'SVT', ${teacher.id}, 30, 'Classe de 3ème A - Sciences de la Vie et de la Terre', 'Salle 101', '2023-2024', 0, 0.00, 0.00, 'active', NOW(), NOW())
      `);
      
      console.log('✅ Classe "3ème A" créée avec succès !');
    } else {
      console.log('✅ Classe "3ème A" existe déjà');
    }
    
    // Vérifier à nouveau
    const [newClasses] = await sequelize.query('SELECT id, name, teacher_id, subject, level FROM Classes ORDER BY id');
    console.log('📚 CLASSES APRÈS CORRECTION:', newClasses);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkAndFixClasses(); 