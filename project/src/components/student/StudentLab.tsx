import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  Microscope, 
  Play, 
  Clock, 
  Star, 
  Filter,
  Search,
  Zap,
  Target,
  Award,
  TrendingUp,
  BookOpen,
  Users
} from 'lucide-react';
import CycleDesRochesSimulation from '../simulations/CycleDesRochesSimulation';
import FermentationSimulation from '../simulations/FermentationSimulation';
import Notification from '../shared/Notification';

export default function StudentLab() {
  const { simulations } = useData();
  const [filter, setFilter] = useState<'all' | 'facile' | 'moyen' | 'difficile'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'respiration' | 'agglutination' | 'hiv-aids' | 'digestion' | 'circulation' | 'fermentation' | 'cycle-roches'>('all');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [note, setNote] = useState<number|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string|null>(null);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [enteredClassCode, setEnteredClassCode] = useState('');
  const [classCode, setClassCode] = useState<string | null>(null);

  // Ajouter les simulations disponibles pour les étudiants
  const availableSimulations = [
    ...simulations,
    {
      id: 'cycle-roches-sim',
      title: 'Cycle des Roches - Simulation Interactive',
      description: 'Explorez le cycle géologique des roches avec cette simulation 3D interactive. Observez les transformations entre roches magmatiques, sédimentaires et métamorphiques.',
      type: 'cycle-roches',
      difficulty: 'moyen',
      duration: 25,
      thumbnail: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg?auto=compress&cs=tinysrgb&w=500'
    },
    {
      id: 'fermentation-sim',
      title: 'Fermentation Alcoolique - Simulation Interactive',
      description: 'Expérimentez la fermentation alcoolique avec cette simulation interactive. Prélèvez les ingrédients avec une pipette, mélangez-les et observez la production de CO₂.',
      type: 'fermentation',
      difficulty: 'facile',
      duration: 20,
      thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=500'
    }
  ];

  const filteredSimulations = availableSimulations.filter(sim => {
    const matchesSearch = sim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filter === 'all' || sim.difficulty === filter;
    const matchesCategory = selectedCategory === 'all' || sim.type === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'text-green-600 bg-green-100';
      case 'moyen': return 'text-yellow-600 bg-yellow-100';
      case 'difficile': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'respiration': return '🫁';
      case 'agglutination': return '🩸';
      case 'hiv-aids': return '🦠';
      case 'fermentation': return '🍇';
      case 'cycle-roches': return '🪨';
      default: return '🔬';
    }
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: '🔬' },
    { id: 'respiration', name: 'Respiration', icon: '🫁' },
    { id: 'agglutination', name: 'Agglutination', icon: '🩸' },
    { id: 'hiv-aids', name: 'VIH/SIDA', icon: '🦠' },
    { id: 'fermentation', name: 'Fermentation', icon: '🍇' },
    { id: 'cycle-roches', name: 'Cycle des Roches', icon: '🪨' }
  ];

  const handleLaunchSimulation = async (simulationId: string) => {
    setActiveSimulation(simulationId);
    // Enregistrer le début de la simulation côté backend
    try {
      const token = localStorage.getItem('authToken');
      // On suppose que chaque simulation a un type unique (simulationId = type)
      await fetch('http://localhost:5000/api/simulation-results/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          simulation_type: simulationId,
          class_code: classCode,
          status: 'in_progress'
        })
      });
    } catch (e) {
      // Optionnel : afficher une erreur ou ignorer
    }
  };

  const handleCloseSimulation = () => {
    setActiveSimulation(null);
  };

  const handleSubmitResult = async () => {
    setSubmitting(true);
    setSubmissionError(null);
    try {
      const token = localStorage.getItem('authToken');
      // Générer une note aléatoire entre 10 et 20
      const randomNote = Math.floor(Math.random() * 11) + 10;
      const response = await fetch('http://localhost:5000/api/simulation-results', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          simulation_type: activeSimulation,
          class_code: classCode,
          note: randomNote
        })
      });
      const data = await response.json();
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        // ... éventuellement fermer la simulation ou rafraîchir les données ...
        setActiveSimulation(null);
      } else {
        setSubmissionError(data.message || "Erreur lors de l'enregistrement du résultat");
      }
    } catch (error) {
      setSubmissionError("Erreur lors de l'enregistrement du résultat");
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateClassCode = () => {
    if (enteredClassCode.length >= 4 && enteredClassCode.length <= 10) {
      setClassCode(enteredClassCode);
      localStorage.setItem('cycleRochesClassCode', enteredClassCode);
    }
  };

  if (!classCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Entrer le code de classe</h2>
          <input
            type="text"
            value={enteredClassCode}
            onChange={e => setEnteredClassCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Code donné par le professeur"
            maxLength={10}
          />
          <button
            onClick={handleValidateClassCode}
            disabled={enteredClassCode.length < 4 || enteredClassCode.length > 10}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            Valider
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔬 Laboratoire Virtuel SVT</h2>
            <p className="text-emerald-100">
              Explorez les sciences de la vie et de la terre à travers des expériences interactives
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Niveau 3ème
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                Programme Sénégal
              </span>
            </div>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{simulations.length}</div>
              <div className="text-sm text-emerald-200">Simulations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-emerald-200">Thèmes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Catégories */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Thèmes d'étude</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedCategory === category.id
                  ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium">{category.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une simulation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filtres de difficulté */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('facile')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'facile' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🟢 Facile
            </button>
            <button
              onClick={() => setFilter('moyen')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'moyen' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🟡 Moyen
            </button>
            <button
              onClick={() => setFilter('difficile')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'difficile' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔴 Difficile
            </button>
          </div>
        </div>
      </div>

      {/* Simulation active */}
      {activeSimulation === 'cycle-roches-sim' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">🪨 Simulation Cycle des Roches</h3>
            <button
              onClick={handleCloseSimulation}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
          
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-center">
            <span className="font-bold">Code de classe pour cette simulation :</span>
            <span className="ml-2 text-lg font-mono bg-white px-3 py-1 rounded shadow">{classCode}</span>
            <div className="text-xs text-gray-500 mt-1">Donne ce code à tes élèves pour qu'ils accèdent à la simulation.</div>
          </div>

          <CycleDesRochesSimulation />
          {/* Bouton terminer la simulation */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                // Générer une note aléatoire entre 10 et 20
                setNote(Math.floor(Math.random() * 11) + 10);
                handleSubmitResult();
              }}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg"
            >
              {submitting ? 'Enregistrement...' : 'Terminer la simulation'}
            </button>
            {submissionError && (
              <div className="text-red-500 text-sm mt-2">{submissionError}</div>
            )}
          </div>
        </div>
      )}

      {activeSimulation === 'fermentation-sim' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">🍇 Simulation Fermentation Alcoolique</h3>
            <button
              onClick={handleCloseSimulation}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
          
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-center">
            <span className="font-bold">Code de classe pour cette simulation :</span>
            <span className="ml-2 text-lg font-mono bg-white px-3 py-1 rounded shadow">{classCode}</span>
            <div className="text-xs text-gray-500 mt-1">Donne ce code à tes élèves pour qu'ils accèdent à la simulation.</div>
          </div>

          <FermentationSimulation />
          {/* Bouton terminer la simulation */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setNote(Math.floor(Math.random() * 11) + 10);
                handleSubmitResult();
              }}
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg"
            >
              {submitting ? 'Enregistrement...' : 'Terminer la simulation'}
            </button>
            {submissionError && (
              <div className="text-red-500 text-sm mt-2">{submissionError}</div>
            )}
          </div>
        </div>
      )}

      {showSuccess && (
        <Notification
          type="success"
          title="Simulation terminée !"
          message="Votre résultat a bien été enregistré."
          duration={3000}
          onClose={() => setShowSuccess(false)}
          show={showSuccess}
        />
      )}

      {/* Liste des simulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSimulations.length > 0 ? (
          filteredSimulations.map((simulation) => (
            <div key={simulation.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={simulation.thumbnail}
                  alt={simulation.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-2xl bg-white/90 backdrop-blur-sm rounded-lg p-2">
                    {getTypeIcon(simulation.type)}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(simulation.difficulty)}`}>
                    {simulation.difficulty}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={() => handleLaunchSimulation(simulation.id)}
                    className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {simulation.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {simulation.description}
                </p>

                {/* Métadonnées */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{simulation.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>4.8</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleLaunchSimulation(simulation.id)}
                    className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Lancer
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Microscope className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune simulation trouvée
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Essayez avec d'autres mots-clés"
                : "Aucune simulation ne correspond aux filtres sélectionnés"
              }
            </p>
          </div>
        )}
      </div>

      {/* Section conseils */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">💡 Conseil d'apprentissage</h3>
            <p className="text-blue-100">
              Commencez par les simulations faciles pour bien comprendre les concepts de base, 
              puis progressez vers les niveaux plus avancés. N'hésitez pas à refaire les expériences !
            </p>
          </div>
        </div>
      </div>
      {selectedCategory === 'cycle-roches' && (
        <div className="my-8">
          {!codeValid ? (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-center max-w-md mx-auto">
              <div className="mb-2 font-bold">Entre le code de classe donné par ton professeur :</div>
              <input
                type="text"
                value={enteredCode}
                onChange={e => setEnteredCode(e.target.value.toUpperCase())}
                className="border px-3 py-2 rounded font-mono text-lg text-center w-40"
                placeholder="Code..."
                maxLength={8}
              />
              <button
                onClick={() => setCodeValid(enteredCode === classCode)}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >Valider</button>
              {enteredCode && enteredCode !== classCode && (
                <div className="text-red-500 text-xs mt-2">Code incorrect</div>
              )}
            </div>
          ) : (
            <div>
              <CycleDesRochesSimulation />
              <div className="mt-6 text-center">
                {note !== null && (
                  <div className="text-xl font-bold text-green-700">
                    Ta note pour cette simulation : <span className="font-mono">{note}/20</span>
                    <button
                      onClick={handleSubmitResult}
                      disabled={submitting}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Enregistrement...' : 'Enregistrer le résultat'}
                    </button>
                    {submissionError && (
                      <div className="text-red-500 text-sm mt-2">{submissionError}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}