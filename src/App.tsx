import { AnimatePresence, motion } from 'motion/react'
import { BottomNav, Sidebar, Toaster } from '@/components/Shell'
import { AppProvider, useApp, type Overlay } from '@/lib/store'
import { Carry, CarryDetail } from '@/screens/Carry'
import { CreateTrip } from '@/screens/CreateTrip'
import { Home } from '@/screens/Home'
import { Login } from '@/screens/Login'
import { MapScreen, StoreDetail } from '@/screens/MapScreen'
import { PlanPanel, Swipe } from '@/screens/Priority'
import { AuthorPanel, CollectionPanel, Magazine, SeriesPanel, StoryArticle, TravelerSeriesPanel } from '@/screens/Magazine'
import { AskCard, ProductDetail } from '@/screens/ProductDetail'
import { Analyze, SaveSheet } from '@/screens/Save'
import { Benefits } from '@/screens/Finds'
import { Analyze2, Home2, SaveSheet2, Swipe2 } from '@/v2/Home2'
import { Product2 } from '@/v2/Product2'
import { FindDetail2, Magazine2, Profile2, Write2 } from '@/v2/Magazine2'
import { Map2, Store2 } from '@/v2/Map2'
import { Carry2, CarryDetail2 } from '@/v2/Carry2'
import { BottomNav2 } from '@/v2/ui'

function OverlayView({ o, depth }: { o: Overlay; depth: number }) {
  const z = 50 + depth
  switch (o.type) {
    case 'product':
      return <Product2 id={o.id} z={z} />
    case 'store':
      return <Store2 id={o.id} z={z} />
    case 'ask':
      return <AskCard id={o.id} />
    case 'carry':
      return <CarryDetail2 tripId={o.tripId} z={z} />
    case 'create':
      return <CreateTrip first={o.first} />
    case 'save':
      return <SaveSheet2 />
    case 'analyze':
      return <Analyze2 />
    case 'swipe':
      return <Swipe2 ids={o.ids} fresh={o.fresh} />
    case 'find':
      return <FindDetail2 id={o.id} z={z} />
    case 'post':
      return <Write2 />
    case 'benefits':
      return <Benefits z={z} />
    case 'plan':
      return <PlanPanel z={z} />
    case 'story':
      return <StoryArticle id={o.id} z={z} />
    case 'collection':
      return <CollectionPanel id={o.id} z={z} />
    case 'series':
      return <SeriesPanel id={o.id} z={z} />
    case 'tseries':
      return <TravelerSeriesPanel id={o.id} z={z} />
    case 'author':
      return <Profile2 name={o.name} z={z} />
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
    <div className="flex min-h-dvh" style={{ background: '#FAFAFA' }}>
      <main className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'home' && <Home2 />}
            {tab === 'magazine' && <Magazine2 />}
            {tab === 'map' && <Map2 />}
            {tab === 'carry' && <Carry2 />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav2 />
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
