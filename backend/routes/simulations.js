import express from 'express';
import { body, validationResult } from 'express-validator';
import Simulation from '../models/Simulation.js';
import { protect, teacherOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/simulations
// @desc    Obtenir toutes les simulations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      type,
      difficulty,
      level,
      status = 'published',
      limit = 20,
      page = 1,
      search
    } = req.query;

    // Construire le filtre selon le rôle
    const filter = {};
    
    if (req.user.role === 'student') {
      // Les étudiants voient seulement les simulations publiées
      filter.status = 'published';
    } else if (req.user.role === 'teacher') {
      // Les enseignants voient leurs propres simulations
      filter.created_by = req.user.id;
    }
    // Les admins voient toutes les simulations

    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (level) filter.level = level;
    if (status && req.user.role !== 'student') filter.status = status;
    if (search) {
      filter.title = { [Simulation.sequelize.Op.like]: `%${search}%` };
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const simulations = await Simulation.findAll({
      where: filter,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const total = await Simulation.count({ where: filter });

    res.json({
      success: true,
      data: {
        simulations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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

// @route   GET /api/simulations/:id
// @desc    Obtenir une simulation par ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const simulation = await Simulation.findByPk(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        error: 'Simulation non trouvée',
        message: 'La simulation demandée n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'student') {
      // Les étudiants ne peuvent voir que les simulations publiées
      if (simulation.status !== 'published') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Cette simulation n\'est pas accessible'
        });
      }
    } else if (req.user.role === 'teacher') {
      // Les enseignants ne peuvent voir que leurs propres simulations
      if (simulation.created_by !== req.user.id) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous n\'avez pas les permissions pour voir cette simulation'
        });
      }
    }
    // Les admins peuvent voir toutes les simulations

    res.json({ success: true, data: { simulation } });
  } catch (error) {
    console.error('Erreur lors de la récupération de la simulation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la simulation'
    });
  }
});

// @route   POST /api/simulations
// @desc    Créer une nouvelle simulation
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
  body('type')
    .isIn(['respiration', 'agglutination', 'hiv-aids', 'fermentation', 'la degradation des elemets radioactifs'])
    .withMessage('Type de simulation invalide'),
  body('difficulty')
    .isIn(['facile', 'moyen', 'difficile'])
    .withMessage('Difficulté invalide'),
  body('duration')
    .isInt({ min: 5, max: 180 })
    .withMessage('La durée doit être entre 5 et 180 minutes'),
  body('educational.level')
    .isIn(['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'])
    .withMessage('Niveau éducatif invalide')
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

    const simulationData = {
      ...req.body,
      createdBy: req.user.id
    };

    const simulation = await Simulation.create(simulationData);

    res.status(201).json({
      success: true,
      message: 'Simulation créée avec succès',
      data: { simulation }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la simulation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer la simulation'
    });
  }
});

// @route   PUT /api/simulations/:id
// @desc    Mettre à jour une simulation
// @access  Private (Créateur, Enseignants et Admins)
router.put('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const simulation = await Simulation.findByPk(req.params.id);

    if (!simulation) {
      return res.status(404).json({
        error: 'Simulation non trouvée',
        message: 'La simulation demandée n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (simulation.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour modifier cette simulation'
      });
    }

    const updatedSimulation = await Simulation.findByPk(req.params.id, {
      where: req.body,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Simulation mise à jour avec succès',
      data: { simulation: updatedSimulation }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la simulation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la simulation'
    });
  }
});

// @route   DELETE /api/simulations/:id
// @desc    Supprimer une simulation
// @access  Private (Créateur et Admins)
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const simulation = await Simulation.findByPk(req.params.id);

    if (!simulation) {
      return res.status(404).json({
        error: 'Simulation non trouvée',
        message: 'La simulation demandée n\'existe pas'
      });
    }

    // Vérifier les permissions
    if (simulation.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions pour supprimer cette simulation'
      });
    }

    await Simulation.destroy({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Simulation supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la simulation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de supprimer la simulation'
    });
  }
});

// @route   POST /api/simulations/:id/complete
// @desc    Enregistrer la completion d'une simulation
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const { score, time } = req.body;

    const simulation = await Simulation.findByPk(req.params.id);

    if (!simulation) {
      return res.status(404).json({
        error: 'Simulation non trouvée',
        message: 'La simulation demandée n\'existe pas'
      });
    }

    // Enregistrer la completion
    await simulation.recordCompletion(score, time);

    res.json({
      success: true,
      message: 'Completion enregistrée avec succès',
      data: {
        simulation: {
          id: simulation.id,
          title: simulation.title,
          stats: simulation.stats
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la completion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'enregistrer la completion'
    });
  }
});

// @route   GET /api/simulations/types
// @desc    Obtenir les types de simulations disponibles
// @access  Public
router.get('/types', async (req, res) => {
  try {
    const types = [
      {
        id: 'respiration',
        name: 'Respiration',
        icon: '🫁',
        description: 'Simulations liées à la respiration cellulaire et aux échanges gazeux'
      },
      {
        id: 'agglutination',
        name: 'Groupes Sanguins',
        icon: '🩸',
        description: 'Expériences sur les groupes sanguins et les réactions d\'agglutination'
      },
      {
        id: 'hiv-aids',
        name: 'VIH/SIDA',
        icon: '🦠',
        description: 'Simulations du dysfonctionnement du système immunitaire'
      },
      {
        id: 'fermentation',
        name: 'Fermentation',
        icon: '🍎',
        description: 'Processus de fermentation et transformations biochimiques'
      },
      {
        id: 'la degradation des elemets radioactifs',
        name: 'Dégradation Radioactive',
        icon: '❤️',
        description: 'Étude de la dégradation des éléments radioactifs'
      }
    ];

    res.json({
      success: true,
      data: { types }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des types:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les types de simulations'
    });
  }
});

// @route   POST /api/simulations/demo
// @desc    Créer des simulations de démonstration
// @access  Private (Admins seulement)
router.post('/demo', adminOnly, async (req, res) => {
  try {
    // Supprimer les simulations de démonstration existantes
    await Simulation.destroy({
      where: {
        title: {
          [Simulation.sequelize.Op.in]: [
            'Respiration Cellulaire et Échanges Gazeux',
            'Groupes Sanguins et Réaction d\'Agglutination',
            'VIH/SIDA et Dysfonctionnement du Système Immunitaire',
            'fermentation alcoolique',
            'Circulation Sanguine et Fonction Cardiaque'
          ]
        }
      }
    });

    // Créer les simulations de démonstration
    const demoSimulations = [];
    const types = ['respiration', 'agglutination', 'hiv-aids', 'fermentation', 'la degradation des elemets radioactifs'];

    for (const type of types) {
      const simulation = await Simulation.createDemoSimulation(type, req.user.id);
      demoSimulations.push(simulation);
    }

    res.json({
      success: true,
      message: 'Simulations de démonstration créées avec succès',
      data: {
        count: demoSimulations.length,
        simulations: demoSimulations.map(sim => ({
          id: sim.id,
          title: sim.title,
          type: sim.type,
          difficulty: sim.difficulty
        }))
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création des simulations de démonstration:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer les simulations de démonstration'
    });
  }
});

export default router; 