import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types'
import { formatMoney, formatDateDisplay } from '../utils/format'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export default function Statistics() {
  const { transactions, accounts } = useStore()
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')

  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())

  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix))

  const expenseTransactions = monthTransactions.filter((t) => t.type === 'expense' || t.type === 'investment')
  const incomeTransactions = monthTransactions.filter((t) => t.type === 'income')

  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)

  // Category breakdown for pie chart
  const currentCategories = activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const currentTransactions = activeTab === 'expense' ? expenseTransactions : incomeTransactions
  const totalCurrent = activeTab === 'expense' ? totalExpense : totalIncome

  const categoryData = useMemo(() => {
    const data: { name: string; value: number; color: string; icon: string }[] = []
    currentCategories.forEach((cat) => {
      const total = currentTransactions
        .filter((t) => t.category === cat.name)
        .reduce((sum, t) => sum + t.amount, 0)
      if (total > 0) {
        data.push({ name: cat.name, value: total, color: cat.color, icon: cat.icon })
      }
    })
    return data.sort((a, b) => b.value - a.value)
  }, [currentTransactions, currentCategories])

  // Daily bar chart
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const data: { day: string; expense: number; income: number }[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`
      const dayTxns = monthTransactions.filter((t) => t.date === dateStr)
      data.push({
        day: String(day),
        expense: dayTxns.filter((t) => t.type === 'expense' || t.type === 'investment').reduce((sum, t) => sum + t.amount, 0),
        income: dayTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      })
    }
    return data
  }, [monthTransactions, monthPrefix, selectedYear, selectedMonth])

  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name || '未知'

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  return (
    <div className="page-transition safe-top min-h-screen pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-white text-lg font-semibold mb-3">统计</h1>
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center text-white/70">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-white text-base font-semibold">
              {selectedYear}年{months[selectedMonth]}
            </p>
            <div className="flex items-center gap-4 mt-1">
              <div>
                <span className="text-white/60 text-xs">收入 </span>
                <span className="text-white text-sm font-medium">¥{formatMoney(totalIncome)}</span>
              </div>
              <div>
                <span className="text-white/60 text-xs">支出 </span>
                <span className="text-white text-sm font-medium">¥{formatMoney(totalExpense)}</span>
              </div>
            </div>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center text-white/70">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">每日收支</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} barGap={0} barCategoryGap={1}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => `¥${formatMoney(value)}`}
                labelFormatter={(label) => `${selectedMonth + 1}月${label}日`}
              />
              <Bar dataKey="income" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expense" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-primary-500"></div>
              <span className="text-[10px] text-gray-400">收入</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-amber-500"></div>
              <span className="text-[10px] text-gray-400">支出</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category pie chart */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">分类统计</h2>
            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-3 py-1 rounded text-xs font-medium ${activeTab === 'expense' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
              >
                支出
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-3 py-1 rounded text-xs font-medium ${activeTab === 'income' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
              >
                收入
              </button>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-300 text-sm">本月暂无{activeTab === 'expense' ? '支出' : '收入'}记录</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      formatter={(value: number, name: string) => [`${name} ¥${formatMoney(value)}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category list */}
              <div className="space-y-2">
                {categoryData.map((cat) => {
                  const percent = totalCurrent > 0 ? (cat.value / totalCurrent) * 100 : 0
                  return (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-xs text-gray-600 w-16">{cat.name}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${percent}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-gray-700 font-medium">¥{formatMoney(cat.value)}</span>
                        <span className="text-[10px] text-gray-400 w-8 text-right">{percent.toFixed(0)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">
              本月明细 ({monthTransactions.length})
            </h2>
          </div>
          {monthTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-300 text-sm">暂无记录</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {monthTransactions.map((t) => {
                const catList = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
                const catInfo = catList.find((c) => c.name === t.category) || { icon: '📦', color: '#6B7280' }
                const isIncome = t.type === 'income'
                return (
                  <div key={t.id} className="flex items-center justify-between px-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: catInfo.color + '15' }}
                      >
                        <span className="text-sm">{catInfo.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{t.category}</p>
                        <p className="text-[10px] text-gray-400">
                          {formatDateDisplay(t.date)} · {getAccountName(t.accountId)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${isIncome ? 'text-primary-500' : 'text-gray-700'}`}>
                      {isIncome ? '+' : '-'}¥{formatMoney(t.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
