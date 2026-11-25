import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CATALOG, SCAN_POOL, SEED_FINDS, SEED_TRIPS, seedProducts } from './data'
import type { Category, Find, Priority, Product, Trip } from './types'
import { uid } from './utils'

export type Tab = 'home' | 'magazine' | 'map' | 'carry'
export type Overlay =
  | { type: 'product'; id: string }
  | { type: 'ask'; id: string }
  | { type: 'store'; id: string }
  | { type: 'carry'; tripId: string }
  | { type: 'create' }
  | { type: 'save' }
  | { type: 'analyze'; mode: 'shots' | 'link' | 'manual'; images: string[] }
  | { type: 'swipe'; ids?: string[]; fresh?: boolean }
  | { type: 'find'; id: string }
  | { type: 'post' }
  | { type: 'benefits' }
  | { type: 'plan' }
  | { type: 'story'; id: string }
  | { type: 'collection'; id: string }

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
  /** 여행 전 / 여행 중 — prototype lets you flip it to preview in-trip UI */
  const [inTrip, setInTrip] = useState(false)
  const [tab, setTab] = useState<Tab>('home')
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const [mapFocus, setMapFocus] = useState<string | null>(null)
  const [finds, setFinds] = useState<Find[]>(SEED_FINDS)
  const [points, setPoints] = useState(1240)
  const [thanked, setThanked] = useState<Set<string>>(() => new Set())
  const [redeemed, setRedeemed] = useState<string[]>([])

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

  const addFind = useCallback((f: Omit<Find, 'id' | 'city' | 'author' | 'authorTrip' | 'daysAgo' | 'saves' | 'thanks' | 'mine'>) => {
    const nf: Find = { ...f, city: trip.city, id: `f-${uid()}`, author: '수빈', authorTrip: `${trip.city} 여행 중`, daysAgo: 0, saves: 0, thanks: 0, mine: true }
    setFinds((fs) => [nf, ...fs])
    setPoints((p) => p + 50)
    return nf
  }, [trip.city])

  const savedFind = useCallback((findId: string) => products.some((p) => p.tripId === trip.id && p.findId === findId), [products, trip.id])

  const toggleSaveFind = useCallback(
    (f: Find) => {
      const existing = products.find((p) => p.tripId === trip.id && p.findId === f.id)
      if (existing) {
        setProducts((ps) => ps.filter((p) => p.id !== existing.id))
        setFinds((fs) => fs.map((x) => (x.id === f.id ? { ...x, saves: Math.max(0, x.saves - 1) } : x)))
        return false
      }
      const p: Product = {
        id: `pf-${uid()}`, tripId: trip.id, name: f.title, ja: '', brand: f.place, category: f.category, price: f.price ?? 0,
        desc: f.story, art: f.art, priority: 'must', favorite: false, memo: '', purchased: false, storeIds: [], pickRate: 0, reviews: [], findId: f.id,
      }
      setProducts((ps) => [p, ...ps])
      setFinds((fs) => fs.map((x) => (x.id === f.id ? { ...x, saves: x.saves + 1 } : x)))
      return true
    },
    [products, trip.id],
  )

  const toggleThank = useCallback((id: string) => {
    setThanked((s) => {
      const n = new Set(s)
      const on = !n.has(id)
      if (on) n.add(id)
      else n.delete(id)
      setFinds((fs) => fs.map((x) => (x.id === id ? { ...x, thanks: x.thanks + (on ? 1 : -1) } : x)))
      return n
    })
  }, [])

  /** caller checks the balance first */
  const redeem = useCallback((id: string, cost: number) => {
    setPoints((p) => p - cost)
    setRedeemed((r) => [...r, id])
  }, [])

  return {
    finds, points, thanked, redeemed, addFind, savedFind, toggleSaveFind, toggleThank, redeem,
    authed, setAuthed, trips, trip, tripId, setTripId, products, tripProducts, rate, setRate,
    tab, setTab, overlays, open, close, closeAll, toast, notify, update, setPriority,
    addTrip, updateTrip, scan, addProducts, addManual, mapFocus, setMapFocus, inTrip, setInTrip,
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
