import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const NutritionistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // El nutritionist usa su endpoint específico con permiso analytics.view
      const response = await api.get('/admin/dashboard/nutritionist');
      setStats(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Nutricionista</h1>
        <p className="text-gray-600 mt-1">Gestiona las valoraciones y recomendaciones de tus clientes</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Usuarios</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.users?.total || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Valoraciones</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.assessments?.total || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Valoraciones Este Mes</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.assessments?.this_month || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/nutritionist/users"
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ver Clientes</h3>
              <p className="text-gray-600 text-sm">Gestiona y visualiza información de tus clientes</p>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-600" />
          </div>
        </Link>

        <Link
          to="/nutritionist/assessments"
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ver Valoraciones</h3>
              <p className="text-gray-600 text-sm">Revisa y gestiona todas las valoraciones</p>
            </div>
            <ArrowRight className="w-6 h-6 text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Recent Assessments */}
      {stats?.recent_assessments && stats.recent_assessments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Valoraciones Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IMC</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">GET</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_assessments.slice(0, 5).map((assessment) => (
                  <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{assessment.user?.name}</p>
                        <p className="text-sm text-gray-500">{assessment.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-indigo-600">{assessment.bmi}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{assessment.get} kcal</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(assessment.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionistDashboard;


