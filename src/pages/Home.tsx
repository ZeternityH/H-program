import { useStore } from '../store/useStore'
import { formatMoney, formatDateDisplay } from '../utils/format'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNT_TYPE_CONFIG } from '../types'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Home() {
  const { accounts, transactions, fundPlans } = useStore()
  const navigate = useNavigate()
  const [showAccountDetail, setShowAccountDetail] = useState(false)

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  // 本月数据
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`

  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix))
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthExpense = monthTransactions
    .filter((t) => t.type === 'expense' || t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0)

  const recentTransactions = transactions.slice(0, 10)
  const activeFundPlans = fundPlans.filter((p) => p.status === 'active')

  const getCategoryInfo = (type: string, category: string) => {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    return list.find((c) => c.name === category) || { icon: '📦', color: '#6B7280' }
  }

  const getAccountName = (id: string) => {
    const account = accounts.find((a) => a.id === id)
    return account ? account.name : '未知账户'
  }

  return (
    <div className="page-transition safe-top">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-5 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white text-lg font-semibold">日常记账</h1>
          <span className="text-white/70 text-sm">
            {year}年{month + 1}月
          </span>
        </div>
        <div className="mt-4">
          <p className="text-white/70 text-xs">总资产</p>
          <p className="text-white text-3xl font-bold tracking-tight">
            ¥{formatMoney(totalBalance)}
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
            <p className="text-white/70 text-xs">本月收入</p>
            <p className="text-white text-base font-semibold">+¥{formatMoney(monthIncome)}</p>
          </div>
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
            <p className="text-white/70 text-xs">本月支出</p>
            <p className="text-white text-base font-semibold">-¥{formatMoney(monthExpense)}</p>
          </div>
        </div>
      </div>

      {/* 账户概览 */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">资金账户</h2>
          <button onClick={() => navigate('/accounts')} className="text-xs text-primary-500">
            查看全部 →
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {accounts.map((account) => {
            const config = ACCOUNT_TYPE_CONFIG[account.type]
            return (
              <div
                key={account.id}
                className="flex-shrink-0 w-32 bg-white rounded-xl p-3 shadow-sm border border-gray-50"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-lg">{config?.icon || account.icon}</span>
                  <span className="text-xs text-gray-500 truncate">{account.name}</span>
                </div>
                <p className="text-base font-semibold text-gray-800">
                  ¥{formatMoney(account.balance)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{config?.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 基金定投概览 */}
      {activeFundPlans.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">基金定投</h2>
            <button onClick={() => navigate('/fund-plans')} className="text-xs text-primary-500">
              管理定投 →
            </button>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-50">
            {activeFundPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <span className="text-sm">📈</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{plan.fundName}</p>
                    <p className="text-[10px] text-gray-400">{plan.fundCode} · 每月{plan.investmentDay}日</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-teal-600">¥{formatMoney(plan.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近交易 */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">最近交易</h2>
          <button onClick={() => navigate('/statistics')} className="text-xs text-primary-500">
            查看统计 →
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-300 text-sm">暂无交易记录</p>
              <button
                onClick={() => navigate('/add')}
                className="mt-2 text-xs text-primary-500"
              >
                点击记一笔 →
              </button>
            </div>
          ) : (
            recentTransactions.map((t) => {
              const catInfo = getCategoryInfo(t.type, t.category)
              const isIncome = t.type === 'income'
              return (
                <div key={t.id} className="flex items-center justify-between px-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: catInfo.color + '15' }}
                    >
                      <span className="text-base">{catInfo.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t.category}</p>
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
            })
          )}
        </div>
      </div>
    </div>
  )
}
