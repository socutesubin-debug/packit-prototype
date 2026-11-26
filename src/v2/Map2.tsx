import { motion } from 'motion/react'
import { ChevronRight, Clock, Crosshair, Flag, MapPin, Route, Share2, Store as StoreIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import mapImg from '@/assets/photos/map-shibuya.png'
import { STORES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Product, Store } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FlagIcon } from './Magazine2'
import { BackButton, C, IconBtn, PillButton, Price, ProductImg, SearchCircle } from './ui'

const ME = { x: 29, y: 30 }
const hoursLabel = (h: string) => {
  const m = h.match(/(\d+):(\d+) - (\d+):(\d+)/)
  if (!m) return h
  const f = (H: number, M: string) => `${H < 12 ? '오전' : '오후'} ${pad(H <= 12 ? H : H - 12)}:${M}`
  return `${f(Number(m[1]), m[2])}~${f(Number(m[3]), m[4])}`
}
const pad = (n: number) => String(n).padStart(2, '0')

export function Map2() {
  const { finds, open, mapFocus, setMapFocus, notify } = useApp()
  const [showFinds, setShowFinds] = useState(true)
  const [near, setNear] = useState(true)
  const [openOnly, setOpenOnly] = useState(false)
  const [sel, setSel] = useState<string>(STORES[0].id)
  const rail = useRef<HTMLDivElement>(null)
  const stores = STORES.filter((s) => !openOnly || s.open).sort((a, b) => (near ? a.distance - b.distance : 0))
  const flags = finds.filter((f) => f.city === '도쿄' && (f.photo || f.mine))

  const go = (id: string) => {
    setSel(id)
    const i = stores.findIndex((s) => s.id === id)
    const el = rail.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }
  useEffect(() => {
    if (!mapFocus) return
    if (mapFocus.startsWith('f:')) setShowFinds(true)
    else if (STORES.some((s) => s.id === mapFocus)) window.setTimeout(() => go(mapFocus), 200)
    const t = window.setTimeout(() => setMapFocus(null), 1600)
    return () => window.clearTimeout(t)
  }, [mapFocus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pk relative mx-auto h-dvh w-full max-w-[480px] overflow-hidden" style={{ background: '#F4F4F4' }}>
      <img src={mapImg} alt="시부야 지도" className="absolute inset-0 size-full object-cover" />

      {/* 내 위치 */}
      <span className="absolute size-6 -translate-x-1/2 -translate-y-1/2" style={{ left: `${ME.x}%`, top: `${ME.y}%` }} aria-label="내 위치">
        <span className="absolute inset-0 animate-ping rounded-full opacity-40" style={{ background: C.me }} />
        <span className="absolute inset-0 rounded-full shadow-[0_0_16px_rgba(79,136,237,0.8)]" style={{ background: C.me }} />
      </span>

      {/* 여행자 발견 깃발 */}
      {showFinds &&
        flags.map((f) => {
          const hot = mapFocus === `f:${f.id}`
          return (
            <button key={f.id} onClick={() => open({ type: 'find', id: f.id })} aria-label={`발견: ${f.title}`} className="absolute -translate-x-1 -translate-y-full" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
              <motion.span animate={hot ? { scale: [1, 1.4, 1] } : {}} transition={{ repeat: hot ? 2 : 0, duration: 0.6 }} className="block">
                <FlagIcon className="h-7 w-6" />
              </motion.span>
            </button>
          )
        })}

      {/* 매장 핀 */}
      {stores.map((s) => {
        const on = s.id === sel
        return (
          <button key={s.id} onClick={() => go(s.id)} aria-label={s.name} aria-pressed={on} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
            <span className={cn('grid place-items-center rounded-full border-2 transition', on ? 'size-10' : 'size-8')} style={{ background: on ? C.btn : '#D9D9D9', borderColor: on ? '#fff' : '#3A3A40', color: on ? '#fff' : '#3A3A40' }}>
              <StoreIcon className={on ? 'size-5' : 'size-4'} strokeWidth={1.8} />
            </span>
          </button>
        )
      })}

      {/* 상단: 위치 · 검색 · 필터 */}
      <div className="absolute inset-x-0 top-0 px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex h-[60px] items-center justify-between">
          <button className="t-body-m flex h-10 items-center gap-2 rounded-full bg-white px-4 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <MapPin className="size-5" strokeWidth={1.8} />
            도쿄 • 시부야
          </button>
          <SearchCircle onClick={() => notify('검색은 곧 열려요')} />
        </div>
        <div className="flex gap-2">
          <MapChip on={showFinds} onClick={() => setShowFinds((v) => !v)}>
            <Flag className="size-4" strokeWidth={1.8} />
            여행자 발견
          </MapChip>
          <MapChip on={near} onClick={() => setNear((v) => !v)}>
            가까운 매장
          </MapChip>
          <MapChip on={openOnly} onClick={() => setOpenOnly((v) => !v)}>
            영업중
          </MapChip>
        </div>
      </div>

      {/* 내 위치로 */}
      <IconBtn label="내 위치로" onClick={() => notify('지금 위치를 다시 찾았어요')} className="absolute right-6 bottom-[calc(246px+env(safe-area-inset-bottom))] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <Crosshair className="size-6" strokeWidth={1.6} />
      </IconBtn>

      {/* 매장 카드 레일 */}
      <div
        ref={rail}
        className="no-scrollbar absolute inset-x-0 bottom-[calc(112px+env(safe-area-inset-bottom))] flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5"
        onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollLeft / 350)
          if (stores[i] && stores[i].id !== sel) setSel(stores[i].id)
        }}
      >
        {stores.map((s) => (
          <StoreCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  )
}

function MapChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on} className="t-label flex h-8 items-center gap-1 rounded-full px-3 shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition" style={on ? { background: C.gray, color: '#fff' } : { background: '#fff', color: C.sub }}>
      {children}
    </button>
  )
}

