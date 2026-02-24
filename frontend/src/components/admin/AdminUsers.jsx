import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // '' = todos, 'user' = solo usuarios/clientes, 'nutritionist' = solo nutricionistas
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser?.roles?.includes('super_admin');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter]);

  useEffect(() => {
    if (isSuperAdmin) {
      api.get('/admin/users', { params: { role: 'nutritionist', per_page: 200 } })
        .then((res) => setNutritionists(res.data.data || []))
        .catch(() => setNutritionists([]));
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      };
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  const handleAssignNutritionist = async (userId, nutritionistId) => {
    try {
      await api.put(`/admin/users/${userId}`, {
        assigned_nutritionist_id: nutritionistId || null,
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al asignar nutricionista');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
        </div>
      </div>

      {/* Filtro por rol y búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setRoleFilter(''); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === '' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => { setRoleFilter('user'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Usuarios (clientes)
            </button>
            <button
              type="button"
              onClick={() => { setRoleFilter('nutritionist'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'nutritionist' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Nutricionistas
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Usuario</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Roles</th>
                {isSuperAdmin && (
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Nutricionista asignado</th>
                )}
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Valoraciones</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Registro</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{user.email}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-2">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => {
                          const roleName = typeof role === 'string' ? role : role?.name || role;
                          const getRoleColor = (name) => {
                            const colors = {
                              super_admin: 'bg-red-100 text-red-800 border border-red-300',
                              admin: 'bg-purple-100 text-purple-800 border border-purple-300',
                              nutritionist: 'bg-blue-100 text-blue-800 border border-blue-300',
                              user: 'bg-gray-100 text-gray-800 border border-gray-300',
                            };
                            return colors[name] || 'bg-indigo-100 text-indigo-800 border border-indigo-300';
                          };
                          return (
                            <span
                              key={role?.id || roleName}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(roleName)}`}
                            >
                              {roleName.replace('_', ' ')}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin roles</span>
                      )}
                    </div>
                  </td>
                  {isSuperAdmin && (
                    <td className="py-4 px-6">
                      {(user.roles || []).some((r) => (typeof r === 'string' ? r : r?.name) === 'super_admin') ||
                       (user.roles || []).some((r) => (typeof r === 'string' ? r : r?.name) === 'nutritionist') ? (
                        <span className="text-gray-400 text-sm">—</span>
                      ) : (
                        <select
                          value={user.assigned_nutritionist_id ?? ''}
                          onChange={(e) => handleAssignNutritionist(user.id, e.target.value || null)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Sin asignar</option>
                          {nutritionists.map((n) => (
                            <option key={n.id} value={n.id}>{n.name} ({n.email})</option>
                          ))}
                        </select>
                      )}
                    </td>
                  )}
                  <td className="py-4 px-6">
                    <span className="text-gray-600">{user.assessments?.length || 0}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

