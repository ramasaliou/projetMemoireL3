import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware pour protéger les routes
export const protect = async (req, res, next) => {
  let token;
  
  console.log('🔍 Middleware protect - Authorization header:', req.headers.authorization);

  // Vérifier si le token est présent dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      console.log('🔍 Vérification du token:', token.substring(0, 20) + '...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔍 Token décodé - User ID:', decoded.id);

      // Récupérer l'utilisateur sans le mot de passe
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        console.log('❌ Utilisateur non trouvé pour ID:', decoded.id);
        return res.status(401).json({
          error: 'Token invalide',
          message: 'Utilisateur non trouvé'
        });
      }
      
      console.log('✅ Utilisateur trouvé:', req.user.name, 'Role:', req.user.role);

      // Vérifier si l'utilisateur est actif
      if (!req.user.is_active) {
        return res.status(401).json({
          error: 'Compte désactivé',
          message: 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Accès non autorisé'
      });
    }
  }

  if (!token) {
    console.log('❌ Token manquant dans les headers');
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Accès non autorisé, token requis'
    });
  }
};

// Middleware pour vérifier les rôles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: `Le rôle ${req.user.role} n'a pas les permissions nécessaires`
      });
    }

    next();
  };
};

// Middleware spécifique pour les enseignants
export const teacherOnly = authorize('teacher', 'admin');

// Middleware spécifique pour les administrateurs
export const adminOnly = authorize('admin');

// Middleware pour vérifier si l'utilisateur peut accéder à une ressource
export const canAccessResource = (resourceUserId) => {
  return (req, res, next) => {
    // Les admins peuvent accéder à tout
    if (req.user.role === 'admin') {
      return next();
    }

    // Les enseignants peuvent accéder aux ressources de leurs élèves
    if (req.user.role === 'teacher') {
      // Ici vous pouvez ajouter une logique pour vérifier si l'élève appartient à la classe de l'enseignant
      return next();
    }

    // Les étudiants ne peuvent accéder qu'à leurs propres ressources
    if (req.user.role === 'student' && req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Vous n\'avez pas les permissions pour accéder à cette ressource'
    });
  };
};

export { adminOnly as admin }; 