import { DataTypes, Model } from 'sequelize';

class TP extends Model {
  // Méthode pour assigner le TP à un étudiant
  async assignToStudent(studentId, dueDate = null) {
    const existingAssignment = this.assigned_to.find(
      assignment => assignment.student_id === studentId
    );

    if (existingAssignment) {
      throw new Error('Ce TP est déjà assigné à cet étudiant');
    }

    this.assigned_to.push({
      student_id: studentId,
      due_date: dueDate || this.due_date
    });

    this.stats.total_assignments += 1;
    return await this.save();
  }

  // Méthode pour marquer le TP comme terminé
  async completeAssignment(studentId, score, timeSpent) {
    const assignment = this.assigned_to.find(
      assignment => assignment.student_id === studentId
    );

    if (!assignment) {
      throw new Error('Ce TP n\'est pas assigné à cet étudiant');
    }

    if (assignment.completed_at) {
      throw new Error('Ce TP a déjà été terminé par cet étudiant');
    }

    assignment.completed_at = new Date();
    assignment.score = score;
    assignment.time_spent = timeSpent;

    this.stats.completed_assignments += 1;
    
    // Mettre à jour les moyennes
    const totalScore = this.stats.average_score * (this.stats.completed_assignments - 1) + score;
    this.stats.average_score = totalScore / this.stats.completed_assignments;
    
    const totalTime = this.stats.average_time * (this.stats.completed_assignments - 1) + timeSpent;
    this.stats.average_time = totalTime / this.stats.completed_assignments;

    return await this.save();
  }

  // Méthode statique pour créer un TP de démonstration
  static async createDemoTP(createdBy) {
    const demoTP = {
      title: 'Respiration Cellulaire et Échanges Gazeux',
      description: 'Étude des mécanismes de la respiration cellulaire et des échanges gazeux au niveau pulmonaire et cellulaire',
      subject: 'SVT',
      level: '3ème',
      duration: 90,
      status: 'active',
      created_by: createdBy,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      difficulty: 'moyen',
      instructions: 'Suivez les étapes de la simulation et répondez aux questions du quiz.',
      quiz: {
        enabled: true,
        questions: [
          {
            question: 'Quel gaz est consommé lors de la respiration cellulaire ?',
            options: ['Dioxyde de carbone', 'Oxygène', 'Azote', 'Hydrogène'],
            correct_answer: 1,
            explanation: 'L\'oxygène est le gaz consommé lors de la respiration cellulaire.',
            points: 1
          },
          {
            question: 'Où se déroule principalement la respiration cellulaire ?',
            options: ['Noyau', 'Mitochondries', 'Cytoplasme', 'Ribosomes'],
            correct_answer: 1,
            explanation: 'La respiration cellulaire se déroule principalement dans les mitochondries.',
            points: 1
          }
        ],
        passing_score: 70
      }
    };

    return await this.create(demoTP);
  }
}

// Fonction pour initialiser le modèle
export const initTP = (sequelize) => {
  TP.init({
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
      allowNull: false,
      defaultValue: 'SVT'
    },
    level: {
      type: DataTypes.ENUM('6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 15,
        max: 180
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
      defaultValue: 'draft'
    },
    // Relations
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // Assignations (stocké en JSON)
    assigned_to: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Simulations associées (stocké en JSON d'IDs)
    simulations: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Quiz intégré (stocké en JSON)
    quiz: {
      type: DataTypes.JSON,
      defaultValue: {
        enabled: false,
        questions: [],
        passing_score: 70,
        time_limit: null
      }
    },
    // Instructions et ressources
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resources: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Dates importantes
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Métadonnées
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    difficulty: {
      type: DataTypes.ENUM('facile', 'moyen', 'difficile'),
      defaultValue: 'moyen'
    },
    // Statistiques (stocké en JSON)
    stats: {
      type: DataTypes.JSON,
      defaultValue: {
        total_assignments: 0,
        completed_assignments: 0,
        average_score: 0,
        average_time: 0
      }
    }
  }, {
    sequelize,
    modelName: 'TP',
    tableName: 'tps',
    timestamps: true,
    indexes: [
      {
        fields: ['created_by']
      },
      {
        fields: ['status']
      },
      {
        fields: ['subject']
      },
      {
        fields: ['level']
      },
      {
        fields: ['due_date']
      }
    ]
  });

  return TP;
};

export default TP; 