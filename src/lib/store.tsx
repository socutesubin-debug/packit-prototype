import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CATALOG, SCAN_POOL, SEED_TRIPS, seedProducts } from './data'
import type { Category, Priority, Product, Trip } from './types'
import { uid } from './utils'

export type Tab = 'home' | 'priority' | 'map' | 'carry'
export type Overlay =
  | { type: 'product'; id: string }
  | { type: 'ask'; id: string }
  | { type: 'store'; id: string }
  | { type: 'carry'; tripId: string }
  | { type: 'create' }
  | { type: 'save' }
  | { type: 'analyze'; mode: 'shots' | 'link' | 'manual'; images: string[] }
  | { type: 'swipe' }

interface Toast {
  id: string
  text: string
}

function useAppState() {
  const [authed, setAuthed] = useState(false)
  const [trips, setTrips] = useState<Trip[]>(SEED_TRIPS)
  const [tripId, setTripId] = useState('t1')
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [rate, setRate] = useState(844)
  const [tab, setTab] = useState<Tab>('home')
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const [mapFocus, setMapFocus] = useState<string | null>(null)

  const trip = trips.find((t) => t.id === tripId) ?? trips[0]
  const tripProducts = useMemo(() => products.filter((p) => p.tripId === trip.id), [products, trip.id])

  const open = useCallback((o: Overlay) => setOverlays((s) => [...s, o]), [])
  const close = useCallback(() => setOverlays((s) => s.slice(0, -1)), [])
  const closeAll = useCallback(() => setOverlays([]), [])

  const notify = useCallback((text: string) => {
    const id = uid()
    setToast({ id, text })
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2200)
  }, [])

  const update = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const setPriority = useCallback((id: string, priority: Priority | null) => update(id, { priority }), [update])

  const addTrip = useCallback((t: Omit<Trip, 'id' | 'stickers'>) => {
    const id = uid()
    setTrips((ts) => [{ ...t, id, stickers: [] }, ...ts])
    setTripId(id)
    return id
  }, [])

  const updateTrip = useCallback((id: string, patch: Partial<Trip>) => {
    setTrips((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  /** returns the products created by the fake analysis */
  const scan = useCallback(
    (count: number) => {
      const owned = new Set(products.filter((p) => p.tripId === trip.id).map((p) => p.name))
      const pool = [...SCAN_POOL, ...CATALOG].filter((s) => !owned.has(s.name))
      const picks = (pool.length ? pool : [...SCAN_POOL]).slice(0, Math.max(1, count))
      const created: Product[] = picks.map((s) => ({
        ...s,
        id: `${s.id}-${uid()}`,
        tripId: trip.id,
        priority: null,
        favorite: false,
        memo: '',
        purchased: false,
      }))
      return created
    },
    [products, trip.id],
  )

  const addProducts = useCallback((list: Product[]) => setProducts((ps) => [...list, ...ps]), [])

  const addManual = useCallback(
    (name: string, price: number, category: Category) => {
      const p: Product = {
        id: uid(),
        tripId: trip.id,
        name,
        ja: '',
        brand: '직접 입력',
        category,
        price,
        desc: '직접 입력한 상품이에요. 메모에 구매 이유를 남겨 보세요.',
        art: { shape: 'box', color: '#B9B7B1', accent: '#FFFFFF', bg: '#EEEDE9' },
        priority: null,
        favorite: false,
        memo: '',
        purchased: false,
        storeIds: [],
        pickRate: 0,
        reviews: [],
      }
      setProducts((ps) => [p, ...ps])
      return p
    },
    [trip.id],
  )

  return {
    authed, setAuthed, trips, trip, tripId, setTripId, products, tripProducts, rate, setRate,
    tab, setTab, overlays, open, close, closeAll, toast, notify, update, setPriority,
    addTrip, updateTrip, scan, addProducts, addManual, mapFocus, setMapFocus,
  }
}

export type AppStore = ReturnType<typeof useAppState>
const Ctx = createContext<AppStore | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppState()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside provider')
  return v
}
