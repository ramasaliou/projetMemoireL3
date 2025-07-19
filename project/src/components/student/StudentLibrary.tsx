import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  FileText, 
  Video, 
  Headphones, 
  Image, 
  Search, 
  Filter, 
  Download, 
  Star,
  Clock,
  BookOpen
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'audio' | 'image';
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  rating: number;
  downloads: number;
  thumbnail: string;
  duration?: number;
  url?: string;
  creator?: {
    id: string;
    name: string;
  };
}

export default function StudentLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'video' | 'audio' | 'image'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { execute: fetchResources } = useApi<{ resources: Resource[] }>();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await fetchResources('/resources');
      if (data) {
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error);
      // Fallback vers des données de démonstration en cas d'erreur
      setResources([
  {
    id: '1',
    title: 'La Respiration Cellulaire - Cours Complet',
    description: 'Comprendre les mécanismes de la respiration cellulaire et les échanges gazeux',
    type: 'pdf',
    category: 'Respiration',
    difficulty: 'moyen',
    rating: 4.8,
    downloads: 245,
    thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
    creator: {
      id: '1',
      name: 'Professeur Dupont'
    }
  },
  {
    id: '2',
    title: 'Les Groupes Sanguins ABO - Vidéo Explicative',
    description: 'Animation détaillée sur les groupes sanguins et les réactions d\'agglutination',
    type: 'video',
    category: 'Groupes Sanguins',
    difficulty: 'facile',
    duration: 15,
    rating: 4.9,
    downloads: 189,
    thumbnail: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=300',
    creator: {
      id: '2',
      name: 'Professeur Martin'
    }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter === 'all' || resource.type === filter;
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = ['all', 'Respiration', 'Groupes Sanguins', 'Immunologie', 'fermentation', 'la degradation des elemets radioactifs'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Headphones className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-600 bg-red-100';
      case 'video': return 'text-blue-600 bg-blue-100';
      case 'audio': return 'text-green-600 bg-green-100';
      case 'image': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'text-green-600 bg-green-100';
      case 'moyen': return 'text-yellow-600 bg-yellow-100';
      case 'difficile': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes cours</h1>
          <p className="text-gray-600 dark:text-gray-400">Retrouvez ici tous les cours créés par votre professeur principal.</p>
          </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {resources.length} cours disponibles
          </span>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            Aucun cours trouvé pour le moment.
          </div>
        ) : (
          resources.map(resource => (
            <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {getTypeIcon(resource.type)}
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(resource.type)}`}>{resource.type.toUpperCase()}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(resource.difficulty)}`}>{resource.difficulty}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{resource.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{resource.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Catégorie : {resource.category}</span>
                {resource.duration && <span>• Durée : {resource.duration} min</span>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {resource.creator && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">Professeur : {resource.creator.name}</span>
                )}
                {resource.url && (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-blue-500 hover:underline flex items-center gap-1">
                    <Download className="w-4 h-4" /> Télécharger
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}