import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import { ArrowUpDown, Bookmark, BookmarkCheck, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CreditCard, Receipt, Clock, Flag, Footprints, Languages, LocateFixed, MapPin, Navigation, Search, Share2, ShoppingBag, Store as StoreIcon, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { StoreArt } from '@/components/art/Scenes'
import { ProductRow } from '@/components/ProductCard'
import { buttonVariants } from '@/components/ui/button'
import { IconBtn, Panel, useIsDesktop } from '@/components/ui/primitives'
import { CATEGORIES, STORES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Category, Find, Product, Store } from '@/lib/types'
import { FindPhoto, FlagMark } from './Finds'
import { cn, yen } from '@/lib/utils'
import { buyInfo } from '@/lib/buy'

export const CW = 1200
export const CH = 1000
export const ME = { x: 55, y: 64 }
const mapsUrl = (s: Store) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.ja} ${s.area.split(' · ')[0]} 東京`)}`

type Item =
  | { kind: 'find'; id: string; x: number; y: number; f: Find }
  | { kind: 'store'; id: string; x: number; y: number; s: Store & { mine: Product[]; must: Product[]; sum: number } }

type Snap = 'peek' | 'half' | 'full'
const NAV_PAD = 92
const walkMin = (m: number) => Math.max(1, Math.round(m / 80))

