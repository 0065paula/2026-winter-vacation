import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, Type, Repeat, Trash2, ChevronDown, Check, Layers } from 'lucide-react';
import { CalendarEvent, EventType, RepeatMode, EVENT_TYPES } from '../types';
import { parseDate, formatDateKey } from '../utils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string;
  events: CalendarEvent[]; // Needed to find related series events
  onSave: (events: CalendarEvent[], idsToRemove?: string[]) => void;
  onDelete?: (eventId: string | string[]) => void;
  existingEvent?: CalendarEvent;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, onClose, initialDate, events, onSave, onDelete, existingEvent 
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<EventType>('study');
  const [mode, setMode] = useState<RepeatMode>('single');
  const [endDate, setEndDate] = useState('');
  const [interval, setInterval] = useState(2);
  
  // Series editing state
  const [applyToSeries, setApplyToSeries] = useState(false);

  // Identify related events in the same series
  const relatedEvents = useMemo(() => {
    if (!existingEvent) return [];
    // Assuming series IDs are formatted like "baseId-timestamp"
    // Single events are just "baseId"
    const baseId = existingEvent.id.split('-')[0];
    // Find all events starting with this baseId
    return events.filter(e => e.id.startsWith(baseId + '-') || e.id === baseId);
  }, [existingEvent, events]);

  const isSeries = relatedEvents.length > 1;

  // Reset or Load state when opening
  useEffect(() => {
    if (isOpen) {
      if (existingEvent) {
        setTitle(existingEvent.title);
        setTime(existingEvent.time || '');
        setType(existingEvent.type);
        setMode('single'); 
        setEndDate('');
        setApplyToSeries(false); // Default to single edit
      } else {
        setTitle('');
        setTime('');
        setType('study');
        setMode('single');
        setEndDate(initialDate);
        setApplyToSeries(false);
      }
    }
  }, [isOpen, existingEvent, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // A. Editing an Existing Event
    if (existingEvent) {
        if (isSeries && applyToSeries) {
            // Edit ALL related events
            // We create new objects for all related events with updated props, but keep their original dates/IDs
            const updatedEvents = relatedEvents.map(ev => ({
                ...ev,
                title,
                time,
                type
            }));
            const idsToRemove = relatedEvents.map(e => e.id);
            onSave(updatedEvents, idsToRemove);
        } else {
            // Edit ONLY current event
            const updatedEvent = {
                ...existingEvent,
                title,
                time,
                type,
                // date remains same
            };
            onSave([updatedEvent], [existingEvent.id]);
        }
    } 
    // B. Creating New Event(s)
    else {
        const newEvents: CalendarEvent[] = [];
        const baseId = Date.now().toString();
        const startDateObj = parseDate(initialDate);
        const endDateObj = parseDate(endDate || initialDate);

        if (mode === 'single') {
            newEvents.push({
                id: baseId,
                title,
                time,
                type,
                date: initialDate
            });
        } else if (mode === 'range') {
            const current = new Date(startDateObj);
            while (current <= endDateObj) {
                newEvents.push({
                    id: `${baseId}-${current.getTime()}`,
                    title,
                    time,
                    type,
                    date: formatDateKey(current)
                });
                current.setDate(current.getDate() + 1);
            }
        } else {
            const current = new Date(startDateObj);
            let step = 1;
            if (mode === 'weekly') step = 7;
            if (mode === 'custom') step = interval;

            while (current <= endDateObj) {
                newEvents.push({
                    id: `${baseId}-${current.getTime()}`,
                    title,
                    time,
                    type,
                    date: formatDateKey(current)
                });
                current.setDate(current.getDate() + step);
            }
        }
        onSave(newEvents);
    }
    onClose();
  };

  const handleDelete = () => {
      if (!onDelete || !existingEvent) return;
      
      if (isSeries && applyToSeries) {
          // Delete all
          onDelete(relatedEvents.map(e => e.id));
      } else {
          // Delete one
          onDelete(existingEvent.id);
      }
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity pointer-events-auto" 
          onClick={onClose}
        ></div>

        {/* Modal Panel */}
        <div className="
            w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl 
            transform transition-transform duration-300 ease-out max-h-[90vh] flex flex-col
            pointer-events-auto animate-in slide-in-from-bottom-5 fade-in
        ">
          
          {/* Mobile Handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full opacity-60"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-xl font-bold text-gray-900">
                  {existingEvent ? '编辑活动' : '添加活动'}
                </h3>
                <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={24} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">标题</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                    placeholder="要做什么？"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Time & Type Row (Stack on mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Clock size={16} className="text-gray-400"/> 时间 <span className="text-gray-400 font-normal text-xs">(可选)</span>
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                      placeholder="例如: 14:00"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                  
                  {/* Type Selector with Custom Arrow */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Type size={16} className="text-gray-400"/> 类型
                    </label>
                    <div className="relative">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as EventType)}
                        className="block w-full appearance-none rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 pl-4 pr-10 bg-gray-50 focus:bg-white transition-colors text-base"
                      >
                        {EVENT_TYPES.map(t => (
                          <option key={t.type} value={t.type}>{t.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Series Edit Checkbox */}
                {existingEvent && isSeries && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                        <div className="p-1 bg-amber-100 rounded text-amber-600 mt-0.5">
                            <Layers size={16} />
                        </div>
                        <div className="flex-1">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={applyToSeries}
                                    onChange={(e) => setApplyToSeries(e.target.checked)}
                                    className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <span className="text-sm font-medium text-amber-900">
                                    同时应用到该系列的其它 {relatedEvents.length - 1} 个活动
                                </span>
                            </label>
                            <p className="text-xs text-amber-700 mt-1 ml-8 leading-relaxed">
                                勾选后，修改内容（标题/时间/类型）或删除操作将影响整个系列，但日期保持不变。
                            </p>
                        </div>
                    </div>
                )}

                {/* Repeat Mode (Only for New Events) */}
                {!existingEvent && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                      <Repeat size={16} className="text-gray-500"/> 重复设置
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      {['single', 'range', 'daily', 'weekly', 'custom'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMode(m as RepeatMode)}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${mode === m 
                              ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' 
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}
                          `}
                        >
                          {m === 'single' && '单次'}
                          {m === 'range' && '连续'}
                          {m === 'daily' && '每天'}
                          {m === 'weekly' && '每周'}
                          {m === 'custom' && '自定义'}
                        </button>
                      ))}
                    </div>

                    {mode !== 'single' && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">截止日期</label>
                            <input
                              type="date"
                              required
                              min={initialDate}
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 text-sm"
                            />
                          </div>
                          {mode === 'custom' && (
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">间隔天数</label>
                              <input
                                type="number"
                                min="2"
                                value={interval}
                                onChange={(e) => setInterval(Number(e.target.value))}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Sticky/Fixed Footer Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl sm:flex sm:flex-row-reverse sm:items-center gap-3 flex-shrink-0 safe-area-bottom">
               <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                 {existingEvent && onDelete ? (
                   <button
                     type="button"
                     onClick={handleDelete}
                     className="w-full sm:w-auto flex justify-center items-center py-3.5 px-6 rounded-xl text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                   >
                     <Trash2 size={18} className="mr-2"/> 
                     {applyToSeries ? '删除全部' : '删除'}
                   </button>
                 ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto flex justify-center items-center py-3.5 px-6 border border-gray-300 rounded-xl text-base font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                 )}
                 
                 <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center items-center py-3.5 px-6 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-[0.98] transition-transform"
                >
                  <Check size={20} className="mr-2 sm:hidden"/> 
                  {existingEvent && applyToSeries ? '更新全部' : '保存'}
                </button>
               </div>
            </div>
          </form>
        </div>
    </div>
  );
};

export default EventModal;