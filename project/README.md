# 🧪 Laboratoire Virtuel SVT - Frontend

Une plateforme d'enseignement scientifique interactive pour les Sciences de la Vie et de la Terre.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Connexion sécurisée** avec JWT
- **Gestion des rôles** : Élève, Professeur, Administrateur
- **Persistance de session** avec localStorage
- **Gestion d'erreurs** avancée
- **Comptes de démonstration** intégrés

### 🎨 Interface Utilisateur
- **Design moderne** avec Tailwind CSS
- **Mode sombre/clair** avec persistance
- **Responsive design** pour tous les appareils
- **Animations fluides** et transitions
- **Composants réutilisables**

### 📊 Tableaux de bord par rôle
- **Élèves** : TP, Laboratoire, Résultats, Messages
- **Professeurs** : Création TP, Gestion élèves, Corrections
- **Administrateurs** : Gestion complète du système

### 🔧 Fonctionnalités techniques
- **Gestion d'état** avec React Context
- **Hooks personnalisés** pour les API
- **Gestion des erreurs** centralisée
- **Notifications** en temps réel
- **Chargement progressif** avec skeletons

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Backend API en cours d'exécution

### Installation des dépendances
```bash
cd project
npm install
```

### Configuration
1. Créer un fichier `.env` basé sur `.env.example` :
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Laboratoire Virtuel SVT
VITE_APP_VERSION=1.0.0
```

2. Installer les plugins Tailwind manquants :
```bash
npm install @tailwindcss/forms @tailwindcss/typography
```

### Démarrage
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 📁 Structure du projet

```
src/
├── components/
│   ├── admin/          # Composants administrateur
│   ├── auth/           # Authentification
│   ├── shared/         # Composants partagés
│   ├── student/        # Composants élève
│   └── teacher/        # Composants professeur
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🔑 Comptes de démonstration

### Utilisateur par défaut (Admin)
- **Email** : `admin@virtual-lab.com`
- **Mot de passe** : `admin123`

### Comptes de démonstration
- **Élève** : `lewis.diatta@lycee.com` / `demo123`
- **Professeur** : `saliou.ndiaye@lycee.com` / `demo123`
- **Admin** : `rama.niang@lycee.com` / `demo123`

## 🛠️ Améliorations apportées

### 1. **Intégration Backend**
- ✅ Authentification JWT complète
- ✅ Gestion des tokens et refresh
- ✅ Appels API centralisés
- ✅ Gestion d'erreurs robuste

### 2. **Expérience Utilisateur**
- ✅ Mode sombre/clair
- ✅ Animations et transitions
- ✅ États de chargement
- ✅ Notifications toast
- ✅ Responsive design amélioré

### 3. **Performance**
- ✅ Lazy loading des composants
- ✅ Optimisation des re-renders
- ✅ Gestion d'état optimisée
- ✅ Cache intelligent

### 4. **Accessibilité**
- ✅ Navigation clavier
- ✅ ARIA labels
- ✅ Contraste amélioré
- ✅ Focus management

### 5. **Développement**
- ✅ TypeScript strict
- ✅ ESLint et Prettier
- ✅ Hooks personnalisés
- ✅ Composants réutilisables

## 🎯 Prochaines améliorations

### Phase 2
- [ ] **WebSocket** pour les notifications temps réel
- [ ] **PWA** avec service workers
- [ ] **Tests unitaires** avec Jest
- [ ] **Tests E2E** avec Playwright

### Phase 3
- [ ] **Mode hors ligne** avec IndexedDB
- [ ] **Synchronisation** automatique
- [ ] **Analytics** et métriques
- [ ] **Internationalisation** (i18n)

## 🧪 Technologies utilisées

- **React 18** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **React Router** pour la navigation
- **Context API** pour l'état global

## 📝 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation technique

---

**🔬 Laboratoire Virtuel SVT** - Révolutionner l'enseignement des sciences 