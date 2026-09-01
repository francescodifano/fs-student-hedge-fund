import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Research from './pages/Research'
import Newsroom from './pages/Newsroom'
import Social from './pages/Social'
import DepartmentPage from './pages/DepartmentPage'
import IndexConstruction from './pages/IndexConstruction'
import HedgeFund from './pages/HedgeFund'
import Imprint from './pages/Imprint'
import Applications from './pages/Applications'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="about" element={<About />} />
        <Route path="research" element={<Research />} />
        <Route path="newsroom" element={<Newsroom />} />
        <Route path="social" element={<Social />} />

        {/* Departments (shared template) */}
        <Route path="index-construction" element={<IndexConstruction />} />
        <Route path="hedge-fund" element={<HedgeFund />} />
        <Route path="derivatives" element={<DepartmentPage slug="derivatives" />} />
        <Route path="quant" element={<DepartmentPage slug="quant" />} />

        {/* Contact page hibernated during the September 2026 recruiting
            window (team decision pending). Restore by swapping the redirect
            back to <Contact /> and reinstating the nav/footer links. */}
        <Route path="contact" element={<Navigate to="/applications" replace />} />
        <Route path="applications" element={<Applications />} />
        <Route path="imprint" element={<Imprint />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
