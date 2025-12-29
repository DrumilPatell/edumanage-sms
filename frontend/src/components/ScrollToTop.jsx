import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Store scroll position globally (outside component to persist across route changes)
const scrollPosition = { landing: 0 }

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // If navigating to landing page, restore previous scroll position
    if (pathname === '/') {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition.landing)
      }, 0)
    } else {
      // Save landing page scroll position before navigating away
      // For non-landing pages, always scroll to top
      window.scrollTo(0, 0)
    }

    // Cleanup: save landing page scroll position when leaving
    return () => {
      if (pathname === '/') {
        scrollPosition.landing = window.scrollY
      }
    }
  }, [pathname])

  return null
}
