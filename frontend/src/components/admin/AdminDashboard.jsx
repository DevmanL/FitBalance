import { useState, useEffect } from 'react';
import { Users, CheckCircle, ClipboardList, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
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

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.users?.total || 0,
      change: `+${stats?.users?.new_this_month || 0} este mes`,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Usuarios Activos',
      value: stats?.users?.active || 0,
      change: 'Últimos 30 días',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Total Valoraciones',
      value: stats?.assessments?.total || 0,
      change: `+${stats?.assessments?.this_month || 0} este mes`,
      icon: ClipboardList,
      color: 'bg-purple-500',
    },
    {
      title: 'Valoraciones Hoy',
      value: stats?.assessments?.today || 0,
      change: `+${stats?.assessments?.this_week || 0} esta semana`,
      icon: BarChart3,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-xs text-gray-500">{card.change}</p>
          </div>
        ))}
      </div>

      {/* BMI Distribution */}
      {stats?.bmi_distribution && stats.bmi_distribution.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribución de IMC</h2>
          <div className="space-y-3">
            {stats.bmi_distribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{item.category}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-500 h-3 rounded-full"
                      style={{
                        width: `${(item.count / stats.assessments.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-900 font-bold w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Averages */}
      {stats?.averages && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-gray-600 text-sm font-medium mb-2">IMC Promedio</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.averages.bmi}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-gray-600 text-sm font-medium mb-2">GEB Promedio</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.averages.geb} kcal</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-gray-600 text-sm font-medium mb-2">GET Promedio</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.averages.get} kcal</p>
          </div>
        </div>
      )}

      {/* Estadísticas por nutricionista (solo super admin) */}
      {stats?.nutritionist_stats && stats.nutritionist_stats.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Estadísticas por Nutricionista</h2>
          <p className="text-sm text-gray-600 mb-6">Clientes, anotaciones y recomendaciones por profesional. Ordenado por mayor relación con sus clientes.</p>

          {/* Gráfica de barras: Clientes, Anotaciones, Recomendaciones por nutricionista */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Clientes, anotaciones y recomendaciones</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.nutritionist_stats.map((n) => ({
                    name: n.name?.split(' ')[0] || n.email?.split('@')[0] || `N${n.id}`,
                    fullName: n.name,
                    Clientes: n.clients_count,
                    Anotaciones: n.notes_count,
                    Recomendaciones: n.recommendations_count,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <p className="font-semibold text-gray-900">{d?.fullName}</p>
                          <p className="text-gray-600">Clientes: {d?.Clientes}</p>
                          <p className="text-gray-600">Anotaciones: {d?.Anotaciones}</p>
                          <p className="text-gray-600">Recomendaciones: {d?.Recomendaciones}</p>
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Clientes" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Clientes" />
                  <Bar dataKey="Anotaciones" fill="#2563eb" radius={[4, 4, 0, 0]} name="Anotaciones" />
                  <Bar dataKey="Recomendaciones" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Recomendaciones" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica circular: Distribución de clientes por nutricionista */}
          {stats.nutritionist_stats.some((n) => n.clients_count > 0) && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución de clientes</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.nutritionist_stats
                        .filter((n) => n.clients_count > 0)
                        .map((n) => ({
                          name: n.name?.split(' ')[0] || n.email?.split('@')[0] || `N${n.id}`,
                          value: n.clients_count,
                          fullName: n.name,
                        }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {stats.nutritionist_stats
                        .filter((n) => n.clients_count > 0)
                        .map((_, index) => {
                          const colors = ['#4f46e5', '#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];
                          return <Cell key={index} fill={colors[index % colors.length]} />;
                        })}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} clientes`, 'Clientes']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gráfica de barras horizontales: Engagement */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Engagement (anotaciones + recomendaciones)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[...stats.nutritionist_stats]
                    .sort((a, b) => b.engagement_score - a.engagement_score)
                    .slice(0, 10)
                    .map((n) => ({
                      name: n.name?.split(' ')[0] || n.email?.split('@')[0] || `N${n.id}`,
                      fullName: n.name,
                      engagement: n.engagement_score,
                    }))}
                  margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <p className="font-semibold text-gray-900">{d?.fullName}</p>
                          <p className="text-indigo-600">Engagement: {d?.engagement}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="engagement" fill="#059669" radius={[0, 4, 4, 0]} name="Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tabla resumen</h3>
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nutricionista</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Clientes</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Anotaciones</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Recomendaciones</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {stats.nutritionist_stats.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{row.name}</p>
                        <p className="text-sm text-gray-500">{row.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-indigo-600">{row.clients_count}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-600">{row.notes_count}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-purple-600">{row.recommendations_count}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {row.engagement_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* Recent Assessments */}
      {stats?.recent_assessments && stats.recent_assessments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
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
                {stats.recent_assessments.map((assessment) => (
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
                    <td className="py-3 px-4">
                      <span className="font-semibold text-purple-600">{assessment.get} kcal</span>
                    </td>
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

export default AdminDashboard;


