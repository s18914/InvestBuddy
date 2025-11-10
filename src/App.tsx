import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import PortfolioUpdate from './pages/PortfolioUpdate'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update" element={<PortfolioUpdate />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
