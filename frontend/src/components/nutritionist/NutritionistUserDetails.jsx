import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AssessmentNotes from './AssessmentNotes';
import api from '../../services/api';

const NutritionistUserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      const userData = {
        ...response.data.user,
        roles: response.data.roles || response.data.user.roles || [],
        permissions: response.data.permissions || response.data.user.permissions || [],
        stats: response.data.stats || {},
      };
      setUser(userData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Cargando usuario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Link
          to="/nutritionist/users"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver a clientes
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Usuario no encontrado</p>
        <Link
          to="/nutritionist/users"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/nutritionist/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a clientes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detalles del Cliente</h1>
          <p className="text-gray-600 mt-1">Información del usuario</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-4">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Valoraciones</h3>
          <p className="text-3xl font-bold text-blue-600">{user.stats?.total_assessments || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Fecha de Registro</h3>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(user.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Última Actividad</h3>
          <p className="text-lg font-semibold text-gray-900">
            {user.stats?.latest_assessment
              ? new Date(user.stats.latest_assessment.created_at).toLocaleDateString('es-ES')
              : 'Sin valoraciones'}
          </p>
        </div>
      </div>

      {/* Latest Assessment */}
      {user.stats?.latest_assessment && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Última Valoración</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">IMC</p>
              <p className="text-lg font-bold text-indigo-600">
                {Number(user.stats.latest_assessment.bmi).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">GEB</p>
              <p className="text-lg font-bold text-purple-600">
                {user.stats.latest_assessment.geb} kcal
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">GET</p>
              <p className="text-lg font-bold text-orange-600">
                {user.stats.latest_assessment.get} kcal
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Peso</p>
              <p className="text-lg font-bold text-gray-900">
                {user.stats.latest_assessment.weight} kg
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Assessments with Notes */}
      {user.assessments && user.assessments.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Valoraciones y Anotaciones</h3>
          {user.assessments.map((assessment) => (
            <div key={assessment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Valoración del {new Date(assessment.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">IMC</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {Number(assessment.bmi).toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">GEB</p>
                    <p className="text-lg font-bold text-purple-600">
                      {assessment.geb} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">GET</p>
                    <p className="text-lg font-bold text-orange-600">
                      {assessment.get} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Peso</p>
                    <p className="text-lg font-bold text-gray-900">
                      {assessment.weight} kg
                    </p>
                  </div>
                </div>
              </div>
              <AssessmentNotes assessmentId={assessment.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutritionistUserDetails;


