import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Store scroll position globally
let landingScrollPosition = 0

export default function ScrollToTop() {
  const { pathname } = useLocation()

  // Save scroll position continuously while on landing page
  useEffect(() => {
    const handleScroll = () => {
      if (window.location.pathname === '/') {
        landingScrollPosition = window.scrollY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle scroll on route change
  useLayoutEffect(() => {
    if (pathname === '/') {
      // Restore scroll position when returning to landing page
      if (landingScrollPosition > 0) {
        window.scrollTo(0, landingScrollPosition)
      }
    } else {
      // Scroll to top for other pages
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
