import React, { useEffect, useState } from 'react';

interface Teacher {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Class {
  id: number;
  name: string;
  level: string;
  subject: string;
  teacherId: number;
  teacher?: Teacher;
  maxStudents: number;
  currentStudents: number;
  description?: string;
  room?: string;
  academicYear: string;
  status: 'active' | 'inactive';
}

interface Student {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  last_login?: string;
}

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [form, setForm] = useState<Partial<Class>>({});
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Charger les classes
  const loadClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement des classes');
      setClasses(data.data.classes);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les enseignants pour le formulaire
  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/users?role=teacher', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTeachers(data.data.users);
    } catch {}
  };

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  // Ouvrir le formulaire de création
  const openCreateForm = () => {
    setFormMode('create');
    setForm({});
    setShowForm(true);
    setSelectedClass(null);
  };

  // Ouvrir le formulaire d'édition
  const openEditForm = (cls: Class) => {
    setFormMode('edit');
    setForm(cls);
    setShowForm(true);
    setSelectedClass(cls);
  };

  // Gérer la saisie du formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Soumettre le formulaire (création ou édition)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      const method = formMode === 'create' ? 'POST' : 'PUT';
      const url = formMode === 'create' ? '/api/classes' : `/api/classes/${selectedClass?.id}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la sauvegarde');
      setShowForm(false);
      setSuccessMsg(formMode === 'create' ? 'Classe créée avec succès !' : 'Classe modifiée avec succès !');
      loadClasses();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Ouvrir la confirmation de suppression
  const openDeleteConfirm = (cls: Class) => {
    setSelectedClass(cls);
    setShowDeleteConfirm(true);
  };

  // Supprimer une classe
  const handleDelete = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/classes/${selectedClass?.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la suppression');
      setShowDeleteConfirm(false);
      setSuccessMsg('Classe supprimée avec succès !');
      loadClasses();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Afficher les élèves d'une classe
  const openStudents = async (cls: Class) => {
    setSelectedClass(cls);
    setShowStudents(true);
    setStudents([]);
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/classes/${cls.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement des élèves');
      setStudents(data.data.students);
    } catch (e: any) {
      setStudentsError(e.message);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Supprimer un élève d'une classe (optionnel, ici on ne fait que lister)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">🏫 Gestion des Classes</h2>
          <p className="text-blue-100">Administration des classes et suivi des performances</p>
        </div>
        <button
          className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-50"
          onClick={openCreateForm}
        >
          + Nouvelle Classe
        </button>
      </div>

      {successMsg && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">{successMsg}</div>}
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-blue-600 font-semibold">Chargement des classes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-700">{cls.name}</h3>
                  <p className="text-sm text-gray-500">{cls.level} • {cls.subject}</p>
                  <p className="text-xs text-gray-400">Année : {cls.academicYear}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${cls.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{cls.status === 'active' ? 'Active' : 'Inactive'}</span>
                  <button className="text-blue-500 text-xs underline" onClick={() => openStudents(cls)}>Voir élèves</button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <img src={cls.teacher?.avatar || 'https://ui-avatars.com/api/?name=Prof'} alt="Prof" className="w-8 h-8 rounded-full border" />
                <span className="text-sm text-gray-700">{cls.teacher?.name || 'Professeur inconnu'}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>Capacité : {cls.maxStudents}</span>
                <span>Effectif : {cls.currentStudents}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200" onClick={() => openEditForm(cls)}>Modifier</button>
                <button className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200" onClick={() => openDeleteConfirm(cls)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire de création/modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md sm:max-w-2xl shadow-lg relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>✕</button>
            <h3 className="text-xl font-bold mb-4">{formMode === 'create' ? 'Créer une classe' : 'Modifier la classe'}</h3>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom de la classe *</label>
                <input type="text" name="name" value={form.name || ''} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required placeholder="ex: 3ème A" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Niveau *</label>
                <input type="text" name="level" value={form.level || ''} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required placeholder="ex: 3ème" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Matière *</label>
                <input type="text" name="subject" value={form.subject || ''} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required placeholder="ex: SVT" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Professeur *</label>
                <select name="teacherId" value={form.teacherId || ''} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required>
                  <option value="">Sélectionner...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacité</label>
                <input type="number" name="maxStudents" value={form.maxStudents || 30} onChange={handleFormChange} className="w-full border rounded px-3 py-2" min={1} placeholder="ex: 30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salle</label>
                <input type="text" name="room" value={form.room || ''} onChange={handleFormChange} className="w-full border rounded px-3 py-2" placeholder="ex: B12" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Année scolaire</label>
                <input type="text" name="academicYear" value={form.academicYear || '2023-2024'} onChange={handleFormChange} className="w-full border rounded px-3 py-2" placeholder="ex: 2023-2024" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" value={form.description || ''} onChange={handleFormChange} className="w-full border rounded px-3 py-2" placeholder="Description de la classe..." />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-200" onClick={() => setShowForm(false)}>Annuler</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 shadow">{formMode === 'create' ? 'Créer' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            <h3 className="text-xl font-bold mb-4 text-red-600">Supprimer la classe</h3>
            <p>Êtes-vous sûr de vouloir supprimer la classe <span className="font-semibold">{selectedClass?.name}</span> ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-2 mt-6">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded" onClick={() => setShowDeleteConfirm(false)}>Annuler</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des élèves */}
      {showStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowStudents(false)}>✕</button>
            <h3 className="text-xl font-bold mb-4">Élèves de la classe {selectedClass?.name}</h3>
            {studentsLoading ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-blue-600 font-semibold">Chargement...</span>
              </div>
            ) : studentsError ? (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">{studentsError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {students.length === 0 ? (
                  <div className="col-span-2 text-gray-500">Aucun élève dans cette classe.</div>
                ) : students.map(stu => (
                  <div key={stu.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 border">
                    <img src={stu.avatar || 'https://ui-avatars.com/api/?name=Eleve'} alt="Avatar" className="w-10 h-10 rounded-full border" />
                    <div>
                      <div className="font-semibold text-gray-800">{stu.name}</div>
                      <div className="text-xs text-gray-500">{stu.email}</div>
                      <div className="text-xs text-gray-400">Dernière connexion : {stu.last_login ? new Date(stu.last_login).toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}