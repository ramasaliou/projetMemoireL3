import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { 
  Clock, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Filter,
  Search,
  BookOpen,
  Target
} from 'lucide-react';

export default function StudentTPs() {
  const { tps, students } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const api = useApi();

  const currentStudent = students.find(s => s.email === user?.email);
  const completedTPIds = currentStudent?.results.map(r => r.tpId) || [];

  // Fusionner TPs et Quiz du prof (affichage)
  const filteredTPs = tps.filter(tp => {
    const matchesSearch = tp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tp.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'active') {
      return matchesSearch && tp.status === 'active';
    } else if (filter === 'completed') {
      return matchesSearch && completedTPIds.includes(tp.id);
    }
    return matchesSearch;
  });

  const getTPStatus = (tp: any) => {
    if (completedTPIds.includes(tp.id)) {
      return 'completed';
    } else if (tp.status === 'active') {
      return 'active';
    }
    return 'draft';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'active': return 'Actif';
      default: return 'Brouillon';
    }
  };

  const getDaysUntilDue = (dueDate?: Date) => {
    if (!dueDate) return null;
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStudentScore = (tpId: string) => {
    const result = currentStudent?.results.find(r => r.tpId === tpId);
    return result?.score;
  };

  const startQuiz = async (quiz: any) => {
    try {
      const response = await api.execute(`/quizzes/${quiz.id}/start`, { method: 'POST' });
      if (response && response.success) {
        // setSelectedQuiz(quiz); // Removed
        // setCurrentQuestion(0); // Removed
        // setAnswers(new Array(quiz.questions.length).fill(-1)); // Removed
        // setTimeLeft(quiz.timeLimit * 60); // Removed
        // setQuizStarted(true); // Removed
        // setResultId(response.data.resultId); // Removed
        // setStartTime(new Date()); // Removed
      }
    } catch (err) {
      alert('Erreur lors du démarrage du quiz');
    }
  };

  const submitQuiz = async () => {
    // if (!selectedQuiz || !resultId || !startTime) return; // Removed
    try {
      // const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000); // Removed
      // const response = await api.execute(`/quizzes/${selectedQuiz.id}/submit`, { // Removed
      //   method: 'POST', // Removed
      //   body: JSON.stringify({ // Removed
      //     resultId, // Removed
      //     answers, // Removed
      //     timeSpent // Removed
      //   }) // Removed
      // }); // Removed
      // if (response && response.success) { // Removed
      //   alert(`Quiz terminé ! Score: ${response.data.score}% - ${response.data.feedback}`); // Removed
      //   setQuizStarted(false); // Removed
      //   setSelectedQuiz(null); // Removed
      //   setResultId(null); // Removed
      //   setStartTime(null); // Removed
      // } // Removed
    } catch (err) {
      alert('Erreur lors de la soumission du quiz');
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    // const newAnswers = [...answers]; // Removed
    // newAnswers[questionIndex] = answerIndex; // Removed
    // setAnswers(newAnswers); // Removed
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // if (quizStarted && selectedQuiz) { // Removed
  //   const question = selectedQuiz.questions[currentQuestion]; // Removed
  //   return ( // Removed
  //     <div className="max-w-4xl mx-auto p-6"> // Removed
  //       <div className="bg-white rounded-lg shadow-lg p-6"> // Removed
  //         <div className="flex justify-between items-center mb-6 pb-4 border-b"> // Removed
  //           <div> // Removed
  //             <h2 className="text-2xl font-bold text-gray-800">{selectedQuiz.title}</h2> // Removed
  //             <p className="text-gray-600">{selectedQuiz.subject} - {selectedQuiz.level}</p> // Removed
  //           </div> // Removed
  //           <div className="text-right"> // Removed
  //             <div className="text-lg font-semibold text-red-600"> // Removed
  //               Temps restant: {formatTime(timeLeft)} // Removed
  //             </div> // Removed
  //             <div className="text-sm text-gray-600"> // Removed
  //               Question {currentQuestion + 1} sur {selectedQuiz.questions.length} // Removed
  //             </div> // Removed
  //           </div> // Removed
  //         </div> // Removed
  //         <div className="mb-8"> // Removed
  //           <h3 className="text-xl font-semibold mb-4"> // Removed
  //             Question {currentQuestion + 1}: {question.text} // Removed
  //           </h3> // Removed
  //           <div className="space-y-3"> // Removed
  //             {question.options.map((option: string, index: number) => ( // Removed
  //               <label // Removed
  //                 key={index} // Removed
  //                 className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${ // Removed
  //                   answers[currentQuestion] === index // Removed
  //                     ? 'border-blue-500 bg-blue-50' // Removed
  //                     : 'border-gray-200 hover:border-gray-300' // Removed
  //                 }`} // Removed
  //               > // Removed
  //                 <input // Removed
  //                   type="radio" // Removed
  //                   name={`question-${currentQuestion}`} // Removed
  //                   value={index} // Removed
  //                   checked={answers[currentQuestion] === index} // Removed
  //                   onChange={() => handleAnswerSelect(currentQuestion, index)} // Removed
  //                   className="mr-3" // Removed
  //                 /> // Removed
  //                 <span className="text-gray-700">{option}</span> // Removed
  //               </label> // Removed
  //             ))} // Removed
  //           </div> // Removed
  //         </div> // Removed
  //         <div className="flex justify-between items-center"> // Removed
  //           <button // Removed
  //             onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} // Removed
  //             disabled={currentQuestion === 0} // Removed
  //             className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50" // Removed
  //           > // Removed
  //             Précédent // Removed
  //           </button> // Removed
  //           <div className="flex space-x-2"> // Removed
  //             {currentQuestion < selectedQuiz.questions.length - 1 ? ( // Removed
  //               <button // Removed
  //                 onClick={() => setCurrentQuestion(currentQuestion + 1)} // Removed
  //                 className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" // Removed
  //               > // Removed
  //                 Suivant // Removed
  //               </button> // Removed
  //             ) : ( // Removed
  //               <button // Removed
  //                 onClick={submitQuiz} // Removed
  //                 className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700" // Removed
  //               > // Removed
  //                 Terminer le quiz // Removed
  //               </button> // Removed
  //             )} // Removed
  //           </div> // Removed
  //         </div> // Removed
  //         <div className="mt-6"> // Removed
  //           <div className="flex justify-between text-sm text-gray-600 mb-2"> // Removed
  //             <span>Progression</span> // Removed
  //             <span>{answers.filter(a => a !== -1).length} / {selectedQuiz.questions.length} répondues</span> // Removed
  //           </div> // Removed
  //           <div className="w-full bg-gray-200 rounded-full h-2"> // Removed
  //             <div // Removed
  //               className="bg-blue-600 h-2 rounded-full transition-all duration-300" // Removed
  //               style={{ width: `${(answers.filter(a => a !== -1).length / selectedQuiz.questions.length) * 100}%` }} // Removed
  //             ></div> // Removed
  //           </div> // Removed
  //         </div> // Removed
  //       </div> // Removed
  //     </div> // Removed
  //   ); // Removed
  // } // Removed

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🧪 Mes Travaux Pratiques</h2>
            <p className="text-blue-100">
              Découvre et réalise tes expériences scientifiques virtuelles
            </p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{tps.filter(tp => tp.status === 'active').length}</div>
              <div className="text-sm text-blue-200">Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completedTPIds.length}</div>
              <div className="text-sm text-blue-200">Terminés</div>
            </div>
          </div>
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
              placeholder="Rechercher un TP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Terminés
            </button>
          </div>
        </div>
      </div>

      {/* Liste des TP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTPs.length > 0 ? (
          filteredTPs.map((tp) => {
            const status = getTPStatus(tp);
            const daysUntilDue = getDaysUntilDue(tp.dueDate);
            const score = getStudentScore(tp.id);
            return (
              <div key={tp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {tp.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {tp.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {tp.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {tp.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {tp.duration} min
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {tp.isQuizOnly ? 'Quiz' : getStatusLabel(status)}
                    </span>
                  </div>
                  {/* Échéance et score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {tp.dueDate && (
                        <div className={`flex items-center gap-1 text-sm ${
                          daysUntilDue !== null && daysUntilDue < 3 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="w-4 h-4" />
                          <span>
                            {daysUntilDue !== null && daysUntilDue >= 0 
                              ? `${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''} restant${daysUntilDue > 1 ? 's' : ''}`
                              : 'Échéance dépassée'
                            }
                          </span>
                        </div>
                      )}
                      {score !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">{score}%</span>
                        </div>
                      )}
                    </div>
                    {/* Urgence */}
                    {daysUntilDue !== null && daysUntilDue < 3 && daysUntilDue >= 0 && status === 'active' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {tp.isQuizOnly ? 'Quiz indépendant' : `${tp.simulations?.length || 0} simulation${tp.simulations?.length > 1 ? 's' : ''}${tp.quiz ? ' + Quiz' : ''}`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun TP trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Essayez avec d'autres mots-clés"
                : "Aucun TP ne correspond aux filtres sélectionnés"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}