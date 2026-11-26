import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Luggage, MapPin, MessageSquareText, Pencil, Share2, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { useState } from 'react'
import tokyoHero from '@/assets/products/tokyobanana-hero.png'
import { PHRASES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Product, Review } from '@/lib/types'
import { cn } from '@/lib/utils'
import { BackButton, C, IconBtn, ProductImg, wonStr, yenStr } from './ui'

const HERO: Record<string, string> = { p1: tokyoHero }

export const MOOD: Record<Review['mood'], { label: string; color: string; up: boolean }> = {
  good: { label: '최고에요', color: C.best, up: true },
  soso: { label: '좋아요', color: C.good, up: true },
  bad: { label: '별로에요', color: C.bad, up: false },
}

export function MoodIcon({ mood, className }: { mood: Review['mood']; className?: string }) {
  const m = MOOD[mood]
  const I = m.up ? ThumbsUp : ThumbsDown
  return <I className={cn('size-4', className)} style={{ color: m.color, fill: m.color }} strokeWidth={1.4} />
}

export function Product2({ id, z }: { id: string; z: number }) {
  const { products, close, update, rate, notify, setTab, setMapFocus, closeAll } = useApp()
  const p = products.find((x) => x.id === id)
  const [more, setMore] = useState(false)
  const [lang, setLang] = useState(false)
  if (!p) return null
  const hero = HERO[p.id.replace(/^o-/, '').split('-')[0]]
  return (
    <motion.div className="pk fixed inset-0 overflow-y-auto" style={{ zIndex: z, background: '#fff' }} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }}>
      <div className="relative mx-auto w-full max-w-[480px] pt-[env(safe-area-inset-top)]">
        {/* 상단 사진 364 */}
        <div className="relative h-[364px] bg-white">
          <header className="absolute inset-x-0 top-0 z-10 flex h-[60px] items-center justify-between px-5">
            <BackButton onClick={close} />
            <IconBtn label="공유" onClick={() => notify('링크를 복사했어요')} className="-mr-2">
              <Share2 className="size-6" strokeWidth={1.6} />
            </IconBtn>
          </header>
          <div className="grid h-full place-items-center pt-10">{hero ? <img src={hero} alt="" className="h-[300px] w-auto object-contain" /> : <ProductImg p={p} className="max-h-[240px] max-w-[260px]" />}</div>
        </div>

        <div className="relative -mt-4 rounded-t-3xl px-5 pt-8 pb-[calc(108px+env(safe-area-inset-bottom))]" style={{ background: C.bg }}>
          <div className="flex items-center justify-between">
            <span className="t-label" style={{ color: C.ter }}>
              {p.brand}
            </span>
            <span className="t-label flex h-7 items-center gap-1 rounded-full px-3 text-white" style={{ background: C.ink }} title="여행자 추천률">
              <ThumbsUp className="size-4 fill-white" strokeWidth={1.4} />
              {p.pickRate}%
            </span>
          </div>
          <h1 className="t-h3 mt-2" style={{ fontWeight: 700 }}>
            {p.name}
          </h1>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <PriceBox label="현지 가격" value={yenStr(p.price)} />
            <PriceBox label="구매 예상 가격" value={wonStr(p.price, rate)} />
          </div>
          <div className="t-cap mt-3 flex items-center justify-between" style={{ color: C.ter }}>
            <span>환율 기준 100엔 = {rate}원</span>
            <button onClick={() => notify('환율은 매일 아침 자동으로 바뀌어요')} className="flex items-center gap-1" style={{ color: C.sub }}>
              <Pencil className="size-3.5" /> 환율 수정
            </button>
          </div>

          <p className={cn('t-body-m mt-6', !more && 'line-clamp-3')} style={{ color: C.ter, fontWeight: 400, lineHeight: '26px' }}>
            {p.desc}
          </p>
          {!more && (
            <button onClick={() => setMore(true)} className="t-label mt-1 underline underline-offset-4">
              더보기
            </button>
          )}

          <textarea
            value={p.memo}
            onChange={(e) => update(p.id, { memo: e.target.value })}
            placeholder="메모를 남겨보세요."
            rows={1}
            className="t-body-m field-sizing-content mt-6 min-h-[52px] w-full resize-none rounded-xl bg-white px-5 py-[15px] outline-none placeholder:text-[#92928C]"
            style={{ fontWeight: 400 }}
          />

          <button className="t-body-m mt-8 flex items-center gap-1 font-semibold">
            구매 후기 <ChevronRight className="size-5" />
          </button>
          {p.reviews.length ? (
            <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
              {p.reviews.map((r, i) => (
                <div key={i} className="w-[226px] shrink-0 rounded-xl bg-white p-4">
                  <div className="t-cap flex items-center gap-2" style={{ color: C.ter }}>
                    <span className="flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 whitespace-nowrap" style={{ borderColor: C.line, color: C.sub }}>
                      <MoodIcon mood={r.mood} className="size-3.5" />
                      {MOOD[r.mood].label}
                    </span>
                    <span className="truncate">
                      {r.trip} | {r.user}
                    </span>
                  </div>
                  <p className="t-label mt-3 line-clamp-3" style={{ fontWeight: 500 }}>
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="t-label mt-3" style={{ color: C.ter }}>
              아직 후기가 없어요
            </p>
          )}
          <button className="t-label mt-4 h-10 w-full rounded-lg font-semibold" style={{ background: C.line }}>
            후기 모두보기
          </button>
        </div>

        {/* 하단 바 */}
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-white" style={{ borderColor: C.line }}>
          <div className="mx-auto flex max-w-[480px] items-center gap-2 px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
            <IconBtn label="현지어 카드" onClick={() => setLang(true)} className="rounded-lg border bg-white" style={{ borderColor: C.g4 }}>
              <MessageSquareText className="size-5" strokeWidth={1.6} />
            </IconBtn>
            <IconBtn
              label="지도에서 보기"
              onClick={() => {
                setMapFocus(p.storeIds[0] ?? null)
                closeAll()
                setTab('map')
              }}
              className="rounded-lg border bg-white"
              style={{ borderColor: C.g4 }}
            >
              <MapPin className="size-5" strokeWidth={1.6} />
            </IconBtn>
            <button
              onClick={() => {
                update(p.id, { purchased: !p.purchased })
                notify(p.purchased ? '구매를 취소했어요' : '캐리어에 담았어요')
              }}
              aria-pressed={p.purchased}
              className="t-body-l flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-white transition"
              style={{ background: p.purchased ? '#B9B9BB' : C.btn }}
            >
              <Luggage className="size-5" strokeWidth={1.8} />
              샀어요
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>{lang && <LangCard p={p} onClose={() => setLang(false)} />}</AnimatePresence>
    </motion.div>
  )
}

function PriceBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-4">
      <p className="t-label" style={{ color: C.ter }}>
        {label}
      </p>
      <p className="t-h3 mt-2 tabular" style={{ fontWeight: 700 }}>
        {value}
      </p>
    </div>
  )
}

