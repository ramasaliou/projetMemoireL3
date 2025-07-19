import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User, Simulation, TP, Result, SimulationResult, Class } from '../models/index.js';
import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';
import { protect } from '../middleware/auth.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification et le rôle étudiant
router.use(protect);

// Middleware pour vérifier que l'utilisateur est un étudiant
const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Cette route est réservée aux étudiants'
    });
  }
  next();
};

// @route   GET /api/student/dashboard
// @desc    Obtenir le tableau de bord de l'étudiant (StudentDashboard.tsx)
// @access  Private (Étudiants)
router.get('/dashboard', studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;

    // TP assignés
    const assignedTPs = await TP.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email', 'subject']
        }
      ],
      where: {
        assigned_to: {
          [Op.like]: `%${studentId}%`
        }
      }
    });

    // Résultats récents
    const recentResults = await Result.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: TP,
          as: 'tp',
          attributes: ['title', 'subject']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Statistiques
    const completedResults = await Result.findAll({
      where: { 
        student_id: studentId,
        status: 'completed'
      }
    });

    const stats = {
      completedTPs: completedResults.length,
      averageScore: completedResults.length > 0 
        ? completedResults.reduce((sum, r) => sum + r.overall_score, 0) / completedResults.length 
        : 0
    };

    // TP en cours
    const inProgressTPs = assignedTPs.filter(tp => 
      !recentResults.some(result => result.tp_id === tp.id && result.status === 'completed')
    );

    res.json({
      success: true,
      data: {
        assignedTPs: assignedTPs.length,
        inProgressTPs: inProgressTPs.length,
        completedTPs: stats.completedTPs,
        averageScore: stats.averageScore,
        recentResults,
        upcomingDeadlines: assignedTPs
          .filter(tp => tp.due_date && new Date(tp.due_date) > new Date())
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 3)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord étudiant:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le tableau de bord'
    });
  }
});

