import { AnimatePresence, motion } from 'motion/react'
import { LayoutGrid, List, Plus, Search, Star, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { ProductRow, ProductTile } from '@/components/ProductCard'
import { TripSwitcher } from '@/components/Shell'
import { Button } from '@/components/ui/button'
import { Chip, Segmented } from '@/components/ui/primitives'
import { CATALOG, CATEGORIES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Category } from '@/lib/types'
import { cn, dday, toWon, won, yen } from '@/lib/utils'

type Filter = '전체' | '즐겨찾기' | Category

export function Home() {
  const { tripProducts, trip, rate, open, setTripId, trips } = useApp()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<Filter>('전체')
  const [q, setQ] = useState('')
  const [searching, setSearching] = useState(false)

  const list = useMemo(
    () =>
      tripProducts.filter(
        (p) =>
          (filter === '전체' || (filter === '즐겨찾기' ? p.favorite : p.category === filter)) &&
          (!q || p.name.includes(q) || p.brand.toLowerCase().includes(q.toLowerCase())),
      ),
    [tripProducts, filter, q],
  )
  const must = tripProducts.filter((p) => p.priority === 'must')
  const mustYen = must.reduce((s, p) => s + p.price, 0)
  const unsorted = tripProducts.filter((p) => !p.priority).length
  const empty = tripProducts.length === 0
  const sample = trips.find((t) => t.sample && t.id !== trip.id && t.city === '도쿄')

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 pt-[max(18px,env(safe-area-inset-top))] pb-32 lg:px-10 lg:pt-10 lg:pb-16">
      <header className="flex items-center justify-between lg:hidden">
        <h1 className="display text-[30px]">Packit</h1>
        <button className="grid size-10 place-items-center overflow-hidden rounded-full bg-[#E4E1F7] text-[13px] font-bold text-[#4B44A8]" aria-label="내 프로필">
          수빈
        </button>
      </header>
      <div className="mt-3 flex items-center justify-between lg:mt-0">
        <div className="lg:hidden">
          <TripSwitcher />
        </div>
        <div className="hidden lg:block">
          <p className="text-[13px] font-semibold text-muted">{trip.city} · {dday(trip.start)}</p>
          <h1 className="display mt-1 text-[36px]">{trip.name}</h1>
        </div>
      </div>

      {!empty && (
        <section className="mt-5 grid grid-cols-3 gap-2.5 lg:mt-7 lg:max-w-[720px]" aria-label="여행 요약">
          <Stat label="여행까지" value={dday(trip.start)} />
          <Stat label="저장한 상품" value={`${tripProducts.length}개`} sub={unsorted ? `미정 ${unsorted}` : undefined} />
          <Stat label="꼭 살래 합계" value={yen(mustYen)} sub={`약 ${won(toWon(mustYen, rate))}`} accent />
        </section>
      )}

      {empty ? (
        <EmptyHome onSave={() => open({ type: 'save' })} onSample={sample ? () => setTripId(sample.id) : undefined} />
      ) : (
        <>
          <div className="sticky top-0 z-20 -mx-5 mt-5 bg-ground/85 px-5 py-2.5 backdrop-blur-xl lg:-mx-10 lg:px-10">
            <div className="flex items-center gap-2">
              <AnimatePresence initial={false} mode="wait">
                {searching ? (
                  <motion.label key="s" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: '100%' }} exit={{ opacity: 0, width: 0 }} className="flex h-10 flex-1 items-center gap-2 rounded-full bg-surface px-3.5 ring-1 ring-line">
                    <Search className="size-4 text-muted" />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="찾으시는 상품을 검색해 보세요" className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint" />
                    <button aria-label="검색 닫기" onClick={() => { setQ(''); setSearching(false) }}>
                      <X className="size-4 text-muted" />
                    </button>
                  </motion.label>
                ) : (
                  <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-w-0 flex-1 items-center gap-2">
                    <button aria-label="검색" onClick={() => setSearching(true)} className="grid size-9 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-line">
                      <Search className="size-[18px]" />
                    </button>
                    <div className="no-scrollbar -mr-5 flex flex-1 gap-1.5 overflow-x-auto pr-5 lg:mr-0">
                      {(['전체', '즐겨찾기', ...CATEGORIES] as Filter[]).map((f) => (
                        <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                          {f === '즐겨찾기' && <Star className={cn('size-3.5', filter === f ? 'fill-white' : 'fill-[#F2B63B] text-[#F2B63B]')} />}
                          {f}
                        </Chip>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Segmented
                className="hidden shrink-0 sm:flex"
                value={view}
                onChange={setView}
                options={[
                  { value: 'grid', label: <LayoutGrid className="mx-auto size-4" aria-label="이미지형" /> },
                  { value: 'list', label: <List className="mx-auto size-4" aria-label="리스트형" /> },
                ]}
              />
              <button aria-label={view === 'grid' ? '리스트형으로 보기' : '이미지형으로 보기'} onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="grid size-9 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-line sm:hidden">
                {view === 'grid' ? <List className="size-[18px]" /> : <LayoutGrid className="size-[18px]" />}
              </button>
            </div>
          </div>

          {list.length === 0 ? (
            <p className="py-20 text-center text-[14px] text-muted">조건에 맞는 상품이 없어요</p>
          ) : view === 'grid' ? (
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {list.map((p, i) => (
                <ProductTile key={p.id} p={p} index={i} />
              ))}
            </div>
          ) : (
            <ul className="mt-3 grid gap-2.5 lg:grid-cols-2">
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

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-[20px] p-3.5', accent ? 'bg-ink text-white' : 'bg-surface shadow-[var(--shadow-card)]')}>
      <p className={cn('text-[11.5px] font-semibold', accent ? 'text-white/60' : 'text-muted')}>{label}</p>
      <p className="mt-1 text-[18px] font-extrabold tracking-tight tabular lg:text-[22px]">{value}</p>
      {sub && <p className={cn('mt-0.5 truncate text-[11.5px] tabular', accent ? 'text-white/60' : 'text-muted')}>{sub}</p>}
    </div>
  )
}

function EmptyHome({ onSave, onSample }: { onSave: () => void; onSample?: () => void }) {
  const peek = CATALOG.slice(0, 3)
  return (
    <div className="flex flex-col items-center px-4 pt-16 pb-10 text-center lg:pt-24">
      <div className="relative h-36 w-56">
        {peek.map((p, i) => (
          <motion.div
            key={p.id}
            className="absolute top-0 w-28 overflow-hidden rounded-[22px] shadow-[var(--shadow-card)]"
            style={{ left: `${i * 48}px`, zIndex: i === 1 ? 2 : 1 }}
            initial={{ y: 20, opacity: 0, rotate: 0 }}
            animate={{ y: i === 1 ? -6 : 6, opacity: 1, rotate: (i - 1) * 9 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring' }}
          >
            <ProductArt art={p.art} className="aspect-[4/5] w-full" />
          </motion.div>
        ))}
      </div>
      <h2 className="display mt-8 text-[24px]">사고 싶은 물건을 모아 볼까요?</h2>
      <p className="mt-2 max-w-[280px] text-[14.5px] text-muted">SNS에서 저장한 스크린샷을 올리면 상품 이름과 가격을 자동으로 정리해 드려요</p>
      <Button size="lg" className="mt-7 px-8" onClick={onSave}>
        <Plus className="size-5" strokeWidth={2.6} /> 첫 상품 저장하기
      </Button>
      {onSample && (
        <button onClick={onSample} className="mt-3 h-11 text-[14px] font-semibold text-muted underline-offset-4 hover:underline">
          예시 여행 둘러보기
        </button>
      )}
    </div>
  )
}
