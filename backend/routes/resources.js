import express from 'express';
import { body, validationResult } from 'express-validator';
import Resource from '../models/Resource.js';
import { protect, teacherOnly, adminOnly } from '../middleware/auth.js';
import { Class } from '../models/index.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/resources
// @desc    Obtenir toutes les ressources éducatives
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      type,
      category,
      difficulty,
      limit = 20,
      page = 1,
      search
    } = req.query;

    // Construire le filtre selon le rôle
    const filter = {};
    
    if (req.user.role === 'student') {
      // Les étudiants voient seulement les ressources publiées de leur professeur principal
      filter.status = 'published';
      const studentClass = req.user.class;
      if (studentClass) {
        const classData = await Class.findOne({ where: { name: studentClass } });
        if (classData && classData.teacherId) {
          filter.created_by = classData.teacherId;
        } else {
          // Si pas de prof trouvé, on retourne une liste vide
          return res.json({ success: true, data: { resources: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 } } });
        }
      } else {
        // Si pas de classe, on retourne une liste vide
        return res.json({ success: true, data: { resources: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 } } });
      }
    } else if (req.user.role === 'teacher') {
      // Les enseignants voient leurs propres ressources
      filter.created_by = req.user.id;
    }
    // Les admins voient toutes les ressources
    
    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    
    if (search) {
      filter.title = { [Resource.sequelize.Op.like]: `%${search}%` };
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await Resource.findAll({
      where: filter,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const total = await Resource.count({ where: filter });

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des ressources:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les ressources'
    });
  }
});

// @route   GET /api/resources/:id
// @desc    Obtenir une ressource spécifique
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!resource) {
      return res.status(404).json({
        error: 'Ressource non trouvée',
        message: 'La ressource demandée n\'existe pas'
      });
    }

    // Incrémenter le nombre de vues
    await resource.incrementDownloads();

    res.json({
      success: true,
      data: { resource }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la ressource:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la ressource'
    });
  }
});

// @route   POST /api/resources
// @desc    Créer une nouvelle ressource (enseignants/admins)
// @access  Private
router.post('/', protect, teacherOnly, [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('type').isIn(['pdf', 'video', 'audio', 'image']).withMessage('Type invalide'),
  body('category').notEmpty().withMessage('La catégorie est requise'),
  body('difficulty').isIn(['facile', 'moyen', 'difficile']).withMessage('Difficulté invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { 
      title, 
      description, 
      type, 
      category, 
      difficulty, 
      url, 
      thumbnail,
      file_size,
      duration,
      educational,
      tags
    } = req.body;

    const newResource = await Resource.create({
      title,
      description,
      type,
      category,
      difficulty,
      url,
      thumbnail,
      file_size,
      duration,
      educational,
      tags,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Ressource créée avec succès',
      data: { resource: newResource }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la ressource:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer la ressource'
    });
  }
});

// @route   PUT /api/resources/:id
// @desc    Modifier une ressource
// @access  Private (enseignants/admins)
router.put('/:id', protect, teacherOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        error: 'Ressource non trouvée',
        message: 'La ressource demandée n\'existe pas'
      });
    }

    // Vérifier que l'utilisateur peut modifier cette ressource
    if (resource.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas autorisé à modifier cette ressource'
      });
    }

    await resource.update(updates);

    res.json({
      success: true,
      message: 'Ressource mise à jour avec succès',
      data: { resource }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la ressource:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la ressource'
    });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Supprimer une ressource
// @access  Private (admins seulement)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        error: 'Ressource non trouvée',
        message: 'La ressource demandée n\'existe pas'
      });
    }

    await resource.destroy();

    res.json({
      success: true,
      message: 'Ressource supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la ressource:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de supprimer la ressource'
    });
  }
});

// @route   POST /api/resources/:id/download
// @desc    Incrémenter le compteur de téléchargements
// @access  Public
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findByPk(id);
    if (!resource) {
      return res.status(404).json({
        error: 'Ressource non trouvée',
        message: 'La ressource demandée n\'existe pas'
      });
    }

    await resource.incrementDownloads();

    res.json({
      success: true,
      message: 'Téléchargement enregistré',
      data: { downloads: resource.downloads + 1 }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du téléchargement:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'enregistrer le téléchargement'
    });
  }
});

export default router; 