// @route   GET /api/student/dashboard-data
// @desc    Obtenir toutes les données dynamiques du tableau de bord étudiant (version quiz)
// @access  Private (Étudiants)
router.get('/dashboard-data', studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;
    // Récupérer la classe et le prof principal
    const student = await User.findByPk(studentId);
    let profId = null;
    if (student && student.class) {
      const classData = await Class.findOne({ where: { name: student.class } });
      if (classData && classData.teacherId) {
        profId = classData.teacherId;
      }
    }
    console.log('DEBUG dashboard-data:', { studentId, class: student?.class, profId });
    // 1. Quiz assignés à l'élève OU quiz du prof principal sans assigned_to
    const allActiveQuizzes = await Quiz.findAll({ where: { status: 'active' } });
    console.log('DEBUG dashboard-data: nbQuiz', allActiveQuizzes.length);
    const quizzesForStudent = allActiveQuizzes.filter(q => {
      // Quiz explicitement assigné à l'élève
      if (Array.isArray(q.assigned_to) && q.assigned_to.includes(studentId)) return true;
      // Quiz du prof principal pour toute la classe
      if ((!q.assigned_to || q.assigned_to.length === 0) && profId && q.created_by === profId) return true;
      return false;
    });

    // 2. Résultats de quiz terminés
    const completedQuizResults = await QuizResult.findAll({
      where: {
        student_id: studentId,
        status: 'completed'
      },
      include: [
        {
          model: Quiz,
          as: 'quiz', // alias corrigé
          attributes: ['title', 'subject', 'level']
        }
      ],
      order: [['completed_at', 'DESC']]
    });

    // 2bis. Simulations terminées
    const completedSimulations = await Result.findAll({
      where: {
        student_id: studentId,
        status: 'completed',
        simulation_id: { [Op.ne]: null }
      },
      include: [
        {
          model: Simulation,
          as: 'simulation',
          attributes: ['title', 'type']
        }
      ],
      order: [['completed_at', 'DESC']]
    });
    const completedSimulationsCount = completedSimulations.length;
    const averageSimulationScore = completedSimulationsCount > 0
      ? Math.round(completedSimulations.reduce((sum, r) => sum + (r.quiz_results?.score || 0), 0) / completedSimulationsCount)
      : 0;

    // 2ter. Simulations commencées (in_progress)
    const startedSimulations = await SimulationResult.findAll({
      where: {
        student_id: studentId,
        note: 0 // ou null si tu utilises null pour in_progress
      },
      order: [['created_at', 'DESC']]
    });
    const startedSimulationsCount = startedSimulations.length;

    // Pourcentage de progression sur les simulations (commencées + terminées / total)
    const totalSimulations = await Simulation.count({ where: { status: 'published' } });
    const simulationProgressPercentage = totalSimulations > 0 ? Math.round(((completedSimulationsCount + startedSimulationsCount) / totalSimulations) * 100) : 0;

    // 3. Statistiques de base
    const activeQuizzes = quizzesForStudent.length;
    const completedQuizzes = completedQuizResults.length;
    const averageScore = completedQuizResults.length > 0
      ? Math.round(completedQuizResults.reduce((sum, r) => sum + (r.score || 0), 0) / completedQuizResults.length)
      : 0;
    const progressPercentage = activeQuizzes > 0 ? Math.round((completedQuizzes / activeQuizzes) * 100) : 0;

    // 4. Quiz à venir (date limite future et pas encore fait)
    const upcomingQuizzes = quizzesForStudent
      .filter(q => q.due_date && new Date(q.due_date) > new Date() && !completedQuizResults.some(r => r.quiz_id === q.id))
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 3)
      .map(q => ({
        id: q.id,
        title: q.title,
        subject: q.subject,
        dueDate: q.due_date,
        level: q.level || 'Standard'
      }));

    // 5. Activités récentes (quiz)
    const recentActivity = completedQuizResults.slice(0, 5).map(result => ({
      type: 'completed',
      title: result.Quiz?.title || 'Quiz',
      score: result.score || 0,
      date: formatTimeAgo(result.completed_at)
    }));

    // 6. Performance par matière
    const subjectStats = {};
    completedQuizResults.forEach(result => {
      const subject = result.Quiz?.subject || 'Matière';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, count: 0 };
      }
      subjectStats[subject].total += result.score || 0;
      subjectStats[subject].count += 1;
    });
    const subjectPerformance = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      score: Math.round(stats.total / stats.count),
      count: stats.count
    }));

    // 7. Meilleur score (tous quiz confondus)
    const bestScore = completedQuizResults.length > 0
      ? Math.max(...completedQuizResults.map(r => r.score || 0))
      : 0;

    res.set('Cache-Control', 'no-store');
    res.json({
      success: true,
      data: {
        activeQuizzes,
        completedQuizzes,
        averageScore,
        bestScore,
        progressPercentage,
        upcomingQuizzes,
        recentActivity,
        subjectPerformance,
        // Ajouts simulations
        completedSimulations: completedSimulations.map(r => ({
          id: r.simulation_id,
          title: r.simulation?.title || '',
          type: r.simulation?.type || '',
          score: r.quiz_results?.score || 0,
          completed_at: r.completed_at
        })),
        completedSimulationsCount,
        startedSimulations: startedSimulations.map(r => ({
          id: r.simulation_type,
          started_at: r.created_at,
          class_code: r.class_code
        })),
        startedSimulationsCount,
        simulationProgressPercentage
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord étudiant (quiz):', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données (quiz)',
      error: error.stack || error.message || error
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

// @route   GET /api/student/tps
// @desc    Obtenir les TP assignés à l'étudiant (StudentTPs.tsx)
// @access  Private (Étudiants)
router.get('/tps', studentOnly, async (req, res) => {
  try {
    const {
      status,
      limit = 20,
      page = 1
    } = req.query;

    const studentId = req.user.id;
    // Charger tous les TP (optionnellement filtrés par status)
    const allTPs = await TP.findAll({
      where: status ? { status } : {},
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email', 'subject']
        }
      ]
    });
    // Filtrer côté JS sur assigned_to
    const tpsForStudent = allTPs.filter(tp => Array.isArray(tp.assigned_to) && tp.assigned_to.includes(studentId));

    // Pagination manuelle
    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    const paginatedTPs = tpsForStudent.slice(start, end);

    res.json({
      success: true,
      data: {
        tps: paginatedTPs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tpsForStudent.length,
          pages: Math.ceil(tpsForStudent.length / parseInt(limit))
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

// @route   GET /api/student/simulations
// @desc    Obtenir les simulations disponibles (StudentLab.tsx)
// @access  Private (Étudiants)
router.get('/simulations', studentOnly, async (req, res) => {
  try {
    const {
      type,
      difficulty,
      limit = 20,
      page = 1,
      search
    } = req.query;

    const filter = { 
      is_public: true,
      status: 'published'
    };
    
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
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

// @route   GET /api/student/results
// @desc    Obtenir les résultats de l'étudiant (StudentResults.tsx)
// @access  Private (Étudiants)
router.get('/results', studentOnly, async (req, res) => {
  try {
    const {
      limit = 20,
      page = 1
    } = req.query;

    const studentId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await Result.findAndCountAll({
      where: { student_id: studentId },
      include: [
        {
          model: TP,
          as: 'tp',
          attributes: ['title', 'subject', 'level']
        },
        {
          model: Simulation,
          as: 'simulation',
          attributes: ['title', 'type']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: skip
    });

    // Statistiques
    const completedResults = await Result.findAll({
      where: { 
        student_id: studentId,
        status: 'completed'
      }
    });

    const stats = {
      completedTPs: completedResults.length,
      averageScore: completedResults.length > 0 
        ? completedResults.reduce((sum, r) => sum + r.overall_score, 0) / completedResults.length 
        : 0
    };

    res.json({
      success: true,
      data: {
        results: results.rows,
        stats,
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

// @route   POST /api/student/tps/:id/start
// @desc    Commencer un TP (StudentTPs.tsx)
// @access  Private (Étudiants)
router.post('/tps/:id/start', studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;
    const tpId = req.params.id;

    // Vérifier que le TP est assigné à l'étudiant
    const tp = await TP.findOne({
      where: {
        id: tpId,
        assigned_to: {
          [Op.like]: `%${studentId}%`
        }
      }
    });

    if (!tp) {
      return res.status(404).json({
        error: 'TP non trouvé',
        message: 'Ce TP ne vous est pas assigné'
      });
    }

    // Vérifier s'il y a déjà un résultat en cours
    let result = await Result.findOne({
      where: {
        student_id: studentId,
        tp_id: tpId,
        status: 'in_progress'
      }
    });

    if (!result) {
      // Créer un nouveau résultat
      result = await Result.create({
        student_id: studentId,
        tp_id: tpId,
        status: 'in_progress',
        started_at: new Date(),
        overall_score: 0
      });
    }

    res.json({
      success: true,
      message: 'TP commencé avec succès',
      data: { result }
    });

  } catch (error) {
    console.error('Erreur lors du démarrage du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de commencer le TP'
    });
  }
});

// @route   POST /api/student/tps/:id/complete
// @desc    Terminer un TP (StudentTPs.tsx)
// @access  Private (Étudiants)
router.post('/tps/:id/complete', studentOnly, [
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Le score doit être entre 0 et 100'),
  body('timeSpent')
    .isInt({ min: 1 })
    .withMessage('Le temps passé doit être positif'),
  body('answers')
    .isArray()
    .withMessage('Les réponses doivent être un tableau')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { score, timeSpent, answers } = req.body;
    const studentId = req.user.id;
    const tpId = req.params.id;

    // Trouver le résultat en cours
    const result = await Result.findOne({
      where: {
        student_id: studentId,
        tp_id: tpId,
        status: 'in_progress'
      }
    });

    if (!result) {
      return res.status(404).json({
        error: 'Résultat non trouvé',
        message: 'Aucun TP en cours trouvé'
      });
    }

    // Mettre à jour le résultat
    result.quiz_results = {
      score,
      total_questions: answers.length,
      correct_answers: answers.filter(a => a.isCorrect).length,
      time_spent: timeSpent,
      answers
    };

    result.overall_score = score;
    result.status = 'completed';
    result.completed_at = new Date();

    await result.save();

    res.json({
      success: true,
      message: 'TP terminé avec succès',
      data: { result }
    });

  } catch (error) {
    console.error('Erreur lors de la completion du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de terminer le TP'
    });
  }
});

// @route   GET /api/student/dashboard-data
// @desc    Obtenir toutes les données dynamiques du tableau de bord étudiant
// @access  Private (Étudiants)
router.get('/dashboard-data', studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. TP assignés et actifs
    const assignedTPs = await TP.findAll({
      where: {
        assigned_to: {
          [Op.like]: `%${studentId}%`
        },
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email', 'subject']
        }
      ]
    });

    // 2. Résultats de l'étudiant
    const studentResults = await Result.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: TP,
          as: 'tp',
          attributes: ['title', 'subject', 'due_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // 3. Statistiques de base
    const activeTPs = assignedTPs.length;
    const completedTPs = studentResults.filter(r => r.status === 'completed').length;
    const averageScore = studentResults.length > 0 
      ? studentResults.reduce((sum, r) => sum + (r.overall_score || 0), 0) / studentResults.length 
      : 0;
    const progressPercentage = activeTPs > 0 ? Math.round((completedTPs / activeTPs) * 100) : 0;

    // 4. TP à venir (avec échéances)
    const upcomingTPs = assignedTPs
      .filter(tp => {
        const isCompleted = studentResults.some(r => r.tp_id === tp.id && r.status === 'completed');
        const hasDueDate = tp.due_date && new Date(tp.due_date) > new Date();
        return !isCompleted && hasDueDate;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 3)
      .map(tp => ({
        id: tp.id,
        title: tp.title,
        subject: tp.subject,
        dueDate: tp.due_date,
        level: tp.level || 'Standard'
      }));

    // 5. Activités récentes
    const recentActivity = studentResults
      .slice(0, 5)
      .map(result => ({
        type: result.status === 'completed' ? 'completed' : 'started',
        title: result.tp?.title || 'TP',
        score: result.overall_score || 0,
        date: formatTimeAgo(result.created_at)
      }));

    // 6. Performance par matière
    const subjectPerformance = await Result.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: TP,
          as: 'tp',
          attributes: ['subject']
        }
      ],
      attributes: [
        [sequelize.fn('AVG', sequelize.col('overall_score')), 'average'],
        [sequelize.fn('COUNT', sequelize.col('Result.id')), 'count']
      ],
      group: ['tp.subject'],
      order: [[sequelize.fn('AVG', sequelize.col('overall_score')), 'DESC']]
    });

    const formattedSubjectPerformance = subjectPerformance.map(item => ({
      subject: item.tp?.subject || 'Matière',
      score: Math.round(parseFloat(item.dataValues.average || 0)),
      count: parseInt(item.dataValues.count || 0)
    }));

    res.set('Cache-Control', 'no-store');
    res.json({
      success: true,
      data: {
        // Statistiques de base
        activeTPs: activeTPs,
        completedTPs: completedTPs,
        averageScore: Math.round(averageScore),
        progressPercentage: progressPercentage,
        
        // TP à venir
        upcomingTPs: upcomingTPs,
        
        // Activités récentes
        recentActivity: recentActivity,
        
        // Performance par matière
        subjectPerformance: formattedSubjectPerformance
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données du tableau de bord étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données'
    });
  }
});

export default router; 