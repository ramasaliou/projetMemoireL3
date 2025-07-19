import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../shared/Layout';
import AdminHome from './AdminHome';
import AdminUsers from './AdminUsers';
import AdminClasses from './AdminClasses';
import { 
  Home, 
  Users, 
  GraduationCap
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    {
      name: 'Tableau de Bord',
      icon: <Home className="w-5 h-5" />,
      current: location.pathname === '/admin' || location.pathname === '/admin/',
      onClick: () => navigate('/admin')
    },
    {
      name: 'Utilisateurs',
      icon: <Users className="w-5 h-5" />,
      current: location.pathname === '/admin/users',
      onClick: () => navigate('/admin/users')
    },
    {
      name: 'Classes',
      icon: <GraduationCap className="w-5 h-5" />,
      current: location.pathname === '/admin/classes',
      onClick: () => navigate('/admin/classes')
    }
  ];

  const getTitle = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return '🎛 Surveillant Général';
    } else if (location.pathname === '/admin/users') {
      return '👥 Gestion des Utilisateurs';
    } else if (location.pathname === '/admin/classes') {
      return '🏫 Gestion des Classes';
    }
    return 'Surveillant Général';
  };

  return (
    <Layout navigation={navigation} title={getTitle()}>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/classes" element={<AdminClasses />} />
      </Routes>
    </Layout>
  );
}