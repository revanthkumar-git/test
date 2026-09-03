import React, { useState } from 'react';
import { Assignment, Status, Subtask } from '../../types';
import { getCourseIcon } from '../../utils/courseIcons';
import { Clock, Plus, GripVertical, AlertTriangle, ListChecks, BookMarked } from 'lucide-react';

interface KanbanBoardProps {
  assignments: Assignment[];
  onSelectAssignment: (a: Assignment) => void;
  onOpenCreateAssignment: () => void;
  onStatusChange: (assignmentId: string, newStatus: Status) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  assignments,
  onSelectAssignment,
  onOpenCreateAssignment,
  onStatusChange,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  const columns: { id: Status; title: string; color: string }[] = [
    { id: 'NOT_STARTED', title: 'Not Started', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-indigo-400 dark:border-indigo-600' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-400 dark:border-emerald-600' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      onStatusChange(id, status);
    }
    setDraggedId(null);
  };

  const parseSubtasks = (json?: string | null): Subtask[] => {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kanban Study Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Drag and drop assignment cards between columns to manage your study workflow.
          </p>
        </div>
        <button
          onClick={onOpenCreateAssignment}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colAssignments = assignments.filter((a) => a.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border-2 p-4 transition-all min-h-[500px] flex flex-col ${
                isOver
                  ? 'border-dashed border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {col.title}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {colAssignments.length}
                  </span>
                </div>
              </div>

              {/* Card List */}
              <div className="space-y-3 flex-1">
                {colAssignments.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Drag assignments here
                  </div>
                ) : (
                  colAssignments.map((a) => {
                    const IconComponent = getCourseIcon(a.course.icon);
                    const isOverdue = a.status !== 'COMPLETED' && new Date(a.dueDate) < now;
                    const dueDateObj = new Date(a.dueDate);
                    const subtasks = parseSubtasks(a.subtasks);
                    const completedSubtasks = subtasks.filter((s) => s.completed).length;

                    return (
                      <div
                        key={a.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, a.id)}
                        onClick={() => onSelectAssignment(a)}
                        className={`p-3.5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01] ${
                          draggedId === a.id ? 'opacity-40' : ''
                        } ${
                          isOverdue
                            ? 'border-rose-300 dark:border-rose-900/80'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Course & Priority tags */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${a.course.color}20`,
                              color: a.course.color,
                            }}
                          >
                            <IconComponent className="w-2.5 h-2.5" />
                            <span>{a.course.code || a.course.name}</span>
                          </span>

                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              a.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : a.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {a.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {a.title}
                        </h4>

                        {/* Subtasks Progress Bar if any */}
                        {subtasks.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <ListChecks className="w-3 h-3 text-brand-600" />
                                <span>{completedSubtasks}/{subtasks.length} steps</span>
                              </span>
                              <span>{Math.round((completedSubtasks / subtasks.length) * 100)}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Description Preview */}
                        {a.description && !subtasks.length && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {a.description}
                          </p>
                        )}

                        {/* Due Date & Grip */}
                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue
                                ? 'text-rose-600 dark:text-rose-400 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {isOverdue ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>Due {dueDateObj.toLocaleDateString()}</span>
                          </span>

                          <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};