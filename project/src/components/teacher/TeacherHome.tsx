import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  Target,
  BarChart3,
  Microscope,
  Eye,
  Play
} from 'lucide-react';

interface DashboardData {
  totalStudents: number;
  activeTPs: number;
  completedAssignments: number;
  averageClassScore: number;
  upcomingDeadlines: Array<{
    tp: string;
    dueDate: string;
    submitted: number;
    total: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    type: string;
    student: string;
    tp: string;
    score: number;
    time: string;
  }>;
  subjectPerformance: Array<{
    subject: string;
    average: number;
    students: number;
  }>;
  simulationStats: {
    totalSimulations: number;
    totalViews: number;
    totalCompletions: number;
    averageScore: number;
  };
  popularSimulations: Array<{
    id: string;
    title: string;
    type: string;
    views: number;
    completions: number;
    averageScore: number;
  }>;
  recentSimulationActivity: Array<{
    type: string;
    title: string;
    completions: number;
    averageScore: number;
    time: string;
  }>;
}

export default function TeacherHome() {
  const { user } = useAuth();
  const { tps, students } = useData();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données dynamiques du tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch('http://localhost:5000/api/teacher/dashboard-data', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expirée, veuillez vous reconnecter');
          }
          throw new Error('Erreur lors du chargement des données');
        }

        const data = await response.json();
        setDashboardData(data.data);
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
      }
    };

    loadDashboardData();
  }, []);

  // Données de fallback si l'API n'est pas disponible
  const fallbackData = {
    totalStudents: students.length,
    activeTPs: tps.filter(tp => tp.status === 'active').length,
    completedAssignments: students.reduce((total, student) => total + student.results.length, 0),
    averageClassScore: students.length > 0 
      ? students.reduce((sum, student) => {
          const studentAvg = student.results.length > 0 
            ? student.results.reduce((s, r) => s + r.score, 0) / student.results.length 
            : 0;
          return sum + studentAvg;
        }, 0) / students.length 
      : 0,
    upcomingDeadlines: [
      { tp: 'Groupes Sanguins', dueDate: '2024-02-20', submitted: 12, total: 28, percentage: 43 },
      { tp: 'Système Immunitaire', dueDate: '2024-02-25', submitted: 8, total: 28, percentage: 29 },
      { tp: 'Digestion', dueDate: '2024-03-01', submitted: 3, total: 28, percentage: 11 }
    ],
    recentActivity: [
      { type: 'submission', student: 'lewis diatta', tp: 'Respiration Cellulaire', score: 85, time: '2h' },
      { type: 'submission', student: 'cheikh diop', tp: 'Respiration Cellulaire', score: 92, time: '3h' },
      { type: 'question', student: 'Fatou Diop', tp: 'Groupes Sanguins', score: 0, time: '5h' },
      { type: 'completion', student: 'Amadou Ba', tp: 'VIH/SIDA', score: 78, time: '1j' }
    ],
    subjectPerformance: [
      { subject: 'Respiration', average: 82, students: 25 },
      { subject: 'Groupes Sanguins', average: 88, students: 22 },
      { subject: 'Immunologie', average: 75, students: 18 },
      { subject: 'fermentation', average: 79, students: 15 }
    ],
    simulationStats: {
      totalSimulations: 3,
      totalViews: 156,
      totalCompletions: 89,
      averageScore: 85
    },
    popularSimulations: [
      { id: '1', title: 'Cycle des Roches', type: 'cycle-roches', views: 89, completions: 45, averageScore: 87 },
      { id: '2', title: 'Fermentation', type: 'fermentation', views: 67, completions: 34, averageScore: 82 },
      { id: '3', title: 'Respiration Cellulaire', type: 'respiration', views: 45, completions: 23, averageScore: 79 }
    ],
    recentSimulationActivity: [
      { type: 'simulation', title: 'Cycle des Roches', completions: 12, averageScore: 87, time: '2h' },
      { type: 'simulation', title: 'Fermentation', completions: 8, averageScore: 82, time: '5h' },
      { type: 'simulation', title: 'Respiration Cellulaire', completions: 5, averageScore: 79, time: '1j' }
    ]
  };

  // Utiliser les données dynamiques ou les données de fallback
  const data = dashboardData || fallbackData;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-4 text-green-600 font-semibold">Chargement du tableau de bord...</span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🏠 Tableau de Bord</h2>
            <p className="text-green-100">
              Bienvenue, {user?.name} ! Voici un aperçu de votre activité pédagogique
            </p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.totalStudents}</div>
              <div className="text-sm text-green-200">Élèves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.activeTPs}</div>
              <div className="text-sm text-green-200">TP Actifs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Élèves</p>
              <p className="text-2xl font-bold text-blue-600">{data.totalStudents}</p>
              <p className="text-xs text-gray-500">3ème A</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">TP Actifs</p>
              <p className="text-2xl font-bold text-green-600">{data.activeTPs}</p>
              <p className="text-xs text-green-500">+2 ce mois</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rendus</p>
              <p className="text-2xl font-bold text-purple-600">{data.completedAssignments}</p>
              <p className="text-xs text-gray-500">cette semaine</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne Classe</p>
              <p className="text-2xl font-bold text-orange-600">{data.averageClassScore.toFixed(0)}%</p>
              <p className="text-xs text-orange-500">+2.3% ce mois</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques des Simulations */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2">🔬 Simulations Interactives</h3>
            <p className="text-purple-100">
              Statistiques de vos simulations et activités récentes
            </p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.simulationStats.totalSimulations}</div>
              <div className="text-sm text-purple-200">Simulations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.simulationStats.totalViews}</div>
              <div className="text-sm text-purple-200">Vues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.simulationStats.totalCompletions}</div>
              <div className="text-sm text-purple-200">Complétions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.simulationStats.averageScore}%</div>
              <div className="text-sm text-purple-200">Moyenne</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulations populaires */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-semibold mb-3 text-purple-100">📊 Simulations Populaires</h4>
            <div className="space-y-3">
              {data.popularSimulations.map((sim, index) => (
                <div key={sim.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{sim.title}</p>
                      <p className="text-xs text-purple-200">{sim.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{sim.views} vues</p>
                    <p className="text-xs text-purple-200">{sim.completions} complétions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activités récentes des simulations */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-semibold mb-3 text-purple-100">⚡ Activités Récentes</h4>
            <div className="space-y-3">
              {data.recentSimulationActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-xs text-purple-200">{activity.completions} nouvelles complétions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{activity.averageScore}%</p>
                    <p className="text-xs text-purple-200">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📈 Activité Récente</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'submission' ? 'bg-green-100' :
                  activity.type === 'question' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'submission' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : activity.type === 'question' ? (
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Award className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.student}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{activity.tp}</span>
                    {activity.score > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-medium">{activity.score}%</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Échéances à venir */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 Échéances à Venir</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {data.upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{deadline.tp}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(deadline.dueDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {deadline.submitted}/{deadline.total} rendus
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {deadline.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${deadline.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance par thème */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">📊 Performance par Thème</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.subjectPerformance.map((subject, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                <span className="text-sm text-gray-500">{subject.students} élèves</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${subject.average}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-green-600">{subject.average}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">🚀 Actions Rapides</h3>
            <p className="text-blue-100">
              Gérez efficacement vos cours et suivez les progrès de vos élèves
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              📝 Nouveau TP
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              📊 Voir Résultats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}