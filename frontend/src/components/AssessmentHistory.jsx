import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AssessmentHistory({ user }) {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await api.get('/assessments');
      setAssessments(response.data || []);
      if (!response.data || response.data.length === 0) {
        setError('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar el historial';
      setError(errorMessage);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'blue', bgColor: 'from-blue-500 to-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'green', bgColor: 'from-green-500 to-emerald-600' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'yellow', bgColor: 'from-yellow-500 to-orange-500' };
    return { label: 'Obesidad', color: 'red', bgColor: 'from-red-500 to-red-600' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (selectedAssessment) {
    const bmiValue = Number(selectedAssessment.bmi);
    const bmiCategory = getBMICategory(bmiValue);
    const nutritionRecs = selectedAssessment.recommendations?.filter(r => r.type === 'nutrition') || [];
    const exerciseRecs = selectedAssessment.recommendations?.filter(r => r.type === 'exercise') || [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Valoración del {formatDate(selectedAssessment.created_at)}
                </h2>
                <p className="text-gray-600">Detalles completos de tu valoración</p>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                ← Volver
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`bg-gradient-to-br ${bmiCategory.bgColor} p-6 rounded-2xl text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">IMC</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{bmiValue.toFixed(1)}</p>
                <p className="text-lg font-medium opacity-90">{bmiCategory.label}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">GEB</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">⚡</span>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{selectedAssessment.geb}</p>
                <p className="text-lg font-medium opacity-90">kcal/día</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">GET</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">🔥</span>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{selectedAssessment.get}</p>
                <p className="text-lg font-medium opacity-90">kcal/día</p>
              </div>

              <div className={`bg-gradient-to-br ${
                selectedAssessment.caloric_balance > 0 
                  ? 'from-green-500 to-emerald-600' 
                  : selectedAssessment.caloric_balance < 0 
                  ? 'from-red-500 to-red-600' 
                  : 'from-gray-500 to-gray-600'
              } p-6 rounded-2xl text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Balance Calórico</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">
                      {selectedAssessment.caloric_balance > 0 ? '⬆️' : selectedAssessment.caloric_balance < 0 ? '⬇️' : '⚖️'}
                    </span>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">
                  {selectedAssessment.caloric_balance > 0 ? '+' : ''}
                  {selectedAssessment.caloric_balance}
                </p>
                <p className="text-lg font-medium opacity-90">kcal</p>
              </div>
            </div>

            <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Datos de la Valoración</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600 text-sm">Peso:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selectedAssessment.weight} kg</span>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600 text-sm">Estatura:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selectedAssessment.height} cm</span>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600 text-sm">Edad:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selectedAssessment.age} años</span>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <span className="text-gray-600 text-sm">Género:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {selectedAssessment.gender === 'male' ? 'Masculino' : 'Femenino'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {nutritionRecs.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-3 text-3xl">🍎</span>
                    Recomendaciones Nutricionales
                  </h3>
                  <div className="space-y-3">
                    {nutritionRecs.map((rec, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <p className="text-gray-700 leading-relaxed">{rec.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {exerciseRecs.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-3 text-3xl">💪</span>
                    Recomendaciones de Ejercicio
                  </h3>
                  <div className="space-y-3">
                    {exerciseRecs.map((rec, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <p className="text-gray-700 leading-relaxed">{rec.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Historial de Valoraciones</h2>
            <p className="text-gray-600">Revisa todas tus valoraciones anteriores</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/assessment')}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              + Nueva Valoración
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {assessments.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <p className="text-gray-600 text-lg mb-2">No tienes valoraciones aún</p>
            <p className="text-gray-500 text-sm mb-6">Crea tu primera valoración para comenzar a trackear tu progreso</p>
            <button
              onClick={() => navigate('/assessment')}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Crear Primera Valoración
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, index) => {
              const bmiValue = Number(assessment.bmi) || 0;
              const bmiCategory = getBMICategory(bmiValue);
              return (
                <div
                  key={assessment.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${bmiCategory.bgColor} rounded-xl flex items-center justify-center text-white font-bold shadow-md`}>
                          {bmiValue.toFixed(1)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {formatDate(assessment.created_at)}
                          </h3>
                          <p className="text-sm text-gray-500">{bmiCategory.label}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-purple-600 font-medium mb-1">GEB</p>
                          <p className="text-lg font-bold text-purple-900">{assessment.geb} kcal</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-orange-600 font-medium mb-1">GET</p>
                          <p className="text-lg font-bold text-orange-900">{assessment.get} kcal</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-600 font-medium mb-1">Balance</p>
                          <p className="text-lg font-bold text-green-900">
                            {assessment.caloric_balance > 0 ? '+' : ''}
                            {assessment.caloric_balance} kcal
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium mb-1">Peso</p>
                          <p className="text-lg font-bold text-gray-900">{assessment.weight} kg</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-indigo-600 font-semibold group">
                      Ver detalles
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessmentHistory;

