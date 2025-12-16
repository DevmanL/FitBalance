import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const RoleManager = ({ userId, currentRoles = [], onUpdate }) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAvailableRoles();
    // Convertir roles actuales a array de strings
    const roleNames = Array.isArray(currentRoles)
      ? currentRoles.map((r) => (typeof r === 'string' ? r : r.name || r))
      : [];
    setSelectedRoles(roleNames);
  }, [currentRoles]);

  const fetchAvailableRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/roles/all');
      setAvailableRoles(response.data || []);
    } catch (err) {
      setError('Error al cargar roles disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleName) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        return prev.filter((r) => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api.post(`/admin/users/${userId}/roles`, {
        roles: selectedRoles,
      });

      setSuccess('Roles actualizados correctamente. La página se actualizará automáticamente...');
      if (onUpdate) {
        // Esperar un momento para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          onUpdate();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar roles');
    } finally {
      setSaving(false);
    }
  };

  const getRoleDescription = (roleName) => {
    const descriptions = {
      super_admin: 'Control total del sistema. Puede gestionar usuarios, roles, permisos, valoraciones, configuraciones y todo el contenido. Acceso completo a todas las funcionalidades administrativas.',
      admin: 'Gestión de usuarios y contenido. Puede crear, editar y eliminar usuarios, gestionar valoraciones, ver analytics completos, generar reportes y gestionar contenido del sistema. No puede modificar configuraciones críticas del sistema.',
      nutritionist: 'Puede ver y gestionar valoraciones de clientes. Acceso al panel de nutricionista para ver todos los usuarios, sus valoraciones, agregar anotaciones personalizadas, crear y editar recomendaciones. Puede ver analytics básicos.',
      user: 'Funcionalidades básicas (rol por defecto). Puede crear valoraciones morfofuncionales, ver sus propios resultados, recibir recomendaciones automáticas y ver anotaciones de su nutricionista. Todos los nuevos usuarios se registran con este rol automáticamente.',
    };
    return descriptions[roleName] || '';
  };

  const getRoleColor = (roleName) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800 border-red-300',
      admin: 'bg-purple-100 text-purple-800 border-purple-300',
      nutritionist: 'bg-blue-100 text-blue-800 border-blue-300',
      user: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Cargando roles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestionar Roles</h3>
        <p className="text-sm text-gray-600 mb-2">
          Selecciona los roles que deseas asignar a este usuario
        </p>
        <p className="text-xs text-gray-500 mb-4">
          <strong>Nota:</strong> Todos los nuevos usuarios se registran automáticamente con el rol "user" (funcionalidades básicas).
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-2">
        {availableRoles.map((role) => {
          const roleName = role.name || role;
          const isSelected = selectedRoles.includes(roleName);
          return (
            <label
              key={role.id || roleName}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? getRoleColor(roleName)
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleRoleToggle(roleName)}
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 capitalize">
                    {roleName.replace('_', ' ')}
                  </span>
                  {isSelected && (
                    <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{getRoleDescription(roleName)}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {selectedRoles.length > 0 ? (
            <span>
              {selectedRoles.length} rol{selectedRoles.length !== 1 ? 'es' : ''} seleccionado
              {selectedRoles.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-orange-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              El usuario debe tener al menos un rol
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || selectedRoles.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default RoleManager;

