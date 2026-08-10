# 日常记账 App

一款支持 PWA 的日常记账应用，支持资金多账户管理、基金定投计划和工作日日历。

## 功能

- **资金账户管理**：支持银行卡、支付宝、微信、现金、基金等多种账户类型，带图标和颜色标识
- **日常记账**：收入/支出记录，分类管理，关联资金账户
- **基金定投**：创建定投计划，定投日期结合中国法定节假日和调休工作日自动计算
- **工作日日历**：可视化日历显示工作日、周末、法定节假日和调休日
- **统计概览**：月度收支统计，分类饼图，每日柱状图
- **PWA 离线支持**：可添加到 iOS 主屏幕，离线使用

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- Zustand (状态管理 + localStorage 持久化)
- Recharts (图表)
- PWA (Service Worker + Web App Manifest)

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## iOS 安装

1. 在 iPhone Safari 中打开部署后的 URL
2. 点击分享按钮 → 添加到主屏幕
3. 即可像原生 App 一样使用

## GitHub Pages 部署

项目已配置 GitHub Actions 自动部署，推送到 main 分支后会自动构建并部署到 GitHub Pages。
