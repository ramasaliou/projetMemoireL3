import { connectDB, sequelize } from '../config/database.js';
import { User } from '../models/index.js';

const listTeachers = async () => {
  try {
    await connectDB();
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'name', 'email', 'is_active']
    });
    console.log('Liste des professeurs dans la base de données :\n');
    teachers.forEach(teacher => {
      console.log(`- ID: ${teacher.id} | Nom: ${teacher.name} | Email: ${teacher.email} | Actif: ${teacher.is_active}`);
    });
    if (teachers.length === 0) {
      console.log('Aucun professeur trouvé.');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des professeurs:', error);
  } finally {
    await sequelize.close();
  }
};

listTeachers(); 