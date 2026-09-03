import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Assignment, Course } from '../../types';
import { getCourseIcon } from '../../utils/courseIcons';

interface CalendarViewProps {
  assignments: Assignment[];
  courses: Course[];
  onSelectAssignment: (a: Assignment) => void;
  onOpenCreateWithDate: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  assignments,
  onSelectAssignment,
  onOpenCreateWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayIndex = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const totalCells = days.length <= 35 ? 35 : 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Map assignments to date strings YYYY-MM-DD
  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    assignments.forEach((a) => {
      const d = new Date(a.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(a);
    });
    return map;
  }, [assignments]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Study Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize deadlines and click any day to schedule study commitments.
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-l-xl text-slate-600 dark:text-slate-300"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-r-xl text-slate-600 dark:text-slate-300"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center">
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="py-3 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/70">
          {calendarDays.map((cell, idx) => {
            const dateKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
            const dayAssignments = assignmentsByDate.get(dateKey) || [];
            const isCurrentToday = isToday(cell.date);

            return (
              <div
                key={idx}
                onClick={() => onOpenCreateWithDate(cell.date)}
                className={`min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-colors group relative ${
                  cell.isCurrentMonth
                    ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    : 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                }`}
              >
                {/* Date Number & Quick Add Button */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full ${
                      isCurrentToday
                        ? 'bg-brand-600 text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCreateWithDate(cell.date);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-opacity"
                    title="Add assignment on this day"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Assignment Pills */}
                <div className="space-y-1 mt-1.5 overflow-hidden">
                  {dayAssignments.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAssignment(a);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-transform hover:scale-[1.02] shadow-2xs"
                      style={{
                        backgroundColor: `${a.course.color}25`,
                        color: a.course.color,
                        borderLeft: `3px solid ${a.course.color}`,
                      }}
                      title={`${a.title} (${a.course.name})`}
                    >
                      <span className="truncate">{a.title}</span>
                    </div>
                  ))}
                  {dayAssignments.length > 3 && (
                    <span className="text-[9px] font-semibold text-slate-400 pl-1">
                      +{dayAssignments.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};