import { connectDB, sequelize } from '../config/database.js';
import { User, Class } from '../models/index.js';

const checkTeacherClasses = async () => {
  try {
    await connectDB();
    console.log('🔍 Vérification des assignations de classes aux professeurs...\n');

    // Récupérer tous les professeurs
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'name', 'email', 'subject']
    });

    console.log(`📚 Professeurs trouvés: ${teachers.length}`);
    teachers.forEach(teacher => {
      console.log(`  - ${teacher.name} (${teacher.email}) - ${teacher.subject}`);
    });

    // Récupérer toutes les classes
    const classes = await Class.findAll({
      attributes: ['id', 'name', 'teacherId', 'level', 'subject']
    });

    console.log(`\n🏫 Classes trouvées: ${classes.length}`);
    classes.forEach(cls => {
      console.log(`  - ${cls.name} (${cls.subject}) - Prof ID: ${cls.teacherId}`);
    });

    // Vérifier les professeurs sans classes
    const teachersWithoutClasses = teachers.filter(teacher => 
      !classes.some(cls => cls.teacherId === teacher.id)
    );

    if (teachersWithoutClasses.length > 0) {
      console.log(`\n⚠️  Professeurs sans classes assignées: ${teachersWithoutClasses.length}`);
      teachersWithoutClasses.forEach(teacher => {
        console.log(`  - ${teacher.name} (${teacher.email})`);
      });

      // Assigner des classes aux professeurs qui n'en ont pas
      console.log('\n🔧 Assignation automatique de classes...');
      
      for (let i = 0; i < teachersWithoutClasses.length; i++) {
        const teacher = teachersWithoutClasses[i];
        
        // Créer une nouvelle classe pour ce professeur
        const newClass = await Class.create({
          name: `${teacher.subject} - Classe ${i + 1}`,
          level: 'Terminale',
          subject: teacher.subject || 'SVT',
          teacherId: teacher.id,
          maxStudents: 30,
          currentStudents: 0,
          averageScore: 0.00,
          completionRate: 0.00,
          status: 'active',
          academicYear: '2023-2024',
          description: `Classe de ${teacher.subject} assignée à ${teacher.name}`,
          room: `Salle ${100 + i}`,
          capacity: 30,
          isPublic: true,
          tags: [teacher.subject?.toLowerCase() || 'svt', 'terminale'],
          settings: {
            allowLateSubmissions: true,
            requireAttendance: true,
            gradingScale: 'A-F'
          }
        });

        console.log(`  ✅ Classe "${newClass.name}" créée pour ${teacher.name}`);
      }
    } else {
      console.log('\n✅ Tous les professeurs ont des classes assignées');
    }

    // Vérifier les étudiants et leurs classes
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'class']
    });

    console.log(`\n👥 Étudiants trouvés: ${students.length}`);
    
    // Grouper les étudiants par classe
    const studentsByClass = {};
    students.forEach(student => {
      const className = student.class || 'Non assigné';
      if (!studentsByClass[className]) {
        studentsByClass[className] = [];
      }
      studentsByClass[className].push(student);
    });

    Object.entries(studentsByClass).forEach(([className, classStudents]) => {
      console.log(`  📚 ${className}: ${classStudents.length} étudiants`);
      classStudents.forEach(student => {
        console.log(`    - ${student.name} (${student.email})`);
      });
    });

    // Vérifier si les classes des étudiants correspondent aux classes des professeurs
    const teacherClassNames = classes.map(cls => cls.name);
    const studentClassNames = Object.keys(studentsByClass);

    console.log('\n🔍 Vérification de la correspondance classes-étudiants:');
    teacherClassNames.forEach(className => {
      const hasStudents = studentClassNames.includes(className);
      console.log(`  ${hasStudents ? '✅' : '❌'} ${className}: ${hasStudents ? 'Avec étudiants' : 'Sans étudiants'}`);
    });

    console.log('\n✅ Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await sequelize.close();
  }
};

// Exécuter le script
checkTeacherClasses(); 