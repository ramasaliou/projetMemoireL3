import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { FullScreenLoader } from './components/shared/LoadingSpinner';

function AppRoutes() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Afficher le loader pendant la vérification de l'authentification
  if (isLoading) {
    return <FullScreenLoader text="Vérification de l'authentification..." />;
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={
        user?.role === 'student' ? <Navigate to="/student" /> :
        user?.role === 'teacher' ? <Navigate to="/teacher" /> :
        user?.role === 'admin' ? <Navigate to="/admin" /> :
        <Navigate to="/login" />
      } />
      <Route path="/student/*" element={
        user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" />
      } />
      <Route path="/teacher/*" element={
        user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />
      } />
      <Route path="/admin/*" element={
        user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <AppRoutes />
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;