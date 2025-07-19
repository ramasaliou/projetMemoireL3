import { DataTypes, Model } from 'sequelize';

class SimulationResult extends Model {
  // Méthode statique pour créer un résultat de simulation de démonstration
  static async createDemoResult(studentId, simulationType, classCode) {
    return await this.create({
      student_id: studentId,
      simulation_type: simulationType,
      class_code: classCode,
      note: Math.floor(Math.random() * 21), // 0-20
      completion_time: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
      details: {
        steps_completed: ['step1', 'step2', 'step3'],
        observations: ['Observation 1', 'Observation 2'],
        errors: Math.floor(Math.random() * 3),
        accuracy: Math.floor(Math.random() * 40) + 60 // 60-100%
      }
    });
  }
}

// Fonction pour initialiser le modèle
export const initSimulationResult = (sequelize) => {
  SimulationResult.init({
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
    simulation_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    class_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    note: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 20
      }
    },
    completion_time: {
      type: DataTypes.INTEGER, // en secondes
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SimulationResult',
    tableName: 'simulation_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};

export default SimulationResult; 