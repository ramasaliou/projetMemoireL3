import { connectDB, sequelize } from '../config/database.js';
import { User } from '../models/index.js';

const checkStudents = async () => {
  try {
    await connectDB();
    console.log('🔍 Vérification des élèves et leurs classes...\n');

    // 1. Voir tous les élèves
    console.log('=== TOUS LES ÉLÈVES ===');
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'class', 'level']
    });
    
    if (students.length === 0) {
      console.log('❌ Aucun élève trouvé dans la base de données');
      return;
    }

    students.forEach(student => {
      console.log(`ID: ${student.id} | Nom: ${student.name} | Email: ${student.email} | Classe: ${student.class || 'N/A'} | Niveau: ${student.level || 'N/A'}`);
    });

    // 2. Vérifier les élèves par classe
    console.log('\n=== ÉLÈVES PAR CLASSE ===');
    const studentsByClass = {};
    
    students.forEach(student => {
      const className = student.class || 'Sans classe';
      if (!studentsByClass[className]) {
        studentsByClass[className] = [];
      }
      studentsByClass[className].push(student);
    });

    Object.keys(studentsByClass).forEach(className => {
      console.log(`\n📚 Classe: ${className}`);
      console.log(`   Nombre d'élèves: ${studentsByClass[className].length}`);
      studentsByClass[className].forEach(student => {
        console.log(`   - ${student.name} (${student.email})`);
      });
    });

    // 3. Vérifier spécifiquement la classe 3ème A
    console.log('\n=== ÉLÈVES DE LA CLASSE 3ÈME A ===');
    const students3emeA = students.filter(s => s.class === '3ème A');
    
    if (students3emeA.length === 0) {
      console.log('❌ Aucun élève dans la classe 3ème A');
      console.log('\n💡 SUGGESTIONS:');
      console.log('1. Vérifiez que les élèves ont bien le champ "class" renseigné');
      console.log('2. Assurez-vous que la valeur est exactement "3ème A" (avec l\'accent)');
      console.log('3. Ou modifiez la classe d\'un élève existant:');
      
      if (students.length > 0) {
        const firstStudent = students[0];
        console.log(`\nExemple pour assigner ${firstStudent.name} à la classe 3ème A:`);
        console.log(`UPDATE users SET class = '3ème A' WHERE id = ${firstStudent.id};`);
      }
    } else {
      console.log(`✅ ${students3emeA.length} élève(s) trouvé(s) dans la classe 3ème A:`);
      students3emeA.forEach(student => {
        console.log(`   - ${student.name} (${student.email})`);
      });
    }

    // 4. Statistiques générales
    console.log('\n=== STATISTIQUES ===');
    console.log(`Total d'élèves: ${students.length}`);
    console.log(`Élèves avec classe assignée: ${students.filter(s => s.class).length}`);
    console.log(`Élèves sans classe: ${students.filter(s => !s.class).length}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await sequelize.close();
  }
};

checkStudents(); 