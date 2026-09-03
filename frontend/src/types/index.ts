export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  code?: string | null;
  instructor: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assignments: number;
  };
}

export interface Assignment {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  description?: string | null;
  dueDate: string;
  priority: Priority;
  status: Status;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    name: string;
    code?: string | null;
    color: string;
    icon: string;
  };
}

export interface DashboardMetrics {
  totalActive: number;
  completed: number;
  overdue: number;
  dueThisWeek: number;
  totalAssignments: number;
  completionRate: number;
}

export interface CourseSummary {
  id: string;
  name: string;
  code?: string | null;
  color: string;
  icon: string;
  total: number;
  completed: number;
  pending: number;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  overdueAssignments: Assignment[];
  upcomingAssignments: Assignment[];
  courseBreakdown: CourseSummary[];
}

export interface AnalyticsData {
  summary: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
    completionRate: number;
  };
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  courseStats: {
    courseId: string;
    name: string;
    color: string;
    total: number;
    completed: number;
    pending: number;
    rate: number;
  }[];
}

export interface AssignmentFilterParams {
  courseId?: string;
  status?: string;
  priority?: string;
  search?: string;
  sort?: string;
  isOverdue?: boolean;
}