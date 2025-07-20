import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

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

async function checkStudentPassword() {
  try {
    console.log('🔍 Vérification du mot de passe de l\'élève...');
    
    // Récupérer l'élève
    const [students] = await sequelize.query('SELECT id, name, email, password FROM Users WHERE role = "student" AND email = "elhadjeleve@virtual-lab.com"');
    const student = students[0];
    
    if (!student) {
      console.log('❌ Élève non trouvé');
      return;
    }
    
    console.log('👨‍🎓 Élève trouvé:', {
      id: student.id,
      name: student.name,
      email: student.email,
      hasPassword: !!student.password
    });
    
    // Tester différents mots de passe
    const testPasswords = ['password123', '123456', 'password', 'elhadj123', 'student123'];
    
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, student.password);
      console.log(`🔐 Test "${testPassword}": ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
      
      if (isValid) {
        console.log(`✅ Mot de passe correct trouvé: "${testPassword}"`);
        break;
      }
    }
    
    // Si aucun mot de passe ne fonctionne, créer un nouveau
    console.log('\n🔄 Création d\'un nouveau mot de passe...');
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await sequelize.query('UPDATE Users SET password = ? WHERE id = ?', {
      replacements: [hashedPassword, student.id]
    });
    
    console.log(`✅ Nouveau mot de passe créé: "${newPassword}"`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkStudentPassword(); 