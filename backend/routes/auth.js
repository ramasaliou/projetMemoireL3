import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', [
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
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('La classe est requise pour les étudiants'),
  body('subject')
    .if(body('role').equals('teacher'))
    .notEmpty()
    .withMessage('La matière est requise pour les enseignants')
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

    const { name, email, password, role, class: studentClass, subject } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const userData = {
      name,
      email,
      password,
      role
    };

    // Ajouter les champs spécifiques selon le rôle
    if (role === 'student') {
      userData.class = studentClass;
      userData.level = '3ème'; // Par défaut
    } else if (role === 'teacher') {
      userData.subject = subject;
    }

    const user = await User.create(userData);

    // Générer le token
    const token = generateToken(user._id);

    // Mettre à jour la dernière connexion
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          class: user.class,
          subject: user.subject
        },
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer l\'utilisateur'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authentifier un utilisateur
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array()
      });
    }
    const { email, password } = req.body;
    // Sequelize: pas de .select(), juste findOne
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        message: 'Aucun utilisateur avec cet email'
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.'
      });
    }
    
    // Vérifier le mot de passe (méthode d'instance)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Mot de passe incorrect',
        message: 'Mot de passe incorrect'
      });
    }
    
    // Mettre à jour la dernière connexion
    await user.updateLastLogin();
    
    // Générer le token JWT
    const token = user.generateJWT();
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          is_active: user.is_active
        },
        token
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de se connecter'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obtenir les informations de l'utilisateur connecté
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur n\'existe pas'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          class: user.class,
          subject: user.subject,
          level: user.level,
          specialization: user.specialization,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          isActive: user.is_active,
          lastLogin: user.last_login,
          preferences: user.preferences,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les informations utilisateur'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Mettre à jour le profil utilisateur
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
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Le thème doit être light, dark ou auto'),
  body('preferences.language')
    .optional()
    .isIn(['fr', 'en'])
    .withMessage('La langue doit être fr ou en')
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

    const { name, phone, address, dateOfBirth, preferences } = req.body;

    // Champs autorisés pour la mise à jour
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (preferences) updateFields.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          class: user.class,
          subject: user.subject,
          level: user.level,
          specialization: user.specialization,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le profil'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Déconnexion (côté client)
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // En production, vous pourriez ajouter le token à une liste noire
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de se déconnecter'
    });
  }
});

// @route   POST /api/auth/demo
// @desc    Créer des utilisateurs de démonstration
// @access  Public (à protéger en production)
router.post('/demo', async (req, res) => {
  try {
    // Supprimer les utilisateurs de démonstration existants
    await User.deleteMany({
      email: {
        $in: [
          'lewis.diatta@lycee.com',
          'saliou.ndiaye@lycee.com',
          'rama.niang@lycee.com'
        ]
      }
    });

    // Créer les utilisateurs de démonstration
    const demoStudent = await User.createDemoUser('student');
    const demoTeacher = await User.createDemoUser('teacher');
    const demoAdmin = await User.createDemoUser('admin');

    res.json({
      success: true,
      message: 'Utilisateurs de démonstration créés avec succès',
      data: {
        users: [
          {
            role: 'student',
            email: demoStudent.email,
            password: 'demo123'
          },
          {
            role: 'teacher',
            email: demoTeacher.email,
            password: 'demo123'
          },
          {
            role: 'admin',
            email: demoAdmin.email,
            password: 'demo123'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs de démonstration:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de créer les utilisateurs de démonstration'
    });
  }
});

export default router; 