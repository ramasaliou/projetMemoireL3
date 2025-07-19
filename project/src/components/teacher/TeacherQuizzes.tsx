import React, { useEffect, useState } from 'react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  subject: string;
  level: string;
  status: string;
  created_at: string;
  updated_at: string;
  questions?: any[];
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  stats?: {
    totalAttempts: number;
    averageScore: number;
  };
}

const initialForm: Partial<Quiz> = {
  title: '',
  description: '',
  subject: '',
  level: '',
  status: 'active',
  questions: [],
  timeLimit: 30,
  passingScore: 50,
  maxAttempts: 1,
};

const levels = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];

// Ajout du composant QuestionForm pour la gestion dynamique des questions
const QuestionForm = ({ questions, setQuestions }: { questions: any[]; setQuestions: (q: any[]) => void }) => {
  const handleQuestionChange = (idx: number, field: string, value: string | number) => {
    const updated = questions.map((q, i) =>
      i === idx ? { ...q, [field]: value } : q
    );
    setQuestions(updated);
  };
  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const newOptions = [...q.options];
      newOptions[optIdx] = value;
      return { ...q, options: newOptions };
    });
    setQuestions(updated);
  };
  const handleCorrectChange = (qIdx: number, correctIdx: number) => {
    const updated = questions.map((q, i) =>
      i === qIdx ? { ...q, correctAnswer: correctIdx } : q
    );
    setQuestions(updated);
  };
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
  };
  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };
  return (
    <div className="space-y-6">
      {questions.map((q, idx) => (
        <div key={idx} className="border rounded-xl p-4 mb-2 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Question {idx + 1}</span>
            <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 text-xs">Supprimer</button>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Énoncé</label>
            <input
              type="text"
              value={q.text}
              onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-2">
            {q.options.map((opt: string, oIdx: number) => (
              <div key={oIdx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${idx}`}
                  checked={q.correctAnswer === oIdx}
                  onChange={() => handleCorrectChange(idx, oIdx)}
                  className="accent-green-600"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                  className="border rounded px-2 py-1 flex-1"
                  placeholder={`Réponse ${oIdx + 1}`}
                  required
                />
                {q.correctAnswer === oIdx && <span className="text-green-600 text-xs">(Bonne réponse)</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded">+ Ajouter une question</button>
    </div>
  );
};

const TeacherQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Quiz>>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des quiz');
      const data = await response.json();
      setQuizzes(data.data.quizzes || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setFormError(null);
  };
  const openEdit = (quiz: Quiz) => {
    setForm({ ...quiz });
    setEditingId(quiz.id);
    setShowForm(true);
    setFormError(null);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setFormError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const token = localStorage.getItem('authToken');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `http://localhost:5000/api/quizzes/${editingId}`
        : 'http://localhost:5000/api/quizzes';
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          questions: form.questions || [{ question: 'Question exemple', options: ['A', 'B', 'C', 'D'], answer: 0 }],
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la soumission');
      }
      await fetchQuizzes();
      closeForm();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (quiz: Quiz) => {
    if (!window.confirm(`Supprimer le quiz: ${quiz.title} ?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await fetchQuizzes();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Ajout de la fonction pour changer le statut d'un quiz
  const handleToggleStatus = async (quiz: Quiz) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const newStatus = quiz.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`http://localhost:5000/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Erreur lors du changement de statut');
      await fetchQuizzes();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des stats pour le tableau de bord
  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter(q => q.status === 'active').length;
  const inactiveQuizzes = quizzes.filter(q => q.status === 'inactive').length;
  // Les deux suivants sont mockés, à remplacer par des vraies stats si tu as les données
  const totalAttempts = quizzes.reduce((sum, q) => sum + (q.stats?.totalAttempts || 0), 0);
  const averageScore = quizzes.length > 0 ? Math.round(
    quizzes.reduce((sum, q) => sum + (q.stats?.averageScore || 0), 0) / quizzes.length
  ) : 0;

  if (loading) return <div className="text-center py-8">Chargement des quiz...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Tableau de bord Quiz */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div className="bg-blue-100 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-700">{totalQuizzes}</span>
          <span className="text-sm text-blue-700">Total Quiz</span>
        </div>
        <div className="bg-green-100 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-green-700">{activeQuizzes}</span>
          <span className="text-sm text-green-700">Quiz Actifs</span>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-700">{inactiveQuizzes}</span>
          <span className="text-sm text-gray-700">Quiz Inactifs</span>
        </div>
        <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-purple-700">{totalAttempts}</span>
          <span className="text-sm text-purple-700">Tentatives</span>
        </div>
        <div className="bg-orange-100 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-orange-700">{averageScore}%</span>
          <span className="text-sm text-orange-700">Score Moyen</span>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📝 Mes Quiz</h2>
        <button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Nouveau Quiz
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md border p-6 mb-6 max-w-xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Modifier le Quiz' : 'Créer un Nouveau Quiz'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Titre *</label>
              <input
                type="text"
                name="title"
                value={form.title || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                minLength={5}
                maxLength={100}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Description *</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
                minLength={10}
                maxLength={500}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Matière *</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Niveau *</label>
                <select
                  name="level"
                  value={form.level || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Sélectionner</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Limite de temps (min)</label>
                <input
                  type="number"
                  name="timeLimit"
                  value={form.timeLimit || 30}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min={5}
                  max={180}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Score de passage (%)</label>
                <input
                  type="number"
                  name="passingScore"
                  value={form.passingScore || 50}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min={0}
                  max={100}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Tentatives max</label>
                <input
                  type="number"
                  name="maxAttempts"
                  value={form.maxAttempts || 1}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min={1}
                  max={10}
                  required
                />
              </div>
            </div>
            {/* Questions: à améliorer pour édition avancée */}
            <div>
              <label className="block font-medium mb-1">Questions</label>
              <QuestionForm
                questions={Array.isArray(form.questions) ? form.questions : []}
                setQuestions={qs => setForm(f => ({ ...f, questions: qs }))}
              />
              <div className="text-xs text-gray-500 mt-1">Pour chaque question, saisis l'énoncé, 4 réponses et coche la bonne réponse.</div>
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={closeForm} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Annuler</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium">
                {submitting ? 'Enregistrement...' : (editingId ? 'Enregistrer' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="text-gray-500 text-center">Aucun quiz trouvé.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Titre</th>
                <th className="px-4 py-2 text-left">Matière</th>
                <th className="px-4 py-2 text-left">Niveau</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{quiz.title}</td>
                  <td className="px-4 py-2">{quiz.subject}</td>
                  <td className="px-4 py-2">{quiz.level}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${quiz.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{quiz.status}</span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => openEdit(quiz)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >Modifier</button>
                    <button
                      onClick={() => handleDelete(quiz)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >Supprimer</button>
                    <button
                      onClick={() => handleToggleStatus(quiz)}
                      className={`px-3 py-1 rounded ${quiz.status === 'active' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      {quiz.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes; 