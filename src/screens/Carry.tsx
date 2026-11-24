import { AnimatePresence, motion, useMotionValue, type PanInfo } from 'motion/react'
import { toPng } from 'html-to-image'
import { ArrowLeft, Camera, Check, ChevronUp, Download, List, Plus, Share2, Trash2, Wind, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { STICKER_LIST, Sticker } from '@/components/art/Stickers'
import { Suitcase } from '@/components/art/Suitcase'
import { tiltOf } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { IconBtn, Sheet } from '@/components/ui/primitives'
import { useApp } from '@/lib/store'
import type { PlacedSticker, Product, StickerKind, Trip } from '@/lib/types'
import { cn, shortRange, toWon, uid, won, yen } from '@/lib/utils'
import { MOOD } from './ProductDetail'

/* ---------------- Carry tab ---------------- */

export function Carry() {
  const { trips, products, open } = useApp()
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-[max(20px,env(safe-area-inset-top))] pb-32 lg:px-10 lg:pt-12">
      <h1 className="text-[28px] leading-[1.15] tracking-tight lg:text-[34px]">
        <span className="font-normal text-ink-2">여행마다 쌓이는</span>
        <br />
        <b className="font-bold">나의 캐리어</b>
      </h1>
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3">
        {trips.map((t, i) => {
          const bought = products.filter((p) => p.tripId === t.id && p.purchased)
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => open({ type: 'carry', tripId: t.id })}
              className="group flex flex-col rounded-[var(--radius-card)] bg-surface p-4 text-left"
            >
              <p className="truncate text-[15px] font-semibold">{t.name}</p>
              <p className="mt-0.5 text-[12.5px] text-muted tabular">{shortRange(t.start, t.end)}</p>
              <div className="mx-auto mt-3 w-[58%] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-2deg]">
                <DecoratedSuitcase trip={t} />
              </div>
              <span className="mt-3 text-[12.5px] font-medium text-muted">구매 {bought.length}개</span>
            </motion.button>
          )
        })}
        <button onClick={() => open({ type: 'create' })} className="flex min-h-[250px] flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-line text-[14px] font-medium text-muted hover:bg-surface/60">
          <span className="grid size-11 place-items-center rounded-full bg-surface">
            <Plus className="size-5" />
          </span>
          새 여행 캐리어
        </button>
      </div>
    </div>
  )
}

export function DecoratedSuitcase({ trip }: { trip: Trip }) {
  return (
    <div className="relative">
      <Suitcase color={trip.suitcase.color} model={trip.suitcase.model} className="w-full" id={`${trip.id}m`} />
      {trip.stickers.map((s) => (
        <div key={s.id} className="absolute w-[30%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: `${s.rot}deg` }}>
          <Sticker kind={s.kind} />
        </div>
      ))}
    </div>
  )
}

/* ---------------- Carry detail: customise + inside ---------------- */

const inRect = (p: { x: number; y: number }, r?: DOMRect | null, pad = 0) => !!r && p.x >= r.left - pad && p.x <= r.right + pad && p.y >= r.top - pad && p.y <= r.bottom + pad

