# Plateforme de Laboratoire Virtuel SVT

Une plateforme complète pour l'enseignement des Sciences de la Vie et de la Terre avec des simulations virtuelles, des travaux pratiques et un système de gestion des utilisateurs.

## 🚀 Démarrage Rapide

### Option 1: Démarrage automatique (recommandé)
```bash
# Depuis le répertoire racine
npm run dev
```

Cette commande démarre automatiquement :
- Backend sur http://localhost:5000
- Frontend sur http://localhost:5173

### Option 2: Démarrage manuel

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd project
npm install
npm run dev
```

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- MySQL (version 8.0 ou supérieure)
- npm ou yarn

## 🗄️ Configuration de la Base de Données

1. Créez une base de données MySQL
2. Copiez `backend/env.example` vers `backend/.env`
3. Configurez vos paramètres de base de données dans `.env`

```bash
cd backend
cp env.example .env
# Éditez .env avec vos paramètres
```

## 👤 Comptes par Défaut

- **Admin**: admin@virtual-lab.com / admin123
- **Enseignant**: teacher@virtual-lab.com / teacher123
- **Étudiant**: student@virtual-lab.com / student123

## 📁 Structure du Projet

```
choix2/
├── backend/          # API Node.js + Express + MySQL
├── project/          # Frontend React + TypeScript
└── package.json      # Scripts de démarrage unifiés
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Démarre backend + frontend en mode développement
- `npm run dev:backend` - Démarre uniquement le backend
- `npm run dev:frontend` - Démarre uniquement le frontend
- `npm run install:all` - Installe toutes les dépendances
- `npm run start` - Démarre en mode production

## 🔧 Développement

### Backend
- API REST avec Express
- Base de données MySQL avec Sequelize ORM
- Authentification JWT
- Gestion des rôles (admin, enseignant, étudiant)

### Frontend
- React 18 avec TypeScript
- Vite pour le build
- Tailwind CSS pour le styling
- Context API pour la gestion d'état

## 📚 Documentation

- [Guide de démarrage rapide](backend/QUICK_START.md)
- [Configuration des données](backend/DATA_SETUP.md)
- [Documentation backend](backend/README.md)
- [Documentation frontend](project/README.md)

## 🐛 Dépannage

### Port déjà utilisé
Si le port 5000 est occupé :
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Erreurs de base de données
1. Vérifiez que MySQL est démarré
2. Vérifiez les paramètres dans `backend/.env`
3. Exécutez `cd backend && npm run init-data`

## 📝 Licence
#   p r o j e t M e m o i r e L 3  
 