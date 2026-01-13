import React, { useMemo, useState, useEffect } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { getAllDaysInRange } from '../utils';
import { Goal, GoalRecords } from '../types';

interface GoalTrackerProps {
  goals: Goal[];
  records: GoalRecords;
  onAddGoal: (title: string) => void;
  onDeleteGoal: (id: string) => void;
  onToggleRecord: (goalId: string, dateStr: string) => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, records, onAddGoal, onDeleteGoal, onToggleRecord }) => {
  const days = useMemo(() => getAllDaysInRange(), []);
  
  // Local state for adding new goal
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  // State for delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Clear confirmation state when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => setConfirmDeleteId(null);
    if (confirmDeleteId) {
        window.addEventListener('click', handleGlobalClick);
    }
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [confirmDeleteId]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalTitle.trim()) {
      onAddGoal(newGoalTitle.trim());
      setNewGoalTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[75vh]">
        
        <div className="overflow-auto flex-1 relative custom-scrollbar">
          <table className="w-full border-collapse">
            
            {/* Header Row */}
            <thead className="bg-gray-50 z-20 sticky top-0">
              <tr>
                {/* Fixed Corner Cell */}
                <th className="sticky left-0 z-30 top-0 bg-gray-50 border-b border-r border-gray-200 w-20 sm:w-32 min-w-[5rem] sm:min-w-[8rem] p-2 sm:p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  日期
                </th>
                
                {/* Goal Columns */}
                {goals.map(goal => (
                  <th key={goal.id} className="min-w-[6rem] p-2 border-b border-gray-200 text-center relative group">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight px-2">
                        {goal.title}
                      </span>
                      
                      {confirmDeleteId === goal.id ? (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteGoal(goal.id);
                                setConfirmDeleteId(null);
                            }}
                            className="mt-1 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap z-50 relative shadow-sm"
                        >
                            确认删除?
                        </button>
                      ) : (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(goal.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-300 hover:text-red-500"
                            title="删除目标"
                        >
                            <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                
                {/* Add Goal Column Header */}
                <th className="min-w-[8rem] p-2 border-b border-gray-200 bg-gray-50">
                    {!isAdding ? (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded-full transition-colors mx-auto"
                        >
                            <Plus size={14} /> 添加目标
                        </button>
                    ) : (
                        <div className="w-32 mx-auto">
                            <span className="text-xs text-gray-400">输入名称...</span>
                        </div>
                    )}
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100">
              {days.map((day) => (
                <tr key={day.dateStr} className={`hover:bg-gray-50 ${day.isToday ? 'bg-indigo-50/30' : ''}`}>
                  
                  {/* Sticky Date Column */}
                  <td className={`
                    sticky left-0 z-10 bg-white border-r border-gray-200 p-2 sm:p-3
                    ${day.isToday ? '!bg-indigo-50' : ''}
                    shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]
                  `}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className={`text-xs font-bold w-5 text-center ${day.isWeekend ? 'text-red-500' : 'text-gray-500'}`}>
                            {day.dayLabel}
                        </span>
                        <span className={`text-sm font-bold ${day.isToday ? 'text-indigo-700' : 'text-gray-900'}`}>
                            {day.date.getMonth() + 1}/{day.date.getDate()}
                        </span>
                      </div>
                      {day.isToday && <span className="text-[10px] text-indigo-600 font-medium mt-0.5 ml-6 sm:ml-7">今天</span>}
                    </div>
                  </td>

                  {/* Checkbox Cells */}
                  {goals.map(goal => {
                    const recordKey = `${goal.id}_${day.dateStr}`;
                    const isDone = !!records[recordKey];
                    return (
                      <td 
                        key={`${goal.id}-${day.dateStr}`} 
                        className="text-center p-0 cursor-pointer"
                        onClick={() => onToggleRecord(goal.id, day.dateStr)}
                      >
                         <div className="w-full h-full py-3 flex items-center justify-center hover:bg-black/5 transition-colors">
                            <div className={`
                                w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-200
                                ${isDone ? 'bg-indigo-500 border-indigo-600 scale-100' : 'bg-white border-gray-300 scale-90'}
                            `}>
                                {isDone && <Check size={16} className="text-white" strokeWidth={3} />}
                            </div>
                         </div>
                      </td>
                    );
                  })}

                  {/* Empty cell for "Add Goal" column alignment */}
                  <td className="bg-gray-50/30 border-l border-dashed border-gray-200"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Goal Floating Form */}
        {isAdding && (
            <div className="absolute top-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in zoom-in-95">
                <h3 className="text-sm font-bold text-gray-900 mb-2">添加新目标</h3>
                <form onSubmit={handleAddSubmit}>
                    <input
                        type="text"
                        autoFocus
                        placeholder="例如: 阅读30分钟"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-3"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            取消
                        </button>
                        <button 
                            type="submit"
                            disabled={!newGoalTitle.trim()}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                        >
                            确认添加
                        </button>
                    </div>
                </form>
            </div>
        )}
      </div>

      <div className="mt-4 text-center">
         <p className="text-xs text-gray-400">
           提示：点击表格中的任意格子即可标记完成或取消。
         </p>
      </div>
    </div>
  );
};

export default GoalTracker;