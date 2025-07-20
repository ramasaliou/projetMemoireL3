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

async function fixStudentClass() {
  try {
    // 1. Vérifier si la classe 3ème A existe
    const [existingClass] = await sequelize.query('SELECT * FROM Classes WHERE name = "3ème A"');
    console.log('CLASSE 3ème A EXISTANTE:', existingClass);

    if (existingClass.length === 0) {
      // 2. Créer la classe 3ème A avec teacher_id = 3 (le prof qui a créé les quiz)
      await sequelize.query(`
        INSERT INTO Classes (name, level, subject, teacher_id, status, created_at, updated_at) 
        VALUES ('3ème A', '3ème', 'SVT', 3, 'active', NOW(), NOW())
      `);
      console.log('✅ Classe 3ème A créée avec teacher_id = 3');
    } else {
      console.log('⚠️ Classe 3ème A existe déjà');
    }

    // 3. Vérifier le résultat
    const [classes] = await sequelize.query('SELECT * FROM Classes WHERE name LIKE "%3ème%"');
    console.log('CLASSES APRÈS CORRECTION:', classes);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit();
  }
}

fixStudentClass(); 