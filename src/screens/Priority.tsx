import { AnimatePresence, motion, useIsPresent, useMotionValue, useMotionValueEvent, useTransform, animate, type MotionValue, type PanInfo } from 'motion/react'
import { ArrowLeft, Heart, Hourglass, RotateCcw, ShoppingBag, Undo2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { ProductRow } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { PRIORITY_ICON, PRIORITY_META, Panel, Segmented } from '@/components/ui/primitives'
import { useApp } from '@/lib/store'
import type { Priority as P, Product } from '@/lib/types'
import { cn, toWon, won, yen } from '@/lib/utils'

const COLS: P[] = ['must', 'maybe', 'skip']

/** 쇼핑 준비 현황 — opened from the home summary card (priority now lives on home) */
export function PlanPanel({ z }: { z: number }) {
  const { tripProducts, rate, trip, open, close } = useApp()
  const [tab, setTab] = useState<P>('must')
  const by = (v: P) => tripProducts.filter((p) => p.priority === v)
  const unsorted = tripProducts.filter((p) => !p.priority)
  const must = by('must')
  const mustYen = must.reduce((s, p) => s + p.price, 0)
  const mustWon = toWon(mustYen, rate)
  const ratio = trip.budget ? Math.min(1, mustWon / trip.budget) : 0

  return (
    <Panel onClose={close} z={z} wide>
    <div className="w-full flex-1 overflow-y-auto px-5 pt-[max(12px,env(safe-area-inset-top))] pb-16">
      <button aria-label="뒤로" onClick={close} className="-ml-2 mb-2 grid size-11 place-items-center rounded-full hover:bg-accent">
        <ArrowLeft className="size-[22px]" />
      </button>
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground">{trip.name}</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">{unsorted.length ? '쇼핑 준비 중' : '쇼핑 준비 완료'}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">총 {tripProducts.length}개</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => open({ type: 'swipe' })} disabled={!tripProducts.length}>
          <RotateCcw className="size-4" /> 다시 고르기
        </Button>
      </header>

      {unsorted.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => open({ type: 'swipe' })}
          className="mt-5 flex w-full items-center gap-4 overflow-hidden rounded-xl bg-ink p-4 text-left text-white lg:max-w-[560px]"
        >
          <div className="relative h-20 w-24 shrink-0">
            {unsorted.slice(0, 3).map((p, i) => (
              <div key={p.id} className="absolute top-1 w-14 overflow-hidden rounded-xl ring-2 ring-ink" style={{ left: i * 18, transform: `rotate(${(i - 1) * 8}deg)`, zIndex: 3 - i }}>
                <ProductArt art={p.art} className="aspect-[4/5] w-full" />
              </div>
            ))}
          </div>
          <div className="flex-1">
            <p className="text-[17px] font-semibold">미정 상품 {unsorted.length}개</p>
            <p className="mt-0.5 text-[13px] text-white/60">한 장씩 넘기며 살지 말지 골라 보세요</p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-[13.5px] font-semibold text-ink">고르기</span>
        </motion.button>
      )}

      <section className="mt-5 rounded-xl border bg-card shadow-xs p-5 shadow-xs lg:max-w-[560px]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">꼭 살래 예상 합계</p>
            <p className="mt-1 text-[28px] font-extrabold tracking-tight tabular">{yen(mustYen)}</p>
            <p className="text-[13px] text-muted-foreground tabular">약 {won(mustWon)}</p>
          </div>
          {trip.budget > 0 && (
            <div className="text-right">
              <p className="text-[12px] font-semibold text-muted-foreground">예산</p>
              <p className="text-[15px] font-semibold tabular">{won(trip.budget)}</p>
            </div>
          )}
        </div>
        {trip.budget > 0 && (
          <>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-sunken">
              <motion.div className={cn('h-full rounded-full', ratio >= 1 ? 'bg-brand' : 'bg-ink')} initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} transition={{ duration: 0.6 }} />
            </div>
            <p className="mt-2 text-[12.5px] text-muted-foreground tabular">
              {mustWon <= trip.budget ? `예산까지 ${won(trip.budget - mustWon)} 남았어요` : `예산보다 ${won(mustWon - trip.budget)} 많아요`}
            </p>
          </>
        )}
      </section>

      {/* mobile: tabs */}
      <div className="mt-6">
        <Segmented value={tab} onChange={setTab} options={COLS.map((c) => ({ value: c, label: `${PRIORITY_META[c].label} ${by(c).length}` }))} />
        <List items={by(tab)} />
      </div>
      {/* desktop: board */}
      <div className="mt-8 hidden">
        {COLS.map((c) => (
          <div key={c} className="rounded-xl bg-sunken/70 p-3">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span className={cn('size-2.5 rounded-full', PRIORITY_META[c].dot)} />
              <h2 className="text-[15px] font-semibold">{PRIORITY_META[c].label}</h2>
              <span className="text-[13px] font-semibold text-muted-foreground">{by(c).length}</span>
            </div>
            <List items={by(c)} />
          </div>
        ))}
      </div>
    </div>
    </Panel>
  )
}

