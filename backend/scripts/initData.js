import dotenv from 'dotenv';
import { sequelize, syncModels, createDemoData, createDefaultUser } from '../models/index.js';

dotenv.config();

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initialisation de la base de données...');

    // Synchroniser les modèles
    await syncModels();
    console.log('✅ Modèles synchronisés');

    // Créer l'utilisateur par défaut
    await createDefaultUser();
    console.log('✅ Utilisateur par défaut créé');

    // Créer les données de démonstration
    await createDemoData();
    console.log('✅ Données de démonstration créées');

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📋 Comptes de démonstration disponibles :');
    console.log('👨‍💼 Admin: admin@virtual-lab.com / admin123');
    console.log('👨‍🎓 Étudiant: lewis.diatta@lycee.com / demo123');
    console.log('👨‍🏫 Enseignant: saliou.ndiaye@lycee.com / demo123');
    console.log('👨‍💼 Admin: rama.niang@lycee.com / demo123');

    console.log('\n🔗 API Endpoints disponibles :');
    console.log('📡 http://localhost:5000/api/auth/login');
    console.log('📡 http://localhost:5000/api/simulations');
    console.log('📡 http://localhost:5000/api/tps');
    console.log('📡 http://localhost:5000/api/resources');
    console.log('📡 http://localhost:5000/api/messages');
    console.log('📡 http://localhost:5000/api/news');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Exécuter l'initialisation
initializeDatabase(); 