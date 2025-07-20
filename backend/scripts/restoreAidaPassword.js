import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { User } from '../models/index.js';

const restoreAidaPassword = async () => {
  try {
    console.log('🔧 Restauration du mot de passe d\'Aida Niang...');

    // Trouver l'utilisateur Aida Niang
    const user = await User.findOne({
      where: {
        email: 'aida.niang@virtual-lab.com'
      }
    });

    if (!user) {
      console.log('❌ Utilisateur Aida Niang non trouvé');
      console.log('🔍 Recherche d\'autres utilisateurs avec le nom "aida"...');
      
      const aidaUsers = await User.findAll({
        where: {
          name: {
            [sequelize.Op.like]: '%aida%'
          }
        }
      });

      if (aidaUsers.length === 0) {
        console.log('❌ Aucun utilisateur avec le nom "aida" trouvé');
        console.log('📋 Liste de tous les utilisateurs :');
        const allUsers = await User.findAll({
          attributes: ['id', 'name', 'email', 'role']
        });
        allUsers.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.role}`));
        return;
      }

      console.log('👥 Utilisateurs trouvés avec "aida" :');
      aidaUsers.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.role}`));
      
      // Utiliser le premier utilisateur trouvé
      const aidaUser = aidaUsers[0];
      console.log(`✅ Utilisation de : ${aidaUser.name} (${aidaUser.email})`);
      
      // Restaurer le mot de passe
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('demo123', salt);
      
      await aidaUser.update({
        password: hashedPassword
      });

      console.log('✅ Mot de passe restauré avec succès !');
      console.log('🔑 Nouveau mot de passe : demo123');
      console.log(`👤 Utilisateur : ${aidaUser.name} (${aidaUser.email})`);
      
    } else {
      console.log(`✅ Utilisateur trouvé : ${user.name} (${user.email})`);
      
      // Restaurer le mot de passe
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('demo123', salt);
      
      await user.update({
        password: hashedPassword
      });

      console.log('✅ Mot de passe restauré avec succès !');
      console.log('🔑 Nouveau mot de passe : demo123');
      console.log(`👤 Utilisateur : ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Restauration terminée !');
    console.log('💡 Tu peux maintenant te connecter avec :');
    console.log('   Email : aida.niang@virtual-lab.com');
    console.log('   Mot de passe : demo123');

  } catch (error) {
    console.error('❌ Erreur lors de la restauration du mot de passe:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Exécuter le script
restoreAidaPassword(); 