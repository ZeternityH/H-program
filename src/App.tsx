import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Accounts from './pages/Accounts'
import AddTransaction from './pages/AddTransaction'
import FundPlans from './pages/FundPlans'
import Statistics from './pages/Statistics'
import { useStore } from './store/useStore'

export default function App() {
  const executeDueFundPlans = useStore((s) => s.executeDueFundPlans)

  useEffect(() => {
    executeDueFundPlans()
  }, [executeDueFundPlans])

  return (
    <BrowserRouter basename="/H-program">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="add" element={<AddTransaction />} />
          <Route path="fund-plans" element={<FundPlans />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