/** 점원에게 보여주는 현지어 카드 */
function LangCard({ p, onClose }: { p: Product; onClose: () => void }) {
  const [i, setI] = useState(0)
  const ph = PHRASES[i]
  return (
    <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button aria-label="닫기" className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="pointer-events-none relative mx-auto flex h-full max-w-[480px] flex-col justify-center gap-2 px-6 [&>*]:pointer-events-auto">
        <motion.div initial={{ y: 16, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="rounded-3xl px-6 pt-6 pb-8" style={{ background: C.bg }} role="dialog" aria-label="현지어 카드">
          <div className="flex items-center justify-between">
            <span className="t-label" style={{ color: C.ter }}>
              점원에게 이 화면을 보여주세요
            </span>
            <IconBtn label="닫기" onClick={onClose} className="-mr-3">
              <X className="size-6" strokeWidth={1.6} />
            </IconBtn>
          </div>
          <p lang="ja" className="mt-2 text-[32px] leading-[44px] font-bold">
            {ph.ja}
          </p>
          <p className="t-label mt-2" style={{ color: C.sub }}>
            {ph.ko}
          </p>
          <div className="mt-8 grid h-[120px] place-items-center">
            <ProductImg p={p} className="max-h-[120px] max-w-[160px]" />
          </div>
          <p className="t-label mt-4 text-center" style={{ color: C.ter }}>
            {p.brand}
          </p>
          <p lang="ja" className="t-h3 mt-2 text-center" style={{ fontWeight: 700 }}>
            {p.ja}
          </p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-2 rounded-3xl px-4 py-4" style={{ background: C.bg }}>
          {PHRASES.map((x, k) => (
            <button key={x.ko} onClick={() => setI(k)} aria-pressed={i === k} className="t-label h-9 rounded-full px-3" style={i === k ? { background: C.ink, color: '#fff' } : { background: C.line, color: C.ink }}>
              {x.ko}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
