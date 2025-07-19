import { connectDB, sequelize } from '../config/database.js';
import { User, Class } from '../models/index.js';

const fixStudentClasses = async () => {
  try {
    await connectDB();
    console.log('🔧 Correction des classes des étudiants pour correspondre aux classes des professeurs...\n');

    // Récupérer toutes les classes existantes
    const classes = await Class.findAll({ attributes: ['name'] });
    const classNames = classes.map(cls => cls.name);
    console.log('Classes existantes:', classNames);

    // Récupérer tous les étudiants
    const students = await User.findAll({ where: { role: 'student' } });
    let updatedCount = 0;

    for (const student of students) {
      // Si la classe de l'étudiant ne correspond pas exactement à une classe existante
      if (!classNames.includes(student.class)) {
        // On peut essayer de faire une correspondance insensible à la casse
        const match = classNames.find(name => name.toLowerCase() === (student.class || '').toLowerCase());
        if (match) {
          student.class = match;
        } else {
          // Sinon, on assigne la première classe existante
          student.class = classNames[0] || null;
        }
        await student.save();
        updatedCount++;
        console.log(`  ✅ Étudiant ${student.name} (${student.email}) mis à jour: class = ${student.class}`);
      }
    }

    console.log(`\n✅ Correction terminée. ${updatedCount} étudiants mis à jour.`);
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await sequelize.close();
  }
};

fixStudentClasses(); 