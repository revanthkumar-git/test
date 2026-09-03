import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Repeat,
  AlertTriangle,
  Edit2,
  Check,
  ListChecks,
  BookMarked,
  Tag,
} from 'lucide-react';
import { Assignment, Course, Priority, Status, Subtask } from '../../types';
import { getCourseIcon } from '../../utils/courseIcons';
import { EmptyState, LoadingSpinner } from '../common/LoadingAndEmpty';

interface AssignmentsViewProps {
  assignments: Assignment[];
  courses: Course[];
  loading: boolean;
  onSelectAssignment: (a: Assignment) => void;
  onOpenCreateAssignment: () => void;
  onToggleStatus: (a: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  courses,
  loading,
  onSelectAssignment,
  onOpenCreateAssignment,
  onToggleStatus,
  onDeleteAssignment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDateAsc' | 'dueDateDesc' | 'priority' | 'title'>('dueDateAsc');

  const now = new Date();

  const parseSubtasks = (json?: string | null): Subtask[] => {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Filter and sort assignments on the client
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(term);
        const matchDesc = a.description?.toLowerCase().includes(term);
        const matchNotes = a.notes?.toLowerCase().includes(term);
        const matchTags = a.tags?.toLowerCase().includes(term);
        if (!matchTitle && !matchDesc && !matchNotes && !matchTags) return false;
      }

      if (selectedCourse !== 'all' && a.courseId !== selectedCourse) {
        return false;
      }

      if (selectedPriority !== 'all' && a.priority !== selectedPriority) {
        return false;
      }

      if (selectedStatus !== 'all') {
        if (selectedStatus === 'OVERDUE') {
          if (a.status === 'COMPLETED' || new Date(a.dueDate) >= now) return false;
        } else if (a.status !== selectedStatus) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'dueDateDesc') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'priority') {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return 0;
    });
  }, [assignments, searchTerm, selectedCourse, selectedPriority, selectedStatus, sortBy, now]);

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (s: Status, isOverdue: boolean) => {
    if (s === 'COMPLETED') {
      return (
        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
          Completed
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Overdue
        </span>
      );
    }
    if (s === 'IN_PROGRESS') {
      return (
        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
          In Progress
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        Not Started
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assignments & Milestones Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter, break down tasks into checklist steps, and track progress.
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

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments by title, notes, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Dropdown Filters & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'NOT_STARTED', label: 'Not Started' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'OVERDUE', label: 'Overdue' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedStatus === tab.id
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Select dropdowns: Course, Priority, Sort */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code || c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="dueDateAsc">Sort: Due Date (Soonest)</option>
              <option value="dueDateDesc">Sort: Due Date (Latest)</option>
              <option value="priority">Sort: Priority (Highest)</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment List */}
      {loading ? (
        <LoadingSpinner label="Loading assignments..." />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No Assignments Found"
          description="No assignments matched your search or active filters."
          actionLabel="Create Assignment"
          onAction={onOpenCreateAssignment}
        />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((a) => {
            const IconComponent = getCourseIcon(a.course.icon);
            const isOverdue = a.status !== 'COMPLETED' && new Date(a.dueDate) < now;
            const dueDateObj = new Date(a.dueDate);
            const subtasks = parseSubtasks(a.subtasks);
            const completedSubtasks = subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={a.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all bg-white dark:bg-slate-900 shadow-xs hover:shadow-md ${
                  isOverdue
                    ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
                    : 'border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800'
                }`}
              >
                {/* Left: Complete Checkbox + Title + Meta */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleStatus(a)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      a.status === 'COMPLETED'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-transparent'
                    }`}
                    title={a.status === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => onSelectAssignment(a)}
                        className={`text-sm font-semibold cursor-pointer transition-colors ${
                          a.status === 'COMPLETED'
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400'
                        }`}
                      >
                        {a.title}
                      </h3>
                      {a.isRecurring && (
                        <span
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] flex items-center gap-1"
                          title={`Recurring: ${a.recurrenceRule}`}
                        >
                          <Repeat className="w-3 h-3 text-brand-600" />
                        </span>
                      )}
                    </div>

                    {a.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {a.description}
                      </p>
                    )}

                    {/* Personal Notes Preview */}
                    {a.notes && (
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                        <BookMarked className="w-3 h-3 shrink-0" />
                        <span className="italic truncate">{a.notes}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px]">
                      {/* Course pill */}
                      <span
                        className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${a.course.color}20`, color: a.course.color }}
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{a.course.name}</span>
                      </span>

                      {/* Due date info */}
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due {dueDateObj.toLocaleDateString()} at {dueDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>

                      {/* Subtasks Progress Badge */}
                      {subtasks.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <ListChecks className="w-3.5 h-3.5" />
                          <span>{completedSubtasks}/{subtasks.length} steps</span>
                        </span>
                      )}

                      {/* Tags */}
                      {a.tags && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{a.tags}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Badges & Edit Button */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(a.status, isOverdue)}
                    {getPriorityBadge(a.priority)}
                  </div>
                  <button
                    onClick={() => onSelectAssignment(a)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Assignment & Milestones"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};