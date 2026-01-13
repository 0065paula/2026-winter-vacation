import React, { useState, useEffect } from 'react';
import StatsHeader from './components/StatsHeader';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import GoalTracker from './components/GoalTracker';
import Toast from './components/Toast';
import { CalendarEvent, Goal, GoalRecords, ViewMode } from './types';
import { STORAGE_KEY, STORAGE_KEY_GOALS, STORAGE_KEY_RECORDS } from './constants';
import { formatDateKey } from './utils';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewMode>('calendar');
  
  // Calendar Data
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Goals Data
  const [goals, setGoals] = useState<Goal[]>([]);
  const [records, setRecords] = useState<GoalRecords>({});

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // --- Initialization ---
  useEffect(() => {
    // 1. Events
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) { console.error("Failed to parse events", e); }
    } else {
        setEvents([{
            id: 'init-1',
            title: '寒假开始！',
            date: '2026-01-19',
            type: 'fun',
            time: '08:00'
        }]);
    }

    // 2. Goals
    const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);
    if (savedGoals) {
        try { setGoals(JSON.parse(savedGoals)); } catch (e) { console.error(e); }
    } else {
        // Default goals example
        setGoals([
            { id: 'g1', title: '早睡早起', color: 'blue' },
            { id: 'g2', title: '阅读', color: 'indigo' }
        ]);
    }

    // 3. Records
    const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (savedRecords) {
        try { setRecords(JSON.parse(savedRecords)); } catch (e) { console.error(e); }
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    if (events.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }, [records]);


  // --- Calendar Handlers ---
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

  const handleSaveEvents = (newEvents: CalendarEvent[], idsToRemove?: string[]) => {
    setEvents(prev => {
      let updated = [...prev];
      if (idsToRemove && idsToRemove.length > 0) {
        updated = updated.filter(e => !idsToRemove.includes(e.id));
      } else if (editingEvent) {
        updated = updated.filter(e => e.id !== editingEvent.id);
      }
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

  // --- Goal Handlers ---
  const handleAddGoal = (title: string) => {
    const newGoal: Goal = {
        id: Date.now().toString(),
        title,
        color: 'indigo'
    };
    setGoals(prev => [...prev, newGoal]);
    setToast({ message: '目标添加成功', type: 'success' });
  };

  const handleDeleteGoal = (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
      // Cleanup records for this goal
      setRecords(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
              if (key.startsWith(id + '_')) delete next[key];
          });
          return next;
      });
  };

  const handleToggleRecord = (goalId: string, dateStr: string) => {
      const key = `${goalId}_${dateStr}`;
      setRecords(prev => ({
          ...prev,
          [key]: !prev[key]
      }));
  };

  // --- Import / Export ---
  const handleExport = () => {
    // New export format: Object containing all data
    const exportData = {
        version: 2,
        events,
        goals,
        records
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `winter-planner-export-${formatDateKey(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: '导出成功 (包含日程和打卡)', type: 'success' });
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
        
        let importedEventsCount = 0;
        let importedGoalsCount = 0;

        // Compatibility Check
        // Case 1: Old Format (Array of events)
        if (Array.isArray(json)) {
            const validEvents = validateEvents(json);
            if (validEvents.length > 0) {
                setEvents(validEvents);
                importedEventsCount = validEvents.length;
            }
        } 
        // Case 2: New Format (Object)
        else if (typeof json === 'object' && json !== null) {
            // Import Events
            if (json.events && Array.isArray(json.events)) {
                const validEvents = validateEvents(json.events);
                setEvents(validEvents);
                importedEventsCount = validEvents.length;
            }
            // Import Goals
            if (json.goals && Array.isArray(json.goals)) {
                setGoals(json.goals);
                importedGoalsCount = json.goals.length;
            }
            // Import Records
            if (json.records && typeof json.records === 'object') {
                setRecords(json.records);
            }
        }

        if (importedEventsCount > 0 || importedGoalsCount > 0) {
            setToast({ message: `导入成功: ${importedEventsCount}个日程, ${importedGoalsCount}个目标`, type: 'success' });
        } else {
            setToast({ message: '未找到有效数据', type: 'error' });
        }

      } catch (err) {
        console.error(err);
        setToast({ message: '文件解析失败', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const validateEvents = (list: any[]): CalendarEvent[] => {
      return list.filter((item: any) => {
        return item && typeof item.date === 'string' && typeof item.title === 'string';
     }).map((item: any) => ({
        id: item.id || Date.now().toString() + Math.random().toString().slice(2),
        title: item.title,
        date: item.date.trim(),
        type: item.type || 'other',
        time: item.time || ''
     }));
  }

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
        currentView={view}
        onViewChange={setView}
      />

      <main>
        {view === 'calendar' ? (
            <Calendar 
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
        ) : (
            <GoalTracker 
                goals={goals}
                records={records}
                onAddGoal={handleAddGoal}
                onDeleteGoal={handleDeleteGoal}
                onToggleRecord={handleToggleRecord}
            />
        )}
      </main>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedDate}
        events={events}
        onSave={handleSaveEvents}
        onDelete={handleDeleteEvent}
        existingEvent={editingEvent}
      />
    </div>
  );
};

export default App;