export function StoreThumb({ s, className, big }: { s: Store; className?: string; big?: boolean }) {
  const src = big ? s.photo : (s.thumb ?? s.photo)
  if (src) return <img src={src} alt="" className={cn('object-cover', className)} />
  return (
    <span className={cn('grid place-items-center', className)} style={{ background: s.color === '#1E1E1E' ? '#3A3A40' : '#E5E5EA', color: s.color === '#1E1E1E' ? '#fff' : C.sub }}>
      <StoreIcon className="size-6" strokeWidth={1.6} />
    </span>
  )
}

function StoreCard({ s }: { s: Store }) {
  const { open, notify } = useApp()
  return (
    <div className="flex h-[140px] w-[342px] max-w-[calc(100vw-60px)] shrink-0 snap-start flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <button onClick={() => open({ type: 'store', id: s.id })} className="flex items-center gap-4 text-left">
        <StoreThumb s={s} className="size-[60px] shrink-0 rounded-lg" />
        <span className="min-w-0">
          <span className="t-body-l block truncate">{s.name}</span>
          <span className="t-cap2 mt-1 flex gap-3">
            <span style={{ color: s.open ? C.open : C.ter }}>{s.open ? '영업중' : '영업 종료'}</span>
            <span style={{ color: C.sub }}>{s.distance}m</span>
            <span className="tabular" style={{ color: C.sub }}>
              {s.hours.replace(' - ', '-')}
            </span>
          </span>
        </span>
      </button>
      <div className="flex gap-2">
        <button onClick={() => open({ type: 'store', id: s.id })} className="t-body-m h-9 flex-1 rounded-full font-semibold" style={{ background: C.line }}>
          상세보기
        </button>
        <button onClick={() => notify(`${s.name}까지 도보 ${Math.max(1, Math.round(s.distance / 80))}분이에요`)} className="t-body-m flex h-9 flex-1 items-center justify-center gap-2 rounded-full font-semibold text-white" style={{ background: C.gray }}>
          <Route className="size-4" strokeWidth={1.8} /> 길찾기
        </button>
      </div>
    </div>
  )
}

