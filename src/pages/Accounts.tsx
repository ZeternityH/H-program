import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ACCOUNT_TYPE_CONFIG, type AccountType } from '../types'
import { formatMoney } from '../utils/format'
import Modal from '../components/Modal'

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, transactions } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: 'bank' as AccountType,
    balance: '',
    note: '',
  })

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', type: 'bank', balance: '', note: '' })
    setModalOpen(true)
  }

  const openEdit = (id: string) => {
    const account = accounts.find((a) => a.id === id)
    if (!account) return
    setEditId(id)
    setForm({
      name: account.name,
      type: account.type,
      balance: String(account.balance),
      note: account.note || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const config = ACCOUNT_TYPE_CONFIG[form.type]
    const data = {
      name: form.name.trim(),
      type: form.type,
      balance: parseFloat(form.balance) || 0,
      icon: config.icon,
      color: config.color,
      note: form.note.trim(),
    }
    if (editId) {
      updateAccount(editId, data)
    } else {
      addAccount(data)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    const hasTransactions = transactions.some((t) => t.accountId === id)
    if (hasTransactions) {
      alert('该账户存在交易记录，无法删除')
      return
    }
    if (confirm('确定删除该账户吗？')) {
      deleteAccount(id)
      setModalOpen(false)
    }
  }

  const getTransactionCount = (id: string) =>
    transactions.filter((t) => t.accountId === id).length

  return (
    <div className="page-transition safe-top min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-white text-lg font-semibold mb-3">资金账户</h1>
        <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
          <p className="text-white/70 text-xs">总资产</p>
          <p className="text-white text-2xl font-bold">¥{formatMoney(totalBalance)}</p>
        </div>
      </div>

      {/* Account list */}
      <div className="px-4 mt-4 space-y-3">
        {accounts.map((account) => {
          const config = ACCOUNT_TYPE_CONFIG[account.type]
          const count = getTransactionCount(account.id)
          return (
            <div
              key={account.id}
              onClick={() => openEdit(account.id)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: (config?.color || account.color) + '15' }}
                  >
                    {config?.icon || account.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{account.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: (config?.color || account.color) + '15', color: config?.color || account.color }}
                      >
                        {config?.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{count}笔交易</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-gray-800">¥{formatMoney(account.balance)}</p>
                  {account.note && <p className="text-[10px] text-gray-400 mt-0.5">{account.note}</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add button */}
      <div className="px-4 mt-4">
        <button
          onClick={openAdd}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm active:scale-[0.98] transition-transform"
        >
          + 添加资金账户
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '编辑账户' : '添加账户'}
      >
        <div className="space-y-4">
          {/* Account type selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">账户类型</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ACCOUNT_TYPE_CONFIG) as AccountType[]).map((type) => {
                const config = ACCOUNT_TYPE_CONFIG[type]
                const selected = form.type === type
                return (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, type })}
                    className={`
                      flex flex-col items-center justify-center py-2.5 rounded-lg border-2 transition-all
                      ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-100'}
                    `}
                  >
                    <span className="text-xl mb-0.5">{config.icon}</span>
                    <span className={`text-xs ${selected ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                      {config.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">账户名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：招行储蓄卡"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Balance */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">余额</label>
            <input
              type="number"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">备注（可选）</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="如：日常开销账户"
              className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

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
              {editId ? '保存' : '添加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
