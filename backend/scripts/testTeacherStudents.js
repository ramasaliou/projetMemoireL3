import { connectDB, sequelize } from '../config/database.js';
import { User, Class } from '../models/index.js';

const testTeacherStudents = async () => {
  try {
    await connectDB();
    console.log('🧪 Test de la récupération des élèves des professeurs...\n');

    // Récupérer tous les professeurs
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'name', 'email', 'subject']
    });

    console.log(`📚 Professeurs dans la base de données: ${teachers.length}`);
    teachers.forEach(teacher => {
      console.log(`  - ${teacher.name} (${teacher.email}) - ${teacher.subject}`);
    });

    // Récupérer toutes les classes
    const classes = await Class.findAll({
      attributes: ['id', 'name', 'teacherId', 'level', 'subject']
    });

    console.log(`\n🏫 Classes dans la base de données: ${classes.length}`);
    classes.forEach(cls => {
      console.log(`  - ${cls.name} (${cls.subject}) - Prof ID: ${cls.teacherId}`);
    });

    // Récupérer tous les étudiants
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'class']
    });

    console.log(`\n👥 Étudiants dans la base de données: ${students.length}`);
    students.forEach(student => {
      console.log(`  - ${student.name} (${student.email}) - Classe: ${student.class}`);
    });

    // Simuler la logique de la route /api/teacher/students pour chaque professeur
    console.log('\n🔍 Test de la logique de récupération des élèves par professeur:');
    
    for (const teacher of teachers) {
      console.log(`\n📖 Professeur: ${teacher.name}`);
      
      // Récupérer les classes du professeur
      const teacherClasses = await Class.findAll({
        where: { teacherId: teacher.id }
      });

      console.log(`  Classes assignées: ${teacherClasses.length}`);
      teacherClasses.forEach(cls => {
        console.log(`    - ${cls.name}`);
      });

      if (teacherClasses.length === 0) {
        console.log(`  ⚠️  Aucune classe assignée à ${teacher.name}`);
        continue;
      }

      // Récupérer les noms des classes
      const classNames = teacherClasses.map(c => c.name);
      console.log(`  Noms des classes: ${classNames.join(', ')}`);

      // Construire le filtre pour les élèves de ces classes
      const filter = {
        role: 'student',
        class: classNames.length === 1 ? classNames[0] : { [sequelize.Sequelize.Op.in]: classNames }
      };

      // Récupérer les élèves
      const teacherStudents = await User.findAll({
        where: filter,
        attributes: ['id', 'name', 'email', 'class', 'level', 'avatar'],
        order: [['name', 'ASC']]
      });

      console.log(`  Élèves trouvés: ${teacherStudents.length}`);
      teacherStudents.forEach(student => {
        console.log(`    - ${student.name} (${student.email}) - Classe: ${student.class}`);
      });

      if (teacherStudents.length === 0) {
        console.log(`  ⚠️  Aucun élève trouvé pour les classes de ${teacher.name}`);
        console.log(`  💡 Vérifiez que les étudiants ont le bon champ 'class' dans leur profil`);
      }
    }

    // Vérifier la correspondance entre les classes des étudiants et les classes des professeurs
    console.log('\n🔍 Vérification de la correspondance classes-étudiants:');
    
    const allClassNames = classes.map(cls => cls.name);
    const allStudentClasses = [...new Set(students.map(student => student.class).filter(Boolean))];
    
    console.log('Classes des professeurs:', allClassNames);
    console.log('Classes des étudiants:', allStudentClasses);
    
    const matchingClasses = allStudentClasses.filter(studentClass => 
      allClassNames.includes(studentClass)
    );
    
    console.log('Classes correspondantes:', matchingClasses);
    
    if (matchingClasses.length === 0) {
      console.log('\n⚠️  PROBLÈME: Aucune correspondance entre les classes des étudiants et des professeurs!');
      console.log('💡 Solution: Mettre à jour le champ "class" des étudiants pour qu\'il corresponde aux noms des classes des professeurs');
    }

    console.log('\n✅ Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await sequelize.close();
  }
};

// Exécuter le script
testTeacherStudents(); 