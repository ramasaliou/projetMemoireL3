import { sequelize } from '../config/database.js';
import { Class, User } from '../models/index.js';

async function fixClass3A() {
  try {
    console.log('🔄 Correction de la classe 3ème A...');
    
    // Trouver le professeur
    const teacher = await User.findOne({
      where: { role: 'teacher', email: 'teacher@virtual-lab.com' }
    });

    if (!teacher) {
      throw new Error('Professeur non trouvé');
    }

    console.log('👨‍🏫 Professeur trouvé:', teacher.name);

    // Créer la classe 3ème A
    const classe3A = await Class.create({
      name: '3ème A',
      level: '3ème',
      subject: 'SVT',
      teacherId: teacher.id,
      maxStudents: 30,
      currentStudents: 3,
      status: 'active',
      academicYear: '2023-2024',
      description: 'Classe de 3ème A',
      room: 'Salle 1',
      is_public: true
    });

    console.log('✅ Classe 3ème A créée avec succès');

    // Vérifier que la classe a été créée
    const verifyClass = await Class.findOne({ where: { name: '3ème A' } });
    if (verifyClass) {
      console.log('✅ Vérification réussie - Classe 3ème A existe dans la base de données');
    }

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('ℹ️ La classe 3ème A existe déjà');
    } else {
      console.error('❌ Erreur:', error);
      throw error;
    }
  }
}

// Exécuter la correction
fixClass3A()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  }); 