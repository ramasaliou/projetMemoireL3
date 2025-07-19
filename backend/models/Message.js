import { DataTypes, Model } from 'sequelize';

class Message extends Model {
  // Méthode pour marquer comme lu
  async markAsRead() {
    this.read = true;
    this.read_at = new Date();
    return await this.save();
  }

  // Méthode pour obtenir les données formatées pour l'API
  toJSON() {
    const values = Object.assign({}, this.get());
    
    // Formater les dates pour l'API
    if (values.created_at) {
      values.created_at = values.created_at.toISOString();
    }
    if (values.updated_at) {
      values.updated_at = values.updated_at.toISOString();
    }
    if (values.sent_at) {
      values.sent_at = values.sent_at.toISOString();
    }
    if (values.read_at) {
      values.read_at = values.read_at.toISOString();
    }
    
    return values;
  }

  // Méthode statique pour obtenir le nombre de messages non lus
  static async getUnreadCount(userId) {
    return await this.count({
      where: {
        receiver_id: userId,
        read: false
      }
    });
  }

  // Méthode statique pour obtenir une conversation
  static async getConversation(user1Id, user2Id, limit = 50) {
    return await this.findAll({
      where: {
        [this.sequelize.Op.or]: [
          { sender_id: user1Id, receiver_id: user2Id },
          { sender_id: user2Id, receiver_id: user1Id }
        ]
      },
      order: [['created_at', 'ASC']],
      limit: limit,
      include: [
        {
          model: this.sequelize.models.User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        },
        {
          model: this.sequelize.models.User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'role', 'avatar']
        }
      ]
    });
  }
}

// Fonction pour initialiser le modèle
export const initMessage = (sequelize) => {
  Message.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_type: {
      type: DataTypes.ENUM('general', 'question', 'feedback', 'announcement'),
      defaultValue: 'general'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    starred: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    underscored: true
  });

  return Message;
};

export default Message; 