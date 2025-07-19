import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import simulationRoutes from './routes/simulations.js';
import tpRoutes from './routes/tps.js';
import studentRoutes from './routes/students.js';
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teacher.js';
import studentDashboardRoutes from './routes/student.js';
import messageRoutes from './routes/messages.js';
import newsRoutes from './routes/news.js';
import resourceRoutes from './routes/resources.js';
import classRoutes from './routes/classes.js';
import statsRoutes from './routes/stats.js';
import quizRoutes from './routes/quizzes.js';
import simulationResultsRoutes from './routes/simulationResults.js';

// Import de la configuration de la base de données
import { connectDB, sequelize } from './config/database.js';
import { syncModels, createDemoData, createDefaultUser } from './models/index.js';

// Configuration dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à la base de données et synchronisation des modèles
const initializeApp = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    
    // Synchroniser les modèles avec la base de données
    if (process.env.NODE_ENV === 'development') {
      await syncModels();
      
      // Créer l'utilisateur par défaut
      await createDefaultUser();
      
      // Créer les données de démonstration si nécessaire
      await createDemoData();
    } else {
      // En production, créer seulement l'utilisateur par défaut
      await createDefaultUser();
    }
    
    console.log('✅ Application initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Initialiser l'application
initializeApp();

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Configuration CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://votre-domaine.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.RATE_LIMIT_MAX), // 100 requêtes par fenêtre
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware de compression
app.use(compression());

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/tps', tpRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentDashboardRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/simulation-results', simulationResultsRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Serveur Virtual Lab SVT opérationnel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'MySQL avec Sequelize'
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API Virtual Lab SVT - Laboratoire Virtuel en Sciences de la Vie et de la Terre',
    version: '1.0.0',
    database: 'MySQL avec Sequelize',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      simulations: '/api/simulations',
      tps: '/api/tps',
      students: '/api/students',
      admin: '/api/admin',
      teacher: '/api/teacher',
      student: '/api/student',
      messages: '/api/messages',
      news: '/api/news'
    }
  });
});

// Middleware de gestion d'erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Virtual Lab SVT démarré sur le port ${PORT}`);
  console.log(`📚 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Base de données: MySQL avec Sequelize`);
  console.log(`🔗 API disponible sur: http://localhost:${PORT}/api`);
  console.log(`🏥 Santé: http://localhost:${PORT}/api/health`);
});

// Gestion de l'arrêt gracieux
process.on('SIGINT', async () => {
  console.log('\n🔄 Arrêt gracieux du serveur...');
  await sequelize.close();
  console.log('📊 Connexion MySQL fermée');
  process.exit(0);
});

export default app; 