export function CarryDetail({ tripId, z }: { tripId: string; z: number }) {
  const { trips, products, close, rate, notify } = useApp()
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
      setShot(await toPng(stage.current, { pixelRatio: 2, backgroundColor: '#ffffff', filter: (n) => !(n instanceof HTMLElement && n.dataset.noCapture) }))
    } catch {
      notify('이미지를 만들지 못했어요')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div className="fixed inset-0 flex flex-col bg-white" style={{ zIndex: z }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }}>
      <div className="mx-auto flex h-full w-full max-w-[560px] flex-col">
        <header className="grid grid-cols-[48px_1fr_auto] items-center px-3 pt-[max(8px,env(safe-area-inset-top))]">
          <button aria-label="뒤로" onClick={close} className="grid size-11 place-items-center rounded-full hover:bg-sunken">
            <ArrowLeft className="size-[22px]" />
          </button>
          <div className="text-center">
            <h1 className="text-[16px] font-semibold">{mode === 'outside' ? '캐리어 꾸미기' : '캐리어 속 쇼핑'}</h1>
            <p className="text-[12px] text-muted tabular">
              {trip.name} · {shortRange(trip.start, trip.end)}
            </p>
          </div>
          <div className="flex items-center">
            <button aria-label="이미지로 저장" onClick={capture} disabled={busy} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken disabled:text-faint">
              <Camera className="size-[20px]" />
            </button>
            <button
              aria-label="완료"
              onClick={() => {
                notify('캐리어를 저장했어요')
                close()
              }}
              className="grid size-11 place-items-center rounded-full hover:bg-sunken"
            >
              <Check className="size-[22px]" strokeWidth={2.4} />
            </button>
          </div>
        </header>

        <div className="mt-2 flex justify-center">
          <div className="flex rounded-full bg-sunken p-1" role="tablist">
            {(['outside', 'inside'] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn('relative h-8 rounded-full px-4 text-[13px] font-semibold transition-colors', mode === m ? 'text-ink' : 'text-muted')}>
                {mode === m && <motion.span layoutId="carry-mode" className="absolute inset-0 rounded-full bg-white shadow-sm" />}
                <span className="relative">{m === 'outside' ? '겉면' : `안쪽 ${bought.length}`}</span>
              </button>
            ))}
          </div>
        </div>

        <div ref={stage} className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait">{mode === 'outside' ? <Customise key="o" trip={trip} /> : <Inside key="i" trip={trip} items={bought} />}</AnimatePresence>
        </div>

        {mode === 'inside' && (
          <div className="flex items-center justify-between px-6 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div>
              <p className="text-[13px] text-muted">구매 {bought.length}개</p>
              <p className="text-[20px] font-bold tracking-tight tabular">
                {yen(total)} <span className="text-[13px] font-normal text-muted">약 {won(toWon(total, rate))}</span>
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
                    else notify('이 환경에서는 공유할 수 없어요')
                  } catch {
                    /* cancelled */
                  }
                }}
              >
                <Share2 className="size-5" /> 공유
              </Button>
            </div>
          </>
        )}
      </Sheet>
    </motion.div>
  )
}

/* ----- outside: drag stickers from a sheet onto the suitcase ----- */

/** scattered layout for the sticker sheet: [left%, top px, size px, rotation] */
const SHEET_LAYOUT: [number, number, number, number][] = [
  [6, 18, 92, -8], [38, 8, 84, 6], [70, 22, 88, -4],
  [4, 128, 104, 3], [40, 118, 86, -10], [70, 132, 90, 8],
  [8, 236, 86, 10], [38, 230, 92, -5], [70, 240, 84, 4],
  [6, 340, 90, -6], [40, 336, 84, 9], [70, 344, 88, -3],
]

