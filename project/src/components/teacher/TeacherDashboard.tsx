import React, { useState } from 'react';
import Layout from '../shared/Layout';
import TeacherHome from './TeacherHome';
import TeacherCourses from './TeacherCourses';
import TeacherQuizzes from './TeacherQuizzes';
import TeacherCreateQuiz from './TeacherCreateQuiz';
import TeacherSimulations from './TeacherSimulations';
import TeacherStudents from './TeacherStudents';
import TeacherNews from './TeacherNews';
import TeacherMessages from './TeacherMessages';
import { 
  Home, 
  BookOpen, 
  ClipboardCheck, 
  Plus, 
  Microscope, 
  Users, 
  Megaphone, 
  MessageSquare 
} from 'lucide-react';

export default function TeacherDashboard() {
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
      current: currentView === 'quizzes',
      onClick: () => setCurrentView('quizzes')
    },
    {
      name: 'Mes Cours',
      icon: <BookOpen className="w-5 h-5" />,
      current: currentView === 'courses',
      onClick: () => setCurrentView('courses')
    },
    {
      name: 'Simulations',
      icon: <Microscope className="w-5 h-5" />,
      current: currentView === 'simulations',
      onClick: () => setCurrentView('simulations')
    },
    {
      name: 'Mes Élèves',
      icon: <Users className="w-5 h-5" />,
      current: currentView === 'students',
      onClick: () => setCurrentView('students')
    },
    {
      name: 'Actualités',
      icon: <Megaphone className="w-5 h-5" />,
      current: currentView === 'news',
      onClick: () => setCurrentView('news')
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
      case 'home': return '🎛 Espace Professeur';
      case 'quizzes': return '📝 Mes Quiz';
      case 'courses': return '📚 Mes Cours';
      case 'simulations': return '🔬 Banque de Simulations';
      case 'students': return '👥 Gestion des Élèves';
      case 'news': return '📢 Actualités';
      case 'messages': return '💬 Messages';
      default: return 'Espace Professeur';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home': return <TeacherHome />;
      case 'quizzes': return <TeacherQuizzes />;
      case 'courses': return <TeacherCourses />;
      case 'simulations': return <TeacherSimulations />;
      case 'students': return <TeacherStudents />;
      case 'news': return <TeacherNews />;
      case 'messages': return <TeacherMessages />;
      default: return <TeacherHome />;
    }
  };

  return (
    <Layout navigation={navigation} title={getTitle()}>
      {renderContent()}
    </Layout>
  );
}