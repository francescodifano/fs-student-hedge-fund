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

        {/* Applications closed 13 Sep 2026 and the page is off the site; the
            component stays in pages/Applications.tsx for the next round (restore:
            import it, route it, relink it in SiteHeader and nav.ts). Both old
            paths go to the homepage so printed QR codes and shared links still
            land somewhere. The Contact page itself remains hibernated. */}
        <Route path="contact" element={<Navigate to="/" replace />} />
        <Route path="applications" element={<Navigate to="/" replace />} />
        <Route path="imprint" element={<Imprint />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
