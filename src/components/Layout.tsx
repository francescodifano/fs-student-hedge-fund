import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

// App shell: one header + one footer wrap every page via <Outlet>.
export default function Layout() {
  const { pathname, hash } = useLocation()
  // New page: start at the top, unless the URL carries a section anchor, in
  // which case land on that section (the browser's own fragment scroll fires
  // before the app has rendered, so it has to be repeated here).
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
