import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [lastAssessment, setLastAssessment] = useState(null);

  useEffect(() => {
    const fetchProfileAndLastAssessment = async () => {
      try {
        setProfileLoading(true);
        const [profileRes, assessmentsRes] = await Promise.all([api.get('/user/profile'), api.get('/assessments')]);
        setProfile(profileRes.data || null);
        const assessments = assessmentsRes.data || [];
        setLastAssessment(assessments.length > 0 ? assessments[0] : null);
        setProfileError('');
      } catch (err) {
        console.error(err);
        setProfileError(err.response?.data?.message || 'No se pudo cargar tu perfil');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileAndLastAssessment();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      onLogout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navbar mejorado */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/80 ring-1 ring-indigo-100 shadow-sm">
                <img
                  src="/FB.png"
                  alt="FitBalance"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FitBalance
              </h1>
            </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  Perfil
                </Link>
                <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm">
                    {profile?.photo ? (
                      <img
                        src={profile.photo}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>
              {(user.roles?.includes('super_admin') || user.roles?.includes('admin')) && (
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Panel Admin
                </Link>
              )}
              {user.roles?.includes('nutritionist') && (
                <Link
                  to="/nutritionist/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Panel Nutricionista
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Bienvenido a <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FitBalance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Realiza valoraciones morfofuncionales completas y obtén recomendaciones personalizadas para tu bienestar
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link
              to="/assessment"
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Nueva Valoración
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Calcula tu IMC, GEB, GET y balance calórico con una valoración morfofuncional completa
                </p>
                <div className="mt-6 flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  Comenzar ahora
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              to="/history"
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Historial
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Revisa tus valoraciones anteriores, evolución y recomendaciones personalizadas
                </p>
                <div className="mt-6 flex items-center text-emerald-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  Ver historial
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Info Cards */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
              ¿Qué es FitBalance?
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              FitBalance es una aplicación web que te permite realizar valoraciones morfofuncionales completas
              para evaluar tu estado físico y nutricional de manera precisa y profesional.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <span className="text-white font-bold text-xl">IMC</span>
                </div>
                <h4 className="font-bold text-blue-900 mb-2 text-lg">Índice de Masa Corporal</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Evalúa tu peso en relación con tu estatura para determinar tu estado nutricional
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <span className="text-white font-bold text-xl">GEB</span>
                </div>
                <h4 className="font-bold text-purple-900 mb-2 text-lg">Gasto Energético Basal</h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Calcula las calorías que tu cuerpo consume en reposo para mantener funciones vitales
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <span className="text-white font-bold text-xl">GET</span>
                </div>
                <h4 className="font-bold text-orange-900 mb-2 text-lg">Gasto Energético Total</h4>
                <p className="text-sm text-orange-700 leading-relaxed">
                  Determina las calorías totales considerando tu nivel de actividad física diaria
                </p>
              </div>
            </div>
          </div>

          {/* Perfil (resumen) */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Perfil</h3>
              <p className="text-sm text-gray-600 mb-4">
                Completa tus datos (preferencias, alergias, objetivos) en un único lugar.
              </p>

              {profileError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {profileError}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/profile"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Ir a mi perfil
                </Link>
                <span className="text-sm text-gray-600">
                  {profileLoading ? 'Cargando...' : 'Edita tus datos y objetivos'}
                </span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Progreso actual</h3>
              {lastAssessment && profile?.target_weight ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Último peso:{' '}
                    <span className="font-semibold text-gray-900">{lastAssessment.weight} kg</span>
                    {' · '}Objetivo:{' '}
                    <span className="font-semibold text-gray-900">{profile.target_weight} kg</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Diferencia:{' '}
                    <span className="font-semibold">
                      {(Number(lastAssessment.weight) - Number(profile.target_weight)).toFixed(1)} kg
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  Define un peso objetivo en tu perfil y realiza al menos una valoración.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