/* ───────── 매장 상세 ───────── */
export function Store2({ id, z }: { id: string; z: number }) {
  const { close, tripProducts, open, notify, update } = useApp()
  const s = STORES.find((x) => x.id === id)
  if (!s) return null
  const here = tripProducts.filter((p) => p.storeIds.includes(s.id))
  const must = here.filter((p) => p.priority === 'must')
  const maybe = here.filter((p) => p.priority === 'maybe')
  const nearby = STORES.filter((x) => x.id !== s.id).slice(0, 2)
  return (
    <motion.div className="pk fixed inset-0 overflow-y-auto" style={{ zIndex: z, background: C.bg }} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }}>
      <div className="relative mx-auto w-full max-w-[480px]">
        <div className="relative h-[364px]">
          <StoreThumb s={s} big className="absolute inset-0 size-full" />
          <header className="absolute inset-x-0 top-0 flex h-[60px] items-center justify-between px-5 pt-[env(safe-area-inset-top)]" style={{ boxSizing: 'content-box' }}>
            <BackButton onClick={close} circle />
            <IconBtn label="공유" onClick={() => notify('링크를 복사했어요')} className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <Share2 className="size-5" strokeWidth={1.6} />
            </IconBtn>
          </header>
        </div>
        <div className="relative -mt-8 rounded-t-3xl px-5 pt-8 pb-[calc(108px+env(safe-area-inset-bottom))]" style={{ background: C.bg }}>
          <div className="px-2">
            <h1 className="t-h3" style={{ fontWeight: 700 }}>
              {s.name}
            </h1>
            <p lang="ja" className="t-body-m" style={{ color: C.ter, fontWeight: 400 }}>
              {s.ja}
            </p>
            <p className="t-body-m mt-6 flex gap-2" style={{ color: C.sub, fontWeight: 500 }}>
              <MapPin className="mt-0.5 size-5 shrink-0" strokeWidth={1.6} />
              {s.address}
            </p>
            <p className="t-body-m mt-3 flex items-center gap-2" style={{ fontWeight: 500 }}>
              <Clock className="size-5 shrink-0" strokeWidth={1.6} style={{ color: C.sub }} />
              <span className="t-label" style={{ color: s.open ? C.open : C.ter }}>
                {s.open ? '영업중' : '영업 종료'}
              </span>
              <span style={{ color: C.sub }}>{hoursLabel(s.hours)}</span>
            </p>
          </div>
          <div className="mt-6 h-px" style={{ background: C.g4 }} />

          <StoreSection title="이 곳에서 찾을 상품" list={must} empty="이 매장에서 살 수 있는 '꼭 살래' 상품이 없어요" onToggle={(p) => update(p.id, { purchased: !p.purchased })} onOpen={(p) => open({ type: 'product', id: p.id })} />
          {!!maybe.length && <StoreSection title="고민 중인 상품" list={maybe} onToggle={(p) => update(p.id, { purchased: !p.purchased })} onOpen={(p) => open({ type: 'product', id: p.id })} />}

          <h2 className="t-body-m mt-8 px-2 font-semibold">같이 들리기 좋은 근처 가게</h2>
          <ul className="mt-2">
            {nearby.map((n) => (
              <li key={n.id}>
                <button onClick={() => open({ type: 'store', id: n.id })} className="flex h-[86px] w-full items-center gap-4 border-b px-2 text-left" style={{ borderColor: C.g4 }}>
                  <StoreThumb s={n} className="h-[68px] w-[72px] shrink-0 rounded-md" />
                  <span className="min-w-0 flex-1">
                    <span className="t-label line-clamp-2 font-semibold">{n.name}</span>
                    <span className="t-cap mt-1 block" style={{ color: C.ter }}>
                      {n.distance}m | 여기서 도보 {Math.max(1, Math.round(Math.abs(n.distance - s.distance) / 80) + 1)}분
                    </span>
                  </span>
                  <ChevronRight className="size-5" strokeWidth={1.6} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-[480px] px-5 pt-4 pb-[max(34px,env(safe-area-inset-bottom))]" style={{ background: `linear-gradient(to top, ${C.bg} 76%, transparent)` }}>
            <PillButton dark={false} onClick={() => notify(`${s.name}까지 도보 ${Math.max(1, Math.round(s.distance / 80))}분이에요`)}>
              길 찾기
            </PillButton>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StoreSection({ title, list, empty, onToggle, onOpen }: { title: string; list: Product[]; empty?: string; onToggle: (p: Product) => void; onOpen: (p: Product) => void }) {
  return (
    <section className="mt-6">
      <h2 className="t-body-m px-2 font-semibold">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {list.map((p) => (
          <li key={p.id} className="flex h-[92px] items-center gap-4 rounded-2xl bg-white pr-3 pl-4">
            <button onClick={() => onOpen(p)} className="flex min-w-0 flex-1 items-center gap-6 text-left">
              <span className="grid size-[72px] shrink-0 place-items-center">
                <ProductImg p={p} className="max-h-[72px] max-w-[72px]" />
              </span>
              <span className="min-w-0">
                <span className="t-label line-clamp-2">{p.name}</span>
                <Price yen={p.price} size="s" className="mt-1" />
              </span>
            </button>
            <button role="checkbox" aria-checked={p.purchased} aria-label={`${p.name} 샀어요`} onClick={() => onToggle(p)} className="grid size-6 shrink-0 place-items-center rounded-full transition" style={{ background: p.purchased ? C.btn : C.g4 }}>
              {p.purchased && <span className="block size-2 rounded-full bg-white" />}
            </button>
          </li>
        ))}
        {!list.length && empty && (
          <li className="t-label px-2 py-4" style={{ color: C.ter }}>
            {empty}
          </li>
        )}
      </ul>
    </section>
  )
}
