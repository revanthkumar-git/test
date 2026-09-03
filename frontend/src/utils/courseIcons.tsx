import React from 'react';
import {
  Code,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Palette,
  Music,
  Compass,
  LucideIcon,
} from 'lucide-react';

export const COURSE_ICONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'book', label: 'Book', icon: BookOpen },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'calculator', label: 'Math', icon: Calculator },
  { id: 'flask', label: 'Science', icon: FlaskConical },
  { id: 'globe', label: 'Globe', icon: Globe },
  { id: 'palette', label: 'Art', icon: Palette },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'compass', label: 'Engineering', icon: Compass },
];

export const COURSE_COLORS = [
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Cyan', value: '#06B6D4' },
];

export const getCourseIcon = (iconName?: string): LucideIcon => {
  const match = COURSE_ICONS.find((i) => i.id === iconName?.toLowerCase());
  return match ? match.icon : BookOpen;
};