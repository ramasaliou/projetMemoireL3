import { DataTypes, Model } from 'sequelize';

class Resource extends Model {
  // Méthode pour incrémenter le nombre de téléchargements
  async incrementDownloads() {
    this.downloads += 1;
    return await this.save();
  }

  // Méthode pour calculer la note moyenne
  async calculateAverageRating() {
    // À implémenter avec un système de notation
    return this.rating;
  }

  // Méthode statique pour créer une ressource de démonstration
  static async createDemoResource(type, createdBy) {
    const demoResources = {
      pdf: {
        title: 'La Respiration Cellulaire - Cours Complet',
        description: 'Comprendre les mécanismes de la respiration cellulaire et les échanges gazeux au niveau pulmonaire et cellulaire',
        type: 'pdf',
        category: 'Respiration',
        difficulty: 'moyen',
        rating: 4.8,
        downloads: 245,
        thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: '/resources/respiration-cellulaire.pdf',
        file_size: 2048576, // 2MB
        duration: null
      },
      video: {
        title: 'Les Groupes Sanguins ABO - Vidéo Explicative',
        description: 'Animation détaillée sur les groupes sanguins et les réactions d\'agglutination',
        type: 'video',
        category: 'Groupes Sanguins',
        difficulty: 'facile',
        rating: 4.9,
        downloads: 189,
        thumbnail: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: '/resources/groupes-sanguins.mp4',
        file_size: 52428800, // 50MB
        duration: 15
      },
      audio: {
        title: 'La Fermentation - Podcast Éducatif',
        description: 'Explication audio du processus de fermentation alcoolique',
        type: 'audio',
        category: 'Fermentation',
        difficulty: 'moyen',
        rating: 4.6,
        downloads: 98,
        thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: '/resources/fermentation-podcast.mp3',
        file_size: 15728640, // 15MB
        duration: 25
      },
      image: {
        title: 'Schéma du Système Immunitaire',
        description: 'Diagramme détaillé du système immunitaire et de ses composants',
        type: 'image',
        category: 'Immunologie',
        difficulty: 'facile',
        rating: 4.7,
        downloads: 156,
        thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: '/resources/systeme-immunitaire.png',
        file_size: 1048576, // 1MB
        duration: null
      }
    };

    const demoData = demoResources[type] || demoResources.pdf;
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
export const initResource = (sequelize) => {
  Resource.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('pdf', 'video', 'audio', 'image'),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('facile', 'moyen', 'difficile'),
      defaultValue: 'moyen'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 5
      }
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Taille du fichier en bytes'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Durée en minutes (pour vidéo/audio)'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    educational: {
      type: DataTypes.JSON,
      defaultValue: {
        level: '3ème',
        subject: 'SVT',
        keywords: [],
        curriculum: 'Programme Sénégal'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Resource',
    tableName: 'resources',
    timestamps: true,
    underscored: true
  });

  return Resource;
};

export default Resource; 