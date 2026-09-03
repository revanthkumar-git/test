import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { CalendarView } from './components/calendar/CalendarView';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { CoursesView } from './components/courses/CoursesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AssignmentModal } from './components/assignments/AssignmentModal';
import { CourseModal } from './components/courses/CourseModal';
import { LoadingSpinner } from './components/common/LoadingAndEmpty';
import { useToast } from './components/common/Toast';
import { coursesApi, assignmentsApi, dashboardApi } from './services/api';
import { Course, Assignment, DashboardSummary, Status } from './types';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
  const [initialAssignmentDate, setInitialAssignmentDate] = useState<Date | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Load core application data
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [coursesRes, assignmentsRes, summaryRes] = await Promise.all([
        coursesApi.getAll(),
        assignmentsApi.getAll(),
        dashboardApi.getSummary(),
      ]);

      setCourses(coursesRes.courses);
      setAssignments(assignmentsRes.assignments);
      setDashboardSummary(summaryRes);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Quick toggle assignment status
  const handleToggleStatus = async (assignment: Assignment) => {
    const nextStatus: Status = assignment.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';

    // Optimistic update
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? { ...a, status: nextStatus } : a))
    );

    try {
      await assignmentsApi.updateStatus(assignment.id, nextStatus);
      success(
        nextStatus === 'COMPLETED'
          ? `Marked "${assignment.title}" as completed!`
          : `Marked "${assignment.title}" as incomplete.`
      );
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update status');
      loadData(); // Revert
    }
  };

  // Kanban status change
  const handleKanbanStatusChange = async (assignmentId: string, newStatus: Status) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, status: newStatus } : a))
    );

    try {
      await assignmentsApi.updateStatus(assignmentId, newStatus);
      success(`Updated status to ${newStatus.replace('_', ' ')}`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to update status');
      loadData();
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (id: string) => {
    try {
      await assignmentsApi.delete(id);
      success('Assignment deleted.');
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete assignment');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner label="Starting StudyFlow..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const overdueList = dashboardSummary?.overdueAssignments || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        overdueAssignments={overdueList}
        onSelectAssignment={(a) => {
          setAssignmentToEdit(a);
          setIsAssignmentModalOpen(true);
        }}
      />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenCreateAssignment={() => {
            setAssignmentToEdit(null);
            setInitialAssignmentDate(null);
            setIsAssignmentModalOpen(true);
          }}
          assignmentCount={assignments.filter((a) => a.status !== 'COMPLETED').length}
          courseCount={courses.length}
        />

        {/* Main View Area */}
        <main className="flex-1 md:pl-64 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              summary={dashboardSummary}
              loading={loading}
              onSelectAssignment={(a) => {
                setAssignmentToEdit(a);
                setIsAssignmentModalOpen(true);
              }}
              onOpenCreateAssignment={() => {
                setAssignmentToEdit(null);
                setInitialAssignmentDate(null);
                setIsAssignmentModalOpen(true);
              }}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {currentTab === 'assignments' && (
            <AssignmentsView
              assignments={assignments}
              courses={courses}
              loading={loading}
              onSelectAssignment={(a) => {
                setAssignmentToEdit(a);
                setIsAssignmentModalOpen(true);
              }}
              onOpenCreateAssignment={() => {
                setAssignmentToEdit(null);
                setInitialAssignmentDate(null);
                setIsAssignmentModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              assignments={assignments}
              courses={courses}
              onSelectAssignment={(a) => {
                setAssignmentToEdit(a);
                setIsAssignmentModalOpen(true);
              }}
              onOpenCreateWithDate={(date) => {
                setAssignmentToEdit(null);
                setInitialAssignmentDate(date);
                setIsAssignmentModalOpen(true);
              }}
            />
          )}

          {currentTab === 'kanban' && (
            <KanbanBoard
              assignments={assignments}
              onSelectAssignment={(a) => {
                setAssignmentToEdit(a);
                setIsAssignmentModalOpen(true);
              }}
              onOpenCreateAssignment={() => {
                setAssignmentToEdit(null);
                setInitialAssignmentDate(null);
                setIsAssignmentModalOpen(true);
              }}
              onStatusChange={handleKanbanStatusChange}
            />
          )}

          {currentTab === 'courses' && (
            <CoursesView
              courses={courses}
              loading={loading}
              onOpenCreateCourse={() => {
                setCourseToEdit(null);
                setIsCourseModalOpen(true);
              }}
              onSelectCourse={(c) => {
                setCourseToEdit(c);
                setIsCourseModalOpen(true);
              }}
              onViewCourseAssignments={(_cId) => {
                setCurrentTab('assignments');
              }}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}
        </main>
      </div>

      {/* Assignment Modal (Create & Edit) */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setAssignmentToEdit(null);
          setInitialAssignmentDate(null);
        }}
        assignmentToEdit={assignmentToEdit}
        courses={courses}
        initialDate={initialAssignmentDate}
        onSuccess={loadData}
      />

      {/* Course Modal (Create & Edit) */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setCourseToEdit(null);
        }}
        courseToEdit={courseToEdit}
        onSuccess={loadData}
      />
    </div>
  );
};