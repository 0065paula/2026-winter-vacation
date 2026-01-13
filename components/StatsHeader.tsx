import React, { useState, useRef, useEffect } from 'react';
import { CalendarClock, Download, Upload, MoreHorizontal, Calendar as CalendarIcon, Target } from 'lucide-react';
import { getProgressStats } from '../utils';
import { START_DATE_STR, END_DATE_STR } from '../constants';
import { ViewMode } from '../types';

interface StatsHeaderProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ onExport, onImport, currentView, onViewChange }) => {
  const stats = getProgressStats();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          
          {/* Top Row: Logo, Title, Mobile Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <CalendarClock size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">我的寒假全景</h1>
                <p className="text-xs text-gray-500 font-mono">
                  {START_DATE_STR} ~ {END_DATE_STR}
                </p>
              </div>
            </div>

             {/* View Switcher (Desktop) */}
             <div className="hidden md:flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => onViewChange('calendar')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    currentView === 'calendar' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CalendarIcon size={16} />
                  日历视图
                </button>
                <button
                  onClick={() => onViewChange('goals')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    currentView === 'goals' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Target size={16} />
                  目标打卡
                </button>
             </div>


            {/* Mobile Menu Button */}
            <div className="md:hidden relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors active:bg-gray-200"
                    aria-label="更多选项"
                >
                    <MoreHorizontal size={24} />
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                         <button 
                            onClick={() => {
                                onExport();
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 active:bg-gray-100"
                        >
                            <Upload size={18} className="text-gray-400" />
                            导出数据
                        </button>
                        <div className="h-px bg-gray-100 my-0.5"></div>
                        <label className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer active:bg-gray-100">
                            <Download size={18} className="text-gray-400" />
                            导入数据
                            <input 
                                type="file" 
                                accept=".json" 
                                className="hidden" 
                                onClick={(e) => (e.currentTarget.value = '')}
                                onChange={(e) => {
                                    onImport(e);
                                    setIsMenuOpen(false);
                                }}
                            />
                        </label>
                    </div>
                )}
            </div>
          </div>
          
           {/* View Switcher (Mobile) */}
           <div className="md:hidden flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => onViewChange('calendar')}
                  className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === 'calendar' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CalendarIcon size={16} />
                  日历
                </button>
                <button
                  onClick={() => onViewChange('goals')}
                  className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === 'goals' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Target size={16} />
                  打卡
                </button>
             </div>

          {/* Bottom Row: Progress & Desktop Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1 max-w-lg w-full">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                  <span>进度 ({stats.percentage}%)</span>
                  <span>
                    {stats.remainingDays > 0 ? (
                        <>还剩 <span className="text-indigo-600 font-bold">{stats.remainingDays}</span> 天</>
                    ) : (
                        <span className="text-gray-400">假期结束</span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>已过 {stats.passedDays} 天</span>
                  <span>总计 {stats.totalDays} 天</span>
                </div>
              </div>

              {/* Desktop Actions - Hidden on mobile */}
              <div className="hidden md:flex gap-2">
                <button 
                  onClick={onExport}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Upload size={16} />
                  导出
                </button>
                <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                  <Download size={16} />
                  导入
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onClick={(e) => (e.currentTarget.value = '')}
                    onChange={onImport}
                  />
                </label>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsHeader;