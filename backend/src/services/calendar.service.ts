interface AssignmentWithCourse {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: string;
  status: string;
  course: {
    name: string;
    code: string | null;
  };
}

const formatICalDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

export const generateICalendar = (assignments: AssignmentWithCourse[], calendarName = 'StudyFlow Calendar'): string => {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyFlow//Student Productivity App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  for (const item of assignments) {
    const start = new Date(item.dueDate);
    // Default 1-hour study block or deadline reminder
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const now = new Date();

    const summary = `[${item.course.code || item.course.name}] ${item.title} (${item.priority} Priority)`;
    const description = `Course: ${item.course.name}\nStatus: ${item.status}\nPriority: ${item.priority}\n\n${item.description || 'No description provided.'}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:assignment-${item.id}@studyflow.app`,
      `DTSTAMP:${formatICalDate(now)}`,
      `DTSTART:${formatICalDate(start)}`,
      `DTEND:${formatICalDate(end)}`,
      `SUMMARY:${escapeICalText(summary)}`,
      `DESCRIPTION:${escapeICalText(description)}`,
      `CATEGORIES:${escapeICalText(item.course.name)}`,
      item.status === 'COMPLETED' ? 'STATUS:COMPLETED' : 'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Assignment Due in 24 Hours',
      'TRIGGER:-PT24H',
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Assignment Due in 1 Hour',
      'TRIGGER:-PT1H',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};