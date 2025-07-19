import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

interface Quiz {
  id: number;
  title: string;
  description: string;
  subject: string;
  level: string;
  timeLimit: number;
  questions: { text: string; options: string[]; correctAnswer: number }[];
}

const StudentQuizList: React.FC = () => {
  const api = useApi();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resultId, setResultId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.execute('/quizzes', { method: 'GET' });
      if (response && response.quizzes) {
        setQuizzes(response.quizzes);
      } else {
        console.log('Réponse API:', response);
        setError('Format de réponse inattendu');
      }
    } catch (err) {
      console.error('Erreur fetchQuizzes:', err);
      setError('Erreur lors du chargement des quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    try {
      const response = await api.execute(`/quizzes/${quiz.id}/start`, { method: 'POST' });
      if (response && response.resultId) {
        setSelectedQuiz(quiz);
        setCurrentQuestion(0);
        setAnswers(new Array(quiz.questions.length).fill(-1));
        setTimeLeft(quiz.timeLimit * 60);
        setQuizStarted(true);
        setResultId(response.resultId);
        setStartTime(new Date());
      } else {
        console.log('Réponse startQuiz:', response);
        alert('Erreur lors du démarrage du quiz');
      }
    } catch (err) {
      console.error('Erreur startQuiz:', err);
      alert('Erreur lors du démarrage du quiz');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        if (timeLeft <= 1) {
          submitQuiz();
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [quizStarted, timeLeft]);

  const submitQuiz = async () => {
    if (!selectedQuiz || !resultId || !startTime) return;
    try {
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      const response = await api.execute(`/quizzes/${selectedQuiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          resultId,
          answers,
          timeSpent
        })
      });
      if (response && response.score !== undefined) {
        alert(`Quiz terminé ! Score: ${response.score}% - ${response.feedback || 'Bien joué !'}`);
        setQuizStarted(false);
        setSelectedQuiz(null);
        setResultId(null);
        setStartTime(null);
        fetchQuizzes();
      } else {
        console.log('Réponse submitQuiz:', response);
        alert('Erreur lors de la soumission du quiz');
      }
    } catch (err) {
      console.error('Erreur submitQuiz:', err);
      alert('Erreur lors de la soumission du quiz');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }
  if (error) {
    return <div className="text-center py-8"><p className="text-red-600 mb-4">{error}</p><button onClick={fetchQuizzes} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Réessayer</button></div>;
  }

  if (quizStarted && selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedQuiz.title}</h2>
              <p className="text-gray-600">{selectedQuiz.subject} - {selectedQuiz.level}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-red-600">
                Temps restant: {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} sur {selectedQuiz.questions.length}
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Question {currentQuestion + 1}: {question.text}
            </h3>
            <div className="space-y-3">
              {question.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[currentQuestion] === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerSelect(currentQuestion, index)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Précédent
            </button>
            <div className="flex space-x-2">
              {currentQuestion < selectedQuiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Terminer le quiz
                </button>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progression</span>
              <span>{answers.filter(a => a !== -1).length} / {selectedQuiz.questions.length} répondues</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answers.filter(a => a !== -1).length / selectedQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📝 Mes Quiz</h2>
        <p className="text-blue-100">Retrouvez ici tous les quiz créés par vos professeurs et lancez-vous !</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 mb-2">{quiz.subject} - {quiz.level}</p>
              <p className="text-gray-500 mb-4">{quiz.description}</p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
              onClick={() => startQuiz(quiz)}
            >
              Faire le Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentQuizList; 