import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from './AuthContext';

interface TP {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  duration: number;
  status: 'active' | 'completed' | 'draft';
  createdBy: string;
  createdAt: Date;
  dueDate?: Date;
  simulations: string[];
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
  };
}

interface Simulation {
  id: string;
  title: string;
  description: string;
  type: 'respiration' | 'agglutination' | 'hiv-aids' | 'fermentation' | 'la degradation des elemets radioactifs';
  thumbnail: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  duration: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  avatar?: string;
  results: Array<{
    tpId: string;
    score: number;
    completedAt: Date;
  }>;
}

interface ClassInfo {
  id: number;
  name: string;
  level: string;
  subject: string;
  currentStudents: number;
  maxStudents: number;
  averageScore: number;
  completionRate: number;
  academicYear: string;
  room?: string;
  schedule?: any;
  description?: string;
}

interface DataContextType {
  tps: TP[];
  simulations: Simulation[];
  students: Student[];
  teacherClass?: string;
  classInfo?: ClassInfo;
  loading: boolean;
  createTP: (tp: Omit<TP, 'id' | 'createdAt'> | FormData) => void;
  updateTP: (id: string, updates: Partial<TP>) => void;
  deleteTP: (id: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'results'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  refreshData: () => void;
  refreshStudents: () => void;
  refreshTPs: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Données de démonstration étendues pour le Sénégal
const demoSimulations: Simulation[] = [
  {
    id: '1',
    title: 'Respiration Cellulaire et Échanges Gazeux',
    description: 'Simulation interactive de la respiration cellulaire et des échanges gazeux au niveau pulmonaire et cellulaire',
    type: 'respiration',
    thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
    difficulty: 'moyen',
    duration: 45
  },
  {
    id: '2',
    title: 'Groupes Sanguins et Réaction d\'Agglutination',
    description: 'Expérience virtuelle sur les groupes sanguins ABO, Rhésus et les réactions d\'agglutination',
    type: 'agglutination',
    thumbnail: 'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=300',
    difficulty: 'facile',
    duration: 30
  },
  {
    id: '3',
    title: 'VIH/SIDA et Dysfonctionnement du Système Immunitaire',
    description: 'Simulation du dysfonctionnement du système immunitaire causé par le VIH et progression vers le SIDA',
    type: 'hiv-aids',
    thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
    difficulty: 'difficile',
    duration: 60
  },
  {
    id: '4',
    title: 'fermentation alcoolique',
    description: 'Étude du processus de digestion et d\'absorption des nutriments dans le tube digestif',
    type: 'fermentation',
    thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
    difficulty: 'moyen',
    duration: 40
  },
  {
    id: '5',
    title: 'Circulation Sanguine et Fonction Cardiaque',
    description: 'Simulation de la circulation sanguine et du fonctionnement du cœur',
    type: 'la degradation des elemets radioactifs',
    thumbnail: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=300',
    difficulty: 'moyen',
    duration: 50
  }
];

const demoTPs: TP[] = [
  {
    id: '1',
    title: 'Respiration Cellulaire et Échanges Gazeux',
    description: 'Étude des mécanismes de la respiration cellulaire et des échanges gazeux au niveau pulmonaire et cellulaire',
    subject: 'SVT',
    level: '3ème',
    duration: 90,
    status: 'active',
    createdBy: '2',
    createdAt: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    simulations: ['1'],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'Quel gaz est consommé lors de la respiration cellulaire ?',
          options: ['Dioxyde de carbone', 'Oxygène', 'Azote', 'Hydrogène'],
          correctAnswer: 1
        },
        {
          id: '2',
          question: 'Où se déroule principalement la respiration cellulaire ?',
          options: ['Noyau', 'Mitochondries', 'Cytoplasme', 'Ribosomes'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: '2',
    title: 'Groupes Sanguins et Compatibilité Transfusionnelle',
    description: 'Découverte des groupes sanguins ABO et Rhésus, et étude des réactions d\'agglutination',
    subject: 'SVT',
    level: '3ème',
    duration: 60,
    status: 'active',
    createdBy: '2',
    createdAt: new Date('2024-01-20'),
    dueDate: new Date('2024-02-20'),
    simulations: ['2'],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'Quel groupe sanguin est considéré comme donneur universel ?',
          options: ['A', 'B', 'AB', 'O'],
          correctAnswer: 3
        }
      ]
    }
  },
  {
    id: '3',
    title: 'VIH/SIDA et Système Immunitaire',
    description: 'Étude de l\'impact du VIH sur le système immunitaire et progression vers le SIDA',
    subject: 'SVT',
    level: '3ème',
    duration: 75,
    status: 'active',
    createdBy: '2',
    createdAt: new Date('2024-01-22'),
    dueDate: new Date('2024-02-25'),
    simulations: ['3']
  },
  {
    id: '4',
    title: 'fermentation alcoolique',
    description: 'La fermentation alcoolique est un processus métabolique qui transforme les sucres en alcool et en dioxyde de carbone',
    subject: 'SVT',
    level: '3ème',
    duration: 65,
    status: 'draft',
    createdBy: '2',
    createdAt: new Date('2024-01-25'),
    simulations: ['4']
  }
];

