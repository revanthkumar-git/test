import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Plus,
  Flame,
  Check,
} from 'lucide-react';
import { DashboardSummary, Assignment, Course } from '../../types';
import { getCourseIcon } from '../../utils/courseIcons';
import { EmptyState, LoadingSpinner } from '../common/LoadingAndEmpty';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onSelectAssignment: (a: Assignment) => void;
  onOpenCreateAssignment: () => void;
  onNavigateTab: (tab: any) => void;
  onToggleStatus: (a: Assignment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  loading,
  onSelectAssignment,
  onOpenCreateAssignment,
  onNavigateTab,
  onToggleStatus,
}) => {
  if (loading || !summary) {
    return <LoadingSpinner label="Loading dashboard insights..." />;
  }

  const { metrics, overdueAssignments, upcomingAssignments, courseBreakdown } = summary;

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            MED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Academic Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Stay on top of deadlines, study schedules, and coursework progress.
          </p>
        </div>
        <button
          onClick={onOpenCreateAssignment}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* Overdue Warning Alert Banner */}
      {overdueAssignments.length > 0 && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 p-4 shadow-sm animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  Attention: {metrics.overdue} assignment{metrics.overdue > 1 ? 's are' : ' is'} overdue!
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                  Review and submit these tasks promptly to prevent late penalties and maintain course grades.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('assignments')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors"
            >
              Resolve Now
            </button>
          </div>
        </div>
      )}

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Active</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics.totalActive}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">tasks pending</span>
          </div>
        </div>

        {/* Due This Week */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Due This Week</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.dueThisWeek}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">upcoming</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {metrics.overdue}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">urgent</span>
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.completed}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {metrics.completionRate}% Done
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Overdue & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Assignments Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Overdue Assignments
              </h2>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              {overdueAssignments.length}
            </span>
          </div>

          {overdueAssignments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              ✨ No overdue assignments! Great job staying ahead.
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueAssignments.map((a) => {
                const IconComponent = getCourseIcon(a.course.icon);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/10 hover:border-rose-300 dark:hover:border-rose-800 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleStatus(a)}
                        className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors"
                        title="Mark Complete"
                      >
                        {a.status === 'COMPLETED' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                      <div
                        className="cursor-pointer min-w-0"
                        onClick={() => onSelectAssignment(a)}
                      >
                        <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                          {a.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${a.course.color}20`, color: a.course.color }}
                          >
                            <IconComponent className="w-2.5 h-2.5" />
                            {a.course.code || a.course.name}
                          </span>
                          <span className="text-[10px] text-rose-500 font-semibold">
                            Due {new Date(a.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>{getPriorityBadge(a.priority)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Assignments Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Upcoming Deadlines
            </h2>
            <button
              onClick={() => onNavigateTab('assignments')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingAssignments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No upcoming assignments. Click "+ Add Assignment" to schedule study tasks!
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingAssignments.slice(0, 6).map((a) => {
                const IconComponent = getCourseIcon(a.course.icon);
                const isDueSoon =
                  new Date(a.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => onToggleStatus(a)}
                        className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center shrink-0 transition-colors"
                        title="Mark Complete"
                      >
                        {a.status === 'COMPLETED' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                      <div
                        className="cursor-pointer min-w-0"
                        onClick={() => onSelectAssignment(a)}
                      >
                        <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                          {a.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${a.course.color}20`, color: a.course.color }}
                          >
                            <IconComponent className="w-2.5 h-2.5" />
                            {a.course.code || a.course.name}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isDueSoon
                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                : 'text-slate-400'
                            }`}
                          >
                            Due {new Date(a.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(a.priority)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Courses Progress Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Coursework Progress
          </h2>
          <button
            onClick={() => onNavigateTab('courses')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {courseBreakdown.length === 0 ? (
          <EmptyState
            title="No Courses Yet"
            description="Add your university or school courses to organize assignments and track progress."
            actionLabel="Add Course"
            onAction={() => onNavigateTab('courses')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courseBreakdown.map((c) => {
              const IconComponent = getCourseIcon(c.icon);
              const progressPct = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-xs"
                      style={{ backgroundColor: c.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {c.completed}/{c.total} Done
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">{c.code || 'Course'}</p>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};