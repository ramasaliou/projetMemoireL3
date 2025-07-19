import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Save, 
  Eye, 
  Calendar, 
  Clock,
  Target,
  BookOpen,
  Microscope,
  HelpCircle,
  X,
  Check,
  FileText,
  Upload
} from 'lucide-react';

export default function TeacherCreateTP() {
  const { createTP, simulations } = useData();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tpData, setTPData] = useState({
    title: '',
    description: '',
    subject: 'SVT',
    level: '3ème',
    duration: 60,
    dueDate: '',
    simulations: [] as string[],
    quiz: {
      questions: [] as Array<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
      }>
    }
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else if (file) {
      alert('Veuillez sélectionner un fichier PDF');
      e.target.value = '';
    }
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSimulationToggle = (simulationId: string) => {
    setTPData(prev => ({
      ...prev,
      simulations: prev.simulations.includes(simulationId)
        ? prev.simulations.filter(id => id !== simulationId)
        : [...prev.simulations, simulationId]
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt.trim())) {
      const newQuestion = {
        id: Date.now().toString(),
        ...currentQuestion
      };
      setTPData(prev => ({
        ...prev,
        quiz: {
          questions: [...prev.quiz.questions, newQuestion]
        }
      }));
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });
    }
  };

  const removeQuestion = (questionId: string) => {
    setTPData(prev => ({
      ...prev,
      quiz: {
        questions: prev.quiz.questions.filter(q => q.id !== questionId)
      }
    }));
  };

  const handleCreateTP = async () => {
    try {
      // Créer un FormData pour envoyer le fichier PDF
      const formData = new FormData();
      
      // Ajouter les données du TP
      formData.append('title', tpData.title);
      formData.append('description', tpData.description);
      formData.append('subject', tpData.subject);
      formData.append('level', tpData.level);
      formData.append('duration', tpData.duration.toString());
      if (tpData.dueDate) {
        formData.append('dueDate', tpData.dueDate);
      }
      formData.append('status', 'active');
      formData.append('createdBy', user?.id || '2');
      
      // Ajouter le fichier PDF s'il existe
      if (selectedFile) {
        formData.append('pdf', selectedFile);
      }

      // Appeler createTP avec FormData
      await createTP(formData);
      
      // Reset form
      setTPData({
        title: '',
        description: '',
        subject: 'SVT',
        level: '3ème',
        duration: 60,
        dueDate: '',
        simulations: [],
        quiz: { questions: [] }
      });
      setSelectedFile(null);
      setStep(1);
      
      alert('TP créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du TP:', error);
      alert('Erreur lors de la création du TP');
    }
  };

  const steps = [
    { number: 1, title: 'Informations de base', icon: <BookOpen className="w-5 h-5" /> },
    { number: 2, title: 'Simulations', icon: <Microscope className="w-5 h-5" /> },
    { number: 3, title: 'Quiz (optionnel)', icon: <HelpCircle className="w-5 h-5" /> },
    { number: 4, title: 'Révision', icon: <Eye className="w-5 h-5" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🧪 Créer un Nouveau TP</h2>
            <p className="text-blue-100">
              Concevez des travaux pratiques interactifs pour vos élèves
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Étapes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div className={`flex items-center gap-3 ${
                step >= stepItem.number ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepItem.number 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > stepItem.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepItem.icon
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">{stepItem.title}</div>
                  <div className="text-sm text-gray-500">Étape {stepItem.number}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step > stepItem.number ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu selon l'étape */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {step === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Informations de Base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du TP *
                </label>
                <input
                  type="text"
                  value={tpData.title}
                  onChange={(e) => setTPData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Les échanges gazeux respiratoires"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={tpData.description}
                  onChange={(e) => setTPData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez les objectifs et le contenu du TP..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matière
                </label>
                <select
                  value={tpData.subject}
                  onChange={(e) => setTPData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SVT">Sciences de la Vie et de la Terre</option>
                  <option value="Biologie">Biologie</option>
                  <option value="Géologie">Géologie</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={tpData.level}
                  onChange={(e) => setTPData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="3èmeA">3èmeA</option>
                  <option value="3èmeB">3èmeB</option>
                  <option value="3èmeC">3èmeC</option>
                  <option value="3èmeD">3èmeD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée estimée (minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={tpData.duration}
                    onChange={(e) => setTPData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="180"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date limite (optionnel)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={tpData.dueDate}
                    onChange={(e) => setTPData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier PDF (optionnel)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 inline mr-1" /> Fichier sélectionné: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Suivant →
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 Sélectionner les Simulations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {simulations.map((simulation) => (
                <div
                  key={simulation.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    tpData.simulations.includes(simulation.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSimulationToggle(simulation.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{simulation.title}</h4>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      tpData.simulations.includes(simulation.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {tpData.simulations.includes(simulation.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{simulation.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{simulation.difficulty}</span>
                    <span>{simulation.duration} min</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">❓ Créer un Quiz (Optionnel)</h3>
            
            {/* Questions existantes */}
            {tpData.quiz.questions.length > 0 && (
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-700">Questions créées ({tpData.quiz.questions.length})</h4>
                {tpData.quiz.questions.map((question, index) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-2">
                          {index + 1}. {question.question}
                        </h5>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`text-sm ${
                              optIndex === question.correctAnswer 
                                ? 'text-green-600 font-medium' 
                                : 'text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {optIndex === question.correctAnswer && ' ✓'}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nouvelle question */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-4">Ajouter une nouvelle question</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question
                  </label>
                  <input
                    type="text"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tapez votre question..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options de réponse
                  </label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                          className="text-blue-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Sélectionnez la bonne réponse en cochant le bouton radio correspondant
                  </p>
                </div>

                <button
                  onClick={addQuestion}
                  disabled={!currentQuestion.question || !currentQuestion.options.every(opt => opt.trim())}
                  className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Ajouter la question
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setStep(4)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👁️ Révision et Création</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Informations générales</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Titre:</span> {tpData.title}</div>
                    <div><span className="font-medium">Matière:</span> {tpData.subject}</div>
                    <div><span className="font-medium">Niveau:</span> {tpData.level}</div>
                    <div><span className="font-medium">Durée:</span> {tpData.duration} minutes</div>
                    {tpData.dueDate && (
                      <div><span className="font-medium">Échéance:</span> {new Date(tpData.dueDate).toLocaleDateString('fr-FR')}</div>
                    )}
                    {selectedFile && (
                      <div><span className="font-medium">Fichier PDF:</span> {selectedFile.name}</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Simulations sélectionnées</h4>
                  <div className="space-y-1 text-sm">
                    {tpData.simulations.length > 0 ? (
                      tpData.simulations.map(simId => {
                        const sim = simulations.find(s => s.id === simId);
                        return <div key={simId}>• {sim?.title}</div>;
                      })
                    ) : (
                      <div className="text-gray-500">Aucune simulation sélectionnée</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{tpData.description}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Quiz</h4>
                  <div className="text-sm">
                    {tpData.quiz.questions.length > 0 ? (
                      <div>
                        <span className="font-medium">{tpData.quiz.questions.length} question(s) créée(s)</span>
                        <div className="mt-2 space-y-1">
                          {tpData.quiz.questions.map((q, index) => (
                            <div key={q.id} className="text-gray-600">
                              {index + 1}. {q.question}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Aucun quiz créé</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={handleCreateTP}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Créer le TP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}