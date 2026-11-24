import { AnimatePresence, motion, useMotionValue } from 'motion/react'
import { toPng } from 'html-to-image'
import { Camera, ChevronLeft, Download, List, Plus, Share2, Sparkles, Wind, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { STICKER_LIST, Sticker } from '@/components/art/Stickers'
import { Suitcase } from '@/components/art/Suitcase'
import { Button } from '@/components/ui/button'
import { IconBtn, Panel, Segmented, Sheet } from '@/components/ui/primitives'
import { useApp } from '@/lib/store'
import type { PlacedSticker, Product, StickerKind, Trip } from '@/lib/types'
import { cn, shortRange, toWon, uid, won, yen } from '@/lib/utils'
import { MOOD } from './ProductDetail'

export function Carry() {
  const { trips, products, open } = useApp()
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pt-[max(18px,env(safe-area-inset-top))] pb-32 lg:px-10 lg:pt-10">
      <h1 className="display text-[30px] lg:text-[36px]">캐리어</h1>
      <p className="mt-1 text-[14px] text-muted">여행마다 쌓이는 나의 컬렉션</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {trips.map((t, i) => {
          const bought = products.filter((p) => p.tripId === t.id && p.purchased)
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => open({ type: 'carry', tripId: t.id })}
              className="flex flex-col items-center rounded-[24px] bg-surface p-4 pb-5 text-center shadow-[var(--shadow-card)]"
            >
              <div className="w-[62%] py-2">
                <DecoratedSuitcase trip={t} mini />
              </div>
              <p className="mt-3 line-clamp-2 text-[14.5px] leading-snug font-bold">{t.name}</p>
              <p className="mt-1 text-[12px] text-muted tabular">{shortRange(t.start, t.end)}</p>
              <span className="mt-2 rounded-full bg-sunken px-2.5 py-1 text-[11.5px] font-bold text-ink-2">구매 {bought.length}개</span>
            </motion.button>
          )
        })}
        <button onClick={() => open({ type: 'create' })} className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed border-line text-[14px] font-semibold text-muted hover:bg-surface/60">
          <span className="grid size-11 place-items-center rounded-full bg-surface shadow-[var(--shadow-card)]">
            <Plus className="size-5" />
          </span>
          새 여행 캐리어
        </button>
      </div>
    </div>
  )
}

function DecoratedSuitcase({ trip, mini, children }: { trip: Trip; mini?: boolean; children?: React.ReactNode }) {
  return (
    <div className="relative">
      <Suitcase color={trip.suitcase.color} model={trip.suitcase.model} className="w-full" id={`${trip.id}${mini ? 'm' : ''}`} />
      {mini &&
        trip.stickers.map((s) => (
          <div key={s.id} className="absolute w-[30%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: `${s.rot}deg` }}>
            <Sticker kind={s.kind} />
          </div>
        ))}
      {children}
    </div>
  )
}

