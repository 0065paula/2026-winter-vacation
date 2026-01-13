import React, { useState, useEffect } from 'react';
import StatsHeader from './components/StatsHeader';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import Toast from './components/Toast';
import { CalendarEvent } from './types';
import { STORAGE_KEY } from './constants';
import { formatDateKey } from './utils';

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEvents(parsed);
      } catch (e) {
        console.error("Failed to parse events", e);
      }
    } else {
        setEvents([{
            id: 'init-1',
            title: '寒假开始！',
            date: '2026-01-19',
            type: 'fun',
            time: '08:00'
        }]);
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (events.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events]);

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Supports batch update/removal. 
  // idsToRemove: optional array of IDs to remove before adding newEvents.
  const handleSaveEvents = (newEvents: CalendarEvent[], idsToRemove?: string[]) => {
    setEvents(prev => {
      let updated = [...prev];

      // 1. Remove specific IDs (for batch updates or single edits)
      if (idsToRemove && idsToRemove.length > 0) {
        updated = updated.filter(e => !idsToRemove.includes(e.id));
      } 
      // Fallback: if no explicit list but editing single event, remove that one
      else if (editingEvent) {
        updated = updated.filter(e => e.id !== editingEvent.id);
      }

      // 2. Add new/updated events
      updated = [...updated, ...newEvents];
      
      return updated;
    });

    if (idsToRemove && idsToRemove.length > 1) {
        setToast({ message: `成功更新了 ${newEvents.length} 个相关活动`, type: 'success' });
    }
  };

  const handleDeleteEvent = (eventIdOrIds: string | string[]) => {
    setEvents(prev => {
      if (Array.isArray(eventIdOrIds)) {
        return prev.filter(e => !eventIdOrIds.includes(e.id));
      }
      return prev.filter(e => e.id !== eventIdOrIds);
    });
    
    if (Array.isArray(eventIdOrIds) && eventIdOrIds.length > 1) {
        setToast({ message: '已删除系列中的所有活动', type: 'success' });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `winter-planner-export-${formatDateKey(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: '导出成功', type: 'success' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const resultStr = event.target?.result as string;
        if (!resultStr) return;
        
        const json = JSON.parse(resultStr);
        if (Array.isArray(json)) {
          // Validate and sanitization
          const validEvents: CalendarEvent[] = json.filter((item: any) => {
             return item && typeof item.date === 'string' && typeof item.title === 'string';
          }).map((item: any) => ({
             id: item.id || Date.now().toString() + Math.random().toString().slice(2),
             title: item.title,
             date: item.date.trim(), // Remove potential whitespace
             type: item.type || 'other',
             time: item.time || ''
          }));

          if (validEvents.length > 0) {
              setEvents(validEvents);
              setToast({ message: `成功导入 ${validEvents.length} 个事件！`, type: 'success' });
          } else {
             setToast({ message: '未在文件中找到有效的事件数据。', type: 'error' });
          }
        } else {
          setToast({ message: '无效的文件格式：必须是事件数组', type: 'error' });
        }
      } catch (err) {
        console.error(err);
        setToast({ message: '文件解析失败，请检查文件格式', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <StatsHeader 
        onExport={handleExport}
        onImport={handleImport}
      />

      <main>
        <Calendar 
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </main>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedDate}
        events={events} // Pass full list for series detection
        onSave={handleSaveEvents}
        onDelete={handleDeleteEvent}
        existingEvent={editingEvent}
      />
    </div>
  );
};

export default App;