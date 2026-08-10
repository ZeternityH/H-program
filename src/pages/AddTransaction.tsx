import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type TransactionType } from '../types'
import { formatDate } from '../utils/calendar'
import { formatMoney } from '../utils/format'
import Modal from '../components/Modal'
import Calendar from '../components/Calendar'

export default function AddTransaction() {
  const navigate = useNavigate()
  const { accounts, addTransaction } = useStore()

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [accountId, setAccountId] = useState(accounts[0]?.id || '')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(formatDate(new Date()))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return
    if (!category) return
    if (!accountId) return

    addTransaction({
      type,
      amount: numAmount,
      category,
      accountId,
      note: note.trim(),
      date,
    })

    navigate('/')
  }

  const selectedAccount = accounts.find((a) => a.id === accountId)

  return (
    <div className="page-transition safe-top min-h-screen">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/')} className="text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-gray-800">记一笔</h1>
          <div className="w-6" />
        </div>
        {/* Type switch */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => { setType('expense'); setCategory('') }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'expense' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
          >
            支出
          </button>
          <button
            onClick={() => { setType('income'); setCategory('') }}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'income' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
          >
            收入
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Amount input */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50 mb-4">
          <p className="text-xs text-gray-400 mb-1">金额</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl text-gray-700">¥</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d.]/g, '')
                const parts = val.split('.')
                if (parts.length > 2) return
                if (parts[1] && parts[1].length > 2) return
                setAmount(val)
              }}
              placeholder="0"
              autoFocus
              className="text-4xl font-bold bg-transparent focus:outline-none w-full text-gray-800 placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Category selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 mb-4">
          <p className="text-xs text-gray-500 mb-3">选择分类</p>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => {
              const selected = category === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all"
                    style={{
                      backgroundColor: selected ? cat.color : cat.color + '15',
                      transform: selected ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <span style={{ filter: selected ? 'grayscale(0) brightness(2)' : 'none' }}>{cat.icon}</span>
                  </div>
                  <span className={`text-[10px] ${selected ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Account & Date selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-50 mb-4 overflow-hidden">
          <button
            onClick={() => setAccountModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedAccount?.icon || '💳'}</span>
              <span className="text-sm text-gray-700">资金账户</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">{selectedAccount?.name || '请选择'}</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          <button
            onClick={() => setCalendarOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span className="text-sm text-gray-700">日期</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">{date}</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Note */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 mb-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注..."
            className="w-full text-sm text-gray-700 focus:outline-none placeholder:text-gray-300"
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!amount || !category || !accountId}
          className="w-full py-3.5 rounded-xl bg-primary-500 text-white text-base font-medium active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
        >
          确认{type === 'expense' ? '支出' : '收入'}
        </button>
      </div>

      {/* Account picker modal */}
      <Modal isOpen={accountModalOpen} onClose={() => setAccountModalOpen(false)} title="选择资金账户">
        <div className="space-y-2">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => {
                setAccountId(account.id)
                setAccountModalOpen(false)
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                accountId === account.id ? 'border-primary-500 bg-primary-50' : 'border-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{account.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">{account.name}</p>
                  <p className="text-xs text-gray-400">¥{formatMoney(account.balance)}</p>
                </div>
              </div>
              {accountId === account.id && (
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Calendar modal */}
      <Modal isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} title="选择日期">
        <Calendar
          selectedDate={date}
          onSelect={(d) => {
            setDate(d)
            setCalendarOpen(false)
          }}
        />
      </Modal>
    </div>
  )
}
