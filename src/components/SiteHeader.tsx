import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { asset as A } from '../lib/asset'
import { DEPARTMENTS } from '../lib/nav'

// Team feedback: no underline on hover/active — nav items stay plain navy,
// hover dims slightly.
const navCls = () => 'font-sans font-extrabold text-[1.05rem] text-navy transition-opacity hover:opacity-60'

// One responsive header for the whole site: logo + primary nav + Departments
// dropdown on desktop, hamburger → full-screen menu on mobile.
export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [deptOpen, setDeptOpen] = useState(false)
  const [mobileDeptOpen, setMobileDeptOpen] = useState(false)
  const { pathname } = useLocation()
  const deptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setDeptOpen(false)
    setMobileDeptOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!deptOpen) return
    const onDown = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setDeptOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDeptOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [deptOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur print:hidden">
      {/* On desktop the header mirrors the hero's grid, so the nav spans exactly
          the same column as the hero description text (team feedback) */}
      <div className="container-page flex h-20 items-center justify-between gap-4 md:h-24 lg:grid lg:grid-cols-[1.25fr_1fr] lg:gap-6">
        <Link to="/" aria-label="FS Student Hedge Fund home" className="shrink-0">
          <img src={A('logo-nav.png')} alt="FS Student Hedge Fund" className="h-10 w-auto sm:h-12" width="243" height="66" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center lg:flex lg:justify-between" aria-label="Primary">
          <NavLink to="/newsroom" className={navCls}>Newsroom</NavLink>
          <NavLink to="/research" className={navCls}>Research</NavLink>
          <div ref={deptRef} className="relative">
            <button
              className="inline-flex items-center gap-1 font-sans text-[1.05rem] font-extrabold text-navy transition-opacity hover:opacity-60"
              aria-expanded={deptOpen}
              aria-haspopup="true"
              onClick={() => setDeptOpen((o) => !o)}
            >
              Departments
              <Chevron open={deptOpen} />
            </button>
            {deptOpen && (
              <div
                className="absolute left-1/2 top-full z-50 mt-4 w-64 -translate-x-1/2 border border-mist bg-white p-2 shadow-xl"
                style={{ animation: 'fadeInUp .18s ease' }}
              >
                {DEPARTMENTS.map((d) => (
                  <Link key={d.to} to={d.to} className="block px-4 py-2.5 font-sans font-semibold text-navy transition-colors hover:bg-mist">
                    {d.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/applications" className={navCls}>Applications</NavLink>
          <NavLink to="/about" className={navCls}>About</NavLink>
        </nav>

        {/* Mobile trigger */}
        <button className="-m-2 p-2 text-navy lg:hidden" aria-label="Open menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        </button>
      </div>
      </header>

      {/* Mobile menu — rendered OUTSIDE <header> so the header's backdrop-filter
          doesn't trap this fixed overlay inside its containing block */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-navy text-white lg:hidden">
          <div className="container-page flex h-20 items-center justify-between md:h-24">
            <img src={A('logo-white.png')} alt="" className="h-9 w-auto" />
            <button aria-label="Close menu" className="-m-2 p-2" onClick={() => setMobileOpen(false)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>
          <nav className="container-page mt-4 flex flex-col gap-6 overflow-y-auto pb-16" aria-label="Mobile">
            <Link to="/newsroom" className="font-sans text-3xl">Newsroom</Link>
            <Link to="/research" className="font-sans text-3xl">Research</Link>
            <button className="flex items-center gap-2 text-left font-sans text-3xl" onClick={() => setMobileDeptOpen((o) => !o)}>
              Departments <Chevron open={mobileDeptOpen} big />
            </button>
            {mobileDeptOpen && (
              <div className="flex flex-col gap-4 border-l border-white/25 pl-5">
                {DEPARTMENTS.map((d) => (
                  <Link key={d.to} to={d.to} className="font-sans text-xl text-white/85">{d.label}</Link>
                ))}
              </div>
            )}
            <Link to="/applications" className="font-sans text-3xl">Applications</Link>
            <Link to="/about" className="font-sans text-3xl">About</Link>
          </nav>
        </div>
      )}
    </>
  )
}

function Chevron({ open, big = false }: { open: boolean; big?: boolean }) {
  return (
    <svg className={`${big ? 'h-5 w-5' : 'h-3.5 w-3.5'} transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

