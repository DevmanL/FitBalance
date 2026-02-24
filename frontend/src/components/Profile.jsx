import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const goalOptions = [
  { value: '', label: 'Sin definir' },
  { value: 'lose_weight', label: 'Perder peso' },
  { value: 'gain_weight', label: 'Ganar peso' },
  { value: 'maintain', label: 'Mantener' },
  { value: 'gain_muscle', label: 'Ganar músculo' },
];

const experienceOptions = [
  { value: '', label: 'Sin definir' },
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

export default function Profile({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
   const [photoUrl, setPhotoUrl] = useState('');
   const [preferences, setPreferences] = useState([]);
   const [preferencesInput, setPreferencesInput] = useState('');
   const [allergies, setAllergies] = useState([]);
   const [allergiesInput, setAllergiesInput] = useState('');

  const lastAssessment = useMemo(() => (assessments?.length ? assessments[0] : null), [assessments]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [profileRes, assessmentsRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/assessments'),
        ]);
        const profileData = profileRes.data || {};
        setProfile(profileData);
        setPhotoUrl(profileData.photo || '');
        setPreferences(Array.isArray(profileData.preferences) ? profileData.preferences : []);
        setAllergies(Array.isArray(profileData.allergies) ? profileData.allergies : []);
        setAssessments(assessmentsRes.data || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar tu perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      setSaving(true);
      const form = new FormData(e.currentTarget);

      const payload = {
        phone: form.get('phone') || null,
        birth_date: form.get('birth_date') || null,
        photo: photoUrl || null,
        preferences,
        allergies,
        goal: form.get('goal') || null,
        goal_description: form.get('goal_description') || null,
        experience_level: form.get('experience_level') || null,
        notes: form.get('notes') || null,
        target_weight: form.get('target_weight') ? Number(form.get('target_weight')) : null,
        target_bmi: form.get('target_bmi') ? Number(form.get('target_bmi')) : null,
        activity_goal_minutes: form.get('activity_goal_minutes')
          ? Number(form.get('activity_goal_minutes'))
          : null,
      };

      const res = await api.put('/user/profile', payload);
      const updated = res.data.profile || res.data;
      setProfile(updated);
      setPhotoUrl(updated.photo || '');
      setPreferences(Array.isArray(updated.preferences) ? updated.preferences : []);
      setAllergies(Array.isArray(updated.allergies) ? updated.allergies : []);
      setSuccess('Perfil guardado correctamente.');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-xl text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
            <p className="text-gray-600 mt-1">Completa tus datos y define tus objetivos.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Volver
            </button>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`px-4 py-3 rounded-lg border ${
              error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Datos personales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      name="phone"
                      defaultValue={profile?.phone ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                    <input
                      type="date"
                      name="birth_date"
                      defaultValue={profile?.birth_date ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
                    <input
                      name="photo"
                      placeholder="https://..."
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {photoUrl && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                        <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={photoUrl}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preferencias y alergias</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferencias alimentarias
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {preferences.length === 0 && (
                        <span className="text-xs text-gray-400">Sin preferencias definidas</span>
                      )}
                      {preferences.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() =>
                              setPreferences((prev) => prev.filter((pref) => pref !== item))
                            }
                            className="ml-1 text-indigo-400 hover:text-indigo-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={preferencesInput}
                      onChange={(e) => setPreferencesInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const raw = preferencesInput.trim().replace(/,$/, '');
                          if (raw && !preferences.includes(raw)) {
                            setPreferences((prev) => [...prev, raw]);
                          }
                          setPreferencesInput('');
                        }
                      }}
                      placeholder="Escribe y pulsa Enter para añadir (ej: vegetariano)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {allergies.length === 0 && (
                        <span className="text-xs text-gray-400">Sin alergias registradas</span>
                      )}
                      {allergies.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() =>
                              setAllergies((prev) => prev.filter((all) => all !== item))
                            }
                            className="ml-1 text-rose-400 hover:text-rose-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={allergiesInput}
                      onChange={(e) => setAllergiesInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const raw = allergiesInput.trim().replace(/,$/, '');
                          if (raw && !allergies.includes(raw)) {
                            setAllergies((prev) => [...prev, raw]);
                          }
                          setAllergiesInput('');
                        }
                      }}
                      placeholder="Escribe y pulsa Enter para añadir (ej: maní)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Objetivo y nivel</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                    <select
                      name="goal"
                      defaultValue={profile?.goal ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {goalOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de experiencia</label>
                    <select
                      name="experience_level"
                      defaultValue={profile?.experience_level ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {experienceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del objetivo</label>
                    <input
                      name="goal_description"
                      maxLength={255}
                      defaultValue={profile?.goal_description ?? ''}
                      placeholder="Ej: Bajar 5 kg en 3 meses"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Objetivos numéricos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso objetivo (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="target_weight"
                      defaultValue={profile?.target_weight ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IMC objetivo</label>
                    <input
                      type="number"
                      step="0.1"
                      name="target_bmi"
                      defaultValue={profile?.target_bmi ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actividad (min/semana)</label>
                    <input
                      type="number"
                      step="1"
                      name="activity_goal_minutes"
                      defaultValue={profile?.activity_goal_minutes ?? ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notas</h2>
                <textarea
                  name="notes"
                  defaultValue={profile?.notes ?? ''}
                  rows={4}
                  placeholder="Observaciones relevantes para tu nutricionista (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </section>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar perfil'}
                </button>
                <Link to="/history" className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
                  Ver historial →
                </Link>
              </div>
            </form>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Progreso</h2>
            {lastAssessment && profile?.target_weight ? (
              <>
                <p className="text-sm text-gray-600">
                  Último peso: <span className="font-semibold text-gray-900">{lastAssessment.weight} kg</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Objetivo: <span className="font-semibold text-gray-900">{profile.target_weight} kg</span>
                </p>
                <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-700">
                    Diferencia:{' '}
                    <span className="font-semibold">
                      {(Number(lastAssessment.weight) - Number(profile.target_weight)).toFixed(1)} kg
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Define un peso objetivo y realiza al menos una valoración para ver tu progreso aquí.
              </p>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Cuenta</h3>
              <p className="text-sm text-gray-600">
                {user?.name} <span className="text-gray-400">({user?.email})</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

