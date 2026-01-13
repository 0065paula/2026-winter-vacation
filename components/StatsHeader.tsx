import React from 'react';
import { CalendarClock, Download, Upload } from 'lucide-react';
import { getProgressStats } from '../utils';
import { START_DATE_STR, END_DATE_STR } from '../constants';

interface StatsHeaderProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ onExport, onImport }) => {
  const stats = getProgressStats();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <CalendarClock size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">怪怪的寒假全景计划</h1>
              <p className="text-xs text-gray-500 font-mono">
                {START_DATE_STR} ~ {END_DATE_STR}
              </p>
            </div>
          </div>

          {/* Progress Dashboard */}
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

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              备份
            </button>
            <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 cursor-pointer transition-colors">
              <Upload size={16} />
              恢复
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
  );
};

export default StatsHeader;