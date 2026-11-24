import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bookmark, BookmarkCheck, Camera, Check, ChevronRight, Flag, Heart, ImagePlus, LocateFixed, MapPin, Sparkles, Trophy, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { tiltOf } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Chip, IconBtn, Panel } from '@/components/ui/primitives'
import { CATEGORIES, POINT_RULES, REWARDS } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Art, Category, Find } from '@/lib/types'
import { cn, yen } from '@/lib/utils'
import { ME, ShibuyaMap } from './MapScreen'

const when = (d: number) => (d === 0 ? '방금' : d === 1 ? '어제' : d < 7 ? `${d}일 전` : `${Math.round(d / 7)}주 전`)

/* ---------- shared bits ---------- */

/** User photo, or a soft "snapshot" placeholder built from the item art */
export function FindPhoto({ f, className }: { f: Find; className?: string }) {
  if (f.photo) return <img src={f.photo} alt={f.title} className={cn('object-cover grayscale', className)} />
  return <ProductArt art={f.art} tone="neutral" tilt={tiltOf(f.id)} className={className} />
}

export function FlagMark({ className, active, light }: { className?: string; active?: boolean; light?: boolean }) {
  const ink = light ? '#ffffff' : '#111111'
  return (
    <svg viewBox="0 0 32 42" className={className} aria-hidden>
      <ellipse cx="5" cy="39.5" rx="5" ry="2" fill="#000" opacity={light ? 0 : 0.18} />
      <rect x="3.5" y="2" width="3" height="37" rx="1.5" fill={ink} />
      <path d="M6.5 3 H29 L23.5 10.5 L29 18 H6.5 Z" fill={ink} stroke={light ? 'none' : '#fff'} strokeWidth={active ? 2 : 0} />
      {!light && <path d="M9 7 H22" stroke="#fff" strokeWidth="1.5" opacity="0.5" />}
    </svg>
  )
}

/* ---------- home strip ---------- */

export function FindsStrip() {
  const { finds, trip, open, setTab } = useApp()
  const list = finds.filter((f) => f.city === trip.city && !f.mine)
  if (!list.length) return null
  return (
    <section className="mt-7">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 text-[17px] font-semibold tracking-tight">
            <FlagMark className="h-[18px] w-[14px]" /> 여기서만 살 수 있어요
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{trip.city}에 다녀온 여행자들이 찾은 물건</p>
        </div>
        <button onClick={() => setTab('magazine')} className="flex h-9 items-center gap-0.5 rounded-full px-2 text-[13px] font-medium text-ink-2 hover:bg-accent">
          매거진 <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="no-scrollbar -mx-5 mt-3 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
        {list.map((f) => (
          <button key={f.id} onClick={() => open({ type: 'find', id: f.id })} className="w-[164px] shrink-0 snap-start rounded-xl border bg-card shadow-xs p-2.5 text-left transition hover:-translate-y-0.5">
            <FindPhoto f={f} className="aspect-square w-full rounded-xl" />
            <p className="mt-2.5 line-clamp-2 min-h-[2.6em] px-1 text-[14px] leading-[1.3] font-semibold">{f.title}</p>
            <p className="mt-1 flex items-center gap-1 px-1 text-[12px] text-muted-foreground">
              <MapPin className="size-3" /> <span className="truncate">{f.area}</span>
            </p>
            <p className="mt-0.5 px-1 pb-1 text-[12px] text-faint">{f.saves}명이 저장했어요</p>
          </button>
        ))}
      </div>
    </section>
  )
}

/* ---------- find detail ---------- */