const demoStudents: Student[] = [
  {
    id: '1',
    name: 'lewis diatta',
    email: 'lewis.diatta@lycee.com',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    results: [
      { tpId: '1', score: 85, completedAt: new Date('2024-01-25') },
      { tpId: '2', score: 92, completedAt: new Date('2024-01-28') }
    ]
  },
  {
    id: '2',
    name: 'cheikh Diop',
    email: 'cheikh.diop@lycee.com',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    results: [
      { tpId: '1', score: 92, completedAt: new Date('2024-01-24') },
      { tpId: '2', score: 88, completedAt: new Date('2024-01-27') }
    ]
  },
  {
    id: '3',
    name: 'Fatou Diop',
    email: 'fatou.diop@lycee.com',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    results: [
      { tpId: '1', score: 78, completedAt: new Date('2024-01-26') }
    ]
  },
  {
    id: '4',
    name: 'Amadou Ba',
    email: 'amadou.ba@lycee.com',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    results: [
      { tpId: '1', score: 89, completedAt: new Date('2024-01-23') },
      { tpId: '2', score: 85, completedAt: new Date('2024-01-29') }
    ]
  },
  {
    id: '5',
    name: 'Aïssatou Sow',
    email: 'aissatou.sow@lycee.com',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    results: [
      { tpId: '1', score: 94, completedAt: new Date('2024-01-22') }
    ]
  },
  {
    id: '6',
    name: 'Moussa Ndiaye',
    email: 'moussa.ndiaye@lycee.com',
    class: '3ème A',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    results: [
      { tpId: '1', score: 76, completedAt: new Date('2024-01-27') }
    ]
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tps, setTPs] = useState<TP[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherClass, setTeacherClass] = useState<string>('');
  const [classInfo, setClassInfo] = useState<ClassInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Hooks API
  const { execute: fetchTPs } = useApi<{ tps: TP[] }>();
  const { execute: fetchSimulations } = useApi<{ simulations: Simulation[] }>();
  const { execute: fetchStudents } = useApi<{ students: Student[] }>();
  const { execute: createTPApi } = useApi<TP>();
  const { execute: updateTPApi } = useApi<TP>();
  const { execute: deleteTPApi } = useApi<void>();
  const { execute: createStudentApi } = useApi<Student>();
  const { execute: updateStudentApi } = useApi<Student>();
  const { execute: deleteStudentApi } = useApi<void>();

  // Charger les données au démarrage
  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Charger les TP
      const tpsData = await fetchTPs('/tps');
      if (tpsData) {
        setTPs(tpsData.tps || []);
      }

      // Charger les simulations
      const simulationsData = await fetchSimulations('/simulations');
      if (simulationsData) {
        setSimulations(simulationsData.simulations || []);
      }

      // Charger les étudiants avec leurs résultats (route spécifique pour les enseignants)
      if (user && user.role === 'teacher') {
        const studentsData = await fetchStudents('/teacher/students');
        if (studentsData && studentsData.students) {
          const transformedStudents = studentsData.students.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            class: student.class || '3ème A',
            avatar: student.avatar,
            results: student.results ? student.results.map((result: any) => ({
              tpId: result.tp?.id || result.tp_id,
              score: result.overall_score || result.score || 0,
              completedAt: new Date(result.completed_at || result.created_at)
            })) : []
          }));
          setStudents(transformedStudents);
          if (studentsData.teacherClass) {
            setTeacherClass(studentsData.teacherClass);
          } else if (studentsData.students && studentsData.students.length > 0) {
            const firstStudentClass = studentsData.students[0].class;
            if (firstStudentClass) {
              setTeacherClass(firstStudentClass);
            }
          }
        }
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, on garde les listes vides au lieu d'utiliser les données de démo
      console.log('Utilisation des vraies données de la base de données');
    } finally {
      setLoading(false);
    }
  };

  const createTP = async (tp: Omit<TP, 'id' | 'createdAt'> | FormData) => {
    try {
      let newTP;
      
      if (tp instanceof FormData) {
        // Si c'est un FormData (avec fichier PDF), envoyer directement
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tps`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
          },
          body: tp
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          newTP = data.data.tp;
        } else {
          throw new Error(data.message || 'Erreur lors de la création du TP');
        }
      } else {
        // Si c'est un objet JSON (sans fichier), utiliser l'API existante
        newTP = await createTPApi('/tps', {
          method: 'POST',
          body: JSON.stringify(tp)
        });
      }
      
      if (newTP) {
        setTPs(prev => [...prev, newTP]);
      }
    } catch (error) {
      console.error('Erreur lors de la création du TP:', error);
      throw error;
    }
  };

  const updateTP = async (id: string, updates: Partial<TP>) => {
    try {
      const updatedTP = await updateTPApi(`/tps/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (updatedTP) {
        setTPs(prev => prev.map(tp => tp.id === id ? updatedTP : tp));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du TP:', error);
      throw error;
    }
  };

  const deleteTP = async (id: string) => {
    try {
      await deleteTPApi(`/tps/${id}`, { method: 'DELETE' });
    setTPs(prev => prev.filter(tp => tp.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du TP:', error);
      throw error;
    }
  };

  const addStudent = async (student: Omit<Student, 'id' | 'results'>) => {
    try {
      const newStudent = await createStudentApi('/students', {
        method: 'POST',
        body: JSON.stringify(student)
      });
      if (newStudent) {
    setStudents(prev => [...prev, newStudent]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updatedStudent = await updateStudentApi(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (updatedStudent) {
        setStudents(prev => prev.map(student => student.id === id ? updatedStudent : student));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteStudentApi(`/students/${id}`, { method: 'DELETE' });
    setStudents(prev => prev.filter(student => student.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
      throw error;
    }
  };

  const refreshStudents = async () => {
    try {
      const studentsData = await fetchStudents('/teacher/students');
      if (studentsData) {
        if (studentsData.students) {
          const transformedStudents = studentsData.students.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            class: student.class || '3ème A',
            avatar: student.avatar,
            results: student.results ? student.results.map((result: any) => ({
              tpId: result.tp?.id || result.tp_id,
              score: result.overall_score || result.score || 0,
              completedAt: new Date(result.completed_at || result.created_at)
            })) : []
          }));
          setStudents(transformedStudents);
          
          if (studentsData.teacherClass) {
            setTeacherClass(studentsData.teacherClass);
          } else if (studentsData.students && studentsData.students.length > 0) {
            const firstStudentClass = studentsData.students[0].class;
            if (firstStudentClass) {
              setTeacherClass(firstStudentClass);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des étudiants:', error);
    }
  };

  const refreshTPs = async () => {
    try {
      const tpsData = await fetchTPs('/tps');
      if (tpsData) {
        setTPs(tpsData.tps || []);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des TP:', error);
    }
  };

  return (
    <DataContext.Provider value={{
      tps,
      simulations,
      students,
      teacherClass,
      loading,
      createTP,
      updateTP,
      deleteTP,
      addStudent,
      updateStudent,
      deleteStudent,
      refreshData: loadAllData,
      refreshStudents,
      refreshTPs
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}