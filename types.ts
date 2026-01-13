export type EventType = 'study' | 'fun' | 'sport' | 'travel' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  time?: string;
  date: string; // YYYY-MM-DD
  type: EventType;
}

export interface DateCellInfo {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  isTargetRange: boolean; // Is within the winter break official range
  isToday: boolean;
  isWeekend: boolean;
  dayOfMonth: number;
  monthLabel?: string; // e.g., "Jan" or "Feb" if it's the 1st day or start of grid
}

export type RepeatMode = 'single' | 'range' | 'daily' | 'weekly' | 'custom';

export const EVENT_TYPES: { type: EventType; label: string; color: string; ring: string; bg: string }[] = [
  { type: 'study', label: '📚 学习 (Study)', color: 'text-blue-700', ring: 'ring-blue-200', bg: 'bg-blue-50' },
  { type: 'fun', label: '🎮 娱乐 (Fun)', color: 'text-pink-700', ring: 'ring-pink-200', bg: 'bg-pink-50' },
  { type: 'sport', label: '⚽️ 运动 (Sport)', color: 'text-emerald-700', ring: 'ring-emerald-200', bg: 'bg-emerald-50' },
  { type: 'travel', label: '✈️ 出行 (Travel)', color: 'text-orange-700', ring: 'ring-orange-200', bg: 'bg-orange-50' },
  { type: 'other', label: '✨ 其他 (Other)', color: 'text-gray-700', ring: 'ring-gray-200', bg: 'bg-gray-50' },
];