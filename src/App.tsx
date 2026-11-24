import { AnimatePresence, motion } from 'motion/react'
import { BottomNav, Sidebar, Toaster } from '@/components/Shell'
import { AppProvider, useApp, type Overlay } from '@/lib/store'
import { Carry, CarryDetail } from '@/screens/Carry'
import { CreateTrip } from '@/screens/CreateTrip'
import { Home } from '@/screens/Home'
import { Login } from '@/screens/Login'
import { MapScreen, StoreDetail } from '@/screens/MapScreen'
import { PlanPanel, Swipe } from '@/screens/Priority'
import { CollectionPanel, Magazine, StoryArticle } from '@/screens/Magazine'
import { AskCard, ProductDetail } from '@/screens/ProductDetail'
import { Analyze, SaveSheet } from '@/screens/Save'
import { Benefits, FindDetail, PostFind } from '@/screens/Finds'

function OverlayView({ o, depth }: { o: Overlay; depth: number }) {
  const z = 50 + depth
  switch (o.type) {
    case 'product':
      return <ProductDetail id={o.id} z={z} />
    case 'store':
      return <StoreDetail id={o.id} z={z} />
    case 'ask':
      return <AskCard id={o.id} />
    case 'carry':
      return <CarryDetail tripId={o.tripId} z={z} />
    case 'create':
      return <CreateTrip />
    case 'save':
      return <SaveSheet />
    case 'analyze':
      return <Analyze mode={o.mode} images={o.images} />
    case 'swipe':
      return <Swipe ids={o.ids} fresh={o.fresh} />
    case 'find':
      return <FindDetail id={o.id} z={z} />
    case 'post':
      return <PostFind />
    case 'benefits':
      return <Benefits z={z} />
    case 'plan':
      return <PlanPanel z={z} />
    case 'story':
      return <StoryArticle id={o.id} z={z} />
    case 'collection':
      return <CollectionPanel id={o.id} z={z} />
  }
}

function Root() {
  const { authed, tab, overlays } = useApp()
  if (!authed)
    return (
      <>
        <Login />
        <AnimatePresence>{overlays.map((o, i) => <OverlayView key={`${o.type}-${i}`} o={o} depth={i} />)}</AnimatePresence>
      </>
    )
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'home' && <Home />}
            {tab === 'magazine' && <Magazine />}
            {tab === 'map' && <MapScreen />}
            {tab === 'carry' && <Carry />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
      <AnimatePresence>
        {overlays.map((o, i) => (
          <OverlayView key={`${o.type}-${'id' in o ? o.id : 'tripId' in o ? o.tripId : ''}-${i}`} o={o} depth={i} />
        ))}
      </AnimatePresence>
      <Toaster />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
