import express from 'express';
import { body, validationResult } from 'express-validator';
import News from '../models/News.js';
import User from '../models/User.js';
import { protect, teacherOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/news
// @desc    Obtenir toutes les actualités
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      type,
      target_audience,
      pinned,
      limit = 20,
      page = 1,
      search
    } = req.query;

    // Construire le filtre
    const filter = { status: 'published' };
    
    if (type && type !== 'all') filter.type = type;
    if (target_audience && target_audience !== 'all') filter.target_audience = target_audience;
    if (pinned !== undefined) filter.pinned = pinned === 'true';
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const news = await News.findAll({
      where: filter,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ],
      order: [
        ['pinned', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: parseInt(limit),
      offset: skip
    });

    const total = await News.count({ where: filter });

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les actualités'
    });
  }
});

// @route   GET /api/news/:id
// @desc    Obtenir une actualité spécifique
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ]
    });

    if (!news) {
      return res.status(404).json({
        error: 'Actualité non trouvée',
        message: 'L\'actualité demandée n\'existe pas'
      });
    }

    // Incrémenter le nombre de vues
    await news.increment('views');

    res.json({
      success: true,
      data: { news }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer l\'actualité'
    });
  }
});

// @route   POST /api/news
// @desc    Créer une nouvelle actualité (enseignants/admins)
// @access  Private
router.post('/', protect, teacherOnly, [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('content').notEmpty().withMessage('Le contenu est requis'),
  body('type').isIn(['info', 'reminder', 'urgent', 'event']).withMessage('Type invalide'),
  body('target_audience').isIn(['all', 'students', 'teachers', 'admins']).withMessage('Audience cible invalide')
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
      content, 
      type, 
      target_audience, 
      pinned, 
      tags, 
      attachments 
    } = req.body;

    const newNews = await News.create({
      title,
      content,
      type,
      target_audience,
      pinned: pinned || false,
      tags: tags || [],
      attachments: attachments || [],
      author_id: req.user.id,
      views: 0
    });

    // Récupérer l'actualité avec les informations de l'auteur
    const newsWithAuthor = await News.findByPk(newNews.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Actualité créée avec succès',
      data: { news: newsWithAuthor }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer l\'actualité'
    });
  }
});

// @route   PUT /api/news/:id
// @desc    Modifier une actualité
// @access  Private (auteur ou admins)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({
        error: 'Actualité non trouvée',
        message: 'L\'actualité demandée n\'existe pas'
      });
    }

    // Vérifier que l'utilisateur peut modifier cette actualité
    if (news.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas autorisé à modifier cette actualité'
      });
    }

    await news.update(updates);

    // Récupérer l'actualité mise à jour avec les informations de l'auteur
    const updatedNews = await News.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Actualité mise à jour avec succès',
      data: { news: updatedNews }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour l\'actualité'
    });
  }
});

// @route   DELETE /api/news/:id
// @desc    Supprimer une actualité
// @access  Private (auteur ou admins)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({
        error: 'Actualité non trouvée',
        message: 'L\'actualité demandée n\'existe pas'
      });
    }

    // Vérifier que l'utilisateur peut supprimer cette actualité
    if (news.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous n\'êtes pas autorisé à supprimer cette actualité'
      });
    }

    await news.destroy();

    res.json({
      success: true,
      message: 'Actualité supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'actualité:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de supprimer l\'actualité'
    });
  }
});

// @route   PUT /api/news/:id/pin
// @desc    Épingler/désépingler une actualité
// @access  Private (admins seulement)
router.put('/:id/pin', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { pinned } = req.body;

    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({
        error: 'Actualité non trouvée',
        message: 'L\'actualité demandée n\'existe pas'
      });
    }

    await news.update({ pinned: pinned || !news.pinned });

    res.json({
      success: true,
      message: `Actualité ${news.pinned ? 'épinglée' : 'désépinglée'} avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la modification du statut épinglé:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de modifier le statut épinglé'
    });
  }
});

export default router; 