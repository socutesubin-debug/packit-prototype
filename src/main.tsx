import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PhonePreview } from './PhonePreview.tsx'

/**
 * #mobile on a wide screen → phone-frame preview (the app runs in an iframe with #app)
 * #app or anything else → the app itself (responsive)
 */
function Root() {
  const [hash, setHash] = useState(location.hash)
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 600px)').matches)
  useEffect(() => {
    const onHash = () => setHash(location.hash)
    const mq = window.matchMedia('(min-width: 600px)')
    const onMq = () => setWide(mq.matches)
    window.addEventListener('hashchange', onHash)
    mq.addEventListener('change', onMq)
    return () => {
      window.removeEventListener('hashchange', onHash)
      mq.removeEventListener('change', onMq)
    }
  }, [])
  if (hash === '#mobile' && wide) return <PhonePreview />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
