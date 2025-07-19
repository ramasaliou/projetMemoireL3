import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.js';
import TP from '../models/TP.js';
import Simulation from '../models/Simulation.js';
import Result from '../models/Result.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { Class } from '../models/index.js';

const router = express.Router();

// Toutes les routes d'admin nécessitent le rôle admin
router.use(protect, adminOnly);

// @route   GET /api/admin/dashboard
// @desc    Obtenir les statistiques du tableau de bord admin
// @access  Private (Admin seulement)
router.get('/dashboard', async (req, res) => {
  try {
    // Statistiques des utilisateurs
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    // Statistiques des TP
    const tpStats = await TP.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Statistiques des simulations
    const simulationStats = await Simulation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Statistiques des résultats
    const resultStats = await Result.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Activité récente
    const recentActivity = await Result.find()
      .populate('student', 'name email class')
      .populate('tp', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top des TP les plus populaires
    const popularTPs = await TP.aggregate([
      {
        $project: {
          title: 1,
          subject: 1,
          level: 1,
          assignmentCount: { $size: '$assignedTo' },
          completionCount: {
            $size: {
              $filter: {
                input: '$assignedTo',
                cond: { $ne: ['$$this.completedAt', null] }
              }
            }
          }
        }
      },
      { $sort: { assignmentCount: -1 } },
      { $limit: 5 }
    ]);

    // Top des simulations les plus vues
    const popularSimulations = await Simulation.find()
      .sort({ 'stats.views': -1 })
      .limit(5)
      .select('title type stats.views stats.completions');

    res.json({
      success: true,
      data: {
        userStats,
        tpStats,
        simulationStats,
        resultStats,
        recentActivity,
        popularTPs,
        popularSimulations
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les statistiques du tableau de bord'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Obtenir tous les utilisateurs avec filtres
// @access  Private (Admin seulement)
router.get('/users', async (req, res) => {
  try {
    const {
      role,
      is_active,
      limit = 20,
      page = 1,
      search
    } = req.query;

    // Construire le filtre
    const where = {};
    
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { class: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } }
      ];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.count,
          pages: Math.ceil(users.count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les utilisateurs'
    });
  }
});

// @route   GET /api/admin/users/inactive
// @desc    Obtenir tous les utilisateurs inactifs
// @access  Private (Admin seulement)
router.get('/users/inactive', async (req, res) => {
  try {
    const {
      role,
      limit = 20,
      page = 1,
      search
    } = req.query;

    // Construire le filtre pour les utilisateurs inactifs
    const where = { is_active: false };
    
    if (role) where.role = role;
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { class: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } }
      ];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['updatedAt', 'DESC']] // Trier par date de mise à jour pour voir les plus récemment désactivés
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.count,
          pages: Math.ceil(users.count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs inactifs:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les utilisateurs inactifs'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activer/désactiver un utilisateur
// @access  Private (Admin seulement)
router.put('/users/:id/status', [
  body('is_active')
    .isBoolean()
    .withMessage('Le statut doit être un booléen')
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

    const { is_active } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas'
      });
    }

    // Empêcher la désactivation de l'admin principal
    if (user.email === 'admin@virtual-lab.com' && !is_active) {
      return res.status(400).json({
        error: 'Désactivation interdite',
        message: 'Impossible de désactiver l\'administrateur principal'
      });
    }

    user.is_active = is_active;
    await user.save();

    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`,
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le statut'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Supprimer un utilisateur
// @access  Private (Admin seulement)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas'
      });
    }

    // Supprimer les données associées selon le rôle
    if (user.role === 'student') {
      await Result.deleteMany({ student: req.params.id });
      await TP.updateMany(
        { 'assignedTo.student': req.params.id },
        { $pull: { assignedTo: { student: req.params.id } } }
      );
    } else if (user.role === 'teacher') {
      await TP.deleteMany({ createdBy: req.params.id });
      await Simulation.deleteMany({ createdBy: req.params.id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de supprimer l\'utilisateur'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Obtenir les analyses détaillées
// @access  Private (Admin seulement)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // jours
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Inscriptions par période
    const registrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Activité des TP
    const tpActivity = await TP.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          created: { $sum: 1 },
          completed: {
            $sum: {
              $size: {
                $filter: {
                  input: '$assignedTo',
                  cond: { $ne: ['$$this.completedAt', null] }
                }
              }
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Performance par classe
    const classPerformance = await Result.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.class',
          averageScore: { $avg: '$overallScore' },
          totalResults: { $sum: 1 },
          completedResults: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Top des matières
    const subjectStats = await TP.aggregate([
      {
        $group: {
          _id: '$subject',
          totalTPs: { $sum: 1 },
          totalAssignments: {
            $sum: { $size: '$assignedTo' }
          },
          averageScore: {
            $avg: {
              $avg: '$assignedTo.score'
            }
          }
        }
      },
      { $sort: { totalTPs: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        registrations,
        tpActivity,
        classPerformance,
        subjectStats,
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analyses:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les analyses'
    });
  }
});

// @route   POST /api/admin/backup
// @desc    Créer une sauvegarde des données
// @access  Private (Admin seulement)
router.post('/backup', async (req, res) => {
  try {
    // En production, vous implémenteriez ici une vraie sauvegarde
    // Pour l'instant, on retourne juste un message de succès
    const backupData = {
      timestamp: new Date().toISOString(),
      users: await User.countDocuments(),
      tps: await TP.countDocuments(),
      simulations: await Simulation.countDocuments(),
      results: await Result.countDocuments()
    };

    res.json({
      success: true,
      message: 'Sauvegarde créée avec succès',
      data: { backup: backupData }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer la sauvegarde'
    });
  }
});

// @route   POST /api/admin/initialize
// @desc    Initialiser la base de données avec des données de démonstration
// @access  Private (Admin seulement)
router.post('/initialize', async (req, res) => {
  try {
    // Supprimer toutes les données existantes
    await User.deleteMany({});
    await TP.deleteMany({});
    await Simulation.deleteMany({});
    await Result.deleteMany({});

    // Créer les utilisateurs de démonstration
    const demoStudent = await User.createDemoUser('student');
    const demoTeacher = await User.createDemoUser('teacher');
    const demoAdmin = await User.createDemoUser('admin');

    // Créer les simulations de démonstration
    const demoSimulations = [];
    const types = ['respiration', 'agglutination', 'hiv-aids', 'fermentation', 'la degradation des elemets radioactifs'];
    
    for (const type of types) {
      const simulation = await Simulation.createDemoSimulation(type, demoTeacher._id);
      demoSimulations.push(simulation);
    }

    // Créer le TP de démonstration
    const demoTp = await TP.createDemoTP(demoTeacher._id);

    // Assigner le TP à l'étudiant
    await demoTp.assignToStudent(demoStudent._id);

    res.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      data: {
        users: {
          student: { email: demoStudent.email, password: 'demo123' },
          teacher: { email: demoTeacher.email, password: 'demo123' },
          admin: { email: demoAdmin.email, password: 'demo123' }
        },
        simulations: demoSimulations.length,
        tps: 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'initialiser la base de données'
    });
  }
});

// @route   GET /api/admin/system-info
// @desc    Obtenir les informations système
// @access  Private (Admin seulement)
router.get('/system-info', async (req, res) => {
  try {
    const systemInfo = {
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      database: 'MongoDB',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: { systemInfo }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations système:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les informations système'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Statistiques globales pour le dashboard admin
// @access  Private (Admin seulement)
router.get('/stats', async (req, res) => {
  try {
    // Utilisateurs
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    // Classes
    const totalClasses = await Class.count();
    // TPs
    const totalTPs = await TP.count();
    const activeTPs = await TP.count({ where: { status: 'active' } });
    // Moyenne générale (sur tous les résultats)
    const [avgResult] = await Result.findAll({
      attributes: [[Result.sequelize.fn('AVG', Result.sequelize.col('overall_score')), 'avgScore']]
    });
    const averageClassScore = avgResult?.dataValues?.avgScore || 0;
    // Taux d'utilisation fictif (à calculer selon ta logique)
    const platformUsage = Math.floor((activeUsers / (totalUsers || 1)) * 100);
    // Activité récente (10 derniers users ou TPs créés)
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['name', 'email', 'role', 'created_at']
    });
    const recentTPs = await TP.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['title', 'created_at']
    });
    const recentActivity = [
      ...recentUsers.map(u => ({ type: 'user_registered', user: u.name, action: 'Nouvel utilisateur', time: u.created_at })),
      ...recentTPs.map(tp => ({ type: 'tp_created', user: '', action: `Nouveau TP: ${tp.title}`, time: tp.created_at }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
    // Performance par classe (top 3)
    const classPerformance = await Class.findAll({
      limit: 3,
      order: [['averageScore', 'DESC']],
      attributes: ['name', ['currentStudents', 'students'], ['averageScore', 'average'], ['completionRate', 'completion']]
    });
    // Statistiques mensuelles fictives (à adapter si tu veux)
    const monthlyStats = [];
    // Réponse
    res.json({
      totalUsers,
      activeUsers,
      totalClasses,
      totalTPs,
      activeTPs,
      averageClassScore,
      platformUsage,
      recentActivity,
      classPerformance,
      monthlyStats
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({ error: 'Erreur serveur', message: 'Impossible de récupérer les statistiques' });
  }
});

// @route   GET /api/admin/stats-test
// @desc    Test des statistiques sans authentification
// @access  Public (pour test)
router.get('/stats-test', async (req, res) => {
  try {
    // Utilisateurs
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    // Classes
    const totalClasses = await Class.count();
    // TPs
    const totalTPs = await TP.count();
    const activeTPs = await TP.count({ where: { status: 'active' } });
    // Moyenne générale (sur tous les résultats)
    const [avgResult] = await Result.findAll({
      attributes: [[Result.sequelize.fn('AVG', Result.sequelize.col('overall_score')), 'avgScore']]
    });
    const averageClassScore = avgResult?.dataValues?.avgScore || 0;
    // Taux d'utilisation fictif
    const platformUsage = Math.floor((activeUsers / (totalUsers || 1)) * 100);
    // Activité récente
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['name', 'email', 'role', 'created_at']
    });
    const recentTPs = await TP.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['title', 'created_at']
    });
    const recentActivity = [
      ...recentUsers.map(u => ({ type: 'user_registered', user: u.name, action: 'Nouvel utilisateur', time: u.created_at })),
      ...recentTPs.map(tp => ({ type: 'tp_created', user: '', action: `Nouveau TP: ${tp.title}`, time: tp.created_at }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
    // Performance par classe
    const classPerformance = await Class.findAll({
      limit: 3,
      order: [['averageScore', 'DESC']],
      attributes: ['name', ['currentStudents', 'students'], ['averageScore', 'average'], ['completionRate', 'completion']]
    });
    const monthlyStats = [];
    
    res.json({
      totalUsers,
      activeUsers,
      totalClasses,
      totalTPs,
      activeTPs,
      averageClassScore,
      platformUsage,
      recentActivity,
      classPerformance,
      monthlyStats
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({ error: 'Erreur serveur', message: 'Impossible de récupérer les statistiques' });
  }
});

// @route   GET /api/admin/stats-public
// @desc    Test des statistiques sans authentification (PUBLIC)
// @access  Public (pour test)
router.get('/stats-public', async (req, res) => {
  try {
    // Utilisateurs
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    // Classes
    const totalClasses = await Class.count();
    // TPs
    const totalTPs = await TP.count();
    const activeTPs = await TP.count({ where: { status: 'active' } });
    // Moyenne générale (sur tous les résultats)
    const [avgResult] = await Result.findAll({
      attributes: [[Result.sequelize.fn('AVG', Result.sequelize.col('overall_score')), 'avgScore']]
    });
    const averageClassScore = avgResult?.dataValues?.avgScore || 0;
    // Taux d'utilisation fictif
    const platformUsage = Math.floor((activeUsers / (totalUsers || 1)) * 100);
    // Activité récente
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['name', 'email', 'role', 'created_at']
    });
    const recentTPs = await TP.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['title', 'created_at']
    });
    const recentActivity = [
      ...recentUsers.map(u => ({ type: 'user_registered', user: u.name, action: 'Nouvel utilisateur', time: u.created_at })),
      ...recentTPs.map(tp => ({ type: 'tp_created', user: '', action: `Nouveau TP: ${tp.title}`, time: tp.created_at }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
    // Performance par classe
    const classPerformance = await Class.findAll({
      limit: 3,
      order: [['averageScore', 'DESC']],
      attributes: ['name', ['currentStudents', 'students'], ['averageScore', 'average'], ['completionRate', 'completion']]
    });
    const monthlyStats = [];
    
    res.json({
      totalUsers,
      activeUsers,
      totalClasses,
      totalTPs,
      activeTPs,
      averageClassScore,
      platformUsage,
      recentActivity,
      classPerformance,
      monthlyStats
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({ error: 'Erreur serveur', message: 'Impossible de récupérer les statistiques' });
  }
});

export default router; 