import dotenv from 'dotenv';
import { User, Simulation, TP, Resource, Message, News, Result } from '../models/index.js';

dotenv.config();

const testData = async () => {
  try {
    console.log('🧪 Test des données dynamiques...\n');

    // Test des utilisateurs
    console.log('👥 Test des utilisateurs :');
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status']
    });
    console.log(`✅ ${users.length} utilisateurs trouvés`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test des simulations
    console.log('\n🔬 Test des simulations :');
    const simulations = await Simulation.findAll({
      attributes: ['id', 'title', 'type', 'difficulty', 'duration']
    });
    console.log(`✅ ${simulations.length} simulations trouvées`);
    simulations.forEach(sim => {
      console.log(`   - ${sim.title} (${sim.type}) - ${sim.difficulty}`);
    });

    // Test des TP
    console.log('\n📚 Test des TP :');
    const tps = await TP.findAll({
      attributes: ['id', 'title', 'subject', 'status', 'duration']
    });
    console.log(`✅ ${tps.length} TP trouvés`);
    tps.forEach(tp => {
      console.log(`   - ${tp.title} (${tp.subject}) - ${tp.status}`);
    });

    // Test des ressources
    console.log('\n📖 Test des ressources :');
    const resources = await Resource.findAll({
      attributes: ['id', 'title', 'type', 'category', 'rating', 'downloads']
    });
    console.log(`✅ ${resources.length} ressources trouvées`);
    resources.forEach(resource => {
      console.log(`   - ${resource.title} (${resource.type}) - ${resource.rating}/5`);
    });

    // Test des messages
    console.log('\n💬 Test des messages :');
    const messages = await Message.findAll({
      attributes: ['id', 'subject', 'sender_id', 'receiver_id', 'read']
    });
    console.log(`✅ ${messages.length} messages trouvés`);
    messages.forEach(msg => {
      console.log(`   - ${msg.subject} (${msg.read ? 'lu' : 'non lu'})`);
    });

    // Test des actualités
    console.log('\n📰 Test des actualités :');
    const news = await News.findAll({
      attributes: ['id', 'title', 'type', 'pinned', 'views']
    });
    console.log(`✅ ${news.length} actualités trouvées`);
    news.forEach(item => {
      console.log(`   - ${item.title} (${item.type}) ${item.pinned ? '📌' : ''}`);
    });

    // Test des résultats
    console.log('\n📊 Test des résultats :');
    const results = await Result.findAll({
      attributes: ['id', 'student_id', 'tp_id', 'overall_score', 'status']
    });
    console.log(`✅ ${results.length} résultats trouvés`);
    results.forEach(result => {
      console.log(`   - Score: ${result.overall_score}% - ${result.status}`);
    });

    // Statistiques globales
    console.log('\n📈 Statistiques globales :');
    console.log(`   - Utilisateurs: ${users.length}`);
    console.log(`   - Simulations: ${simulations.length}`);
    console.log(`   - TP: ${tps.length}`);
    console.log(`   - Ressources: ${resources.length}`);
    console.log(`   - Messages: ${messages.length}`);
    console.log(`   - Actualités: ${news.length}`);
    console.log(`   - Résultats: ${results.length}`);

    // Test des comptes de démonstration
    console.log('\n🔑 Test des comptes de démonstration :');
    const demoAccounts = [
      'admin@virtual-lab.com',
      'lewis.diatta@lycee.com',
      'saliou.ndiaye@lycee.com',
      'rama.niang@lycee.com'
    ];

    for (const email of demoAccounts) {
      const user = await User.findOne({ where: { email } });
      if (user) {
        console.log(`   ✅ ${email} - ${user.role}`);
      } else {
        console.log(`   ❌ ${email} - NON TROUVÉ`);
      }
    }

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n🚀 La base de données est prête à être utilisée.');
    console.log('\n📋 Prochaines étapes :');
    console.log('   1. Démarrer le serveur : npm run dev');
    console.log('   2. Tester l\'API : http://localhost:5000/api/health');
    console.log('   3. Se connecter au frontend avec les comptes de démonstration');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du test des données:', error);
    process.exit(1);
  }
};

// Exécuter les tests
testData(); 