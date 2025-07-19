import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class User extends Model {
  // Méthode pour comparer les mots de passe
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Méthode pour générer un token JWT
  generateJWT() {
    return jwt.sign(
      { id: this.id, email: this.email, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  // Méthode pour mettre à jour la dernière connexion
  async updateLastLogin() {
    this.last_login = new Date();
    return await this.save();
  }

  // Méthode statique pour créer un utilisateur de démonstration
  static async createDemoUser(role = 'student') {
    const demoData = {
      name: role === 'student' ? 'lewis Diatta' : 
            role === 'teacher' ? 'Saliou ndiaye' : 'rama niang Administrateur',
      email: role === 'student' ? 'lewis.diatta@lycee.com' :
            role === 'teacher' ? 'saliou.ndiaye@lycee.com' : 'rama.niang@lycee.com',
      password: 'demo123',
      role: role,
      avatar: role === 'student' ? 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150' :
              role === 'teacher' ? 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=150' :
              'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
    };

    if (role === 'student') {
      demoData.class = '3ème A';
      demoData.level = '3ème';
    } else if (role === 'teacher') {
      demoData.subject = 'Sciences de la Vie et de la Terre';
      demoData.specialization = 'Biologie cellulaire';
    }

    return await this.create(demoData);
  }

  // Méthode statique pour créer un utilisateur par défaut
  static async createDefaultUser() {
    const defaultUserData = {
      name: 'Utilisateur Par Défaut',
      email: 'admin@virtual-lab.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      subject: 'Sciences de la Vie et de la Terre',
      specialization: 'Administration système',
      is_active: true
    };

    return await this.create(defaultUserData);
  }

  // Méthode pour vérifier si un utilisateur par défaut existe
  static async getDefaultUser() {
    return await this.findOne({
      where: {
        email: 'admin@virtual-lab.com'
      }
    });
  }

  // Méthode statique pour créer un utilisateur par défaut
  static async createDefaultUser() {
    const defaultUserData = {
      name: 'Utilisateur Par Défaut',
      email: 'admin@virtual-lab.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      subject: 'Sciences de la Vie et de la Terre',
      specialization: 'Administration système',
      is_active: true
    };

    return await this.create(defaultUserData);
  }

  // Méthode pour vérifier si un utilisateur par défaut existe
  static async getDefaultUser() {
    return await this.findOne({
      where: {
        email: 'admin@virtual-lab.com'
      }
    });
  }
}

// Fonction pour initialiser le modèle
export const initUser = (sequelize) => {
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      defaultValue: 'student'
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Champs spécifiques aux étudiants
    class: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    level: {
      type: DataTypes.ENUM('6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'),
      allowNull: true
    },
    // Champs spécifiques aux enseignants
    subject: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    specialization: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Informations générales
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Statut et métadonnées
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Préférences (stockées en JSON)
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        // Hasher le mot de passe seulement s'il a été modifié
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};

export default User; 