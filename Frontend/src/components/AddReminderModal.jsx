import { useState, useEffect, useRef } from 'react';
import { X, Pin } from 'lucide-react';

const MAX_LEN = 500;

const AddReminderModal = ({ isOpen, onClose, reminderToEdit, onSave }) => {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setText(reminderToEdit?.text ?? '');
      setError('');
      // Auto-focus after the transition settles
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [isOpen, reminderToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) { setError('Reminder text is required.'); return; }
    if (trimmed.length > MAX_LEN) { setError(`Max ${MAX_LEN} characters.`); return; }
    setSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-700">
              {reminderToEdit ? 'Edit Reminder' : 'New Reminder'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            placeholder="Type a reminder that should stay visible…"
            rows={4}
            maxLength={MAX_LEN}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-gray-400 transition"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length}/{MAX_LEN}</span>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {saving ? 'Saving…' : reminderToEdit ? 'Save Changes' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReminderModal;
