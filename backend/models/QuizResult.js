import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';
import Quiz from './Quiz.js';

const QuizResult = sequelize.define('QuizResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  score: {
    type: DataTypes.INTEGER, // pourcentage (0-100)
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Réponses données par l\'étudiant'
  },
  correct_answers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  total_questions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  time_spent: {
    type: DataTypes.INTEGER, // en secondes
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
    allowNull: false,
    defaultValue: 'in_progress'
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  teacher_feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'quiz_results',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations supprimées d'ici, elles sont gérées dans models/index.js

export default QuizResult; 