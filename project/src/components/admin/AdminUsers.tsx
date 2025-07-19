import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Mail,
  UserCheck,
  UserX,
  MoreVertical,
  Download,
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  class?: string;
  subject?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin: Date;
  createdAt: Date;
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  class?: string;
  subject?: string;
  assignedClass?: string; // Classe assignée au professeur
}

const demoUsers: User[] = [
  {
    id: '1',
    name: 'lewis diatta',
    email: 'diatta.lewis@lycee.com',
    role: 'student',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    status: 'active',
    lastLogin: new Date('2024-01-25T14:30:00'),
    createdAt: new Date('2023-09-01')
  },
  {
    id: '2',
    name: 'Dr. rama niang',
    email: 'rama.niang@lycee.com',
    role: 'teacher',
    subject: 'Sciences de la Vie et de la Terre',
    avatar: 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=150',
    status: 'active',
    lastLogin: new Date('2024-01-25T16:45:00'),
    createdAt: new Date('2023-08-15')
  },
  {
    id: '3',
    name: 'amadou Ba',
    email: 'amadou.ba@lycee.com',
    role: 'student',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    status: 'active',
    lastLogin: new Date('2024-01-24T10:15:00'),
    createdAt: new Date('2023-09-01')
  }
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les modales de confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'status' | 'password';
    userId: string;
    userName: string;
    currentStatus?: string;
  } | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    role: 'student',
    class: '',
    subject: '',
    assignedClass: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

  // États pour l'assignation de classe
  const [showAssignClassForm, setShowAssignClassForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [assignedClass, setAssignedClass] = useState('');
  const [isAssigningClass, setIsAssigningClass] = useState(false);

  // Fonction pour charger les utilisateurs depuis l'API
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error('Erreur lors du chargement des utilisateurs');
      }

      const data = await response.json();
      
      // Convertir les données de l'API au format attendu par le frontend
      const apiUsers: User[] = data.data.users.map((user: {
        id: number;
        name: string;
        email: string;
        role: string;
        class?: string;
        subject?: string;
        avatar?: string;
        is_active: boolean;
        last_login?: string;
        created_at: string;
      }) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        subject: user.subject,
        avatar: user.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`,
        status: user.is_active ? 'active' : 'inactive',
        lastLogin: user.last_login ? new Date(user.last_login) : new Date(),
        createdAt: new Date(user.created_at)
      }));

      setUsers(apiUsers);
    } catch (error) {
      const err = error as Error;
      console.error('Erreur chargement utilisateurs:', err);
      // Fallback vers les données de démonstration en cas d'erreur
      setUsers(demoUsers);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les utilisateurs au montage du composant
  React.useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Utilisation de FormData pour envoyer l'image
      const formData = new FormData();
      formData.append('name', createForm.name);
      formData.append('email', createForm.email);
      formData.append('password', createForm.password);
      formData.append('role', createForm.role);
      if (createForm.role === 'student') formData.append('class', createForm.class || '');
      if (createForm.role === 'teacher') {
        formData.append('subject', createForm.subject || '');
        formData.append('class', createForm.assignedClass || ''); // Classe assignée au professeur
      }
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Ne pas mettre 'Content-Type' pour FormData
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error(data.message || 'Erreur lors de la création de l\'utilisateur');
      }

      // Recharger la liste des utilisateurs depuis l'API
      await loadUsers();
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        class: '',
        subject: '',
        assignedClass: ''
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setShowCreateForm(false);
      alert('Utilisateur créé avec succès !');
    } catch (error) {
      const err = error as Error;
      console.error('Erreur création utilisateur:', err);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      } else {
        alert(`Erreur lors de la création de l'utilisateur: ${err.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: 'student',
      class: '',
      subject: '',
      assignedClass: ''
    });
    setShowCreateForm(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  // Fonctions pour ouvrir les modales de confirmation
  const openDeleteConfirm = (userId: string, userName: string) => {
    setConfirmAction({ type: 'delete', userId, userName });
    setShowDeleteConfirm(true);
  };

  const openStatusConfirm = (userId: string, userName: string, currentStatus: string) => {
    setConfirmAction({ type: 'status', userId, userName, currentStatus });
    setShowStatusConfirm(true);
  };

  const openPasswordConfirm = (userId: string, userName: string) => {
    setConfirmAction({ type: 'password', userId, userName });
    setShowPasswordConfirm(true);
  };

  // Fonction pour ouvrir le formulaire d'assignation de classe
  const openAssignClassForm = (teacher: User) => {
    setSelectedTeacher(teacher);
    setAssignedClass(teacher.class || '');
    setShowAssignClassForm(true);
    setSelectedUser(null); // Fermer le menu d'actions
  };

  // Fonction pour assigner une classe à un professeur
  const handleAssignClass = async () => {
    if (!selectedTeacher || !assignedClass) {
      alert('Veuillez sélectionner une classe');
      return;
    }

    setIsAssigningClass(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`http://localhost:5000/api/users/${selectedTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ class: assignedClass })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'assignation de classe');
      }

      // Recharger la liste des utilisateurs
      await loadUsers();
      setShowAssignClassForm(false);
      setSelectedTeacher(null);
      setAssignedClass('');
      alert(`Classe "${assignedClass}" assignée avec succès à ${selectedTeacher.name} !`);
    } catch (error) {
      const err = error as Error;
      console.error('Erreur assignation classe:', err);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      } else {
        alert(`Erreur lors de l'assignation: ${err.message}`);
      }
    } finally {
      setIsAssigningClass(false);
    }
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!confirmAction) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`http://localhost:5000/api/users/${confirmAction.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error('Erreur lors de la suppression de l\'utilisateur');
      }

      // Recharger la liste des utilisateurs
      await loadUsers();
      setShowDeleteConfirm(false);
      setConfirmAction(null);
      alert('Utilisateur supprimé avec succès !');
    } catch (error) {
      const err = error as Error;
      console.error('Erreur suppression utilisateur:', err);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      } else {
        alert(`Erreur lors de la suppression: ${err.message}`);
      }
    }
  };

  // Fonction pour activer/désactiver un utilisateur
  const handleToggleUserStatus = async () => {
    if (!confirmAction) return;

    const newIsActive = confirmAction.currentStatus === 'active' ? false : true;
    const action = newIsActive ? 'activé' : 'désactivé';

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`http://localhost:5000/api/users/${confirmAction.userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: newIsActive })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la modification du statut');
      }

      // Recharger la liste des utilisateurs
      await loadUsers();
      setShowStatusConfirm(false);
      setConfirmAction(null);
      alert(`Utilisateur ${action} avec succès !`);
    } catch (error) {
      const err = error as Error;
      console.error('Erreur modification statut:', err);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      } else {
        alert(`Erreur lors de la modification: ${err.message}`);
      }
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const handleResetPassword = async () => {
    if (!confirmAction) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`http://localhost:5000/api/users/${confirmAction.userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error('Erreur lors de la réinitialisation du mot de passe');
      }

      const data = await response.json();
      setShowPasswordConfirm(false);
      setConfirmAction(null);
      alert(`Mot de passe réinitialisé ! Nouveau mot de passe: ${data.data.newPassword}`);
    } catch (error) {
      const err = error as Error;
      console.error('Erreur réinitialisation mot de passe:', err);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      } else {
        alert(`Erreur lors de la réinitialisation: ${err.message}`);
      }
    }
  };

  // Ouvrir le formulaire de modification
  const openEditForm = (user: User) => {
    setEditForm(user);
    setEditAvatarFile(null);
    setEditAvatarPreview(user.avatar || null);
    setShowEditForm(true);
  };

  // Soumettre la modification
  const handleEditUser = async () => {
    if (!editForm.id || !editForm.name || !editForm.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token d\'authentification manquant');
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      formData.append('role', editForm.role || 'student');
      if (editForm.class) formData.append('class', editForm.class);
      if (editForm.subject) formData.append('subject', editForm.subject);
      if (editAvatarFile) formData.append('avatar', editAvatarFile);
      const response = await fetch(`http://localhost:5000/api/users/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors de la modification');
      await loadUsers();
      setShowEditForm(false);
      setEditForm({});
      setEditAvatarFile(null);
      setEditAvatarPreview(null);
      alert('Utilisateur modifié avec succès !');
    } catch (error) {
      const err = error as Error;
      alert(`Erreur lors de la modification: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.class && user.class.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.subject && user.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filter === 'all' || user.role === filter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'text-blue-600 bg-blue-100';
      case 'teacher': return 'text-green-600 bg-green-100';
      case 'admin': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Élève';
      case 'teacher': return 'Professeur';
      case 'admin': return 'Administrateur';
      default: return 'Utilisateur';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${Math.floor(diffInHours)}h`;
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">👥 Gestion des Utilisateurs</h2>
            <p className="text-blue-100">
              Administrez tous les comptes utilisateurs de la plateforme
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Élèves</p>
              <p className="text-2xl font-bold text-blue-600">{userStats.students}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Professeurs</p>
              <p className="text-2xl font-bold text-green-600">{userStats.teachers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{userStats.admins}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactifs</p>
              <p className="text-2xl font-bold text-red-600">{userStats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'student' | 'teacher' | 'admin')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="student">Élèves</option>
              <option value="teacher">Professeurs</option>
              <option value="admin">Administrateurs/surveillant</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
              <Download className="w-4 h-4 inline mr-2" />
              Exporter
            </button>

            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
              <Upload className="w-4 h-4 inline mr-2" />
              Importer
            </button>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Chargement des utilisateurs...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Utilisateur</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Rôle</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Classe/Matière</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Dernière connexion</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Créé le</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.role === 'teacher' ? (
                        <div>
                          <div className="font-medium">{user.subject || '-'}</div>
                          {user.class && (
                            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block mt-1">
                              Classe: {user.class}
                            </div>
                          )}
                        </div>
                      ) : (
                        user.class || user.subject || '-'
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatLastLogin(user.lastLogin)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.createdAt.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(user)}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert(`Envoyer un email à ${user.name}`)}
                          className="p-2 text-green-500 hover:bg-green-100 rounded-lg transition-colors"
                          title="Envoyer un email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                           
                          {selectedUser === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                👁️ Voir le profil
                              </button>
                              {user.role === 'teacher' && (
                                <button 
                                  onClick={() => openAssignClassForm(user)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                >
                                  🏫 Assigner classe
                                </button>
                              )}
                              <button 
                                onClick={() => openPasswordConfirm(user.id, user.name)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                              >
                                🔄 Réinitialiser mot de passe
                              </button>
                              <button 
                                onClick={() => openStatusConfirm(user.id, user.name, user.status)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                              >
                                {user.status === 'active' ? '⏸️ Désactiver' : '▶️ Activer'}
                              </button>
                              <hr className="my-2" />
                              <button 
                                onClick={() => openDeleteConfirm(user.id, user.name)}
                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                              >
                                🗑️ Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun utilisateur trouvé
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? "Essayez avec d'autres mots-clés"
              : "Aucun utilisateur ne correspond aux filtres sélectionnés"
            }
          </p>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">🚀 Actions Rapides</h3>
            <p className="text-purple-100">
              Gérez efficacement tous les utilisateurs de la plateforme
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              📧 Email Groupe
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              📊 Rapport Activité
            </button>
          </div>
        </div>
      </div>

      {/* Modal de création d'utilisateur */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={resetForm}>✕</button>
            <h3 className="text-xl font-bold mb-4">Créer un utilisateur</h3>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleCreateUser(); }}>
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom et prénom"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemple.com"
                  required
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mot de passe"
                  required
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as 'student' | 'teacher' | 'admin' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="student">Élève</option>
                  <option value="teacher">Professeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {/* Classe (pour les élèves) */}
              {createForm.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe
                  </label>
                  <input
                    type="text"
                    value={createForm.class}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 3ème A, Terminale S"
                  />
                </div>
              )}

              {/* Matière (pour les professeurs) */}
              {createForm.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière enseignée
                  </label>
                  <input
                    type="text"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Sciences de la Vie et de la Terre"
                  />
                </div>
              )}

              {/* Classe assignée (pour les professeurs) */}
              {createForm.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe assignée
                  </label>
                  <select
                    value={createForm.assignedClass}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, assignedClass: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une classe</option>
                    <option value="3ème A">3ème A</option>
                    <option value="3ème B">3ème B</option>
                    <option value="2nde A">2nde A</option>
                    <option value="2nde B">2nde B</option>
                    <option value="1ère S">1ère S</option>
                    <option value="1ère ES">1ère ES</option>
                    <option value="Terminale S">Terminale S</option>
                    <option value="Terminale ES">Terminale ES</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Cette classe sera visible dans la section "Mes élèves" du professeur
                  </p>
                </div>
              )}

              {/* Photo de profil */}
              <div>
                <label className="block text-sm font-medium mb-1">Photo de profil</label>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setAvatarFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setAvatarPreview(null);
                  }
                }} />
                {avatarPreview && (
                  <img src={avatarPreview} alt="Aperçu avatar" className="w-16 h-16 rounded-full mt-2 border" />
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="bg-gray-100 text-gray-700 px-4 py-2 rounded" onClick={resetForm}>Annuler</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={isCreating}>{isCreating ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirmer la suppression</h3>
                <p className="text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <span className="font-bold">"{confirmAction.userName}"</span> ?
              </p>
              <p className="text-red-700 text-sm mt-2">
                Cette action supprimera définitivement le compte et toutes les données associées.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de changement de statut */}
      {showStatusConfirm && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Info className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirmer le changement de statut</h3>
                <p className="text-gray-600">Modifier l'accès de l'utilisateur</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                Êtes-vous sûr de vouloir {confirmAction.currentStatus === 'active' ? 'désactiver' : 'activer'} l'utilisateur <span className="font-bold">"{confirmAction.userName}"</span> ?
              </p>
              <p className="text-yellow-700 text-sm mt-2">
                {confirmAction.currentStatus === 'active' 
                  ? 'L\'utilisateur ne pourra plus se connecter à la plateforme.'
                  : 'L\'utilisateur pourra à nouveau se connecter à la plateforme.'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusConfirm(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleToggleUserStatus}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  confirmAction.currentStatus === 'active' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {confirmAction.currentStatus === 'active' ? (
                  <>
                    <UserX className="w-4 h-4 inline mr-2" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 inline mr-2" />
                    Activer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de réinitialisation de mot de passe */}
      {showPasswordConfirm && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirmer la réinitialisation</h3>
                <p className="text-gray-600">Générer un nouveau mot de passe</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">
                Êtes-vous sûr de vouloir réinitialiser le mot de passe de <span className="font-bold">"{confirmAction.userName}"</span> ?
              </p>
              <p className="text-blue-700 text-sm mt-2">
                Un nouveau mot de passe sera généré et affiché. L'utilisateur devra le changer lors de sa prochaine connexion.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordConfirm(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification utilisateur */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md sm:max-w-2xl shadow-lg relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowEditForm(false)}>✕</button>
            <h3 className="text-xl font-bold mb-4">Modifier l'utilisateur</h3>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleEditUser(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input type="text" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg ${!editForm.name ? 'border-red-400' : 'border-gray-300'}`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg ${!editForm.email ? 'border-red-400' : 'border-gray-300'}`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select value={editForm.role || 'student'} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as 'student' | 'teacher' | 'admin' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option value="student">Élève</option>
                  <option value="teacher">Professeur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              {editForm.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                  <input type="text" value={editForm.class || ''} onChange={e => setEditForm(f => ({ ...f, class: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              )}
              {editForm.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière enseignée</label>
                  <input type="text" value={editForm.subject || ''} onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              )}
              <div className="sm:col-span-2 flex flex-col items-center gap-2 mt-2">
                <label className="block text-sm font-medium mb-1">Photo de profil</label>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative group">
                    <img src={editAvatarPreview || '/default-avatar.png'} alt="Aperçu avatar" className="w-24 h-24 rounded-full border object-cover shadow" />
                    {editAvatarPreview && (
                      <button type="button" className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 hover:bg-red-100 transition-opacity opacity-0 group-hover:opacity-100" onClick={() => { setEditAvatarFile(null); setEditAvatarPreview(null); }} title="Supprimer la photo">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 mt-2">
                    <Upload className="w-4 h-4" />
                    Changer la photo
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setEditAvatarFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setEditAvatarPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setEditAvatarPreview(editForm.avatar || null);
                      }
                    }} />
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-200" onClick={() => setShowEditForm(false)}>Annuler</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 shadow">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'assignation de classe */}
      {showAssignClassForm && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Assigner une classe</h3>
                <p className="text-gray-600">Définir la classe du professeur</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Assigner une classe au professeur <span className="font-bold">"{selectedTeacher.name}"</span>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe à assigner
                </label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une classe</option>
                  <option value="3ème A">3ème A</option>
                  <option value="3ème B">3ème B</option>
                  <option value="2nde A">2nde A</option>
                  <option value="2nde B">2nde B</option>
                  <option value="1ère S">1ère S</option>
                  <option value="1ère ES">1ère ES</option>
                  <option value="Terminale S">Terminale S</option>
                  <option value="Terminale ES">Terminale ES</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Cette classe sera visible dans la section "Mes élèves" du professeur
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignClassForm(false);
                  setSelectedTeacher(null);
                  setAssignedClass('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignClass}
                disabled={isAssigningClass || !assignedClass}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
              >
                {isAssigningClass ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 