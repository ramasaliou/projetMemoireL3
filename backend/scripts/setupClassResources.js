import { sequelize } from '../config/database.js';
import { Class, User, Resource } from '../models/index.js';

async function setupClassResources() {
  try {
    console.log('🔄 Configuration des ressources pour la classe 3ème A...');
    
    // Trouver la classe 3ème A
    const classe = await Class.findOne({
      where: { name: '3ème A' },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!classe) {
      throw new Error('Classe 3ème A non trouvée');
    }

    console.log('📚 Classe trouvée:', classe.name, 'Professeur:', classe.teacher.name);

    // Créer des ressources pour la classe
    const resources = [
      {
        title: 'Introduction à la SVT - 3ème',
        description: 'Cours d\'introduction aux sciences de la vie et de la terre pour la classe de 3ème',
        type: 'pdf',
        category: 'Cours',
        difficulty: 'facile',
        url: 'intro-svt-3eme.pdf',
        file_size: 1024 * 1024, // 1MB
        downloads: 0,
        created_by: classe.teacherId,
        class_id: classe.id,
        status: 'published',
        thumbnail: 'thumbnail1.jpg',
        tags: ['introduction', 'svt', '3ème']
      },
      {
        title: 'Les systèmes vivants',
        description: 'Étude des systèmes vivants et leur fonctionnement',
        type: 'pdf',
        category: 'Cours',
        difficulty: 'moyen',
        url: 'systemes-vivants.pdf',
        file_size: 2 * 1024 * 1024, // 2MB
        downloads: 0,
        created_by: classe.teacherId,
        class_id: classe.id,
        status: 'published',
        thumbnail: 'thumbnail2.jpg',
        tags: ['biologie', 'systèmes', 'vivant']
      },
      {
        title: 'Exercices de SVT',
        description: 'Série d\'exercices pour pratiquer les concepts appris',
        type: 'pdf',
        category: 'Exercices',
        difficulty: 'moyen',
        url: 'exercices-svt.pdf',
        file_size: 512 * 1024, // 512KB
        downloads: 0,
        created_by: classe.teacherId,
        class_id: classe.id,
        status: 'published',
        thumbnail: 'thumbnail3.jpg',
        tags: ['exercices', 'pratique', 'svt']
      }
    ];

    // Ajouter les ressources
    for (const resource of resources) {
      const [newResource, created] = await Resource.findOrCreate({
        where: { title: resource.title },
        defaults: resource
      });

      if (created) {
        console.log('✅ Ressource créée:', newResource.title);
      } else {
        console.log('ℹ️ Ressource existe déjà:', newResource.title);
      }
    }

    console.log('✅ Configuration des ressources terminée');

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

// Exécuter la configuration
setupClassResources()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  }); 