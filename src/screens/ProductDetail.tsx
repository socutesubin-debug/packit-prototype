import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronLeft, ChevronRight, Frown, Languages, Map, Meh, Pencil, Share2, Smile, Star, Store as StoreIcon, X } from 'lucide-react'
import { useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { tiltOf } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IconBtn, Panel } from '@/components/ui/primitives'
import { PHRASES, STORES } from '@/lib/data'
import { useApp } from '@/lib/store'
import { FindPhoto, FlagMark } from './Finds'
import type { Priority, Review } from '@/lib/types'
import { cn, toWon, won, yen } from '@/lib/utils'

export const MOOD: Record<Review['mood'], { label: string; icon: typeof Smile; cls: string }> = {
  good: { label: '좋아요', icon: Smile, cls: 'text-ink bg-sunken' },
  soso: { label: '보통', icon: Meh, cls: 'text-ink-2 bg-sunken' },
  bad: { label: '별로예요', icon: Frown, cls: 'text-muted-foreground bg-sunken' },
}

const PRI: { v: Priority; label: string; on: string }[] = [
  { v: 'must', label: '꼭 살래', on: 'bg-ink text-white' },
  { v: 'maybe', label: '고민', on: 'bg-ink text-white' },
  { v: 'skip', label: '안 살래', on: 'bg-ink text-white' },
]

