import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  Microscope, 
  Search, 
  Filter, 
  Play,
  Star,
  Clock,
  Target,
  Users,
  TrendingUp,
  Eye,
  Settings
} from 'lucide-react';
import CycleDesRochesSimulation from '../simulations/CycleDesRochesSimulation';
import FermentationSimulation from '../simulations/FermentationSimulation';
import AgglutinationSimulation from '../simulations/AgglutinationSimulation';

export default function TeacherSimulations() {
  const { simulations } = useData();
  const [filter, setFilter] = useState<'all' | 'facile' | 'moyen' | 'difficile'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'respiration' | 'agglutination' | 'hiv-aids' | 'digestion' | 'circulation' | 'fermentation'>('all');
  const [classCode, setClassCode] = useState(() => {
    // Génère un code unique simple (6 lettres/chiffres)
    const code = localStorage.getItem('cycleRochesClassCode') || Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('cycleRochesClassCode', code);
    return code;
  });
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  // Ajouter les simulations aux simulations existantes
  const allSimulations = [
    ...simulations,
    {
      id: 'cycle-roches-sim',
      title: 'Cycle des Roches - Simulation Interactive',
      description: 'Explorez le cycle géologique des roches avec cette simulation 3D interactive. Observez les transformations entre roches magmatiques, sédimentaires et métamorphiques.',
      type: 'cycle-roches',
      difficulty: 'moyen',
      duration: 25,
      thumbnail: 'https://images.pexels.com/photos/1367192/pexels-photo-1367192.jpeg?auto=compress&cs=tinysrgb&w=500',
      stats: {
        views: 156,
        average_score: 8.5,
        completions: 89
      }
    },
    {
      id: 'fermentation-sim',
      title: 'Fermentation Alcoolique - Simulation Interactive',
      description: 'Expérimentez la fermentation alcoolique avec cette simulation interactive. Prélèvez les ingrédients avec une pipette, mélangez-les et observez la production de CO₂.',
      type: 'fermentation',
      difficulty: 'facile',
      duration: 20,
      thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=500',
      stats: {
        views: 98,
        average_score: 9.2,
        completions: 67
      }
    },
    {
      id: 'agglutination-sim',
      title: 'Agglutination Sanguine - Simulation Interactive',
      description: 'Simulez la réaction d\'agglutination sanguine avec cette simulation interactive. Observez les cellules sanguines et leur comportement lors d\'une réaction d\'agglutination.',
      type: 'agglutination',
      difficulty: 'facile',
      duration: 15,
      thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=500',
      stats: {
        views: 75,
        average_score: 8.8,
        completions: 50
      }
    },
    {
      id: 'vision-couleurs-sim',
      title: 'Vision des Couleurs - Perception Humaine',
      description: 'Explorez la perception des couleurs par l’œil humain et les déficiences visuelles avec une simulation interactive 3D.',
      type: 'oeil',
      difficulty: 'facile',
      duration: 20,
      thumbnail: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=500',
      stats: {
        views: 0,
        average_score: 0,
        completions: 0
      }
    }
  ];

  const filteredSimulations = allSimulations.filter(sim => {
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
      case 'digestion': return '🍎';
      case 'circulation': return '❤️';
      case 'fermentation': return '🍇';
      case 'cycle-roches': return '🪨';
      default: return '🔬';
    }
  };

  const categories = [
    { id: 'all', name: 'Toutes', icon: '🔬' },
    { id: 'oeil', name: 'Œil', icon: '👁️' },
    { id: 'agglutination', name: 'Agglutination', icon: '🩸' },
    { id: 'hiv-aids', name: 'VIH/SIDA', icon: '🦠' },
    { id: 'fermentation', name: 'Fermentation', icon: '🍇' },
    { id: 'cycle-roches', name: 'Cycle des Roches', icon: '🪨' }
  ];

  // Statistiques dynamiques basées sur les vraies données
  const simulationStats = {
    totalUsage: allSimulations.reduce((sum, sim) => sum + (sim.stats?.views || 0), 0),
    averageRating: allSimulations.length > 0 
      ? allSimulations.reduce((sum, sim) => sum + (sim.stats?.average_score || 0), 0) / allSimulations.length 
      : 0,
    completionRate: allSimulations.length > 0 
      ? (allSimulations.reduce((sum, sim) => sum + (sim.stats?.completions || 0), 0) / allSimulations.length) * 10 
      : 0,
    popularSimulations: allSimulations
      .map(sim => ({
        name: sim.title,
        usage: sim.stats?.views || 0
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 3)
  };

  const fetchSimulationResults = async () => {
    setResultsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/simulation-results?simulation_type=cycle-roches&class_code=${classCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des résultats');
      }

      const data = await response.json();
      setSimulationResults(data.data.results || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setResultsLoading(false);
    }
  };

  // Charger les résultats quand la simulation du cycle des roches est active
  useEffect(() => {
    if (activeSimulation === 'cycle-roches-sim') {
      fetchSimulationResults();
    }
  }, [activeSimulation, classCode]);

  const handleLaunchSimulation = (simulationId: string) => {
    setActiveSimulation(simulationId);
  };

  const handleCloseSimulation = () => {
    setActiveSimulation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔬 Banque de Simulations</h2>
            <p className="text-purple-100">
              Explorez et gérez les simulations disponibles pour vos TP
            </p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{allSimulations.length}</div>
              <div className="text-sm text-purple-200">Simulations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{simulationStats.totalUsage}</div>
              <div className="text-sm text-purple-200">Vues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vues Totales</p>
              <p className="text-2xl font-bold text-blue-600">{simulationStats.totalUsage}</p>
              <p className="text-xs text-gray-500">Toutes simulations</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
              <p className="text-2xl font-bold text-yellow-600">{simulationStats.averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">sur 100 points</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complétions</p>
              <p className="text-2xl font-bold text-green-600">{allSimulations.reduce((sum, sim) => sum + (sim.stats?.completions || 0), 0)}</p>
              <p className="text-xs text-gray-500">Simulations terminées</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Simulations Actives</p>
              <p className="text-2xl font-bold text-purple-600">{allSimulations.length}</p>
              <p className="text-xs text-gray-500">disponibles</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Microscope className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Catégories */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Catégories de Simulations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-500 text-white shadow-lg transform scale-105'
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filtres de difficulté */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-purple-500 text-white' 
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

          {/* Résultats des élèves */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">📊 Résultats des élèves</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              {resultsLoading ? (
                <div className="text-center py-4">Chargement des résultats...</div>
              ) : simulationResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {simulationResults.map((result) => (
                    <div key={result.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{result.student?.name || 'Élève'}</span>
                        <span className="font-mono text-lg font-bold text-purple-600">{result.note}/20</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Temps: {Math.floor(result.completion_time / 60)}min {result.completion_time % 60}s
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p>Aucun résultat enregistré pour l'instant.</p>
                  <p className="text-sm">Les résultats apparaîtront ici quand les élèves auront terminé la simulation.</p>
                </div>
              )}
            </div>
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

          {/* Résultats des élèves */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">📊 Résultats des élèves</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              {resultsLoading ? (
                <div className="text-center py-4">Chargement des résultats...</div>
              ) : simulationResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {simulationResults.map((result) => (
                    <div key={result.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{result.student?.name || 'Élève'}</span>
                        <span className="font-mono text-lg font-bold text-purple-600">{result.note}/20</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Temps: {Math.floor(result.completion_time / 60)}min {result.completion_time % 60}s
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p>Aucun résultat enregistré pour l'instant.</p>
                  <p className="text-sm">Les résultats apparaîtront ici quand les élèves auront terminé la simulation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nouvelle simulation Agglutination */}
      {activeSimulation === 'agglutination-sim' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">🩸 Simulation Agglutination Sanguine</h3>
            <button
              onClick={handleCloseSimulation}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
          <AgglutinationSimulation />
        </div>
      )}

      {activeSimulation === 'vision-couleurs-sim' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">👁️ Simulation Vision des Couleurs</h3>
            <button
              onClick={handleCloseSimulation}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
          <iframe
            src="/vision-couleurs-simulation.html"
            title="Simulation Vision des Couleurs"
            style={{ width: '100%', height: '80vh', border: 'none', borderRadius: 16, background: 'transparent' }}
            allowFullScreen
          />
        </div>
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
                  <div className="flex gap-2">
                    <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
                      <Play className="w-6 h-6" />
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
                      <Eye className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
                    <span>{simulation.stats?.average_score?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{simulation.stats?.views || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleLaunchSimulation(simulation.id)}
                    className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    {simulation.id === 'cycle-roches-sim' ? 'Lancer Simulation' : 'Lancer'}
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4 text-gray-600" />
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
              Aucune simulation disponible
            </h3>
            <p className="text-gray-500 mb-4">
              Il n'y a actuellement aucune simulation dans la base de données.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                💡 <strong>Conseil :</strong> Les simulations peuvent être ajoutées via l'interface d'administration ou directement dans la base de données.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Simulations populaires */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Simulations Disponibles</h3>
        <div className="space-y-3">
          {simulationStats.popularSimulations.length > 0 ? (
            simulationStats.popularSimulations.map((sim, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{sim.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{sim.usage} vues</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔬</div>
              <p>Aucune simulation disponible pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Code de classe unique pour le professeur */}
      <div className="my-6 flex items-center justify-center">
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-6 py-3 flex items-center gap-3 shadow">
          <span className="font-bold text-purple-700">Code de classe à donner aux élèves :</span>
          <span className="font-mono bg-white px-3 py-1 rounded text-purple-800 text-lg">{classCode}</span>
          <button
            className="ml-2 px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 rounded text-purple-700 border border-purple-200"
            onClick={() => navigator.clipboard.writeText(classCode)}
            title="Copier le code"
          >
            Copier
          </button>
        </div>
      </div>

    </div>
  );
}