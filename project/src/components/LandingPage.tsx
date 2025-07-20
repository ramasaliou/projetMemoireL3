import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-emerald-600 tracking-widest uppercase">🧬 SENLABOTEC</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-gray-700 hover:text-emerald-600 font-medium transition">Accueil</a>
          </nav>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
          >
            Connexion
          </button>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center pt-32 pb-20 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg animate-fadeInUp">Laboratoire Virtuel SVT</h1>
            <p className="text-lg md:text-xl opacity-90 animate-fadeInUp delay-200">
              Une plateforme éducative offrant des simulations virtuelles pour les élèves de 3ème en Sciences de la Vie et de la Terre au Sénégal.
            </p>
            <div className="flex gap-4 animate-fadeInUp delay-400">
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg shadow hover:bg-emerald-800 transition"
              >
                Se connecter
              </button>
            </div>
          </div>
          <div className="hero-image animate-fadeInRight delay-600 flex-1 flex items-center justify-center h-full">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
              <img
                src="/imgAccueil.jpg" // Image placée dans le dossier public, nommée 'imgAccueil.jpg'
                alt="Élèves utilisant un laboratoire virtuel"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Fonctionnalités principales</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Notre plateforme offre une expérience d'apprentissage interactive et engageante.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card border-t-4 border-emerald-400 bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
              <div className="feature-icon text-3xl mb-4">🔬</div>
              <h3 className="feature-title text-xl font-bold mb-2">Simulations interactives</h3>
              <p className="feature-description text-gray-600">Expériences virtuelles qui reproduisent fidèlement les phénomènes biologiques et géologiques.</p>
            </div>
            <div className="feature-card border-t-4 border-blue-400 bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
              <div className="feature-icon text-3xl mb-4">🧠</div>
              <h3 className="feature-title text-xl font-bold mb-2">Quiz Interactifs</h3>
              <p className="feature-description text-gray-600">Testez vos connaissances avec des quiz dynamiques et obtenez des corrections instantanées.</p>
            </div>
            <div className="feature-card border-t-4 border-yellow-400 bg-white rounded-xl p-8 shadow hover:shadow-lg transition">
              <div className="feature-icon text-3xl mb-4">📚</div>
              <h3 className="feature-title text-xl font-bold mb-2">Cours Numériques</h3>
              <p className="feature-description text-gray-600">Accédez à des cours interactifs enrichis de vidéos, animations et schémas.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50" id="testimonials">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Ce que disent les utilisateurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="testimonial-card bg-white p-8 rounded-xl shadow">
              <div className="testimonial-header flex items-center mb-4">
                <div className="testimonial-avatar bg-emerald-100 text-emerald-600 font-bold w-12 h-12 flex items-center justify-center rounded-full mr-3">MS</div>
                <div className="testimonial-info">
                  <h4 className="font-semibold">Mme Sow</h4>
                  <p className="text-gray-500 text-sm">Enseignante de SVT, Dakar</p>
                </div>
              </div>
              <p className="testimonial-text text-gray-700">
                "Cette plateforme a transformé ma façon d'enseigner. Mes élèves sont beaucoup plus engagés et comprennent mieux les concepts complexes grâce aux simulations visuelles."
              </p>
            </div>
            <div className="testimonial-card bg-white p-8 rounded-xl shadow">
              <div className="testimonial-header flex items-center mb-4">
                <div className="testimonial-avatar bg-blue-100 text-blue-600 font-bold w-12 h-12 flex items-center justify-center rounded-full mr-3">ID</div>
                <div className="testimonial-info">
                  <h4 className="font-semibold">Ibrahim D.</h4>
                  <p className="text-gray-500 text-sm">Élève, Thiès</p>
                </div>
              </div>
              <p className="testimonial-text text-gray-700">
                "J'ai toujours eu du mal à visualiser certains processus en biologie. Les simulations m'aident vraiment à comprendre et à me souvenir des concepts importants."
              </p>
            </div>
            <div className="testimonial-card bg-white p-8 rounded-xl shadow">
              <div className="testimonial-header flex items-center mb-4">
                <div className="testimonial-avatar bg-purple-100 text-purple-600 font-bold w-12 h-12 flex items-center justify-center rounded-full mr-3">FN</div>
                <div className="testimonial-info">
                  <h4 className="font-semibold">M. Fall</h4>
                  <p className="text-gray-500 text-sm">Directeur d'école, Saint-Louis</p>
                </div>
              </div>
              <p className="testimonial-text text-gray-700">
                "Cette solution est particulièrement précieuse pour les écoles qui n'ont pas les moyens d'équiper des laboratoires complets. Elle offre une alternative accessible et de qualité."
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-10 mt-auto" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Laboratoire Virtuel SVT</h3>
            <p className="text-emerald-200">Votre laboratoire virtuel de Sciences de la Vie et de la Terre pour une expérience d'apprentissage immersive et interactive.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Retirer la colonne Navigation */}
            <div>
              <h4 className="text-emerald-300 font-semibold mb-2">Contact</h4>
              <p>📧 contact@senlabotec.sn</p>
              <p>📱 +221 77 756 77 23</p>
              <p>🌍 Dakar, Sénégal</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex gap-3 mb-2">
                <span className="lab-image text-3xl bg-gradient-to-br from-blue-800 to-blue-400 rounded-xl p-3">🔬</span>
                <span className="lab-image text-3xl bg-gradient-to-br from-blue-400 to-blue-800 rounded-xl p-3">⚗️</span>
                <span className="lab-image text-3xl bg-gradient-to-br from-blue-800 to-blue-400 rounded-xl p-3">🧪</span>
                <span className="lab-image text-3xl bg-gradient-to-br from-blue-400 to-blue-800 rounded-xl p-3">🦠</span>
              </div>
              <p className="text-emerald-200 text-sm">Expérimentez, apprenez, progressez !</p>
            </div>
          </div>
          <div className="text-center text-emerald-200 text-xs opacity-70 border-t border-emerald-800 pt-4">
            &copy; {new Date().getFullYear()} SenLaboTec. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
} 