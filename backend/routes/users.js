import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Config multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.params.id || Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// @route   POST /api/users
// @desc    Créer un nouvel utilisateur (admin seulement)
// @access  Private (Admin)
router.post('/', protect, adminOnly, upload.single('avatar'), [
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
  body('role')
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Le rôle doit être student, teacher ou admin'),
  body('class')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La classe ne peut pas dépasser 100 caractères'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La matière ne peut pas dépasser 255 caractères')
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

    const { name, email, password, role, class: userClass, subject } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const userData = {
      name,
      email,
      password,
      role,
      status: 'active'
    };

    // Ajouter les champs optionnels selon le rôle
    if (role === 'student' && userClass) {
      userData.class = userClass;
    }
    if (role === 'teacher' && subject) {
      userData.subject = subject;
    }

    // Gérer l'avatar uploadé
    if (req.file) {
      userData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.create(userData);

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer l\'utilisateur'
    });
  }
});

// @route   GET /api/users
// @desc    Récupérer tous les utilisateurs (admin seulement)
// @access  Private (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, is_active, search } = req.query;
    const offset = (page - 1) * limit;

    // Construire les conditions de filtrage
    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

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
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalItems: users.count,
          itemsPerPage: parseInt(limit)
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

// @route   GET /api/users/inactive
// @desc    Récupérer tous les utilisateurs inactifs (admin seulement)
// @access  Private (Admin)
router.get('/inactive', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    // Construire les conditions de filtrage pour les utilisateurs inactifs
    const where = { is_active: false };
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

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
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalItems: users.count,
          itemsPerPage: parseInt(limit)
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

// @route   DELETE /api/users/:id
// @desc    Supprimer un utilisateur (admin seulement)
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    // Empêcher la suppression de l'admin principal
    if (user.email === 'admin@virtual-lab.com') {
      return res.status(400).json({
        error: 'Suppression interdite',
        message: 'Impossible de supprimer l\'administrateur principal'
      });
    }

    await user.destroy();

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

// @route   PATCH /api/users/:id/status
// @desc    Activer/désactiver un utilisateur (admin seulement)
// @access  Private (Admin)
router.patch('/:id/status', protect, adminOnly, [
  body('is_active')
    .isBoolean()
    .withMessage('Le statut doit être un booléen')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
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

    res.json({
      success: true,
      message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`,
      data: { user: { id: user.id, is_active: user.is_active } }
    });

  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de modifier le statut'
    });
  }
});

// @route   POST /api/users/:id/reset-password
// @desc    Réinitialiser le mot de passe d'un utilisateur (admin seulement)
// @access  Private (Admin)
router.post('/:id/reset-password', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    // Générer un nouveau mot de passe aléatoire
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      data: { newPassword }
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de réinitialiser le mot de passe'
    });
  }
});

// @route   GET /api/users/profile
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le profil'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Mettre à jour le profil de l'utilisateur connecté
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Veuillez entrer un numéro de téléphone valide'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date de naissance invalide'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Le thème doit être light, dark ou auto'),
  body('preferences.language')
    .optional()
    .isIn(['fr', 'en'])
    .withMessage('La langue doit être fr ou en'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('La notification email doit être un booléen'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('La notification push doit être un booléen')
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

    const {
      name,
      phone,
      address,
      dateOfBirth,
      preferences
    } = req.body;

    // Champs autorisés pour la mise à jour
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
    if (preferences) {
      updateFields.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le profil'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Changer le mot de passe
// @access  Private
router.put('/password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
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

    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'Mot de passe incorrect',
        message: 'Le mot de passe actuel est incorrect'
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de modifier le mot de passe'
    });
  }
});

// @route   POST /api/users/avatar
// @desc    Mettre à jour l'avatar
// @access  Private
router.post('/avatar', protect, [
  body('avatar')
    .isURL()
    .withMessage('L\'URL de l\'avatar doit être valide')
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

    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'avatar:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour l\'avatar'
    });
  }
});

// @route   GET /api/users/search
// @desc    Rechercher des utilisateurs (pour les enseignants)
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, role, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Requête invalide',
        message: 'La recherche doit contenir au moins 2 caractères'
      });
    }

    // Construire le filtre
    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    if (role) filter.role = role;

    // Les étudiants ne peuvent rechercher que d'autres étudiants
    if (req.user.role === 'student') {
      filter.role = 'student';
    }

    const users = await User.find(filter)
      .select('name email role class subject avatar')
      .limit(parseInt(limit))
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de rechercher les utilisateurs'
    });
  }
});

// @route   GET /api/users/notifications
// @desc    Obtenir les notifications de l'utilisateur
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    // Pour l'instant, on retourne des notifications de démonstration
    // En production, vous auriez un modèle Notification
    const notifications = [
      {
        id: '1',
        type: 'tp_assigned',
        title: 'Nouveau TP assigné',
        message: 'Un nouveau TP a été assigné à votre classe',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 heures ago
      },
      {
        id: '2',
        type: 'result_available',
        title: 'Résultats disponibles',
        message: 'Les résultats de votre dernier TP sont disponibles',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 jour ago
      }
    ];

    res.json({
      success: true,
      data: { notifications }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les notifications'
    });
  }
});

// @route   PUT /api/users/notifications/:id/read
// @desc    Marquer une notification comme lue
// @access  Private
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    // En production, vous mettriez à jour la notification dans la base de données
    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la notification'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Modifier un utilisateur (admin seulement)
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, class: userClass, subject, is_active } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé', message: 'L\'utilisateur n\'existe pas' });
    }
    
    // Empêcher la désactivation de l'admin principal
    if (user.email === 'admin@virtual-lab.com' && is_active === false) {
      return res.status(400).json({
        error: 'Désactivation interdite',
        message: 'Impossible de désactiver l\'administrateur principal'
      });
    }
    
    // Mettre à jour les champs
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (userClass) user.class = userClass;
    if (subject) user.subject = subject;
    if (is_active !== undefined) user.is_active = is_active;
    
    // Gestion de l'avatar
    if (req.file) {
      // Supprimer l'ancien avatar si existant
      if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
        try { fs.unlinkSync(path.join(process.cwd(), user.avatar)); } catch {}
      }
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    await user.save();
    const userResponse = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.json({ success: true, message: 'Utilisateur modifié avec succès', data: { user: userResponse } });
  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur', message: 'Impossible de modifier l\'utilisateur' });
  }
});

export default router; 