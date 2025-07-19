import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';
import User, { initUser } from './User.js';
import Simulation, { initSimulation } from './Simulation.js';
import TP, { initTP } from './TP.js';
import Result, { initResult } from './Result.js';
import Message, { initMessage } from './Message.js';
import News, { initNews } from './News.js';
import Resource, { initResource } from './Resource.js';
import { initClass } from './Class.js';
import Quiz from './Quiz.js';
import QuizResult from './QuizResult.js';
import SimulationResult, { initSimulationResult } from './SimulationResult.js';

// Initialiser tous les modèles
initUser(sequelize);
initSimulation(sequelize);
initTP(sequelize);
initResult(sequelize);
initMessage(sequelize);
initNews(sequelize);
initResource(sequelize);
initSimulationResult(sequelize);
const Class = initClass(sequelize);

// Définir les associations
// User associations
User.hasMany(Simulation, { foreignKey: 'created_by', as: 'simulations' });
User.hasMany(TP, { foreignKey: 'created_by', as: 'tps' });
User.hasMany(Result, { foreignKey: 'student_id', as: 'results' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
User.hasMany(News, { foreignKey: 'author_id', as: 'news' });
User.hasMany(Resource, { foreignKey: 'created_by', as: 'resources' });
User.hasMany(Quiz, { foreignKey: 'created_by', as: 'quizzes' });
User.hasMany(QuizResult, { foreignKey: 'student_id', as: 'quizResults' });

// Simulation associations
Simulation.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Simulation.hasMany(Result, { foreignKey: 'simulation_id', as: 'results' });

// TP associations
TP.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
TP.hasMany(Result, { foreignKey: 'tp_id', as: 'results' });

// Result associations
Result.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Result.belongsTo(TP, { foreignKey: 'tp_id', as: 'tp' });
Result.belongsTo(Simulation, { foreignKey: 'simulation_id', as: 'simulation' });

// Message associations
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// News associations
News.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Resource associations
Resource.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Quiz associations
Quiz.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Quiz.hasMany(QuizResult, { foreignKey: 'quiz_id', as: 'results' });

// QuizResult associations
QuizResult.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
QuizResult.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

// SimulationResult associations
SimulationResult.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasMany(SimulationResult, { foreignKey: 'student_id', as: 'simulationResults' });

// Class associations
Class.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
User.hasMany(Class, { foreignKey: 'teacherId', as: 'classes' });

// Fonction pour synchroniser tous les modèles
export const syncModels = async () => {
  try {
    // Désactiver la synchronisation automatique pour éviter l'erreur de trop d'index
    // await sequelize.sync({ alter: true });
    console.log('🔄 Synchronisation automatique désactivée pour éviter l\'erreur de trop d\'index');
    console.log('📝 Les tables existent déjà, pas de modification automatique');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    // Ne pas faire échouer l'application à cause de cette erreur
    console.log('⚠️ Continuation sans synchronisation automatique');
  }
};

// Fonction pour créer les données de démonstration
export const createDemoData = async () => {
  try {
    // Vérifier si des données existent déjà
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('📊 Des données existent déjà, pas de création de données de démonstration');
      return;
    }

    console.log('🎭 Création des données de démonstration...');

    // Créer l'utilisateur par défaut en premier
    const defaultUser = await User.createDefaultUser();
    console.log('👤 Utilisateur par défaut créé:', defaultUser.email);

    // Créer les utilisateurs de démonstration
    const demoStudent = await User.createDemoUser('student');
    const demoTeacher = await User.createDemoUser('teacher');
    const demoAdmin = await User.createDemoUser('admin');

    console.log('👥 Utilisateurs de démonstration créés');

    // Créer des classes de démonstration et assigner le professeur
    const demoClass = await Class.createDemoClass(demoTeacher.id, 0);
    console.log('🏫 Classe de démonstration créée:', demoClass.name);

    // Assigner la classe au professeur
    await demoTeacher.update({ class: demoClass.name });
    console.log('👨‍🏫 Professeur assigné à la classe:', demoClass.name);

    // Créer plus d'étudiants de démonstration et les assigner à la classe
    const demoStudents = [demoStudent];
    const studentNames = [
      'Cheikh Diop',
      'Fatou Diop', 
      'Amadou Ba',
      'Aïssatou Sow',
      'Moussa Ndiaye',
      'Mariama Diallo',
      'Ousmane Camara',
      'Kadiatou Barry'
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const student = await User.create({
        name: studentNames[i],
        email: `etudiant${i + 2}@lycee.com`,
        password: 'demo123',
        role: 'student',
        class: demoClass.name,
        level: '3ème',
        avatar: `https://images.pexels.com/photos/${774909 + i}/pexels-photo-${774909 + i}.jpeg?auto=compress&cs=tinysrgb&w=150`
      });
      demoStudents.push(student);
    }

    console.log('👨‍🎓 Étudiants de démonstration créés et assignés à la classe:', demoClass.name);

    // Créer les simulations de démonstration
    const types = ['respiration', 'agglutination', 'hiv-aids', 'fermentation', 'la degradation des elemets radioactifs'];
    const demoSimulations = [];

    for (const type of types) {
      const simulation = await Simulation.createDemoSimulation(type, demoTeacher.id);
      demoSimulations.push(simulation);
    }

    console.log('🔬 Simulations de démonstration créées');

    // Créer les TP de démonstration
    const demoTps = [];
    const tpTitles = [
      'Respiration Cellulaire et Échanges Gazeux',
      'Groupes Sanguins et Compatibilité Transfusionnelle',
      'VIH/SIDA et Système Immunitaire',
      'Fermentation Alcoolique',
      'Dégradation des Éléments Radioactifs'
    ];

    for (let i = 0; i < tpTitles.length; i++) {
      const tp = await TP.createDemoTP(demoTeacher.id, tpTitles[i], i);
      demoTps.push(tp);
    }

    console.log('📚 TP de démonstration créés');

    // Créer les ressources de démonstration
    const resourceTypes = ['pdf', 'video', 'audio', 'image'];
    const demoResources = [];

    for (const type of resourceTypes) {
      const resource = await Resource.createDemoResource(type, demoTeacher.id);
      demoResources.push(resource);
    }

    console.log('📖 Ressources de démonstration créées');

    // Créer des résultats de démonstration pour tous les étudiants
    const demoResults = [];
    for (let i = 0; i < demoTps.length; i++) {
      for (let j = 0; j < demoStudents.length; j++) {
        const result = await Result.create({
          student_id: demoStudents[j].id,
          tp_id: demoTps[i].id,
          simulation_id: demoSimulations[i].id,
          quiz_results: {
            score: Math.floor(Math.random() * 30) + 70, // 70-100
            total_questions: 10,
            correct_answers: Math.floor(Math.random() * 8) + 7, // 7-10
            time_spent: Math.floor(Math.random() * 300) + 600, // 10-15 minutes
            answers: []
          },
          simulation_results: {
            completed: true,
            time_spent: Math.floor(Math.random() * 600) + 1200, // 20-30 minutes
            steps_completed: ['step1', 'step2', 'step3'],
            observations: ['Observation 1', 'Observation 2']
          },
          overall_score: Math.floor(Math.random() * 25) + 75, // 75-100
          status: 'completed',
          teacher_feedback: {
            comment: 'Excellent travail !',
            grade: 'A',
            feedback_at: new Date()
          },
          started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Dernière semaine
          completed_at: new Date()
        });
        demoResults.push(result);
      }
    }

    console.log('📊 Résultats de démonstration créés');

    // Créer des messages de démonstration
    const demoMessages = [
      {
        sender_id: demoTeacher.id,
        receiver_id: demoStudents[0].id,
        subject: 'Félicitations pour votre TP sur la respiration',
        content: 'Bonjour, je tenais à vous féliciter pour votre excellent travail sur le TP de respiration cellulaire. Votre score de 85% démontre une bonne compréhension des concepts. Continuez ainsi !',
        message_type: 'feedback',
        priority: 'normal',
        read: false,
        starred: true
      },
      {
        sender_id: demoStudents[1].id,
        receiver_id: demoTeacher.id,
        subject: 'Question sur le TP Groupes Sanguins',
        content: 'Bonjour Professeur, j\'ai une question concernant la partie sur les réactions d\'agglutination. Pourriez-vous m\'expliquer la différence entre les antigènes et les anticorps ?',
        message_type: 'question',
        priority: 'normal',
        read: false,
        starred: false
      }
    ];

    for (const messageData of demoMessages) {
      await Message.create(messageData);
    }

    console.log('💬 Messages de démonstration créés');

    // Créer des actualités de démonstration
    const demoNews = [
      {
        title: 'Nouveau TP disponible : Système Immunitaire et VIH/SIDA',
        content: 'Un nouveau TP interactif sur le système immunitaire et l\'impact du VIH/SIDA est maintenant disponible. Ce TP comprend une simulation avancée et un quiz d\'évaluation.',
        type: 'info',
        author_id: demoTeacher.id,
        pinned: true,
        target_audience: 'students',
        views: 45,
        tags: ['nouveau', 'tp', 'immunologie']
      },
      {
        title: 'Rappel : Échéance TP Groupes Sanguins',
        content: 'N\'oubliez pas que le TP sur les groupes sanguins et l\'agglutination doit être terminé avant le 20 février 2024.',
        type: 'reminder',
        author_id: demoTeacher.id,
        pinned: false,
        target_audience: 'students',
        views: 32,
        tags: ['rappel', 'échéance']
      },
      {
        title: 'Maintenance programmée de la plateforme',
        content: 'Une maintenance technique aura lieu ce dimanche de 2h à 4h du matin. La plateforme sera temporairement indisponible.',
        type: 'urgent',
        author_id: demoAdmin.id,
        pinned: false,
        target_audience: 'all',
        views: 78,
        tags: ['maintenance', 'technique']
      }
    ];

    for (const newsData of demoNews) {
      await News.create(newsData);
    }

    console.log('📰 Actualités de démonstration créées');

    console.log('✅ Toutes les données de démonstration ont été créées avec succès !');
    console.log('\n📋 Comptes de démonstration :');
    console.log(`👨‍🎓 Étudiant: ${demoStudent.email} / demo123`);
    console.log(`👨‍🏫 Enseignant: ${demoTeacher.email} / demo123 (Classe: ${demoClass.name})`);
    console.log(`👨‍💼 Admin: ${demoAdmin.email} / demo123`);
    console.log(`🏫 Classe créée: ${demoClass.name} avec ${demoStudents.length} étudiants`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des données de démonstration:', error);
    throw error;
  }
};

// Fonction pour créer l'utilisateur par défaut
export const createDefaultUser = async () => {
  try {
    const existingUser = await User.findOne({ where: { email: 'admin@virtual-lab.com' } });
    if (existingUser) {
      console.log('👤 Utilisateur par défaut existe déjà');
      return existingUser;
    }

    const defaultUser = await User.create({
      name: 'Administrateur Virtual Lab',
      email: 'admin@virtual-lab.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'active'
    });

    console.log('👤 Utilisateur par défaut créé:', defaultUser.email);
    return defaultUser;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur par défaut:', error);
    throw error;
  }
};

export {
  User,
  Simulation,
  TP,
  Result,
  Message,
  News,
  Resource,
  Class,
  SimulationResult,
  Quiz,
  QuizResult
};
export default { User, Simulation, TP, Result, Message, News, Resource, Class, SimulationResult, Quiz, QuizResult, syncModels, createDemoData, createDefaultUser }; 