import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  Bell,
  Pin,
  Search,
  Filter
} from 'lucide-react';

interface News {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'urgent' | 'event' | 'reminder';
  author: string;
  createdAt: Date;
  pinned: boolean;
  targetAudience: 'all' | 'students' | 'teachers';
  views: number;
}

const demoNews: News[] = [
  {
    id: '1',
    title: 'Nouveau TP disponible : Système Immunitaire et VIH/SIDA',
    content: 'Un nouveau TP interactif sur le système immunitaire et l\'impact du VIH/SIDA est maintenant disponible. Ce TP comprend une simulation avancée et un quiz d\'évaluation.',
    type: 'info',
    author: 'Dr. Pierre Martin',
    createdAt: new Date('2024-01-25T10:00:00'),
    pinned: true,
    targetAudience: 'students',
    views: 45
  },
  {
    id: '2',
    title: 'Rappel : Échéance TP Groupes Sanguins',
    content: 'N\'oubliez pas que le TP sur les groupes sanguins et l\'agglutination doit être terminé avant le 20 février 2024.',
    type: 'reminder',
    author: 'Dr. Pierre Martin',
    createdAt: new Date('2024-01-24T14:30:00'),
    pinned: false,
    targetAudience: 'students',
    views: 32
  },
  {
    id: '3',
    title: 'Maintenance programmée de la plateforme',
    content: 'Une maintenance technique aura lieu ce dimanche de 2h à 4h du matin. La plateforme sera temporairement indisponible.',
    type: 'urgent',
    author: 'Administration',
    createdAt: new Date('2024-01-23T16:45:00'),
    pinned: false,
    targetAudience: 'all',
    views: 78
  }
];

