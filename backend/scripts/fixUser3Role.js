import { sequelize } from '../config/database.js';

async function fixUser3Role() {
  try {
    console.log('🔧 Correction du rôle de l\'utilisateur ID 3...\\n');

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\\n');

    // Mettre à jour l'utilisateur ID 3 avec le rôle teacher
    const [updatedRows] = await sequelize.query(`
      UPDATE users 
      SET role = 'teacher', is_active = 1 
      WHERE id = 3
    `);

    if (updatedRows > 0) {
      console.log('✅ Utilisateur ID 3 mis à jour avec succès');
      console.log('   - Rôle: teacher (professeur)');
      console.log('   - Statut: actif');
    } else {
      console.log('❌ Utilisateur ID 3 non trouvé');
    }

    // Vérifier
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, is_active 
      FROM users 
      WHERE id = 3
    `);

    if (users.length > 0) {
      const user = users[0];
      console.log('\\n👤 Informations de l\'utilisateur:');
      console.log('   - ID:', user.id);
      console.log('   - Nom:', user.name);
      console.log('   - Email:', user.email);
      console.log('   - Rôle:', user.role);
      console.log('   - Statut:', user.is_active ? 'actif' : 'inactif');
    }

    console.log('\\n🎯 Maintenant vous pouvez:');
    console.log('   - Ajouter des cours dans "Mes cours"');
    console.log('   - Modifier vos cours existants');
    console.log('   - Tout sera dynamique et connecté au backend');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixUser3Role(); 