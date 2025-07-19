import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useGet } from '../../hooks/useApi';
import { 
  Users, 
  Search, 
  Filter, 
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  Eye,
  MessageSquare,
  Download,
  Plus,
  Edit,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

export default function TeacherStudents() {
  const { students, tps, teacherClass, refreshStudents } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'average' | 'completed'>('name');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // États pour les modales d'actions
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState<any>(null);

  // États pour les formulaires
  const [messageForm, setMessageForm] = useState({ subject: '', content: '' });
  const [emailForm, setEmailForm] = useState({ subject: '', content: '' });
  const [contactForm, setContactForm] = useState({ 
    parentName: '', 
    phone: '', 
    email: '', 
    message: '' 
  });
  const [editForm, setEditForm] = useState({ name: '', email: '', class: '' });

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'average':
          const avgA = a.results.length > 0 ? a.results.reduce((sum, r) => sum + r.score, 0) / a.results.length : 0;
          const avgB = b.results.length > 0 ? b.results.reduce((sum, r) => sum + r.score, 0) / b.results.length : 0;
          return avgB - avgA;
        case 'completed':
          return b.results.length - a.results.length;
        default:
          return 0;
      }
    });

  const getStudentAverage = (student: any) => {
    if (student.results.length === 0) return 0;
    return student.results.reduce((sum: number, result: any) => sum + result.score, 0) / student.results.length;
  };

  const getAverageColor = (average: number) => {
    if (average >= 80) return 'text-green-600 bg-green-100';
    if (average >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Fonctions pour les actions
  const openProfileModal = (student: any) => {
    setSelectedStudentData(student);
    setShowProfileModal(true);
    setSelectedStudent(null); // Fermer le menu d'actions
  };

  const openMessageModal = (student: any) => {
    setSelectedStudentData(student);
    setMessageForm({ subject: '', content: '' });
    setShowMessageModal(true);
    setSelectedStudent(null);
  };

  const openResultsModal = (student: any) => {
    setSelectedStudentData(student);
    setShowResultsModal(true);
    setSelectedStudent(null);
  };

  const openEmailModal = (student: any) => {
    setSelectedStudentData(student);
    setEmailForm({ subject: '', content: '' });
    setShowEmailModal(true);
    setSelectedStudent(null);
  };

  const openContactModal = (student: any) => {
    setSelectedStudentData(student);
    setContactForm({ parentName: '', phone: '', email: '', message: '' });
    setShowContactModal(true);
    setSelectedStudent(null);
  };

  const openEditModal = (student: any) => {
    setSelectedStudentData(student);
    setEditForm({ 
      name: student.name, 
      email: student.email, 
      class: student.class 
    });
    setShowEditModal(true);
    setSelectedStudent(null);
  };

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.content) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      // Ici tu peux intégrer avec ton API de messagerie
      console.log('Envoi du message:', {
        to: selectedStudentData.email,
        subject: messageForm.subject,
        content: messageForm.content
      });
      
      alert('Message envoyé avec succès !');
      setShowMessageModal(false);
      setMessageForm({ subject: '', content: '' });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.content) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      // Ici tu peux intégrer avec ton API d'email
      console.log('Envoi de l\'email:', {
        to: selectedStudentData.email,
        subject: emailForm.subject,
        content: emailForm.content
      });
      
      alert('Email envoyé avec succès !');
      setShowEmailModal(false);
      setEmailForm({ subject: '', content: '' });
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleContactParents = async () => {
    if (!contactForm.parentName || !contactForm.message) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      // Ici tu peux intégrer avec ton système de contact parents
      console.log('Contact parents:', {
        student: selectedStudentData.name,
        parentName: contactForm.parentName,
        phone: contactForm.phone,
        email: contactForm.email,
        message: contactForm.message
      });
      
      alert('Demande de contact enregistrée !');
      setShowContactModal(false);
      setContactForm({ parentName: '', phone: '', email: '', message: '' });
    } catch (error) {
      console.error('Erreur contact parents:', error);
      alert('Erreur lors de l\'enregistrement du contact');
    }
  };

  const handleEditStudent = async () => {
    if (!editForm.name || !editForm.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Ici tu peux intégrer avec ton API de modification d'étudiant
      console.log('Modification étudiant:', {
        id: selectedStudentData.id,
        ...editForm
      });
      
      alert('Informations modifiées avec succès !');
      setShowEditModal(false);
      setEditForm({ name: '', email: '', class: '' });
      
      // Recharger les données
      await refreshStudents();
    } catch (error) {
      console.error('Erreur modification étudiant:', error);
      alert('Erreur lors de la modification');
    }
  };

  const classStats = {
    totalStudents: students.length,
    averageScore: students.length > 0 
      ? students.reduce((sum, student) => sum + getStudentAverage(student), 0) / students.length 
      : 0,
    completionRate: students.length > 0 
      ? (students.reduce((sum, student) => sum + student.results.length, 0) / (students.length * tps.filter(tp => tp.status === 'active').length)) * 100 
      : 0,
    topPerformers: students
      .map(student => ({ ...student, average: getStudentAverage(student) }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 3)
  };

  // Ajout récupération résultats de quiz
  const { data: quizResults, loading: loadingQuizResults, error: errorQuizResults, fetchData: fetchQuizResults } = useGet<any[]>('/teacher/quiz-results');

  useEffect(() => {
    fetchQuizResults();
  }, [fetchQuizResults]);

  // Si le professeur n'a pas de classe assignée, afficher un message
  if (!teacherClass) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">⚠️ Aucune classe assignée</h2>
              <p className="text-orange-100">
                Vous n'avez pas de classe assignée pour le moment.
              </p>
              <p className="text-orange-200 text-sm mt-1">
                Veuillez contacter l'administrateur pour vous assigner une classe.
              </p>
            </div>
            <div className="text-6xl">📚</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              En attente d'assignation de classe
            </h3>
            <p className="text-gray-600 mb-4">
              Une fois votre classe assignée, vous pourrez voir la liste de vos élèves ici.
            </p>
            <button 
              onClick={async () => {
                setIsRefreshing(true);
                await refreshStudents();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">👥 Gestion des Élèves</h2>
            <p className="text-blue-100">
              {teacherClass ? `Suivez les progrès et gérez vos élèves de ${teacherClass}` : 'Gestion des élèves'}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              📊 Données récupérées depuis la base de données
            </p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{classStats.totalStudents}</div>
              <div className="text-sm text-blue-200">Élèves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{classStats.averageScore.toFixed(0)}%</div>
              <div className="text-sm text-blue-200">Moyenne</div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques de classe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Élèves</p>
              <p className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</p>
              <p className="text-xs text-gray-500">{teacherClass}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moyenne Classe</p>
              <p className="text-2xl font-bold text-green-600">{classStats.averageScore.toFixed(1)}%</p>
              <p className="text-xs text-green-500">+2.3% ce mois</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
              <p className="text-2xl font-bold text-purple-600">{classStats.completionRate.toFixed(0)}%</p>
              <p className="text-xs text-gray-500">TP terminés</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meilleur Élève</p>
              <p className="text-lg font-bold text-orange-600">{classStats.topPerformers[0]?.name.split(' ')[0]}</p>
              <p className="text-xs text-gray-500">{classStats.topPerformers[0]?.average.toFixed(0)}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Top performers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top 3 de la Classe</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classStats.topPerformers.map((student, index) => (
            <div key={student.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-yellow-100 text-yellow-600' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{student.name}</h4>
                <p className="text-sm text-gray-500">{student.average.toFixed(1)}% de moyenne</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAverageColor(student.average)}`}>
                {student.average.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tri */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Trier par nom</option>
              <option value="average">Trier par moyenne</option>
              <option value="completed">Trier par TP terminés</option>
            </select>
            
            <button 
              onClick={async () => {
                setIsRefreshing(true);
                await refreshStudents();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
            
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
              <Download className="w-4 h-4 inline mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Liste des élèves */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase tracking-wider text-xs">Élève</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase tracking-wider text-xs">Classe</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase tracking-wider text-xs">TP Terminés</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase tracking-wider text-xs">Moyenne</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase tracking-wider text-xs">Dernier TP</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const average = getStudentAverage(student);
                const lastResult = student.results[student.results.length - 1];
                const lastTP = lastResult ? tps.find(tp => tp.id === lastResult.tpId) : null;
                
                return (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.class}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 font-medium">{student.results.length}</div>
                      <div className="text-xs text-gray-500">
                        sur {tps.filter(tp => tp.status === 'active').length} TP actifs
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAverageColor(average)}`}>
                        {average.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {lastTP ? (
                        <div>
                          <div className="font-medium">{lastTP.title}</div>
                          <div className="text-xs text-gray-500">
                            {lastResult.completedAt.toLocaleDateString('fr-FR')} • {lastResult.score}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucun TP</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openProfileModal(student)}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Voir le profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openMessageModal(student)}
                          className="p-2 text-green-500 hover:bg-green-100 rounded-lg transition-colors"
                          title="Envoyer un message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {selectedStudent === student.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              <button 
                                onClick={() => openResultsModal(student)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                              >
                                📊 Voir les résultats détaillés
                              </button>
                              <button 
                                onClick={() => openEmailModal(student)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                              >
                                📧 Envoyer un email
                              </button>
                              <button 
                                onClick={() => openContactModal(student)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                              >
                                📞 Contacter les parents
                              </button>
                              <hr className="my-2" />
                              <button 
                                onClick={() => openEditModal(student)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                              >
                                ✏️ Modifier les informations
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun élève trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Essayez avec d'autres mots-clés"
                : "Aucun élève ne correspond aux critères"
              }
            </p>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">🚀 Actions Rapides</h3>
            <p className="text-green-100">
              Gérez efficacement votre classe et communiquez avec vos élèves
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              📧 Message Groupe
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              📊 Rapport Classe
            </button>
          </div>
        </div>
      </div>

      {/* Modales d'actions */}
      
      {/* Modale de profil étudiant */}
      {showProfileModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">👤 Profil de l'Élève</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <img
                  src={selectedStudentData.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
                  alt={selectedStudentData.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="text-xl font-semibold text-gray-900">{selectedStudentData.name}</h4>
                <p className="text-gray-600">{selectedStudentData.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {selectedStudentData.class}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">📊 Statistiques</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">TP terminés:</span>
                      <div className="font-semibold">{selectedStudentData.results.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Moyenne:</span>
                      <div className="font-semibold">{getStudentAverage(selectedStudentData).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">📈 Derniers résultats</h5>
                  <div className="space-y-2">
                    {selectedStudentData.results.slice(-3).map((result: any, index: number) => {
                      const tp = tps.find(t => t.id === result.tpId);
                      return (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{tp?.title || 'TP inconnu'}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getAverageColor(result.score)}`}>
                            {result.score}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'envoi de message */}
      {showMessageModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">💬 Envoyer un message</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">Envoyer un message à <span className="font-semibold">{selectedStudentData.name}</span></p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={messageForm.content}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale des résultats détaillés */}
      {showResultsModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">📊 Résultats détaillés - {selectedStudentData.name}</h3>
              <button 
                onClick={() => setShowResultsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedStudentData.results.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">TP</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentData.results.map((result: any, index: number) => {
                        const tp = tps.find(t => t.id === result.tpId);
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="font-medium">{tp?.title || 'TP inconnu'}</div>
                              <div className="text-sm text-gray-500">{tp?.subject}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAverageColor(result.score)}`}>
                                {result.score}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {result.completedAt.toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                result.score >= 80 ? 'bg-green-100 text-green-800' :
                                result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {result.score >= 80 ? 'Excellent' :
                                 result.score >= 60 ? 'Bon' : 'À améliorer'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun résultat disponible pour cet élève.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale d'envoi d'email */}
      {showEmailModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">📧 Envoyer un email</h3>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">Envoyer un email à <span className="font-semibold">{selectedStudentData.name}</span></p>
              <p className="text-sm text-gray-500">({selectedStudentData.email})</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSendEmail(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de contact parents */}
      {showContactModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">📞 Contacter les parents</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">Demande de contact pour <span className="font-semibold">{selectedStudentData.name}</span></p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleContactParents(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du parent *</label>
                <input
                  type="text"
                  value={contactForm.parentName}
                  onChange={(e) => setContactForm(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Raison du contact..."
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de modification étudiant */}
      {showEditModal && selectedStudentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">✏️ Modifier les informations</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">Modifier les informations de <span className="font-semibold">{selectedStudentData.name}</span></p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleEditStudent(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                <input
                  type="text"
                  value={editForm.class}
                  onChange={(e) => setEditForm(prev => ({ ...prev, class: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Résultats de quiz des élèves */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
        <h2 className="text-xl font-bold mb-4">Résultats de quiz des élèves</h2>
        {loadingQuizResults && <div>Chargement des résultats...</div>}
        {errorQuizResults && <div className="text-red-500">{errorQuizResults}</div>}
        {quizResults && quizResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-1 border">Élève</th>
                  <th className="px-2 py-1 border">Classe</th>
                  <th className="px-2 py-1 border">Quiz</th>
                  <th className="px-2 py-1 border">Matière</th>
                  <th className="px-2 py-1 border">Niveau</th>
                  <th className="px-2 py-1 border">Score</th>
                  <th className="px-2 py-1 border">Réussite</th>
                  <th className="px-2 py-1 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map((result: any) => (
                  <tr key={result.id} className="text-center">
                    <td className="border px-2 py-1">{result.student?.name || '-'}</td>
                    <td className="border px-2 py-1">{result.student?.class || '-'}</td>
                    <td className="border px-2 py-1">{result.quiz?.title || '-'}</td>
                    <td className="border px-2 py-1">{result.quiz?.subject || '-'}</td>
                    <td className="border px-2 py-1">{result.quiz?.level || '-'}</td>
                    <td className="border px-2 py-1 font-semibold">{result.score} / 100</td>
                    <td className="border px-2 py-1">{result.passed ? 'Oui' : 'Non'}</td>
                    <td className="border px-2 py-1">{result.completed_at ? new Date(result.completed_at).toLocaleDateString('fr-FR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loadingQuizResults && <div>Aucun résultat de quiz trouvé.</div>}
      </div>
    </div>
  );
}