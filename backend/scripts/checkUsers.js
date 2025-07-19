import User from '../models/User.js';
import { sequelize } from '../config/database.js';

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base de données...\n');

    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\n');

    // Récupérer tous les utilisateurs
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at']
    });

    console.log(`📊 Nombre total d'utilisateurs: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Vous devez d\'abord exécuter le script de configuration des données');
      return;
    }

    // Afficher les utilisateurs par rôle
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');
    const admins = users.filter(u => u.role === 'admin');

    console.log('👨‍🏫 PROFESSEURS:');
    teachers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.is_active ? 'Actif' : 'Inactif'}`);
    });

    console.log('\n👨‍🎓 ÉLÈVES:');
    students.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.is_active ? 'Actif' : 'Inactif'}`);
    });

    console.log('\n👨‍💼 ADMINISTRATEURS:');
    admins.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.is_active ? 'Actif' : 'Inactif'}`);
    });

    // Suggestions de connexion
    console.log('\n💡 SUGGESTIONS DE CONNEXION:');
    if (teachers.length > 0) {
      const firstTeacher = teachers[0];
      console.log(`  Professeur: ${firstTeacher.email} (mot de passe: password123)`);
    }
    if (students.length > 0) {
      const firstStudent = students[0];
      console.log(`  Élève: ${firstStudent.email} (mot de passe: password123)`);
    }
    if (admins.length > 0) {
      const firstAdmin = admins[0];
      console.log(`  Admin: ${firstAdmin.email} (mot de passe: password123)`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers(); 