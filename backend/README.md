# 🧪 Backend Virtual Lab SVT

Backend Node.js pour la plateforme de laboratoire virtuel en Sciences de la Vie et de la Terre, utilisant **Express.js**, **Sequelize ORM** et **MySQL**.

## 🚀 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM pour MySQL
- **MySQL** - Base de données relationnelle
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données
- **helmet** - Sécurité
- **cors** - Cross-Origin Resource Sharing

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données MySQL**
```bash
# Créer une base de données MySQL
mysql -u root -p
CREATE DATABASE virtual_lab_svt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Configurer les variables d'environnement**
```bash
cp env.example .env
```

Éditer le fichier `.env` avec vos paramètres :
```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=virtual_lab_svt
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_DIALECT=mysql

# JWT Secret
JWT_SECRET=votre_secret_jwt_tres_securise_ici
JWT_EXPIRE=7d
```

5. **Démarrer le serveur**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🗄️ Structure de la base de données

### Tables principales

#### `users`
- Gestion des utilisateurs (étudiants, enseignants, administrateurs)
- Authentification et autorisation
- Profils et préférences

#### `simulations`
- Expériences virtuelles interactives
- Contenu éducatif et métadonnées
- Statistiques d'utilisation

#### `tps` (Travaux Pratiques)
- Création et gestion des TP
- Assignation aux étudiants
- Quiz intégrés

#### `results`
- Résultats des étudiants
- Suivi des performances
- Feedback des enseignants

## 🔐 Authentification

Le système utilise JWT (JSON Web Tokens) pour l'authentification.

### Rôles utilisateurs
- **student** : Accès aux simulations et TP assignés
- **teacher** : Création et gestion des TP, suivi des étudiants
- **admin** : Gestion complète du système

### Comptes de démonstration
```
👨‍🎓 Étudiant: lewis.diatta@lycee.com / demo123
👨‍🏫 Enseignant: saliou.ndiaye@lycee.com / demo123
👨‍💼 Admin: rama.niang@lycee.com / demo123
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour du profil
- `POST /api/auth/logout` - Déconnexion

### Utilisateurs
- `GET /api/users/profile` - Profil de l'utilisateur connecté
- `PUT /api/users/profile` - Mise à jour du profil
- `PUT /api/users/password` - Changement de mot de passe

### Simulations
- `GET /api/simulations` - Liste des simulations
- `GET /api/simulations/:id` - Détails d'une simulation
- `POST /api/simulations` - Créer une simulation (enseignants)
- `PUT /api/simulations/:id` - Modifier une simulation
- `DELETE /api/simulations/:id` - Supprimer une simulation
- `POST /api/simulations/:id/complete` - Marquer comme terminée

### TP (Travaux Pratiques)
- `GET /api/tps` - Liste des TP
- `GET /api/tps/:id` - Détails d'un TP
- `POST /api/tps` - Créer un TP (enseignants)
- `PUT /api/tps/:id` - Modifier un TP
- `DELETE /api/tps/:id` - Supprimer un TP
- `POST /api/tps/:id/assign` - Assigner à des étudiants
- `POST /api/tps/:id/complete` - Terminer un TP

### Étudiants
- `GET /api/students` - Liste des étudiants (enseignants/admins)
- `GET /api/students/:id` - Profil d'un étudiant
- `GET /api/students/:id/results` - Résultats d'un étudiant
- `GET /api/students/:id/tps` - TP assignés à un étudiant
- `POST /api/students` - Créer un étudiant
- `PUT /api/students/:id` - Modifier un étudiant
- `DELETE /api/students/:id` - Supprimer un étudiant

### Administration
- `GET /api/admin/dashboard` - Tableau de bord admin
- `GET /api/admin/users` - Gestion des utilisateurs
- `PUT /api/admin/users/:id/status` - Activer/désactiver un utilisateur
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur
- `GET /api/admin/analytics` - Analyses détaillées
- `POST /api/admin/backup` - Créer une sauvegarde
- `POST /api/admin/initialize` - Initialiser la base de données

## 🧪 Simulations disponibles

1. **Respiration Cellulaire et Échanges Gazeux**
2. **Groupes Sanguins et Réaction d'Agglutination**
3. **VIH/SIDA et Dysfonctionnement du Système Immunitaire**
4. **Fermentation Alcoolique**
5. **Dégradation des Éléments Radioactifs**

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer en mode développement
npm run test         # Lancer les tests

# Base de données
npm run db:migrate   # Exécuter les migrations
npm run db:seed      # Insérer les données de test
npm run db:reset     # Réinitialiser la base de données
```

## 🛡️ Sécurité

- **Helmet** : Headers de sécurité
- **CORS** : Configuration des origines autorisées
- **Rate Limiting** : Limitation du nombre de requêtes
- **bcryptjs** : Hashage sécurisé des mots de passe
- **JWT** : Tokens d'authentification sécurisés
- **Validation** : Validation des données d'entrée

## 📊 Monitoring

- **Morgan** : Logging des requêtes HTTP
- **Compression** : Compression des réponses
- **Health Check** : `/api/health` pour vérifier l'état du serveur

## 🚀 Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-mysql-host
DB_NAME=virtual_lab_svt
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret
```

### Commandes de déploiement
```bash
# Installer les dépendances de production
npm ci --only=production

# Démarrer le serveur
npm start
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Virtual Lab SVT** - Laboratoire Virtuel en Sciences de la Vie et de la Terre 🧬🔬 