export function FindDetail({ id, z }: { id: string; z: number }) {
  const { finds, close, closeAll, savedFind, toggleSaveFind, thanked, toggleThank, notify, setMapFocus, setTab, trip } = useApp()
  const f = finds.find((x) => x.id === id)
  if (!f) return null
  const saved = savedFind(f.id)
  const isThanked = thanked.has(f.id)
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <IconBtn label="뒤로" onClick={close} className="shadow-none">
            <ArrowLeft className="size-5" />
          </IconBtn>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12.5px] font-semibold">
            <FlagMark className="h-[15px] w-[12px]" /> 현지 발견
          </span>
          <span className="size-10" />
        </div>
        <div className="px-5 pt-4">
          <motion.div initial={{ rotate: -2, y: 12, opacity: 0 }} animate={{ rotate: -1.5, y: 0, opacity: 1 }} className="rounded-xl border bg-card shadow-xs p-3 pb-4 shadow-[0_16px_40px_-24px_rgba(20,20,19,0.35)]">
            <FindPhoto f={f} className="aspect-[4/3] w-full rounded-[14px]" />
            <p className="mt-3 px-1 text-[12px] text-muted-foreground">
              {f.author}님 · {f.authorTrip} · {when(f.daysAgo)} 발견
            </p>
          </motion.div>
          <h1 className="mt-6 text-[25px] leading-tight font-semibold tracking-tight">{f.title}</h1>
          <p className="mt-3 text-[15.5px] leading-[1.7] text-ink-2">{f.story}</p>

          <ul className="mt-6 divide-y divide-line rounded-xl border bg-card shadow-xs px-4 text-[14px]">
            <li className="flex items-center gap-3 py-3.5">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="flex-1">
                <b className="block font-semibold">{f.place}</b>
                <span className="text-[12.5px] text-muted-foreground">{f.area}</span>
              </span>
            </li>
            {f.price != null && (
              <li className="flex items-center gap-3 py-3.5">
                <span className="w-4 text-center text-[13px] font-semibold text-muted-foreground">¥</span>
                <span className="flex-1">발견 당시 {yen(f.price)}</span>
              </li>
            )}
            <li className="flex items-center gap-3 py-3.5">
              <Bookmark className="size-4 text-muted-foreground" />
              <span className="flex-1">
                {f.saves}명이 저장 · 고마워요 {f.thanks}
              </span>
            </li>
          </ul>
          <p className="mt-2 px-1 text-[11.5px] text-faint">여행자가 직접 올린 정보예요. 재고와 가격은 현장에서 달라질 수 있어요.{f.sample ? ' (예시 데이터)' : ''}</p>

          <button
            onClick={() => {
              setMapFocus(`f:${f.id}`)
              closeAll()
              setTab('map')
            }}
            className="mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border bg-background text-[14px] font-medium shadow-xs hover:bg-accent"
          >
            <MapPin className="size-4" /> 지도에서 위치 보기
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-ground from-60% to-transparent px-5 pt-6 pb-[max(16px,env(safe-area-inset-bottom))]">
        {!f.mine && (
          <button
            onClick={() => toggleThank(f.id)}
            aria-pressed={isThanked}
            className={cn('flex h-14 shrink-0 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold transition', isThanked ? 'bg-brand-soft text-brand' : 'bg-surface text-ink')}
          >
            <Heart className={cn('size-5', isThanked && 'fill-brand')} /> {f.thanks}
          </button>
        )}
        <Button
          size="lg"
          variant={saved ? 'outline' : 'default'}
          className="flex-1"
          onClick={() => {
            const on = toggleSaveFind(f)
            notify(on ? `${trip.name}에 저장했어요` : '저장을 취소했어요')
          }}
        >
          {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
          {saved ? '내 여행에 저장됨' : '내 여행에 저장하기'}
        </Button>
      </div>
    </Panel>
  )
}

/* ---------- post a find ---------- */

const SAMPLE_ART: Art = { shape: 'jar', color: '#E8A0B4', accent: '#2F5DA8', bg: '#FBE6EC' }

