import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Account, Transaction, FundPlan } from '../types'
import { generateId } from '../utils/format'

interface StoreState {
  accounts: Account[]
  transactions: Transaction[]
  fundPlans: FundPlan[]

  // 账户操作
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void
  updateAccount: (id: string, account: Partial<Account>) => void
  deleteAccount: (id: string) => void

  // 交易操作
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void
  deleteTransaction: (id: string) => void

  // 基金定投操作
  addFundPlan: (plan: Omit<FundPlan, 'id' | 'createdAt'>) => void
  updateFundPlan: (id: string, plan: Partial<FundPlan>) => void
  deleteFundPlan: (id: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      accounts: [
        {
          id: 'default-bank',
          name: '银行卡',
          type: 'bank',
          balance: 10000,
          icon: '🏦',
          color: '#3B82F6',
          note: '默认账户',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'default-alipay',
          name: '支付宝',
          type: 'alipay',
          balance: 5000,
          icon: '💙',
          color: '#0EA5E9',
          note: '默认账户',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'default-wechat',
          name: '微信零钱',
          type: 'wechat',
          balance: 2000,
          icon: '💚',
          color: '#10B981',
          note: '默认账户',
          createdAt: new Date().toISOString(),
        },
      ],
      transactions: [],
      fundPlans: [],

      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            {
              ...account,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateAccount: (id, account) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...account } : a
          ),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      addTransaction: (transaction) =>
        set((state) => {
          const newTransaction: Transaction = {
            ...transaction,
            id: generateId(),
            createdAt: new Date().toISOString(),
          }

          // 更新账户余额
          const accounts = state.accounts.map((account) => {
            if (account.id === transaction.accountId) {
              if (transaction.type === 'income') {
                return { ...account, balance: account.balance + transaction.amount }
              } else {
                return { ...account, balance: account.balance - transaction.amount }
              }
            }
            return account
          })

          return { transactions: [newTransaction, ...state.transactions], accounts }
        }),

      deleteTransaction: (id) =>
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === id)
          if (!transaction) return state

          // 回滚账户余额
          const accounts = state.accounts.map((account) => {
            if (account.id === transaction.accountId) {
              if (transaction.type === 'income') {
                return { ...account, balance: account.balance - transaction.amount }
              } else {
                return { ...account, balance: account.balance + transaction.amount }
              }
            }
            return account
          })

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts,
          }
        }),

      addFundPlan: (plan) =>
        set((state) => ({
          fundPlans: [
            ...state.fundPlans,
            {
              ...plan,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateFundPlan: (id, plan) =>
        set((state) => ({
          fundPlans: state.fundPlans.map((p) =>
            p.id === id ? { ...p, ...plan } : p
          ),
        })),

      deleteFundPlan: (id) =>
        set((state) => ({
          fundPlans: state.fundPlans.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'expense-tracker-storage',
    }
  )
)