function Customise({ trip }: { trip: Trip }) {
  const { updateTrip } = useApp()
  const box = useRef<HTMLDivElement>(null)
  const trash = useRef<HTMLButtonElement>(null)
  const [sheet, setSheet] = useState(trip.stickers.length < 2)
  const [dragFromSheet, setDragFromSheet] = useState<StickerKind | null>(null)
  const [draggingPlaced, setDraggingPlaced] = useState(false)
  const [overTrash, setOverTrash] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const toPct = (pt: { x: number; y: number }) => {
    const r = box.current!.getBoundingClientRect()
    return { x: Math.min(94, Math.max(6, ((pt.x - r.left) / r.width) * 100)), y: Math.min(90, Math.max(12, ((pt.y - r.top) / r.height) * 100)) }
  }
  const add = (kind: StickerKind, pt?: { x: number; y: number }) => {
    const pos = pt ? toPct(pt) : { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 }
    updateTrip(trip.id, { stickers: [...trip.stickers, { id: uid(), kind, ...pos, rot: Math.round(Math.random() * 24 - 12) }] })
  }
  const remove = (id: string) => updateTrip(trip.id, { stickers: trip.stickers.filter((t) => t.id !== id) })
  const move = (s: PlacedSticker, pt: { x: number; y: number }) => updateTrip(trip.id, { stickers: trip.stickers.map((t) => (t.id === s.id ? { ...t, ...toPct(pt) } : t)) })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col" onClick={() => setSelected(null)}>
      {/* suitcase */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
        <motion.div ref={box} animate={{ scale: sheet && !dragFromSheet ? 0.9 : 1, y: sheet && !dragFromSheet ? -30 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="relative aspect-[240/340] h-[88%] max-h-[520px]">
          <Suitcase color={trip.suitcase.color} model={trip.suitcase.model} className="h-full w-full" id={`${trip.id}-big`} />
          <AnimatePresence>
            {trip.stickers.map((s) => (
              <PlacedStickerItem
                key={s.id}
                s={s}
                selected={selected === s.id}
                onSelect={() => setSelected(s.id)}
                onRemove={() => remove(s.id)}
                onDragState={(d) => {
                  setDraggingPlaced(d)
                  if (!d) setOverTrash(false)
                }}
                onDragMove={(pt) => setOverTrash(inRect(pt, trash.current?.getBoundingClientRect(), 24))}
                onDrop={(pt) => (inRect(pt, trash.current?.getBoundingClientRect(), 24) ? remove(s.id) : move(s, pt))}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        {trip.stickers.length === 0 && !sheet && <p className="absolute bottom-6 text-[13px] text-muted">아래 스티커를 끌어와 붙여 보세요</p>}
      </div>

      {/* bottom bar */}
      <div className="relative z-10 flex items-center justify-center gap-3 px-5 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]" data-no-capture="1">
        <motion.button
          ref={trash}
          aria-label="스티커를 여기로 끌어 떼기"
          animate={{ scale: overTrash ? 1.25 : draggingPlaced ? 1.1 : 1 }}
          className={cn('grid size-12 place-items-center rounded-full transition-colors', overTrash ? 'bg-brand text-white' : draggingPlaced ? 'bg-brand-soft text-brand' : 'bg-sunken text-ink-2')}
          onClick={(e) => {
            e.stopPropagation()
            if (selected) {
              remove(selected)
              setSelected(null)
            }
          }}
        >
          <Trash2 className="size-5" />
        </motion.button>
        <button onClick={(e) => { e.stopPropagation(); setSheet(true) }} className="flex h-12 items-center gap-2 rounded-full bg-sunken px-5 text-[14.5px] font-semibold">
          <ChevronUp className="size-4" /> 스티커
        </button>
        <button onClick={(e) => { e.stopPropagation(); setSheet(false) }} className="h-12 rounded-full bg-ink px-6 text-[14.5px] font-semibold text-white">
          저장
        </button>
      </div>

      {/* sticker sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div
            data-no-capture="1"
            className="absolute inset-x-0 bottom-0 z-20 h-[62%]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info: PanInfo) => info.offset.y > 90 && setSheet(false)}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div animate={{ opacity: dragFromSheet ? 0 : 1 }} className="absolute inset-0 rounded-t-[32px] bg-white/80 shadow-[0_-12px_40px_-20px_rgba(20,20,19,0.25)] ring-1 ring-black/[0.04] backdrop-blur-xl" />
            <div className="relative flex justify-center pt-3 pb-1">
              <span className="h-1.5 w-10 rounded-full bg-line" />
            </div>
            <div className="relative mx-auto h-[calc(100%-28px)] max-w-[440px] overflow-y-auto px-3 pb-8">
              <div className="relative h-[450px]">
                {STICKER_LIST.map((st, i) => {
                  const [l, t, size, r] = SHEET_LAYOUT[i]
                  return (
                    <motion.button
                      key={st.kind}
                      aria-label={`${st.name} 스티커 붙이기`}
                      className="absolute cursor-grab touch-none active:cursor-grabbing"
                      style={{ left: `${l}%`, top: t, width: size }}
                      initial={{ scale: 0, rotate: r - 20 }}
                      animate={{ scale: 1, rotate: r, opacity: dragFromSheet && dragFromSheet !== st.kind ? 0 : 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.025 }}
                      drag
                      dragSnapToOrigin
                      whileDrag={{ scale: 1.15, zIndex: 50 }}
                      onDragStart={() => setDragFromSheet(st.kind)}
                      onDragEnd={(_, info) => {
                        setDragFromSheet(null)
                        if (inRect(info.point, box.current?.getBoundingClientRect())) {
                          add(st.kind, info.point)
                          setSheet(false)
                        }
                      }}
                      onTap={() => {
                        add(st.kind)
                        setSheet(false)
                      }}
                    >
                      <Sticker kind={st.kind} className="pointer-events-none w-full" />
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PlacedStickerItem({
  s,
  selected,
  onSelect,
  onRemove,
  onDragState,
  onDragMove,
  onDrop,
}: {
  s: PlacedSticker
  selected: boolean
  onSelect: () => void
  onRemove: () => void
  onDragState: (dragging: boolean) => void
  onDragMove: (p: { x: number; y: number }) => void
  onDrop: (p: { x: number; y: number }) => void
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.12, zIndex: 30 }}
      onDragStart={() => onDragState(true)}
      onDrag={(_, info) => onDragMove(info.point)}
      onDragEnd={(_, info) => {
        onDragState(false)
        onDrop(info.point)
        x.set(0)
        y.set(0)
      }}
      onTap={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      initial={{ scale: 1.5, opacity: 0, rotate: s.rot - 12 }}
      animate={{ scale: 1, opacity: 1, rotate: s.rot }}
      exit={{ scale: 0.4, opacity: 0, rotate: s.rot + 30, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="absolute w-[30%] cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, left: `${s.x}%`, top: `${s.y}%`, translateX: '-50%', translateY: '-50%', zIndex: selected ? 20 : undefined }}
      role="button"
      aria-label="붙인 스티커 (끌어서 옮기기)"
    >
      <Sticker kind={s.kind} className={cn('pointer-events-none w-full', selected && 'outline-2 outline-offset-4 outline-dashed outline-ink/30')} />
      {selected && (
        <button
          data-no-capture="1"
          aria-label="스티커 떼기"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -top-3 -right-3 grid size-7 place-items-center rounded-full bg-ink text-white shadow"
        >
          <X className="size-4" />
        </button>
      )}
    </motion.div>
  )
}

/* ----- inside: purchased items with physics ----- */

type Pos = { x: number; y: number; r: number }
/** spread items around the center (golden-angle spiral + jitter) inside the open case */
const scatter = (n: number, w: number, h: number): Pos[] => {
  const rx = w * 0.26
  const ry = h * 0.26
  const off = Math.random() * Math.PI * 2
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : Math.sqrt((i + 0.5) / n)
    const a = off + i * 2.39996
    return { x: Math.cos(a) * rx * t + (Math.random() - 0.5) * 18, y: Math.sin(a) * ry * t + (Math.random() - 0.5) * 18, r: Math.round(Math.random() * 36 - 18) }
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

  const shell = trip.suitcase.color
  return (
    <motion.div ref={area} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
      <div className="absolute inset-x-[9%] top-[6%] bottom-[6%] rounded-[36px] p-3" style={{ background: shell }}>
        <div className="h-full w-full rounded-[26px] bg-[#F5F5F5] shadow-[inset_0_8px_22px_rgba(0,0,0,0.12)]" />
        <span className="absolute top-1/2 left-1/2 h-[70%] w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/5" />
      </div>
      <AnimatePresence>
        {!opened && (
          <motion.div className="absolute inset-x-[9%] top-[6%] bottom-[6%] origin-top" style={{ perspective: 800 }} exit={{ rotateX: -95, opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}>
            <div className="h-full w-full rounded-[36px] shadow-[var(--shadow-float)]" style={{ background: shell }} />
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 && opened && (
        <div className="absolute inset-0 grid place-items-center px-10 text-center">
          <p className="text-[14px] leading-relaxed text-muted">
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
            className="absolute top-1/2 left-1/2 -mt-[50px] -ml-[50px] w-[100px] cursor-grab touch-none active:cursor-grabbing"
            aria-label={p.name}
          >
            <ProductArt art={p.art} tone="none" tilt={tiltOf(p.id)} className="pointer-events-none aspect-square w-full" />
          </motion.button>
        ))}

      {opened && items.length > 0 && (
        <button data-no-capture="1" onClick={() => setPos(scatter(items.length, size.w, size.h))} className="absolute right-[12%] bottom-[9%] inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-white active:scale-95">
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
              <p className="text-[11.5px] font-semibold tracking-wide text-faint">{p.brand}</p>
              <h3 className="mt-0.5 line-clamp-2 text-[16px] font-semibold">{p.name}</h3>
              <p className="mt-1 text-[14px] tabular">
                <b className="font-bold">{yen(p.price)}</b> <span className="text-muted">약 {won(toWon(p.price, rate))}</span>
              </p>
            </div>
            <button aria-label="닫기" onClick={onClose} className="grid size-9 place-items-center self-start rounded-full bg-sunken">
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-6 text-[15px] font-semibold">사 보니 어땠어요?</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(MOOD) as (keyof typeof MOOD)[]).map((k) => {
              const M = MOOD[k]
              const on = p.myMood === k
              return (
                <button key={k} onClick={() => update(p.id, { myMood: on ? undefined : k })} aria-pressed={on} className={cn('flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl text-[13px] font-semibold transition', on ? 'bg-ink text-white' : 'bg-sunken text-ink-2')}>
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
      <IconBtn label="구매 목록" onClick={() => setShow(true)} className="bg-sunken shadow-none">
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
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-semibold', M.cls)}>
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
