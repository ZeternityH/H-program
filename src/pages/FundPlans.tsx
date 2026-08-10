import { useState } from 'react'
import { useStore } from '../store/useStore'
import { formatMoney, formatDateDisplay } from '../utils/format'
import { formatDate, isWorkingDay, getWorkingDayForMonth, getNextInvestDate, getInvestDatesInMonth, getDailyInvestDatesInMonth } from '../utils/calendar'
import type { FrequencyType } from '../types'
import Modal from '../components/Modal'
import Calendar from '../components/Calendar'

const WEEKDAYS = ['', '周一', '周二', '周三', '周四', '周五']

export default function FundPlans() {
  const { fundPlans, accounts, transactions, addFundPlan, updateFundPlan, deleteFundPlan } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [previewDate, setPreviewDate] = useState<string | null>(null)

  const [form, setForm] = useState({
    fundName: '',
    fundCode: '',
    amount: '',
    accountId: accounts[0]?.id || '',
    frequency: 'monthly' as FrequencyType,
    investmentDay: 15,
    useWorkingDay: true,
    status: 'active' as 'active' | 'paused',
  })

  const openAdd = () => {
    setEditId(null)
    setForm({
      fundName: '',
      fundCode: '',
      amount: '',
      accountId: accounts[0]?.id || '',
      frequency: 'monthly',
      investmentDay: 15,
      useWorkingDay: true,
      status: 'active',
    })
    setModalOpen(true)
  }

  const openEdit = (id: string) => {
    const plan = fundPlans.find((p) => p.id === id)
    if (!plan) return
    setEditId(id)
    setForm({
      fundName: plan.fundName,
      fundCode: plan.fundCode,
      amount: String(plan.amount),
      accountId: plan.accountId,
      frequency: plan.frequency,
      investmentDay: plan.investmentDay,
      useWorkingDay: plan.useWorkingDay,
      status: plan.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.fundName.trim() || !form.amount) return
    const data = {
      fundName: form.fundName.trim(),
      fundCode: form.fundCode.trim(),
      amount: parseFloat(form.amount),
      accountId: form.accountId,
      frequency: form.frequency,
      investmentDay: form.frequency === 'daily' ? 0 : form.investmentDay,
      useWorkingDay: form.frequency === 'daily' ? true : form.useWorkingDay,
      status: form.status,
    }
    if (editId) {
      updateFundPlan(editId, data)
    } else {
      addFundPlan(data)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定删除该定投计划吗？')) {
      deleteFundPlan(id)
      setModalOpen(false)
    }
  }

  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name || '未知'

  // 获取定投相关的交易记录
  const getPlanTransactions = (planId: string) => {
    return transactions.filter((t) => t.category === '基金定投' && t.note?.includes(planId))
  }

  // 频率显示文字
  const getFrequencyText = (plan: typeof fundPlans[0]) => {
    if (plan.frequency === 'daily') return '每个工作日'
    if (plan.frequency === 'weekly') return `每${WEEKDAYS[plan.investmentDay] || ''}`
    return `每月${plan.investmentDay}日`
  }

  // 频率图标
  const getFrequencyIcon = (freq: FrequencyType) => {
    if (freq === 'daily') return '⚡'
    if (freq === 'weekly') return '📅'
    return '📆'
  }

  // 计算本月扣款次数和总额
  const getMonthlyStats = (plan: typeof fundPlans[0]) => {
    const now = new Date()
    const dates = getInvestDatesInMonth(plan, now.getFullYear(), now.getMonth())
    return { count: dates.length, total: dates.length * plan.amount }
  }

  // 统计所有活跃定投的月度总额
  const totalMonthlyAmount = fundPlans
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => {
      const stats = getMonthlyStats(p)
      return sum + stats.total
    }, 0)

  return (
    <div className="page-transition safe-top min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-white text-lg font-semibold mb-3">基金定投</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5">
            <p className="text-white/70 text-xs">活跃定投</p>
            <p className="text-white text-xl font-bold">{fundPlans.filter((p) => p.status === 'active').length}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2.5">
            <p className="text-white/70 text-xs">月度定投额</p>
            <p className="text-white text-xl font-bold">¥{formatMoney(totalMonthlyAmount)}</p>
          </div>
        </div>
      </div>

      {/* Fund plan list */}
      <div className="px-4 mt-4 space-y-3">
        {fundPlans.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-5xl mb-3">📈</p>
            <p className="text-gray-400 text-sm mb-1">还没有定投计划</p>
            <p className="text-gray-300 text-xs">支持每天/每周/每月定投，工作日智能扣费</p>
          </div>
        ) : (
          fundPlans.map((plan) => {
            const nextDate = getNextInvestDate(plan)
            const isWorkingDayNext = isWorkingDay(nextDate)
            const planTxns = getPlanTransactions(plan.id)
            const totalInvested = planTxns.reduce((sum, t) => sum + t.amount, 0)
            const monthlyStats = getMonthlyStats(plan)

            return (
              <div
                key={plan.id}
                onClick={() => openEdit(plan.id)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                      <span className="text-lg">📈</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-800">{plan.fundName}</p>
                        {plan.status === 'paused' && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-400">已暂停</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{plan.fundCode || '未填写代码'}</p>
                    </div>
                  </div>
                  <span className="text-base font-semibold text-teal-600">¥{formatMoney(plan.amount)}</span>
                </div>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>{getFrequencyIcon(plan.frequency)}</span>
                    <span>{getFrequencyText(plan)}</span>
                    {plan.frequency === 'daily' && (
                      <span className="text-orange-400">（工作日扣费）</span>
                    )}
                    {plan.frequency !== 'daily' && plan.useWorkingDay && (
                      <span className="text-orange-400">（工作日）</span>
                    )}
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>🏦</span>
                    <span>{getAccountName(plan.accountId)}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">下次扣款</span>
                    <span className="text-gray-700 font-medium">{formatDateDisplay(nextDate)}</span>
                    {plan.frequency !== 'daily' && plan.useWorkingDay && !isWorkingDayNext && (
                      <span className="text-red-400">（已顺延）</span>
                    )}
                    {isWorkingDayNext && (
                      <span className="text-green-400">（工作日）</span>
                    )}
                  </div>
                  <span className="text-gray-400">
                    本月{monthlyStats.count}次 · 累计¥{formatMoney(totalInvested)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add button */}
      <div className="px-4 mt-4">
        <button
          onClick={openAdd}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm active:scale-[0.98] transition-transform"
        >
          + 创建定投计划
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '编辑定投计划' : '创建定投计划'}
      >
        <div className="space-y-4">
          {/* Fund name */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">基金名称</label>
            <input
              type="text"
              value={form.fundName}
              onChange={(e) => setForm({ ...form, fundName: e.target.value })}
              placeholder="如：沪深300ETF联接"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Fund code */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">基金代码（可选）</label>
            <input
              type="text"
              value={form.fundCode}
              onChange={(e) => setForm({ ...form, fundCode: e.target.value })}
              placeholder="如：110020"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">定投金额（每次）</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Account selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">扣款账户</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setForm({ ...form, accountId: account.id })}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all ${
                    form.accountId === account.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100'
                  }`}
                >
                  <span>{account.icon}</span>
                  <span className="text-xs text-gray-600">{account.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">定投频率</label>
            <div className="flex gap-2">
              {([
                { value: 'daily', label: '每天', icon: '⚡' },
                { value: 'weekly', label: '每周', icon: '📅' },
                { value: 'monthly', label: '每月', icon: '📆' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({
                    ...form,
                    frequency: opt.value,
                    investmentDay: opt.value === 'weekly' ? 1 : opt.value === 'monthly' ? 15 : 0,
                    useWorkingDay: opt.value === 'daily' ? true : form.useWorkingDay,
                  })}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border-2 transition-all ${
                    form.frequency === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100'
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className={`text-xs ${form.frequency === opt.value ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily frequency info */}
          {form.frequency === 'daily' && (
            <div className="bg-orange-50 rounded-lg px-3 py-3">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 text-sm">💡</span>
                <div>
                  <p className="text-xs text-orange-700 font-medium">每天定投 = 每个工作日扣费</p>
                  <p className="text-[10px] text-orange-500 mt-0.5">
                    系统将自动在日历中的每个工作日进行扣费，节假日和周末不扣费。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Weekly day selector */}
          {form.frequency === 'weekly' && (
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">扣款日（周几）</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((day) => (
                  <button
                    key={day}
                    onClick={() => setForm({ ...form, investmentDay: day })}
                    className={`flex-1 py-2 rounded-lg border-2 text-xs transition-all ${
                      form.investmentDay === day ? 'border-primary-500 bg-primary-50 text-primary-600 font-medium' : 'border-gray-100 text-gray-500'
                    }`}
                  >
                    {WEEKDAYS[day]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly day selector */}
          {form.frequency === 'monthly' && (
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">定投日期（每月几号）</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={form.investmentDay}
                  onChange={(e) => setForm({ ...form, investmentDay: Math.min(31, Math.max(1, parseInt(e.target.value) || 1)) })}
                  className="w-20 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-center focus:outline-none focus:border-primary-400"
                />
                <span className="text-sm text-gray-400">日</span>
              </div>
            </div>
          )}

          {/* Working day toggle (only for weekly and monthly) */}
          {form.frequency !== 'daily' && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-3">
              <div>
                <p className="text-sm text-gray-700 font-medium">工作日定投</p>
                <p className="text-xs text-gray-400 mt-0.5">非工作日自动顺延至下一个工作日</p>
              </div>
              <button
                onClick={() => setForm({ ...form, useWorkingDay: !form.useWorkingDay })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.useWorkingDay ? 'bg-primary-500' : 'bg-gray-300'}`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    form.useWorkingDay ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Preview */}
          {form.frequency === 'monthly' && form.useWorkingDay && form.investmentDay && (
            <div className="bg-teal-50 rounded-lg px-3 py-2.5">
              <p className="text-xs text-teal-600">
                💡 本月{form.investmentDay}日实际扣款日：
                <span className="font-semibold">
                  {getWorkingDayForMonth(new Date().getFullYear(), new Date().getMonth(), form.investmentDay)}
                </span>
              </p>
            </div>
          )}

          {form.frequency === 'weekly' && form.useWorkingDay && (
            <div className="bg-teal-50 rounded-lg px-3 py-2.5">
              <p className="text-xs text-teal-600">
                💡 每{WEEKDAYS[form.investmentDay]}定投，非工作日自动顺延
              </p>
            </div>
          )}

          {/* View calendar button */}
          <button
            onClick={() => setCalendarOpen(true)}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-orange-50 text-orange-500 text-xs active:scale-95 transition-transform"
          >
            <span>📅</span>
            查看工作日日历
          </button>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {editId && (
              <button
                onClick={() => handleDelete(editId)}
                className="px-4 py-2.5 rounded-lg bg-red-50 text-red-500 text-sm font-medium"
              >
                删除
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium active:scale-[0.98] transition-transform"
            >
              {editId ? '保存' : '创建'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Calendar modal for working day preview */}
      <Modal isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} title="工作日日历">
        <div className="mb-3 bg-orange-50 rounded-lg px-3 py-2">
          <p className="text-xs text-orange-600">
            📌 绿色为工作日（可定投），灰色为非工作日。
            {form.frequency === 'daily' && ' 每天定投模式将在所有绿色日期扣费。'}
            {form.frequency !== 'daily' && ' 定投日若为非工作日将自动顺延。'}
          </p>
        </div>
        <Calendar
          selectedDate={previewDate || undefined}
          onlyWorkingDays
          onSelect={(d) => setPreviewDate(d)}
        />
      </Modal>
    </div>
  )
}
