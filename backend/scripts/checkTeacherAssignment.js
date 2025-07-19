import { connectDB, sequelize } from '../config/database.js';
import { User, Class } from '../models/index.js';
import fs from 'fs';
import path from 'path';

const checkTeacherAssignment = async () => {
  try {
    await connectDB();
    console.log('🔍 Vérification de l\'assignation du professeur weydee Hector...\n');

    // 1. Vérifier tous les professeurs
    console.log('=== PROFESSEURS ===');
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'name', 'email', 'subject', 'class']
    });
    
    teachers.forEach(teacher => {
      console.log(`ID: ${teacher.id} | Nom: ${teacher.name} | Email: ${teacher.email} | Matière: ${teacher.subject || 'N/A'} | Classe: ${teacher.class || 'N/A'}`);
    });

    // 2. Vérifier le professeur weydee Hector spécifiquement
    console.log('\n=== PROFESSEUR WEYDEE HECTOR ===');
    const weydeeHector = await User.findOne({
      where: {
        role: 'teacher',
        [sequelize.Op.or]: [
          { name: { [sequelize.Op.like]: '%weydee%' } },
          { name: { [sequelize.Op.like]: '%Hector%' } }
        ]
      },
      attributes: ['id', 'name', 'email', 'subject', 'class']
    });

    if (weydeeHector) {
      console.log(`✅ Trouvé: ID: ${weydeeHector.id} | Nom: ${weydeeHector.name} | Email: ${weydeeHector.email}`);
    } else {
      console.log('❌ Professeur weydee Hector non trouvé');
      return;
    }

    // 3. Vérifier toutes les classes
    console.log('\n=== CLASSES ===');
    const classes = await Class.findAll({
      attributes: ['id', 'name', 'teacherId', 'subject', 'level']
    });
    
    classes.forEach(cls => {
      console.log(`ID: ${cls.id} | Nom: ${cls.name} | Prof ID: ${cls.teacherId || 'N/A'} | Matière: ${cls.subject || 'N/A'}`);
    });

    // 4. Vérifier les élèves
    console.log('\n=== ÉLÈVES ===');
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'class']
    });
    
    students.forEach(student => {
      console.log(`ID: ${student.id} | Nom: ${student.name} | Email: ${student.email} | Classe: ${student.class || 'N/A'}`);
    });

    // 5. Vérifier les classes assignées aux professeurs
    console.log('\n=== CLASSES ASSIGNÉES AUX PROFESSEURS ===');
    const classesWithTeachers = await Class.findAll({
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        }
      ],
      attributes: ['id', 'name', 'teacherId', 'subject', 'level']
    });

    classesWithTeachers.forEach(cls => {
      const teacherName = cls.teacher ? cls.teacher.name : 'Aucun professeur';
      console.log(`Classe: ${cls.name} | Prof: ${teacherName} | Prof ID: ${cls.teacherId || 'N/A'}`);
    });

    // 6. Vérifier les élèves par classe
    console.log('\n=== ÉLÈVES PAR CLASSE ===');
    const studentsByClass = await User.findAll({
      where: { role: 'student' },
      attributes: ['class'],
      group: ['class'],
      raw: true
    });

    for (const classInfo of studentsByClass) {
      const classStudents = await User.findAll({
        where: { 
          role: 'student',
          class: classInfo.class 
        },
        attributes: ['name']
      });
      
      const studentNames = classStudents.map(s => s.name).join(', ');
      console.log(`Classe: ${classInfo.class} | Élèves: ${studentNames}`);
    }

    // 7. Diagnostic du problème
    console.log('\n=== DIAGNOSTIC ===');
    const hasAssignedClass = classes.some(cls => cls.teacherId === weydeeHector.id);
    
    if (hasAssignedClass) {
      console.log('✅ Le professeur weydee Hector a une classe assignée');
    } else {
      console.log('❌ Le professeur weydee Hector n\'a PAS de classe assignée - C\'est le problème !');
      
      // 8. Proposition de correction
      console.log('\n=== CORRECTION PROPOSÉE ===');
      console.log('Pour corriger, exécutez cette requête SQL:');
      console.log(`
INSERT INTO classes (name, teacherId, subject, level, academic_year, created_at, updated_at)
VALUES (
    '3ème A',
    ${weydeeHector.id},
    'Sciences de la Vie et de la Terre',
    '3ème',
    '2024-2025',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE 
    teacherId = ${weydeeHector.id};
      `);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await sequelize.close();
  }
};

checkTeacherAssignment(); 