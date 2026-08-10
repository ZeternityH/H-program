// 账户类型
export type AccountType = 'bank' | 'alipay' | 'wechat' | 'cash' | 'fund' | 'other'

// 交易类型
export type TransactionType = 'income' | 'expense' | 'investment'

// 资金账户
export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  icon: string
  color: string
  note?: string
  createdAt: string
}

// 交易记录
export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  accountId: string
  note?: string
  date: string // YYYY-MM-DD
  createdAt: string
}

// 定投频率
export type FrequencyType = 'daily' | 'weekly' | 'monthly'

// 基金定投计划
export interface FundPlan {
  id: string
  fundName: string
  fundCode: string
  amount: number
  accountId: string
  frequency: FrequencyType // 每天/每周/每月
  investmentDay: number // 每月几号(1-31) 或 每周几(1-5, 1=周一)；daily 模式下忽略此字段
  useWorkingDay: boolean // 非工作日顺延到下一个工作日（daily 模式强制为 true）
  status: 'active' | 'paused'
  lastExecutedDate?: string // 最后一次执行扣费的日期 (YYYY-MM-DD)，防止同一天重复扣费
  createdAt: string
}

// 支出分类
export const EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: '🍚', color: '#F59E0B' },
  { name: '交通', icon: '🚇', color: '#3B82F6' },
  { name: '购物', icon: '🛒', color: '#EC4899' },
  { name: '住房', icon: '🏠', color: '#8B5CF6' },
  { name: '娱乐', icon: '🎮', color: '#10B981' },
  { name: '医疗', icon: '💊', color: '#EF4444' },
  { name: '教育', icon: '📚', color: '#6366F1' },
  { name: '基金定投', icon: '📈', color: '#14B8A6' },
  { name: '其他', icon: '📦', color: '#6B7280' },
]

// 收入分类
export const INCOME_CATEGORIES = [
  { name: '工资', icon: '💰', color: '#10B981' },
  { name: '奖金', icon: '🎁', color: '#F59E0B' },
  { name: '理财收益', icon: '📊', color: '#3B82F6' },
  { name: '基金赎回', icon: '📉', color: '#14B8A6' },
  { name: '兼职', icon: '💼', color: '#8B5CF6' },
  { name: '其他', icon: '📦', color: '#6B7280' },
]

// 账户类型配置
export const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; icon: string; color: string }> = {
  bank: { label: '银行卡', icon: '🏦', color: '#3B82F6' },
  alipay: { label: '支付宝', icon: '💙', color: '#0EA5E9' },
  wechat: { label: '微信', icon: '💚', color: '#10B981' },
  cash: { label: '现金', icon: '💵', color: '#F59E0B' },
  fund: { label: '基金账户', icon: '📈', color: '#14B8A6' },
  other: { label: '其他', icon: '📇', color: '#6B7280' },
}
