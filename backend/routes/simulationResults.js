import express from 'express';
import { body, validationResult } from 'express-validator';
import SimulationResult from '../models/SimulationResult.js';
import User from '../models/User.js';
import { protect, teacherOnly } from '../middleware/auth.js';

const router = express.Router();

// POST /api/simulation-results - Enregistrer un résultat de simulation
router.post('/', protect, [
  body('simulation_type')
    .trim()
    .notEmpty()
    .withMessage('Le type de simulation est requis'),
  body('class_code')
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Le code de classe doit contenir entre 4 et 10 caractères'),
  body('note')
    .isInt({ min: 0, max: 20 })
    .withMessage('La note doit être entre 0 et 20'),
  body('completion_time')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le temps de completion doit être positif')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        details: errors.array()
      });
    }

    const { simulation_type, class_code, note, completion_time, details } = req.body;
    const student_id = req.user.id;

    // Vérifier si l'utilisateur est un étudiant
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les étudiants peuvent enregistrer des résultats de simulation'
      });
    }

    // Vérifier si un résultat existe déjà pour cet étudiant et cette simulation
    const existingResult = await SimulationResult.findOne({
      where: {
        student_id,
        simulation_type,
        class_code
      }
    });

    if (existingResult) {
      if (existingResult.note > 0) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà validé cette simulation'
        });
      } else {
        // Mettre à jour l'entrée existante (in_progress)
        existingResult.note = note;
        existingResult.completion_time = completion_time;
        existingResult.details = details;
        await existingResult.save();
        // Récupérer le résultat avec les informations de l'étudiant
        const populatedResult = await SimulationResult.findByPk(existingResult.id, {
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'email', 'class']
            }
          ]
        });
        return res.status(200).json({
          success: true,
          message: 'Résultat mis à jour avec succès',
          data: {
            result: populatedResult
          }
        });
      }
    }

    // Créer le résultat
    const result = await SimulationResult.create({
      student_id,
      simulation_type,
      class_code,
      note,
      completion_time,
      details
    });

    // Récupérer le résultat avec les informations de l'étudiant
    const populatedResult = await SimulationResult.findByPk(result.id, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'class']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Résultat enregistré avec succès',
      data: {
        result: populatedResult
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du résultat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du résultat'
    });
  }
});

// POST /api/simulation-results/start - Enregistrer le début d'une simulation (in_progress)
router.post('/start', protect, [
  body('simulation_type')
    .trim()
    .notEmpty()
    .withMessage('Le type de simulation est requis'),
  body('class_code')
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage('Le code de classe doit contenir entre 4 et 10 caractères'),
  body('status')
    .optional()
    .isIn(['in_progress'])
    .withMessage('Le statut doit être "in_progress"'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        details: errors.array()
      });
    }

    const { simulation_type, class_code } = req.body;
    const student_id = req.user.id;

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les étudiants peuvent enregistrer le début d\'une simulation'
      });
    }

    // Vérifier si une entrée in_progress existe déjà
    const existing = await SimulationResult.findOne({
      where: {
        student_id,
        simulation_type,
        class_code
      }
    });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Simulation déjà commencée',
        data: { result: existing }
      });
    }

    // Créer l'entrée in_progress (note null)
    const result = await SimulationResult.create({
      student_id,
      simulation_type,
      class_code,
      note: 0, // ou null si le modèle l'accepte
      details: { status: 'in_progress' }
    });

    res.status(201).json({
      success: true,
      message: 'Début de simulation enregistré',
      data: { result }
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du début de simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du début de simulation'
    });
  }
});

// GET /api/simulation-results - Récupérer les résultats d'une simulation
router.get('/', protect, async (req, res) => {
  try {
    const { simulation_type, class_code, limit = 50, page = 1 } = req.query;

    // Construire les conditions de filtrage
    const whereClause = {};
    
    if (simulation_type) whereClause.simulation_type = simulation_type;
    if (class_code) whereClause.class_code = class_code;

    // Les professeurs voient tous les résultats, les étudiants ne voient que les leurs
    if (req.user.role === 'student') {
      whereClause.student_id = req.user.id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const results = await SimulationResult.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'class']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculer les statistiques
    const stats = {
      total: results.count,
      average: results.count > 0 
        ? Math.round(results.rows.reduce((sum, r) => sum + r.note, 0) / results.count)
        : 0,
      max: results.count > 0 ? Math.max(...results.rows.map(r => r.note)) : 0,
      min: results.count > 0 ? Math.min(...results.rows.map(r => r.note)) : 0
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
          totalPages: Math.ceil(results.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des résultats'
    });
  }
});

export default router; 