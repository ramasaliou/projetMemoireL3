import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User, Simulation, TP, Result, Class } from '../models/index.js';
import { protect, teacherOnly } from '../middleware/auth.js';
import { sequelize } from '../config/database.js';
import QuizResult from '../models/QuizResult.js';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification et le rôle enseignant
router.use(protect, teacherOnly);

// @route   GET /api/teacher/dashboard
// @desc    Obtenir le tableau de bord de l'enseignant
// @access  Private (Enseignants)
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Statistiques des TP créés
    const tpStats = await TP.findAll({
      where: { created_by: teacherId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('TP.id')), 'count']
      ],
      group: ['status']
    });

    // TP récents
    const recentTPs = await TP.findAll({
      where: { created_by: teacherId },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email']
        }
      ]
    });

    // Étudiants assignés
    const assignedStudents = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'class'],
      include: [
        {
          model: TP,
          as: 'assigned_tps',
          where: { created_by: teacherId },
          required: false
        }
      ]
    });

    // Résultats récents
    const recentResults = await Result.findAll({
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: teacherId },
          attributes: ['title']
        },
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email', 'class']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        tpStats,
        recentTPs,
        assignedStudents: assignedStudents.length,
        recentResults,
        totalTPs: await TP.count({ where: { created_by: teacherId } }),
        totalStudents: assignedStudents.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord enseignant:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le tableau de bord'
    });
  }
});

