import { useState } from 'react'
import { getCalendarDays, isWorkingDay, getHolidayName, isAdjustedWorkingDay, formatDate } from '../utils/calendar'

interface CalendarProps {
  selectedDate?: string
  onSelect: (date: string) => void
  onlyWorkingDays?: boolean // 是否只能选择工作日
}

export default function Calendar({ selectedDate, onSelect, onlyWorkingDays = false }: CalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const days = getCalendarDays(viewYear, viewMonth)
  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-base font-semibold text-gray-800">
          {viewYear}年{viewMonth + 1}月
        </span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week day header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, i) => (
          <div key={day} className={`text-center text-xs font-medium py-1 ${i >= 5 ? 'text-gray-300' : 'text-gray-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const dateStr = formatDate(date)
          const isCurrentMonth = date.getMonth() === viewMonth
          const working = isWorkingDay(dateStr)
          const holiday = getHolidayName(dateStr)
          const adjusted = isAdjustedWorkingDay(dateStr)
          const isSelected = selectedDate === dateStr
          const isToday = dateStr === formatDate(today)
          const dayOfWeek = date.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          const canSelect = !onlyWorkingDays || working

          return (
            <button
              key={i}
              disabled={!canSelect}
              onClick={() => onSelect(dateStr)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                transition-all
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isSelected ? 'bg-primary-500 text-white font-semibold shadow-md shadow-primary-500/30' : ''}
                ${!isSelected && canSelect ? 'hover:bg-gray-100 active:bg-gray-200' : ''}
                ${!isSelected && working && isCurrentMonth ? 'text-gray-700' : ''}
                ${!isSelected && !working && isCurrentMonth && !onlyWorkingDays ? 'text-gray-300' : ''}
                ${!isSelected && !working && isCurrentMonth && onlyWorkingDays ? 'text-gray-200 bg-gray-50' : ''}
                ${!canSelect ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className={isToday && !isSelected ? 'text-primary-500 font-bold' : ''}>
                {date.getDate()}
              </span>
              {/* Holiday label */}
              {holiday && isCurrentMonth && (
                <span className={`text-[9px] absolute bottom-0.5 ${isSelected ? 'text-white/80' : 'text-red-400'}`}>
                  {holiday.length > 2 ? holiday.slice(0, 2) : holiday}
                </span>
              )}
              {/* Adjusted working day marker */}
              {adjusted && isCurrentMonth && (
                <span className={`text-[9px] absolute top-0.5 ${isSelected ? 'text-white/80' : 'text-orange-400'}`}>
                  班
                </span>
              )}
              {/* Weekend indicator */}
              {isWeekend && !holiday && !adjusted && isCurrentMonth && !isSelected && (
                <span className="text-[9px] absolute bottom-0.5 text-gray-300">
                  休
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary-500"></div>
          <span className="text-xs text-gray-500">已选</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-orange-400 font-medium">班</span>
          <span className="text-xs text-gray-500">调休</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-red-400">假</span>
          <span className="text-xs text-gray-500">法定假日</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-300">休</span>
          <span className="text-xs text-gray-500">周末</span>
        </div>
      </div>
    </div>
  )
}
