import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  GraduationCap,
  UserCheck
} from 'lucide-react';

export default function AdminHome() {
  const { user } = useAuth();

  // Nouveaux états pour les stats dynamiques
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Appel à une route API qui retourne toutes les stats nécessaires
    fetch('/api/stats/public')
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-purple-600 font-semibold">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-semibold py-8">{error}</div>
    );
  }

  // Fallback si stats non chargées
  if (!stats) return null;

  // Extraction des stats dynamiques
  const {
    totalUsers = 0,
    activeUsers = 0,
    totalClasses = 0,
    totalTPs = 0,
    activeTPs = 0,
    averageClassScore = 0,
    platformUsage = 0,
    recentActivity = [],
    classPerformance = [],
    monthlyStats = []
  } = stats;

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Bonjour {user?.name?.split(' ')[0]} ! 👨‍💼
            </h2>
            <p className="text-purple-100">
              Tableau de bord global de la plateforme de laboratoire virtuel
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalUsers} utilisateurs
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {totalClasses} classes actives
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs Totaux</p>
              <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              <p className="text-xs text-gray-500">{activeUsers} actifs</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">TP Créés</p>
              <p className="text-2xl font-bold text-green-600">{totalTPs}</p>
              <p className="text-xs text-green-500">{activeTPs} actifs</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux d'Utilisation</p>
              <p className="text-2xl font-bold text-purple-600">{platformUsage}%</p>
              <p className="text-xs text-purple-500">+5% ce mois</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne Générale</p>
              <p className="text-2xl font-bold text-orange-600">{Number(averageClassScore).toFixed(0)}%</p>
              <p className="text-xs text-orange-500">+2.1% ce mois</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
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
            {recentActivity.map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'user_login' ? 'bg-green-100' :
                  activity.type === 'tp_completed' ? 'bg-blue-100' :
                  activity.type === 'tp_created' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  {activity.type === 'user_login' ? (
                    <UserCheck className="w-4 h-4 text-green-600" />
                  ) : activity.type === 'tp_completed' ? (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  ) : activity.type === 'tp_created' ? (
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Users className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.user}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{activity.action}</span>
                    <span>•</span>
                    <span>il y a {activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance par classe */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🏫 Performance par Classe</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {classPerformance.map((classData: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{classData.class}</span>
                  <span className="text-sm text-gray-500">{classData.students} élèves</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${classData.completion}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Taux de complétion : {classData.completion}%</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-green-600">{classData.average}%</span>
                    <span className="text-xs text-gray-400">Moyenne</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques mensuelles (optionnel) */}
      {/* ... tu peux ajouter un graphique ou tableau ici avec monthlyStats ... */}
    </div>
  );
}