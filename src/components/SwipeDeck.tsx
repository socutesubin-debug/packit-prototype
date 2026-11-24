import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue, type PanInfo } from 'motion/react'
import { Check, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { tiltOf } from '@/components/ProductCard'
import { PRIORITY_ICON, PRIORITY_META } from '@/components/ui/primitives'
import { useApp } from '@/lib/store'
import type { Priority, Product } from '@/lib/types'
import { cn, toWon, won, yen } from '@/lib/utils'

type Exit = { x: number; y: number }
const EXIT: Record<Priority, Exit> = { must: { x: 520, y: 30 }, skip: { x: -520, y: 30 }, maybe: { x: 0, y: -520 } }

/**
 * Inline swipe deck on Home. Shows only while there are undecided products.
 * → 꼭 살래 · ↑ 고민 · ← 안 살래 (same icons as the card badges), or tap the buttons.
 */
export function SwipeDeck() {
  const { tripProducts, setPriority, rate, trip } = useApp()
  const [front, setFront] = useState<string | null>(null)
  const unsorted = tripProducts.filter((p) => !p.priority)
  // an undone card comes back on top
  const pending = front ? [...unsorted.filter((p) => p.id === front), ...unsorted.filter((p) => p.id !== front)] : unsorted
  const [history, setHistory] = useState<{ id: string; v: Priority }[]>([])
  const [exit, setExit] = useState<Exit>(EXIT.must)
  const [phase, setPhase] = useState<'deck' | 'done' | 'hidden'>(pending.length ? 'deck' : 'hidden')
  const root = useRef<HTMLElement>(null)

  // new unsorted items (e.g. right after saving) bring the deck back
  useEffect(() => {
    if (pending.length && phase !== 'deck') setPhase('deck')
    if (!pending.length && phase === 'deck') setPhase(history.length ? 'done' : 'hidden')
  }, [pending.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // reset the session when switching trips
  useEffect(() => {
    setHistory([])
    setPhase(tripProducts.some((p) => !p.priority) ? 'deck' : 'hidden')
  }, [trip.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(() => setPhase('hidden'), 2200)
    return () => clearTimeout(t)
  }, [phase])

  const current = pending[0]
  const total = pending.length + history.length
  const decide = (v: Priority) => {
    if (!current) return
    setExit(EXIT[v])
    setFront(null)
    setHistory((h) => [...h, { id: current.id, v }])
    setPriority(current.id, v)
  }
  const undo = () => {
    const last = history[history.length - 1]
    if (!last) return
    setExit({ x: 0, y: 0 })
    setHistory((h) => h.slice(0, -1))
    setFront(last.id)
    setPriority(last.id, null)
  }
  const count = (v: Priority) => history.filter((h) => h.v === v).length

  return (
    <AnimatePresence initial={false}>
      {phase !== 'hidden' && (
        <motion.section
          ref={root}
          key="deck"
          aria-label="미정 상품 골라 보기"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (phase !== 'deck') return
            if (e.key === 'ArrowRight') decide('must')
            if (e.key === 'ArrowLeft') decide('skip')
            if (e.key === 'ArrowUp') decide('maybe')
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.35 } }}
          className="overflow-hidden outline-none"
        >
          <div className="mt-6 rounded-2xl border bg-card p-4 shadow-xs lg:grid lg:grid-cols-[1fr_340px] lg:items-center lg:gap-10 lg:p-8">
            <div className="flex items-start justify-between gap-3 lg:block">
              <div>
                <p className="text-[12.5px] font-medium text-muted-foreground tabular">
                  {phase === 'done' ? '정리 완료' : `미정 ${pending.length}개 · ${history.length + 1} / ${total}`}
                </p>
                <h2 className="mt-0.5 text-[19px] font-semibold tracking-tight lg:text-[26px]">{phase === 'done' ? '다 정했어요' : '살지 말지 골라 볼까요?'}</h2>
                <p className="mt-2 hidden text-[14px] leading-relaxed text-muted-foreground lg:block">
                  카드를 오른쪽으로 밀면 꼭 살래, 위로 밀면 고민, 왼쪽으로 밀면 안 살래예요. 버튼이나 키보드 화살표로도 고를 수 있어요.
                </p>
              </div>
              {history.length > 0 && phase === 'deck' && (
                <button onClick={undo} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium text-muted-foreground hover:bg-accent lg:mt-4 lg:-ml-2">
                  <Undo2 className="size-3.5" /> 되돌리기
                </button>
              )}
              <div className="mt-1 h-1 w-16 shrink-0 overflow-hidden rounded-full bg-muted lg:mt-5 lg:w-full">
                <motion.div className="h-full bg-primary" animate={{ width: `${(history.length / Math.max(1, total)) * 100}%` }} />
              </div>
            </div>

            <div>
              {phase === 'done' ? (
                <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex h-[300px] flex-col items-center justify-center text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-7" strokeWidth={2.6} />
                  </span>
                  <div className="mt-5 flex gap-1.5">
                    {(['must', 'maybe', 'skip'] as Priority[]).map((v) => {
                      const I = PRIORITY_ICON[v].icon
                      return (
                        <span key={v} className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[12.5px] font-medium tabular">
                          <I className="size-3.5" /> {PRIORITY_META[v].label} {count(v)}
                        </span>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-[13px] text-muted-foreground">아래 목록에 반영했어요</p>
                </motion.div>
              ) : (
                <>
                  <div className="relative mx-auto mt-4 h-[300px] max-w-[340px] lg:mt-0">
                    {pending[2] && <DeckCard p={pending[2]} rate={rate} className="translate-y-4 scale-[0.9] opacity-40" />}
                    {pending[1] && <DeckCard p={pending[1]} rate={rate} className="translate-y-2 scale-[0.95] opacity-80" />}
                    <AnimatePresence custom={exit}>{current && <Draggable key={current.id} p={current} rate={rate} exit={exit} onDecide={decide} />}</AnimatePresence>
                  </div>
                  <div className="mt-5 flex items-end justify-center gap-6">
                    <DeckBtn v="skip" onClick={() => decide('skip')} />
                    <DeckBtn v="maybe" onClick={() => decide('maybe')} small />
                    <DeckBtn v="must" onClick={() => decide('must')} />
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

function DeckBtn({ v, onClick, small }: { v: Priority; onClick: () => void; small?: boolean }) {
  const { icon: I, cls } = PRIORITY_ICON[v]
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        aria-label={PRIORITY_META[v].label}
        onClick={onClick}
        className={cn('grid place-items-center rounded-full border transition active:scale-90 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', small ? 'size-11' : 'size-13', cls, v === 'must' && 'shadow-md')}
      >
        <I className={small ? 'size-5' : 'size-6'} strokeWidth={2.2} />
      </button>
      <span className="text-[12px] font-medium text-muted-foreground">{PRIORITY_META[v].label}</span>
    </div>
  )
}

function DeckCard({ p, rate, className, children }: { p: Product; rate: number; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('absolute inset-0 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-sm transition-transform', className)}>
      <div className="relative min-h-0 flex-1 bg-muted/60">
        <ProductArt art={p.art} tone="none" tilt={tiltOf(p.id)} className="absolute inset-6" />
      </div>
      <div className="border-t px-4 py-3">
        <p className="text-[11.5px] font-medium text-muted-foreground">
          {p.brand} · {p.category}
        </p>
        <h3 className="mt-0.5 line-clamp-1 text-[16px] font-semibold tracking-tight">{p.name}</h3>
        <p className="mt-0.5 flex items-baseline gap-1.5 tabular">
          <span className="text-[16px] font-semibold">{yen(p.price)}</span>
          <span className="text-[12px] text-muted-foreground">약 {won(toWon(p.price, rate))}</span>
        </p>
      </div>
      {children}
    </div>
  )
}

function Draggable({ p, rate, exit, onDecide }: { p: Product; rate: number; exit: Exit; onDecide: (v: Priority) => void }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-14, 14])
  const must = useTransform(x, [25, 110], [0, 1])
  const skip = useTransform(x, [-110, -25], [1, 0])
  const maybe = useTransform(y, [-110, -30], [1, 0])
  const onEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.x > 100 || velocity.x > 600) return onDecide('must')
    if (offset.x < -100 || velocity.x < -600) return onDecide('skip')
    if (offset.y < -100 || velocity.y < -600) return onDecide('maybe')
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
    animate(y, 0, { type: 'spring', stiffness: 500, damping: 30 })
  }
  return (
    <motion.div
      className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag
      onDragEnd={onEnd}
      initial={{ scale: 0.95, y: 8, opacity: 0.8 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ x: exit.x, y: exit.y, opacity: 0, rotate: exit.x / 24, transition: { duration: 0.3 } }}
    >
      <DeckCard p={p} rate={rate} className="shadow-lg">
        <Hint v="must" o={must} />
        <Hint v="skip" o={skip} />
        <Hint v="maybe" o={maybe} />
      </DeckCard>
    </motion.div>
  )
}

/** the same icon as the card badge grows over the card while dragging */
function Hint({ v, o }: { v: Priority; o: MotionValue<number> }) {
  const { icon: I, cls } = PRIORITY_ICON[v]
  const scale = useTransform(o, [0, 1], [0.6, 1])
  return (
    <motion.div style={{ opacity: o }} className="pointer-events-none absolute inset-0 grid place-items-center bg-background/55">
      <motion.span style={{ scale }} className="flex flex-col items-center gap-2">
        <span className={cn('grid size-20 place-items-center rounded-full border-2', cls)}>
          <I className="size-9" strokeWidth={2} />
        </span>
        <span className="rounded-md bg-background px-2 py-0.5 text-[14px] font-semibold shadow-sm">{PRIORITY_META[v].label}</span>
      </motion.span>
    </motion.div>
  )
}