export function MapScreen() {
  const { tripProducts, products, open, mapFocus, setMapFocus, finds, savedFind, toggleSaveFind, notify, update, inTrip } = useApp()
  const desktop = useIsDesktop()
  // product mode: "어디서 살까요" for one product, opened from its detail
  const [pid, setPid] = useState<string | null>(mapFocus?.startsWith('p:') ? mapFocus.slice(2) : null)
  const product = pid ? products.find((x) => x.id === pid) : undefined
  const buy = product ? buyInfo(product, tripProducts, finds) : undefined
  const [myList, setMyList] = useState(true)
  const [showFinds, setShowFinds] = useState(true)
  const [cat, setCat] = useState<Category | null>(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'bundle' | 'near'>('bundle')
  const [seen, setSeen] = useState<Set<string>>(() => new Set())
  const vp = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const [bounds, setBounds] = useState({ left: -CW, right: 0, top: -CH, bottom: 0 })
  const LIST = 440

  const items = useMemo<Item[]>(() => {
    const mineAt = (st: Store) => tripProducts.filter((p) => p.storeIds.includes(st.id) && (!cat || p.category === cat))
    const toItem = (st: Store): Item => {
      const mine = mineAt(st)
      const must = mine.filter((p) => p.priority === 'must')
      return { kind: 'store', id: st.id, x: st.x, y: st.y, s: { ...st, mine, must, sum: must.reduce((a, p) => a + p.price, 0) } }
    }
    if (product && buy) {
      if (buy.find) return [{ kind: 'find', id: `f:${buy.find.id}`, x: buy.find.x, y: buy.find.y, f: buy.find }]
      return buy.stores.map(toItem)
    }
    const qq = q.trim()
    const fs: Item[] = showFinds
      ? finds.filter((f) => f.city === '도쿄' && (!cat || f.category === cat) && (!qq || f.title.includes(qq) || f.place.includes(qq))).map((f) => ({ kind: 'find', id: `f:${f.id}`, x: f.x, y: f.y, f }))
      : []
    const ss = STORES.map(toItem).filter((it) => {
      const st = (it as Extract<Item, { kind: 'store' }>).s
      if (myList && !st.mine.length) return false
      if (qq && !st.name.includes(qq) && !st.mine.some((p) => p.name.includes(qq))) return false
      return true
    })
    return [...ss, ...fs]
  }, [finds, tripProducts, showFinds, myList, cat, q, product, buy])

  const stores = items.filter((x): x is Extract<Item, { kind: 'store' }> => x.kind === 'store')
  const findItems = items.filter((x): x is Extract<Item, { kind: 'find' }> => x.kind === 'find')
  const bundleTop = [...stores].sort((x, y) => y.s.must.length - x.s.must.length)[0]
  const nearTop = [...stores].filter((x) => x.s.must.length).sort((x, y) => x.s.distance - y.s.distance)[0]
  const listed = [...stores].sort((x, y) => (sort === 'bundle' ? y.s.must.length - x.s.must.length || x.s.distance - y.s.distance : x.s.distance - y.s.distance))
  const railItems: Item[] = [...listed, ...findItems]
  const nearbyMust = tripProducts.filter((p) => p.priority === 'must' && !p.purchased && p.storeIds.length && (!cat || p.category === cat))

  const [sel, setSel] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  /** card centred in the peek rail — highlights its pin without opening it */
  const [peekId, setPeekId] = useState<string | null>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const selItem = items.find((x) => x.id === sel)

  /* ----- bottom sheet ----- */
  const [snap, setSnap] = useState<Snap>('peek')
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const heights: Record<Snap, number> = { peek: NAV_PAD + 168, half: Math.round(vh * 0.56), full: Math.round(vh * 0.88) }
  const detailH = Math.max(heights.half, Math.min(heights.full, NAV_PAD + 430))
  const target = selItem ? (expanded ? heights.full : detailH) : heights[snap]
  const h = useMotionValue(target)
  useEffect(() => {
    animate(h, target, { type: 'spring', stiffness: 320, damping: 34 })
  }, [target, h])
  const startH = useRef(0)

  const center = (x: number, y: number, smooth = true) => {
    const el = vp.current
    if (!el) return
    const w = el.clientWidth
    const hh = el.clientHeight
    const cx = desktop ? 420 + (w - 420) / 2 : w / 2
    const cy = desktop ? hh / 2 : (hh - heights.half) / 2 + 40
    const maxX = desktop ? LIST : 0
    const tx = Math.min(maxX, Math.max(w - CW, cx - (x / 100) * CW))
    const extra = desktop ? 0 : heights.half
    const ty = Math.min(0, Math.max(hh - CH - extra, cy - (y / 100) * CH))
    if (smooth) {
      animate(mx, tx, { type: 'spring', stiffness: 160, damping: 26 })
      animate(my, ty, { type: 'spring', stiffness: 160, damping: 26 })
    } else {
      mx.set(tx)
      my.set(ty)
    }
  }

  useEffect(() => {
    const el = vp.current
    if (el) setBounds({ left: Math.min(0, el.clientWidth - CW), right: desktop ? LIST : 0, top: Math.min(0, el.clientHeight - CH - (desktop ? 0 : heights.half)), bottom: 0 })
    center(ME.x, ME.y, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const select = (id: string | null) => {
    setSel(id)
    setExpanded(false)
    if (!id) return
    setSeen((s) => new Set(s).add(id))
    const it = items.find((x) => x.id === id)
    if (it) center(it.x, it.y)
  }

  // focus requests from other screens (also when the map is already open)
  useEffect(() => {
    if (!mapFocus) return
    if (mapFocus.startsWith('p:')) {
      setPid(mapFocus.slice(2))
      setMapFocus(null)
      return
    }
    if (mapFocus.startsWith('f:')) setShowFinds(true)
    if (items.some((x) => x.id === mapFocus)) select(mapFocus)
    else if (STORES.some((s) => s.id === mapFocus)) {
      setMyList(false)
      window.setTimeout(() => select(mapFocus), 60)
    }
    setMapFocus(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapFocus, items])

  useEffect(() => {
    if (!product || !items.length) return
    const first = buy?.oneStop ? buy.oneStop.store.id : items[0].id
    const t = window.setTimeout(() => select(first), 60)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid])

  // keep the highlighted rail card's pin in view
  const railFirst = railItems[0]?.id
  useEffect(() => {
    if (desktop || sel || snap !== 'peek' || !railFirst) return
    setPeekId(null)
    railRef.current?.scrollTo({ left: 0 })
    const it = items.find((x) => x.id === railFirst)
    if (it) center(it.x, it.y)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [railFirst])

  const routeTo = selItem
  const routeMin = selItem ? (selItem.kind === 'store' ? walkMin(selItem.s.distance) : walkMin(Math.hypot(selItem.x - ME.x, selItem.y - ME.y) * 12)) : 0

  const tagsFor = (st: Extract<Item, { kind: 'store' }>['s']) => {
    const t: string[] = []
    if (buy && !buy.find) {
      if (buy.oneStop?.store.id === st.id) t.push(`몰아 사기 ${buy.oneStop.n}개`)
      if (buy.cheapest?.store.id === st.id) t.push(`가장 저렴 ${yen(buy.cheapest.price)}`)
      if (buy.nearest?.id === st.id) t.push('가장 가까움')
      return t
    }
    if (bundleTop?.s.id === st.id && st.must.length > 1) t.push('몰아 사기')
    if (nearTop?.s.id === st.id) t.push('가장 가까움')
    if (/드럭|잡화점/.test(st.kind)) t.push('면세')
    return t
  }

  return (
    <div className="relative h-dvh overflow-hidden">
      <div ref={vp} className="absolute inset-0 overflow-hidden bg-[#EDEDED]">
        <motion.div drag dragConstraints={bounds} dragElastic={0.08} onTap={() => sel && select(null)} style={{ x: mx, y: my, width: CW, height: CH }} className="absolute top-0 left-0 cursor-grab active:cursor-grabbing">
          <ShibuyaMap />
          {routeTo && (
            <svg viewBox={`0 0 ${CW} ${CH}`} className="pointer-events-none absolute inset-0 h-full w-full">
              <path
                d={`M${(ME.x / 100) * CW} ${(ME.y / 100) * CH} L${(routeTo.x / 100) * CW} ${(ME.y / 100) * CH} L${(routeTo.x / 100) * CW} ${(routeTo.y / 100) * CH}`}
                stroke="#111" strokeWidth="3.5" strokeDasharray="8 8" strokeLinecap="round" fill="none"
              />
            </svg>
          )}
          {routeTo && (
            <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-2 py-1 text-[11.5px] font-semibold whitespace-nowrap shadow" style={{ left: `${(ME.x + routeTo.x) / 2}%`, top: `${ME.y}%` }}>
              도보 {routeMin}분
            </span>
          )}
          <div className="absolute" style={{ left: `${ME.x}%`, top: `${ME.y}%` }} aria-label="내 위치">
            <span className="absolute -inset-5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-black/15" />
            <span className="block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow ring-4 ring-white" />
          </div>
          {items.map((it) => {
            const on = it.id === sel || (!sel && snap === 'peek' && !desktop && it.id === (peekId ?? railItems[0]?.id))
            if (it.kind === 'find')
              return (
                <button key={it.id} onClick={(e) => { e.stopPropagation(); select(it.id) }} className="absolute" style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: on ? 6 : 2 }} aria-label={`여행자 발견: ${it.f.title}`}>
                  <motion.span animate={{ scale: on ? 1.25 : 1 }} style={{ originX: 0.1, originY: 1 }} className="absolute bottom-0 left-[-5px] block">
                    <FlagMark className="h-[34px] w-[26px]" active={on} />
                  </motion.span>
                </button>
              )
            const st = it.s
            const price = product ? product.price : st.sum
            const big = product ? true : st.must.length > 0
            const wasSeen = seen.has(it.id) && !on
            if (!big)
              return (
                <button key={it.id} onClick={(e) => { e.stopPropagation(); select(it.id) }} aria-label={st.name} className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: on ? 5 : 1 }}>
                  <span className={cn('block rounded-full border-2 transition-all', on ? 'size-4 border-white bg-ink shadow-md' : 'size-3 border-[#8a8a8a] bg-white')} />
                </button>
              )
            return (
              <button key={it.id} onClick={(e) => { e.stopPropagation(); select(it.id) }} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: on ? 5 : 3 }} aria-label={`${st.name}, 꼭 살래 ${st.must.length}개 ${yen(price)}`}>
                <motion.span
                  animate={{ scale: on ? 1.12 : 1 }}
                  className={cn('flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap shadow-[0_2px_6px_rgba(0,0,0,0.22)] tabular', on ? 'bg-ink text-white' : 'bg-white', wasSeen && 'text-[#8a8a8a]')}
                >
                  {yen(price)}
                  {!product && st.must.length > 1 && <span className={cn('text-[11.5px] font-medium', on ? 'text-white/70' : 'text-muted-foreground')}>· {st.must.length}</span>}
                </motion.span>
              </button>
            )
          })}
        </motion.div>
      </div>

      {/* top: search + filters */}
      <div className="pointer-events-none absolute inset-x-0 top-0 px-4 pt-[max(14px,env(safe-area-inset-top))] lg:px-8 lg:pt-8 lg:pl-[436px]">
        <div className="pointer-events-auto flex items-center gap-2">
          {product ? (
            <div className="flex h-12 flex-1 items-center gap-3 rounded-xl bg-white pr-2 pl-2 shadow-md">
              <ProductArt art={product.art} tone="none" className="size-9 shrink-0 rounded-lg bg-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11.5px] text-muted-foreground">어디서 살까요</span>
                <span className="block truncate text-[14px] font-semibold">{product.name}</span>
              </span>
              <button onClick={() => { setPid(null); select(null) }} aria-label="전체 지도 보기" className="grid size-9 place-items-center rounded-md hover:bg-accent">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-12 flex-1 items-center gap-2 rounded-xl bg-white px-3.5 shadow-md">
              <Search className="size-[18px] text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="가게나 상품 찾기" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint" />
              {q && (
                <button onClick={() => setQ('')} aria-label="검색어 지우기">
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}
            </label>
          )}
        </div>
        {product && buy ? (
          <p className="pointer-events-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] shadow-sm">
            {buy.find ? (
              <>
                <FlagMark className="h-[13px] w-[10px]" /> <b className="font-semibold">이 가게에서만</b> 살 수 있어요
              </>
            ) : (
              <>
                <b className="font-semibold">흔해요</b> · {buy.chains.join(' · ')}에서 팔아요
              </>
            )}
          </p>
        ) : (
          <div className="no-scrollbar pointer-events-auto -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
            <MapChip active={myList} onClick={() => setMyList((v) => !v)}>
              <ShoppingBag className="size-3.5" /> 내 리스트
            </MapChip>
            <MapChip active={showFinds} onClick={() => setShowFinds((v) => !v)}>
              <FlagMark light={showFinds} className="h-[13px] w-[10px]" /> 여행자 발견
            </MapChip>
            {CATEGORIES.map((c) => (
              <MapChip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>
                {c}
              </MapChip>
            ))}
          </div>
        )}
      </div>

      {/* floating actions above the sheet */}
      {!desktop && !expanded && (
        <motion.div style={{ bottom: h }} className="absolute right-4 mb-3 flex flex-col items-end gap-2">
          {!sel && (
            <button onClick={() => open({ type: 'post' })} className="flex h-10 items-center gap-1.5 rounded-full bg-ink pr-3.5 pl-3 text-[13px] font-semibold text-white shadow-lg active:scale-95">
              <Flag className="size-4" /> 발견 올리기
            </button>
          )}
          <IconBtn label="내 위치로" onClick={() => center(ME.x, ME.y)} className="size-10 rounded-full bg-white shadow-md">
            <LocateFixed className="size-[18px]" />
          </IconBtn>
        </motion.div>
      )}

      {/* bottom sheet (mobile) / side panel (desktop) */}
      <motion.section
        style={desktop ? undefined : { height: h }}
        className={cn(
          'absolute flex flex-col overflow-hidden bg-background',
          desktop ? 'top-8 bottom-8 left-8 w-[380px] rounded-2xl border shadow-lg' : 'inset-x-0 bottom-0 rounded-t-[22px] shadow-[0_-4px_24px_rgba(0,0,0,0.12)]',
        )}
      >
        {!desktop && (
          <motion.div
            className="shrink-0 cursor-grab touch-none pt-2.5 pb-1.5 active:cursor-grabbing"
            onPanStart={() => (startH.current = h.get())}
            onPan={(_, info) => h.set(Math.max(heights.peek - 40, Math.min(heights.full + 20, startH.current - info.offset.y)))}
            onPanEnd={(_, info) => {
              const v = h.get() - info.velocity.y * 0.15
              if (sel) {
                // selected shop: up = 가게 상세, down = back to the list
                if (v > (detailH + heights.full) / 2) {
                  setExpanded(true)
                  animate(h, heights.full, { type: 'spring', stiffness: 320, damping: 34 })
                } else if (v < detailH - 90) {
                  select(null)
                  setSnap('peek')
                  animate(h, heights.peek, { type: 'spring', stiffness: 320, damping: 34 })
                } else {
                  setExpanded(false)
                  animate(h, detailH, { type: 'spring', stiffness: 320, damping: 34 })
                }
                return
              }
              const order: Snap[] = ['peek', 'half', 'full']
              const best = order.reduce((a, b) => (Math.abs(heights[b] - v) < Math.abs(heights[a] - v) ? b : a))
              setSnap(best)
              animate(h, heights[best], { type: 'spring', stiffness: 320, damping: 34 })
            }}
            onTap={() => (sel ? setExpanded(!expanded) : setSnap(snap === 'peek' ? 'half' : 'peek'))}
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
          </motion.div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-4" style={{ paddingBottom: expanded && selItem?.kind === 'store' ? 0 : desktop ? 16 : NAV_PAD }}>
          <AnimatePresence mode="wait" initial={false}>
            {selItem ? (
              <motion.div key={selItem.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-1">
                {selItem.kind === 'store' ? (
                  <StoreSheet
                    it={selItem}
                    expanded={expanded || desktop}
                    desktop={desktop}
                    onExpand={() => setExpanded(true)}
                    onCollapse={() => setExpanded(false)}
                    nearby={stores.filter((x) => x.id !== selItem.id && x.s.mine.length).sort((a, b) => Math.hypot(a.x - selItem.x, a.y - selItem.y) - Math.hypot(b.x - selItem.x, b.y - selItem.y)).slice(0, 3).map((x) => ({ id: x.id, s: x.s, min: walkMin(Math.hypot(x.x - selItem.x, x.y - selItem.y) * 12) }))}
                    stories={finds.filter((f) => f.place.includes(selItem.s.name.split(' ')[0]) || selItem.s.name.includes(f.place.split(' ')[0]))}
                    onSelectStore={(id) => select(id)}
                    onFind={(id) => open({ type: 'find', id })}
                    onPost={() => open({ type: 'post' })}
                    tags={tagsFor(selItem.s)}
                    walk={routeMin}
                    inTrip={inTrip}
                    onBack={() => select(null)}
                    onOpen={() => open({ type: 'store', id: selItem.s.id })}
                    onAsk={(pidd) => open({ type: 'ask', id: pidd })}
                    onToggle={(p) => {
                      update(p.id, { purchased: !p.purchased })
                      notify(p.purchased ? '다시 살 목록에 넣었어요' : `${p.name} 샀어요`)
                    }}
                    onProduct={(pidd) => open({ type: 'product', id: pidd })}
                  />
                ) : (
                  <FindSheet
                    f={selItem.f}
                    walk={routeMin}
                    saved={savedFind(selItem.f.id)}
                    onBack={() => select(null)}
                    onOpen={() => open({ type: 'find', id: selItem.f.id })}
                    onSave={() => notify(toggleSaveFind(selItem.f) ? '내 여행에 저장했어요' : '저장을 취소했어요')}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button onClick={() => !desktop && setSnap(snap === 'peek' ? 'half' : 'peek')} className="flex w-full items-baseline justify-between pt-1 text-left">
                  <span className="text-[16px] font-semibold tracking-tight">
                    {product ? (buy?.find ? '살 수 있는 곳' : `살 수 있는 가게 ${stores.length}곳`) : (
                      <>
                        근처에서 살 수 있는 꼭 살래 <span className="tabular">{nearbyMust.length}</span>개
                      </>
                    )}
                  </span>
                  {!product && <span className="text-[12.5px] text-muted-foreground tabular">가게 {stores.filter((x) => x.s.must.length).length}곳</span>}
                </button>
                {snap === 'peek' && !desktop ? (
                  <div
                    ref={railRef}
                    className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1"
                    onScroll={(e) => {
                      const el = e.currentTarget
                      const first = el.firstElementChild as HTMLElement | null
                      if (!first) return
                      const idx = Math.round(el.scrollLeft / (first.offsetWidth + 10))
                      const it = railItems[Math.min(idx, railItems.length - 1)]
                      if (it && it.id !== peekId) {
                        setPeekId(it.id)
                        center(it.x, it.y)
                      }
                    }}
                  >
                    {railItems.map((it) => (
                      <button key={it.id} onClick={() => select(it.id)} className={cn('flex w-[82%] shrink-0 snap-start items-center gap-3 rounded-xl border p-2.5 text-left transition', it.id === (peekId ?? railItems[0]?.id) ? 'border-ink' : 'border-border')}>
                        {it.kind === 'store' ? (
                          <>
                            <StoreArt color={it.s.color} name={it.s.name} className="size-14 shrink-0 rounded-lg" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14.5px] font-semibold">{it.s.name}</span>
                              <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground tabular">
                                {product ? `${it.s.open ? '영업 중' : '영업 종료'} · ${it.s.distance}m` : it.s.must.length ? `꼭 살래 ${it.s.must.length}개 · ${yen(it.s.sum)} · ${it.s.distance}m` : `저장 ${it.s.mine.length}개 · ${it.s.distance}m`}
                              </span>
                              <span className="mt-1 flex flex-wrap gap-1">
                                {tagsFor(it.s).slice(0, 2).map((t) => <MiniTag key={t}>{t}</MiniTag>)}
                              </span>
                            </span>
                          </>
                        ) : (
                          <>
                            <FindPhoto f={it.f} className="size-14 shrink-0 rounded-lg" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14.5px] font-semibold">{it.f.place}</span>
                              <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">여기서만 · {it.f.title}</span>
                              <span className="mt-1 flex">
                                <MiniTag>
                                  <FlagMark className="h-[10px] w-[8px]" /> 여행자 발견
                                </MiniTag>
                              </span>
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                <>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-[14.5px] font-semibold">
                    {product && buy?.find ? '살 수 있는 곳' : `가게 ${stores.length}곳`}
                    {!product && findItems.length > 0 && <span className="font-normal text-muted-foreground"> · 발견 {findItems.length}</span>}
                  </p>
                  {!product && (
                    <button onClick={() => setSort(sort === 'bundle' ? 'near' : 'bundle')} className="flex items-center gap-0.5 text-[12.5px] text-muted-foreground hover:text-ink">
                      {sort === 'bundle' ? '몰아 사기 순' : '가까운 순'} <ArrowUpDown className="size-3.5" />
                    </button>
                  )}
                </div>
                <ul className="mt-1 divide-y">
                  {listed.map((it) => {
                    const st = it.s
                    const tags = tagsFor(st)
                    return (
                      <li key={it.id}>
                        <button onClick={() => select(it.id)} className="flex w-full items-center gap-3 py-3 text-left">
                          <StoreArt color={st.color} name={st.name} className="size-12 shrink-0 rounded-lg" />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-[14.5px] font-semibold">{st.name}</span>
                            </span>
                            <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground tabular">
                              {product ? `${st.open ? '영업 중' : '영업 종료'} · ${st.distance}m` : st.must.length ? `꼭 살래 ${st.must.length}개 · ${yen(st.sum)} · ${st.distance}m` : `저장한 상품 ${st.mine.length}개 · ${st.distance}m`}
                            </span>
                            {tags.length > 0 && (
                              <span className="mt-1 flex flex-wrap gap-1">
                                {tags.map((t) => <MiniTag key={t}>{t}</MiniTag>)}
                              </span>
                            )}
                          </span>
                          <ChevronRight className="size-4 text-faint" />
                        </button>
                      </li>
                    )
                  })}
                  {findItems.map((it) => (
                    <li key={it.id}>
                      <button onClick={() => select(it.id)} className="flex w-full items-center gap-3 py-3 text-left">
                        <FindPhoto f={it.f} className="size-12 shrink-0 rounded-lg" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] font-semibold">{it.f.place}</span>
                          <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                            여기서만 · {it.f.title}
                            {it.f.price != null && <span className="tabular"> {yen(it.f.price)}</span>}
                          </span>
                          <span className="mt-1 flex">
                            <MiniTag>
                              <FlagMark className="h-[10px] w-[8px]" /> 여행자 발견
                            </MiniTag>
                          </span>
                        </span>
                        <ChevronRight className="size-4 text-faint" />
                      </button>
                    </li>
                  ))}
                </ul>
                </>
                )}
                {!items.length && <p className="py-10 text-center text-[14px] text-muted-foreground">조건에 맞는 장소가 없어요</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  )
}

function MapChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn('flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium whitespace-nowrap shadow-sm transition', active ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white text-ink')}
    >
      {children}
    </button>
  )
}

function MiniTag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[11px] font-medium text-ink-2 tabular">{children}</span>
}

type NearbyStore = { id: string; s: Extract<Item, { kind: 'store' }>['s']; min: number }

function StoreSheet({ it, tags, walk, inTrip, expanded, desktop, onExpand, onCollapse, nearby, stories, onSelectStore, onFind, onPost, onBack, onAsk, onToggle, onProduct }: {
  it: Extract<Item, { kind: 'store' }>
  tags: string[]
  walk: number
  inTrip: boolean
  expanded: boolean
  desktop: boolean
  onExpand: () => void
  onCollapse: () => void
  nearby: NearbyStore[]
  stories: Find[]
  onSelectStore: (id: string) => void
  onFind: (id: string) => void
  onPost: () => void
  onBack: () => void
  onOpen?: () => void
  onAsk: (pid: string) => void
  onToggle: (p: Product) => void
  onProduct: (pid: string) => void
}) {
  const st = it.s
  const others = st.mine.filter((p) => p.priority !== 'must')
  const [more, setMore] = useState(false)
  const left = st.must.filter((p) => !p.purchased)
  const taxFree = /드럭|잡화점|기념품|전자/.test(st.kind)
  const row = (p: Product) => (
    <li key={p.id} className="flex items-center gap-3 py-2.5">
      <button onClick={() => onProduct(p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <ProductArt art={p.art} tone="neutral" className="size-10 shrink-0 rounded-lg" />
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-[14px]', p.purchased && 'text-muted-foreground line-through')}>{p.name}</span>
          <span className="text-[12px] text-muted-foreground tabular">{yen(p.price)}</span>
        </span>
      </button>
      <button
        onClick={() => onToggle(p)}
        aria-label={p.purchased ? `${p.name} 산 것 취소` : `${p.name} 샀어요`}
        aria-pressed={p.purchased}
        className={cn('grid size-6 shrink-0 place-items-center rounded-md border-[1.5px] transition', p.purchased ? 'border-ink bg-ink text-white' : 'border-[#bdbdbd]')}
      >
        {p.purchased && <Check className="size-4" />}
      </button>
    </li>
  )
  return (
    <div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="-mx-4 mb-4 overflow-hidden">
            <StoreArt color={st.color} name={st.name} className="h-36 w-full" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-start gap-2">
        <button onClick={expanded && !desktop ? onCollapse : onBack} aria-label={expanded && !desktop ? '요약으로' : '목록으로'} className="-ml-1.5 grid size-8 shrink-0 place-items-center rounded-full hover:bg-accent">
          {expanded && !desktop ? <ChevronDown className="size-5" /> : <ChevronLeft className="size-5" />}
        </button>
        <button onClick={expanded ? undefined : onExpand} className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[17px] font-semibold tracking-tight">{st.name}</span>
            {tags.map((t) => <MiniTag key={t}>{t}</MiniTag>)}
          </span>
          <span className="mt-0.5 block text-[12.5px] text-muted-foreground tabular">
            <span className={cn('font-semibold', st.open ? 'text-ink' : '')}>{st.open ? '영업 중' : '영업 종료'}</span> · {st.kind} · {st.distance}m · 도보 {walk}분
          </span>
        </button>
        <a href={mapsUrl(st)} target="_blank" rel="noreferrer" aria-label="공유" className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-accent">
          <Share2 className="size-4" />
        </a>
      </div>

      {expanded && (
        <ul className="mt-4 divide-y rounded-xl border text-[13.5px]">
          <li className="flex items-center gap-3 px-3.5 py-2.5">
            <Clock className="size-4 text-muted-foreground" />
            <span className="flex-1">{st.hours}</span>
            <span className={cn('text-[12.5px] font-semibold', st.open ? 'text-ink' : 'text-muted-foreground')}>{st.open ? '영업 중' : '영업 종료'}</span>
          </li>
          <li className="flex items-center gap-3 px-3.5 py-2.5">
            <Receipt className="size-4 text-muted-foreground" />
            <span className="flex-1">{taxFree ? '¥5,000 이상 면세 · 여권 지참' : '면세 대상 매장이 아니에요'}</span>
            {taxFree && <span className="text-[12.5px] text-muted-foreground">1층 카운터</span>}
          </li>
          <li className="flex items-center gap-3 px-3.5 py-2.5">
            <CreditCard className="size-4 text-muted-foreground" />
            <span className="flex-1">카드 · 교통카드 · 현금</span>
          </li>
          <li className="flex items-center gap-3 px-3.5 py-2.5">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{st.address}</span>
            <span className="text-[12px] text-faint">{st.ja}</span>
          </li>
        </ul>
      )}

      {st.mine.length > 0 ? (
        <>
          <p className="mt-5 text-[13.5px] font-semibold">
            {st.must.length ? (
              <>
                여기서 살 꼭 살래 <span className="tabular">{st.must.length}</span>개 · <span className="tabular">{yen(st.sum)}</span>
              </>
            ) : (
              <>저장한 상품 {st.mine.length}개</>
            )}
          </p>
          {inTrip && st.must.length > 0 && <p className="mt-0.5 text-[12px] text-muted-foreground">체크하면 ‘샀어요’로 바뀌어요 · 남은 {left.length}개</p>}
          <ul className="mt-1 divide-y">{(st.must.length ? st.must : st.mine).map(row)}</ul>
          {st.must.length > 0 && others.length > 0 &&
            (expanded ? (
              <>
                <p className="mt-4 text-[13.5px] font-semibold">
                  고민 중 <span className="tabular">{others.length}</span>개
                </p>
                <ul className="mt-1 divide-y">{others.map(row)}</ul>
              </>
            ) : (
              <>
                {more && <ul className="divide-y">{others.map(row)}</ul>}
                <button onClick={() => setMore(!more)} className="mt-1 text-[12.5px] font-medium text-muted-foreground underline-offset-2 hover:underline">
                  {more ? '꼭 살래만 보기' : `고민 중인 상품 ${others.length}개 더 보기`}
                </button>
              </>
            ))}
        </>
      ) : (
        <p className="mt-4 rounded-lg bg-sunken px-3 py-3 text-[13px] text-muted-foreground">이 가게에서 살 상품을 아직 담지 않았어요</p>
      )}

      {!expanded && (
        <button onClick={onExpand} className="mt-3 flex w-full items-center justify-between border-t pt-3 text-[13.5px] font-medium">
          가게 상세 보기 <ChevronUp className="size-4 text-muted-foreground" />
        </button>
      )}

      {expanded && (
        <>
          <p className="mt-7 text-[13.5px] font-semibold">이 가게 여행자 이야기</p>
          {stories.length ? (
            <ul className="mt-1 divide-y">
              {stories.map((f) => (
                <li key={f.id}>
                  <button onClick={() => onFind(f.id)} className="flex w-full items-start gap-3 py-3 text-left">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sunken text-[12px] font-semibold">{f.author.slice(0, 1)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] leading-snug font-medium">“{f.title}”</span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{f.author} · 고마워요 {f.thanks}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button onClick={onPost} className="mt-2 flex w-full items-center justify-between rounded-lg bg-sunken px-3.5 py-3 text-left text-[13px]">
              <span className="text-muted-foreground">아직 이 가게 이야기가 없어요</span>
              <span className="font-semibold">첫 팁 남기기</span>
            </button>
          )}

          {nearby.length > 0 && (
            <>
              <p className="mt-7 text-[13.5px] font-semibold">같이 들르기 좋은 근처 가게</p>
              <ul className="mt-1 divide-y">
                {nearby.map((n) => (
                  <li key={n.id}>
                    <button onClick={() => onSelectStore(n.id)} className="flex w-full items-center gap-3 py-2.5 text-left">
                      <StoreArt color={n.s.color} name={n.s.name} className="size-10 shrink-0 rounded-lg" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium">{n.s.name}</span>
                        <span className="text-[12px] text-muted-foreground tabular">
                          {n.s.must.length ? `꼭 살래 ${n.s.must.length}개` : `저장 ${n.s.mine.length}개`} · 여기서 도보 {n.min}분
                        </span>
                      </span>
                      <ChevronRight className="size-4 text-faint" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-5 text-[11.5px] text-faint">매장 정보는 예시예요. 방문 전 영업시간을 확인해 주세요.</p>
        </>
      )}

      <div className={cn('mt-4 flex gap-2 bg-background', expanded && 'sticky bottom-0 -mx-4 border-t px-4 pt-3')} style={expanded ? { paddingBottom: desktop ? 4 : NAV_PAD + 4 } : undefined}>
        <button onClick={() => (st.mine[0] ? onAsk(st.mine[0].id) : onExpand())} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'flex-1')}>
          <Languages className="size-4" /> 현지어 문의
        </button>
        <a href={mapsUrl(st)} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'flex-[1.4]')}>
          <Footprints className="size-4" /> 길찾기
        </a>
      </div>
    </div>
  )
}

function FindSheet({ f, walk, saved, onBack, onOpen, onSave }: { f: Find; walk: number; saved: boolean; onBack: () => void; onOpen: () => void; onSave: () => void }) {
  return (
    <div>
      <div className="flex items-start gap-2">
        <button onClick={onBack} aria-label="목록으로" className="-ml-1.5 grid size-8 shrink-0 place-items-center rounded-full hover:bg-accent">
          <ChevronLeft className="size-5" />
        </button>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[17px] font-semibold tracking-tight">{f.place}</span>
            <MiniTag>
              <FlagMark className="h-[10px] w-[8px]" /> 여행자 발견
            </MiniTag>
          </span>
          <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
            {f.area} · 도보 {walk}분
          </span>
        </span>
      </div>
      <button onClick={onOpen} className="mt-3 flex w-full gap-3 text-left">
        <FindPhoto f={f} className="size-20 shrink-0 rounded-xl" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11.5px] font-semibold text-muted-foreground">여기서만 살 수 있어요</span>
          <span className="mt-0.5 block text-[15px] leading-snug font-semibold">{f.title}</span>
          <span className="mt-1 block text-[12.5px] text-muted-foreground tabular">
            {f.author} · {f.saves}명 저장{f.price != null && ` · ${yen(f.price)}`}
          </span>
        </span>
      </button>
      <div className="mt-4 flex gap-2">
        <button onClick={onOpen} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'flex-1')}>
          사진·이야기 보기
        </button>
        <button onClick={onSave} className={cn(buttonVariants({ variant: saved ? 'outline' : 'default', size: 'lg' }), 'flex-1')}>
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />} {saved ? '저장됨' : '내 여행에 저장'}
        </button>
      </div>
    </div>
  )
}

export function ShibuyaMap() {
  const blocks: [number, number, number, number][] = [
    [80, 380, 220, 140], [80, 560, 260, 170], [360, 330, 200, 130], [380, 500, 150, 120], [80, 780, 300, 160], [420, 680, 170, 120],
    [740, 120, 200, 160], [980, 120, 180, 220], [740, 320, 140, 200], [920, 380, 240, 160], [780, 600, 160, 120], [990, 580, 170, 160],
    [460, 820, 250, 140], [780, 790, 380, 170], [300, 120, 330, 150],
  ]
  const label = 'fill-[#9a9a9a] text-[15px] font-semibold'
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width={CW} height={CH} fill="#EDEDED" />
      <rect x="20" y="20" width="250" height="300" rx="40" fill="#E2E2E2" />
      <text x="70" y="170" className="fill-[#8a8a8a] text-[16px] font-semibold">요요기 공원</text>
      <rect x="660" y="300" width="60" height="230" rx="20" fill="#E2E2E2" />
      <text x="690" y="420" className="fill-[#8a8a8a] text-[13px] font-semibold" transform="rotate(90 690 420)" textAnchor="middle">미야시타 파크</text>
      {blocks.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="14" fill="#F8F8F8" />
      ))}
      {/* roads */}
      <path d="M700 0 C 700 260, 690 480, 700 1000" stroke="#fff" strokeWidth="34" fill="none" />
      <path d="M0 740 L1200 760" stroke="#fff" strokeWidth="40" fill="none" />
      <path d="M640 600 L 120 980" stroke="#fff" strokeWidth="28" fill="none" />
      <path d="M640 590 L 300 330 L 290 0" stroke="#fff" strokeWidth="24" fill="none" />
      <path d="M600 560 L 360 470 L 0 470" stroke="#fff" strokeWidth="20" fill="none" />
      <path d="M700 300 L 1200 300" stroke="#fff" strokeWidth="20" fill="none" />
      <path d="M700 560 L 1200 560" stroke="#fff" strokeWidth="18" fill="none" />
      {/* rail */}
      <path d="M640 0 L 640 1000" stroke="#CFCFCF" strokeWidth="10" fill="none" />
      <path d="M640 0 L 640 1000" stroke="#EDEDED" strokeWidth="4" strokeDasharray="14 14" fill="none" />
      {/* station + scramble */}
      <rect x="600" y="560" width="96" height="110" rx="16" fill="#111111" />
      <text x="648" y="622" textAnchor="middle" className="fill-white text-[15px] font-semibold">시부야역</text>
      <g opacity="0.55">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={548 + i * 7} y="574" width="3.5" height="44" fill="#fff" transform="rotate(35 576 596)" />
        ))}
      </g>
      <text x="470" y="640" className={label}>스크램블 교차로</text>
      <text x="330" y="900" className={label} transform="rotate(-36 330 900)">도겐자카</text>
      <text x="380" y="458" className={label}>센터 거리</text>
      <text x="712" y="200" className={label}>메이지 거리</text>
      <text x="960" y="788" className={label}>국도 246</text>
      <path d="M760 1000 C 760 900, 820 860, 880 830 S 1000 780, 1200 790" stroke="#DCDCDC" strokeWidth="14" fill="none" opacity="0.8" />
    </svg>
  )
}

export function StoreDetail({ id, z }: { id: string; z: number }) {
  const { close, tripProducts, notify } = useApp()
  const s = STORES.find((x) => x.id === id)
  if (!s) return null
  const mine = tripProducts.filter((p) => p.storeIds.includes(s.id))
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="relative">
          <StoreArt color={s.color} name={s.name} className="h-[260px] w-full" />
          <div className="absolute inset-x-0 top-0 flex justify-between p-4 pt-[max(16px,env(safe-area-inset-top))]">
            <IconBtn label="뒤로" onClick={close}>
              <ChevronLeft className="size-5" />
            </IconBtn>
            <IconBtn
              label="공유"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${s.name} — ${mapsUrl(s)}`)
                  notify('매장 링크를 복사했어요')
                } catch {
                  notify('복사할 수 없는 환경이에요')
                }
              }}
            >
              <Share2 className="size-[18px]" />
            </IconBtn>
          </div>
        </div>
        <div className="relative -mt-6 rounded-t-[28px] bg-ground px-5 pt-6">
          <p className="text-[12.5px] font-semibold text-muted-foreground">{s.kind}</p>
          <h1 className="mt-1 text-[24px] font-extrabold tracking-tight">{s.name}</h1>
          <p lang="ja" className="mt-0.5 text-[13px] text-muted-foreground">{s.ja}</p>
          <ul className="mt-5 flex flex-col gap-3 rounded-xl border bg-card shadow-xs p-4 text-[14px] shadow-xs">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {s.address}
            </li>
            <li className="flex items-center gap-2.5 tabular">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span className={cn('font-semibold', s.open ? 'text-open' : 'text-muted-foreground')}>{s.open ? '영업 중' : '영업 종료'}</span> {s.hours}
            </li>
            <li className="flex items-center gap-2.5 tabular">
              <Footprints className="size-4 shrink-0 text-muted-foreground" /> 내 위치에서 {s.distance}m · 도보 {Math.max(1, Math.round(s.distance / 70))}분
            </li>
          </ul>
          <p className="mt-2 px-1 text-[11.5px] text-faint">매장 정보는 예시예요. 방문 전 영업시간을 확인해 주세요.</p>
          <h2 className="mt-7 text-[16px] font-semibold">이곳에서 찾을 상품 {mine.length}</h2>
          {mine.length ? (
            <ul className="mt-3 flex flex-col gap-2.5">
              {mine.map((p, i) => (
                <ProductRow key={p.id} p={p} index={i} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-2xl bg-surface p-5 text-center text-[13.5px] text-muted-foreground border">이 매장에서 파는 저장 상품이 없어요</p>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ground from-60% to-transparent px-5 pt-6 pb-[max(16px,env(safe-area-inset-bottom))]">
        <a href={mapsUrl(s)} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
          <Navigation className="size-5" /> 길찾기
        </a>
      </div>
    </Panel>
  )
}
