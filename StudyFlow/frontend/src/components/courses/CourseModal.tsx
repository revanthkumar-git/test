import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Course } from '../../types';
import { coursesApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { COURSE_COLORS, COURSE_ICONS } from '../../utils/courseIcons';
import { Trash2 } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course | null;
  onSuccess: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('book');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    if (courseToEdit) {
      setName(courseToEdit.name);
      setCode(courseToEdit.code || '');
      setInstructor(courseToEdit.instructor);
      setColor(courseToEdit.color || '#3B82F6');
      setIcon(courseToEdit.icon || 'book');
    } else {
      setName('');
      setCode('');
      setInstructor('');
      setColor('#3B82F6');
      setIcon('book');
    }
  }, [courseToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Course name is required');
      return;
    }
    if (!instructor.trim()) {
      error('Instructor name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim() || null,
        instructor: instructor.trim(),
        color,
        icon,
      };

      if (courseToEdit) {
        await coursesApi.update(courseToEdit.id, payload as any);
        success('Course updated successfully!');
      } else {
        await coursesApi.create(payload as any);
        success('Course created successfully!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!courseToEdit) return;
    if (
      !window.confirm(
        `Are you sure you want to delete "${courseToEdit.name}"? This will also remove all assignments linked to this course.`
      )
    )
      return;

    setIsDeleting(true);
    try {
      await coursesApi.delete(courseToEdit.id);
      success('Course and associated assignments deleted.');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={courseToEdit ? 'Edit Course' : 'Add New Course'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Course Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Data Structures & Algorithms"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Course Code / Number
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CS201"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Instructor Name *
            </label>
            <input
              type="text"
              required
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="e.g. Prof. Ada Lovelace"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Course Color Theme
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COURSE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c.value
                    ? 'ring-2 ring-offset-2 ring-brand-500 scale-110 shadow-md'
                    : 'hover:scale-105 opacity-90 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Course Icon
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {COURSE_ICONS.map((i) => {
              const IconComponent = i.icon;
              const isSelected = icon === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setIcon(i.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                  title={i.label}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-[10px] mt-1 truncate">{i.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {courseToEdit ? (
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
              {loading ? 'Saving...' : courseToEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};