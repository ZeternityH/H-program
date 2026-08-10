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

// 获取从指定日期开始的下一个工作日
export function getNextWorkingDay(dateStr: string): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + 1)
  let result = formatDate(date)
  while (!isWorkingDay(result)) {
    date.setDate(date.getDate() + 1)
    result = formatDate(date)
  }
  return result
}

// 获取今天日期字符串
export function getToday(): string {
  return formatDate(new Date())
}

// 判断两个日期字符串是否为同一天
export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 === dateStr2
}

// 判断给定日期是否 <= 今天
export function isTodayOrBefore(dateStr: string): boolean {
  return dateStr <= getToday()
}

// 获取每周定投的下次扣款日
// weekDay: 1=周一 2=周二 ... 5=周五
export function getNextWeeklyInvestDate(weekDay: number, useWorkingDay: boolean): string {
  const today = new Date()
  const todayDay = today.getDay() // 0=周日, 1=周一...
  const todayStr = formatDate(today)

  // 计算到下一个目标工作日的天数差
  let diff = weekDay - todayDay
  if (diff <= 0) diff += 7 // 如果今天已过或就是今天但已过扣款时间，找下周

  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + diff)
  let targetStr = formatDate(targetDate)

  if (useWorkingDay && !isWorkingDay(targetStr)) {
    // 顺延到下一个工作日
    while (!isWorkingDay(targetStr)) {
      targetDate.setDate(targetDate.getDate() + 1)
      targetStr = formatDate(targetDate)
    }
  }

  return targetStr
}

// 获取每天定投的下次扣款日（即下一个工作日）
export function getNextDailyInvestDate(): string {
  const todayStr = getToday()
  if (isWorkingDay(todayStr)) {
    return todayStr
  }
  return getNextWorkingDay(todayStr)
}

// 获取定投计划的下次扣款日（统一入口）
export function getNextInvestDate(plan: {
  frequency: 'daily' | 'weekly' | 'monthly'
  investmentDay: number
  useWorkingDay: boolean
}): string {
  if (plan.frequency === 'daily') {
    return getNextDailyInvestDate()
  }
  if (plan.frequency === 'weekly') {
    return getNextWeeklyInvestDate(plan.investmentDay, plan.useWorkingDay)
  }
  // monthly
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()
  const day = plan.investmentDay

  // 如果本月该日还没到，用本月；否则用下月
  const thisMonthDate = new Date(year, month, day)
  if (thisMonthDate < now) {
    month++
    if (month > 11) { month = 0; year++ }
  }

  if (plan.useWorkingDay) {
    return getWorkingDayForMonth(year, month, day)
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return formatDate(new Date(year, month, Math.min(day, daysInMonth)))
}

// 获取每天定投在某个月份的所有扣款日（即该月所有工作日）
export function getDailyInvestDatesInMonth(year: number, month: number): string[] {
  return getWorkingDaysInMonth(year, month)
}

// 获取每周定投在某个月份的所有扣款日
export function getWeeklyInvestDatesInMonth(year: number, month: number, weekDay: number, useWorkingDay: boolean): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dates: string[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    if (date.getDay() === weekDay) {
      let dateStr = formatDate(date)
      if (useWorkingDay && !isWorkingDay(dateStr)) {
        dateStr = getWorkingDayForMonth(year, month, day)
      }
      if (!dates.includes(dateStr)) {
        dates.push(dateStr)
      }
    }
  }

  return dates
}

// 获取定投计划在某月的所有扣款日
export function getInvestDatesInMonth(plan: {
  frequency: 'daily' | 'weekly' | 'monthly'
  investmentDay: number
  useWorkingDay: boolean
}, year: number, month: number): string[] {
  if (plan.frequency === 'daily') {
    return getDailyInvestDatesInMonth(year, month)
  }
  if (plan.frequency === 'weekly') {
    return getWeeklyInvestDatesInMonth(year, month, plan.investmentDay, plan.useWorkingDay)
  }
  // monthly
  const day = plan.investmentDay
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const actualDay = Math.min(day, daysInMonth)
  if (plan.useWorkingDay) {
    return [getWorkingDayForMonth(year, month, actualDay)]
  }
  return [formatDate(new Date(year, month, actualDay))]
}
