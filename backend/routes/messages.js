import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Message, User } from '../models/index.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(protect);

// @route   GET /api/messages
// @desc    Obtenir les conversations de l'utilisateur connecté
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { limit = 50, page = 1, search } = req.query;
    const userId = req.user.id;

    // Récupérer les conversations (derniers messages avec chaque utilisateur)
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Grouper par conversation (par utilisateur)
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const otherUser = message.sender_id === userId ? message.receiver : message.sender;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0
        });
      } else {
        const conversation = conversationMap.get(otherUserId);
        if (message.created_at > conversation.lastMessage.created_at) {
          conversation.lastMessage = message;
        }
      }
      
      // Compter les messages non lus
      if (message.receiver_id === userId && !message.read) {
        conversationMap.get(otherUserId).unreadCount++;
      }
    });

    const conversationsList = Array.from(conversationMap.values());

    res.json({
      success: true,
      data: {
        conversations: conversationsList,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: conversationsList.length
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les conversations'
    });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Obtenir une conversation spécifique avec un utilisateur
// @access  Private
router.get('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { limit = 50, page = 1 } = req.query;

    // Vérifier que l'utilisateur existe
    const otherUser = await User.findByPk(userId);
    if (!otherUser) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas'
      });
    }

    // Récupérer les messages de la conversation
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: currentUserId, receiver_id: userId },
          { sender_id: userId, receiver_id: currentUserId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ],
      order: [['created_at', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Marquer les messages comme lus
    await Message.update(
      { read: true, read_at: new Date() },
      {
        where: {
          sender_id: userId,
          receiver_id: currentUserId,
          read: false
        }
      }
    );

    res.json({
      success: true,
      data: {
        messages,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role,
          avatar: otherUser.avatar
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: messages.length
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la conversation'
    });
  }
});

// @route   POST /api/messages
// @desc    Envoyer un nouveau message
// @access  Private
router.post('/', [
  body('receiver_id')
    .isInt()
    .withMessage('ID du destinataire invalide'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Le sujet doit contenir entre 1 et 255 caractères'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Le contenu ne peut pas être vide'),
  body('message_type')
    .optional()
    .isIn(['general', 'question', 'feedback', 'announcement'])
    .withMessage('Type de message invalide'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priorité invalide')
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
      receiver_id,
      subject,
      content,
      message_type = 'general',
      priority = 'normal',
      attachments = []
    } = req.body;

    const senderId = req.user.id;

    // Vérifier que le destinataire existe
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        error: 'Destinataire non trouvé',
        message: 'L\'utilisateur destinataire n\'existe pas'
      });
    }

    // Créer le message
    const message = await Message.create({
      sender_id: senderId,
      receiver_id,
      subject,
      content,
      message_type,
      priority,
      attachments,
      sent_at: new Date()
    });

    // Récupérer le message avec les informations des utilisateurs
    const messageWithUsers = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: { message: messageWithUsers }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible d\'envoyer le message'
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Marquer un message comme lu
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({
        error: 'Message non trouvé',
        message: 'Le message demandé n\'existe pas'
      });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.receiver_id !== userId) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous ne pouvez pas marquer ce message comme lu'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });

  } catch (error) {
    console.error('Erreur lors du marquage du message:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de marquer le message comme lu'
    });
  }
});

// @route   PUT /api/messages/:id/star
// @desc    Marquer/démarquer un message comme favori
// @access  Private
router.put('/:id/star', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({
        error: 'Message non trouvé',
        message: 'Le message demandé n\'existe pas'
      });
    }

    // Vérifier que l'utilisateur est impliqué dans la conversation
    if (message.sender_id !== userId && message.receiver_id !== userId) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous ne pouvez pas modifier ce message'
      });
    }

    message.starred = !message.starred;
    await message.save();

    res.json({
      success: true,
      message: message.starred ? 'Message ajouté aux favoris' : 'Message retiré des favoris',
      data: { starred: message.starred }
    });

  } catch (error) {
    console.error('Erreur lors du marquage du favori:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de modifier le statut du favori'
    });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Obtenir le nombre de messages non lus
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });

  } catch (error) {
    console.error('Erreur lors du comptage des messages non lus:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de compter les messages non lus'
    });
  }
});

// @route   GET /api/messages/users
// @desc    Obtenir la liste des utilisateurs pour la messagerie
// @access  Private
router.get('/users', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Construire les conditions selon le rôle de l'utilisateur connecté
    let where = { is_active: true };
    
    if (currentUserRole === 'student') {
      // Les élèves peuvent voir les professeurs et les administrateurs
      where.role = { [Op.in]: ['teacher', 'admin'] };
    } else if (currentUserRole === 'teacher') {
      // Les professeurs peuvent voir les élèves et les administrateurs
      where.role = { [Op.in]: ['student', 'admin'] };
    } else if (currentUserRole === 'admin') {
      // Les administrateurs peuvent voir tous les utilisateurs
      where.role = { [Op.in]: ['student', 'teacher'] };
    }

    // Exclure l'utilisateur actuel
    where.id = { [Op.ne]: currentUserId };

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'avatar'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les utilisateurs'
    });
  }
});

export default router; 