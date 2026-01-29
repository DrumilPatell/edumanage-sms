import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const scrollPosition = { landing: 0 }

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition.landing)
      }, 0)
    } else {
      window.scrollTo(0, 0)
    }

    return () => {
      if (pathname === '/') {
        scrollPosition.landing = window.scrollY
      }
    }
  }, [pathname])

  return null
}
