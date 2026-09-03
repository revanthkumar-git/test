import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Course, Assignment, Priority, Status, Subtask } from '../../types';
import { assignmentsApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { SubtaskList } from './SubtaskList';
import { Calendar, Clock, Repeat, Trash2, Tag, BookMarked } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: Assignment | null;
  courses: Course[];
  initialDate?: Date | null;
  onSuccess: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  assignmentToEdit,
  courses,
  initialDate,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<Status>('NOT_STARTED');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState('WEEKLY');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.title);
      setDescription(assignmentToEdit.description || '');
      setCourseId(assignmentToEdit.courseId);
      const d = new Date(assignmentToEdit.dueDate);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setDueDate(localISOTime);
      setPriority(assignmentToEdit.priority);
      setStatus(assignmentToEdit.status);
      setIsRecurring(assignmentToEdit.isRecurring);
      setRecurrenceRule(assignmentToEdit.recurrenceRule || 'WEEKLY');
      setNotes(assignmentToEdit.notes || '');
      setTags(assignmentToEdit.tags || '');

      // Parse subtasks JSON
      if (assignmentToEdit.subtasks) {
        try {
          const parsed = JSON.parse(assignmentToEdit.subtasks);
          setSubtasks(Array.isArray(parsed) ? parsed : []);
        } catch {
          setSubtasks([]);
        }
      } else {
        setSubtasks([]);
      }
    } else {
      setTitle('');
      setDescription('');
      setCourseId(courses.length > 0 ? courses[0].id : '');
      const defaultDate = initialDate ? new Date(initialDate) : new Date();
      if (!initialDate) {
        defaultDate.setDate(defaultDate.getDate() + 1);
        defaultDate.setHours(23, 59, 0, 0);
      } else {
        defaultDate.setHours(23, 59, 0, 0);
      }
      const tzOffset = defaultDate.getTimezoneOffset() * 60000;
      setDueDate(new Date(defaultDate.getTime() - tzOffset).toISOString().slice(0, 16));
      setPriority('MEDIUM');
      setStatus('NOT_STARTED');
      setIsRecurring(false);
      setRecurrenceRule('WEEKLY');
      setSubtasks([]);
      setNotes('');
      setTags('');
    }
  }, [assignmentToEdit, courses, initialDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Assignment title is required');
      return;
    }
    if (!courseId) {
      error('Please select a course');
      return;
    }
    if (!dueDate) {
      error('Please specify a due date and time');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        courseId,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        status,
        isRecurring,
        recurrenceRule: isRecurring ? recurrenceRule : undefined,
        subtasks,
        notes: notes.trim() || null,
        tags: tags.trim() || null,
      };

      if (assignmentToEdit) {
        await assignmentsApi.update(assignmentToEdit.id, payload as any);
        success('Assignment and milestones updated!');
      } else {
        await assignmentsApi.create(payload as any);
        success('Assignment created with study milestones!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!assignmentToEdit) return;
    if (!window.confirm(`Are you sure you want to delete "${assignmentToEdit.title}"?`)) return;

    setIsDeleting(true);
    try {
      await assignmentsApi.delete(assignmentToEdit.id);
      success('Assignment deleted.');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to delete assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={assignmentToEdit ? 'Edit Assignment & Milestones' : 'Create New Assignment'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Assignment Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Problem Set 3: Binary Search Trees"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Course */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Course *
          </label>
          <select
            required
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {courses.length === 0 && <option value="">No courses created yet</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code ? `[${c.code}] ` : ''}{c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Due Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="LOW">🟢 Low Priority</option>
              <option value="MEDIUM">🟡 Medium Priority</option>
              <option value="HIGH">🔴 High Priority</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Assignment Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'NOT_STARTED', label: 'Not Started' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id as Status)}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                  status === s.id
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-700 dark:text-brand-300 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Subtasks & Milestones Checklist */}
        <SubtaskList
          subtasks={subtasks}
          onChange={(updated) => {
            setSubtasks(updated);
            // If all subtasks completed, suggest completed status
            if (updated.length > 0 && updated.every((item) => item.completed) && status !== 'COMPLETED') {
              setStatus('COMPLETED');
            }
          }}
        />

        {/* Personal Study Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Personal Study Notes & Questions for TA</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Spent 2 hours on problem 4; need to verify boundary conditions with professor..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* General Description & Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Instructions & Submission Guidelines
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Official instructions from syllabus or portal..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Tags & Recurring */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Tags (comma separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Lab, Exam Prep, Project"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
              />
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                <Repeat className="w-3.5 h-3.5 text-brand-600" />
                <span>Repeat Assignment</span>
              </div>
            </label>
            {isRecurring && (
              <select
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value)}
                className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {assignmentToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Saving...' : assignmentToEdit ? 'Save Changes' : 'Create Assignment'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};