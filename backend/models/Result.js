import { DataTypes, Model } from 'sequelize';

class Result extends Model {
  // Méthode pour calculer le score global
  calculateOverallScore() {
    let totalScore = 0;
    let totalWeight = 0;

    // Score du quiz (poids: 60%)
    if (this.quiz_results.score !== undefined) {
      totalScore += this.quiz_results.score * 0.6;
      totalWeight += 0.6;
    }

    // Score de la simulation (poids: 40%)
    if (this.simulation_results.completed) {
      const simulationScore = this.calculateSimulationScore();
      totalScore += simulationScore * 0.4;
      totalWeight += 0.4;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  // Méthode pour calculer le score de la simulation
  calculateSimulationScore() {
    if (!this.simulation_results.completed) return 0;

    const totalSteps = this.simulation_results.steps_completed.length;
    const completedSteps = this.simulation_results.steps_completed.filter(step => step.completed).length;
    
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }

  // Méthode pour marquer comme terminé
  async markAsCompleted() {
    this.status = 'completed';
    this.completed_at = new Date();
    this.overall_score = this.calculateOverallScore();
    return await this.save();
  }

  // Méthode pour ajouter une observation
  async addObservation(title, content) {
    this.simulation_results.observations.push({
      title,
      content,
      timestamp: new Date()
    });
    return await this.save();
  }

  // Méthode statique pour obtenir les statistiques d'un étudiant
  static async getStudentStats(studentId) {
    const results = await this.findAll({
      where: { student_id: studentId },
      include: [{ model: 'TP', as: 'tp' }]
    });
    
    const stats = {
      totalTPs: results.length,
      completedTPs: results.filter(r => r.status === 'completed').length,
      averageScore: 0,
      totalTimeSpent: 0,
      bestScore: 0,
      recentResults: []
    };

    if (stats.completedTPs > 0) {
      const completedResults = results.filter(r => r.status === 'completed');
      stats.averageScore = Math.round(
        completedResults.reduce((sum, r) => sum + r.overall_score, 0) / stats.completedTPs
      );
      stats.totalTimeSpent = completedResults.reduce((sum, r) => sum + r.total_time_spent, 0);
      stats.bestScore = Math.max(...completedResults.map(r => r.overall_score));
    }

    stats.recentResults = results
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 5);

    return stats;
  }
}

// Fonction pour initialiser le modèle
export const initResult = (sequelize) => {
  Result.init({
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
    tp_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tps',
        key: 'id'
      }
    },
    simulation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'simulations',
        key: 'id'
      }
    },
    // Résultats du quiz (stocké en JSON)
    quiz_results: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        score: 0,
        total_questions: 0,
        correct_answers: 0,
        time_spent: 0,
        answers: []
      }
    },
    // Résultats de la simulation (stocké en JSON)
    simulation_results: {
      type: DataTypes.JSON,
      defaultValue: {
        completed: false,
        time_spent: 0,
        steps_completed: [],
        observations: []
      }
    },
    // Évaluation globale
    overall_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
      defaultValue: 'in_progress'
    },
    // Commentaires et feedback (stocké en JSON)
    teacher_feedback: {
      type: DataTypes.JSON,
      defaultValue: {
        comment: null,
        grade: null,
        feedback_at: null
      }
    },
    // Métadonnées
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Tentatives
    attempt_number: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    }
  }, {
    sequelize,
    modelName: 'Result',
    tableName: 'results',
    timestamps: true,
    indexes: [
      {
        fields: ['student_id']
      },
      {
        fields: ['tp_id']
      },
      {
        fields: ['simulation_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['completed_at']
      },
      {
        fields: ['overall_score']
      },
      {
        unique: true,
        fields: ['student_id', 'tp_id', 'attempt_number']
      }
    ]
  });

  return Result;
};

export default Result; 