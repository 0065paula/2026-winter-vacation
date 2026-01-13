import { START_DATE_STR, END_DATE_STR } from './constants';
import { DateCellInfo } from './types';

// Helper to parse "YYYY-MM-DD" in local time to avoid timezone shifts
export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Format Date to "YYYY-MM-DD"
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if two dates are same day
export const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const getCalendarGrid = (): DateCellInfo[] => {
  const startTarget = parseDate(START_DATE_STR);
  const endTarget = parseDate(END_DATE_STR);
  const today = new Date();

  // 1. Determine Grid Start (Sunday of the start week)
  const gridStart = new Date(startTarget);
  // date.getDay(): 0 is Sunday. If start is Mon(1), we subtract 1 day.
  gridStart.setDate(startTarget.getDate() - startTarget.getDay());

  // 2. Determine Grid End (Saturday of the end week)
  const gridEnd = new Date(endTarget);
  // If end is Sun(0), we add 6 days. If end is Sat(6), add 0.
  gridEnd.setDate(endTarget.getDate() + (6 - endTarget.getDay()));

  const cells: DateCellInfo[] = [];
  const current = new Date(gridStart);

  while (current <= gridEnd) {
    const dateStr = formatDateKey(current);
    const dayOfWeek = current.getDay();
    const dayOfMonth = current.getDate();
    const isTargetRange = current >= startTarget && current <= endTarget;
    
    // Determine Month Label (Show on 1st of month OR first cell of grid)
    let monthLabel = undefined;
    if (dayOfMonth === 1 || cells.length === 0) {
      monthLabel = `${current.getMonth() + 1}月`;
    }

    cells.push({
      date: new Date(current),
      dateStr,
      isTargetRange,
      isToday: isSameDay(current, today),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayOfMonth,
      monthLabel,
    });

    // Next day
    current.setDate(current.getDate() + 1);
  }

  return cells;
};

// Generate simple array of days for the tracker list
export const getAllDaysInRange = (): { date: Date; dateStr: string; dayLabel: string; isWeekend: boolean; isToday: boolean }[] => {
  const start = parseDate(START_DATE_STR);
  const end = parseDate(END_DATE_STR);
  const today = new Date();
  const days = [];
  const current = new Date(start);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  while (current <= end) {
    const d = new Date(current);
    days.push({
      date: d,
      dateStr: formatDateKey(d),
      dayLabel: weekDays[d.getDay()],
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isToday: isSameDay(d, today)
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

// Calculate progress statistics
export const getProgressStats = () => {
  const start = parseDate(START_DATE_STR);
  const end = parseDate(END_DATE_STR);
  const today = new Date();
  
  // Normalize time components
  start.setHours(0,0,0,0);
  end.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const totalTime = end.getTime() - start.getTime();
  const totalDays = Math.round(totalTime / (1000 * 3600 * 24)) + 1;

  let passedTime = today.getTime() - start.getTime();
  // Clamp passed time
  if (passedTime < 0) passedTime = 0;
  if (passedTime > totalTime) passedTime = totalTime;

  const passedDays = Math.round(passedTime / (1000 * 3600 * 24));
  // If today is in range, strictly it's passedDays + 1 (current day counting), 
  // but for "remaining" logic usually we calculate full days passed.
  // Let's do simple math:
  
  const percentage = Math.min(100, Math.max(0, Math.round((passedDays / totalDays) * 100)));
  const remainingDays = totalDays - passedDays;

  return { totalDays, passedDays, remainingDays, percentage };
};