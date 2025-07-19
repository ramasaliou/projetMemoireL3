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
  Upload,
  Download
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface Course {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: string;
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'inactive';
  teacherId: string;
  room?: string;
  academicYear: string;
  resources?: any;
  createdAt: Date;
  updatedAt: Date;
  pdfUrl?: string;
  fileSize?: string;
  pages?: number;
  hasPdf?: boolean;
}

export default function TeacherCourses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    subject: 'SVT',
    level: '3ème',
    maxStudents: 30,
    room: '',
    academicYear: '2023-2024'
  });

  // Charger les cours au démarrage
  React.useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.classes) {
          const transformedCourses = data.data.classes.map((course: any) => ({
            id: course.id.toString(),
            name: course.name,
            description: course.description || 'Aucune description disponible',
            subject: course.subject || 'SVT',
            level: course.level || '3ème',
            maxStudents: course.maxStudents || 30,
            currentStudents: course.currentStudents || 0,
            status: course.status || 'active',
            teacherId: course.teacherId,
            room: course.room,
            academicYear: course.academicYear || '2023-2024',
            resources: course.resources,
            createdAt: new Date(course.created_at),
            updatedAt: new Date(course.updated_at),
            pdfUrl: course.resources ? JSON.parse(course.resources).pdfUrl || '' : '',
            fileSize: course.resources ? JSON.parse(course.resources).fileSize || '0 MB' : '0 MB',
            pages: course.resources ? JSON.parse(course.resources).pages || 0 : 0,
            hasPdf: !!(course.resources && JSON.parse(course.resources).pdfUrl)
          }));
          setCourses(transformedCourses);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Veuillez sélectionner un fichier PDF');
    }
  };

  const handleEditingFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setEditingFile(file);
    } else {
      alert('Veuillez sélectionner un fichier PDF');
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Utiliser FormData pour envoyer le PDF et les champs
      const formData = new FormData();
      formData.append('name', newCourse.name);
      formData.append('description', newCourse.description);
      formData.append('subject', newCourse.subject);
      formData.append('level', newCourse.level);
      formData.append('maxStudents', newCourse.maxStudents.toString());
      formData.append('room', newCourse.room);
      formData.append('academicYear', newCourse.academicYear);
      formData.append('teacherId', '3'); // ID du professeur connecté
      if (selectedFile) {
        formData.append('pdf', selectedFile);
      }

      const response = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NE PAS mettre Content-Type ici !
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Réponse du serveur:', response.status, errorData);
        throw new Error(`Erreur lors de la création du cours: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

      // Recharger les cours
      await loadCourses();
      
      setNewCourse({ name: '', description: '', subject: 'SVT', level: '3ème', maxStudents: 30, room: '', academicYear: '2023-2024' });
      setSelectedFile(null);
      setShowAddForm(false);
      alert('Cours créé avec succès !');
    } catch (error) {
      console.error('Erreur création cours:', error);
      alert(`Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !editingCourse.name || !editingCourse.description) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Utiliser FormData pour l'édition avec PDF
      const formData = new FormData();
      formData.append('name', editingCourse.name);
      formData.append('description', editingCourse.description);
      formData.append('subject', editingCourse.subject);
      formData.append('level', editingCourse.level);
      formData.append('maxStudents', editingCourse.maxStudents.toString());
      formData.append('room', editingCourse.room || '');
      formData.append('academicYear', editingCourse.academicYear);
      if (editingFile) {
        formData.append('pdf', editingFile);
      }

      const response = await fetch(`http://localhost:5000/api/classes/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // NE PAS mettre Content-Type ici !
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du cours');
      }

      // Recharger les cours
      await loadCourses();
      
      setEditingCourse(null);
      setEditingFile(null);
      alert('Cours modifié avec succès !');
    } catch (error) {
      console.error('Erreur modification cours:', error);
      alert(`Erreur lors de la modification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }

        const response = await fetch(`http://localhost:5000/api/classes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du cours');
        }

        // Recharger les cours
        await loadCourses();
        alert('Cours supprimé avec succès !');
      } catch (error) {
        console.error('Erreur suppression cours:', error);
        alert(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleDownload = (course: Course) => {
    if (course.pdfUrl) {
      // Créer un lien temporaire pour télécharger le PDF
      const link = document.createElement('a');
      link.href = `http://localhost:5000/${course.pdfUrl}`;
      link.download = `${course.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Aucun PDF disponible pour ce cours');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des cours...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📚 Mes Cours</h2>
            <p className="text-green-100">
              Gérez vos cours et partagez des ressources avec vos élèves
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et bouton d'ajout */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau Cours
          </button>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCourse(course)}
                  className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>{course.subject} - {course.level}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{course.currentStudents}/{course.maxStudents} élèves</span>
              </div>
              {course.room && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Salle {course.room}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {course.hasPdf ? (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">PDF disponible</span>
                    <button
                      onClick={() => handleDownload(course)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-3 h-3 inline mr-1" />
                      Télécharger
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Aucun PDF</span>
                  </div>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {course.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout de cours */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Créer un nouveau cours</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du cours *
                </label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Biologie Cellulaire"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Description du cours..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière
                  </label>
                  <select
                    value={newCourse.subject}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    value={newCourse.level}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="3ème">3ème</option>
                    <option value="2nde">2nde</option>
                    <option value="1ère">1ère</option>
                    <option value="Terminale">Terminale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre max d'élèves
                  </label>
                  <input
                    type="number"
                    value={newCourse.maxStudents}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salle (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newCourse.room}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Labo 101"
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
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 inline mr-1" /> Fichier sélectionné: {selectedFile.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCourse}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Créer le cours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de cours */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Modifier le cours</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du cours *
                </label>
                <input
                  type="text"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière
                  </label>
                  <select
                    value={editingCourse.subject}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, subject: e.target.value } : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, level: e.target.value } : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="3ème">3ème</option>
                    <option value="2nde">2nde</option>
                    <option value="1ère">1ère</option>
                    <option value="Terminale">Terminale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre max d'élèves
                  </label>
                  <input
                    type="number"
                    value={editingCourse.maxStudents}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, maxStudents: parseInt(e.target.value) } : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salle (optionnel)
                  </label>
                  <input
                    type="text"
                    value={editingCourse.room || ''}
                    onChange={(e) => setEditingCourse(prev => prev ? { ...prev, room: e.target.value } : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Labo 101"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau fichier PDF (optionnel)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleEditingFileSelect}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {editingFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 inline mr-1" /> Nouveau fichier: {editingFile.name}
                  </div>
                )}
                {editingCourse.hasPdf && !editingFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 inline mr-1" /> PDF actuel conservé
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleEditCourse}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Modifier le cours
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 