export function PostFind() {
  const { close, closeAll, addFind, setMapFocus, setTab, trip } = useApp()
  const file = useRef<HTMLInputElement>(null)
  const map = useRef<HTMLDivElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [useSample, setUseSample] = useState(false)
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [place, setPlace] = useState('')
  const [price, setPrice] = useState('')
  const [cat, setCat] = useState<Category>('잡화')
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null)
  const [done, setDone] = useState<Find | null>(null)
  const [tried, setTried] = useState(false)

  const hasPhoto = !!photo || useSample
  const valid = hasPhoto && title.trim() && story.trim() && place.trim() && pin
  const submit = () => {
    setTried(true)
    if (!valid || !pin) return
    const f = addFind({ title: title.trim(), story: story.trim(), place: place.trim(), area: '시부야 근처', x: pin.x, y: pin.y, price: price ? Number(price) : undefined, category: cat, art: SAMPLE_ART, photo: photo ?? undefined })
    setDone(f)
  }

  return (
    <motion.div className="fixed inset-0 z-[58] overflow-y-auto bg-ground" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
      <div className="mx-auto flex min-h-dvh max-w-[560px] flex-col px-5 pt-[max(12px,env(safe-area-inset-top))] pb-6">
        <header className="flex h-12 items-center justify-between">
          <button aria-label="닫기" onClick={close} className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-accent">
            <X className="size-6" />
          </button>
          <span className="text-[13px] font-medium text-muted-foreground">올리면 +50P</span>
        </header>
        <h1 className="mt-2 text-[26px] leading-[1.2] font-semibold tracking-tight">
          지도에 없는 물건을
          <br />
          알려 주세요
        </h1>
        <p className="mt-2 text-[14.5px] text-muted-foreground">{trip.city}에서 발견한, 여기서만 살 수 있는 물건이면 좋아요</p>

        <input
          ref={file}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            const r = new FileReader()
            r.onload = () => setPhoto(String(r.result))
            r.readAsDataURL(f)
          }}
        />
        <div className="mt-6">
          {hasPhoto ? (
            <div className="relative overflow-hidden rounded-xl border bg-card shadow-xs p-2.5">
              {photo ? <img src={photo} alt="올린 사진" className="aspect-[4/3] w-full rounded-xl object-cover grayscale" /> : <ProductArt art={SAMPLE_ART} tone="neutral" className="aspect-[4/3] w-full rounded-xl" />}
              <button
                onClick={() => {
                  setPhoto(null)
                  setUseSample(false)
                }}
                aria-label="사진 지우기"
                className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/90"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className={cn('flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-surface', tried ? 'border-brand/60' : 'border-line')}>
              <span className="grid size-14 place-items-center rounded-full bg-sunken">
                <ImagePlus className="size-6 text-ink-2" />
              </span>
              <p className="text-[14px] font-semibold">물건 사진을 올려 주세요</p>
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={() => file.current?.click()}>
                  <Camera className="size-4" /> 사진 선택
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setUseSample(true)}>
                  예시 사진 쓰기
                </Button>
              </div>
            </div>
          )}
        </div>

        <Field label="물건 이름" error={tried && !title.trim()}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 골목 공방의 유리 풍경" className="h-11 bg-background text-[15px]" />
        </Field>
        <Field label="어떤 물건인가요?" hint="어디서, 어떻게 발견했는지" error={tried && !story.trim()}>
          <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={4} placeholder="간판이 작아서 지나치기 쉬워요. 2층으로 올라가면…" className="resize-none bg-background p-3.5 text-[15px] leading-relaxed" />
        </Field>
        <Field label="위치" hint="지도를 눌러 깃발을 꽂아 주세요" error={tried && (!pin || !place.trim())}>
          <div ref={map} className="relative overflow-hidden rounded-xl bg-[#EDEDED]">
            <div
              className="relative aspect-[1200/1000] w-full cursor-crosshair"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                setPin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
              }}
            >
              <ShibuyaMap />
              <span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-[3px] ring-white" style={{ left: `${ME.x}%`, top: `${ME.y}%` }} />
              <AnimatePresence>
                {pin && (
                  <motion.span key={`${pin.x}${pin.y}`} initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="absolute" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                    <FlagMark className="absolute bottom-0 left-[-5px] h-[34px] w-[26px]" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setPin({ ...ME })} className="absolute right-3 bottom-3 flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[12.5px] font-semibold shadow">
              <LocateFixed className="size-4" /> 지금 위치
            </button>
          </div>
          <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="가게나 장소 이름 (예: 이름 없는 유리 공방 2층)" className="mt-2 h-11 bg-background text-[15px]" />
        </Field>
        <Field label="가격" hint="선택">
          <label className="flex h-11 items-center rounded-md border border-input bg-background px-3 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <span className="mr-1 font-semibold text-muted-foreground">¥</span>
            <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} placeholder="발견 당시 가격" className="flex-1 bg-transparent tabular outline-none placeholder:text-faint" />
          </label>
        </Field>
        <Field label="종류">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="sticky bottom-0 mt-8 bg-gradient-to-t from-ground from-70% to-transparent pt-4 pb-[env(safe-area-inset-bottom)]">
          {tried && !valid && <p className="mb-2 text-center text-[13px] text-brand">사진, 이름, 이야기, 위치를 채워 주세요</p>}
          <Button size="lg" className="w-full" onClick={submit}>
            <Flag className="size-5" /> 지도에 깃발 꽂기
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-ground px-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div initial={{ y: -120, rotate: -20 }} animate={{ y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
              <FlagMark className="h-[96px] w-[74px]" />
            </motion.div>
            <h2 className="mt-6 text-[26px] font-semibold tracking-tight">깃발을 꽂았어요!</h2>
            <p className="mt-2 text-[15px] text-muted-foreground">다음 여행자가 지도에서 이 물건을 볼 수 있어요</p>
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: 'spring' }} className="mt-8 w-full max-w-[340px] rounded-xl bg-ink p-5 text-left text-white">
              <p className="flex items-center gap-1.5 text-[13px] text-white/60">
                <Sparkles className="size-4" /> 발견 포인트
              </p>
              <p className="mt-1 text-[32px] font-semibold tracking-tight">+50P</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">다른 여행자가 저장할 때마다 +10P, 고마워요를 받을 때 +5P가 더 쌓여요</p>
            </motion.div>
            <div className="mt-8 flex w-full max-w-[340px] gap-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={close}>
                확인
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  setMapFocus(`f:${done.id}`)
                  closeAll()
                  setTab('map')
                }}
              >
                지도에서 보기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-baseline justify-between">
        <span className={cn('text-[14px] font-semibold', error && 'text-brand')}>{label}</span>
        {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

/* ---------- benefits ---------- */

const LEVELS = [
  { name: '여행 새내기', min: 0 },
  { name: '골목 탐험가', min: 1000 },
  { name: '현지 큐레이터', min: 2000 },
  { name: '숨은 가게 장인', min: 5000 },
]

export function Benefits({ z }: { z: number }) {
  const { close, finds, points, redeem, redeemed, open, notify } = useApp()
  const mine = finds.filter((f) => f.mine)
  const saves = mine.reduce((s, f) => s + f.saves, 0)
  const thanks = mine.reduce((s, f) => s + f.thanks, 0)
  const lvIdx = LEVELS.reduce((a, l, i) => (points >= l.min ? i : a), 0)
  const lv = LEVELS[lvIdx]
  const next = LEVELS[lvIdx + 1]
  const ratio = next ? (points - lv.min) / (next.min - lv.min) : 1
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto px-5 pb-12">
        <div className="-mx-1 flex items-center pt-[max(12px,env(safe-area-inset-top))]">
          <IconBtn label="뒤로" onClick={close} className="shadow-none">
            <ArrowLeft className="size-5" />
          </IconBtn>
        </div>
        <h1 className="mt-3 text-[28px] leading-[1.15] tracking-tight">
          <span className="font-normal text-ink-2">내 발견과</span>
          <br />
          <b className="font-semibold">혜택</b>
        </h1>

        <section className="mt-6 rounded-xl bg-ink p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-white/60">보유 포인트</p>
              <p className="mt-1 text-[34px] leading-none font-semibold tracking-tight tabular">{points.toLocaleString('ko-KR')}P</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold">
              <Trophy className="size-3.5" /> {lv.name}
            </span>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
            <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} transition={{ duration: 0.6 }} />
          </div>
          <p className="mt-2 text-[12.5px] text-white/60 tabular">{next ? `${next.name}까지 ${(next.min - points).toLocaleString('ko-KR')}P` : '최고 등급이에요'}</p>
        </section>

        <section className="mt-2.5 grid grid-cols-3 gap-2.5">
          {[
            ['내 발견', mine.length],
            ['저장된 횟수', saves],
            ['고마워요', thanks],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border bg-card shadow-xs p-4">
              <p className="text-[12px] text-muted-foreground">{l}</p>
              <p className="mt-1 text-[22px] font-semibold tabular">{v}</p>
            </div>
          ))}
        </section>

        <h2 className="mt-8 text-[17px] font-semibold">포인트 받는 법</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl border bg-card shadow-xs px-4">
          {POINT_RULES.map((r) => (
            <li key={r.label} className="flex items-center justify-between py-3.5 text-[14.5px]">
              {r.label}
              <b className="font-semibold tabular">+{r.pt}P</b>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-end justify-between">
          <h2 className="text-[17px] font-semibold">내가 올린 발견 {mine.length}</h2>
          <button onClick={() => open({ type: 'post' })} className="flex h-9 items-center gap-1 rounded-full px-2 text-[13px] font-semibold text-ink-2 hover:bg-accent">
            <Flag className="size-4" /> 새로 올리기
          </button>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {mine.map((f) => (
            <li key={f.id}>
              <button onClick={() => open({ type: 'find', id: f.id })} className="flex w-full items-center gap-3 rounded-xl border bg-card shadow-xs p-2.5 pr-4 text-left">
                <FindPhoto f={f} className="size-16 shrink-0 rounded-2xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold">{f.title}</span>
                  <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                    저장 {f.saves} · 고마워요 {f.thanks}
                  </span>
                </span>
                <span className="text-[13px] font-semibold tabular">+{50 + f.saves * 10 + f.thanks * 5}P</span>
              </button>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-[17px] font-semibold">포인트로 받는 혜택</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {REWARDS.map((r) => {
            const got = redeemed.includes(r.id)
            const can = points >= r.cost
            return (
              <li key={r.id} className="flex items-center gap-3 rounded-xl border bg-card shadow-xs p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold">{r.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {r.sub} · <b className="font-semibold text-ink-2 tabular">{r.cost.toLocaleString('ko-KR')}P</b>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={got ? 'secondary' : 'default'}
                  disabled={got || !can}
                  onClick={() => {
                    redeem(r.id, r.cost)
                    notify(`${r.title}을(를) 받았어요`)
                  }}
                >
                  {got ? (
                    <>
                      <Check className="size-4" /> 받음
                    </>
                  ) : can ? (
                    '교환'
                  ) : (
                    '포인트 부족'
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[11.5px] text-faint">혜택과 제휴처는 예시예요. 실제 운영 시 지급 기준과 제휴처를 확정해요.</p>
      </div>
    </Panel>
  )
}