export function CarryDetail({ tripId, z }: { tripId: string; z: number }) {
  const { trips, products, close, rate } = useApp()
  const trip = trips.find((t) => t.id === tripId)
  const [mode, setMode] = useState<'outside' | 'inside'>('outside')
  const [shot, setShot] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  if (!trip) return null
  const bought = products.filter((p) => p.tripId === trip.id && p.purchased)
  const total = bought.reduce((s, p) => s + p.price, 0)

  const capture = async () => {
    if (!stage.current) return
    setBusy(true)
    try {
      const url = await toPng(stage.current, { pixelRatio: 2, cacheBust: true, filter: (n) => !(n instanceof HTMLElement && n.dataset.noCapture) })
      setShot(url)
    } catch {
      setShot(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel onClose={close} z={z} wide>
      <header className="flex items-center gap-2 px-3 pt-[max(8px,env(safe-area-inset-top))]">
        <button aria-label="뒤로" onClick={close} className="grid size-11 place-items-center rounded-full hover:bg-sunken">
          <ChevronLeft className="size-6" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold">{trip.name}</h1>
          <p className="text-[12px] text-muted tabular">
            {trip.city} · {shortRange(trip.start, trip.end)}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={capture} disabled={busy}>
          <Camera className="size-4" /> {busy ? '만드는 중' : '이미지로 저장'}
        </Button>
      </header>
      <div className="px-5 pt-3">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'outside', label: '겉면 꾸미기' },
            { value: 'inside', label: `안에 담긴 것 ${bought.length}` },
          ]}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div ref={stage} className="relative mx-5 mt-4 min-h-[420px] flex-1 overflow-hidden rounded-[28px] bg-[radial-gradient(120%_80%_at_50%_0%,#ffffff_0%,#EFEDE8_70%)]">
          <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(#d9d6ce_1px,transparent_1px)] [background-size:18px_18px]" />
          <p className="absolute top-4 left-5 text-[12px] font-extrabold tracking-[0.12em] text-ink/70">
            {trip.city.toUpperCase() === trip.city ? trip.city : trip.city} · {trip.start.slice(0, 7).replace('-', '.')}
          </p>
          <AnimatePresence mode="wait">
            {mode === 'outside' ? <Outside key="o" trip={trip} /> : <Inside key="i" trip={trip} items={bought} />}
          </AnimatePresence>
        </div>
        {mode === 'outside' ? (
          <StickerTray trip={trip} />
        ) : (
          <div className="flex items-center justify-between px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div>
              <p className="text-[13px] font-semibold text-muted">구매 {bought.length}개</p>
              <p className="text-[20px] font-extrabold tracking-tight tabular">
                {yen(total)} <span className="text-[13px] font-medium text-muted">약 {won(toWon(total, rate))}</span>
              </p>
            </div>
            <PurchaseList items={bought} />
          </div>
        )}
      </div>
      <Sheet open={!!shot} onClose={() => setShot(null)} title="캐리어 이미지">
        {shot && (
          <>
            <img src={shot} alt={`${trip.name} 캐리어`} className="max-h-[52dvh] w-full rounded-[20px] object-contain ring-1 ring-line" />
            <p className="mt-3 text-center text-[12.5px] text-muted">이미지를 길게 누르거나 우클릭해서 저장할 수도 있어요</p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = shot
                  a.download = `packit-${trip.city}.png`
                  a.click()
                }}
              >
                <Download className="size-5" /> 저장
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={async () => {
                  try {
                    const blob = await (await fetch(shot)).blob()
                    const file = new File([blob], `packit-${trip.city}.png`, { type: 'image/png' })
                    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: trip.name })
                  } catch {
                    /* share not available here */
                  }
                }}
              >
                <Share2 className="size-5" /> 공유
              </Button>
            </div>
          </>
        )}
      </Sheet>
    </Panel>
  )
}

function Outside({ trip }: { trip: Trip }) {
  const { updateTrip } = useApp()
  const box = useRef<HTMLDivElement>(null)
  const [peeling, setPeeling] = useState<string | null>(null)
  const move = (s: PlacedSticker, point: { x: number; y: number }) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    const x = Math.min(96, Math.max(4, ((point.x - r.left) / r.width) * 100))
    const y = Math.min(94, Math.max(8, ((point.y - r.top) / r.height) * 100))
    updateTrip(trip.id, { stickers: trip.stickers.map((t) => (t.id === s.id ? { ...t, x, y } : t)) })
  }
  const peel = (id: string) => {
    setPeeling(id)
    window.setTimeout(() => {
      updateTrip(trip.id, { stickers: trip.stickers.filter((t) => t.id !== id) })
      setPeeling(null)
    }, 380)
  }
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="absolute inset-0 flex items-center justify-center pt-6 pb-4">
      <div ref={box} className="relative h-[86%] aspect-[240/340]">
        <Suitcase color={trip.suitcase.color} model={trip.suitcase.model} className="h-full w-full" id={`${trip.id}-big`} />
        <AnimatePresence>
          {trip.stickers.map((s) => (
            <PlacedStickerItem key={s.id} s={s} peeling={peeling === s.id} onMove={(pt) => move(s, pt)} onPeel={() => peel(s.id)} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function PlacedStickerItem({ s, peeling, onMove, onPeel }: { s: PlacedSticker; peeling: boolean; onMove: (p: { x: number; y: number }) => void; onPeel: () => void }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.12, zIndex: 20 }}
      onDragEnd={(_, info) => {
        onMove(info.point)
        x.set(0)
        y.set(0)
      }}
      onTap={onPeel}
      initial={{ scale: 0, rotate: s.rot - 25 }}
      animate={peeling ? { rotate: s.rot + 45, scale: 0.6, opacity: 0 } : { scale: 1, rotate: s.rot, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
      className="absolute w-[32%] cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, left: `${s.x}%`, top: `${s.y}%`, translateX: '-50%', translateY: '-50%' }}
      role="button"
      aria-label="붙인 스티커 (탭하면 떼어져요)"
    >
      <Sticker kind={s.kind} className="pointer-events-none" />
    </motion.div>
  )
}

function StickerTray({ trip }: { trip: Trip }) {
  const { updateTrip, notify } = useApp()
  const add = (kind: StickerKind) => {
    const s: PlacedSticker = { id: uid(), kind, x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, rot: Math.round(Math.random() * 30 - 15) }
    updateTrip(trip.id, { stickers: [...trip.stickers, s] })
    if (trip.stickers.length === 0) notify('드래그해서 옮기고, 탭하면 떼어져요')
  }
  return (
    <div className="px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      <p className="mb-2 text-[12.5px] text-muted">스티커를 눌러 붙이고, 드래그해서 옮기고, 탭해서 떼어 내요</p>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {STICKER_LIST.map((s) => (
          <button key={s.kind} onClick={() => add(s.kind)} aria-label={`${s.name} 스티커 붙이기`} className="grid size-[72px] shrink-0 place-items-center rounded-[20px] bg-surface shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-95">
            <Sticker kind={s.kind} className="size-14" />
          </button>
        ))}
      </div>
    </div>
  )
}

