import { useState, useEffect } from 'react';
import { MessageSquare, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '../../services/api';

const AssessmentNotes = ({ assessmentId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [assessmentId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/nutritionist/assessments/${assessmentId}/notes`);
      setNotes(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las anotaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (newNote.trim().length < 10) {
      setError('La anotación debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await api.post(`/nutritionist/assessments/${assessmentId}/notes`, {
        note: newNote,
      });
      setNotes([response.data.note, ...notes]);
      setNewNote('');
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la anotación');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note.id);
    setEditText(note.note);
  };

  const handleUpdateNote = async (noteId) => {
    if (editText.trim().length < 10) {
      setError('La anotación debe tener al menos 10 caracteres');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await api.put(`/nutritionist/notes/${noteId}`, {
        note: editText,
      });
      setNotes(notes.map(n => n.id === noteId ? response.data.note : n));
      setEditingNote(null);
      setEditText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la anotación');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta anotación?')) {
      return;
    }

    try {
      await api.delete(`/nutritionist/notes/${noteId}`);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar la anotación');
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditText('');
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">Cargando anotaciones...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Anotaciones Personalizadas
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Nueva Anotación
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form to create new note */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Escribe tu anotación personalizada sobre esta valoración (mínimo 10 caracteres)..."
            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="4"
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCreateNote}
              disabled={saving || newNote.trim().length < 10}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewNote('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 && !showForm ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No hay anotaciones aún</p>
          <p className="text-sm text-gray-500 mt-1">Agrega una anotación personalizada sobre esta valoración</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {editingNote === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={saving || editText.trim().length < 10}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-gray-900 whitespace-pre-wrap">{note.note}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <span>
                      Por: <span className="font-medium">{note.nutritionist?.name || 'Nutricionista'}</span>
                    </span>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentNotes;

