import { useState, useEffect } from 'react';
import { Plus, Pencil, BellOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePersistentRemindersStore } from '../store/remindersStore';
import AddReminderModal from './AddReminderModal';

const ReminderItem = ({ reminder, onEdit, onSnooze, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = reminder.text.length > 48;

  return (
    <div className="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-amber-100/60 transition-colors duration-150">
      {/* Dot instead of pin icon */}
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />

      <button
        onClick={() => isLong && setExpanded((p) => !p)}
        className={`flex-1 text-left text-xs text-gray-500 leading-relaxed transition-all duration-200 ${
          !expanded ? 'line-clamp-1' : ''
        } ${isLong ? 'cursor-pointer' : 'cursor-default'}`}
        title={isLong && !expanded ? reminder.text : undefined}
      >
        {reminder.text}
      </button>

      {isLong && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="shrink-0 text-gray-300 hover:text-amber-500 transition-colors"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}

      <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button onClick={() => onEdit(reminder)} className="p-1 rounded text-gray-300 hover:text-purple-500 hover:bg-purple-50 transition-colors" title="Edit">
          <Pencil className="w-3 h-3" />
        </button>
        <button onClick={() => onSnooze(reminder.id)} className="p-1 rounded text-gray-300 hover:text-blue-400 hover:bg-blue-50 transition-colors" title="Snooze 7 days">
          <BellOff className="w-3 h-3" />
        </button>
        <button onClick={() => onDelete(reminder.id)} className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors" title="Delete">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const PersistentReminders = () => {
  const { visible, all, loading, fetch, add, edit, remove, snooze } = usePersistentRemindersStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch();
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, [fetch]);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const handleEdit = (r) => { setEditTarget(r); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditTarget(null); };
  const handleSave = async (text) => {
    if (editTarget) await edit(editTarget.id, text);
    else await add(text);
  };

  const hiddenCount =
    all.filter((r) => !r.snoozedUntil || new Date(r.snoozedUntil).getTime() <= Date.now())
      .length - visible.length;

  const isEmpty = !loading && visible.length === 0;

  return (
    <>
      {isEmpty ? (
        <button
          onClick={openAdd}
          className={`mb-3 flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-amber-500 transition-colors duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <span>Add a pinned note…</span>
        </button>
      ) : (
        <div
          className={`mb-3 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 px-3 py-2 transition-all duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-amber-600/70 uppercase tracking-wider">Pinned</span>
              {hiddenCount > 0 && (
                <span className="text-[10px] text-amber-400/70">(+{hiddenCount} more)</span>
              )}
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-0.5 text-[10px] text-amber-500/80 hover:text-amber-600 transition-colors"
              title="Add reminder"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          <div>
            {visible.map((r) => (
              <ReminderItem key={r.id} reminder={r} onEdit={handleEdit} onSnooze={snooze} onDelete={remove} />
            ))}
          </div>
        </div>
      )}

      <AddReminderModal isOpen={modalOpen} onClose={handleModalClose} reminderToEdit={editTarget} onSave={handleSave} />
    </>
  );
};

export default PersistentReminders;