export default function TeacherNews() {
  const [news, setNews] = useState<News[]>(demoNews);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [filter, setFilter] = useState<'all' | 'info' | 'urgent' | 'event' | 'reminder'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    targetAudience: 'students' as const,
    pinned: false
  });

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'event': return 'text-purple-600 bg-purple-100';
      case 'reminder': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return 'Information';
      case 'urgent': return 'Urgent';
      case 'event': return 'Événement';
      case 'reminder': return 'Rappel';
      default: return 'Autre';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return '📢';
      case 'urgent': return '🚨';
      case 'event': return '📅';
      case 'reminder': return '⏰';
      default: return '📝';
    }
  };

  const handleCreateNews = () => {
    const newsItem: News = {
      id: Date.now().toString(),
      ...newNews,
      author: 'Dr. Pierre Martin',
      createdAt: new Date(),
      views: 0
    };
    
    setNews(prev => [newsItem, ...prev]);
    setNewNews({
      title: '',
      content: '',
      type: 'info',
      targetAudience: 'students',
      pinned: false
    });
    setShowCreateForm(false);
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      setNews(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleEditNews = () => {
    if (editingNews && newNews.title && newNews.content) {
      setNews(prev => prev.map(item => 
        item.id === editingNews.id ? {
          ...item,
          title: newNews.title,
          content: newNews.content,
          type: newNews.type,
          targetAudience: newNews.targetAudience,
          pinned: newNews.pinned
        } : item
      ));
      
      setEditingNews(null);
      setNewNews({
        title: '',
        content: '',
        type: 'info',
        targetAudience: 'students',
        pinned: false
      });
    }
  };

  const startEditing = (newsItem: News) => {
    setEditingNews(newsItem);
    setNewNews({
      title: newsItem.title,
      content: newsItem.content,
      type: newsItem.type,
      targetAudience: newsItem.targetAudience,
      pinned: newsItem.pinned
    });
  };

  const cancelEditing = () => {
    setEditingNews(null);
    setNewNews({
      title: '',
      content: '',
      type: 'info',
      targetAudience: 'students',
      pinned: false
    });
  };

  const togglePin = (id: string) => {
    setNews(prev => prev.map(item => 
      item.id === id ? { ...item, pinned: !item.pinned } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📢 Actualités et Annonces</h2>
            <p className="text-orange-100">
              Communiquez avec vos élèves et partagez les informations importantes
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle actualité
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Actualités</p>
              <p className="text-2xl font-bold text-blue-600">{news.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Épinglées</p>
              <p className="text-2xl font-bold text-yellow-600">{news.filter(n => n.pinned).length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Pin className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vues Totales</p>
              <p className="text-2xl font-bold text-green-600">{news.reduce((sum, n) => sum + n.views, 0)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cette Semaine</p>
              <p className="text-2xl font-bold text-purple-600">3</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
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
              placeholder="Rechercher une actualité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'info' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📢 Info
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'urgent' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🚨 Urgent
            </button>
            <button
              onClick={() => setFilter('reminder')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'reminder' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ⏰ Rappel
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✏️ Créer une Nouvelle Actualité</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={newNews.title}
                onChange={(e) => setNewNews(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Titre de l'actualité..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu *
              </label>
              <textarea
                value={newNews.content}
                onChange={(e) => setNewNews(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Contenu de l'actualité..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newNews.type}
                  onChange={(e) => setNewNews(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="info">📢 Information</option>
                  <option value="urgent">🚨 Urgent</option>
                  <option value="event">📅 Événement</option>
                  <option value="reminder">⏰ Rappel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public cible
                </label>
                <select
                  value={newNews.targetAudience}
                  onChange={(e) => setNewNews(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="students">👨‍🎓 Élèves</option>
                  <option value="teachers">👨‍🏫 Professeurs</option>
                  <option value="all">👥 Tous</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNews.pinned}
                    onChange={(e) => setNewNews(prev => ({ ...prev, pinned: e.target.checked }))}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">📌 Épingler</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateNews}
                disabled={!newNews.title || !newNews.content}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Publier
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de modification */}
      {editingNews && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✏️ Modifier l'Actualité</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={newNews.title}
                onChange={(e) => setNewNews(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Titre de l'actualité..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu *
              </label>
              <textarea
                value={newNews.content}
                onChange={(e) => setNewNews(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Contenu de l'actualité..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newNews.type}
                  onChange={(e) => setNewNews(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="info">📢 Information</option>
                  <option value="urgent">🚨 Urgent</option>
                  <option value="event">📅 Événement</option>
                  <option value="reminder">⏰ Rappel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public cible
                </label>
                <select
                  value={newNews.targetAudience}
                  onChange={(e) => setNewNews(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="students">👨‍🎓 Élèves</option>
                  <option value="teachers">👨‍🏫 Professeurs</option>
                  <option value="all">👥 Tous</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNews.pinned}
                    onChange={(e) => setNewNews(prev => ({ ...prev, pinned: e.target.checked }))}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">📌 Épingler</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEditNews}
                disabled={!newNews.title || !newNews.content}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Enregistrer
              </button>
              <button
                onClick={cancelEditing}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des actualités */}
      <div className="space-y-4">
        {filteredNews.length > 0 ? (
          filteredNews
            .sort((a, b) => {
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;
              return b.createdAt.getTime() - a.createdAt.getTime();
            })
            .map((newsItem) => (
              <div key={newsItem.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                newsItem.pinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'
              }`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {newsItem.pinned && (
                          <Pin className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className="text-xl">{getTypeIcon(newsItem.type)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(newsItem.type)}`}>
                          {getTypeLabel(newsItem.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {newsItem.targetAudience === 'all' ? '👥 Tous' : 
                           newsItem.targetAudience === 'students' ? '👨‍🎓 Élèves' : '👨‍🏫 Professeurs'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {newsItem.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4">
                        {newsItem.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {newsItem.createdAt.toLocaleDateString('fr-FR')} à {newsItem.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {newsItem.views} vue{newsItem.views > 1 ? 's' : ''}
                        </span>
                        <span>Par {newsItem.author}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => togglePin(newsItem.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          newsItem.pinned 
                            ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title={newsItem.pinned ? 'Désépingler' : 'Épingler'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(newsItem)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(newsItem.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune actualité trouvée
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? "Essayez avec d'autres mots-clés"
                : "Commencez par créer votre première actualité"
              }
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Créer une actualité
            </button>
          </div>
        )}
      </div>
    </div>
  );
}