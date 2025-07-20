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

async function restoreStudentPassword() {
  try {
    console.log('🔄 Restauration du mot de passe original...');
    
    // Remettre le mot de passe original (probablement "123456" ou similaire)
    const originalPassword = '123456';
    const hashedPassword = await bcrypt.hash(originalPassword, 10);
    
    await sequelize.query('UPDATE Users SET password = ? WHERE email = ?', {
      replacements: [hashedPassword, 'elhadjeleve@virtual-lab.com']
    });
    
    console.log(`✅ Mot de passe restauré: "${originalPassword}"`);
    console.log('📧 Email: elhadjeleve@virtual-lab.com');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

restoreStudentPassword(); 