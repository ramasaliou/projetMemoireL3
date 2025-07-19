import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Microscope, User, Lock, AlertCircle, Loader2, FlaskConical, Atom, Beaker } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  // Effacer l'erreur quand l'utilisateur modifie les champs
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(30, 58, 138, 0.7), rgba(67, 56, 202, 0.7)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="molecules" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" fill="%23ffffff" opacity="0.1"/><circle cx="80" cy="30" r="1.5" fill="%23ffffff" opacity="0.08"/><circle cx="40" cy="70" r="1" fill="%23ffffff" opacity="0.06"/><line x1="20" y1="20" x2="80" y2="30" stroke="%23ffffff" stroke-width="0.5" opacity="0.05"/><line x1="80" y1="30" x2="40" y2="70" stroke="%23ffffff" stroke-width="0.5" opacity="0.05"/></pattern></defs><rect width="100%" height="100%" fill="url(%23molecules)"/></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Particules animées en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-red-400 rounded-full animate-bounce opacity-40"></div>
      </div>

      {/* Grille scientifique en arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="flex w-full">
        {/* Section gauche - Présentation */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <div className="max-w-lg text-center space-y-8">
            {/* Titre principal */}
            <div className="space-y-4 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Bienvenue sur SENLABOTEC
              </h1>
              <p className="text-xl text-blue-200 leading-relaxed">
                Explorez les sciences de la vie et de la terre à travers des expériences interactives et immersives
              </p>
              
              {/* Image logimage */}
              <div className="mt-6 w-full max-w-lg mx-auto">
                <img 
                  src="/logimage.jpg" 
                  alt="SENLABOTEC - Illustration scientifique" 
                  className="w-full h-auto rounded-2xl shadow-2xl object-cover ring-2 ring-white/20 backdrop-blur-sm"
                  style={{
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                    maxHeight: '400px'
                  }}
                />
              </div>
            </div>

            {/* Statistiques */}
            <div className="flex justify-center gap-8 mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-blue-200 text-sm">Expériences</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1000+</div>
                <div className="text-blue-200 text-sm">Élèves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-blue-200 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire de connexion */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo SENLABOTEC en haut */}
            <div className="text-center mb-8">
              <div className="w-48 h-auto mx-auto mb-4">
                <img 
                  src="/senlabotec-logo.png" 
                  alt="SENLABOTEC - Laboratoire Virtuel" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Connexion</h2>
                <p className="text-blue-200">Accédez à votre espace scientifique</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                      placeholder="votre.email@lycee.fr"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-400/30 rounded-xl animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </div>
                )}

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <Microscope className="w-5 h-5" />
                      Accéder au laboratoire
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-8 text-center">
              <p className="text-blue-200 text-sm">
                🔬 SENLABOTEC • Version 2.0
              </p>
              <p className="text-blue-100 text-xs mt-2 opacity-75">
                Développé pour l'enseignement scientifique moderne
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}