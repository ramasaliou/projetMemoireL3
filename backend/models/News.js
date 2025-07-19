import { DataTypes, Model } from 'sequelize';

class News extends Model {
  // Méthode pour publier
  async publish() {
    this.status = 'published';
    this.published_at = new Date();
    return await this.save();
  }

  // Méthode pour archiver
  async archive() {
    this.status = 'archived';
    this.archived_at = new Date();
    return await this.save();
  }

  // Méthode pour incrémenter les vues
  async incrementViews() {
    this.views += 1;
    return await this.save();
  }

  // Méthode statique pour obtenir les actualités publiées
  static async getPublishedNews(userRole, limit = 20) {
    return await this.findAll({
      where: {
        status: 'published',
        target_audience: {
          [this.sequelize.Op.or]: ['all', userRole]
        }
      },
      order: [
        ['pinned', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: limit,
      include: [
        {
          model: this.sequelize.models.User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
  }

  // Méthode statique pour obtenir les actualités récentes
  static async getRecentNews(limit = 5) {
    return await this.findAll({
      where: {
        status: 'published'
      },
      order: [
        ['pinned', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: limit,
      include: [
        {
          model: this.sequelize.models.User,
          as: 'author',
          attributes: ['id', 'name', 'role']
        }
      ]
    });
  }
}

// Fonction pour initialiser le modèle
export const initNews = (sequelize) => {
  News.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('info', 'reminder', 'urgent', 'event'),
      defaultValue: 'info'
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published'
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    target_audience: {
      type: DataTypes.ENUM('all', 'students', 'teachers', 'admins'),
      defaultValue: 'all'
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'News',
    tableName: 'news',
    timestamps: true,
    underscored: true
  });

  return News;
};

export default News; 