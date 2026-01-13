import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { getCalendarGrid } from '../utils';
import { CalendarEvent, EVENT_TYPES, DateCellInfo } from '../types';
import { WEEK_DAYS } from '../constants';

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick: (dateStr: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onDateClick, onEventClick }) => {
  const gridCells = useMemo(() => getCalendarGrid(), []);

  // Map events to date strings for O(1) lookup during render
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const getStyleForType = (type: string) => {
    return EVENT_TYPES.find(t => t.type === type) || EVENT_TYPES[4];
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* --- Desktop/Tablet View (Grid) --- */}
      <div className="hidden md:block border border-gray-200 rounded-xl shadow-sm bg-white">
        
        {/* Sticky Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 sticky top-0 z-30 shadow-sm rounded-t-xl">
          {WEEK_DAYS.map((day, idx) => (
            <div 
              key={idx} 
              className={`py-3 text-center text-sm font-semibold ${idx === 0 || idx === 6 ? 'text-red-500' : 'text-gray-600'}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-[1px]">
          {gridCells.map((cell: DateCellInfo) => {
            const dayEvents = eventsByDate[cell.dateStr] || [];
            
            return (
              <div 
                key={cell.dateStr}
                onClick={() => onDateClick(cell.dateStr)}
                className={`
                  min-h-[140px] p-2 bg-white relative group cursor-pointer hover:bg-gray-50 transition-colors
                  ${!cell.isTargetRange ? 'bg-slate-50' : ''}
                `}
              >
                {/* Date Header in Cell */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    {cell.monthLabel && (
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                        {cell.monthLabel}
                      </span>
                    )}
                    <span 
                      className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${cell.isToday ? 'bg-indigo-600 text-white' : cell.isWeekend ? 'text-red-500' : 'text-gray-700'}
                        ${!cell.isTargetRange ? 'opacity-40' : ''}
                      `}
                    >
                      {cell.dayOfMonth}
                    </span>
                  </div>
                  
                  {/* Quick Add Icon (Visible on Hover) */}
                  <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition-opacity">
                    <Plus size={16} />
                  </button>
                </div>

                {/* Events List */}
                <div className="space-y-1">
                  {dayEvents.map(event => {
                    const style = getStyleForType(event.type);
                    return (
                      <div 
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={`
                          px-2 py-1 rounded text-xs truncate border-l-2 cursor-pointer shadow-sm hover:brightness-95
                          ${style.bg} ${style.color} border-${style.color.split('-')[1]}-500
                        `}
                      >
                         {event.time && <span className="opacity-75 mr-1 font-mono">{event.time}</span>}
                         <span className="font-medium">{event.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Mobile View (List) --- */}
      <div className="md:hidden space-y-3">
        {gridCells.map((cell) => {
          const dayEvents = eventsByDate[cell.dateStr] || [];
          // Hide padding days from previous/next months if they are empty to save space
          if (!cell.isTargetRange && dayEvents.length === 0) return null;

          return (
            <div 
              key={cell.dateStr}
              onClick={() => onDateClick(cell.dateStr)}
              className={`
                bg-white rounded-xl shadow-sm border 
                ${cell.isToday ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'} 
                overflow-hidden active:scale-[0.99] transition-transform
              `}
            >
              {/* Day Header */}
              <div className={`
                px-4 py-3 flex justify-between items-center border-b border-gray-100
                ${cell.isToday ? 'bg-indigo-50' : 'bg-gray-50/50'}
              `}>
                <div className="flex items-center gap-3">
                   <div className={`
                     flex flex-col items-center justify-center w-10 h-10 rounded-lg border
                     ${cell.isWeekend ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-gray-200 text-gray-700'}
                     ${cell.isToday ? '!bg-indigo-600 !border-indigo-600 !text-white' : ''}
                   `}>
                      <span className="text-[10px] leading-none uppercase font-bold opacity-80">
                        {WEEK_DAYS[cell.date.getDay()]}
                      </span>
                      <span className="text-lg leading-none font-bold">
                        {cell.dayOfMonth}
                      </span>
                   </div>
                   <div className="flex flex-col">
                      <span className={`text-sm font-bold ${cell.isToday ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {cell.date.getMonth() + 1}月{cell.dayOfMonth}日
                      </span>
                      {cell.isToday && <span className="text-xs text-indigo-600 font-medium">Today</span>}
                   </div>
                </div>
                <button className="text-gray-400 p-2 -mr-2">
                  <Plus size={20} />
                </button>
              </div>

              {/* Events Container */}
              <div className="p-3">
                {dayEvents.length > 0 ? (
                  <div className="space-y-2">
                    {dayEvents.map(event => {
                       const style = getStyleForType(event.type);
                       const colorName = style.color.split('-')[1]; 
                       const borderClass = `border-${colorName}-500`;

                       return (
                         <div 
                           key={event.id}
                           onClick={(e) => {
                             e.stopPropagation();
                             onEventClick(event);
                           }}
                           className={`
                             flex items-center p-3 rounded-lg border-l-4 shadow-sm active:opacity-80
                             ${style.bg} ${style.color} ${borderClass}
                           `}
                         >
                            <div className="flex flex-col mr-3 min-w-[3rem] border-r border-black/5 pr-2 items-end">
                              {event.time ? (
                                <span className="font-mono text-xs font-bold">{event.time}</span>
                              ) : (
                                <span className="text-[10px] opacity-60 uppercase tracking-wider">All Day</span>
                              )}
                            </div>
                            <span className="font-medium text-sm leading-tight">{event.title}</span>
                         </div>
                       );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 text-gray-400 gap-2 cursor-pointer hover:text-indigo-500 transition-colors">
                     <Plus size={14} />
                     <span className="text-xs font-medium">无日程</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm pb-8">
        End of Planner &bull; Enjoy your break!
      </div>
    </div>
  );
};

export default Calendar;