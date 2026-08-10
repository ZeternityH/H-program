import { HOLIDAYS, ADJUSTED_WORKING_DAYS } from './holidays'

// 格式化日期为 YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 判断是否为工作日
export function isWorkingDay(dateStr: string): boolean {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() // 0=周日, 6=周六

  // 先检查是否为调休上班日（周末但需要上班）
  if (ADJUSTED_WORKING_DAYS.includes(dateStr)) {
    return true
  }

  // 检查是否为法定节假日
  if (HOLIDAYS[dateStr]) {
    return false
  }

  // 周末
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }

  return true
}

// 获取节假日名称（如果当天是节假日）
export function getHolidayName(dateStr: string): string | null {
  return HOLIDAYS[dateStr] || null
}

// 判断是否为调休日
export function isAdjustedWorkingDay(dateStr: string): boolean {
  return ADJUSTED_WORKING_DAYS.includes(dateStr)
}

// 获取某月中第N个工作日的日期
// 例如：每月15号定投，如果15号不是工作日，顺延到下一个工作日
export function getWorkingDayForMonth(year: number, month: number, day: number): string {
  const targetDate = new Date(year, month, day)
  let dateStr = formatDate(targetDate)

  // 如果不是工作日，顺延到下一个工作日
  while (!isWorkingDay(dateStr)) {
    targetDate.setDate(targetDate.getDate() + 1)
    dateStr = formatDate(targetDate)
  }

  return dateStr
}

// 获取日历月份数据（6行7列）
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  // 周一为一周的第一天
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  startDate.setDate(startDate.getDate() - firstDayOfWeek)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push(date)
  }

  return days
}

// 获取某月的所有工作日
export function getWorkingDaysInMonth(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const workingDays: string[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(year, month, day))
    if (isWorkingDay(dateStr)) {
      workingDays.push(dateStr)
    }
  }

  return workingDays
}
