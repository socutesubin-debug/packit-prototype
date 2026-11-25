import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronLeft, ChevronRight, Flag, Frown, Languages, Luggage, Map, Meh, MessageCircle, Minus, Pencil, Plus, Share2, ShoppingBag, Smile, Star, Store as StoreIcon, Tag, Users, X } from 'lucide-react'
import { forwardRef, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { tiltOf } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IconBtn, Panel, PRIORITY_ICON, PRIORITY_META } from '@/components/ui/primitives'
import { PHRASES, STORES } from '@/lib/data'
import { useApp } from '@/lib/store'
import { buyInfo } from '@/lib/buy'
import { FindPhoto, FlagMark } from './Finds'
import type { Priority, Review } from '@/lib/types'
import { cn, toWon, won, yen } from '@/lib/utils'

export const MOOD: Record<Review['mood'], { label: string; icon: typeof Smile; cls: string }> = {
  good: { label: '좋아요', icon: Smile, cls: 'text-ink bg-sunken' },
  soso: { label: '보통', icon: Meh, cls: 'text-ink-2 bg-sunken' },
  bad: { label: '별로예요', icon: Frown, cls: 'text-muted-foreground bg-sunken' },
}

export function ProductDetail({ id, z }: { id: string; z: number }) {
  const { products, tripProducts, close, closeAll, update, rate, setRate, open, notify, setTab, setMapFocus, finds, inTrip, setInTrip } = useApp()
  const p = products.find((x) => x.id === id)
  const [more, setMore] = useState(false)
  const [editRate, setEditRate] = useState(false)
  const [rateDraft, setRateDraft] = useState(String(rate))
  const [compact, setCompact] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const storesRef = useRef<HTMLElement>(null)
  const reviewsRef = useRef<HTMLElement>(null)
  if (!p) return null
  const stores = STORES.filter((s) => p.storeIds.includes(s.id))
  const find = p.findId ? finds.find((f) => f.id === p.findId) : undefined
  const good = p.reviews.filter((r) => r.mood === 'good').length
  const go = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const buy = buyInfo(p, tripProducts, finds)
  const chainsShort = `${buy.chains[0]} 외 ${buy.chains.length - 1}곳`

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${p.name} · ${yen(p.price)} — Packit`)
      notify('상품 정보를 복사했어요')
    } catch {
      notify('복사할 수 없는 환경이에요')
    }
  }
  const toMap = () => {
    setMapFocus(`p:${p.id}`)
    closeAll()
    setTab('map')
  }

  const ATTRS = [
    { icon: Tag, label: p.category, onClick: undefined },
    find
      ? { icon: Flag, label: '이 가게에서만', onClick: () => go(storesRef.current) }
      : { icon: StoreIcon, label: chainsShort, onClick: () => go(storesRef.current) },
    find ? { icon: Users, label: `${find.saves}명 저장`, onClick: undefined } : { icon: Users, label: p.pickRate ? `${p.pickRate}% 선택` : '새 상품', onClick: undefined },
    { icon: MessageCircle, label: `후기 ${p.reviews.length}`, onClick: () => go(reviewsRef.current) },
  ]

  return (
    <Panel onClose={close} z={z}>
      {/* compact header — appears once the hero scrolls away */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-3 pt-[max(8px,env(safe-area-inset-top))] pb-2 backdrop-blur transition-[opacity,transform] duration-200',
          compact ? 'opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
        )}
      >
        <IconBtn label="뒤로" onClick={close} className="border-0 shadow-none">
          <ChevronLeft className="size-5" />
        </IconBtn>
        <p className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold">{p.name}</p>
        <IconBtn label={p.favorite ? '즐겨찾기 해제' : '즐겨찾기'} onClick={() => update(p.id, { favorite: !p.favorite })} className="border-0 shadow-none">
          <Star className={cn('size-[18px]', p.favorite && 'fill-foreground')} />
        </IconBtn>
      </div>

      <div ref={scroller} onScroll={(e) => setCompact(e.currentTarget.scrollTop > 240)} className="relative flex-1 overflow-y-auto pb-28">
        {/* 1. hero */}
        <div className="relative bg-muted/70">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
            <IconBtn label="뒤로" onClick={close} className="rounded-full">
              <ChevronLeft className="size-5" />
            </IconBtn>
            <div className="flex gap-2">
              <IconBtn label="공유" onClick={share} className="rounded-full">
                <Share2 className="size-[17px]" />
              </IconBtn>
              <IconBtn label={p.favorite ? '즐겨찾기 해제' : '즐겨찾기'} onClick={() => update(p.id, { favorite: !p.favorite })} className="rounded-full">
                <Star className={cn('size-[17px]', p.favorite && 'fill-foreground')} />
              </IconBtn>
            </div>
          </div>
          <div className="absolute top-[max(16px,env(safe-area-inset-top))] left-1/2 z-10 -translate-x-1/2">
            <div className="flex h-8 items-center rounded-full border bg-background/90 p-[3px] text-[12px] font-medium shadow-xs backdrop-blur" role="group" aria-label="미리보기: 여행 시점">
              {[
                { v: false, label: '여행 전' },
                { v: true, label: '여행 중' },
              ].map((o) => (
                <button key={o.label} onClick={() => setInTrip(o.v)} aria-pressed={inTrip === o.v} className={cn('h-full rounded-full px-3 transition-colors', inTrip === o.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="flex justify-center pt-16 pb-12">
            <ProductArt art={p.art} tone="none" tilt={tiltOf(p.id)} className="aspect-square w-[64%] max-w-[300px]" />
          </motion.div>
        </div>

        {/* 2. info sheet, overlapping the hero */}
        <div className="relative -mt-6 rounded-t-[28px] bg-background px-5 pt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {p.brand} · {p.category}
            </p>
            {find ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-md bg-primary px-2 text-[11.5px] font-semibold text-primary-foreground">
                <FlagMark className="h-[11px] w-[9px]" light /> 현지 발견
              </span>
            ) : p.pickRate >= 60 ? (
              <span className="inline-flex h-6 items-center rounded-md bg-primary px-2 text-[11.5px] font-semibold text-primary-foreground">인기 {p.pickRate}%</span>
            ) : null}
          </div>
          <h1 className="mt-1.5 text-[24px] leading-tight font-semibold tracking-tight text-balance">{p.name}</h1>
          {p.ja && (
            <p lang="ja" className="mt-0.5 text-[13px] text-muted-foreground">
              {p.ja}
            </p>
          )}
          <button onClick={() => go(reviewsRef.current)} className="mt-2 inline-flex items-center gap-1.5 text-[13px]">
            <span className="inline-flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={cn('size-3.5', i < Math.round((good / Math.max(1, p.reviews.length)) * 5) ? 'fill-foreground' : 'text-muted-foreground/40')} />
              ))}
            </span>
            <span className="font-medium tabular">{p.reviews.length ? `좋아요 ${good}` : '후기 없음'}</span>
            <span className="text-muted-foreground tabular">({p.reviews.length}개 후기)</span>
          </button>

          {/* decision block: others' pick rate + local / KRW price */}
          {p.pickRate > 0 && (
            <div className="mt-5 rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="font-semibold">
                  다른 여행자 <b>{p.pickRate}%</b>가 꼭 살래로 골랐어요
                </span>
                <span className="text-[11px] text-muted-foreground">예시 데이터</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${p.pickRate}%` }} transition={{ delay: 0.2, duration: 0.6 }} />
              </div>
            </div>
          )}
          <section className={cn('grid grid-cols-2 gap-2.5', p.pickRate > 0 ? 'mt-2.5' : 'mt-5')}>
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <p className="text-[12px] font-medium text-muted-foreground">현지 가격</p>
              <p className="mt-1 text-[24px] font-semibold tracking-tight tabular">{yen(p.price)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <p className="text-[12px] font-medium text-muted-foreground">구매 예상 가격</p>
              <p className="mt-1 text-[24px] font-semibold tracking-tight tabular">약 {won(toWon(p.price, rate))}</p>
            </div>
          </section>
          <div className="mt-2 flex items-center justify-between px-1 text-[12.5px] text-muted-foreground">
            <AnimatePresence mode="wait" initial={false}>
              {editRate ? (
                <motion.form
                  key="e"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const v = Number(rateDraft)
                    if (v > 0) setRate(v)
                    setEditRate(false)
                  }}
                >
                  100엔 =
                  <input autoFocus inputMode="decimal" value={rateDraft} onChange={(e) => setRateDraft(e.target.value.replace(/[^\d.]/g, ''))} className="h-8 w-20 rounded-md border border-input bg-background px-2 text-[14px] font-semibold tabular outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                  원
                  <button className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground" aria-label="환율 저장">
                    <Check className="size-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.span key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tabular">
                  환율 기준 100엔 = {rate.toLocaleString('ko-KR')}원
                </motion.span>
              )}
            </AnimatePresence>
            {!editRate && (
              <button onClick={() => { setRateDraft(String(rate)); setEditRate(true) }} className="inline-flex items-center gap-1 font-medium text-foreground/80 underline-offset-2 hover:underline">
                <Pencil className="size-3" /> 환율 수정
              </button>
            )}
          </div>

          {/* description */}
          <p className={cn('mt-5 text-[14.5px] leading-relaxed text-foreground/80', !more && 'line-clamp-3')}>{p.desc}</p>
          <button onClick={() => setMore(!more)} className="mt-1 text-[13px] font-medium text-muted-foreground">
            {more ? '접기' : '더 보기'}
          </button>

          {/* 3. attribute row — 4 equal columns */}
          <div className="mt-5 grid grid-cols-4 border-y">
            {ATTRS.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                disabled={!a.onClick}
                className={cn('flex flex-col items-center gap-1.5 py-4 text-[12px] text-muted-foreground transition enabled:hover:bg-accent/50', i > 0 && 'border-l')}
              >
                <a.icon className="size-5 text-foreground" strokeWidth={1.7} />
                <span className="tabular">{a.label}</span>
              </button>
            ))}
          </div>

          {/* 5. where to buy → lives on the map */}
          <Section title="어디서 살까요" ref={storesRef}>
            <button onClick={toMap} className="flex w-full items-center gap-3 rounded-xl border bg-card p-3.5 text-left shadow-xs transition hover:bg-accent/50">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg border bg-muted">{find ? <Flag className="size-5" /> : <Map className="size-5" />}</span>
              <span className="min-w-0 flex-1">
                {find ? (
                  <>
                    <span className="block text-[12px] text-muted-foreground">현지 발견 · 이 가게에서만</span>
                    <span className="block truncate text-[14.5px] font-semibold">
                      {find.place} · {find.area}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <span className="rounded bg-primary px-1.5 py-px text-[11px] font-semibold text-primary-foreground">흔해요</span>
                      {buy.chains.join(' · ')}
                    </span>
                    <span className="mt-0.5 block truncate text-[14.5px] font-semibold">
                      {buy.oneStop ? `${buy.oneStop.store.name.split(' ')[0]}에서 꼭 살래 ${buy.oneStop.n}개 한 번에` : buy.nearest ? `가장 가까운 곳 ${buy.nearest.distance}m` : '지도에서 매장 보기'}
                    </span>
                  </>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-muted-foreground">
                지도 <ChevronRight className="size-4" />
              </span>
            </button>
          </Section>

          {/* 6. memo */}
          <Section title="메모">
            <Textarea value={p.memo} onChange={(e) => update(p.id, { memo: e.target.value })} rows={2} placeholder="누구 선물인지, 몇 개 살지 남겨 보세요" className="resize-none bg-background p-3.5 text-[15px]" />
          </Section>

          {/* 8. reviews */}
          <Section title={`구매 후기 ${p.reviews.length}`} ref={reviewsRef} note="예시 후기">
            {p.reviews.length === 0 ? (
              <p className="rounded-xl border border-dashed p-5 text-center text-[13.5px] text-muted-foreground">아직 후기가 없어요</p>
            ) : (
              <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
                {p.reviews.map((r, i) => {
                  const M = MOOD[r.mood]
                  return (
                    <li key={i} className="p-4">
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
                        <M.icon className="size-3.5" /> {M.label}
                      </span>
                      <p className="mt-1.5 text-[14.5px]">{r.text}</p>
                      <p className="mt-1.5 text-[12px] text-muted-foreground">
                        {r.user} · {r.trip}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>
        </div>
      </div>

      {/* bottom bar — 여행 전: decide · 여행 중: act in the store */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t bg-background/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
        {inTrip ? (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="size-11 shrink-0" onClick={() => open({ type: 'ask', id: p.id })} aria-label="현지어 문의">
              <Languages className="size-5" />
            </Button>
            <Button variant="outline" size="icon" className="size-11 shrink-0" onClick={toMap} aria-label="지도에서 보기">
              <Map className="size-5" />
            </Button>
            <Button
              size="lg"
              className="flex-1"
              variant={p.purchased ? 'outline' : 'default'}
              onClick={() => {
                update(p.id, { purchased: !p.purchased, priority: p.priority ?? 'must' })
                notify(p.purchased ? '구매 기록을 지웠어요' : '캐리어에 담았어요')
              }}
            >
              {p.purchased ? (
                <>
                  <Check /> 캐리어에 담았어요
                </>
              ) : (
                <>
                  <Luggage /> 샀어요
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(['skip', 'maybe', 'must'] as Priority[]).map((v) => {
              const on = p.priority === v
              const I = PRIORITY_ICON[v].icon
              return (
                <button
                  key={v}
                  onClick={() => {
                    update(p.id, { priority: on ? null : v })
                    if (!on) notify(`${PRIORITY_META[v].label}로 정했어요`)
                  }}
                  aria-pressed={on}
                  className={cn('flex h-12 items-center justify-center gap-1.5 rounded-lg border text-[14px] font-medium transition active:scale-95', on ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-accent')}
                >
                  <I className="size-[18px]" strokeWidth={2} />
                  {PRIORITY_META[v].label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Panel>
  )
}

const Section = forwardRef<HTMLElement, { title: string; children: React.ReactNode; action?: { label: string; onClick: () => void }; note?: string }>(function Section({ title, children, action, note }, ref) {
  return (
    <section ref={ref} className="scroll-mt-20 pt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[16px] font-semibold tracking-tight">{title}</h2>
        {action ? (
          <button onClick={action.onClick} className="inline-flex items-center gap-0.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
            {action.label} <ChevronRight className="size-3.5" />
          </button>
        ) : note ? (
          <span className="text-[11px] text-muted-foreground">{note}</span>
        ) : null}
      </div>
      {children}
    </section>
  )
})

export function AskCard({ id }: { id: string }) {
  const { products, close } = useApp()
  const p = products.find((x) => x.id === id)
  const [i, setI] = useState(0)
  if (!p) return null
  const ph = PHRASES[i]
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} role="dialog" aria-modal="true" aria-label="현지어 문의">
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] rounded-2xl border bg-card shadow-xs p-6 shadow-lg"
      >
        <button onClick={close} aria-label="닫기" className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-sunken">
          <X className="size-5" />
        </button>
        <p className="text-[12.5px] font-semibold text-muted-foreground">점원에게 이 화면을 보여 주세요</p>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <h2 lang="ja" className="mt-3 pr-8 text-[30px] leading-[1.2] font-extrabold tracking-tight">
              {ph.ja}
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground">{ph.ko}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 flex items-center gap-4 rounded-xl bg-sunken p-3">
          <ProductArt art={p.art} className="size-28 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">{p.brand}</p>
            <p lang="ja" className="mt-1 text-[16px] leading-snug font-semibold">
              {p.ja || p.name}
            </p>
            <p className="mt-1.5 text-[18px] font-extrabold tabular">{yen(p.price)}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {PHRASES.map((x, k) => (
            <button key={k} onClick={() => setI(k)} aria-pressed={k === i} className={cn('h-9 rounded-full px-3.5 text-[13px] font-semibold transition', k === i ? 'bg-ink text-white' : 'bg-sunken text-ink-2')}>
              {x.ko}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
