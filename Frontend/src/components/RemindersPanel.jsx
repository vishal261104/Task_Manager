import { useState, useEffect, useRef } from 'react';
import { X, Pin, Plus, Pencil, BellOff, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { usePersistentRemindersStore } from '../store/remindersStore';
import AddReminderModal from './AddReminderModal';

/* ── Single reminder row inside the panel ─────────────────────── */
const PanelItem = ({ reminder, onEdit, onSnooze, onDelete, isSnoozed }) => (
  <div className={`group rounded-xl p-4 border transition-all duration-200 ${
    isSnoozed
      ? 'bg-gray-50 border-gray-100 opacity-60'
      : 'bg-white border-amber-100 hover:border-amber-200 hover:shadow-sm'
  }`}>
    <div className="flex items-start gap-3">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${ isSnoozed ? 'bg-gray-300' : 'bg-amber-400/70' }`} />
      <p className={`flex-1 text-sm leading-relaxed whitespace-pre-wrap break-words ${
        isSnoozed ? 'text-gray-400 line-through' : 'text-gray-700'
      }`}>
        {reminder.text}
      </p>
    </div>

    {isSnoozed && reminder.snoozedUntil && (
      <p className="mt-2 ml-6 text-[10px] text-gray-400 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Snoozed until {new Date(reminder.snoozedUntil).toLocaleDateString()}
      </p>
    )}

    {/* Actions */}
    <div className="mt-3 ml-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      {!isSnoozed && (
        <>
          <button
            onClick={() => onEdit(reminder)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onSnooze(reminder.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <BellOff className="w-3 h-3" /> Snooze 7d
          </button>
        </>
      )}
      <button
        onClick={() => onDelete(reminder.id)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </div>
  </div>
);

/* ── Main panel ───────────────────────────────────────────────── */
const RemindersPanel = ({ isOpen, onClose }) => {
  const { all, loading, fetch, add, edit, remove, snooze } = usePersistentRemindersStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const panelRef = useRef(null);

  const now = Date.now();
  const active = all.filter((r) => !r.snoozedUntil || new Date(r.snoozedUntil).getTime() <= now);
  const snoozed = all.filter((r) => r.snoozedUntil && new Date(r.snoozedUntil).getTime() > now);

  useEffect(() => {
    if (isOpen) {
      fetch();
      // Prevent body scroll while panel is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, fetch]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const handleEdit = (r) => { setEditTarget(r); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditTarget(null); };
  const handleSave = async (text) => {
    if (editTarget) await edit(editTarget.id, text);
    else await add(text);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        style={{ animation: 'fadeInBg 0.2s ease' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Panel card — centred, scrollable */}
        <div
          ref={panelRef}
          className="relative bg-gray-50 rounded-2xl shadow-2xl border border-amber-100 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col overflow-hidden"
          style={{ animation: 'popInPanel 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Pin className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Pinned Reminders</h2>
                <p className="text-[11px] text-gray-400">
                  {active.length} active{snoozed.length > 0 ? `, ${snoozed.length} snoozed` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && active.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
              </div>
            ) : active.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-100">
                  <Pin className="w-6 h-6 text-amber-300" />
                </div>
                <p className="text-sm font-medium text-gray-600">No pinned reminders</p>
                <p className="text-xs text-gray-400 mt-1">Add a note that stays visible every session</p>
                <button
                  onClick={openAdd}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  + Add your first reminder
                </button>
              </div>
            ) : (
              active.map((r) => (
                <PanelItem
                  key={r.id}
                  reminder={r}
                  onEdit={handleEdit}
                  onSnooze={snooze}
                  onDelete={remove}
                  isSnoozed={false}
                />
              ))
            )}

            {/* ── Snoozed section ── */}
            {snoozed.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowSnoozed((p) => !p)}
                  className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors w-full mb-2"
                >
                  {showSnoozed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Snoozed ({snoozed.length})
                </button>
                {showSnoozed && (
                  <div className="space-y-2">
                    {snoozed.map((r) => (
                      <PanelItem
                        key={r.id}
                        reminder={r}
                        onEdit={handleEdit}
                        onSnooze={snooze}
                        onDelete={remove}
                        isSnoozed={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInBg {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popInPanel {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <AddReminderModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        reminderToEdit={editTarget}
        onSave={handleSave}
      />
    </>
  );
};

export default RemindersPanel;
