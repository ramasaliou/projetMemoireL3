import { DataTypes } from 'sequelize';

export const initClass = (sequelize) => {
  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    currentStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    averageScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    completionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '2023-2024'
    },
    schedule: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    room: {
      type: DataTypes.STRING,
      allowNull: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    resources: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'classes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Méthodes d'instance
  Class.prototype.updateStats = async function() {
    // Calculer la moyenne des scores des élèves de cette classe
    const students = await this.getStudents();
    if (students.length > 0) {
      const totalScore = students.reduce((sum, student) => sum + (student.averageScore || 0), 0);
      this.averageScore = totalScore / students.length;
      await this.save();
    }
  };

  Class.prototype.updateCompletionRate = async function() {
    // Calculer le taux de complétion des TP de cette classe
    const students = await this.getStudents();
    if (students.length > 0) {
      const totalCompletion = students.reduce((sum, student) => sum + (student.completionRate || 0), 0);
      this.completionRate = totalCompletion / students.length;
      await this.save();
    }
  };

  // Méthodes statiques
  Class.createDemoClass = async function(teacherId, index = 0) {
    const classNames = [
      'Terminale S - SVT',
      'Première S - Biologie',
      'Seconde - Sciences de la Vie',
      'Terminale ES - Écologie',
      'Première L - Géologie'
    ];

    const levels = ['Seconde', 'Première', 'Terminale'];
    const subjects = ['SVT', 'Biologie', 'Géologie', 'Écologie'];
    const rooms = ['Labo 101', 'Labo 102', 'Labo 103', 'Salle 201', 'Salle 202'];

    const className = classNames[index % classNames.length];
    const level = levels[index % levels.length];
    const subject = subjects[index % subjects.length];
    const room = rooms[index % rooms.length];

    return await this.create({
      name: className,
      level: level,
      subject: subject,
      teacherId: teacherId,
      maxStudents: 30,
      currentStudents: Math.floor(Math.random() * 25) + 5,
      averageScore: Math.floor(Math.random() * 30) + 70,
      completionRate: Math.floor(Math.random() * 40) + 60,
      status: 'active',
      academicYear: '2023-2024',
      schedule: {
        monday: '14:00-16:00',
        wednesday: '10:00-12:00',
        friday: '16:00-18:00'
      },
      description: `Cours de ${subject} pour le niveau ${level}. Ce cours couvre les fondamentaux de la discipline avec des travaux pratiques réguliers.`,
      room: room,
      capacity: 30,
      isPublic: true,
      tags: [subject.toLowerCase(), level.toLowerCase(), 'tp'],
      settings: {
        allowLateSubmissions: true,
        requireAttendance: true,
        gradingScale: 'A-F'
      }
    });
  };

  return Class;
};

export default initClass; 