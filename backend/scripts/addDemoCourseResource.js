import 'dotenv/config';
// Script pour ajouter un cours (PDF) dans la table resources
import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import Resource, { initResource } from '../models/Resource.js';
import { initClass } from '../models/Class.js';

(async () => {
  try {
    // Initialiser le modèle Resource
    initResource(sequelize);
    initClass(sequelize);
    await sequelize.authenticate();
    await sequelize.sync();

    // === À ADAPTER SELON VOTRE CLASSE ===
    const className = '3ème A'; // Nom exact de la classe de l'élève
    // ================================

    // Trouver la classe et le prof principal
    const classData = await Class.findOne({ where: { name: className } });
    if (!classData) {
      console.error('Classe non trouvée:', className);
      process.exit(1);
    }
    const teacherId = classData.teacherId;
    if (!teacherId) {
      console.error('Aucun professeur principal associé à la classe:', className);
      process.exit(1);
    }

    // Créer une ressource de type PDF (cours)
    const newResource = await Resource.create({
      title: 'Chapitre 1 - La Cellule (Cours PDF)',
      description: 'Cours complet sur la cellule, ses fonctions et son organisation. Support PDF à télécharger.',
      type: 'pdf',
      category: 'Biologie',
      difficulty: 'moyen',
      url: '/uploads/pdfs/chapitre1-cellule.pdf', // À adapter selon votre fichier
      file_size: 1024000, // 1 Mo (exemple)
      created_by: teacherId,
      status: 'published',
      educational: {
        level: classData.level || '3ème',
        subject: classData.subject || 'SVT',
        keywords: ['cellule', 'biologie', 'cours'],
        curriculum: 'Programme Sénégal'
      },
      tags: ['cours', 'pdf', 'biologie'],
      metadata: {},
      thumbnail: null,
      downloads: 0,
      rating: 0
    });

    console.log('✅ Cours ajouté dans la bibliothèque:', newResource.title);
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de l\'ajout du cours:', err);
    process.exit(1);
  }
})(); 