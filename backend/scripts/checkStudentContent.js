import { connectDB, sequelize } from '../config/database.js';
import { User, Class, Resource, Quiz } from '../models/index.js';

const checkStudentContent = async () => {
  await connectDB();
  const students = await User.findAll({ where: { role: 'student' } });
  const allActiveQuizzes = await Quiz.findAll({ where: { status: 'active' } });
  for (const student of students) {
    let prof = null;
    let profName = 'Aucun';
    let profId = null;
    if (student.class) {
      const classData = await Class.findOne({ where: { name: student.class } });
      if (classData && classData.teacherId) {
        prof = await User.findByPk(classData.teacherId);
        profName = prof ? prof.name : 'Inconnu';
        profId = classData.teacherId;
      }
    }
    // Ressources visibles
    const resources = profId
      ? await Resource.findAll({ where: { status: 'published', created_by: profId } })
      : [];
    // Quiz visibles
    const quizzesForStudent = allActiveQuizzes.filter(q => {
      // Quiz explicitement assigné à l'élève
      if (Array.isArray(q.assigned_to) && q.assigned_to.includes(student.id)) return true;
      // Quiz du prof principal pour toute la classe
      if (profId && (q.assigned_to === null || (Array.isArray(q.assigned_to) && q.assigned_to.length === 0)) && q.created_by === profId) return true;
      return false;
    });
    console.log(`\n👤 Élève: ${student.name} (${student.email}) | Classe: ${student.class || 'Aucune'} | Prof: ${profName}`);
    console.log(`   📚 Cours visibles: ${resources.length}`);
    if (resources.length === 0) console.log('      (Aucun cours visible)');
    resources.forEach(r => console.log(`      - ${r.title}`));
    console.log(`   📝 Quiz visibles: ${quizzesForStudent.length}`);
    if (quizzesForStudent.length === 0) console.log('      (Aucun quiz visible)');
    quizzesForStudent.forEach(q => console.log(`      - ${q.title}`));
  }
  await sequelize.close();
};

checkStudentContent(); 