import React from 'react';
import { Plus, Edit2, BookOpen, User, CheckSquare } from 'lucide-react';
import { Course } from '../../types';
import { getCourseIcon } from '../../utils/courseIcons';
import { EmptyState, LoadingSpinner } from '../common/LoadingAndEmpty';

interface CoursesViewProps {
  courses: Course[];
  loading: boolean;
  onOpenCreateCourse: () => void;
  onSelectCourse: (c: Course) => void;
  onViewCourseAssignments: (courseId: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  loading,
  onOpenCreateCourse,
  onSelectCourse,
  onViewCourseAssignments,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize your academic syllabus, professors, and subject themes.
          </p>
        </div>
        <button
          onClick={onOpenCreateCourse}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <LoadingSpinner label="Loading courses..." />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No Courses Enrolled"
          description="Create your first course to begin scheduling assignments and tracking deadlines."
          actionLabel="Add Course"
          onAction={onOpenCreateCourse}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const IconComponent = getCourseIcon(course.icon);
            const assignmentCount = course._count?.assignments ?? 0;

            return (
              <div
                key={course.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Color Banner */}
                  <div
                    className="h-3 w-full"
                    style={{ backgroundColor: course.color }}
                  />

                  <div className="p-5">
                    {/* Icon & Code Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                        style={{ backgroundColor: course.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <div className="flex items-center gap-2">
                        {course.code && (
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {course.code}
                          </span>
                        )}
                        <button
                          onClick={() => onSelectCourse(course)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2">
                      {course.name}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.instructor}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>{assignmentCount} Assignment{assignmentCount === 1 ? '' : 's'}</span>
                  </span>

                  <button
                    onClick={() => onViewCourseAssignments(course.id)}
                    className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    View Tasks →
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