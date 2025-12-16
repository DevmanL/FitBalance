import { useState, useEffect } from 'react';
import { MessageSquare, User } from 'lucide-react';
import api from '../services/api';

const AssessmentNotesView = ({ assessmentId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [assessmentId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assessments/${assessmentId}/notes`);
      setNotes(response.data || []);
      setError('');
    } catch (err) {
      // Si no hay anotaciones o hay un error, simplemente no mostramos nada
      setNotes([]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // No mostrar nada mientras carga
  }

  if (notes.length === 0) {
    return null; // No mostrar nada si no hay anotaciones
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mt-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <MessageSquare className="w-6 h-6 mr-3 text-gray-600" />
        Anotaciones de tu Nutricionista
      </h3>
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
              {note.note}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-gray-700">
                  {note.nutritionist?.name || 'Nutricionista'}
                </span>
              </div>
              <span>
                {new Date(note.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentNotesView;

