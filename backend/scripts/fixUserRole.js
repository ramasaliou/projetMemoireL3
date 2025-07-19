import User from '../models/User.js';
import { sequelize } from '../config/database.js';

async function fixUserRole() {
  try {
    console.log('🔧 Vérification et correction du rôle utilisateur...\n');

    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\n');

    // Récupérer l'utilisateur ID 3 (qui semble être connecté d'après les logs)
    const user = await User.findByPk(3);
    
    if (!user) {
      console.log('❌ Utilisateur ID 3 non trouvé');
      return;
    }

    console.log('👤 Utilisateur trouvé:');
    console.log('  - ID:', user.id);
    console.log('  - Nom:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Rôle actuel:', user.role);
    console.log('  - Statut:', user.is_active ? 'Actif' : 'Inactif');
    console.log('');

    // Vérifier si l'utilisateur a le bon rôle pour créer des TP
    if (user.role !== 'teacher' && user.role !== 'admin') {
      console.log('⚠️  L\'utilisateur n\'a pas le rôle "teacher" ou "admin"');
      console.log('🔄 Mise à jour du rôle vers "teacher"...');
      
      await user.update({ role: 'teacher' });
      console.log('✅ Rôle mis à jour vers "teacher"');
    } else {
      console.log('✅ L\'utilisateur a déjà le bon rôle');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.is_active) {
      console.log('⚠️  L\'utilisateur est inactif');
      console.log('🔄 Activation de l\'utilisateur...');
      
      await user.update({ is_active: true });
      console.log('✅ Utilisateur activé');
    } else {
      console.log('✅ L\'utilisateur est déjà actif');
    }

    // Afficher les informations finales
    await user.reload();
    console.log('\n📋 Informations finales:');
    console.log('  - ID:', user.id);
    console.log('  - Nom:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Rôle:', user.role);
    console.log('  - Statut:', user.is_active ? 'Actif' : 'Inactif');
    console.log('');

    console.log('💡 Vous pouvez maintenant vous connecter avec cet utilisateur et créer des TP');
    console.log('   Email:', user.email);
    console.log('   Mot de passe: password123');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixUserRole(); 