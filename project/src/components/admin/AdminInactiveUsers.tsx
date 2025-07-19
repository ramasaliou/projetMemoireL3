import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck,
  UserX,
  MoreVertical,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  class?: string;
  subject?: string;
  avatar?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

const demoInactiveUsers: User[] = [
  {
    id: '1',
    name: 'Fatou Diop',
    email: 'fatou.diop@lycee.com',
    role: 'student',
    class: '3ème B',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    is_active: false,
    last_login: new Date('2024-01-20T14:30:00'),
    created_at: new Date('2023-09-01'),
    updated_at: new Date('2024-01-25T10:00:00')
  },
  {
    id: '2',
    name: 'Moussa Diallo',
    email: 'moussa.diallo@lycee.com',
    role: 'teacher',
    subject: 'Mathématiques',
    avatar: 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=150',
    is_active: false,
    last_login: new Date('2024-01-18T16:45:00'),
    created_at: new Date('2023-08-15'),
    updated_at: new Date('2024-01-24T15:30:00')
  }
];

export default function AdminInactiveUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  // Fonction pour charger les utilisateurs inactifs depuis l'API
  const loadInactiveUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('http://localhost:5000/api/users/inactive', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error('Erreur lors du chargement des utilisateurs inactifs');
      }

      const data = await response.json();
      
      // Convertir les données de l'API au format attendu par le frontend
      const apiUsers: User[] = data.data.users.map((user: any) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        subject: user.subject,
        avatar: user.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`,
        is_active: user.is_active,
        last_login: user.last_login ? new Date(user.last_login) : undefined,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at)
      }));

      setUsers(apiUsers);
    } catch (error) {
      const err = error as any;
      console.error('Erreur chargement utilisateurs inactifs:', err);
      // Fallback vers les données de démonstration en cas d'erreur
      setUsers(demoInactiveUsers);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les utilisateurs inactifs au montage du composant
  useEffect(() => {
    loadInactiveUsers();
  }, []);

  const handleReactivateUser = async () => {
    if (!confirmAction) return;

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
        body: JSON.stringify({ is_active: true })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error(data.message || 'Erreur lors de la réactivation de l\'utilisateur');
      }

      // Recharger la liste des utilisateurs inactifs
      await loadInactiveUsers();
      setShowReactivateConfirm(false);
      setConfirmAction(null);
      alert('Utilisateur réactivé avec succès !');
    } catch (error) {
      const err = error as any;
      console.error('Erreur réactivation utilisateur:', err);
      if (err.message === 'Session expirée, veuillez vous reconnecter') {
        alert('Session expirée, veuillez vous reconnecter');
        window.location.href = '/login';
      } else {
        alert(`Erreur lors de la réactivation de l'utilisateur: ${err.message}`);
      }
    }
  };

  const openReactivateConfirm = (userId: string, userName: string) => {
    setConfirmAction({ userId, userName });
    setShowReactivateConfirm(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'teacher': return 'Enseignant';
      case 'student': return 'Étudiant';
      default: return role;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.class && user.class.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.subject && user.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <UserX className="mr-2 text-red-500" size={24} />
                Utilisateurs Inactifs
              </h1>
              <p className="text-gray-600">
                Gérez les comptes utilisateurs désactivés
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredUsers.length} utilisateur(s) inactif(s)
            </span>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre par rôle */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="student">Étudiants</option>
              <option value="teacher">Enseignants</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>

          {/* Bouton de rafraîchissement */}
          <button
            onClick={loadInactiveUsers}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <RefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={16} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Liste des utilisateurs inactifs */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des utilisateurs inactifs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck className="mx-auto text-green-500" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun utilisateur inactif</h3>
            <p className="mt-2 text-gray-600">
              Tous les utilisateurs sont actuellement actifs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Désactivé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.avatar}
                          alt={user.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.class && (
                            <div className="text-xs text-gray-400">
                              Classe: {user.class}
                            </div>
                          )}
                          {user.subject && (
                            <div className="text-xs text-gray-400">
                              Matière: {user.subject}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? formatDate(user.last_login) : 'Jamais connecté'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openReactivateConfirm(user.id, user.name)}
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      >
                        Réactiver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation de réactivation */}
      {showReactivateConfirm && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <CheckCircle className="text-green-500 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">
                Réactiver l'utilisateur
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir réactiver le compte de <strong>{confirmAction.userName}</strong> ?
              <br />
              L'utilisateur pourra à nouveau se connecter à l'application.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReactivateConfirm(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReactivateUser}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Réactiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 