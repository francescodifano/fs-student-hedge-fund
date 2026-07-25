import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Research from './pages/Research'
import Newsroom from './pages/Newsroom'
import Social from './pages/Social'
import Contact from './pages/Contact'
import DepartmentPage from './pages/DepartmentPage'
import IndexConstruction from './pages/IndexConstruction'
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
        <Route path="hedge-fund" element={<DepartmentPage slug="hedge-fund" />} />
        <Route path="derivatives" element={<DepartmentPage slug="derivatives" />} />
        <Route path="quant" element={<DepartmentPage slug="quant" />} />

        <Route path="contact" element={<Contact />} />
        <Route path="imprint" element={<Imprint />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
