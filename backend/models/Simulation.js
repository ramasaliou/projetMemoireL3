import { DataTypes, Model } from 'sequelize';
import User from './User.js';

class Simulation extends Model {
  // Méthode pour incrémenter les vues
  async incrementViews() {
    this.stats.views += 1;
    return await this.save();
  }

  // Méthode pour enregistrer une completion
  async recordCompletion(score, time) {
    this.stats.completions += 1;
    
    // Calculer la nouvelle moyenne
    const totalScore = this.stats.average_score * (this.stats.completions - 1) + score;
    this.stats.average_score = totalScore / this.stats.completions;
    
    const totalTime = this.stats.average_time * (this.stats.completions - 1) + time;
    this.stats.average_time = totalTime / this.stats.completions;
    
    return await this.save();
  }

  // Méthode statique pour créer une simulation de démonstration
  static async createDemoSimulation(type, createdBy) {
    const demoSimulations = {
      respiration: {
        title: 'Respiration Cellulaire et Échanges Gazeux',
        description: 'Simulation interactive de la respiration cellulaire et des échanges gazeux au niveau pulmonaire et cellulaire',
        type: 'respiration',
        thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
        difficulty: 'moyen',
        duration: 45,
        content: {
          objectives: [
            'Comprendre les mécanismes de la respiration cellulaire',
            'Observer les échanges gazeux au niveau pulmonaire',
            'Analyser les réactions biochimiques impliquées'
          ],
          materials: [
            { name: 'Microscope virtuel', description: 'Pour observer les cellules', image: '' },
            { name: 'Système respiratoire 3D', description: 'Modèle interactif', image: '' }
          ],
          steps: [
            {
              order: 1,
              title: 'Observation des poumons',
              description: 'Explorez la structure des poumons en 3D',
              interactive: true
            },
            {
              order: 2,
              title: 'Échanges gazeux',
              description: 'Simulez les échanges O2/CO2',
              interactive: true
            }
          ]
        }
      },
      agglutination: {
        title: 'Groupes Sanguins et Réaction d\'Agglutination',
        description: 'Expérience virtuelle sur les groupes sanguins ABO, Rhésus et les réactions d\'agglutination',
        type: 'agglutination',
        thumbnail: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=300',
        difficulty: 'facile',
        duration: 30,
        content: {
          objectives: [
            'Identifier les différents groupes sanguins',
            'Comprendre les réactions d\'agglutination',
            'Apprendre la compatibilité transfusionnelle'
          ]
        }
      }
    };

    const demoData = demoSimulations[type] || demoSimulations.respiration;
    demoData.created_by = createdBy;
    demoData.educational = {
      level: '3ème',
      subject: 'SVT',
      keywords: ['respiration', 'cellulaire', 'gaz'],
      curriculum: 'Programme Sénégal'
    };

    return await this.create(demoData);
  }
}

// Fonction pour initialiser le modèle
export const initSimulation = (sequelize) => {
  Simulation.init({
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
    type: {
      type: DataTypes.ENUM('respiration', 'agglutination', 'hiv-aids', 'fermentation', 'la degradation des elemets radioactifs'),
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('facile', 'moyen', 'difficile'),
      defaultValue: 'moyen'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 5,
        max: 180
      }
    },
    // Contenu de la simulation (stocké en JSON)
    content: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // Configuration interactive (stocké en JSON)
    interactive: {
      type: DataTypes.JSON,
      defaultValue: {
        enabled: true,
        type: 'experiment',
        parameters: {}
      }
    },
    // Métadonnées éducatives (stocké en JSON)
    educational: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        level: '3ème',
        subject: 'SVT',
        keywords: [],
        curriculum: 'Programme Sénégal',
        learningOutcomes: []
      }
    },
    // Statistiques (stocké en JSON)
    stats: {
      type: DataTypes.JSON,
      defaultValue: {
        views: 0,
        completions: 0,
        average_score: 0,
        average_time: 0
      }
    },
    // Statut et visibilité
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Simulation',
    tableName: 'simulations',
    timestamps: true,
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['difficulty']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_by']
      }
    ]
  });

  return Simulation;
};

export default Simulation; 