import { useState, useEffect } from 'react';
import api from '../../services/api';

const NutritionistAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssessments();
  }, [currentPage, search]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
        ...(search && { search }),
      };
      const response = await api.get('/admin/assessments', { params });
      setAssessments(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar valoraciones');
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'Obesidad', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading && assessments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Cargando valoraciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Valoraciones</h1>
        <p className="text-gray-600 mt-1">Visualiza y gestiona todas las valoraciones del sistema</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <input
          type="text"
          placeholder="Buscar por usuario..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Assessments Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Usuario</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">IMC</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">GEB</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">GET</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Peso</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => {
                const bmiValue = Number(assessment.bmi) || 0;
                const bmiCategory = getBMICategory(bmiValue);
                return (
                  <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{assessment.user?.name}</p>
                        <p className="text-sm text-gray-500">{assessment.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${bmiCategory.bg} ${bmiCategory.color}`}>
                          {bmiValue.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">{bmiCategory.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{assessment.geb} kcal</td>
                    <td className="py-4 px-6 text-gray-600">{assessment.get} kcal</td>
                    <td className="py-4 px-6 text-gray-600">{assessment.weight} kg</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(assessment.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                );
              })}
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

export default NutritionistAssessments;


