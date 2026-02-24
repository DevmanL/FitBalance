import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import RoleManager from './RoleManager';

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoleManager, setShowRoleManager] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser?.roles?.includes('super_admin');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  useEffect(() => {
    if (isSuperAdmin) {
      api.get('/admin/users', { params: { role: 'nutritionist', per_page: 200 } })
        .then((res) => setNutritionists(res.data.data || []))
        .catch(() => setNutritionists([]));
    }
  }, [isSuperAdmin]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      // El backend devuelve: { user, roles, permissions, stats }
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
          to="/admin/users"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volver a usuarios
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Usuario no encontrado</p>
        <Link
          to="/admin/users"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Volver a usuarios
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
            to="/admin/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a usuarios
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detalles del Usuario</h1>
          <p className="text-gray-600 mt-1">Información completa del usuario</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Roles:</span>
              {(Array.isArray(user.roles) ? user.roles : []).length > 0 ? (
                (Array.isArray(user.roles) ? user.roles : []).map((role, index) => {
                  const roleName = typeof role === 'string' ? role : role?.name || role;
                  const getRoleColor = (name) => {
                    const colors = {
                      super_admin: 'bg-red-100 text-red-800',
                      admin: 'bg-purple-100 text-purple-800',
                      nutritionist: 'bg-blue-100 text-blue-800',
                      user: 'bg-gray-100 text-gray-800',
                    };
                    return colors[name] || 'bg-indigo-100 text-indigo-800';
                  };
                  return (
                    <span
                      key={role?.id || roleName || index}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(roleName)}`}
                    >
                      {roleName.replace('_', ' ')}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-gray-400 italic">Sin roles asignados</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asignar nutricionista (solo super admin; no aplica a super_admin ni nutricionista) */}
      {isSuperAdmin && !(user.roles || []).includes('super_admin') && !(user.roles || []).includes('nutritionist') && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nutricionista asignado</h3>
          <p className="text-sm text-gray-600 mb-3">Asigna este usuario a un nutricionista para que solo ese profesional vea sus datos.</p>
          <select
            value={user.assigned_nutritionist_id ?? ''}
            onChange={async (e) => {
              const val = e.target.value || null;
              try {
                await api.put(`/admin/users/${user.id}`, { assigned_nutritionist_id: val });
                setUser((u) => ({ ...u, assigned_nutritionist_id: val ? Number(val) : null }));
              } catch (err) {
                alert(err.response?.data?.message || 'Error al asignar');
              }
            }}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Sin asignar</option>
            {nutritionists.map((n) => (
              <option key={n.id} value={n.id}>{n.name} ({n.email})</option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Valoraciones</h3>
          <p className="text-3xl font-bold text-indigo-600">{user.stats?.total_assessments || 0}</p>
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

      {/* Recent Assessments */}
      {user.assessments && user.assessments.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Valoraciones Recientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IMC</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">GEB</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">GET</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Peso</th>
                </tr>
              </thead>
              <tbody>
                {user.assessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(assessment.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-indigo-600">
                        {Number(assessment.bmi).toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{assessment.geb} kcal</td>
                    <td className="py-3 px-4 text-gray-600">{assessment.get} kcal</td>
                    <td className="py-3 px-4 text-gray-600">{assessment.weight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Management */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Roles y Permisos</h3>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona los roles asignados a este usuario
            </p>
          </div>
          <button
            onClick={() => setShowRoleManager(!showRoleManager)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {showRoleManager ? 'Ocultar Gestor' : 'Gestionar Roles'}
          </button>
        </div>

        {/* Current Roles Display - Always Visible */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-700">Roles Asignados:</span>
            <span className="text-xs text-gray-500">
              ({(Array.isArray(user.roles) ? user.roles : []).length} rol{(Array.isArray(user.roles) ? user.roles : []).length !== 1 ? 'es' : ''})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(user.roles) ? user.roles : []).length > 0 ? (
              (Array.isArray(user.roles) ? user.roles : []).map((role, index) => {
                const roleName = typeof role === 'string' ? role : role?.name || role;
                const getRoleBadgeColor = (name) => {
                  const colors = {
                    super_admin: 'bg-red-100 text-red-800 border-red-300',
                    admin: 'bg-purple-100 text-purple-800 border-purple-300',
                    nutritionist: 'bg-blue-100 text-blue-800 border-blue-300',
                    user: 'bg-gray-100 text-gray-800 border-gray-300',
                  };
                  return colors[name] || 'bg-indigo-100 text-indigo-800 border-indigo-300';
                };
                return (
                  <span
                    key={role?.id || roleName || index}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 ${getRoleBadgeColor(roleName)} flex items-center gap-2`}
                  >
                    <span className="capitalize">{roleName.replace('_', ' ')}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                );
              })
            ) : (
              <div className="text-sm text-gray-500 italic">
                No hay roles asignados. Haz clic en "Gestionar Roles" para asignar roles.
              </div>
            )}
          </div>
        </div>

        {showRoleManager && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <RoleManager
              userId={user.id}
              currentRoles={user.roles || []}
              onUpdate={() => {
                fetchUserDetails();
                // Cerrar el gestor después de actualizar
                setTimeout(() => setShowRoleManager(false), 2000);
              }}
            />
          </div>
        )}
      </div>

      {/* Permissions */}
      {user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Permisos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Los permisos se asignan automáticamente según los roles del usuario
          </p>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                {typeof permission === 'string' ? permission : permission?.name || permission}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetails;

