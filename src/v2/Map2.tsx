import { motion } from 'motion/react'
import { ChevronRight, Clock, Crosshair, Flag, MapPin, Route, Share2, Store as StoreIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { renderToStaticMarkup } from 'react-dom/server'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { STORES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Find, Product, Store } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FlagIcon } from './Magazine2'
import { celebrateCarry } from './celebrate'
import { BackButton, C, IconBtn, PillButton, Price, ProductImg, SearchCircle } from './ui'

const ME: [number, number] = [35.659, 139.7006]
/** 미리 그려 담은 OpenFreeMap Positron 타일 범위 (넓은 범위 z12–14, 시부야 z15–17) */
const BOUNDS = L.latLngBounds([35.64, 139.685], [35.705, 139.825])
const TILE_URL = `${import.meta.env.BASE_URL}tiles/{z}/{x}/{y}.png`
/** 좌표가 없는 발견(내가 올린 글)은 x/y를 시부야 화면 범위에 맞춰 둔다 */
const findLatLng = (f: Find): [number, number] => (f.lat != null && f.lng != null ? [f.lat, f.lng] : [35.665 - (f.y / 100) * 0.012, 139.692 + (f.x / 100) * 0.016])

const hoursLabel = (h: string) => {
  const m = h.match(/(\d+):(\d+) - (\d+):(\d+)/)
  if (!m) return h
  const f = (H: number, M: string) => `${H < 12 ? '오전' : '오후'} ${pad(H <= 12 ? H : H - 12)}:${M}`
  return `${f(Number(m[1]), m[2])}~${f(Number(m[3]), m[4])}`
}
const pad = (n: number) => String(n).padStart(2, '0')

const meIcon = L.divIcon({
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `<span class="relative block size-6"><span class="absolute inset-0 animate-ping rounded-full opacity-40" style="background:${C.me}"></span><span class="absolute inset-0 rounded-full border-2 border-white shadow-[0_0_16px_rgba(79,136,237,0.8)]" style="background:${C.me}"></span></span>`,
})
const storeIcon = (on: boolean) => {
  const d = on ? 40 : 32
  return L.divIcon({
    className: '',
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
    html: `<span class="grid size-full place-items-center rounded-full border-2 transition" style="background:${on ? C.btn : '#D9D9D9'};border-color:${on ? '#fff' : '#3A3A40'};color:${on ? '#fff' : '#3A3A40'}">${renderToStaticMarkup(<StoreIcon className={on ? 'size-5' : 'size-4'} strokeWidth={1.8} />)}</span>`,
  })
}
const flagIcon = (hot: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [24, 28],
    iconAnchor: [4, 28],
    html: `<span class="block${hot ? ' animate-bounce' : ''}">${renderToStaticMarkup(<FlagIcon className="h-7 w-6" />)}</span>`,
  })

