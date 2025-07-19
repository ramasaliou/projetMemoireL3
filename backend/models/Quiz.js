import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [5, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 500]
    }
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'),
    allowNull: false
  },
  questions: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidQuestions(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Les questions doivent être un tableau non vide');
        }
        
        value.forEach((question, index) => {
          if (!question.text || !question.options || !Array.isArray(question.options) || question.options.length < 2) {
            throw new Error(`Question ${index + 1}: texte et options requises (minimum 2 options)`);
          }
          
          if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
            throw new Error(`Question ${index + 1}: réponse correcte invalide`);
          }
        });
      }
    }
  },
  timeLimit: {
    type: DataTypes.INTEGER, // en minutes
    allowNull: false,
    defaultValue: 30,
    validate: {
      min: 5,
      max: 180
    }
  },
  passingScore: {
    type: DataTypes.INTEGER, // pourcentage minimum pour réussir
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: 0,
      max: 100
    }
  },
  maxAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      min: 1,
      max: 10
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'inactive'),
    allowNull: false,
    defaultValue: 'draft'
  },
  assigned_to: {
    type: DataTypes.JSON, // tableau d'IDs d'étudiants
    allowNull: true
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('facile', 'moyen', 'difficile'),
    allowNull: false,
    defaultValue: 'moyen'
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      totalAttempts: 0,
      averageScore: 0,
      completionRate: 0,
      totalStudents: 0
    }
  }
}, {
  tableName: 'quizzes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Relations supprimées d'ici, elles sont gérées dans models/index.js

export default Quiz; 