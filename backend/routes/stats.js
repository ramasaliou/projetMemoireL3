import express from 'express';
import { User, Class, TP, Result } from '../models/index.js';

const router = express.Router();

// @route   GET /api/stats/public
// @desc    Statistiques publiques pour le dashboard (sans authentification)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    // Statistiques de base avec gestion d'erreur
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalClasses: 0,
      totalTPs: 0,
      activeTPs: 0,
      averageClassScore: 0,
      platformUsage: 0,
      recentActivity: [],
      classPerformance: [],
      monthlyStats: []
    };

    try {
      stats.totalUsers = await User.count();
    } catch (error) {
      console.log('Erreur comptage utilisateurs:', error.message);
    }

    try {
      stats.activeUsers = await User.count({ where: { is_active: true } });
    } catch (error) {
      console.log('Erreur comptage utilisateurs actifs:', error.message);
    }

    try {
      stats.totalClasses = await Class.count();
    } catch (error) {
      console.log('Erreur comptage classes:', error.message);
    }

    try {
      stats.totalTPs = await TP.count();
    } catch (error) {
      console.log('Erreur comptage TPs:', error.message);
    }

    try {
      stats.activeTPs = await TP.count({ where: { status: 'active' } });
    } catch (error) {
      console.log('Erreur comptage TPs actifs:', error.message);
    }

    // Calcul de la moyenne des scores avec gestion d'erreur
    try {
      const [avgResult] = await Result.findAll({
        attributes: [[Result.sequelize.fn('AVG', Result.sequelize.col('overall_score')), 'avgScore']],
        raw: true
      });
      stats.averageClassScore = parseFloat(avgResult?.avgScore || 0).toFixed(2);
    } catch (error) {
      console.log('Erreur calcul moyenne scores:', error.message);
    }

    // Taux d'utilisation
    stats.platformUsage = stats.totalUsers > 0 ? Math.floor((stats.activeUsers / stats.totalUsers) * 100) : 0;

    // Activité récente avec gestion d'erreur
    try {
      const recentUsers = await User.findAll({
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['name', 'email', 'role', 'created_at'],
        raw: true
      });

      const recentTPs = await TP.findAll({
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['title', 'created_at'],
        raw: true
      });

      stats.recentActivity = [
        ...recentUsers.map(u => ({ 
          type: 'user_registered', 
          user: u.name || 'Utilisateur', 
          action: 'Nouvel utilisateur', 
          time: u.created_at 
        })),
        ...recentTPs.map(tp => ({ 
          type: 'tp_created', 
          user: '', 
          action: `Nouveau TP: ${tp.title || 'TP'}`, 
          time: tp.created_at 
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
    } catch (error) {
      console.log('Erreur activité récente:', error.message);
    }

    // Performance par classe avec gestion d'erreur
    try {
      const classPerformance = await Class.findAll({
        limit: 3,
        order: [['average_score', 'DESC']],
        attributes: [
          'name', 
          ['current_students', 'students'], 
          ['average_score', 'average'], 
          ['completion_rate', 'completion']
        ],
        raw: true
      });

      stats.classPerformance = classPerformance.map(cls => ({
        name: cls.name || 'Classe',
        students: cls.students || 0,
        average: parseFloat(cls.average || 0).toFixed(2),
        completion: parseFloat(cls.completion || 0).toFixed(2)
      }));
    } catch (error) {
      console.log('Erreur performance classes:', error.message);
    }

    // Statistiques mensuelles fictives
    stats.monthlyStats = [
      { month: 'Jan', users: Math.floor(Math.random() * 50) + 10, tps: Math.floor(Math.random() * 20) + 5 },
      { month: 'Fév', users: Math.floor(Math.random() * 50) + 15, tps: Math.floor(Math.random() * 20) + 8 },
      { month: 'Mar', users: Math.floor(Math.random() * 50) + 20, tps: Math.floor(Math.random() * 20) + 12 },
      { month: 'Avr', users: Math.floor(Math.random() * 50) + 25, tps: Math.floor(Math.random() * 20) + 15 },
      { month: 'Mai', users: Math.floor(Math.random() * 50) + 30, tps: Math.floor(Math.random() * 20) + 18 },
      { month: 'Juin', users: Math.floor(Math.random() * 50) + 35, tps: Math.floor(Math.random() * 20) + 20 }
    ];

    res.json(stats);
  } catch (error) {
    console.error('Erreur générale stats:', error);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      message: 'Impossible de récupérer les statistiques',
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        totalClasses: 0,
        totalTPs: 0,
        activeTPs: 0,
        averageClassScore: 0,
        platformUsage: 0,
        recentActivity: [],
        classPerformance: [],
        monthlyStats: []
      }
    });
  }
});

export default router; 