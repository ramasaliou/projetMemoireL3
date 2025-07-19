import { sequelize } from '../config/database.js';

async function fixWeydeRole() {
  try {
    console.log('🔧 Correction du rôle de l\'utilisateur weyde...\\n');

    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\\n');

    // Mettre à jour l'utilisateur weyde avec le rôle teacher
    const [updatedRows] = await sequelize.query(`
      UPDATE users 
      SET role = 'teacher', is_active = 1 
      WHERE email = 'weydeprof@virtual-lab.com'
    `);

    if (updatedRows > 0) {
      console.log('✅ Utilisateur weyde mis à jour avec succès');
      console.log('   - Rôle: teacher (professeur)');
      console.log('   - Statut: actif');
    } else {
      console.log('❌ Utilisateur weyde non trouvé');
    }

    // Vérifier les informations de l'utilisateur
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, is_active 
      FROM users 
      WHERE email = 'weydeprof@virtual-lab.com'
    `);

    if (users.length > 0) {
      const user = users[0];
      console.log('\\n👤 Informations de l\'utilisateur weyde:');
      console.log('   - ID:', user.id);
      console.log('   - Nom:', user.name);
      console.log('   - Email:', user.email);
      console.log('   - Rôle:', user.role);
      console.log('   - Statut:', user.is_active ? 'actif' : 'inactif');
    }

    console.log('\\n🎯 Maintenant weyde peut:');
    console.log('   - Se connecter en tant que professeur');
    console.log('   - Accéder à l\'interface professeur');
    console.log('   - Créer et gérer ses cours');
    console.log('   - Voir ses élèves');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixWeydeRole(); 