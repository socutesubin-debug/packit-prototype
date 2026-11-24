import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronDown, LayoutGrid, List, Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { ProductRow, ProductTile, tiltOf } from '@/components/ProductCard'
import { TripSwitcher } from '@/components/Shell'
import { FindsStrip } from './Finds'
import { Button } from '@/components/ui/button'
import { CATALOG, CATEGORIES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Product } from '@/lib/types'
import { cn, dday, toWon, won, yen } from '@/lib/utils'

const SORTS = ['최근 저장순', '가격 낮은 순', '가격 높은 순', '우선순위 순'] as const
type Sort = (typeof SORTS)[number]
const CATS = ['전체', '즐겨찾기', ...CATEGORIES] as const
type Cat = (typeof CATS)[number]
const rank = (p: Product) => (p.priority === 'must' ? 0 : p.priority === 'maybe' ? 1 : p.priority === null ? 2 : 3)

export function Home() {
  const { tripProducts, trip, rate, open, setTripId, trips, setTab, points } = useApp()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [cat, setCat] = useState<Cat>('전체')
  const [sort, setSort] = useState<Sort>('최근 저장순')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const l = tripProducts.filter(
      (p) => (cat === '전체' || (cat === '즐겨찾기' ? p.favorite : p.category === cat)) && (!q || p.name.includes(q) || p.brand.toLowerCase().includes(q.toLowerCase())),
    )
    if (sort === '가격 낮은 순') return [...l].sort((a, b) => a.price - b.price)
    if (sort === '가격 높은 순') return [...l].sort((a, b) => b.price - a.price)
    if (sort === '우선순위 순') return [...l].sort((a, b) => rank(a) - rank(b))
    return l
  }, [tripProducts, cat, q, sort])

  const must = tripProducts.filter((p) => p.priority === 'must')
  const mustYen = must.reduce((s, p) => s + p.price, 0)
  const unsorted = tripProducts.filter((p) => !p.priority)
  const empty = tripProducts.length === 0
  const sample = trips.find((t) => t.sample && t.id !== trip.id && t.city === '도쿄')
  const dd = dday(trip.start)
  const ratio = trip.budget ? Math.min(1, toWon(mustYen, rate) / trip.budget) : 0

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-[max(20px,env(safe-area-inset-top))] pb-32 lg:px-10 lg:pt-12 lg:pb-16">
      <header className="flex items-start justify-between">
        <h1 className="text-[28px] leading-[1.15] tracking-tight lg:text-[34px]">
          <span className="font-normal text-ink-2">{trip.city} 여행까지</span>
          <br />
          <b className="font-bold">{dd.startsWith('D-') ? `${dd.slice(2)}일 남았어요` : dd === 'D-DAY' ? '오늘 떠나요' : '여행을 마쳤어요'}</b>
        </h1>
        <button onClick={() => open({ type: 'benefits' })} className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-surface pr-4 pl-1.5" aria-label="내 발견과 혜택">
          <span className="grid size-9 place-items-center rounded-full bg-sunken text-[12px] font-bold">수빈</span>
          <span className="text-[13px] font-bold tabular">{points.toLocaleString('ko-KR')}P</span>
        </button>
      </header>
      <div className="mt-4 lg:hidden">
        <TripSwitcher />
      </div>

      {empty ? (
        <EmptyHome onSave={() => open({ type: 'save' })} onSample={sample ? () => setTripId(sample.id) : undefined} />
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 gap-2.5 lg:max-w-[640px]" aria-label="여행 요약">
            <button onClick={() => setTab('priority')} className="flex flex-col rounded-[var(--radius-card)] bg-ink p-4 text-left text-white">
              <span className="text-[13px] font-medium text-white/60">꼭 살래 {must.length}개</span>
              <span className="mt-auto pt-6 text-[24px] leading-none font-bold tracking-tight tabular">{yen(mustYen)}</span>
              <span className="mt-1.5 text-[12px] text-white/50 tabular">약 {won(toWon(mustYen, rate))}</span>
              {trip.budget > 0 && (
                <span className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
                  <motion.span className="block h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} />
                </span>
              )}
            </button>
            <button onClick={() => (unsorted.length ? open({ type: 'swipe' }) : setTab('priority'))} className="flex flex-col rounded-[var(--radius-card)] bg-surface p-4 text-left">
              <span className="text-[13px] font-medium text-muted">{unsorted.length ? '아직 미정' : '정리 완료'}</span>
              <div className="relative mt-3 h-14">
                {(unsorted.length ? unsorted : tripProducts).slice(0, 3).map((p, i) => (
                  <div key={p.id} className="absolute top-0" style={{ left: i * 30 }}>
                    <ProductArt art={p.art} tone="none" tilt={(i - 1) * 10} className="size-14" />
                  </div>
                ))}
              </div>
              <span className="mt-2 text-[15px] font-semibold">{unsorted.length ? `${unsorted.length}개 골라 보기` : '우선순위 보기'}</span>
            </button>
          </section>

          <FindsStrip />

          <div className="mt-7">
            <label className="flex h-11 items-center gap-2 rounded-full bg-sunken px-4 focus-within:ring-2 focus-within:ring-ink">
              <Search className="size-[18px] text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="저장한 상품 검색" className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint" />
              {q && (
                <button aria-label="검색어 지우기" onClick={() => setQ('')}>
                  <X className="size-4 text-muted" />
                </button>
              )}
            </label>
            <div className="mt-3 flex items-center gap-1">
              <Dropdown value={cat} options={CATS} onChange={setCat} label={cat === '전체' ? '전체 상품' : cat} />
              <Dropdown value={sort} options={SORTS} onChange={setSort} label={sort} />
              <span className="flex-1" />
              <span className="mr-1 text-[13px] text-muted tabular">{list.length}개</span>
              <ViewBtn on={view === 'grid'} onClick={() => setView('grid')} label="카드로 보기">
                <LayoutGrid className="size-[18px]" />
              </ViewBtn>
              <ViewBtn on={view === 'list'} onClick={() => setView('list')} label="리스트로 보기">
                <List className="size-[18px]" />
              </ViewBtn>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="py-20 text-center text-[14px] text-muted">조건에 맞는 상품이 없어요</p>
          ) : view === 'grid' ? (
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3">
              {list.map((p, i) => (
                <ProductTile key={p.id} p={p} index={i} />
              ))}
            </div>
          ) : (
            <ul className="mt-3 grid gap-2 lg:grid-cols-2">
              {list.map((p, i) => (
                <ProductRow key={p.id} p={p} index={i} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function ViewBtn({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button aria-label={label} aria-pressed={on} onClick={onClick} className={cn('grid size-9 place-items-center rounded-xl transition', on ? 'bg-surface text-ink' : 'text-faint hover:text-muted')}>
      {children}
    </button>
  )
}

function Dropdown<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex h-9 items-center gap-1 rounded-full px-2.5 text-[14px] font-medium text-ink-2 hover:bg-sunken">
        {label}
        <ChevronDown className={cn('size-4 text-muted transition', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute top-[calc(100%+6px)] left-0 z-30 min-w-[160px] rounded-2xl bg-surface p-1.5 shadow-[var(--shadow-float)] ring-1 ring-black/5"
          >
            {options.map((o) => (
              <li key={o}>
                <button
                  onClick={() => {
                    onChange(o)
                    setOpen(false)
                  }}
                  className="flex h-10 w-full items-center justify-between gap-4 rounded-xl px-3 text-left text-[14px] hover:bg-sunken"
                >
                  {o}
                  {o === value && <Check className="size-4" strokeWidth={2.6} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyHome({ onSave, onSample }: { onSave: () => void; onSample?: () => void }) {
  const peek = CATALOG.slice(0, 3)
  return (
    <div className="mt-6 flex flex-col items-center rounded-[28px] bg-surface px-6 pt-12 pb-10 text-center">
      <div className="relative h-32 w-56">
        {peek.map((p, i) => (
          <motion.div
            key={p.id}
            className="absolute top-0 w-24"
            style={{ left: `${i * 64}px`, zIndex: i === 1 ? 2 : 1 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: i === 1 ? -8 : 6, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring' }}
          >
            <ProductArt art={p.art} tone="none" tilt={tiltOf(p.id) * 2} className="aspect-square w-full" />
          </motion.div>
        ))}
      </div>
      <h2 className="mt-6 text-[22px] font-bold tracking-tight">사고 싶은 물건을 모아 볼까요?</h2>
      <p className="mt-2 max-w-[280px] text-[14.5px] text-muted">스크린샷을 올리면 상품 이름과 가격을 자동으로 정리해 드려요</p>
      <Button size="lg" className="mt-7 px-7" onClick={onSave}>
        <Plus className="size-5" strokeWidth={2.4} /> 첫 상품 저장하기
      </Button>
      {onSample && (
        <button onClick={onSample} className="mt-2 h-11 text-[14px] font-medium text-muted underline-offset-4 hover:underline">
          예시 여행 둘러보기
        </button>
      )}
    </div>
  )
}
