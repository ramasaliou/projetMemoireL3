import express from 'express';
import { body, validationResult } from 'express-validator';
import TP from '../models/TP.js';
import User from '../models/User.js';
import { protect, teacherOnly, adminOnly } from '../middleware/auth.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/pdfs/' });

const router = express.Router();

// @route   GET /api/tps
// @desc    Obtenir tous les TP
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

    // Construire le filtre selon le rôle
    let whereClause = {};
    
    if (req.user.role === 'student') {
      // Les étudiants voient seulement les TP qui leur sont assignés
      // TODO: Implémenter la logique d'assignation pour les étudiants
      whereClause = { status: 'active' };
    } else if (req.user.role === 'teacher') {
      // Les enseignants voient leurs propres TP
      whereClause.created_by = req.user.id;
    }
    // Les admins voient tous les TP

    if (status) whereClause.status = status;
    if (subject) whereClause.subject = subject;
    if (level) whereClause.level = level;
    if (createdBy) whereClause.created_by = createdBy;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const tps = await TP.findAll({
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

    const total = await TP.count({ where: whereClause });

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

// @route   GET /api/tps/:id
// @desc    Obtenir un TP par ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const tp = await TP.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email', 'subject'] }
      ]
    });

    if (!tp) {
      return res.status(404).json({
        error: 'TP non trouvé',
        message: 'Le TP demandé n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'student') {
      const isAssigned = Array.isArray(tp.assigned_to) && tp.assigned_to.some(
        assignment => assignment.student_id == req.user.id
      );
      if (!isAssigned) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Ce TP ne vous est pas assigné'
        });
      }
    } else if (req.user.role === 'teacher' && tp.created_by !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour voir ce TP'
      });
    }

    res.json({
      success: true,
      data: { tp }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le TP'
    });
  }
});

// @route   POST /api/tps
// @desc    Créer un nouveau TP
// @access  Private (Enseignants et Admins)
router.post('/', protect, teacherOnly, upload.single('pdf'), [
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
  console.log('--- Création TP/Cours ---');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    // Gestion du PDF
    let resources = null;
    if (req.file) {
      resources = JSON.stringify({ pdfUrl: req.file.path });
    }

    const tpData = {
      ...req.body,
      resources,
      created_by: req.user.id // Forcer l'association au professeur connecté
    };

    const tp = await TP.create(tpData);

    const populatedTP = await TP.findByPk(tp.id, {
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email', 'subject'] }
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

// @route   PUT /api/tps/:id
// @desc    Mettre à jour un TP
// @access  Private (Créateur et Admins)
router.put('/:id', protect, teacherOnly, upload.single('pdf'), async (req, res) => {
  try {
    const tp = await TP.findByPk(req.params.id);

    if (!tp) {
      return res.status(404).json({
        error: 'TP non trouvé',
        message: 'Le TP demandé n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (tp.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour modifier ce TP'
      });
    }

    // Gestion du PDF
    let resources = tp.resources;
    if (req.file) {
      // Si resources est un objet ou un tableau, on le gère
      if (!resources || resources === null || resources === '' || resources === 'null') {
        resources = { pdfUrl: req.file.path };
      } else if (typeof resources === 'string') {
        try { resources = JSON.parse(resources); } catch { resources = {}; }
        resources.pdfUrl = req.file.path;
      } else if (typeof resources === 'object') {
        resources.pdfUrl = req.file.path;
      }
    }

    // Préparer les données à mettre à jour
    const updateData = { ...req.body };
    if (req.file) {
      updateData.resources = JSON.stringify(resources);
    }

    await tp.update(updateData);

    const updatedTP = await TP.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email', 'subject'] }
      ]
    });

    res.json({
      success: true,
      message: 'TP mis à jour avec succès',
      data: { tp: updatedTP }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le TP'
    });
  }
});

// @route   DELETE /api/tps/:id
// @desc    Supprimer un TP
// @access  Private (Créateur et Admins)
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const tp = await TP.findByPk(req.params.id);

    if (!tp) {
      return res.status(404).json({
        error: 'TP non trouvé',
        message: 'Le TP demandé n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (tp.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour supprimer ce TP'
      });
    }

    await tp.destroy();

    res.json({
      success: true,
      message: 'TP supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de supprimer le TP'
    });
  }
});

// @route   POST /api/tps/:id/assign
// @desc    Assigner un TP à des étudiants
// @access  Private (Enseignants et Admins)
router.post('/:id/assign', protect, teacherOnly, [
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('Au moins un étudiant doit être sélectionné'),
  body('studentIds.*')
    .isInt()
    .withMessage('ID d\'étudiant invalide'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Date limite invalide')
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

    const { studentIds, dueDate } = req.body;

    const tp = await TP.findByPk(req.params.id);
    if (!tp) {
      return res.status(404).json({
        error: 'TP non trouvé',
        message: 'Le TP demandé n\'existe pas'
      });
    }

    // Vérifier que les étudiants existent
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

    // Assigner le TP aux étudiants
    const assignments = [];
    for (const studentId of studentIds) {
      try {
        await tp.assignToStudent(studentId, dueDate ? new Date(dueDate) : null);
        assignments.push(studentId);
      } catch (error) {
        console.error(`Erreur lors de l'assignation à l'étudiant ${studentId}:`, error);
      }
    }

    const updatedTP = await TP.findByPk(req.params.id);

    res.json({
      success: true,
      message: `TP assigné à ${assignments.length} étudiant(s)` ,
      data: {
        tp: updatedTP,
        assignedCount: assignments.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'assigner le TP'
    });
  }
});

// @route   POST /api/tps/:id/complete
// @desc    Marquer un TP comme terminé
// @access  Private
router.post('/:id/complete', protect, [
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Le score doit être entre 0 et 100'),
  body('timeSpent')
    .isInt({ min: 1 })
    .withMessage('Le temps passé doit être positif')
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

    const { score, timeSpent } = req.body;

    const tp = await TP.findByPk(req.params.id);
    if (!tp) {
      return res.status(404).json({
        error: 'TP non trouvé',
        message: 'Le TP demandé n\'existe pas'
      });
    }

    // Marquer comme terminé
    await tp.completeAssignment(req.user.id, score, timeSpent);

    res.json({
      success: true,
      message: 'TP terminé avec succès',
      data: { score, timeSpent }
    });

  } catch (error) {
    console.error('Erreur lors de la completion du TP:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de terminer le TP'
    });
  }
});

// @route   POST /api/tps/demo
// @desc    Créer des TP de démonstration
// @access  Private (Admins seulement)
router.post('/demo', adminOnly, async (req, res) => {
  try {
    // Supprimer les TP de démonstration existants
    await TP.deleteMany({
      title: {
        $in: [
          'Respiration Cellulaire et Échanges Gazeux',
          'Groupes Sanguins et Compatibilité Transfusionnelle',
          'VIH/SIDA et Système Immunitaire',
          'fermentation alcoolique'
        ]
      }
    });

    // Créer les TP de démonstration
    const demoTP = await TP.createDemoTP(req.user.id);

    res.json({
      success: true,
      message: 'TP de démonstration créé avec succès',
      data: {
        tp: {
          id: demoTP._id,
          title: demoTP.title,
          subject: demoTP.subject,
          level: demoTP.level,
          status: demoTP.status
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du TP de démonstration:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer le TP de démonstration'
    });
  }
});

export default router; 