import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, House, ListChecks, Luggage, Map, MapPin, Plus, Smartphone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useApp, type Tab } from '@/lib/store'
import { cn, dday, shortRange } from '@/lib/utils'
import { Logo } from './art/Stickers'
import { Button } from './ui/button'

export const NAV: { id: Tab; label: string; icon: typeof House }[] = [
  { id: 'home', label: '홈', icon: House },
  { id: 'priority', label: '우선순위', icon: ListChecks },
  { id: 'map', label: '지도', icon: Map },
  { id: 'carry', label: '캐리어', icon: Luggage },
]

export function BottomNav() {
  const { tab, setTab, open } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 px-4 pb-[max(14px,env(safe-area-inset-bottom))] lg:hidden">
      <nav className="pointer-events-auto flex h-[68px] flex-1 items-center justify-around rounded-[28px] bg-surface px-2 shadow-[0_8px_30px_-12px_rgba(20,20,19,0.22)] ring-1 ring-black/[0.04]" aria-label="주요 메뉴">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={active ? 'page' : undefined}
              className={cn('relative flex h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-full px-2 text-[11px] transition-colors', active ? 'font-bold text-ink' : 'font-medium text-faint')}
            >
              <Icon className="relative size-[21px]" strokeWidth={active ? 2.4 : 2} />
              <span className="relative">{label}</span>
            </button>
          )
        })}
      </nav>
      <button
        onClick={() => open({ type: 'save' })}
        aria-label="상품 저장하기"
        className="pointer-events-auto grid size-[68px] shrink-0 place-items-center rounded-full bg-ink text-white shadow-[var(--shadow-float)] transition active:scale-95"
      >
        <Plus className="size-7" strokeWidth={2.6} />
      </button>
    </div>
  )
}

export function Sidebar() {
  const { tab, setTab, open, trip, tripProducts, points } = useApp()
  const must = tripProducts.filter((p) => p.priority === 'must').length
  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-line bg-surface/60 px-5 py-6 backdrop-blur lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <Logo className="size-9" />
        <span className="display text-[22px]">Packit</span>
      </div>
      <div className="mt-7">
        <TripSwitcher variant="sidebar" />
      </div>
      <nav className="mt-6 flex flex-col gap-1" aria-label="주요 메뉴">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={active ? 'page' : undefined}
              className={cn('flex h-11 items-center gap-3 rounded-2xl px-3 text-[15px] font-semibold transition-colors', active ? 'bg-ink text-white' : 'text-ink-2 hover:bg-sunken')}
            >
              <Icon className="size-[19px]" strokeWidth={2.2} />
              {label}
              {id === 'priority' && (
                <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold', active ? 'bg-white/15' : 'bg-brand-soft text-brand')}>{must}</span>
              )}
            </button>
          )
        })}
      </nav>
      <Button className="mt-6 w-full" size="lg" onClick={() => open({ type: 'save' })}>
        <Plus className="size-5" strokeWidth={2.6} /> 상품 저장하기
      </Button>
      <button onClick={() => open({ type: 'benefits' })} className="mt-auto mb-2 flex h-12 items-center gap-2.5 rounded-2xl bg-surface px-3 text-left ring-1 ring-line hover:bg-sunken">
        <span className="grid size-8 place-items-center rounded-full bg-sunken text-[11px] font-bold">수빈</span>
        <span className="flex-1 text-[13.5px] font-semibold">내 발견 · 혜택</span>
        <span className="text-[13px] font-bold tabular">{points.toLocaleString('ko-KR')}P</span>
      </button>
      <a href="#mobile" className="mb-3 flex h-11 items-center justify-center gap-2 rounded-2xl text-[13.5px] font-semibold text-ink-2 ring-1 ring-line hover:bg-sunken">
        <Smartphone className="size-4" /> 휴대폰 화면으로 보기
      </a>
      <div className="rounded-[20px] bg-sunken p-4">
        <p className="text-[12px] font-semibold text-muted">{trip.city} 여행까지</p>
        <p className="display mt-1 text-[28px]">{dday(trip.start)}</p>
        <p className="mt-1 text-[12.5px] text-muted">{shortRange(trip.start, trip.end)}</p>
      </div>
    </aside>
  )
}

export function TripSwitcher({ variant = 'pill' }: { variant?: 'pill' | 'sidebar' }) {
  const { trips, trip, setTripId, open } = useApp()
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!show) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setShow(false)
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [show])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShow((s) => !s)}
        aria-expanded={show}
        className={cn(
          'flex items-center gap-1.5 font-semibold transition',
          variant === 'pill' ? 'h-9 rounded-full bg-surface pr-3 pl-2.5 text-[13.5px] ring-1 ring-line' : 'h-14 w-full rounded-2xl bg-surface px-3 text-left ring-1 ring-line',
        )}
      >
        <MapPin className="size-4 text-brand" strokeWidth={2.4} />
        {variant === 'pill' ? (
          <span className="tabular">
            {trip.city} {shortRange(trip.start, trip.end)}
          </span>
        ) : (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14px]">{trip.name}</span>
            <span className="text-[12px] font-medium text-muted tabular">
              {trip.city} · {shortRange(trip.start, trip.end)}
            </span>
          </span>
        )}
        <ChevronDown className={cn('size-4 text-muted transition', show && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute top-[calc(100%+8px)] left-0 z-50 w-[300px] origin-top-left rounded-[20px] bg-surface p-2 shadow-[var(--shadow-float)] ring-1 ring-black/5"
          >
            {trips.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTripId(t.id)
                  setShow(false)
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-sunken"
              >
                <span className="size-3 shrink-0 rounded-full ring-2 ring-white" style={{ background: t.suitcase.color, boxShadow: '0 0 0 1px #e6e4df' }} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold">{t.name}</span>
                  <span className="text-[12px] text-muted tabular">
                    {t.city} · {shortRange(t.start, t.end)}
                  </span>
                </span>
                {t.id === trip.id && <Check className="size-4 text-brand" strokeWidth={2.8} />}
              </button>
            ))}
            <div className="my-1 h-px bg-line" />
            <button
              onClick={() => {
                setShow(false)
                open({ type: 'create' })
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[14px] font-semibold text-ink-2 hover:bg-sunken"
            >
              <span className="grid size-6 place-items-center rounded-full bg-sunken">
                <Plus className="size-4" />
              </span>
              새 여행 만들기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Toaster() {
  const { toast } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[80] flex justify-center lg:bottom-8" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-float)]"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
