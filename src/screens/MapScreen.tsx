import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import { Bookmark, BookmarkCheck, ChevronLeft, Clock, Flag, Footprints, LocateFixed, MapPin, Navigation, Search, Share2, Store as StoreIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { StoreArt } from '@/components/art/Scenes'
import { ProductRow } from '@/components/ProductCard'
import { buttonVariants } from '@/components/ui/button'
import { Chip, IconBtn, Panel } from '@/components/ui/primitives'
import { STORES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Find, Product, Store } from '@/lib/types'
import { FindPhoto, FlagMark } from './Finds'
import { cn } from '@/lib/utils'

export const CW = 1200
export const CH = 1000
export const ME = { x: 55, y: 64 }
const mapsUrl = (s: Store) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.ja} ${s.area.split(' · ')[0]} 東京`)}`

type Item =
  | { kind: 'find'; id: string; x: number; y: number; f: Find }
  | { kind: 'store'; id: string; x: number; y: number; s: Store & { mine: Product[] } }

export function MapScreen() {
  const { tripProducts, open, mapFocus, setMapFocus, trip, finds, savedFind, toggleSaveFind, notify } = useApp()
  const [showFinds, setShowFinds] = useState(true)
  const [showStores, setShowStores] = useState(true)
  const [mustOnly, setMustOnly] = useState(false)
  const [openOnly, setOpenOnly] = useState(false)
  const vp = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const [bounds, setBounds] = useState({ left: -CW, right: 0, top: -CH, bottom: 0 })
  const LIST = 440

  const items = useMemo<Item[]>(() => {
    const fs: Item[] = showFinds ? finds.filter((f) => f.city === '도쿄').map((f) => ({ kind: 'find', id: `f:${f.id}`, x: f.x, y: f.y, f })) : []
    const ss: Item[] = showStores
      ? STORES.map((st) => ({ ...st, mine: tripProducts.filter((p) => p.storeIds.includes(st.id) && (!mustOnly || p.priority === 'must')) }))
          .filter((st) => (!openOnly || st.open) && (!mustOnly || st.mine.length))
          .sort((x, y) => x.distance - y.distance)
          .map((st) => ({ kind: 'store', id: st.id, x: st.x, y: st.y, s: st }))
      : []
    return [...fs, ...ss]
  }, [finds, tripProducts, showFinds, showStores, mustOnly, openOnly])

  const [sel, setSel] = useState<string | null>(mapFocus ?? items[0]?.id ?? null)

  const center = (x: number, y: number, smooth = true) => {
    const el = vp.current
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    const desktop = window.matchMedia('(min-width: 1024px)').matches
    const cx = desktop ? 420 + (w - 420) / 2 : w / 2
    const cy = desktop ? h / 2 : h * 0.36
    const maxX = desktop ? LIST : 0
    const tx = Math.min(maxX, Math.max(w - CW, cx - (x / 100) * CW))
    const ty = Math.min(0, Math.max(h - CH, cy - (y / 100) * CH))
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
    if (el) {
      const desktop = window.matchMedia('(min-width: 1024px)').matches
      setBounds({ left: Math.min(0, el.clientWidth - CW), right: desktop ? LIST : 0, top: Math.min(0, el.clientHeight - CH), bottom: 0 })
    }
    const it = items.find((x) => x.id === sel)
    center(it?.x ?? ME.x, it?.y ?? ME.y, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // focus requests from other screens (also when the map is already open)
  useEffect(() => {
    if (!mapFocus) return
    if (items.some((x) => x.id === mapFocus)) select(mapFocus)
    setMapFocus(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapFocus, items])

  const autoScroll = useRef(0)
  const select = (id: string, scrollCard = true) => {
    setSel(id)
    const it = items.find((x) => x.id === id)
    if (it) center(it.x, it.y)
    if (scrollCard) {
      const idx = items.findIndex((x) => x.id === id)
      autoScroll.current = Date.now()
      ;(rail.current?.children[idx] as HTMLElement | undefined)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  return (
    <div className="relative h-dvh overflow-hidden">
      <div ref={vp} className="absolute inset-0 overflow-hidden bg-[#ECEAE4]">
        <motion.div drag dragConstraints={bounds} dragElastic={0.08} style={{ x: mx, y: my, width: CW, height: CH }} className="absolute top-0 left-0 cursor-grab active:cursor-grabbing">
          <ShibuyaMap />
          <div className="absolute" style={{ left: `${ME.x}%`, top: `${ME.y}%` }} aria-label="내 위치">
            <span className="absolute -inset-5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#3E6FD8]/25" />
            <span className="block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3E6FD8] shadow ring-4 ring-white" />
          </div>
          {items.map((it) => {
            const on = it.id === sel
            if (it.kind === 'find')
              return (
                <button key={it.id} onClick={() => select(it.id)} className="absolute" style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: on ? 6 : 2 }} aria-label={`현지 발견: ${it.f.title}`}>
                  <AnimatePresence>
                    {on && (
                      <motion.span
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.9 }}
                        className="absolute bottom-[50px] left-[-8px] flex w-max max-w-[220px] items-center gap-2 rounded-2xl bg-ink py-1.5 pr-3 pl-1.5 text-left text-white shadow-[var(--shadow-float)]"
                      >
                        <FindPhoto f={it.f} className="size-9 shrink-0 rounded-xl" />
                        <span className="truncate text-[12.5px] font-semibold">{it.f.title}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.span animate={{ scale: on ? 1.2 : 1 }} style={{ originX: 0.1, originY: 1 }} className="absolute bottom-0 left-[-5px] block">
                    <FlagMark className="h-[42px] w-[32px]" active={on} />
                  </motion.span>
                </button>
              )
            const st = it.s
            return (
              <button key={it.id} onClick={() => select(it.id)} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: on ? 5 : 1 }} aria-label={`${st.name}, 저장한 상품 ${st.mine.length}개`}>
                <motion.span animate={{ scale: on ? 1.12 : 1 }} className={cn('flex items-center gap-1.5 rounded-full py-1 pr-3 pl-1 shadow-[var(--shadow-float)]', on ? 'bg-ink text-white' : 'bg-surface text-ink')}>
                  <span className="grid size-7 place-items-center rounded-full" style={{ background: st.color }}>
                    <StoreIcon className={cn('size-4', st.color === '#2A2A2C' ? 'text-white' : 'text-ink')} />
                  </span>
                  <span className="text-[12.5px] font-bold whitespace-nowrap">{st.name.split(' ')[0]}</span>
                  {st.mine.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">{st.mine.length}</span>}
                </motion.span>
                <span className={cn('mx-auto block h-2.5 w-2.5 -translate-y-1 rotate-45', on ? 'bg-ink' : 'bg-surface')} />
              </button>
            )
          })}
        </motion.div>
      </div>

      {/* top controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 px-4 pt-[max(14px,env(safe-area-inset-top))] lg:px-8 lg:pt-8 lg:pl-[436px]">
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="flex h-11 items-center gap-1.5 rounded-full bg-surface px-4 text-[14px] font-bold shadow-[var(--shadow-card)]">
            <MapPin className="size-4" /> {trip.city} · 시부야
          </span>
          <span className="flex-1" />
          <button onClick={() => open({ type: 'post' })} className="flex h-11 items-center gap-1.5 rounded-full bg-ink pr-4 pl-3 text-[13.5px] font-semibold text-white shadow-[var(--shadow-float)] active:scale-95">
            <Flag className="size-4" /> 발견 올리기
          </button>
          <IconBtn label="검색">
            <Search className="size-[18px]" />
          </IconBtn>
        </div>
        <div className="no-scrollbar pointer-events-auto -mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4">
          <Chip active={showFinds} onClick={() => setShowFinds((v) => !v)}>
            <FlagMark className="h-[15px] w-[12px]" /> 현지 발견
          </Chip>
          <Chip active={showStores} onClick={() => setShowStores((v) => !v)}>
            <StoreIcon className="size-3.5" /> 매장
          </Chip>
          <Chip active={mustOnly} onClick={() => setMustOnly((v) => !v)}>꼭 살래 상품</Chip>
          <Chip active={openOnly} onClick={() => setOpenOnly((v) => !v)}>영업 중</Chip>
        </div>
      </div>
      <div className="absolute right-4 bottom-[290px] flex flex-col items-end gap-2 lg:right-8 lg:bottom-8">
        <IconBtn label="내 위치로" onClick={() => center(ME.x, ME.y)}>
          <LocateFixed className="size-[18px]" />
        </IconBtn>
      </div>

      {/* cards: bottom rail on mobile, side list on desktop */}
      <div
        ref={rail}
        className="no-scrollbar absolute inset-x-0 bottom-[100px] flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-2 lg:top-8 lg:bottom-8 lg:left-8 lg:w-[380px] lg:flex-col lg:snap-none lg:overflow-y-auto lg:px-0"
        onScroll={(e) => {
          if (window.matchMedia('(min-width: 1024px)').matches || Date.now() - autoScroll.current < 700) return
          const el = e.currentTarget
          const idx = Math.round(el.scrollLeft / ((el.firstElementChild as HTMLElement).offsetWidth + 10))
          const it = items[idx]
          if (it && it.id !== sel) select(it.id, false)
        }}
      >
        {items.map((it) => {
          const on = it.id === sel
          const base = cn('w-[86%] max-w-[360px] shrink-0 snap-center rounded-[24px] bg-surface p-3.5 shadow-[0_10px_30px_-14px_rgba(20,20,19,0.3)] transition lg:w-full lg:max-w-none', on ? 'ring-2 ring-ink' : 'ring-1 ring-black/[0.04]')
          if (it.kind === 'find') {
            const f = it.f
            const saved = savedFind(f.id)
            return (
              <article key={it.id} onClick={() => select(it.id, false)} className={base}>
                <div className="flex gap-3">
                  <FindPhoto f={f} className="size-[72px] shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-[11.5px] font-semibold text-brand">
                      <FlagMark className="h-[13px] w-[10px]" /> 여기서만 살 수 있어요
                    </p>
                    <h3 className="mt-0.5 truncate text-[15.5px] font-semibold">{f.title}</h3>
                    <p className="mt-0.5 truncate text-[12.5px] text-muted">
                      {f.place} · {f.saves}명 저장
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); open({ type: 'find', id: f.id }) }} className={cn(buttonVariants({ variant: 'soft', size: 'md' }), 'flex-1')}>
                    사진·이야기 보기
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const ok = toggleSaveFind(f)
                      notify(ok ? '내 여행에 저장했어요' : '저장을 취소했어요')
                    }}
                    className={cn(buttonVariants({ variant: saved ? 'secondary' : 'primary', size: 'md' }), 'flex-1')}
                  >
                    {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />} {saved ? '저장됨' : '저장'}
                  </button>
                </div>
              </article>
            )
          }
          const st = it.s
          return (
            <article key={it.id} onClick={() => select(it.id, false)} className={base}>
              <div className="flex gap-3">
                <StoreArt color={st.color} name={st.name} className="size-[72px] shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15.5px] font-semibold">{st.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted tabular">
                    <span className={cn('font-semibold', st.open ? 'text-open' : 'text-muted')}>{st.open ? '영업 중' : '영업 종료'}</span>· {st.distance}m · {st.hours}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {st.mine.slice(0, 4).map((p) => (
                        <ProductArt key={p.id} art={p.art} className="size-7 rounded-full ring-2 ring-white" />
                      ))}
                    </div>
                    <span className="text-[12.5px] font-medium text-ink-2">{st.mine.length ? `내가 저장한 상품 ${st.mine.length}개` : '저장한 상품 없음'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); open({ type: 'store', id: st.id }) }} className={cn(buttonVariants({ variant: 'soft', size: 'md' }), 'flex-1')}>
                  상세보기
                </button>
                <a href={mapsUrl(st)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'flex-1')}>
                  <Navigation className="size-4" /> 길찾기
                </a>
              </div>
            </article>
          )
        })}
        {!items.length && <p className="w-full rounded-[24px] bg-surface p-6 text-center text-[14px] text-muted">조건에 맞는 장소가 없어요</p>}
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
  const label = 'fill-[#9b998f] text-[15px] font-semibold'
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width={CW} height={CH} fill="#ECEAE4" />
      <rect x="20" y="20" width="250" height="300" rx="40" fill="#D6E7CC" />
      <text x="70" y="170" className="fill-[#6f8f62] text-[16px] font-bold">요요기 공원</text>
      <rect x="660" y="300" width="60" height="230" rx="20" fill="#D6E7CC" />
      <text x="690" y="420" className="fill-[#6f8f62] text-[13px] font-bold" transform="rotate(90 690 420)" textAnchor="middle">미야시타 파크</text>
      {blocks.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="14" fill="#F6F5F1" />
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
      <path d="M640 0 L 640 1000" stroke="#C9C6BD" strokeWidth="10" fill="none" />
      <path d="M640 0 L 640 1000" stroke="#ECEAE4" strokeWidth="4" strokeDasharray="14 14" fill="none" />
      {/* station + scramble */}
      <rect x="600" y="560" width="96" height="110" rx="16" fill="#3E6FD8" />
      <text x="648" y="622" textAnchor="middle" className="fill-white text-[15px] font-bold">시부야역</text>
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
      <path d="M760 1000 C 760 900, 820 860, 880 830 S 1000 780, 1200 790" stroke="#C7DDF0" strokeWidth="14" fill="none" opacity="0.8" />
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
          <p className="text-[12.5px] font-semibold text-muted">{s.kind}</p>
          <h1 className="mt-1 text-[24px] font-extrabold tracking-tight">{s.name}</h1>
          <p lang="ja" className="mt-0.5 text-[13px] text-muted">{s.ja}</p>
          <ul className="mt-5 flex flex-col gap-3 rounded-[20px] bg-surface p-4 text-[14px] shadow-[var(--shadow-card)]">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted" /> {s.address}
            </li>
            <li className="flex items-center gap-2.5 tabular">
              <Clock className="size-4 shrink-0 text-muted" />
              <span className={cn('font-bold', s.open ? 'text-open' : 'text-muted')}>{s.open ? '영업 중' : '영업 종료'}</span> {s.hours}
            </li>
            <li className="flex items-center gap-2.5 tabular">
              <Footprints className="size-4 shrink-0 text-muted" /> 내 위치에서 {s.distance}m · 도보 {Math.max(1, Math.round(s.distance / 70))}분
            </li>
          </ul>
          <p className="mt-2 px-1 text-[11.5px] text-faint">매장 정보는 예시예요. 방문 전 영업시간을 확인해 주세요.</p>
          <h2 className="mt-7 text-[16px] font-bold">이곳에서 찾을 상품 {mine.length}</h2>
          {mine.length ? (
            <ul className="mt-3 flex flex-col gap-2.5">
              {mine.map((p, i) => (
                <ProductRow key={p.id} p={p} index={i} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-2xl bg-surface p-5 text-center text-[13.5px] text-muted ring-1 ring-line">이 매장에서 파는 저장 상품이 없어요</p>
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