type Pos = { x: number; y: number; r: number }
/** spread items around the center (golden-angle spiral + jitter) inside the open case */
const scatter = (n: number, w: number, h: number): Pos[] => {
  const rx = w * 0.26
  const ry = h * 0.26
  const off = Math.random() * Math.PI * 2
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : Math.sqrt((i + 0.5) / n)
    const a = off + i * 2.39996
    return {
      x: Math.cos(a) * rx * t + (Math.random() - 0.5) * 18,
      y: Math.sin(a) * ry * t + (Math.random() - 0.5) * 18,
      r: Math.round(Math.random() * 36 - 18),
    }
  })
}

function Inside({ trip, items }: { trip: Trip; items: Product[] }) {
  const area = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 360, h: 420 })
  const [pos, setPos] = useState<Pos[]>([])
  const [opened, setOpened] = useState(false)
  const [focus, setFocus] = useState<string | null>(null)

  useLayoutEffect(() => {
    const el = area.current
    if (el) setSize({ w: el.clientWidth, h: el.clientHeight })
  }, [])
  useEffect(() => {
    const t = window.setTimeout(() => {
      setOpened(true)
      setPos(scatter(items.length, size.w, size.h))
    }, 650)
    return () => window.clearTimeout(t)
  }, [items.length, size.w, size.h])

  const shake = () => setPos(scatter(items.length, size.w, size.h))
  const lining = useMemo(() => trip.suitcase.color, [trip.suitcase.color])

  return (
    <motion.div ref={area} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
      {/* open suitcase shell */}
      <div className="absolute inset-x-[8%] top-[12%] bottom-[8%] rounded-[36px] p-3" style={{ background: lining }}>
        <div className="h-full w-full rounded-[26px] bg-[repeating-linear-gradient(45deg,#ffffff_0_10px,#f6f4ef_10px_20px)] shadow-[inset_0_6px_18px_rgba(0,0,0,0.12)]" />
        <span className="absolute top-1/2 left-1/2 h-[70%] w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/5" />
      </div>
      {/* lid flipping open */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            className="absolute inset-x-[8%] top-[12%] bottom-[8%] origin-top"
            style={{ perspective: 800 }}
            initial={{ rotateX: 0 }}
            exit={{ rotateX: -95, opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}
          >
            <div className="h-full w-full rounded-[36px] shadow-[var(--shadow-float)]" style={{ background: lining }}>
              <div className="grid h-full place-items-center">
                <Sparkles className="size-10 text-white/80" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 && opened && (
        <div className="absolute inset-0 grid place-items-center px-10 text-center">
          <p className="rounded-2xl bg-white/90 px-5 py-4 text-[14px] text-muted shadow-[var(--shadow-card)]">
            상품 상세에서 <b className="text-ink">샀어요</b>를 체크하면
            <br />
            여기에 담겨요
          </p>
        </div>
      )}

      {opened &&
        items.map((p, i) => (
          <motion.button
            key={p.id}
            drag
            dragConstraints={area}
            dragElastic={0.35}
            dragTransition={{ power: 0.35, timeConstant: 260, bounceStiffness: 300, bounceDamping: 14 }}
            whileDrag={{ scale: 1.1, zIndex: 30 }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{ x: pos[i]?.x ?? 0, y: pos[i]?.y ?? 0, rotate: pos[i]?.r ?? 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 13, delay: i * 0.06 }}
            onTap={() => setFocus(p.id)}
            className="absolute top-1/2 left-1/2 -mt-[52px] -ml-[44px] w-[88px] cursor-grab touch-none active:cursor-grabbing"
            aria-label={p.name}
          >
            <ProductArt art={p.art} className="pointer-events-none aspect-[4/5] w-full rounded-[18px] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.35)] ring-2 ring-white" />
          </motion.button>
        ))}

      {opened && items.length > 0 && (
        <button data-no-capture="1" onClick={shake} className="absolute right-4 bottom-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-bold text-white shadow-[var(--shadow-float)] active:scale-95">
          <Wind className="size-4" /> 흔들기
        </button>
      )}
      <ItemSheet id={focus} onClose={() => setFocus(null)} />
    </motion.div>
  )
}

function ItemSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { products, update, rate } = useApp()
  const p = products.find((x) => x.id === id)
  return (
    <Sheet open={!!p} onClose={onClose}>
      {p && (
        <div>
          <div className="flex items-center gap-4">
            <ProductArt art={p.art} className="size-20 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-bold tracking-wide text-muted">{p.brand}</p>
              <h3 className="mt-0.5 line-clamp-2 text-[16px] font-bold">{p.name}</h3>
              <p className="mt-1 text-[14px] tabular">
                <b className="font-extrabold">{yen(p.price)}</b> <span className="text-muted">약 {won(toWon(p.price, rate))}</span>
              </p>
            </div>
            <button aria-label="닫기" onClick={onClose} className="grid size-9 place-items-center self-start rounded-full bg-sunken">
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-6 text-[15px] font-bold">사 보니 어땠어요?</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(MOOD) as (keyof typeof MOOD)[]).map((k) => {
              const M = MOOD[k]
              const on = p.myMood === k
              return (
                <button key={k} onClick={() => update(p.id, { myMood: on ? undefined : k })} aria-pressed={on} className={cn('flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl text-[13px] font-bold transition', on ? 'bg-ink text-white' : 'bg-sunken text-ink-2')}>
                  <M.icon className="size-6" />
                  {M.label}
                </button>
              )
            })}
          </div>
          <Button size="lg" className="mt-5 w-full" onClick={onClose}>
            후기 남기기
          </Button>
        </div>
      )}
    </Sheet>
  )
}

function PurchaseList({ items }: { items: Product[] }) {
  const [show, setShow] = useState(false)
  const { rate } = useApp()
  return (
    <>
      <IconBtn label="구매 목록" onClick={() => setShow(true)}>
        <List className="size-[18px]" />
      </IconBtn>
      <Sheet open={show} onClose={() => setShow(false)} title={`구매 ${items.length}개`}>
        <ul className="max-h-[56dvh] overflow-y-auto">
          {items.map((p) => {
            const M = p.myMood ? MOOD[p.myMood] : null
            return (
              <li key={p.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <ProductArt art={p.art} className="size-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[14px] font-semibold">{p.name}</p>
                  <p className="text-[12.5px] text-muted tabular">
                    {yen(p.price)} · 약 {won(toWon(p.price, rate))}
                  </p>
                </div>
                {M && (
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-bold', M.cls)}>
                    <M.icon className="size-3.5" /> {M.label}
                  </span>
                )}
              </li>
            )
          })}
          {!items.length && <li className="py-8 text-center text-[14px] text-muted">아직 구매한 상품이 없어요</li>}
        </ul>
      </Sheet>
    </>
  )
}

export { DecoratedSuitcase }
