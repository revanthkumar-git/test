import React, { useState } from 'react';
import { Check, Plus, Trash2, ListChecks } from 'lucide-react';
import { Subtask } from '../../types';

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  editable?: boolean;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onChange,
  editable = true,
}) => {
  const [newTitle, setNewTitle] = useState('');

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSubtask: Subtask = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      completed: false,
    };

    onChange([...subtasks, newSubtask]);
    setNewTitle('');
  };

  const handleToggle = (id: string) => {
    const updated = subtasks.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    onChange(updated);
  };

  const handleDelete = (id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Action Items & Subtasks
          </span>
        </div>
        {totalCount > 0 && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {completedCount}/{totalCount} completed ({progressPct}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Subtask Items */}
      <div className="space-y-1.5">
        {subtasks.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs group"
          >
            <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  item.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'
                }`}
              >
                {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span
                className={`text-xs select-none truncate ${
                  item.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-200 font-medium'
                }`}
              >
                {item.title}
              </span>
            </label>

            {editable && (
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                title="Remove checklist item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add New Step Form */}
      {editable && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Add a step (e.g. Read chapter 3, draft code)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubtask(e);
              }
            }}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="button"
            onClick={handleAddSubtask}
            className="p-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors"
            title="Add Subtask"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};