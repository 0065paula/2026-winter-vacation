import React, { useState, useEffect } from 'react';
import StatsHeader from './components/StatsHeader';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import { CalendarEvent } from './types';
import { STORAGE_KEY } from './constants';
import { formatDateKey } from './utils';

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  
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

  const handleSaveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(prev => {
      // If editing a single event, remove the old one first
      let updated = editingEvent 
        ? prev.filter(e => e.id !== editingEvent.id) 
        : [...prev];
      
      return [...updated, ...newEvents];
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `winter-planner-backup-${formatDateKey(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              setTimeout(() => {
                alert(`成功导入 ${validEvents.length} 个事件！`);
              }, 100);
          } else {
             alert('未在文件中找到有效的事件数据。');
          }
        } else {
          alert('无效的备份文件格式：必须是事件数组');
        }
      } catch (err) {
        console.error(err);
        alert('文件解析失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
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
        onSave={handleSaveEvents}
        onDelete={handleDeleteEvent}
        existingEvent={editingEvent}
      />
    </div>
  );
};

export default App;