/** 지도 이동 제어: 선택 매장·포커스한 발견으로 부드럽게 옮긴다 */
function Fly({ to, zoom }: { to: [number, number] | null; zoom?: number }) {
  const map = useMap()
  useEffect(() => {
    if (to) map.flyTo(to, zoom ?? Math.max(map.getZoom(), 16), { duration: 0.6 })
  }, [to?.[0], to?.[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
function Locate({ tick }: { tick: number }) {
  const map = useMap()
  useEffect(() => {
    if (tick) map.flyTo(ME, 16, { duration: 0.6 })
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export function Map2() {
  const { finds, open, mapFocus, setMapFocus, notify } = useApp()
  const [showFinds, setShowFinds] = useState(true)
  const [near, setNear] = useState(true)
  const [openOnly, setOpenOnly] = useState(false)
  const [sel, setSel] = useState<string>(STORES[0].id)
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null)
  const [locate, setLocate] = useState(0)
  const rail = useRef<HTMLDivElement>(null)
  const stores = STORES.filter((s) => !openOnly || s.open).sort((a, b) => (near ? a.distance - b.distance : 0))
  const flags = finds.filter((f) => f.city === '도쿄' && (f.photo || f.mine))

  const go = (id: string, scroll = true) => {
    setSel(id)
    const s = STORES.find((x) => x.id === id)
    if (s) setFlyTo([s.lat, s.lng])
    if (!scroll) return
    const i = stores.findIndex((x) => x.id === id)
    const el = rail.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  }
  useEffect(() => {
    if (!mapFocus) return
    if (mapFocus.startsWith('f:')) {
      setShowFinds(true)
      const f = finds.find((x) => `f:${x.id}` === mapFocus)
      if (f) setFlyTo(findLatLng(f))
    } else if (STORES.some((s) => s.id === mapFocus)) window.setTimeout(() => go(mapFocus), 200)
    const t = window.setTimeout(() => setMapFocus(null), 1600)
    return () => window.clearTimeout(t)
  }, [mapFocus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pk relative mx-auto h-dvh w-full max-w-[480px] overflow-hidden" style={{ background: '#F4F4F2' }}>
      <MapContainer center={ME} zoom={16} minZoom={12} maxZoom={17} maxBounds={BOUNDS} maxBoundsViscosity={1} zoomControl={false} attributionControl={false} className="absolute inset-0 z-0 size-full" style={{ background: '#F4F4F2' }}>
        <TileLayer url={TILE_URL} bounds={BOUNDS} maxNativeZoom={17} />
        <Fly to={flyTo} />
        <Locate tick={locate} />
        <Marker position={ME} icon={meIcon} interactive={false} keyboard={false} />
        {showFinds &&
          flags.map((f) => (
            <Marker key={f.id} position={findLatLng(f)} icon={flagIcon(mapFocus === `f:${f.id}`)} title={`발견: ${f.title}`} eventHandlers={{ click: () => open({ type: 'find', id: f.id }) }} />
          ))}
        {stores.map((s) => (
          <Marker key={s.id + (s.id === sel)} position={[s.lat, s.lng]} icon={storeIcon(s.id === sel)} title={s.name} zIndexOffset={s.id === sel ? 1000 : 0} eventHandlers={{ click: () => go(s.id) }} />
        ))}
      </MapContainer>

      {/* 상단: 위치 · 검색 · 필터 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[10] px-4 pt-[env(safe-area-inset-top)] [&>*]:pointer-events-auto">
        <div className="flex h-[60px] items-center justify-between">
          <button className="t-body-m flex h-10 items-center gap-2 rounded-full bg-white px-4 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <MapPin className="size-5" strokeWidth={1.8} />
            도쿄 • 시부야
          </button>
          <SearchCircle onClick={() => notify('검색은 곧 열려요')} />
        </div>
        <div className="flex w-max gap-2">
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

      {/* 지도 출처 표기 */}
      <p className="t-cap2 absolute left-5 z-[10] bottom-[calc(262px+env(safe-area-inset-bottom))] rounded-full bg-white/80 px-2" style={{ color: C.sub }}>
        <a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
      </p>

      {/* 내 위치로 */}
      <IconBtn label="내 위치로" onClick={() => setLocate((n) => n + 1)} className="absolute right-6 z-[10] bottom-[calc(262px+env(safe-area-inset-bottom))] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <Crosshair className="size-6" strokeWidth={1.6} />
      </IconBtn>

      {/* 매장 카드 레일 */}
      <div
        ref={rail}
        className="no-scrollbar absolute inset-x-0 z-[10] bottom-[calc(112px+env(safe-area-inset-bottom))] flex snap-x snap-mandatory scroll-px-5 gap-2 overflow-x-auto px-5"
        onScroll={(e) => {
          const w = (e.currentTarget.firstElementChild as HTMLElement | null)?.offsetWidth ?? 342
          const i = Math.round(e.currentTarget.scrollLeft / (w + 8))
          if (stores[i] && stores[i].id !== sel) go(stores[i].id, false)
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
  const buy = (p: Product) => {
    update(p.id, { purchased: !p.purchased })
    if (!p.purchased) {
      celebrateCarry()
      notify('캐리어에 담았어요')
    }
  }
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

          <StoreSection title="이 곳에서 찾을 상품" list={must} empty="이 매장에서 살 수 있는 '꼭 살래' 상품이 없어요" onToggle={(p) => buy(p)} onOpen={(p) => open({ type: 'product', id: p.id })} />
          {!!maybe.length && <StoreSection title="고민 중인 상품" list={maybe} onToggle={(p) => buy(p)} onOpen={(p) => open({ type: 'product', id: p.id })} />}

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
