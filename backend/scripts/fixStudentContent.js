import { connectDB, sequelize } from '../config/database.js';
import { User, Class, Resource, Quiz } from '../models/index.js';

const fixStudentContent = async () => {
  await connectDB();

  // 1. Assigner une classe existante à tout élève sans classe
  const classes = await Class.findAll();
  const firstClass = classes[0];
  if (!firstClass) {
    console.error('Aucune classe trouvée.');
    process.exit(1);
  }
  const studentsNoClass = await User.findAll({ where: { role: 'student', class: null } });
  for (const student of studentsNoClass) {
    student.class = firstClass.name;
    await student.save();
    console.log(`✅ Élève ${student.name} assigné à la classe ${firstClass.name}`);
  }

  // 2. S'assurer que chaque classe a un teacherId valide
  const teachers = await User.findAll({ where: { role: 'teacher' } });
  const firstTeacher = teachers[0];
  for (const classe of classes) {
    if (!classe.teacherId || !teachers.find(t => t.id === classe.teacherId)) {
      classe.teacherId = firstTeacher.id;
      await classe.save();
      console.log(`✅ Classe ${classe.name} assignée au professeur ${firstTeacher.name}`);
    }
  }

  // 3. Créer une ressource publiée pour chaque professeur principal n'en ayant pas
  for (const teacher of teachers) {
    const resourceCount = await Resource.count({ where: { created_by: teacher.id, status: 'published' } });
    if (resourceCount === 0) {
      await Resource.create({
        title: `Cours de ${teacher.name}`,
        description: `Ressource automatique pour ${teacher.name}`,
        type: 'pdf',
        category: 'Général',
        difficulty: 'moyen',
        rating: 5,
        downloads: 0,
        thumbnail: '',
        url: '/resources/auto.pdf',
        created_by: teacher.id,
        educational: { level: '3ème', subject: 'SVT', keywords: [], curriculum: 'Auto' },
        status: 'published',
        tags: [],
        metadata: {}
      });
      console.log(`✅ Ressource publiée créée pour ${teacher.name}`);
    }
  }

  // 4. Créer un quiz actif pour chaque professeur principal n'en ayant pas
  for (const teacher of teachers) {
    const quizCount = await Quiz.count({ where: { created_by: teacher.id, status: 'active' } });
    if (quizCount === 0) {
      await Quiz.create({
        title: `Quiz de ${teacher.name}`,
        description: `Quiz automatique pour ${teacher.name}`,
        subject: 'SVT',
        level: '3ème',
        questions: [
          { text: 'Question auto 1', options: ['A', 'B'], correctAnswer: 0 },
          { text: 'Question auto 2', options: ['C', 'D'], correctAnswer: 1 }
        ],
        timeLimit: 10,
        passingScore: 50,
        maxAttempts: 3,
        status: 'active',
        assigned_to: [],
        tags: [],
        difficulty: 'moyen',
        stats: { totalAttempts: 0, averageScore: 0, completionRate: 0, totalStudents: 0 }
      });
      console.log(`✅ Quiz actif créé pour ${teacher.name}`);
    }
  }

  // 5. Assigner à chaque élève au moins un quiz visible
  const allQuizzes = await Quiz.findAll({ where: { status: 'active' } });
  const allStudents = await User.findAll({ where: { role: 'student' } });
  for (const student of allStudents) {
    // Règle métier : quiz assigné OU quiz du prof principal avec assigned_to vide
    let profId = null;
    if (student.class) {
      const classData = await Class.findOne({ where: { name: student.class } });
      if (classData && classData.teacherId) profId = classData.teacherId;
    }
    const visibleQuizzes = allQuizzes.filter(q => {
      if (Array.isArray(q.assigned_to) && q.assigned_to.includes(student.id)) return true;
      if ((q.assigned_to === null || (Array.isArray(q.assigned_to) && q.assigned_to.length === 0)) && profId && q.created_by === profId) return true;
      return false;
    });
    if (visibleQuizzes.length === 0 && profId) {
      // Assigner le quiz du prof principal à l'élève
      const quiz = allQuizzes.find(q => q.created_by === profId);
      if (quiz) {
        let assigned = Array.isArray(quiz.assigned_to) ? quiz.assigned_to : [];
        if (!assigned.includes(student.id)) {
          assigned.push(student.id);
          quiz.assigned_to = assigned;
          await quiz.save();
          console.log(`✅ Quiz ${quiz.title} assigné à l'élève ${student.name}`);
        }
      }
    }
  }

  await sequelize.close();
  console.log('✅ Correction terminée.');
};

fixStudentContent(); 