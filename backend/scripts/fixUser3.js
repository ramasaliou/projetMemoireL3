import { sequelize } from '../config/database.js';

async function fixUser3() {
  try {
    console.log('🔧 Correction de l\'utilisateur ID 3...\n');

    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\n');

    // Mettre à jour l'utilisateur ID 3
    const [updatedRows] = await sequelize.query(`
      UPDATE users 
      SET role = 'teacher', is_active = 1 
      WHERE id = 3
    `);

    if (updatedRows > 0) {
      console.log('✅ Utilisateur ID 3 mis à jour avec succès');
      console.log('   - Rôle: teacher');
      console.log('   - Statut: actif');
    } else {
      console.log('❌ Utilisateur ID 3 non trouvé');
    }

    // Vérifier les informations de l'utilisateur
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, is_active 
      FROM users 
      WHERE id = 3
    `);

    if (users.length > 0) {
      const user = users[0];
      console.log('\n📋 Informations de l\'utilisateur:');
      console.log('   - ID:', user.id);
      console.log('   - Nom:', user.name);
      console.log('   - Email:', user.email);
      console.log('   - Rôle:', user.role);
      console.log('   - Statut:', user.is_active ? 'Actif' : 'Inactif');
      console.log('\n💡 Vous pouvez maintenant vous connecter et créer des cours');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixUser3(); 