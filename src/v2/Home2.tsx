import { AnimatePresence, motion, useMotionValue, useTransform, animate, type PanInfo } from 'motion/react'
import { Bookmark, Camera, Check, ChevronDown, FileText, Heart, Image as ImageIcon, LayoutGrid, Link2, List, RotateCcw, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/store'
import type { Category, Priority, Product } from '@/lib/types'
import { cn, shortRange } from '@/lib/utils'
import { C, Chip2, IconBtn, PillButton, PointBadge, Price, ProductImg, Screen, SearchCircle, Sheet2, yenStr, wonStr } from './ui'

const CATS: Category[] = ['뷰티', '식품', '의약품', '의류', '잡화']
const SORTS = ['우선순위 순', '최근 담은 순', '여행자 인기순', '가격 높은 순', '가격 낮은 순'] as const
type Sort = (typeof SORTS)[number]
const RANK: Record<string, number> = { must: 0, maybe: 1, null: 2, skip: 3 }

/* ───────── 홈 상단: 여행 이름 · 도시 · 날짜 + 포인트 ───────── */
export function TripHeader() {
  const { trip } = useApp()
  const [pick, setPick] = useState(false)
  return (
    <>
      <header className="flex h-[78px] items-center justify-between px-5 pt-3">
        <button onClick={() => setPick(true)} className="min-w-0 text-left">
          <span className="t-title flex items-center gap-1 truncate">
            {trip.name}
            <ChevronDown className="size-4 shrink-0" style={{ color: C.ter }} />
          </span>
          <span className="t-label mt-0.5 flex gap-3" style={{ color: C.ter }}>
            <span>{trip.city}</span>
            <span className="tabular">{shortRange(trip.start, trip.end)}</span>
          </span>
        </button>
        <PointBadge />
      </header>
      <TripSwitch open={pick} onClose={() => setPick(false)} />
    </>
  )
}

function TripSwitch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trips, trip, setTripId, open: openO } = useApp()
  return (
    <Sheet2 open={open} onClose={onClose} title="여행 바꾸기">
      <ul className="flex flex-col gap-2">
        {trips.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => {
                setTripId(t.id)
                onClose()
              }}
              className="flex h-16 w-full items-center justify-between rounded-2xl px-4 text-left"
              style={{ background: t.id === trip.id ? C.line : C.bg }}
            >
              <span>
                <span className="t-body-m block font-semibold">{t.name}</span>
                <span className="t-cap" style={{ color: C.ter }}>
                  {t.city} · {shortRange(t.start, t.end)}
                </span>
              </span>
              {t.id === trip.id && <Check className="size-5" />}
            </button>
          </li>
        ))}
      </ul>
      <PillButton
        className="mt-4"
        onClick={() => {
          onClose()
          openO({ type: 'create' })
        }}
      >
        새 여행 만들기
      </PillButton>
    </Sheet2>
  )
}

