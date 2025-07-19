import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizForm {
  title: string;
  description: string;
  subject: string;
  level: string;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  difficulty: string;
  questions: Question[];
}

const TeacherCreateQuiz: React.FC = () => {
  const { user } = useAuth();
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    subject: user?.subject || 'SVT',
    level: '3ème',
    timeLimit: 30,
    passingScore: 60,
    maxAttempts: 3,
    difficulty: 'moyen',
    questions: [
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

  const handleInputChange = (field: keyof QuizForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => j === optionIndex ? value : opt)
            }
          : q
      )
    }));
  };

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    if (form.questions.length > 1) {
      setForm(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const addOption = (questionIndex: number) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...q.options, ''] }
          : q
      )
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.filter((_, j) => j !== optionIndex),
              correctAnswer: q.correctAnswer >= optionIndex ? Math.max(0, q.correctAnswer - 1) : q.correctAnswer
            }
          : q
      )
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!form.title.trim()) errors.push('Le titre est requis');
    if (!form.description.trim()) errors.push('La description est requise');
    if (!form.subject.trim()) errors.push('La matière est requise');

    form.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        errors.push(`Question ${index + 1}: le texte est requis`);
      }
      
      const validOptions = question.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        errors.push(`Question ${index + 1}: au moins 2 options sont requises`);
      }
      
      if (question.correctAnswer < 0 || question.correctAnswer >= validOptions.length) {
        errors.push(`Question ${index + 1}: réponse correcte invalide`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Nettoyer les questions (supprimer les options vides)
      const cleanedQuestions = form.questions.map(q => ({
        ...q,
        options: q.options.filter(opt => opt.trim())
      }));

      const response = await api.post('/quizzes', {
        ...form,
        questions: cleanedQuestions,
        status: 'draft'
      });

      if (response.success) {
        setSuccess('Quiz créé avec succès !');
        // Réinitialiser le formulaire
        setForm({
          title: '',
          description: '',
          subject: user?.subject || 'SVT',
          level: '3ème',
          timeLimit: 30,
          passingScore: 60,
          maxAttempts: 3,
          difficulty: 'moyen',
          questions: [
            {
              text: '',
              options: ['', '', '', ''],
              correctAnswer: 0
            }
          ]
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer un Quiz</h1>
        <p className="text-gray-600">
          Créez un quiz interactif pour évaluer les connaissances de vos étudiants
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <div className="whitespace-pre-line">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du quiz *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Quiz sur la respiration cellulaire"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matière *
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SVT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau *
              </label>
              <select
                value={form.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulté
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description détaillée du quiz..."
            />
          </div>
        </div>

        {/* Paramètres du quiz */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Paramètres du quiz</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={form.timeLimit}
                onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score de passage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.passingScore}
                onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentatives maximum
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.maxAttempts}
                onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Ajouter une question
            </button>
          </div>

          {form.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Question {questionIndex + 1}
                </h3>
                {form.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte de la question *
                </label>
                <textarea
                  value={question.text}
                  onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre question..."
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options de réponse
                  </label>
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Ajouter une option
                  </button>
                </div>

                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={question.correctAnswer === optionIndex}
                      onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                      className="mr-3"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Création...' : 'Créer le quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherCreateQuiz; 