function List({ items }: { items: Product[] }) {
  if (!items.length) return <p className="py-12 text-center text-[13.5px] text-muted-foreground">아직 없어요</p>
  return (
    <ul className="mt-3 flex flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {items.map((p, i) => (
          <ProductRow key={p.id} p={p} index={i} />
        ))}
      </AnimatePresence>
    </ul>
  )
}

/* ---------- Swipe deck ---------- */

export function Swipe({ ids, fresh }: { ids?: string[]; fresh?: boolean }) {
  const { tripProducts, setPriority, close, open, rate } = useApp()
  const deck = useMemo(() => {
    if (ids?.length) return ids
    const u = tripProducts.filter((p) => !p.priority)
    return (u.length ? u : tripProducts).map((p) => p.id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [history, setHistory] = useState<{ id: string; prev: P | null }[]>([])
  const [exit, setExit] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const cards = deck.map((id) => tripProducts.find((p) => p.id === id)).filter(Boolean) as Product[]
  const current = cards[i]
  const done = i >= cards.length

  // buttons / keys: stamp the icon onto the image first, then let the card fly
  const [stamp, setStamp] = useState<P | null>(null)
  // live drag offset of the top card → drives the option orbs and the stack behind
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const dist = useTransform([px, py], ([x, y]: number[]) => Math.max(Math.abs(x), -y, 0))
  const show = useTransform(dist, [6, 36], [0, 1])
  const btnFade = useTransform(show, [0, 1], [1, 0.25])
  const nextScale = useTransform(dist, [0, 140], [0.95, 1])
  const nextY = useTransform(dist, [0, 140], [12, 0])
  const pMust = useTransform(px, [20, 110], [0, 1])
  const pSkip = useTransform(px, [-110, -20], [1, 0])
  const pMaybe = useTransform(py, [-110, -20], [1, 0])
  const press = (v: P) => {
    if (!current || stamp) return
    setStamp(v)
    setTimeout(() => {
      decide(v)
      setStamp(null)
    }, 320)
  }
  const decide = (v: P) => {
    if (!current) return
    setExit(v === 'must' ? { x: 500, y: 40 } : v === 'skip' ? { x: -500, y: 40 } : { x: 0, y: -600 })
    setHistory((h) => [...h, { id: current.id, prev: current.priority }])
    setPriority(current.id, v)
    setI((n) => n + 1)
  }
  const undo = () => {
    const last = history[history.length - 1]
    if (!last) return
    setPriority(last.id, last.prev)
    setHistory((h) => h.slice(0, -1))
    setExit({ x: 0, y: 0 })
    setI((n) => n - 1)
  }
  const count = (v: P) => cards.filter((c) => c.priority === v).length

  return (
    <motion.div
      className="fixed inset-0 z-[58] flex flex-col bg-ground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') press('must')
        if (e.key === 'ArrowLeft') press('skip')
        if (e.key === 'ArrowUp') press('maybe')
      }}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pt-[max(12px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
        <header className="flex h-12 items-center gap-3">
          <button aria-label="닫기" onClick={close} className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-accent">
            <X className="size-5" />
          </button>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full bg-primary" animate={{ width: `${(Math.min(i, cards.length) / Math.max(1, cards.length)) * 100}%` }} />
          </div>
          <span className="min-w-9 text-right text-[13px] font-medium text-muted-foreground tabular">{done ? '완료' : `${i + 1}/${cards.length}`}</span>
          <button aria-label="이전 선택 취소" onClick={undo} disabled={!history.length} className="-mr-2 grid size-10 place-items-center rounded-full text-foreground hover:bg-accent disabled:text-muted-foreground/40">
            <Undo2 className="size-[18px]" />
          </button>
        </header>
        {!done && (
          <div className="mt-4">
            <p className="text-[13px] font-medium text-muted-foreground">{fresh ? `방금 담은 ${cards.length}개` : '카드를 밀어서 골라요'}</p>
            <h1 className="mt-0.5 text-[22px] font-semibold tracking-tight">살지 말지 골라 볼까요?</h1>
          </div>
        )}

        <div className="relative mx-4 mt-6 mb-2 flex-1">
          {done ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid size-20 place-items-center rounded-full bg-ink text-white">
                <Heart className="size-9 fill-white" />
              </div>
              <h2 className="display mt-6 text-[28px]">다 골랐어요!</h2>
              <div className="mt-5 flex gap-2">
                {(['must', 'maybe', 'skip'] as P[]).map((v) => (
                  <span key={v} className={cn('rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold', PRIORITY_META[v].pill)}>
                    {PRIORITY_META[v].label} {count(v)}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex w-full flex-col gap-2">
                <Button
                  size="lg"
                  onClick={() => {
                    close()
                    if (!fresh) open({ type: 'plan' })
                  }}
                >
                  {fresh ? '리스트로 돌아가기' : '결과 보기'}
                </Button>
                <Button variant="ghost" onClick={undo} disabled={!history.length}>
                  <Undo2 className="size-4" /> 마지막 선택 취소
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {cards[i + 2] && (
                <div className="absolute inset-0 origin-bottom translate-y-6 scale-[0.9] opacity-40">
                  <Card p={cards[i + 2]} rate={rate} />
                </div>
              )}
              {cards[i + 1] && (
                <motion.div key={cards[i + 1].id} style={{ scale: nextScale, y: nextY }} className="absolute inset-0 origin-bottom">
                  <Card p={cards[i + 1]} rate={rate} />
                </motion.div>
              )}
              <AnimatePresence custom={exit}>
                <Draggable key={current.id} p={current} rate={rate} exit={exit} onDecide={press} stamp={stamp} px={px} py={py} />
              </AnimatePresence>
              {/* sub-level options: float in around the card while dragging */}
              <Orb v="skip" prog={pSkip} show={show} stamp={stamp} className="top-[42%] -left-5" />
              <Orb v="maybe" prog={pMaybe} show={show} stamp={stamp} className="-top-5 left-1/2 -ml-7" />
              <Orb v="must" prog={pMust} show={show} stamp={stamp} className="top-[42%] -right-5" />
            </>
          )}
        </div>

        {!done && (
          <motion.div style={{ opacity: btnFade }} className="mt-6 flex items-center justify-center gap-6">
            <Round label="안 살래" onClick={() => press('skip')} className={cn('size-14 border', PRIORITY_ICON.skip.cls)}>
              <X className="size-6" strokeWidth={2.2} />
            </Round>
            <Round label="고민" onClick={() => press('maybe')} className={cn('size-12 border', PRIORITY_ICON.maybe.cls)}>
              <Hourglass className="size-5" strokeWidth={2.2} />
            </Round>
            <Round label="꼭 살래" onClick={() => press('must')} className={cn('size-14 border shadow-md', PRIORITY_ICON.must.cls)}>
              <ShoppingBag className="size-6" strokeWidth={2.2} />
            </Round>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function Round({ label, children, onClick, className }: { label: string; children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button aria-label={label} onClick={onClick} className={cn('grid place-items-center rounded-full transition active:scale-90', className)}>
        {children}
      </button>
      <span className="text-[12px] font-semibold text-muted-foreground">{label}</span>
    </div>
  )
}

function Card({ p, rate, children }: { p: Product; rate: number; children?: React.ReactNode }) {
  const cur = p.priority ? PRIORITY_ICON[p.priority] : null
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-lg">
      {/* image area — priority icons are stuck on here */}
      <div className="relative min-h-0 flex-1 bg-muted/50">
        <ProductArt art={p.art} className="absolute inset-0" />
        {cur && p.priority && (
          <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border bg-background/90 py-1 pr-2.5 pl-1 text-[12px] font-medium shadow-xs backdrop-blur">
            <span className={cn('grid size-6 place-items-center rounded-full border', cur.cls)}>
              <cur.icon className="size-3.5" strokeWidth={2.2} />
            </span>
            지금 {PRIORITY_META[p.priority].label}
          </span>
        )}
        {children}
      </div>
      <div className="border-t p-5">
        <p className="text-[11.5px] font-medium text-muted-foreground">
          {p.brand} · {p.category}
        </p>
        <h2 className="mt-1 line-clamp-2 text-[20px] leading-tight font-semibold tracking-tight">{p.name}</h2>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-[22px] font-semibold tabular">{yen(p.price)}</span>
          <span className="text-[13px] text-muted-foreground tabular">약 {won(toWon(p.price, rate))}</span>
        </p>
      </div>
    </div>
  )
}

function Draggable({ p, rate, exit, onDecide, stamp, px, py }: { p: Product; rate: number; exit: { x: number; y: number }; onDecide: (v: P) => void; stamp: P | null; px: MotionValue<number>; py: MotionValue<number> }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const present = useIsPresent()
  useEffect(() => {
    px.set(0)
    py.set(0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useMotionValueEvent(x, 'change', (v) => present && px.set(v))
  useMotionValueEvent(y, 'change', (v) => present && py.set(v))
  const rotate = useTransform(x, [-240, 240], [-16, 16])
  // while dragging, the orbs around the card do the talking; the image sticker appears on release
  const none = useMotionValue(0)
  const onEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info
    if (offset.x > 110 || velocity.x > 600) return onDecide('must')
    if (offset.x < -110 || velocity.x < -600) return onDecide('skip')
    if (offset.y < -110 || velocity.y < -600) return onDecide('maybe')
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
    animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 })
  }
  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag={!stamp}
      dragSnapToOrigin={false}
      onDragEnd={onEnd}
      initial={{ scale: 0.94, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: exit.x, y: exit.y, opacity: 0, rotate: exit.x / 20, transition: { duration: 0.32 } }}
    >
      <Card p={p} rate={rate}>
        <IconStamp v="must" o={none} forced={stamp === 'must'} className="top-6 left-6 -rotate-12" />
        <IconStamp v="skip" o={none} forced={stamp === 'skip'} className="top-6 right-6 rotate-12" />
        <IconStamp v="maybe" o={none} forced={stamp === 'maybe'} className="top-6 left-1/2 -ml-12" />
      </Card>
    </motion.div>
  )
}

/** the badge icon, stuck onto the product image like a sticker */
function IconStamp({ v, o, forced, className }: { v: P; o: MotionValue<number>; forced: boolean; className?: string }) {
  const { icon: I, cls } = PRIORITY_ICON[v]
  const scale = useTransform(o, [0, 1], [0.7, 1])
  const base = cn('pointer-events-none absolute flex w-24 flex-col items-center gap-1.5', className)
  const body = (
    <>
      <span className={cn('grid size-20 place-items-center rounded-full border-2 shadow-lg', cls)}>
        <I className="size-9" strokeWidth={2} />
      </span>
      <span className="rounded-md border bg-background px-2 py-0.5 text-[13px] font-semibold shadow-sm">{PRIORITY_META[v].label}</span>
    </>
  )
  if (forced)
    return (
      <motion.div initial={{ opacity: 0, scale: 1.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 18 }} className={base}>
        {body}
      </motion.div>
    )
  return (
    <motion.div style={{ opacity: o, scale }} className={base}>
      {body}
    </motion.div>
  )
}

/** Sub-level style option: hidden at rest, floats in at the card edge while dragging; fills when the card points at it */
function Orb({ v, prog, show, stamp, className }: { v: P; prog: MotionValue<number>; show: MotionValue<number>; stamp: P | null; className?: string }) {
  const { icon: I } = PRIORITY_ICON[v]
  const scale = useTransform(prog, [0, 1], [0.86, 1.22])
  const fill = useTransform(prog, [0.55, 1], [0, 1])
  const forced = stamp === v
  return (
    <motion.div
      style={{ opacity: stamp ? (forced ? 1 : 0) : show }}
      className={cn('pointer-events-none absolute z-20 flex w-14 flex-col items-center gap-1', className)}
      aria-hidden
    >
      <motion.span style={{ scale: forced ? 1.22 : scale }} className="relative grid size-14 place-items-center rounded-full border bg-background text-foreground shadow-lg">
        <I className="size-6" strokeWidth={2.2} />
        <motion.span style={{ opacity: forced ? 1 : fill }} className="absolute inset-0 grid place-items-center rounded-full bg-primary text-primary-foreground">
          <I className="size-6" strokeWidth={2.2} />
        </motion.span>
      </motion.span>
      <motion.span style={{ opacity: forced ? 1 : fill }} className="rounded-md bg-primary px-1.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap text-primary-foreground">
        {PRIORITY_META[v].label}
      </motion.span>
    </motion.div>
  )
}
