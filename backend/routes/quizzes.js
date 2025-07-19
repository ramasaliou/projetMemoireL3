import express from 'express';
import { body, validationResult } from 'express-validator';
import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import { protect, teacherOnly } from '../middleware/auth.js';
import { Op } from 'sequelize';
import { Class } from '../models/index.js';

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Obtenir tous les quiz (selon le rôle)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      status,
      subject,
      level,
      createdBy,
      limit = 20,
      page = 1
    } = req.query;

    let whereClause = {};

    if (req.user.role === 'student') {
      // Récupérer les classes de l'élève
      const student = await User.findByPk(req.user.id);
      let profIds = [];
      if (student && student.class) {
        const classData = await Class.findOne({ where: { name: student.class } });
        if (classData && classData.teacherId) {
          profIds = [classData.teacherId];
        }
      }
      
      // Les étudiants voient les quiz actifs créés par leur professeur principal
      whereClause = {
        status: 'active',
        created_by: profIds.length > 0 ? profIds[0] : -1
      };
    } else if (req.user.role === 'teacher') {
      // Les enseignants voient leurs propres quiz
      whereClause.created_by = req.user.id;
    }
    // Les admins voient tous les quiz

    if (status) whereClause.status = status;
    if (subject) whereClause.subject = subject;
    if (level) whereClause.level = level;
    if (createdBy) whereClause.created_by = createdBy;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Inclure les questions dans la réponse
    const quizzes = await Quiz.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email', 'subject']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Ajouter les questions (si elles ne sont pas déjà incluses)
    const quizzesWithQuestions = quizzes.map(q => {
      const quiz = q.toJSON();
      // Si les questions sont stockées en JSON dans un champ 'questions'
      if (typeof quiz.questions === 'string') {
        try {
          quiz.questions = JSON.parse(quiz.questions);
        } catch (e) {
          quiz.questions = [];
        }
      }
      return quiz;
    });

    const total = await Quiz.count({ where: whereClause });

    res.json({
      success: true,
      data: {
        quizzes: quizzesWithQuestions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les quiz'
    });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Obtenir un quiz par ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email', 'subject']
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({
        error: 'Quiz non trouvé',
        message: 'Le quiz demandé n\'existe pas'
      });
    }

    // Nouvelle logique d'autorisation (comme pour /start)
    let isAllowed = false;
    if (req.user.role === 'student') {
      if (Array.isArray(quiz.assigned_to) && quiz.assigned_to.includes(req.user.id)) {
        isAllowed = true;
      } else {
        const student = await User.findByPk(req.user.id);
        if (student && student.class) {
          const classData = await Class.findOne({ where: { name: student.class } });
          if (classData && quiz.created_by === classData.teacherId && (!quiz.assigned_to || quiz.assigned_to.length === 0)) {
            isAllowed = true;
          }
        }
      }
      if (!isAllowed) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Ce quiz ne vous est pas assigné'
        });
      }
    } else if (req.user.role === 'teacher' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour voir ce quiz'
      });
    }

    res.json({
      success: true,
      data: { quiz }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le quiz'
    });
  }
});

// @route   POST /api/quizzes
// @desc    Créer un nouveau quiz
// @access  Private (Enseignants et Admins)
router.post('/', protect, teacherOnly, [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Le titre doit contenir entre 5 et 100 caractères'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('La description doit contenir entre 10 et 500 caractères'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('La matière est requise'),
  body('level')
    .isIn(['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'])
    .withMessage('Niveau invalide'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('Au moins une question est requise'),
  body('timeLimit')
    .isInt({ min: 5, max: 180 })
    .withMessage('La limite de temps doit être entre 5 et 180 minutes'),
  body('passingScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Le score de passage doit être entre 0 et 100'),
  body('maxAttempts')
    .isInt({ min: 1, max: 10 })
    .withMessage('Le nombre maximum de tentatives doit être entre 1 et 10')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const quizData = {
      ...req.body,
      created_by: req.user.id
    };

    const quiz = await Quiz.create(quizData);

    const populatedQuiz = await Quiz.findByPk(quiz.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email', 'subject']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Quiz créé avec succès',
      data: { quiz: populatedQuiz }
    });

  } catch (error) {
    console.error('Erreur lors de la création du quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer le quiz'
    });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Mettre à jour un quiz
// @access  Private (Créateur et Admins)
router.put('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        error: 'Quiz non trouvé',
        message: 'Le quiz demandé n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'teacher' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour modifier ce quiz'
      });
    }

    await quiz.update(req.body);

    const updatedQuiz = await Quiz.findByPk(quiz.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email', 'subject']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Quiz mis à jour avec succès',
      data: { quiz: updatedQuiz }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le quiz'
    });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Supprimer un quiz
// @access  Private (Créateur et Admins)
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        error: 'Quiz non trouvé',
        message: 'Le quiz demandé n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'teacher' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour supprimer ce quiz'
      });
    }

    await quiz.destroy();

    res.json({
      success: true,
      message: 'Quiz supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de supprimer le quiz'
    });
  }
});

