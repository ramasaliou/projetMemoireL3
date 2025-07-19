import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { Class, User } from '../models/index.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/pdfs/' });
const router = express.Router();

// GET /api/classes - Récupérer toutes les classes
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, level, subject } = req.query;
    const offset = (page - 1) * limit;

    // Construire les conditions de filtrage selon le rôle
    const whereClause = {};
    
    if (req.user.role === 'teacher') {
      // Les enseignants ne voient que leurs propres classes
      whereClause.teacherId = req.user.id;
    } else if (req.user.role === 'student') {
      // Les étudiants ne voient que leur classe
      whereClause.name = req.user.class;
    }
    // Les admins voient toutes les classes
    
    if (status) whereClause.status = status;
    if (level) whereClause.level = level;
    if (subject) whereClause.subject = subject;

    const classes = await Class.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculer les statistiques
    const stats = await Class.findAll({
      attributes: [
        'status',
        [Class.sequelize.fn('COUNT', Class.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const totalStudents = await User.count({
      where: { role: 'student' }
    });

    res.json({
      success: true,
      data: {
        classes: classes.rows,
        pagination: {
          total: classes.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(classes.count / limit)
        },
        stats: {
          total: classes.count,
          active: stats.find(s => s.status === 'active')?.dataValues.count || 0,
          inactive: stats.find(s => s.status === 'inactive')?.dataValues.count || 0,
          totalStudents
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des classes'
    });
  }
});

// GET /api/classes/:id - Récupérer une classe spécifique
router.get('/:id', protect, async (req, res) => {
  try {
    const classId = req.params.id;
    
    const classData = await Class.findByPk(classId, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatar', 'phone']
        }
      ]
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'teacher') {
      // Les enseignants ne peuvent voir que leurs propres classes
      if (classData.teacherId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas les permissions pour voir cette classe'
        });
      }
    } else if (req.user.role === 'student') {
      // Les étudiants ne peuvent voir que leur classe
      if (classData.name !== req.user.class) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas les permissions pour voir cette classe'
        });
      }
    }
    // Les admins peuvent voir toutes les classes

    // Récupérer les élèves de cette classe
    const students = await User.findAll({
      where: { 
        role: 'student',
        class: classData.name
      },
      attributes: ['id', 'name', 'email', 'avatar', 'last_login']
    });

    res.json({
      success: true,
      data: {
        class: classData,
        students: students,
        studentCount: students.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la classe'
    });
  }
});

// POST /api/classes - Créer une nouvelle classe
router.post('/', protect, upload.single('pdf'), async (req, res) => {
  console.log('--- Création Cours/Classe ---');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  try {
    const { name, level, subject, teacherId, maxStudents, description, room, academicYear } = req.body;

    // Validation des données
    if (!name || !level || !subject || !teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Vérifier si la classe existe déjà
    const existingClass = await Class.findOne({ where: { name } });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Une classe avec ce nom existe déjà'
      });
    }

    // Vérifier si le professeur existe
    const teacher = await User.findByPk(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Professeur invalide'
      });
    }

    // Gestion du PDF
    let resources = null;
    if (req.file) {
      console.log('📄 Fichier PDF reçu:', req.file);
      resources = JSON.stringify({
        pdfUrl: req.file.path,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      });
      console.log('📄 Resources JSON:', resources);
    }

    // Créer la classe
    const newClass = await Class.create({
      name,
      level,
      subject,
      teacherId,
      maxStudents: maxStudents || 30,
      description,
      room,
      academicYear: academicYear || '2023-2024',
      currentStudents: 0,
      averageScore: 0.00,
      completionRate: 0.00,
      status: 'active',
      resources
    });

    // Récupérer la classe avec les informations du professeur
    const classWithTeacher = await Class.findByPk(newClass.id, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: {
        class: classWithTeacher
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la classe'
    });
  }
});

