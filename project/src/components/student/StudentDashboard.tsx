import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../shared/Layout';
import StudentHome from './StudentHome';
import StudentTPs from './StudentTPs';
import StudentQuizzes from './StudentQuizzes';
import StudentLab from './StudentLab';
import StudentLibrary from './StudentLibrary';
import StudentResults from './StudentResults';
import StudentMessages from './StudentMessages';
import StudentQuizList from './StudentQuizList';
import { 
  Home, 
  FlaskConical, 
  ClipboardCheck, 
  Microscope, 
  BookOpen, 
  BarChart3, 
  MessageSquare 
} from 'lucide-react';

export default function StudentDashboard() {
  const [currentView, setCurrentView] = useState('home');

  const navigation = [
    {
      name: 'Accueil',
      icon: <Home className="w-5 h-5" />,
      current: currentView === 'home',
      onClick: () => setCurrentView('home')
    },
    {
      name: 'Mes Quiz',
      icon: <ClipboardCheck className="w-5 h-5" />,
      current: currentView === 'quizlist',
      onClick: () => setCurrentView('quizlist')
    },
    {
      name: 'Laboratoire',
      icon: <Microscope className="w-5 h-5" />,
      current: currentView === 'lab',
      onClick: () => setCurrentView('lab')
    },
    {
      name: 'Bibliothèque',
      icon: <BookOpen className="w-5 h-5" />,
      current: currentView === 'library',
      onClick: () => setCurrentView('library')
    },
    {
      name: 'Mes Résultats',
      icon: <BarChart3 className="w-5 h-5" />,
      current: currentView === 'results',
      onClick: () => setCurrentView('results')
    },
    {
      name: 'Messages',
      icon: <MessageSquare className="w-5 h-5" />,
      current: currentView === 'messages',
      onClick: () => setCurrentView('messages')
    }
  ];

  const getTitle = () => {
    switch (currentView) {
      case 'home': return '🏠 Espace Élève';
      case 'tps': return '🧪 Mes TP';
      case 'quizlist': return '📝 Mes Quiz';
      case 'lab': return '🔬 Laboratoire Virtuel';
      case 'library': return '📚 Bibliothèque de Cours';
      case 'results': return '📊 Mes Résultats';
      case 'messages': return '💬 Messages';
      default: return 'Espace Élève';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home': return <StudentHome />;
      case 'tps': return <StudentTPs />;
      case 'quizlist': return <StudentQuizList />;
      case 'lab': return <StudentLab />;
      case 'library': return <StudentLibrary />;
      case 'results': return <StudentResults />;
      case 'messages': return <StudentMessages />;
      default: return <StudentHome />;
    }
  };

  return (
    <Layout navigation={navigation} title={getTitle()}>
      {renderContent()}
    </Layout>
  );
}