// @route   POST /api/quizzes/:id/assign
// @desc    Assigner un quiz à des étudiants
// @access  Private (Enseignants et Admins)
router.post('/:id/assign', protect, teacherOnly, [
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('Au moins un étudiant doit être assigné'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Date d\'échéance invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        error: 'Quiz non trouvé',
        message: 'Le quiz demandé n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'teacher' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour assigner ce quiz'
      });
    }

    const { studentIds, dueDate } = req.body;

    // Vérifier que tous les étudiants existent
    const students = await User.findAll({
      where: {
        id: studentIds,
        role: 'student'
      }
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({
        error: 'Étudiants invalides',
        message: 'Certains étudiants n\'existent pas ou ne sont pas des étudiants'
      });
    }

    // Mettre à jour le quiz
    await quiz.update({
      assigned_to: studentIds,
      due_date: dueDate || null
    });

    res.json({
      success: true,
      message: 'Quiz assigné avec succès',
      data: {
        assignedStudents: students.length,
        dueDate: dueDate
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation du quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'assigner le quiz'
    });
  }
});

// @route   POST /api/quizzes/:id/start
// @desc    Commencer un quiz (étudiant)
// @access  Private (Étudiants)
router.post('/:id/start', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        error: 'Quiz non trouvé',
        message: 'Le quiz demandé n\'existe pas'
      });
    }

    // Vérifier l'autorisation (même logique que pour GET /quizzes)
    if (req.user.role === 'student') {
      const student = await User.findByPk(req.user.id);
      let profIds = [];
      if (student && student.class) {
        const classData = await Class.findOne({ where: { name: student.class } });
        if (classData && classData.teacherId) {
          profIds = [classData.teacherId];
        }
      }
      
      // L'étudiant peut démarrer un quiz s'il est créé par son professeur principal
      if (!profIds.includes(quiz.created_by)) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Ce quiz ne vous est pas assigné'
        });
      }
    }

    // Vérifier que le quiz est actif
    if (quiz.status !== 'active') {
      return res.status(400).json({
        error: 'Quiz non disponible',
        message: 'Ce quiz n\'est pas actuellement disponible'
      });
    }

    // Vérifier le nombre de tentatives
    const existingResults = await QuizResult.findAll({
      where: {
        student_id: req.user.id,
        quiz_id: quiz.id
      }
    });

    if (existingResults.length >= quiz.maxAttempts) {
      return res.status(400).json({
        error: 'Limite de tentatives atteinte',
        message: `Vous avez déjà fait ${quiz.maxAttempts} tentatives pour ce quiz`
      });
    }

    // Créer un nouveau résultat
    const result = await QuizResult.create({
      student_id: req.user.id,
      quiz_id: quiz.id,
      score: 0,
      answers: [],
      correct_answers: 0,
      total_questions: quiz.questions.length,
      time_spent: 0,
      status: 'in_progress',
      attempt_number: existingResults.length + 1,
      passed: false,
      started_at: new Date()
    });

    res.json({
      success: true,
      message: 'Quiz commencé avec succès',
      data: {
        resultId: result.id,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          questions: quiz.questions.map(q => ({
            text: q.text,
            options: q.options
          }))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors du démarrage du quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de démarrer le quiz'
    });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Soumettre les réponses d'un quiz
// @access  Private (Étudiants)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { resultId, answers, timeSpent } = req.body;
    const studentId = req.user.id;
    const quizId = req.params.id;

    // Trouver le résultat en cours
    const result = await QuizResult.findOne({
      where: {
        id: resultId,
        student_id: studentId,
        quiz_id: quizId,
        status: 'in_progress'
      }
    });

    if (!result) {
      return res.status(404).json({
        error: 'Résultat non trouvé',
        message: 'Aucun quiz en cours trouvé'
      });
    }

    // Récupérer le quiz pour calculer le score
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({
        error: 'Quiz non trouvé',
        message: 'Le quiz demandé n\'existe pas'
      });
    }

    // Calculer le score
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        selectedAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Mettre à jour le résultat
    await result.update({
      score: score,
      answers: processedAnswers,
      correct_answers: correctAnswers,
      total_questions: quiz.questions.length,
      time_spent: timeSpent,
      status: 'completed',
      passed: passed,
      completed_at: new Date()
    });

    res.json({
      success: true,
      message: 'Quiz terminé avec succès',
      data: {
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: quiz.questions.length,
        passed: passed,
        timeSpent: timeSpent,
        feedback: passed ? 'Félicitations ! Vous avez réussi le quiz.' : 'Continuez à vous entraîner pour améliorer votre score.'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la soumission du quiz:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de soumettre le quiz'
    });
  }
});

// @route   GET /api/quizzes/:id/results
// @desc    Obtenir les résultats d'un quiz
// @access  Private (Créateur du quiz et Admins)
router.get('/:id/results', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        error: 'Quiz non trouvé',
        message: 'Le quiz demandé n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'teacher' && quiz.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour voir les résultats de ce quiz'
      });
    }

    const results = await QuizResult.findAll({
      where: { quiz_id: req.params.id },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email', 'class']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculer les statistiques
    const stats = {
      totalAttempts: results.length,
      averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
      passRate: results.length > 0 ? Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0,
      totalStudents: new Set(results.map(r => r.student_id)).size
    };

    res.json({
      success: true,
      data: {
        results,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les résultats'
    });
  }
});

export default router; 