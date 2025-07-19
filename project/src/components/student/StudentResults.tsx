import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  Calendar,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';

export default function StudentResults() {
  const { user } = useAuth();
  const { tps, students } = useData();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'semester'>('all');

  const currentStudent = students.find(s => s.email === user?.email);
  const studentResults = currentStudent?.results || [];
  
  // Calculs des statistiques
  const completedTPs = studentResults.length;
  const totalTPs = tps.filter(tp => tp.status === 'active').length;
  const averageScore = studentResults.length > 0 
    ? studentResults.reduce((sum, result) => sum + result.score, 0) / studentResults.length 
    : 0;
  
  const progressPercentage = totalTPs > 0 ? (completedTPs / totalTPs) * 100 : 0;

  // Données pour les graphiques (simulation)
  const monthlyProgress = [
    { month: 'Sept', score: 75, completed: 2 },
    { month: 'Oct', score: 82, completed: 3 },
    { month: 'Nov', score: 78, completed: 2 },
    { month: 'Déc', score: 88, completed: 4 },
    { month: 'Jan', score: 85, completed: 3 }
  ];

  const subjectPerformance = [
    { subject: 'Respiration', score: 85, color: 'bg-blue-500' },
    { subject: 'Groupes Sanguins', score: 92, color: 'bg-red-500' },
    { subject: 'Immunologie', score: 78, color: 'bg-green-500' },
    { subject: 'fermentation', score: 88, color: 'bg-yellow-500' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="w-4 h-4" />;
    if (score >= 60) return <Target className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques principales */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 Mes Résultats</h2>
            <p className="text-purple-100">
              Suivez votre progression et analysez vos performances en SVT
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-3xl font-bold">{averageScore.toFixed(0)}%</div>
              <div className="text-sm text-purple-200">Moyenne générale</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">TP Terminés</p>
              <p className="text-2xl font-bold text-blue-600">{completedTPs}</p>
              <p className="text-xs text-gray-500">sur {totalTPs} actifs</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne</p>
              <p className="text-2xl font-bold text-green-600">{averageScore.toFixed(1)}%</p>
              <p className="text-xs text-green-500">+3.2% ce mois</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progression</p>
              <p className="text-2xl font-bold text-purple-600">{progressPercentage.toFixed(0)}%</p>
              <p className="text-xs text-gray-500">du programme</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rang Classe</p>
              <p className="text-2xl font-bold text-orange-600">3ème</p>
              <p className="text-xs text-gray-500">sur 28 élèves</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">📈 Évolution Mensuelle</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
              <option>5 derniers mois</option>
              <option>Année scolaire</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {monthlyProgress.map((month, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {month.month}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{month.score}%</span>
                    <span className="text-xs text-gray-500">{month.completed} TP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${month.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance par matière */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">🎯 Performance par Thème</h3>
          
          <div className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                    <span className="text-sm font-bold text-gray-900">{subject.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${subject.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Détail des résultats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">📋 Détail des Résultats</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 inline mr-1" />
              Exporter
            </button>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
              <option>Tous les TP</option>
              <option>TP terminés</option>
              <option>TP en cours</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">TP</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Thème</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
              </tr>
            </thead>
            <tbody>
              {studentResults.map((result, index) => {
                const tp = tps.find(t => t.id === result.tpId);
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{tp?.title}</div>
                      <div className="text-sm text-gray-500">{tp?.description}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{tp?.subject}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.score)}`}>
                          {getScoreIcon(result.score)}
                          {result.score}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {result.completedAt.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Terminé
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conseils personnalisés */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">🎯 Recommandations</h3>
            <p className="text-orange-100">
              {averageScore >= 80 
                ? "Excellent travail ! Continuez à maintenir ce niveau d'excellence."
                : averageScore >= 60
                ? "Bon niveau ! Concentrez-vous sur les thèmes où vous avez le plus de difficultés."
                : "Il faut redoubler d'efforts. N'hésitez pas à revoir les cours et refaire les simulations."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}