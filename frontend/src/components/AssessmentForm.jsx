import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Zap, Flame, TrendingUp, TrendingDown, Scale, Apple, Dumbbell, Sofa, AlertTriangle } from 'lucide-react';
import AssessmentNotesView from './AssessmentNotesView';
import api from '../services/api';

function AssessmentForm({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activity_level: 'sedentary',
    daily_intake: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentario (poco o ningún ejercicio)' },
    { value: 'light', label: 'Ligero (ejercicio 1-3 días/semana)' },
    { value: 'moderate', label: 'Moderado (ejercicio 3-5 días/semana)' },
    { value: 'active', label: 'Activo (ejercicio 6-7 días/semana)' },
    { value: 'very_active', label: 'Muy activo (ejercicio 2 veces al día)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/assessments', formData);
      setResult(response.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la valoración');
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

  if (result) {
    const bmiCategory = getBMICategory(result.assessment.bmi);
    const nutritionRecs = result.recommendations.filter(r => r.type === 'nutrition');
    const exerciseRecs = result.recommendations.filter(r => r.type === 'exercise');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados de la Valoración</h2>
                <p className="text-gray-600">Análisis completo de tu estado físico y nutricional</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                ← Dashboard
              </button>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`bg-gradient-to-br ${bmiCategory.bgColor} p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Índice de Masa Corporal</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{result.assessment.bmi}</p>
                <p className="text-lg font-medium opacity-90">{bmiCategory.label}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Gasto Energético Basal</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{result.assessment.geb}</p>
                <p className="text-lg font-medium opacity-90">kcal/día</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Gasto Energético Total</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Flame className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">{result.assessment.get}</p>
                <p className="text-lg font-medium opacity-90">kcal/día</p>
              </div>

              <div className={`bg-gradient-to-br ${
                result.assessment.caloric_balance > 0 
                  ? 'from-green-500 to-emerald-600' 
                  : result.assessment.caloric_balance < 0 
                  ? 'from-red-500 to-red-600' 
                  : 'from-gray-500 to-gray-600'
              } p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Balance Calórico</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    {result.assessment.caloric_balance > 0 ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : result.assessment.caloric_balance < 0 ? (
                      <TrendingDown className="w-6 h-6" />
                    ) : (
                      <Scale className="w-6 h-6" />
                    )}
                  </div>
                </div>
                <p className="text-5xl font-bold mb-2">
                  {result.assessment.caloric_balance > 0 ? '+' : ''}
                  {result.assessment.caloric_balance}
                </p>
                <p className="text-lg font-medium opacity-90">
                  {result.assessment.caloric_balance > 0
                    ? 'Superávit calórico'
                    : result.assessment.caloric_balance < 0
                    ? 'Déficit calórico'
                    : 'Equilibrio calórico'}
                </p>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="space-y-6">
              {nutritionRecs.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Apple className="w-6 h-6 mr-3 text-gray-600" />
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
                    <Dumbbell className="w-6 h-6 mr-3 text-gray-600" />
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

              {/* Nutritionist Notes - Solo lectura para usuarios */}
              {result.assessment.id && (
                <AssessmentNotesView assessmentId={result.assessment.id} />
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setFormData({
                    weight: '',
                    height: '',
                    age: '',
                    gender: 'male',
                    activity_level: 'sedentary',
                    daily_intake: '',
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Nueva Valoración
              </button>
              <button
                onClick={() => navigate('/history')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Ver Historial
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Nueva Valoración</h2>
              <p className="text-gray-600">Completa el formulario para calcular tus métricas</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              ← Dashboard
            </button>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weight" className="block text-sm font-semibold text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="weight"
                    required
                    min="30"
                    max="300"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="70.5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-semibold text-gray-700 mb-2">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  required
                  min="100"
                  max="250"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="175"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  id="age"
                  required
                  min="10"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="30"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                  Género
                </label>
                <select
                  id="gender"
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="activity_level" className="block text-sm font-semibold text-gray-700 mb-2">
                Nivel de Actividad
              </label>
              <select
                id="activity_level"
                required
                value={formData.activity_level}
                onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="daily_intake" className="block text-sm font-semibold text-gray-700 mb-2">
                Ingesta Calórica Diaria (opcional, kcal)
              </label>
              <input
                type="number"
                id="daily_intake"
                min="0"
                max="10000"
                value={formData.daily_intake}
                onChange={(e) => setFormData({ ...formData, daily_intake: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="2000 (opcional)"
              />
              <p className="mt-2 text-sm text-gray-500">
                Si no proporcionas este valor, el balance calórico será 0 (mantenimiento)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculando...
                </span>
              ) : (
                'Calcular Valoración'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssessmentForm;
