import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import AssessmentForm from './components/AssessmentForm';
import AssessmentHistory from './components/AssessmentHistory';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminUserDetails from './components/admin/AdminUserDetails';
import AdminAssessments from './components/admin/AdminAssessments';
import NutritionistLayout from './components/nutritionist/NutritionistLayout';
import NutritionistDashboard from './components/nutritionist/NutritionistDashboard';
import NutritionistUsers from './components/nutritionist/NutritionistUsers';
import NutritionistUserDetails from './components/nutritionist/NutritionistUserDetails';
import NutritionistAssessments from './components/nutritionist/NutritionistAssessments';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />}
      />
      <Route
        path="/dashboard"
        element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/profile"
        element={user ? <Profile user={user} /> : <Navigate to="/login" />}
      />
      <Route
        path="/assessment"
        element={
          user ? (
            <AssessmentForm user={user} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/history"
        element={
          user ? (
            <AssessmentHistory user={user} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          user && (user.roles?.includes('super_admin') || user.roles?.includes('admin')) ? (
            <AdminLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetails />} />
        <Route path="assessments" element={<AdminAssessments />} />
      </Route>

      {/* Nutritionist Routes */}
      <Route
        path="/nutritionist"
        element={
          user && user.roles?.includes('nutritionist') ? (
            <NutritionistLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      >
        <Route path="dashboard" element={<NutritionistDashboard />} />
        <Route path="users" element={<NutritionistUsers />} />
        <Route path="users/:id" element={<NutritionistUserDetails />} />
        <Route path="assessments" element={<NutritionistAssessments />} />
      </Route>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default App;
