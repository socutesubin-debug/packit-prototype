import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { Camera, List, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Sticker } from '@/components/art/Stickers'
import { SUITCASE_COLORS } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Product, Review, StickerKind } from '@/lib/types'
import { cn, shortRange, uid } from '@/lib/utils'
import { TintedCarrier } from '@/screens/CreateTrip'
import { MOOD, MoodIcon } from './Product2'
import { BackButton, C, IconBtn, PointBadge, Price, ProductImg, Screen, wonStr, yenStr } from './ui'

const tintOf = (hex: string) => SUITCASE_COLORS.find((c) => c.value.toLowerCase() === hex.toLowerCase())?.tint ?? null

/* ───────── 나의 캐리어 ───────── */
export function Carry2() {
  const { trips, products, open } = useApp()
  return (
    <Screen>
      <header className="flex h-[78px] items-center justify-between px-5 pt-3">
        <h1 className="t-title" style={{ fontWeight: 500 }}>
          여행 마다 쌓이는
          <br />
          <b className="font-bold">나의 캐리어</b>
        </h1>
        <PointBadge />
      </header>
      <ul className="mt-8 grid grid-cols-2 gap-4 px-5">
        {trips.map((t) => {
          const bought = products.filter((p) => p.tripId === t.id && p.purchased).length
          return (
            <li key={t.id}>
              <button onClick={() => open({ type: 'carry', tripId: t.id })} className="flex h-[274px] w-full flex-col items-center rounded-xl bg-white px-2 pt-4 pb-4 text-center">
                <span className="t-body-m w-full truncate font-semibold">{t.name}</span>
                <span className="t-label mt-1 tabular" style={{ color: C.ter }}>
                  {shortRange(t.start, t.end)}
                </span>
                <span className="mt-4 block h-[148px] w-[100px]">
                  <TintedCarrier tint={tintOf(t.suitcase.color)} />
                </span>
                <span className="t-cap mt-auto" style={{ color: C.ter }}>
                  구매 {bought}개
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}

/* ───────── 캐리어 꾸미기 (겉면 · 내부) ───────── */
const SHEET_STICKERS: StickerKind[] = ['tokyo', 'tower', 'osaka', 'fuji', 'onigiri', 'sakura', 'packit', 'ticket', 'cat']

export function CarryDetail2({ tripId, z }: { tripId: string; z: number }) {
  const { trips, close, notify } = useApp()
  const t = trips.find((x) => x.id === tripId)
  const [side, setSide] = useState<'out' | 'in'>('out')
  if (!t) return null
  return (
    <motion.div className="pk fixed inset-0 overflow-hidden" style={{ zIndex: z, background: C.bg }} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }}>
      <div className="relative mx-auto flex h-dvh w-full max-w-[480px] flex-col pt-[env(safe-area-inset-top)]">
        <header className="flex h-[60px] shrink-0 items-center justify-between px-5 pt-2">
          <BackButton onClick={close} />
          <div className="text-center">
            <p className="t-title" style={{ fontWeight: 600 }}>
              캐리어 꾸미기
            </p>
            <p className="t-cap" style={{ color: C.ter }}>
              {t.name} | {shortRange(t.start, t.end)}
            </p>
          </div>
          <IconBtn label="사진으로 저장" onClick={() => notify('캐리어 사진을 앨범에 저장했어요')} className="-mr-2">
            <Camera className="size-6" strokeWidth={1.6} />
          </IconBtn>
        </header>
        <div className="mt-4 flex justify-center">
          <div className="flex h-11 gap-1 rounded-full bg-white p-1" role="tablist">
            {(['out', 'in'] as const).map((k) => (
              <button key={k} role="tab" aria-selected={side === k} onClick={() => setSide(k)} className="t-label h-9 w-[60px] rounded-full font-semibold transition" style={{ background: side === k ? C.line : 'transparent' }}>
                {k === 'out' ? '겉면' : '내부'}
              </button>
            ))}
          </div>
        </div>
        {side === 'out' ? <Outside tripId={t.id} /> : <Inside tripId={t.id} />}
      </div>
    </motion.div>
  )
}

function Outside({ tripId }: { tripId: string }) {
  const { trips, updateTrip } = useApp()
  const t = trips.find((x) => x.id === tripId)!
  const box = useRef<HTMLDivElement>(null)
  const [up, setUp] = useState(false)
  const drag = useDragControls()
  const add = (kind: StickerKind) => {
    updateTrip(t.id, { stickers: [...t.stickers, { id: uid(), kind, x: 30 + Math.random() * 40, y: 30 + Math.random() * 40, rot: Math.round(Math.random() * 24 - 12) }] })
    setUp(false)
  }
  const move = (id: string, dx: number, dy: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    updateTrip(t.id, {
      stickers: t.stickers.map((s) => (s.id === id ? { ...s, x: Math.min(96, Math.max(4, s.x + (dx / r.width) * 100)), y: Math.min(96, Math.max(4, s.y + (dy / r.height) * 100)) } : s)),
    })
  }
  return (
    <>
      <div className="flex flex-1 items-start justify-center pt-14">
        <div ref={box} className="relative h-[452px] w-[308px]">
          <TintedCarrier tint={tintOf(t.suitcase.color)} />
          {t.stickers.map((s) => (
            <motion.div
              key={s.id + s.x + s.y}
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => move(s.id, info.offset.x, info.offset.y)}
              onDoubleClick={() => updateTrip(t.id, { stickers: t.stickers.filter((x) => x.id !== s.id) })}
              className="absolute w-[76px] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
              style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: s.rot }}
              title="끌어서 옮기고, 두 번 눌러 떼요"
            >
              <Sticker kind={s.kind} color className="w-full" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 스티커 시트: 위로 끌어올리면 전부 보여요 */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 rounded-t-[32px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        animate={{ y: up ? 0 : 334 }}
        initial={false}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, i) => setUp(i.offset.y < -30 ? true : i.offset.y > 30 ? false : up)}
        style={{ height: 440 }}
      >
        <button onPointerDown={(e) => drag.start(e)} onClick={() => setUp((v) => !v)} aria-label={up ? '스티커 접기' : '스티커 펼치기'} className="flex h-8 w-full touch-none items-center justify-center">
          <span className="h-1 w-10 rounded-full bg-[#D9D9DC]" />
        </button>
        <ul className="grid grid-cols-3 gap-y-6 px-6 pt-4">
          {SHEET_STICKERS.map((k) => (
            <li key={k} className="grid place-items-center">
              <button onClick={() => add(k)} aria-label={`${k} 스티커 붙이기`} className="w-[84px] transition active:scale-95">
                <Sticker kind={k} color className="w-full" />
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </>
  )
}

/* 내부: 산 물건이 흩어져 담겨 있어요 */
const SPOTS = [
  { x: 30, y: 14, r: 0 },
  { x: 70, y: 32, r: 14 },
  { x: 28, y: 52, r: -16 },
  { x: 70, y: 78, r: 12 },
  { x: 50, y: 30, r: -8 },
  { x: 48, y: 66, r: 6 },
]
const OUTLINE: Record<Review['mood'], string> = { good: '#3FCB5A', soso: C.good, bad: C.bad }

function Inside({ tripId }: { tripId: string }) {
  const { products, rate } = useApp()
  const bought = products.filter((p) => p.tripId === tripId && p.purchased)
  const [list, setList] = useState(false)
  const [ask, setAsk] = useState<Product | null>(null)
  const sum = bought.reduce((s, p) => s + p.price, 0)
  return (
    <>
      <div className="relative flex-1">
        {!list ? (
          bought.slice(0, SPOTS.length).map((p, i) => {
            const sp = SPOTS[i]
            const o = p.myMood ? OUTLINE[p.myMood] : null
            return (
              <motion.button
                key={p.id}
                onClick={() => setAsk(p)}
                aria-label={`${p.name} 후기 남기기`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${sp.x}%`, top: `${sp.y}%`, rotate: sp.r }}
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', damping: 14 }}
              >
                <span className="block" style={o ? { filter: `drop-shadow(2px 0 0 ${o}) drop-shadow(-2px 0 0 ${o}) drop-shadow(0 2px 0 ${o}) drop-shadow(0 -2px 0 ${o})` } : undefined}>
                  <ProductImg p={p} className="max-h-[80px] max-w-[64px]" />
                </span>
              </motion.button>
            )
          })
        ) : (
          <ul className="mt-6 flex flex-col gap-2 px-5">
            {bought.map((p) => (
              <li key={p.id}>
                <button onClick={() => setAsk(p)} className="flex h-[96px] w-full items-center gap-6 rounded-2xl bg-white pr-5 pl-4 text-left">
                  <span className="grid size-[72px] shrink-0 place-items-center">
                    <ProductImg p={p} className="max-h-[72px] max-w-[72px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="t-label line-clamp-2">{p.name}</span>
                    <Price yen={p.price} size="s" className="mt-1" />
                  </span>
                  {p.myMood && <MoodIcon mood={p.myMood} className="size-6" />}
                </button>
              </li>
            ))}
          </ul>
        )}
        {!bought.length && (
          <p className="t-label absolute inset-x-0 top-1/3 text-center" style={{ color: C.ter }}>
            상품 상세에서 ‘샀어요’를 누르면
            <br />
            캐리어 안에 담겨요
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-end justify-between px-6 pb-[max(34px,env(safe-area-inset-bottom))]">
        <div>
          <p className="t-cap2">구매 {bought.length}개</p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="t-body-l tabular">{yenStr(sum)}</span>
            <span className="t-cap" style={{ color: C.ter }}>
              {wonStr(sum, rate)}
            </span>
          </p>
        </div>
        <IconBtn label={list ? '캐리어로 보기' : '구매 리스트'} onClick={() => setList((v) => !v)} className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <List className="size-6" strokeWidth={1.6} />
        </IconBtn>
      </div>
      <AnimatePresence>{ask && <ReviewPop p={ask} onClose={() => setAsk(null)} />}</AnimatePresence>
    </>
  )
}

function ReviewPop({ p, onClose }: { p: Product; onClose: () => void }) {
  const { update, notify } = useApp()
  return (
    <motion.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button aria-label="닫기" className="absolute inset-0 bg-black/15" onClick={onClose} />
      <motion.div role="dialog" aria-label="이 상품은 어땠나요?" initial={{ y: 12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="absolute top-[224px] left-1/2 w-[300px] -translate-x-1/2 rounded-2xl px-8 pt-5 pb-5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]" style={{ background: C.bg }}>
        <div className="flex items-center justify-between">
          <p className="t-label font-semibold">이 상품은 어땠나요?</p>
          <IconBtn label="닫기" onClick={onClose} className="-mr-3">
            <X className="size-6" strokeWidth={1.6} />
          </IconBtn>
        </div>
        <div className="mt-2 flex items-center gap-6">
          <span className="grid size-[72px] shrink-0 place-items-center">
            <ProductImg p={p} className="max-h-[68px] max-w-[48px]" />
          </span>
          <span className="min-w-0">
            <span className="t-label line-clamp-2">{p.name}</span>
            <Price yen={p.price} size="s" className="mt-1" />
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {(['good', 'soso', 'bad'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                update(p.id, { myMood: m })
                notify(`'${MOOD[m].label}'로 남겼어요`)
                onClose()
              }}
              aria-pressed={p.myMood === m}
              className={cn('flex h-[60px] flex-col items-center justify-center gap-1 rounded-lg bg-white transition', p.myMood === m && 'ring-2 ring-[#24222D]')}
            >
              <MoodIcon mood={m} className="size-6" />
              <span className="t-label font-semibold">{MOOD[m].label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
