import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useApi } from '../../hooks/useApi';
import { 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Play,
  RefreshCw,
  Users,
  BookOpen,
  Award,
  BarChart3,
  Microscope,
  Eye
} from 'lucide-react';

interface DashboardData {
  activeTPs: number;
  completedTPs: number;
  averageScore: number;
  progressPercentage: number;
  upcomingTPs: Array<{
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    level: string;
  }>;
  recentActivity: Array<{
    type: string;
    title: string;
    score: number;
    date: string;
  }>;
  subjectPerformance: Array<{
    subject: string;
    score: number;
    count: number;
  }>;
  simulationStats: {
    totalSimulations: number;
    averageScore: number;
    totalTime: number;
  };
  recentSimulations: Array<{
    title: string;
    type: string;
    score: number;
    time: number;
    date: string;
  }>;
  completedQuizzes: number;
  completedSimulationsCount: number;
  averageSimulationScore: number;
  simulationProgressPercentage: number;
  completedSimulations: Array<{
    title: string;
    type: string;
    score: number;
    completed_at: string;
  }>;
  startedSimulationsCount: number;
  startedSimulations: Array<{
    id: string;
    class_code: string;
    started_at: string;
  }>;
}

export default function StudentHome() {
  const { user } = useAuth();
  const { tps, students } = useData();
  const api = useApi();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour charger les données dynamiques du tableau de bord
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await api.execute('/student/dashboard-data', { method: 'GET' });
      if (response) {
        setDashboardData(response); // response est déjà response.data grâce à useApi
      } else {
        throw new Error('Erreur lors du chargement des données');
      }
    } catch (error) {
      const err = error as Error;
      console.error('Erreur chargement données tableau de bord:', err);
      setError(err.message);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Données de fallback si l'API n'est pas disponible
  const currentStudent = students.find(s => s.email === user?.email);
  const fallbackData = {
    activeTPs: tps.filter(tp => tp.status === 'active').length,
    completedTPs: currentStudent?.results?.length || 0,
    averageScore: currentStudent?.results?.length > 0 
      ? currentStudent.results.reduce((sum, result) => sum + result.score, 0) / currentStudent.results.length 
      : 0,
    progressPercentage: tps.filter(tp => tp.status === 'active').length > 0 
      ? Math.round(((currentStudent?.results?.length || 0) / tps.filter(tp => tp.status === 'active').length) * 100) 
      : 0,
    upcomingTPs: tps.filter(tp => 
      tp.status === 'active' && 
      tp.dueDate && 
      tp.dueDate > new Date() && 
      !currentStudent?.results?.some(result => result.tpId === tp.id)
    ).slice(0, 3).map(tp => ({
      id: tp.id,
      title: tp.title,
      subject: tp.subject,
      dueDate: tp.dueDate?.toISOString() || '',
      level: tp.level || 'Standard'
    })),
    recentActivity: currentStudent?.results?.slice(0, 3).map(result => ({
      type: result.status === 'completed' ? 'completed' : 'started',
      title: result.tpTitle || 'TP',
      score: result.score || 0,
      date: new Date(result.completedAt || result.createdAt).toLocaleDateString('fr-FR')
    })) || [],
    subjectPerformance: [],
    simulationStats: {
      totalSimulations: 2,
      averageScore: 85,
      totalTime: 1800
    },
    recentSimulations: [
      { title: 'Cycle des Roches', type: 'cycle-roches', score: 87, time: 900, date: 'Il y a 2h' },
      { title: 'Fermentation', type: 'fermentation', score: 82, time: 900, date: 'Il y a 1j' }
    ],
    completedQuizzes: 0,
    completedSimulationsCount: 0,
    averageSimulationScore: 0,
    simulationProgressPercentage: 0,
    completedSimulations: [],
    startedSimulationsCount: 0,
    startedSimulations: []
  };

  // Utiliser les données dynamiques ou les données de fallback
  const data = dashboardData || fallbackData;

  // Helpers pour formatage
  const formatDate = (date: string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-blue-600 font-semibold">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">Affichage des données de démonstration</p>
      </div>
    );
  }

  // Indicateur de mode de données
  const isUsingDynamicData = !!dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🏠 Tableau de Bord</h2>
            <p className="text-green-100">
              Bienvenue, {user?.name} ! Voici un aperçu de votre progression académique
            </p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.completedQuizzes || 0}</div>
              <div className="text-sm text-green-100">Quiz terminés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.completedSimulationsCount || 0}</div>
              <div className="text-sm text-green-100">Simulations terminées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.simulationProgressPercentage || 0}%</div>
              <div className="text-sm text-green-100">Progression</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quiz terminés</p>
              <p className="text-2xl font-bold text-gray-900">{data.completedQuizzes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Microscope className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Simulations terminées</p>
              <p className="text-2xl font-bold text-gray-900">{data.completedSimulationsCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progression</p>
              <p className="text-2xl font-bold text-gray-900">{data.simulationProgressPercentage || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Simulations commencées</p>
              <p className="text-2xl font-bold text-gray-900">{data.startedSimulationsCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Quiz terminés */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">📝 Quiz terminés</h3>
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
        
        {data.completedQuizzes > 0 && data.recentActivity ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Quiz</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Score</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity.slice(0, 5).map((activity, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{activity.date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Terminé
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun quiz terminé</h3>
            <p className="text-gray-600">Commencez par passer vos premiers quiz pour voir vos résultats ici.</p>
          </div>
        )}
      </div>

      {/* Section Simulations récentes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">🔬 Simulations récentes</h3>
        
        {data.completedSimulations && data.completedSimulations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.completedSimulations.slice(0, 6).map((simulation, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{simulation.title}</h4>
                  <span className="text-xs text-gray-500">{simulation.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Score: {simulation.score}%</span>
                  <span className="text-xs text-gray-500">
                    {new Date(simulation.completed_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Microscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune simulation terminée</h3>
            <p className="text-gray-600">Explorez le laboratoire virtuel pour commencer vos expériences.</p>
          </div>
        )}
      </div>

      {/* Section Activité récente */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">📊 Activité récente</h3>
        
        <div className="space-y-4">
          {data.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activity.type === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Play className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">Score: {activity.score}%</p>
                </div>
                <div className="text-sm text-gray-500">{activity.date}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité récente</h3>
              <p className="text-gray-600">Votre activité apparaîtra ici une fois que vous commencerez à utiliser la plateforme.</p>
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de mode de données */}
      {!isUsingDynamicData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              Affichage des données de démonstration. Les données en temps réel seront disponibles une fois connecté au serveur.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}