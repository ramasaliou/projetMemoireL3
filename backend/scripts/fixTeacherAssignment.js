import { connectDB, sequelize } from '../config/database.js';
import { User, Class } from '../models/index.js';

const fixTeacherAssignment = async () => {
  try {
    await connectDB();
    console.log('🔧 Correction de l\'assignation du professeur weydee Hector...\n');

    // 1. Trouver le professeur weydee Hector
    const weydeeHector = await User.findOne({
      where: {
        role: 'teacher',
        name: 'weydee Hector'
      }
    });

    if (!weydeeHector) {
      console.log('❌ Professeur weydee Hector non trouvé');
      return;
    }

    console.log(`✅ Professeur trouvé: ${weydeeHector.name} (ID: ${weydeeHector.id})`);

    // 2. Vérifier s'il y a déjà une classe 3ème A
    let classe = await Class.findOne({
      where: { name: '3ème A' }
    });

    if (classe) {
      console.log(`📚 Classe 3ème A trouvée (ID: ${classe.id})`);
      
      // Mettre à jour le teacherId
      await classe.update({ teacherId: weydeeHector.id });
      console.log('✅ Classe 3ème A assignée au professeur weydee Hector');
    } else {
      console.log('📚 Création de la classe 3ème A...');
      
      // Créer la classe
      classe = await Class.create({
        name: '3ème A',
        teacherId: weydeeHector.id,
        subject: 'Sciences de la Vie et de la Terre',
        level: '3ème',
        academic_year: '2024-2025'
      });
      
      console.log('✅ Classe 3ème A créée et assignée au professeur weydee Hector');
    }

    // 3. Vérifier les élèves de cette classe
    const students = await User.findAll({
      where: { 
        role: 'student',
        class: '3ème A'
      }
    });

    console.log(`\n👥 Élèves trouvés dans la classe 3ème A: ${students.length}`);
    students.forEach(student => {
      console.log(`  - ${student.name} (${student.email})`);
    });

    // 4. Vérification finale
    console.log('\n=== VÉRIFICATION FINALE ===');
    const finalCheck = await Class.findOne({
      where: { name: '3ème A' },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['name', 'email']
        }
      ]
    });

    if (finalCheck && finalCheck.teacher) {
      console.log(`✅ Classe: ${finalCheck.name}`);
      console.log(`✅ Professeur: ${finalCheck.teacher.name} (${finalCheck.teacher.email})`);
      console.log(`✅ Nombre d'élèves: ${students.length}`);
      
      console.log('\n🎉 CORRECTION TERMINÉE !');
      console.log('Le professeur weydee Hector peut maintenant voir ses élèves dans la section "Mes élèves".');
    } else {
      console.log('❌ Erreur lors de la vérification finale');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await sequelize.close();
  }
};

fixTeacherAssignment(); 