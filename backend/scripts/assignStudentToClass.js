import { connectDB, sequelize } from '../config/database.js';
import { User } from '../models/index.js';

const assignStudentToClass = async () => {
  try {
    await connectDB();
    console.log('🔧 Assignation de l\'élève à la classe 3ème A...\n');

    // 1. Trouver l'élève
    const student = await User.findOne({
      where: { 
        role: 'student',
        name: 'elhadj diakhate'
      }
    });

    if (!student) {
      console.log('❌ Élève elhadj diakhate non trouvé');
      return;
    }

    console.log(`✅ Élève trouvé: ${student.name} (ID: ${student.id})`);
    console.log(`   Classe actuelle: ${student.class || 'Aucune'}`);

    // 2. Mettre à jour la classe
    await student.update({ class: '3ème A' });
    console.log('✅ Élève assigné à la classe 3ème A');

    // 3. Vérification finale
    const updatedStudent = await User.findOne({
      where: { id: student.id }
    });

    console.log('\n=== VÉRIFICATION FINALE ===');
    console.log(`✅ Élève: ${updatedStudent.name}`);
    console.log(`✅ Classe: ${updatedStudent.class}`);
    console.log(`✅ Email: ${updatedStudent.email}`);

    // 4. Vérifier combien d'élèves sont maintenant dans la classe 3ème A
    const studentsInClass = await User.findAll({
      where: { 
        role: 'student',
        class: '3ème A'
      }
    });

    console.log(`\n👥 Nombre d'élèves dans la classe 3ème A: ${studentsInClass.length}`);
    studentsInClass.forEach(s => {
      console.log(`   - ${s.name} (${s.email})`);
    });

    console.log('\n🎉 ASSIGNATION TERMINÉE !');
    console.log('Le professeur weydee Hector peut maintenant voir son élève dans la section "Mes élèves".');

  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation:', error);
  } finally {
    await sequelize.close();
  }
};

assignStudentToClass(); 