// PUT /api/classes/:id - Modifier une classe
router.put('/:id', protect, upload.single('pdf'), async (req, res) => {
  try {
    const classId = req.params.id;
    const { name, level, subject, teacherId, maxStudents, description, room, academicYear, status } = req.body;

    const classData = await Class.findByPk(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'teacher' && classData.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres cours'
      });
    }

    // Vérifier si le nouveau nom existe déjà (sauf pour cette classe)
    if (name && name !== classData.name) {
      const existingClass = await Class.findOne({ where: { name } });
      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: 'Une classe avec ce nom existe déjà'
        });
      }
    }

    // Vérifier si le professeur existe (si fourni)
    if (teacherId) {
      const teacher = await User.findByPk(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({
          success: false,
          message: 'Professeur invalide'
        });
      }
    }

    // Gestion du PDF
    let resources = classData.resources;
    if (req.file) {
      console.log('📄 Nouveau fichier PDF reçu:', req.file);
      // Si resources est un objet ou un tableau, on le gère
      if (!resources || resources === null || resources === '' || resources === 'null') {
        resources = {
          pdfUrl: req.file.path,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date().toISOString()
        };
      } else if (typeof resources === 'string') {
        try { 
          resources = JSON.parse(resources); 
        } catch { 
          resources = {}; 
        }
        resources.pdfUrl = req.file.path;
        resources.originalName = req.file.originalname;
        resources.fileSize = req.file.size;
        resources.mimeType = req.file.mimetype;
        resources.uploadedAt = new Date().toISOString();
      } else if (typeof resources === 'object') {
        resources.pdfUrl = req.file.path;
        resources.originalName = req.file.originalname;
        resources.fileSize = req.file.size;
        resources.mimeType = req.file.mimetype;
        resources.uploadedAt = new Date().toISOString();
      }
      console.log('📄 Resources JSON mis à jour:', JSON.stringify(resources));
    }

    // Mettre à jour la classe
    await classData.update({
      name: name || classData.name,
      level: level || classData.level,
      subject: subject || classData.subject,
      teacherId: teacherId || classData.teacherId,
      maxStudents: maxStudents || classData.maxStudents,
      description: description || classData.description,
      room: room || classData.room,
      academicYear: academicYear || classData.academicYear,
      status: status || classData.status,
      resources: req.file ? JSON.stringify(resources) : classData.resources
    });

    // Récupérer la classe mise à jour avec les informations du professeur
    const updatedClass = await Class.findByPk(classId, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Classe mise à jour avec succès',
      data: {
        class: updatedClass
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la classe'
    });
  }
});

// DELETE /api/classes/:id - Supprimer une classe
router.delete('/:id', protect, async (req, res) => {
  try {
    const classId = req.params.id;
    
    const classData = await Class.findByPk(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'teacher' && classData.teacherId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres cours'
      });
    }

    // Vérifier s'il y a des élèves dans cette classe
    const studentCount = await User.count({
      where: { 
        role: 'student',
        class: classData.name
      }
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer la classe. ${studentCount} élève(s) y sont encore inscrit(s).`
      });
    }

    // Supprimer la classe
    await classData.destroy();

    res.json({
      success: true,
      message: 'Classe supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la classe'
    });
  }
});

// PATCH /api/classes/:id/status - Changer le statut d'une classe
router.patch('/:id/status', protect, admin, async (req, res) => {
  try {
    const classId = req.params.id;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const classData = await Class.findByPk(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    await classData.update({ status });

    res.json({
      success: true,
      message: `Classe ${status === 'active' ? 'activée' : 'désactivée'} avec succès`,
      data: {
        class: classData
      }
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut'
    });
  }
});

// GET /api/classes/:id/students - Récupérer les élèves d'une classe
router.get('/:id/students', protect, async (req, res) => {
  try {
    const classId = req.params.id;
    
    const classData = await Class.findByPk(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    const students = await User.findAll({
      where: { 
        role: 'student',
        class: classData.name
      },
      attributes: ['id', 'name', 'email', 'avatar', 'last_login', 'created_at'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        students,
        count: students.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des élèves'
    });
  }
});

// POST /api/classes/:id/students - Ajouter un élève à une classe
router.post('/:id/students', protect, admin, async (req, res) => {
  try {
    const classId = req.params.id;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'élève requis'
      });
    }

    const classData = await Class.findByPk(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Élève invalide'
      });
    }

    // Vérifier si l'élève est déjà dans une classe
    if (student.class) {
      return res.status(400).json({
        success: false,
        message: 'Cet élève est déjà inscrit dans une classe'
      });
    }

    // Vérifier la capacité de la classe
    const currentStudents = await User.count({
      where: { 
        role: 'student',
        class: classData.name
      }
    });

    if (currentStudents >= classData.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'La classe a atteint sa capacité maximale'
      });
    }

    // Ajouter l'élève à la classe
    await student.update({ class: classData.name });
    await classData.update({ currentStudents: currentStudents + 1 });

    res.json({
      success: true,
      message: 'Élève ajouté à la classe avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'élève'
    });
  }
});

// DELETE /api/classes/:id/students/:studentId - Retirer un élève d'une classe
router.delete('/:id/students/:studentId', protect, admin, async (req, res) => {
  try {
    const classId = req.params.id;
    const studentId = req.params.studentId;

    const classData = await Class.findByPk(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Élève invalide'
      });
    }

    if (student.class !== classData.name) {
      return res.status(400).json({
        success: false,
        message: 'Cet élève n\'est pas inscrit dans cette classe'
      });
    }

    // Retirer l'élève de la classe
    await student.update({ class: null });
    await classData.update({ currentStudents: classData.currentStudents - 1 });

    res.json({
      success: true,
      message: 'Élève retiré de la classe avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du retrait de l\'élève:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait de l\'élève'
    });
  }
});

export default router; 