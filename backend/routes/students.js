import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Result from '../models/Result.js';
import TP from '../models/TP.js';
import { protect, teacherOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/students
// @desc    Obtenir tous les étudiants
// @access  Private (Enseignants et Admins)
router.get('/', teacherOnly, async (req, res) => {
  try {
    const {
      class: studentClass,
      level,
      limit = 20,
      page = 1,
      search
    } = req.query;

    // Construire le filtre
    const filter = { role: 'student' };
    
    if (studentClass) filter.class = studentClass;
    if (level) filter.level = level;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { class: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await User.find(filter)
      .select('-password')
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les étudiants'
    });
  }
});

// @route   GET /api/students/:id
// @desc    Obtenir un étudiant par ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Vérifier les permissions
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous ne pouvez voir que votre propre profil'
      });
    }

    const student = await User.findById(req.params.id)
      .select('-password');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        error: 'Étudiant non trouvé',
        message: 'L\'étudiant demandé n\'existe pas'
      });
    }

    res.json({
      success: true,
      data: { student }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer l\'étudiant'
    });
  }
});

// @route   GET /api/students/:id/results
// @desc    Obtenir les résultats d'un étudiant
// @access  Private
router.get('/:id/results', protect, async (req, res) => {
  try {
    // Vérifier les permissions
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous ne pouvez voir que vos propres résultats'
      });
    }

    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await Result.find({ student: req.params.id })
      .populate('tp', 'title subject level')
      .populate('simulation', 'title type')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Result.countDocuments({ student: req.params.id });

    // Obtenir les statistiques
    const stats = await Result.getStudentStats(req.params.id);

    res.json({
      success: true,
      data: {
        results,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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

// @route   GET /api/students/:id/tps
// @desc    Obtenir les TP assignés à un étudiant
// @access  Private
router.get('/:id/tps', protect, async (req, res) => {
  try {
    // Vérifier les permissions
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous ne pouvez voir que vos propres TP'
      });
    }

    const { status, limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire le filtre
    const filter = { 'assignedTo.student': req.params.id };
    if (status) filter.status = status;

    const tps = await TP.find(filter)
      .populate('createdBy', 'name email subject')
      .populate('simulations', 'title type thumbnail')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await TP.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tps,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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

// @route   POST /api/students
// @desc    Créer un nouvel étudiant
// @access  Private (Enseignants et Admins)
router.post('/', protect, teacherOnly, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('class')
    .trim()
    .notEmpty()
    .withMessage('La classe est requise'),
  body('level')
    .isIn(['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'])
    .withMessage('Niveau invalide')
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

    const { name, email, password, class: studentClass, level } = req.body;

    // Vérifier si l'étudiant existe déjà
    const existingStudent = await User.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Créer l'étudiant
    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      class: studentClass,
      level
    });

    res.status(201).json({
      success: true,
      message: 'Étudiant créé avec succès',
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          class: student.class,
          level: student.level,
          role: student.role
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer l\'étudiant'
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Mettre à jour un étudiant
// @access  Private (Enseignants et Admins)
router.put('/:id', protect, teacherOnly, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('class')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La classe ne peut pas être vide'),
  body('level')
    .optional()
    .isIn(['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'])
    .withMessage('Niveau invalide')
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

    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        error: 'Étudiant non trouvé',
        message: 'L\'étudiant demandé n\'existe pas'
      });
    }

    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Étudiant mis à jour avec succès',
      data: { student: updatedStudent }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour l\'étudiant'
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Supprimer un étudiant
// @access  Private (Admins seulement)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        error: 'Étudiant non trouvé',
        message: 'L\'étudiant demandé n\'existe pas'
      });
    }

    // Supprimer les résultats associés
    await Result.deleteMany({ student: req.params.id });

    // Supprimer l'étudiant des TP assignés
    await TP.updateMany(
      { 'assignedTo.student': req.params.id },
      { $pull: { assignedTo: { student: req.params.id } } }
    );

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Étudiant supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de supprimer l\'étudiant'
    });
  }
});

// @route   GET /api/students/classes
// @desc    Obtenir toutes les classes
// @access  Private (Enseignants et Admins)
router.get('/classes', teacherOnly, async (req, res) => {
  try {
    const classes = await User.distinct('class', { role: 'student' });
    
    const classStats = await Promise.all(
      classes.map(async (className) => {
        const count = await User.countDocuments({ 
          role: 'student', 
          class: className 
        });
        return { name: className, count };
      })
    );

    res.json({
      success: true,
      data: { classes: classStats }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les classes'
    });
  }
});

// @route   GET /api/students/stats/overview
// @desc    Obtenir les statistiques générales des étudiants
// @access  Private (Enseignants et Admins)
router.get('/stats/overview', teacherOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ 
      role: 'student', 
      isActive: true 
    });

    const classDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const levelDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const recentRegistrations = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email class createdAt');

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        classDistribution,
        levelDistribution,
        recentRegistrations
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les statistiques'
    });
  }
});

export default router; 