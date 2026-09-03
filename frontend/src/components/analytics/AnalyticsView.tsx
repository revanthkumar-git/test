import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../services/api';
import { AnalyticsData } from '../../types';
import { LoadingSpinner } from '../common/LoadingAndEmpty';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart2,
  PieChart,
  Award,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <LoadingSpinner label="Compiling study performance metrics..." />;
  }

  const { summary, priorityBreakdown, courseStats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Study Performance & Statistics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Data-driven insights to help optimize your study routines and deadline compliance.
        </p>
      </div>

      {/* Top Completion Rate Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-lg shadow-brand-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Academic Velocity</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {summary.completionRate}% Overall Completion
            </h2>
            <p className="text-sm text-indigo-100 max-w-md leading-relaxed">
              You have successfully completed {summary.completed} out of {summary.total} total coursework assignments.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md">
              <span className="text-xl font-bold">{summary.completed}</span>
              <p className="text-[11px] text-indigo-200 mt-0.5">Done</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md">
              <span className="text-xl font-bold">{summary.inProgress}</span>
              <p className="text-[11px] text-indigo-200 mt-0.5">In Progress</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md">
              <span className="text-xl font-bold text-rose-200">{summary.overdue}</span>
              <p className="text-[11px] text-rose-200 mt-0.5">Overdue</p>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3 bg-black/20 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${summary.completionRate}%` }}
          />
        </div>
      </div>

      {/* Grid: Course Breakdown & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Workload Progress */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Course Completion Rates
            </h3>
          </div>

          {courseStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No coursework data available.</p>
          ) : (
            <div className="space-y-4">
              {courseStats.map((c) => (
                <div key={c.courseId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.name}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {c.completed}/{c.total} completed ({c.rate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${c.rate}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Priority Distribution
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/40 dark:bg-rose-950/20 text-center">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {priorityBreakdown.high}
              </span>
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 mt-1">
                High Priority
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-950 bg-amber-50/40 dark:bg-amber-950/20 text-center">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {priorityBreakdown.medium}
              </span>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-1">
                Medium Priority
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-950 bg-blue-50/40 dark:bg-blue-950/20 text-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {priorityBreakdown.low}
              </span>
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mt-1">
                Low Priority
              </p>
            </div>
          </div>

          {/* Productivity Coaching Insight */}
          <div className="mt-6 p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/60 dark:bg-indigo-950/30 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <span className="font-bold">Study Recommendation: </span>
              {summary.overdue > 0
                ? `You have ${summary.overdue} overdue assignment(s). Prioritize submitting them first before starting new low-priority tasks.`
                : 'All your deadlines are up to date! Dedicate upcoming study sessions to high-priority coursework due this week.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};