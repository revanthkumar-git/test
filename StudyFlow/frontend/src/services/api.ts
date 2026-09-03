import {
  User,
  Course,
  Assignment,
  DashboardSummary,
  AnalyticsData,
  AssignmentFilterParams,
  Status,
  Priority,
} from '../types';

const API_BASE_URL = '/api';

export const getStoredToken = (): string | null => {
  return localStorage.getItem('studyflow_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('studyflow_token', token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem('studyflow_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch {
      // Body not JSON
    }

    const message = errorData?.message || errorData?.error || `Request failed with status ${response.status}`;

    if (response.status === 401) {
      clearStoredToken();
      // Optional: trigger custom event if needed
      window.dispatchEvent(new Event('studyflow:unauthorized'));
    }

    throw new Error(message);
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{ message: string; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ message: string; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<{ user: User }>('/auth/me', {
      method: 'GET',
    }),
};

// Courses API
export const coursesApi = {
  getAll: () => request<{ courses: Course[] }>('/courses'),

  getById: (id: string) => request<{ course: Course }>('/courses/' + id),

  create: (data: {
    name: string;
    instructor: string;
    code?: string;
    color?: string;
    icon?: string;
  }) =>
    request<{ message: string; course: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      name?: string;
      instructor?: string;
      code?: string | null;
      color?: string;
      icon?: string;
    }
  ) =>
    request<{ message: string; course: Course }>('/courses/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>('/courses/' + id, {
      method: 'DELETE',
    }),
};

// Assignments API
export const assignmentsApi = {
  getAll: (filters: AssignmentFilterParams = {}) => {
    const params = new URLSearchParams();
    if (filters.courseId) params.append('courseId', filters.courseId);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.isOverdue !== undefined) params.append('isOverdue', String(filters.isOverdue));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ assignments: Assignment[] }>(`/assignments${queryString}`);
  },

  getById: (id: string) => request<{ assignment: Assignment }>('/assignments/' + id),

  create: (data: {
    title: string;
    description?: string;
    courseId: string;
    dueDate: string;
    priority?: Priority;
    status?: Status;
    isRecurring?: boolean;
    recurrenceRule?: string;
  }) =>
    request<{ message: string; assignment: Assignment }>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      courseId?: string;
      dueDate?: string;
      priority?: Priority;
      status?: Status;
      isRecurring?: boolean;
      recurrenceRule?: string;
    }
  ) =>
    request<{ message: string; assignment: Assignment }>('/assignments/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: Status) =>
    request<{ message: string; assignment: Assignment }>(`/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request<{ message: string }>('/assignments/' + id, {
      method: 'DELETE',
    }),
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => request<DashboardSummary>('/dashboard/summary'),
};

// Analytics API
export const analyticsApi = {
  getAnalytics: () => request<AnalyticsData>('/analytics'),
};

// Calendar Export URL
export const getCalendarExportUrl = (): string => {
  return `${API_BASE_URL}/calendar/export.ics`;
};