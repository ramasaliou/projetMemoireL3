import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  FileText,
  Calendar,
  Clock,
  Target,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  questions: QuizQuestion[];
  timeLimit?: number; // en minutes
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export default function TeacherQuizBank() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Quiz Respiration Cellulaire',
      description: 'Testez vos connaissances sur la respiration cellulaire',
      subject: 'SVT',
      grade: '3ème',
      difficulty: 'moyen',
      timeLimit: 15,
      questions: [
        {
          id: '1',
          question: 'Quel est le principal produit de la respiration cellulaire ?',
          options: ['Oxygène', 'Dioxyde de carbone', 'Eau', 'Glucose'],
          correctAnswer: 1,
          explanation: 'Le dioxyde de carbone est le principal déchet de la respiration cellulaire.'
        },
        {
          id: '2',
          question: 'Dans quel organite se déroule principalement la respiration cellulaire ?',
          options: ['Noyau', 'Mitochondrie', 'Chloroplaste', 'Réticulum endoplasmique'],
          correctAnswer: 1,
          explanation: 'La respiration cellulaire se déroule principalement dans les mitochondries.'
        }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      isActive: true
    },
    {
      id: '2',
      title: 'Quiz Groupes Sanguins',
      description: 'Évaluez votre compréhension des groupes sanguins',
      subject: 'SVT',
      grade: '3ème',
      difficulty: 'facile',
      timeLimit: 10,
      questions: [
        {
          id: '1',
          question: 'Combien y a-t-il de groupes sanguins principaux ?',
          options: ['2', '3', '4', '5'],
          correctAnswer: 2,
          explanation: 'Il y a 4 groupes sanguins principaux : A, B, AB et O.'
        }
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      isActive: true
    },
    {
      id: '3',
      title: 'Quiz Système Immunitaire',
      description: 'Testez vos connaissances sur le système immunitaire',
      subject: 'SVT',
      grade: '3ème',
      difficulty: 'difficile',
      timeLimit: 20,
      questions: [
        {
          id: '1',
          question: 'Quel type de cellule est responsable de la production d\'anticorps ?',
          options: ['Lymphocytes T', 'Lymphocytes B', 'Macrophages', 'Neutrophiles'],
          correctAnswer: 1,
          explanation: 'Les lymphocytes B sont responsables de la production d\'anticorps.'
        }
      ],
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-18'),
      isActive: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    subject: 'SVT',
    grade: '3ème',
    difficulty: 'moyen' as const,
    timeLimit: 15
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && quiz.isActive) ||
                         (filter === 'inactive' && !quiz.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'text-green-600 bg-green-100';
      case 'moyen': return 'text-yellow-600 bg-yellow-100';
      case 'difficile': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return '🟢 Facile';
      case 'moyen': return '🟡 Moyen';
      case 'difficile': return '🔴 Difficile';
      default: return 'Inconnu';
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.options.every(opt => opt.trim())) {
      alert('Veuillez remplir la question et toutes les options');
      return;
    }

    const question: QuizQuestion = {
      ...currentQuestion,
      id: Date.now().toString()
    };

    if (editingQuiz) {
      setEditingQuiz(prev => prev ? {
        ...prev,
        questions: [...prev.questions, question]
      } : null);
    } else {
      // Pour le nouveau quiz
      setNewQuiz(prev => ({ ...prev }));
    }

    setCurrentQuestion({
      id: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  const handleCreateQuiz = () => {
    if (!newQuiz.title || !newQuiz.description) {
      alert('Veuillez remplir le titre et la description du quiz');
      return;
    }

    const quiz: Quiz = {
      id: Date.now().toString(),
      ...newQuiz,
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    setQuizzes(prev => [quiz, ...prev]);
    setNewQuiz({
      title: '',
      description: '',
      subject: 'SVT',
      grade: '3ème',
      difficulty: 'moyen',
      timeLimit: 15
    });
    setShowCreateForm(false);
  };

  const handleEditQuiz = () => {
    if (!editingQuiz || !editingQuiz.title || !editingQuiz.description) {
      alert('Veuillez remplir le titre et la description du quiz');
      return;
    }

    setQuizzes(prev => prev.map(quiz =>
      quiz.id === editingQuiz.id
        ? { ...editingQuiz, updatedAt: new Date() }
        : quiz
    ));
    setEditingQuiz(null);
  };

  const handleDeleteQuiz = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
    }
  };

  const toggleQuizStatus = (id: string) => {
    setQuizzes(prev => prev.map(quiz =>
      quiz.id === id ? { ...quiz, isActive: !quiz.isActive, updatedAt: new Date() } : quiz
    ));
  };

  const removeQuestion = (quizId: string, questionId: string) => {
    if (editingQuiz && editingQuiz.id === quizId) {
      setEditingQuiz(prev => prev ? {
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId)
      } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📝 Banque de Quiz</h2>
            <p className="text-purple-100">
              Créez et gérez vos quiz pour évaluer les connaissances de vos élèves
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Créer un quiz
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quiz</p>
              <p className="text-2xl font-bold text-purple-600">{quizzes.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quiz Actifs</p>
              <p className="text-2xl font-bold text-green-600">{quizzes.filter(q => q.isActive).length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Questions Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernière Mise à jour</p>
              <p className="text-2xl font-bold text-orange-600">
                {quizzes.length > 0 
                  ? new Date(Math.max(...quizzes.map(q => q.updatedAt.getTime()))).toLocaleDateString('fr-FR')
                  : 'Aucun'
                }
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
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
              placeholder="Rechercher un quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🟢 Actifs
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'inactive' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔴 Inactifs
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">➕ Créer un nouveau quiz</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre du quiz</label>
              <input
                type="text"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Quiz Respiration Cellulaire"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
              <select
                value={newQuiz.subject}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="SVT">SVT</option>
                <option value="Physique">Physique</option>
                <option value="Chimie">Chimie</option>
                <option value="Mathématiques">Mathématiques</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newQuiz.description}
              onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Description du quiz..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select
                value={newQuiz.grade}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="6ème">6ème</option>
                <option value="5ème">5ème</option>
                <option value="4ème">4ème</option>
                <option value="3ème">3ème</option>
                <option value="2nde">2nde</option>
                <option value="1ère">1ère</option>
                <option value="Terminale">Terminale</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
              <select
                value={newQuiz.difficulty}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temps limite (min)</label>
              <input
                type="number"
                value={newQuiz.timeLimit}
                onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 15 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="5"
                max="120"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateQuiz}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Créer le quiz
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewQuiz({
                  title: '',
                  description: '',
                  subject: 'SVT',
                  grade: '3ème',
                  difficulty: 'moyen',
                  timeLimit: 15
                });
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Formulaire de modification */}
      {editingQuiz && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✏️ Modifier le quiz</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre du quiz</label>
              <input
                type="text"
                value={editingQuiz.title}
                onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
              <select
                value={editingQuiz.subject}
                onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, subject: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="SVT">SVT</option>
                <option value="Physique">Physique</option>
                <option value="Chimie">Chimie</option>
                <option value="Mathématiques">Mathématiques</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editingQuiz.description}
              onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, description: e.target.value } : null)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select
                value={editingQuiz.grade}
                onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, grade: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="6ème">6ème</option>
                <option value="5ème">5ème</option>
                <option value="4ème">4ème</option>
                <option value="3ème">3ème</option>
                <option value="2nde">2nde</option>
                <option value="1ère">1ère</option>
                <option value="Terminale">Terminale</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
              <select
                value={editingQuiz.difficulty}
                onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, difficulty: e.target.value as any } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temps limite (min)</label>
              <input
                type="number"
                value={editingQuiz.timeLimit || 15}
                onChange={(e) => setEditingQuiz(prev => prev ? { ...prev, timeLimit: parseInt(e.target.value) || 15 } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="5"
                max="120"
              />
            </div>
          </div>

          {/* Questions existantes */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Questions ({editingQuiz.questions.length})</h4>
            {editingQuiz.questions.length > 0 ? (
              <div className="space-y-3">
                {editingQuiz.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                optIndex === question.correctAnswer 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className={optIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <p className="text-sm text-gray-500 mt-2">
                            💡 {question.explanation}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeQuestion(editingQuiz.id, question.id)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title="Supprimer la question"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune question ajoutée</p>
            )}
          </div>

          {/* Ajouter une nouvelle question */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">➕ Ajouter une question</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez votre question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                        className="text-purple-500 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explication (optionnel)</label>
                <textarea
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Explication de la réponse correcte..."
                />
              </div>

              <button
                onClick={handleAddQuestion}
                disabled={!currentQuestion.question || !currentQuestion.options.every(opt => opt.trim())}
                className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Ajouter la question
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleEditQuiz}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
            >
              <Edit className="w-4 h-4 inline mr-2" />
              Enregistrer les modifications
            </button>
            <button
              onClick={() => setEditingQuiz(null)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des quiz */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Mes Quiz ({filteredQuizzes.length})</h3>
        
        {filteredQuizzes.length > 0 ? (
          <div className="space-y-4">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                !quiz.isActive ? 'bg-gray-50 opacity-75' : ''
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                            {quiz.subject}
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {quiz.grade}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                            {getDifficultyLabel(quiz.difficulty)}
                          </span>
                          {!quiz.isActive && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                              Inactif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{quiz.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}
                      </span>
                      {quiz.timeLimit && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {quiz.timeLimit} min
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Créé le {quiz.createdAt.toLocaleDateString('fr-FR')}
                      </span>
                      {quiz.updatedAt.getTime() !== quiz.createdAt.getTime() && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Modifié le {quiz.updatedAt.toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingQuiz(quiz)}
                      className="p-2 text-green-500 hover:bg-green-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleQuizStatus(quiz.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        quiz.isActive 
                          ? 'text-orange-500 hover:bg-orange-100' 
                          : 'text-green-500 hover:bg-green-100'
                      }`}
                      title={quiz.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {quiz.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun quiz trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Aucun quiz ne correspond à votre recherche.' : 'Vous n\'avez pas encore créé de quiz.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Créer votre premier quiz
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 