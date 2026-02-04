import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

let landingScrollPosition = 0

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.location.pathname === '/') {
        landingScrollPosition = window.scrollY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useLayoutEffect(() => {
    if (pathname === '/') {

      if (landingScrollPosition > 0) {
        window.scrollTo(0, landingScrollPosition)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  
  return null
}