/* ───────── 홈 ───────── */
export function Home2() {
  const { tripProducts, open, rate } = useApp()
  const list = tripProducts.filter((p) => p.priority !== 'skip')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<Sort>('우선순위 순')
  const [sortOpen, setSortOpen] = useState(false)
  const [cats, setCats] = useState<Category[]>([])
  const [q, setQ] = useState<string | null>(null)

  const shown = useMemo(() => {
    let l = list.filter((p) => (!cats.length || cats.includes(p.category)) && (!q || p.name.includes(q) || p.brand.toLowerCase().includes(q.toLowerCase())))
    l = [...l]
    if (sort === '우선순위 순') l.sort((a, b) => RANK[String(a.priority)] - RANK[String(b.priority)])
    if (sort === '여행자 인기순') l.sort((a, b) => b.pickRate - a.pickRate)
    if (sort === '가격 높은 순') l.sort((a, b) => b.price - a.price)
    if (sort === '가격 낮은 순') l.sort((a, b) => a.price - b.price)
    return l
  }, [list, cats, q, sort])
  const sum = shown.reduce((s, p) => s + p.price, 0)

  return (
    <Screen>
      <TripHeader />
      {!list.length ? (
        <EmptyHome />
      ) : (
        <>
          {/* 검색 · 우선순위 다시 고르기 */}
          <div className="mt-4 flex h-10 items-center justify-between gap-3 px-5">
            {q === null ? (
              <SearchCircle onClick={() => setQ('')} />
            ) : (
              <label className="flex h-10 flex-1 items-center gap-2 rounded-full bg-white px-4">
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="담은 상품 검색" className="t-label min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#737370]" />
                <button aria-label="검색 닫기" onClick={() => setQ(null)}>
                  <X className="size-4" style={{ color: C.gray }} />
                </button>
              </label>
            )}
            {q === null && (
              <button onClick={() => open({ type: 'swipe' })} className="t-label underline underline-offset-4" style={{ color: C.sub, textDecorationColor: C.g3 }}>
                우선순위 다시 고르기
              </button>
            )}
          </div>

          {/* 정렬 + 카테고리 칩 */}
          <div className="relative mt-4">
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-5">
              <Chip2 onClick={() => setSortOpen((v) => !v)} className="text-[#111]">
                {sort === '우선순위 순' ? '꼭 살래' : sort}
                <ChevronDown className={cn('size-4 transition', sortOpen && 'rotate-180')} />
              </Chip2>
              {CATS.map((c) => (
                <Chip2 key={c} active={cats.includes(c)} onClick={() => setCats((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}>
                  {c}
                </Chip2>
              ))}
            </div>
            <AnimatePresence>
              {sortOpen && (
                <>
                  <motion.button aria-label="닫기" className="fixed inset-0 z-30 bg-black/15" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSortOpen(false)} />
                  <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute top-11 left-5 z-40 w-[134px] rounded-2xl bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                    {SORTS.map((s) => (
                      <li key={s}>
                        <button
                          onClick={() => {
                            setSort(s)
                            setSortOpen(false)
                          }}
                          className="t-label flex h-8 w-full items-center px-3 text-left"
                          style={{ color: s === sort ? C.ink : C.gray, fontWeight: s === sort ? 600 : 500 }}
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* 개수 · 합계 + 보기 전환 */}
          <div className="mt-3 flex h-10 items-center justify-between px-5">
            <span className="t-cap2">
              <b className="font-semibold">{shown.length}개</b>
              <span style={{ color: C.ter }}> • {yenStr(sum)}</span>
              <span className="sr-only">{wonStr(sum, rate)}</span>
            </span>
            <div className="flex h-10 w-20 items-center gap-1 rounded-full p-1" style={{ background: C.g3 }} role="radiogroup" aria-label="보기 방식">
              {(['grid', 'list'] as const).map((v) => (
                <button key={v} role="radio" aria-checked={view === v} aria-label={v === 'grid' ? '그리드' : '리스트'} onClick={() => setView(v)} className="grid h-8 flex-1 place-items-center rounded-full transition" style={{ background: view === v ? '#fff' : 'transparent', color: view === v ? C.ink : '#fff' }}>
                  {v === 'grid' ? <LayoutGrid className="size-4" strokeWidth={1.8} /> : <List className="size-4" strokeWidth={1.8} />}
                </button>
              ))}
            </div>
          </div>

          {view === 'grid' ? (
            <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 px-5">
              {shown.map((p) => (
                <GridCard key={p.id} p={p} />
              ))}
            </ul>
          ) : (
            <ul className="mt-4 flex flex-col gap-2 px-5">
              {shown.map((p) => (
                <ListCard key={p.id} p={p} />
              ))}
            </ul>
          )}
          {!shown.length && (
            <p className="t-label py-16 text-center" style={{ color: C.gray }}>
              조건에 맞는 상품이 없어요
            </p>
          )}
        </>
      )}
    </Screen>
  )
}

function EmptyHome() {
  return (
    <div className="relative flex min-h-[calc(100dvh-78px-120px)] flex-col items-center justify-center text-center">
      <p className="t-h2">
        사고 싶은 물건을
        <br />
        모아볼까요?
      </p>
      <p className="t-body-m mt-3" style={{ color: C.sub, fontWeight: 400 }}>
        아래 + 버튼을 통해서
        <br />
        저장해둔 물건을 불러와요
      </p>
      {/* FAB를 가리키는 손그림 화살표 */}
      <svg aria-hidden viewBox="0 0 28 60" className="fixed right-[max(64px,calc(50%-176px))] bottom-[calc(98px+max(34px,env(safe-area-inset-bottom)))] z-40 h-[60px] w-7" fill="none" stroke={C.fab} strokeWidth="2" strokeLinecap="round">
        <path d="M4 2c-2 18 2 40 20 54" />
        <path d="M12 56l12 0 -2 -12" />
      </svg>
    </div>
  )
}

function GridCard({ p }: { p: Product }) {
  const { open, update } = useApp()
  return (
    <li className="relative">
      <button onClick={() => open({ type: 'product', id: p.id })} className="flex w-full flex-col items-center text-center">
        <span className="grid h-[100px] w-full place-items-center">
          <ProductImg p={p} className="max-h-[100px] max-w-[120px]" />
        </span>
        <span className="t-label mt-4 line-clamp-2 min-h-10 px-2" style={{ fontWeight: 500 }}>
          {p.name}
        </span>
        <Price yen={p.price} size="s" className="mt-1" />
      </button>
      <button aria-label={p.favorite ? '찜 해제' : '찜하기'} aria-pressed={p.favorite} onClick={() => update(p.id, { favorite: !p.favorite })} className="absolute top-0 right-2 grid size-8 place-items-center">
        <Heart className="size-[18px]" style={{ color: C.pinkLine, fill: p.favorite ? C.pink : 'transparent' }} strokeWidth={2} />
      </button>
    </li>
  )
}

export function PriorityPill({ p, onClick }: { p: Product; onClick?: () => void }) {
  const must = p.priority === 'must'
  return (
    <button onClick={onClick} className="t-label flex h-8 shrink-0 items-center gap-1 rounded-full border bg-white px-3" style={{ borderColor: C.g4 }}>
      {must ? <Heart className="size-4" style={{ color: C.pinkLine, fill: C.pink }} /> : <Bookmark className="size-4" style={{ color: C.gray, fill: C.gray }} />}
      {must ? '꼭 살래' : '고민'}
    </button>
  )
}

function ListCard({ p }: { p: Product }) {
  const { open, setPriority } = useApp()
  return (
    <li className="flex h-[92px] items-center gap-4 rounded-2xl bg-white pr-3 pl-4">
      <button onClick={() => open({ type: 'product', id: p.id })} className="flex min-w-0 flex-1 items-center gap-4 text-left">
        <span className="grid size-[72px] shrink-0 place-items-center">
          <ProductImg p={p} className="max-h-[72px] max-w-[72px]" />
        </span>
        <span className="min-w-0">
          <span className="t-label line-clamp-2">{p.name}</span>
          <Price yen={p.price} size="s" className="mt-1" />
        </span>
      </button>
      <PriorityPill p={p} onClick={() => setPriority(p.id, p.priority === 'must' ? 'maybe' : 'must')} />
    </li>
  )
}

/* ───────── + : 어떻게 저장할까요? ───────── */
export function SaveSheet2() {
  const { close, open, addManual } = useApp()
  const file = useRef<HTMLInputElement>(null)
  const [manual, setManual] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const go = (mode: 'shots' | 'link') => {
    close()
    window.setTimeout(() => open({ type: 'analyze', mode, images: [] }), 60)
  }
  const tiles = [
    { label: '스크린샷', Icon: ImageIcon, act: () => file.current?.click() },
    { label: '링크 붙여넣기', Icon: Link2, act: () => go('link') },
    { label: '사진 촬영', Icon: Camera, act: () => go('shots') },
    { label: '직접 입력', Icon: FileText, act: () => setManual(true) },
  ]
  return (
    <Sheet2 open onClose={close} title={manual ? '직접 입력' : '어떻게 저장할까요?'}>
      {!manual ? (
        <div className="grid grid-cols-2 gap-2">
          {tiles.map(({ label, Icon, act }) => (
            <button key={label} onClick={act} className="flex h-[84px] flex-col justify-between rounded-xl p-4 text-left" style={{ background: C.soft }}>
              <Icon className="size-6" strokeWidth={1.6} />
              <span className="t-body-m font-semibold">{label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="상품 이름" className="t-body-m h-12 rounded-xl px-4 outline-none" style={{ background: C.bg }} />
          <label className="flex h-12 items-center rounded-xl px-4" style={{ background: C.bg }}>
            <span className="t-body-m mr-1">¥</span>
            <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} placeholder="현지 가격" className="t-body-m min-w-0 flex-1 bg-transparent outline-none" />
          </label>
          <PillButton
            disabled={!name.trim()}
            onClick={() => {
              const added = addManual(name.trim(), Number(price) || 0, '잡화')
              close()
              window.setTimeout(() => open({ type: 'swipe', ids: [added.id], fresh: true }), 60)
            }}
          >
            담기
          </PillButton>
        </div>
      )}
      <input ref={file} type="file" accept="image/*" multiple hidden onChange={() => go('shots')} />
    </Sheet2>
  )
}

/* ───────── 스크린샷 분석 → 리스트 ───────── */
export function Analyze2() {
  const { close, open, scan, addProducts } = useApp()
  const results = useMemo(() => scan(8), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown >= results.length) return
    const t = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 700 : 450)
    return () => window.clearTimeout(t)
  }, [shown, results.length])
  const done = shown >= results.length
  return (
    <motion.div className="pk fixed inset-0 z-[60] overflow-y-auto" style={{ background: C.bg }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col pt-[env(safe-area-inset-top)]">
        <header className="flex h-[60px] items-center px-3">
          <IconBtn label="닫기" onClick={close}>
            <X className="size-6" strokeWidth={1.6} />
          </IconBtn>
        </header>
        <h1 className="t-h3 px-5" style={{ fontWeight: 500 }} aria-live="polite">
          {done ? (
            <>
              <b className="font-bold">{results.length}개</b>의 상품을
              <br />
              찾았어요
            </>
          ) : (
            <>
              Packit이 열심히
              <br />
              스크린샷을 분석 중이에요 <Dots />
            </>
          )}
        </h1>
        <ul className="mt-4 px-5">
          {results.slice(0, shown).map((p) => (
            <motion.li key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex h-[96px] items-center gap-6 border-b px-6" style={{ borderColor: C.g4 }}>
              <span className="grid size-[72px] shrink-0 place-items-center">
                <ProductImg p={p} className="max-h-[72px] max-w-[72px]" />
              </span>
              <span className="min-w-0">
                <span className="t-label line-clamp-2">{p.name}</span>
                <Price yen={p.price} size="s" className="mt-1" />
              </span>
            </motion.li>
          ))}
        </ul>
        <div className="sticky bottom-0 mt-auto px-5 pt-4 pb-[max(34px,env(safe-area-inset-bottom))]" style={{ background: `linear-gradient(to top, ${C.bg} 76%, transparent)` }}>
          <PillButton
            disabled={!done}
            dark={done}
            onClick={() => {
              addProducts(results)
              close()
              window.setTimeout(() => open({ type: 'swipe', ids: results.map((r) => r.id), fresh: true }), 60)
            }}
          >
            우선순위 정하기
          </PillButton>
        </div>
      </div>
    </motion.div>
  )
}

function Dots() {
  return (
    <span className="inline-flex gap-1 align-middle">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="inline-block size-1 rounded-full bg-current" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </span>
  )
}

/* ───────── 스와이프로 우선순위 ───────── */
type Decision = Exclude<Priority, never>
const DECIDE: Record<'right' | 'left' | 'down', Decision> = { right: 'must', left: 'skip', down: 'maybe' }

export function Swipe2({ ids, fresh }: { ids?: string[]; fresh?: boolean }) {
  const { tripProducts, setPriority, close, notify } = useApp()
  const deck = useMemo(() => (ids ? tripProducts.filter((p) => ids.includes(p.id)) : tripProducts), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [hist, setHist] = useState<{ id: string; prev: Priority | null }[]>([])
  const cur = deck[i]
  const decide = (dir: keyof typeof DECIDE) => {
    if (!cur) return
    setHist((h) => [...h, { id: cur.id, prev: cur.priority }])
    setPriority(cur.id, DECIDE[dir])
    setI((n) => n + 1)
  }
  const undo = () => {
    const last = hist[hist.length - 1]
    if (!last) return
    setPriority(last.id, last.prev)
    setHist((h) => h.slice(0, -1))
    setI((n) => Math.max(0, n - 1))
  }
  useEffect(() => {
    if (deck.length && i >= deck.length) {
      close()
      notify(fresh ? '우선순위를 정했어요' : '우선순위를 다시 골랐어요')
    }
  }, [i, deck.length]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') decide('right')
      if (e.key === 'ArrowLeft') decide('left')
      if (e.key === 'ArrowDown') decide('down')
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })
  return (
    <motion.div className="pk fixed inset-0 z-[60] overflow-hidden" style={{ background: C.bg }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col pt-[env(safe-area-inset-top)]">
        <header className="flex h-[60px] items-center justify-between px-3">
          <IconBtn label="닫기" onClick={close}>
            <X className="size-6" strokeWidth={1.6} />
          </IconBtn>
          <IconBtn label="되돌리기" onClick={undo} className={cn(!hist.length && 'opacity-30')}>
            <RotateCcw className="size-5" strokeWidth={1.8} />
          </IconBtn>
        </header>
        <div className="flex h-[42px] items-center justify-between px-6">
          <h1 className="t-h3">스와이프로 빠르게 결정해볼까요?</h1>
          <span className="t-label tabular" style={{ color: C.sub }}>
            {Math.min(i + 1, deck.length)}/{deck.length}
          </span>
        </div>
        <div className="mx-6 mt-2 h-1 rounded-full" style={{ background: C.g5 }}>
          <motion.div className="h-1 rounded-full" style={{ background: C.gray }} animate={{ width: `${(i / Math.max(1, deck.length)) * 100}%` }} />
        </div>
        <div className="relative mx-auto mt-10 h-[540px] w-[330px] max-w-[calc(100%-40px)]">
          {/* 뒤에 쌓인 카드 2장 */}
          <div className="absolute inset-x-4 top-[42px] h-[512px] rounded-2xl" style={{ background: '#F2F2F2' }} />
          <div className="absolute inset-x-2 top-[22px] h-[512px] rounded-2xl" style={{ background: C.soft }} />
          {deck[i + 1] && <SwipeCard key={deck[i + 1].id} p={deck[i + 1]} back />}
          <AnimatePresence>{cur && <SwipeCard key={cur.id} p={cur} onDecide={decide} />}</AnimatePresence>
        </div>
        <p className="t-cap mt-auto pb-[max(34px,env(safe-area-inset-bottom))] text-center" style={{ color: C.ter }}>
          오른쪽 꼭 살래 · 왼쪽 안 살래 · 아래 고민
        </p>
      </div>
    </motion.div>
  )
}

function SwipeCard({ p, back, onDecide }: { p: Product; back?: boolean; onDecide?: (d: 'right' | 'left' | 'down') => void }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rot = useTransform(x, [-200, 200], [-14, 14])
  const must = useTransform(x, [20, 110], [0, 1])
  const skip = useTransform(x, [-110, -20], [1, 0])
  const maybe = useTransform(y, [20, 110], [0, 1])
  const end = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info
    if (offset.x > 110 || velocity.x > 600) return fly('right')
    if (offset.x < -110 || velocity.x < -600) return fly('left')
    if (offset.y > 110 || velocity.y > 600) return fly('down')
    animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 })
  }
  const fly = (d: 'right' | 'left' | 'down') => {
    const to = d === 'right' ? { x: 520 } : d === 'left' ? { x: -520 } : { y: 700 }
    if ('x' in to) animate(x, to.x!, { duration: 0.25 })
    if ('y' in to) animate(y, to.y!, { duration: 0.25 })
    window.setTimeout(() => onDecide?.(d), 180)
  }
  return (
    <motion.div
      className={cn('absolute inset-x-0 top-0 flex h-[512px] touch-none flex-col rounded-2xl bg-white px-6 pt-6 pb-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]', back ? 'pointer-events-none scale-[0.96] opacity-0' : 'cursor-grab active:cursor-grabbing')}
      style={back ? undefined : { x, y, rotate: rot }}
      drag={!back}
      dragMomentum={false}
      onDragEnd={end}
      initial={back ? false : { scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <div className="relative grid flex-1 place-items-center">
        <ProductImg p={p} className="max-h-[300px] max-w-[240px]" />
        {!back && (
          <>
            <Stamp style={{ opacity: must }} className="top-0 left-0" label="꼭 살래">
              <span className="grid size-16 place-items-center rounded-full" style={{ background: C.pink }}>
                <Heart className="size-8 fill-white text-white" />
              </span>
            </Stamp>
            <Stamp style={{ opacity: skip }} className="top-0 right-0" label="안 살래">
              <span className="grid size-16 place-items-center rounded-full border-2 border-dashed bg-white" style={{ borderColor: C.gray }}>
                <X className="size-8" strokeWidth={1.4} style={{ color: C.gray }} />
              </span>
            </Stamp>
            <Stamp style={{ opacity: maybe }} className="top-0 left-1/2 -translate-x-1/2" label="고민">
              <span className="grid size-16 place-items-center rounded-full border-2 bg-white" style={{ borderColor: C.gray }}>
                <Bookmark className="size-7" style={{ color: C.gray, fill: C.gray }} />
              </span>
            </Stamp>
          </>
        )}
      </div>
      <p className="t-cap mt-4" style={{ color: C.ter }}>
        {p.brand}
      </p>
      <p className="t-body-m mt-1 truncate">{p.name}</p>
      <Price yen={p.price} size="l" className="mt-3" />
    </motion.div>
  )
}

function Stamp({ children, label, className, style }: { children: React.ReactNode; label: string; className: string; style: React.ComponentProps<typeof motion.span>['style'] }) {
  return (
    <motion.span className={cn('pointer-events-none absolute flex flex-col items-center gap-2', className)} style={style}>
      {children}
      <span className="t-cap2 rounded-full border bg-white px-3 py-0.5" style={{ borderColor: C.ink }}>
        {label}
      </span>
    </motion.span>
  )
}
