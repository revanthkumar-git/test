import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Columns,
  GraduationCap,
  BarChart3,
  Plus,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'assignments' | 'calendar' | 'kanban' | 'courses' | 'analytics';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenCreateAssignment: () => void;
  assignmentCount?: number;
  courseCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  onOpenCreateAssignment,
  assignmentCount = 0,
  courseCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', icon: CheckSquare, badge: assignmentCount },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'kanban', label: 'Kanban Board', icon: Columns },
    { id: 'courses', label: 'Courses', icon: GraduationCap, badge: courseCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white/90 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="space-y-6">
          {/* Quick Create Action */}
          <button
            onClick={() => {
              onOpenCreateAssignment();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/25 hover:from-brand-500 hover:to-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Assignment</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                        isActive
                          ? 'bg-brand-200/60 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Academic Productivity Tip */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/30">
          <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">StudyFlow Tip</p>
          <p className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
            Break larger assignments into smaller milestones and tackle high priority tasks first!
          </p>
        </div>
      </aside>
    </>
  );
};