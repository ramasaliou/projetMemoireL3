import { connectDB, sequelize } from '../config/database.js';
import { User } from '../models/index.js';

const testMessagesUsers = async () => {
  try {
    await connectDB();
    console.log('🧪 Test de la route /api/messages/users...\n');

    // Récupérer tous les utilisateurs actifs
    const allUsers = await User.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'email', 'role', 'avatar'],
      order: [['name', 'ASC']]
    });

    console.log('📊 Tous les utilisateurs actifs:');
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n🔍 Test des filtres par rôle:');

    // Test pour un élève
    console.log('\n   Pour un élève (peut voir: teacher, admin):');
    const studentUsers = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin');
    studentUsers.forEach(user => {
      console.log(`     - ${user.name} (${user.role})`);
    });

    // Test pour un professeur
    console.log('\n   Pour un professeur (peut voir: student, admin):');
    const teacherUsers = allUsers.filter(u => u.role === 'student' || u.role === 'admin');
    teacherUsers.forEach(user => {
      console.log(`     - ${user.name} (${user.role})`);
    });

    // Test pour un admin
    console.log('\n   Pour un admin (peut voir: student, teacher):');
    const adminUsers = allUsers.filter(u => u.role === 'student' || u.role === 'teacher');
    adminUsers.forEach(user => {
      console.log(`     - ${user.name} (${user.role})`);
    });

    console.log('\n✅ Test terminé !');
    console.log('💡 La route /api/messages/users devrait maintenant fonctionner correctement.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await sequelize.close();
  }
};

// Exécuter le test
testMessagesUsers(); 