export function ProductDetail({ id, z }: { id: string; z: number }) {
  const { products, close, closeAll, update, rate, setRate, open, notify, setTab, setMapFocus, finds } = useApp()
  const p = products.find((x) => x.id === id)
  const [more, setMore] = useState(false)
  const [editRate, setEditRate] = useState(false)
  const [rateDraft, setRateDraft] = useState(String(rate))
  if (!p) return null
  const stores = STORES.filter((s) => p.storeIds.includes(s.id))
  const find = p.findId ? finds.find((f) => f.id === p.findId) : undefined

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${p.name} · ${yen(p.price)} — Packit`)
      notify('상품 정보를 복사했어요')
    } catch {
      notify('복사할 수 없는 환경이에요')
    }
  }

  return (
    <Panel onClose={close} z={z}>
      <div className="relative flex-1 overflow-y-auto pb-32">
        <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <IconBtn label="뒤로" onClick={close} className="shadow-none">
            <ChevronLeft className="size-5" />
          </IconBtn>
          <div className="flex gap-2">
            <IconBtn label="공유" onClick={share} className="shadow-none">
              <Share2 className="size-[18px]" />
            </IconBtn>
            <IconBtn label={p.favorite ? '즐겨찾기 해제' : '즐겨찾기'} onClick={() => update(p.id, { favorite: !p.favorite })} className="shadow-none">
              <Star className={cn('size-[18px]', p.favorite && 'fill-ink')} />
            </IconBtn>
          </div>
        </div>
        <div className="px-5 pt-5">
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-balance">{p.name}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {p.brand}
            {p.ja && <span className="block text-[12.5px] text-faint">{p.ja}</span>}
          </p>
        </div>
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <ProductArt art={p.art} tone="none" tilt={tiltOf(p.id)} className="mx-auto aspect-square w-[78%] max-w-[340px]" />
        </motion.div>

        <div className="px-5">
          <p className={cn('mt-3 text-[14.5px] leading-relaxed text-ink-2', !more && 'line-clamp-2')}>{p.desc}</p>
          <button onClick={() => setMore(!more)} className="mt-1 text-[13px] font-semibold text-muted-foreground">
            {more ? '접기' : '펼쳐보기'}
          </button>

          {p.pickRate > 0 && (
            <div className="mt-4 rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="font-semibold">다른 여행자 <b>{p.pickRate}%</b>가 꼭 살래로 골랐어요</span>
                <span className="text-[11px] text-faint">예시 데이터</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-sunken">
                <motion.div className="h-full rounded-full bg-ink" initial={{ width: 0 }} animate={{ width: `${p.pickRate}%` }} transition={{ delay: 0.2, duration: 0.6 }} />
              </div>
            </div>
          )}

          <section className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <p className="text-[12px] font-semibold text-muted-foreground">현지 가격</p>
              <p className="mt-1 text-[24px] font-extrabold tracking-tight tabular">{yen(p.price)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-xs">
              <p className="text-[12px] font-semibold text-muted-foreground">구매 예상 가격</p>
              <p className="mt-1 text-[24px] font-extrabold tracking-tight tabular">약 {won(toWon(p.price, rate))}</p>
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
                  <input autoFocus inputMode="decimal" value={rateDraft} onChange={(e) => setRateDraft(e.target.value.replace(/[^\d.]/g, ''))} className="h-8 w-20 rounded-lg bg-background px-2 text-[14px] font-semibold tabular border border-input outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                  원
                  <button className="grid size-8 place-items-center rounded-full bg-ink text-white" aria-label="환율 저장">
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
              <button onClick={() => { setRateDraft(String(rate)); setEditRate(true) }} className="inline-flex items-center gap-1 font-semibold text-ink-2 underline-offset-2 hover:underline">
                <Pencil className="size-3" /> 환율 수정
              </button>
            )}
          </div>

          <h2 className="mt-7 text-[16px] font-semibold">이번 여행에서는</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {PRI.map((o) => {
              const on = p.priority === o.v
              return (
                <button key={o.v} onClick={() => update(p.id, { priority: on ? null : o.v })} aria-pressed={on} className={cn('h-12 rounded-2xl text-[14px] font-semibold transition active:scale-95', on ? o.on : 'bg-surface text-ink-2 border')}>
                  {o.label}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => {
              update(p.id, { purchased: !p.purchased, priority: p.priority ?? 'must' })
              notify(p.purchased ? '구매 기록을 지웠어요' : '캐리어에 담았어요')
            }}
            className={cn('mt-2.5 flex h-14 w-full items-center gap-3 rounded-2xl px-4 text-left transition', p.purchased ? 'bg-ink text-white' : 'bg-surface border')}
          >
            <span className={cn('grid size-7 place-items-center rounded-full', p.purchased ? 'bg-white text-ink' : 'ring-2 ring-line')}>{p.purchased && <Check className="size-4" strokeWidth={3} />}</span>
            <span className="flex-1">
              <span className="block text-[14.5px] font-semibold">샀어요</span>
              <span className={cn('block text-[12px]', p.purchased ? 'text-white/60' : 'text-muted-foreground')}>체크하면 이번 여행 캐리어에 담겨요</span>
            </span>
          </button>

          <label className="mt-7 block">
            <span className="text-[16px] font-semibold">메모</span>
            <Textarea
              value={p.memo}
              onChange={(e) => update(p.id, { memo: e.target.value })}
              rows={2}
              placeholder="누구 선물인지, 몇 개 살지 남겨 보세요"
              className="mt-3 resize-none bg-background p-3.5 text-[15px]"
            />
          </label>

          {find && (
            <button onClick={() => open({ type: 'find', id: find.id })} className="mt-6 flex w-full items-center gap-3 rounded-xl border bg-card shadow-xs p-3 text-left">
              <FindPhoto f={find} className="size-14 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[12px] font-semibold text-brand">
                  <FlagMark className="h-[13px] w-[10px]" /> 현지 발견
                </span>
                <span className="mt-0.5 block truncate text-[14px] font-semibold">{find.author}님이 {find.place}에서 발견</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}
          {stores.length > 0 && (
            <section className="mt-6">
              <h2 className="text-[16px] font-semibold">살 수 있는 곳 {stores.length}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {stores.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => open({ type: 'store', id: s.id })} className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left border hover:bg-accent">
                      <span className="grid size-10 place-items-center rounded-xl" style={{ background: s.color }}>
                        <StoreIcon className={cn('size-5', s.color === '#1E1E1E' || s.color === '#4A4A4A' ? 'text-white' : 'text-ink')} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14px] font-semibold">{s.name}</span>
                        <span className="text-[12px] text-muted-foreground tabular">
                          {s.distance}m · {s.hours}
                        </span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[16px] font-semibold">구매 후기 {p.reviews.length}</h2>
              <span className="text-[11px] text-faint">예시 후기</span>
            </div>
            {p.reviews.length === 0 ? (
              <p className="mt-3 rounded-2xl bg-surface p-5 text-center text-[13.5px] text-muted-foreground border">아직 후기가 없어요. 첫 후기를 남겨 보세요</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {p.reviews.map((r, i) => {
                  const M = MOOD[r.mood]
                  return (
                    <li key={i} className="rounded-xl border bg-card p-4 shadow-xs">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold', M.cls)}>
                        <M.icon className="size-3.5" /> {M.label}
                      </span>
                      <p className="mt-2 text-[14.5px]">{r.text}</p>
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        {r.user} · {r.trip}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-ground from-60% to-transparent px-5 pt-6 pb-[max(16px,env(safe-area-inset-bottom))]">
        <Button variant="outline" size="lg" className="flex-1" onClick={() => open({ type: 'ask', id: p.id })}>
          <Languages className="size-5" /> 현지어 문의
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={() => {
            setMapFocus(find ? `f:${find.id}` : (stores[0]?.id ?? null))
            closeAll()
            setTab('map')
          }}
        >
          <Map className="size-5" /> 지도에서 보기
        </Button>
      </div>
    </Panel>
  )
}

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
