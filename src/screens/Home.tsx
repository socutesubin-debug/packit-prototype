import { motion } from 'motion/react'
import { ChevronDown, LayoutGrid, List, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { ProductRow, ProductTile, tiltOf } from '@/components/ProductCard'
import { TripSwitcher } from '@/components/Shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Chip } from '@/components/ui/primitives'
import { CATALOG, CATEGORIES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Product } from '@/lib/types'
import { cn, dday, toWon, won, yen } from '@/lib/utils'

const SORTS = ['최근 저장순', '가격 낮은 순', '가격 높은 순', '우선순위 순'] as const
type Sort = (typeof SORTS)[number]
const CATS = ['전체', '즐겨찾기', ...CATEGORIES] as const
type Cat = (typeof CATS)[number]
type PriFilter = 'all' | 'must' | 'maybe' | 'skip' | 'none'
const PRI_TABS: { v: PriFilter; label: string }[] = [
  { v: 'all', label: '전체' },
  { v: 'must', label: '꼭 살래' },
  { v: 'maybe', label: '고민' },
  { v: 'skip', label: '안 살래' },
  { v: 'none', label: '미정' },
]
const rank = (p: Product) => (p.priority === 'must' ? 0 : p.priority === 'maybe' ? 1 : p.priority === null ? 2 : 3)

export function Home() {
  const { tripProducts, trip, rate, open, setTripId, trips, points } = useApp()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [cat, setCat] = useState<Cat>('전체')
  const [sort, setSort] = useState<Sort>('최근 저장순')
  const [q, setQ] = useState('')
  const [pri, setPri] = useState<PriFilter>('all')

  const list = useMemo(() => {
    const l = tripProducts.filter(
      (p) =>
        (cat === '전체' || (cat === '즐겨찾기' ? p.favorite : p.category === cat)) &&
        (pri === 'all' || (pri === 'none' ? !p.priority : p.priority === pri)) &&
        (!q || p.name.includes(q) || p.brand.toLowerCase().includes(q.toLowerCase())),
    )
    if (sort === '가격 낮은 순') return [...l].sort((a, b) => a.price - b.price)
    if (sort === '가격 높은 순') return [...l].sort((a, b) => b.price - a.price)
    if (sort === '우선순위 순') return [...l].sort((a, b) => rank(a) - rank(b))
    return l
  }, [tripProducts, cat, q, sort, pri])

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
          <span className="font-normal text-muted-foreground">{trip.city} 여행까지</span>
          <br />
          <b className="font-semibold">{dd.startsWith('D-') ? `${dd.slice(2)}일 남았어요` : dd === 'D-DAY' ? '오늘 떠나요' : '여행을 마쳤어요'}</b>
        </h1>
        <button onClick={() => open({ type: 'benefits' })} className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-background pr-3.5 pl-1 shadow-xs hover:bg-accent" aria-label="내 발견과 혜택">
          <Avatar className="size-8">
            <AvatarFallback className="text-[11px] font-semibold">수빈</AvatarFallback>
          </Avatar>
          <span className="text-[13px] font-semibold tabular">{points.toLocaleString('ko-KR')}P</span>
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
            <button onClick={() => open({ type: 'plan' })} className="flex flex-col rounded-xl bg-primary p-4 text-left text-primary-foreground shadow-sm transition hover:bg-primary/90">
              <span className="text-[13px] font-medium text-primary-foreground/60">꼭 살래 {must.length}개</span>
              <span className="mt-auto pt-6 text-[24px] leading-none font-semibold tracking-tight tabular">{yen(mustYen)}</span>
              <span className="mt-1.5 text-[12px] text-primary-foreground/50 tabular">약 {won(toWon(mustYen, rate))}</span>
              {trip.budget > 0 && <Progress value={ratio * 100} className="mt-3 h-1 bg-primary-foreground/15 [&>[data-slot=progress-indicator]]:bg-primary-foreground" />}
            </button>
            <button onClick={() => (unsorted.length ? open({ type: 'swipe' }) : open({ type: 'plan' }))} className="flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition hover:bg-accent/50">
              <span className="text-[13px] font-medium text-muted-foreground">{unsorted.length ? '아직 미정' : '정리 완료'}</span>
              <div className="relative mt-3 h-14">
                {(unsorted.length ? unsorted : tripProducts).slice(0, 3).map((p, i) => (
                  <div key={p.id} className="absolute top-0" style={{ left: i * 30 }}>
                    <ProductArt art={p.art} tone="none" tilt={(i - 1) * 10} className="size-14" />
                  </div>
                ))}
              </div>
              <span className="mt-2 text-[15px] font-medium">{unsorted.length ? `${unsorted.length}개 골라 보기` : '쇼핑 준비 현황'}</span>
            </button>
          </section>


          <div className="mt-7">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="저장한 상품 검색" aria-label="저장한 상품 검색" className="h-10 bg-background pr-9 pl-9" />
              {q && (
                <button aria-label="검색어 지우기" onClick={() => setQ('')} className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="no-scrollbar -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 lg:mx-0 lg:px-0" role="tablist" aria-label="우선순위">
              {PRI_TABS.map((t) => {
                const n = t.v === 'all' ? tripProducts.length : tripProducts.filter((p) => (t.v === 'none' ? !p.priority : p.priority === t.v)).length
                return (
                  <Chip key={t.v} active={pri === t.v} onClick={() => setPri(t.v)}>
                    {t.label} <span className={cn('tabular text-[12px]', pri === t.v ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{n}</span>
                  </Chip>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Dropdown title="카테고리" value={cat} options={CATS} onChange={setCat} label={cat === '전체' ? '전체 상품' : cat} />
              <Dropdown title="정렬" value={sort} options={SORTS} onChange={setSort} label={sort} />
              <span className="flex-1" />
              <span className="mr-1 text-[13px] text-muted-foreground tabular">{list.length}개</span>
              <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v as 'grid' | 'list')}>
                <ToggleGroupItem value="grid" aria-label="카드로 보기">
                  <LayoutGrid />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="리스트로 보기">
                  <List />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="py-20 text-center text-[14px] text-muted-foreground">조건에 맞는 상품이 없어요</p>
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

function Dropdown<T extends string>({ title, value, options, onChange, label }: { title: string; value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="font-normal">
          {label}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[168px]">
        <DropdownMenuLabel className="text-[12px] font-medium text-muted-foreground">{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o} value={o} className="text-[13.5px]">
              {o}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function EmptyHome({ onSave, onSample }: { onSave: () => void; onSample?: () => void }) {
  const peek = CATALOG.slice(0, 3)
  return (
    <div className="mt-6 flex flex-col items-center rounded-xl border bg-card px-6 pt-12 pb-10 text-center shadow-xs">
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
      <h2 className="mt-6 text-[22px] font-semibold tracking-tight">사고 싶은 물건을 모아 볼까요?</h2>
      <p className="mt-2 max-w-[280px] text-[14.5px] text-muted-foreground">스크린샷을 올리면 상품 이름과 가격을 자동으로 정리해 드려요</p>
      <Button size="lg" className="mt-7 px-7" onClick={onSave}>
        <Plus className="size-5" strokeWidth={2.4} /> 첫 상품 저장하기
      </Button>
      {onSample && (
        <Button variant="link" onClick={onSample} className="mt-2 text-muted-foreground">
          예시 여행 둘러보기
        </Button>
      )}
    </div>
  )
}
