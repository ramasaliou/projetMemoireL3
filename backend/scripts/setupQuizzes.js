import { connectDB, sequelize } from '../config/database.js';
import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import { Class } from '../models/index.js';

const setupQuizzes = async () => {
  try {
    console.log('🔗 Connexion à la base de données...');
    await connectDB();
    
    console.log('📝 Création des tables de quiz...');
    
    // Synchroniser les modèles Quiz et QuizResult
    await Quiz.sync({ force: false });
    await QuizResult.sync({ force: false });
    
    console.log('✅ Tables de quiz créées avec succès !');
    
    // Créer quelques quiz de démonstration
    console.log('🎭 Création de quiz de démonstration...');
    
    const demoQuizzes = [
      {
        title: 'Quiz sur la Respiration Cellulaire',
        description: 'Testez vos connaissances sur la respiration cellulaire et les échanges gazeux',
        subject: 'SVT',
        level: '3ème',
        questions: [
          {
            text: 'Quel est le principal gaz consommé lors de la respiration cellulaire ?',
            options: ['Oxygène', 'Dioxyde de carbone', 'Azote', 'Hydrogène'],
            correctAnswer: 0
          },
          {
            text: 'Quel organite cellulaire est responsable de la respiration ?',
            options: ['Noyau', 'Mitochondrie', 'Réticulum endoplasmique', 'Appareil de Golgi'],
            correctAnswer: 1
          },
          {
            text: 'Quel est le produit principal de la respiration cellulaire ?',
            options: ['Glucose', 'ATP', 'Oxygène', 'Eau'],
            correctAnswer: 1
          },
          {
            text: 'La respiration cellulaire est un processus :',
            options: ['Aérobie', 'Anaérobie', 'Les deux', 'Aucun des deux'],
            correctAnswer: 0
          }
        ],
        timeLimit: 15,
        passingScore: 60,
        maxAttempts: 3,
        status: 'active',
        difficulty: 'moyen',
        created_by: 3, // ID du professeur de démonstration
        assigned_to: [5, 6, 7, 8, 9, 10, 11, 12, 13], // IDs des étudiants de démonstration
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans une semaine
        stats: {
          totalAttempts: 0,
          averageScore: 0,
          completionRate: 0,
          totalStudents: 9
        }
      },
      {
        title: 'Quiz sur les Groupes Sanguins',
        description: 'Évaluez votre compréhension des groupes sanguins et de la compatibilité transfusionnelle',
        subject: 'SVT',
        level: '3ème',
        questions: [
          {
            text: 'Combien de groupes sanguins principaux existe-t-il ?',
            options: ['2', '3', '4', '5'],
            correctAnswer: 2
          },
          {
            text: 'Quel groupe sanguin est considéré comme donneur universel ?',
            options: ['A', 'B', 'AB', 'O'],
            correctAnswer: 3
          },
          {
            text: 'Quel groupe sanguin peut recevoir du sang de tous les groupes ?',
            options: ['A', 'B', 'AB', 'O'],
            correctAnswer: 2
          },
          {
            text: 'Les antigènes sont présents sur :',
            options: ['Les globules rouges', 'Les globules blancs', 'Les plaquettes', 'Le plasma'],
            correctAnswer: 0
          },
          {
            text: 'Qu\'est-ce qu\'une réaction d\'agglutination ?',
            options: [
              'Une réaction allergique',
              'Un regroupement de globules rouges',
              'Une coagulation du sang',
              'Une infection'
            ],
            correctAnswer: 1
          }
        ],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 2,
        status: 'active',
        difficulty: 'difficile',
        created_by: 3,
        assigned_to: [5, 6, 7, 8, 9, 10, 11, 12, 13],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans deux semaines
        stats: {
          totalAttempts: 0,
          averageScore: 0,
          completionRate: 0,
          totalStudents: 9
        }
      }
    ];

    for (const quizData of demoQuizzes) {
      const existingQuiz = await Quiz.findOne({
        where: { title: quizData.title }
      });
      
      if (!existingQuiz) {
        await Quiz.create(quizData);
        console.log(`✅ Quiz créé: ${quizData.title}`);
      } else {
        console.log(`⚠️ Quiz déjà existant: ${quizData.title}`);
      }
    }
    
    console.log('🎉 Configuration des quiz terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des quiz:', error);
  } finally {
    await sequelize.close();
    console.log('📊 Connexion MySQL fermée');
    process.exit(0);
  }
};

// Exécuter le script
setupQuizzes(); 

// Script pour créer un quiz de test visible par un élève
(async () => {
  try {
    // Récupérer un élève existant
    const student = await User.findOne({ where: { role: 'student' } });
    if (!student) throw new Error('Aucun élève trouvé');

    // Récupérer la classe de l'élève
    const studentClass = student.class;
    if (!studentClass) throw new Error("L'élève n'a pas de classe");

    // Récupérer la classe et le professeur principal
    const classData = await Class.findOne({ where: { name: studentClass } });
    if (!classData || !classData.teacherId) throw new Error('Aucun professeur principal trouvé pour la classe de l’élève');

    const teacher = await User.findByPk(classData.teacherId);
    if (!teacher) throw new Error('Professeur principal introuvable');

    // Créer un quiz de test
    const quiz = await Quiz.create({
      title: 'Quiz de test automatique',
      description: 'Un quiz de test pour vérifier la visibilité côté élève.',
      subject: 'SVT',
      level: student.level || '3ème',
      questions: [
        {
          text: 'Quelle est la couleur du ciel ?',
          options: ['Bleu', 'Vert', 'Rouge', 'Jaune'],
          correctAnswer: 0
        },
        {
          text: 'Combien de pattes a un chien ?',
          options: ['2', '4', '6', '8'],
          correctAnswer: 1
        }
      ],
      timeLimit: 10,
      passingScore: 50,
      maxAttempts: 3,
      status: 'active',
      assigned_to: null, // Quiz pour toute la classe
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: ['test', 'demo'],
      difficulty: 'facile',
      created_by: teacher.id
    });

    console.log('✅ Quiz de test créé avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de la création du quiz de test :', err);
    process.exit(1);
  }
})(); 