// @route   GET /api/teacher/dashboard-data
// @desc    Obtenir toutes les données dynamiques du tableau de bord professeur
// @access  Private (Enseignants)
router.get('/dashboard-data', async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Statistiques de base
    const totalTPs = await TP.count({ where: { created_by: teacherId } });
    const activeTPs = await TP.count({ where: { created_by: teacherId, status: 'active' } });
    
    // 2. Étudiants assignés
    const assignedStudents = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'class']
    });

    // 3. Résultats et rendus
    const allResults = await Result.findAll({
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: teacherId },
          attributes: ['title', 'subject']
        },
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email', 'class']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const completedAssignments = allResults.filter(r => r.status === 'completed').length;
    const averageClassScore = allResults.length > 0 
      ? allResults.reduce((sum, r) => sum + (r.overall_score || 0), 0) / allResults.length 
      : 0;

    // 4. Échéances à venir (TP avec dates d'échéance)
    const upcomingDeadlines = await TP.findAll({
      where: { 
        created_by: teacherId,
        due_date: {
          [Op.gte]: new Date()
        },
        status: 'active'
      },
      attributes: ['id', 'title', 'due_date', 'assigned_to'],
      order: [['due_date', 'ASC']],
      limit: 5
    });

    // Calculer les pourcentages de rendu pour chaque échéance
    const deadlinesWithProgress = await Promise.all(upcomingDeadlines.map(async (tp) => {
      const totalAssigned = tp.assigned_to ? tp.assigned_to.split(',').length : 0;
      const submittedCount = await Result.count({
        where: { 
          tp_id: tp.id,
          status: 'completed'
        }
      });

      return {
        tp: tp.title,
        dueDate: tp.due_date,
        submitted: submittedCount,
        total: totalAssigned,
        percentage: totalAssigned > 0 ? Math.round((submittedCount / totalAssigned) * 100) : 0
      };
    }));

    // 5. Activités récentes (soumissions, questions, etc.)
    const recentActivity = await Result.findAll({
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: teacherId },
          attributes: ['title']
        },
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 8
    });

    const formattedRecentActivity = recentActivity.map(result => ({
      type: 'submission',
      student: result.student?.name || 'Élève',
      tp: result.tp?.title || 'TP',
      score: result.overall_score || 0,
      time: formatTimeAgo(result.created_at)
    }));

    // 6. Performance par thème/matière
    const subjectPerformance = await Result.findAll({
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: teacherId },
          attributes: ['subject']
        }
      ],
      attributes: [
        [sequelize.fn('AVG', sequelize.col('overall_score')), 'average'],
        [sequelize.fn('COUNT', sequelize.col('Result.id')), 'students']
      ],
      group: ['tp.subject'],
      order: [[sequelize.fn('AVG', sequelize.col('overall_score')), 'DESC']],
      limit: 4
    });

    const formattedSubjectPerformance = subjectPerformance.map(item => ({
      subject: item.tp?.subject || 'Matière',
      average: Math.round(parseFloat(item.dataValues.average || 0)),
      students: parseInt(item.dataValues.students || 0)
    }));

    // 7. Statistiques des simulations
    const simulationStats = await Simulation.findAll({
      where: { created_by: teacherId },
      attributes: [
        'id',
        'title',
        'type',
        'stats',
        'created_at'
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Calculer les statistiques globales des simulations
    const totalSimulations = simulationStats.length;
    const totalSimulationViews = simulationStats.reduce((sum, sim) => {
      const stats = sim.stats || {};
      return sum + (stats.views || 0);
    }, 0);
    const totalSimulationCompletions = simulationStats.reduce((sum, sim) => {
      const stats = sim.stats || {};
      return sum + (stats.completions || 0);
    }, 0);
    const averageSimulationScore = simulationStats.length > 0 
      ? simulationStats.reduce((sum, sim) => {
          const stats = sim.stats || {};
          return sum + (stats.average_score || 0);
        }, 0) / simulationStats.length 
      : 0;

    // Simulations les plus populaires
    const popularSimulations = simulationStats
      .map(sim => ({
        id: sim.id,
        title: sim.title,
        type: sim.type,
        views: sim.stats?.views || 0,
        completions: sim.stats?.completions || 0,
        averageScore: sim.stats?.average_score || 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Activités récentes des simulations
    const recentSimulationActivity = simulationStats
      .filter(sim => sim.stats?.completions > 0)
      .map(sim => ({
        type: 'simulation',
        title: sim.title,
        completions: sim.stats?.completions || 0,
        averageScore: sim.stats?.average_score || 0,
        time: formatTimeAgo(sim.created_at)
      }))
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        // Statistiques de base
        totalStudents: assignedStudents.length,
        activeTPs: activeTPs,
        completedAssignments: completedAssignments,
        averageClassScore: Math.round(averageClassScore),
        
        // Échéances à venir
        upcomingDeadlines: deadlinesWithProgress,
        
        // Activités récentes
        recentActivity: formattedRecentActivity,
        
        // Performance par thème
        subjectPerformance: formattedSubjectPerformance,
        
        // Statistiques des simulations
        simulationStats: {
          totalSimulations,
          totalViews: totalSimulationViews,
          totalCompletions: totalSimulationCompletions,
          averageScore: Math.round(averageSimulationScore)
        },
        popularSimulations,
        recentSimulationActivity
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données'
    });
  }
});

// Fonction utilitaire pour formater le temps écoulé
function formatTimeAgo(date) {
  const now = new Date();
  const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'À l\'instant';
  if (diffInHours < 24) return `Il y a ${Math.floor(diffInHours)}h`;
  if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`;
  return new Date(date).toLocaleDateString('fr-FR');
}

// @route   GET /api/teacher/tps
// @desc    Obtenir tous les TP créés par l'enseignant
// @access  Private (Enseignants)
router.get('/tps', async (req, res) => {
  try {
    const {
      status,
      limit = 20,
      page = 1
    } = req.query;

    const filter = { created_by: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tps = await TP.findAndCountAll({
      where: filter,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: skip
    });

    res.json({
      success: true,
      data: {
        tps: tps.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tps.count,
          pages: Math.ceil(tps.count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les TP'
    });
  }
});

// @route   POST /api/teacher/tps
// @desc    Créer un nouveau TP (TeacherCreateTP.tsx)
// @access  Private (Enseignants)
router.post('/tps', [
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
  body('duration')
    .isInt({ min: 15, max: 180 })
    .withMessage('La durée doit être entre 15 et 180 minutes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const tpData = {
      ...req.body,
      created_by: req.user.id
    };

    const tp = await TP.create(tpData);

    const populatedTP = await TP.findByPk(tp.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'TP créé avec succès',
      data: { tp: populatedTP }
    });

  } catch (error) {
    console.error('Erreur lors de la création du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer le TP'
    });
  }
});

// @route   GET /api/teacher/simulations
// @desc    Obtenir les simulations créées par l'enseignant (TeacherSimulations.tsx)
// @access  Private (Enseignants)
router.get('/simulations', async (req, res) => {
  try {
    const {
      type,
      status,
      limit = 20,
      page = 1,
      search
    } = req.query;

    const filter = { created_by: req.user.id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const simulations = await Simulation.findAndCountAll({
      where: filter,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: skip
    });

    res.json({
      success: true,
      data: {
        simulations: simulations.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: simulations.count,
          pages: Math.ceil(simulations.count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des simulations:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les simulations'
    });
  }
});

// @route   GET /api/teacher/students
// @desc    Obtenir les élèves de toutes les classes du professeur
// @access  Private (Enseignants)
router.get('/students', async (req, res) => {
  try {
    const { limit = 50, page = 1, search } = req.query;

    // Récupérer toutes les classes du professeur
    const teacherClasses = await Class.findAll({
      where: { teacherId: req.user.id }
    });

    if (!teacherClasses.length) {
      return res.json({
        success: true,
        data: {
          students: [],
          teacherClass: null,
          pagination: { page: 1, limit: 0, total: 0, pages: 0 }
        }
      });
    }

    // Récupérer les noms des classes
    const classNames = teacherClasses.map(c => c.name);

    // Construire le filtre pour les élèves de ces classes
    const filter = {
      role: 'student',
      class: classNames.length === 1 ? classNames[0] : { [Op.in]: classNames }
    };
    if (search) {
      filter[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await User.findAndCountAll({
      where: filter,
      attributes: ['id', 'name', 'email', 'class', 'level', 'avatar'],
      include: [
        {
          model: Result,
          as: 'results',
          include: [
            {
              model: TP,
              as: 'tp',
              attributes: ['id', 'title', 'subject']
            }
          ],
          attributes: ['id', 'tp_id', 'overall_score', 'status', 'completed_at', 'created_at']
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: skip
    });

    res.json({
      success: true,
      data: {
        students: students.rows,
        teacherClass: classNames.join(', '),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: students.count,
          pages: Math.ceil(students.count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les élèves'
    });
  }
});

// @route   GET /api/teacher/results
// @desc    Obtenir les résultats des TP de l'enseignant
// @access  Private (Enseignants)
router.get('/results', async (req, res) => {
  try {
    const {
      tp_id,
      student_id,
      limit = 20,
      page = 1
    } = req.query;

    const filter = {};
    if (tp_id) filter.tp_id = tp_id;
    if (student_id) filter.student_id = student_id;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await Result.findAndCountAll({
      where: filter,
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: req.user.id },
          attributes: ['title', 'subject', 'level']
        },
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email', 'class']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: skip
    });

    res.json({
      success: true,
      data: {
        results: results.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.count,
          pages: Math.ceil(results.count / parseInt(limit))
        }
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

// @route   PUT /api/teacher/results/:id/feedback
// @desc    Ajouter un feedback à un résultat (TeacherResults.tsx)
// @access  Private (Enseignants)
router.put('/results/:id/feedback', [
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Le commentaire ne peut pas dépasser 500 caractères'),
  body('grade')
    .optional()
    .isIn(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'])
    .withMessage('Note invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { comment, grade } = req.body;

    const result = await Result.findByPk(req.params.id, {
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: req.user.id }
        }
      ]
    });

    if (!result) {
      return res.status(404).json({
        error: 'Résultat non trouvé',
        message: 'Le résultat demandé n\'existe pas'
      });
    }

    result.teacher_feedback = {
      comment,
      grade,
      feedback_at: new Date()
    };

    await result.save();

    res.json({
      success: true,
      message: 'Feedback ajouté avec succès',
      data: { result }
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du feedback:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'ajouter le feedback'
    });
  }
});

// @route   GET /api/teacher/quiz-results
// @desc    Obtenir tous les résultats de quiz des élèves pour les quiz créés par le professeur
// @access  Private (Enseignants)
router.get('/quiz-results', async (req, res) => {
  try {
    const teacherId = req.user.id;
    // On récupère tous les Quiz créés par ce professeur
    const quizzes = await Quiz.findAll({ where: { created_by: teacherId }, attributes: ['id'] });
    const quizIds = quizzes.map(q => q.id);
    if (quizIds.length === 0) {
      return res.json({ success: true, data: [] });
    }
    // On récupère tous les résultats pour ces quiz, avec infos élève et quiz
    const results = await QuizResult.findAll({
      where: { quiz_id: quizIds },
      include: [
        { model: Quiz, as: 'quiz', attributes: ['title', 'subject', 'level'] },
        { model: User, as: 'student', attributes: ['id', 'name', 'class', 'email'] }
      ],
      order: [['completed_at', 'DESC']]
    });
    // Formatage optionnel pour le frontend
    const formatted = results.map(r => ({
      id: r.id,
      student: r.student ? {
        id: r.student.id,
        name: r.student.name,
        class: r.student.class,
        email: r.student.email
      } : null,
      quiz: r.quiz ? {
        id: r.quiz_id,
        title: r.quiz.title,
        subject: r.quiz.subject,
        level: r.quiz.level
      } : null,
      score: r.score,
      correct_answers: r.correct_answers,
      total_questions: r.total_questions,
      time_spent: r.time_spent,
      status: r.status,
      attempt_number: r.attempt_number,
      passed: r.passed,
      completed_at: r.completed_at
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats de quiz:', error);
    res.status(500).json({ error: 'Erreur serveur', message: 'Impossible de récupérer les résultats de quiz' });
  }
});

// @route   GET /api/teacher/class-info
// @desc    Obtenir les informations de la classe du professeur
// @access  Private (Enseignants)
router.get('/class-info', async (req, res) => {
  try {
    // Récupérer le professeur connecté
    const teacher = await User.findByPk(req.user.id);
    if (!teacher) {
      return res.status(404).json({
        error: 'Professeur non trouvé',
        message: 'Le professeur connecté n\'existe pas'
      });
    }

    // Chercher les classes du professeur
    const teacherClasses = await Class.findAll({
      where: { teacherId: req.user.id }
    });

    if (teacherClasses.length === 0) {
      return res.json({
        success: true,
        data: {
          hasClass: false,
          message: 'Aucune classe assignée'
        }
      });
    }

    // Prendre la première classe (ou la plus récente)
    const classData = teacherClasses[0];
    
    // Compter les élèves de cette classe
    const studentCount = await User.count({
      where: { 
        role: 'student',
        class: classData.name
      }
    });

    // Mettre à jour le nombre d'élèves dans la classe
    if (classData.currentStudents !== studentCount) {
      await classData.update({ currentStudents: studentCount });
    }

    res.json({
      success: true,
      data: {
        hasClass: true,
        class: {
          id: classData.id,
          name: classData.name,
          level: classData.level,
          subject: classData.subject,
          currentStudents: studentCount,
          maxStudents: classData.maxStudents,
          averageScore: classData.averageScore,
          completionRate: classData.completionRate,
          academicYear: classData.academicYear,
          room: classData.room,
          schedule: classData.schedule,
          description: classData.description
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations de classe:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les informations de classe'
    });
  }
});

// @route   GET /api/teacher/dashboard-data
// @desc    Obtenir toutes les données dynamiques du tableau de bord professeur
// @access  Private (Enseignants)
router.get('/dashboard-data', protect, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Statistiques de base
    const totalTPs = await TP.count({ where: { created_by: teacherId } });
    const activeTPs = await TP.count({ where: { created_by: teacherId, status: 'active' } });
    
    // 2. Étudiants assignés
    const assignedStudents = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'class']
    });

    // 3. Résultats et rendus
    const allResults = await Result.findAll({
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: teacherId },
          attributes: ['title', 'subject']
        },
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email', 'class']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const completedAssignments = allResults.filter(r => r.status === 'completed').length;
    const averageClassScore = allResults.length > 0 
      ? allResults.reduce((sum, r) => sum + (r.overall_score || 0), 0) / allResults.length 
      : 0;

    // 4. Échéances à venir (TP avec dates d'échéance)
    const upcomingDeadlines = await TP.findAll({
      where: { 
        created_by: teacherId,
        due_date: {
          [Op.gte]: new Date()
        },
        status: 'active'
      },
      attributes: ['id', 'title', 'due_date', 'assigned_to'],
      order: [['due_date', 'ASC']],
      limit: 5
    });

    // Calculer les pourcentages de rendu pour chaque échéance
    const deadlinesWithProgress = await Promise.all(upcomingDeadlines.map(async (tp) => {
      const totalAssigned = tp.assigned_to ? tp.assigned_to.split(',').length : 0;
      const submittedCount = await Result.count({
        where: { 
          tp_id: tp.id,
          status: 'completed'
        }
      });

      return {
        tp: tp.title,
        dueDate: tp.due_date,
        submitted: submittedCount,
        total: totalAssigned,
        percentage: totalAssigned > 0 ? Math.round((submittedCount / totalAssigned) * 100) : 0
      };
    }));

    // 5. Activités récentes (soumissions, questions, etc.)
    const recentActivity = await Result.findAll({
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: teacherId },
          attributes: ['title']
        },
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 8
    });

    const formattedRecentActivity = recentActivity.map(result => ({
      type: 'submission',
      student: result.student?.name || 'Élève',
      tp: result.tp?.title || 'TP',
      score: result.overall_score || 0,
      time: formatTimeAgo(result.created_at)
    }));

    // 6. Performance par thème/matière
    const subjectPerformance = await Result.findAll({
      include: [
        {
          model: TP,
          as: 'tp',
          where: { created_by: teacherId },
          attributes: ['subject']
        }
      ],
      attributes: [
        [sequelize.fn('AVG', sequelize.col('overall_score')), 'average'],
        [sequelize.fn('COUNT', sequelize.col('Result.id')), 'students']
      ],
      group: ['tp.subject'],
      order: [[sequelize.fn('AVG', sequelize.col('overall_score')), 'DESC']],
      limit: 4
    });

    const formattedSubjectPerformance = subjectPerformance.map(item => ({
      subject: item.tp?.subject || 'Matière',
      average: Math.round(parseFloat(item.dataValues.average || 0)),
      students: parseInt(item.dataValues.students || 0)
    }));

    res.json({
      success: true,
      data: {
        // Statistiques de base
        totalStudents: assignedStudents.length,
        activeTPs: activeTPs,
        completedAssignments: completedAssignments,
        averageClassScore: Math.round(averageClassScore),
        
        // Échéances à venir
        upcomingDeadlines: deadlinesWithProgress,
        
        // Activités récentes
        recentActivity: formattedRecentActivity,
        
        // Performance par thème
        subjectPerformance: formattedSubjectPerformance
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données'
    });
  }
});

export default router; 