import { connectDB, sequelize } from '../config/database.js';
import { User, Message } from '../models/index.js';

const setupMessages = async () => {
  try {
    await connectDB();
    console.log('🔧 Configuration des données de messagerie...\n');

    // Récupérer les utilisateurs existants
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email']
    });

    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'name', 'email']
    });

    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'name', 'email']
    });

    console.log(`📊 Utilisateurs trouvés:`);
    console.log(`   - Élèves: ${students.length}`);
    console.log(`   - Professeurs: ${teachers.length}`);
    console.log(`   - Admins: ${admins.length}\n`);

    if (students.length === 0 || teachers.length === 0) {
      console.log('❌ Pas assez d\'utilisateurs pour créer des messages');
      return;
    }

    // Supprimer les messages existants
    await Message.destroy({ where: {} });
    console.log('🗑️ Messages existants supprimés\n');

    // Créer des messages de test
    const messages = [];

    // Messages d'élèves vers professeurs
    students.forEach((student, index) => {
      const teacher = teachers[index % teachers.length];
      
      messages.push({
        sender_id: student.id,
        receiver_id: teacher.id,
        subject: 'Question sur le TP Respiration Cellulaire',
        content: `Bonjour ${teacher.name}, j'ai une question concernant la partie sur les échanges gazeux dans le TP de respiration cellulaire. Pourriez-vous m'expliquer la différence entre la respiration cellulaire et la ventilation pulmonaire ?`,
        message_type: 'question',
        priority: 'normal',
        read: false,
        starred: false,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Dernière semaine
      });

      messages.push({
        sender_id: teacher.id,
        receiver_id: student.id,
        subject: 'Réponse à votre question',
        content: `Bonjour ${student.name}, excellente question ! La respiration cellulaire est un processus biochimique qui se déroule dans les mitochondries et produit de l'ATP, tandis que la ventilation pulmonaire est le mouvement mécanique d'air dans et hors des poumons. Les deux sont liés mais distincts.`,
        message_type: 'general',
        priority: 'normal',
        read: true,
        starred: false,
        created_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) // Derniers 3 jours
      });
    });

    // Messages d'administration
    if (admins.length > 0) {
      teachers.forEach((teacher) => {
        messages.push({
          sender_id: admins[0].id,
          receiver_id: teacher.id,
          subject: 'Rapport mensuel des résultats',
          content: `Bonjour ${teacher.name}, voici le rapport mensuel des résultats de votre classe. La moyenne générale est de 78%, en progression de 3% par rapport au mois dernier. Continuez votre excellent travail !`,
          message_type: 'announcement',
          priority: 'normal',
          read: false,
          starred: true,
          created_at: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) // Derniers 2 jours
        });
      });
    }

    // Messages entre élèves
    for (let i = 0; i < Math.min(students.length, 3); i++) {
      const student1 = students[i];
      const student2 = students[(i + 1) % students.length];
      
      messages.push({
        sender_id: student1.id,
        receiver_id: student2.id,
        subject: 'Aide pour le TP',
        content: `Salut ! Tu as réussi la partie sur les groupes sanguins ? J'ai un peu de mal avec l'interprétation des résultats.`,
        message_type: 'question',
        priority: 'normal',
        read: false,
        starred: false,
        created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Dernière journée
      });
    }

    // Insérer tous les messages
    await Message.bulkCreate(messages);

    console.log(`✅ ${messages.length} messages créés avec succès !\n`);

    // Afficher quelques statistiques
    const totalMessages = await Message.count();
    const unreadMessages = await Message.count({ where: { read: false } });
    const starredMessages = await Message.count({ where: { starred: true } });

    console.log('📈 Statistiques des messages:');
    console.log(`   - Total: ${totalMessages}`);
    console.log(`   - Non lus: ${unreadMessages}`);
    console.log(`   - Favoris: ${starredMessages}\n`);

    console.log('🎉 Configuration de la messagerie terminée !');
    console.log('💡 Vous pouvez maintenant tester la messagerie dans l\'application.');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration des messages:', error);
  } finally {
    await sequelize.close();
  }
};

// Exécuter le script
setupMessages(); 