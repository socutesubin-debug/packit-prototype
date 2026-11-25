import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Compass, Flag, Heart, ImagePlus, Lightbulb, LocateFixed, MapPin, MessageCircle, MessageCircleQuestion, Route, Search, ShoppingBag, Sparkles, Tag, Trophy, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { tiltOf } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Chip, IconBtn, Panel, Sheet } from '@/components/ui/primitives'
import { CATEGORIES, NEARBY_PLACES, POINT_RULES, POST_KINDS, REWARDS } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Art, Category, Find, PhotoPin, PostKind, Product } from '@/lib/types'
import { cn, uid, yen } from '@/lib/utils'
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
          발견 <ChevronRight className="size-4" />
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

/** discovered date as MM.DD, counted back from the prototype's "today" (11.26) */
export const dateOf = (f: Find) => {
  if (f.date) return f.date
  const d = new Date(2026, 10, 26 - f.daysAgo)
  return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`
}

/** photo with numbered pins (오늘의집 style) */
export function PinnedPhoto({ f, className }: { f: Find; className?: string }) {
  const [on, setOn] = useState<number | null>(null)
  const pins = f.pins ?? []
  return (
    <div className={cn('relative overflow-hidden', className)} onClick={() => setOn(null)}>
      <FindPhoto f={f} className="size-full" />
      {pins.map((p, i) => (
        <div key={i} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOn(on === i ? null : i)
            }}
            aria-label={p.label}
            className="grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white ring-[3px] ring-white/90 shadow tabular"
          >
            {i + 1}
          </button>
          <AnimatePresence>
            {on === i && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-white px-2.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap shadow-lg"
              >
                {p.label}
                {p.price != null && <span className="ml-1.5 font-normal text-muted-foreground tabular">{yen(p.price)}</span>}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

export function FindDetail({ id, z }: { id: string; z: number }) {
  const { finds, close, closeAll, savedFind, toggleSaveFind, thanked, toggleThank, notify, setMapFocus, setTab, trip, following, toggleFollow, comments, addComment } = useApp()
  const [text, setText] = useState('')
  const cref = useRef<HTMLDivElement>(null)
  const f = finds.find((x) => x.id === id)
  if (!f) return null
  const k = f.kind ?? 'find'
  const saved = savedFind(f.id)
  const liked = thanked.has(f.id)
  const list = comments[f.id] ?? []
  const toMap = () => {
    setMapFocus(`f:${f.id}`)
    closeAll()
    setTab('map')
  }
  const send = () => {
    if (!text.trim()) return
    addComment(f.id, text.trim())
    setText('')
  }
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 pt-[max(8px,env(safe-area-inset-top))] pb-2 backdrop-blur">
          <IconBtn label="뒤로" onClick={close} className="shadow-none">
            <ArrowLeft className="size-5" />
          </IconBtn>
          <span className="text-[14px] font-semibold">{POST_KINDS.find((x) => x.kind === k)?.label}</span>
          <span className="size-9" />
        </div>

        <div className="flex items-center gap-2.5 px-5 pt-2 pb-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-[14px] font-semibold">{f.author.slice(0, 1)}</span>
          <span className="min-w-0 flex-1">
            <b className="block text-[14.5px] font-semibold">{f.author}</b>
            <span className="text-[12.5px] text-muted-foreground">{f.authorTrip} · {when(f.daysAgo)}</span>
          </span>
          {!f.mine && (
            <Button size="sm" variant={following.has(f.author) ? 'outline' : 'default'} className="rounded-full" onClick={() => toggleFollow(f.author)}>
              {following.has(f.author) ? '팔로잉' : '팔로우'}
            </Button>
          )}
        </div>

        {k !== 'tip' && <PinnedPhoto f={f} className="aspect-square w-full bg-sunken lg:aspect-[4/3]" />}
        {!!f.pins?.length && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pt-3">
            {f.pins.map((p, i) => (
              <span key={i} className="flex shrink-0 items-center gap-2 rounded-lg border bg-card py-1.5 pr-3 pl-1.5 text-[12.5px] shadow-xs">
                <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white tabular">{i + 1}</span>
                <span className="font-medium">{p.label}</span>
                {p.price != null && <span className="text-muted-foreground tabular">{yen(p.price)}</span>}
              </span>
            ))}
          </div>
        )}

        <div className="px-5 pt-5">
          <h1 className="text-[23px] leading-tight font-semibold tracking-tight">{f.title}</h1>
          <p className="mt-3 text-[15.5px] leading-[1.75] text-ink-2">{f.story}</p>

          <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-xs">
            <p className="border-b bg-sunken/50 px-4 py-2.5 text-[12.5px] font-semibold text-muted-foreground">발견 정보</p>
            <button onClick={toMap} className="flex w-full items-center gap-3 border-b px-4 py-3 text-left hover:bg-accent">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[14px] font-semibold">{f.place}</b>
                <span className="text-[12.5px] text-muted-foreground">{f.area}</span>
              </span>
              <span className="flex items-center text-[12.5px] font-medium">지도 <ChevronRight className="size-4" /></span>
            </button>
            {f.price != null && (
              <div className="flex items-center gap-3 border-b px-4 py-3 text-[14px]">
                <span className="w-4 text-center text-[13px] font-semibold text-muted-foreground">¥</span>
                <span className="flex-1">
                  {k === 'ask' ? '본 가격' : '발견 당시'} <b className="font-semibold tabular">{yen(f.price)}</b>
                </span>
                <span className="text-[12.5px] text-muted-foreground tabular">{dateOf(f)} 기준</span>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3 text-[14px]">
              <Tag className="size-4 text-muted-foreground" />
              <span className="flex-1">{f.category}</span>
              <span className="text-[12.5px] text-muted-foreground">{f.saves}명 저장</span>
            </div>
          </div>
          <p className="mt-2 px-1 text-[11.5px] text-faint">여행자가 직접 올린 정보예요. 재고와 가격은 현장에서 달라질 수 있어요.{f.sample ? ' (예시 데이터)' : ''}</p>

          <div ref={cref} className="mt-9">
            <h2 className="text-[16px] font-semibold">
              {k === 'ask' ? '답변' : '댓글'} <span className="text-muted-foreground tabular">{list.length}</span>
            </h2>
            <ul className="mt-2 divide-y">
              {list.map((c) => (
                <li key={c.id} className="flex gap-2.5 py-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-[11px] font-semibold">{c.user.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[13px]">
                      <b className="font-semibold">{c.user}</b>
                      {c.user === f.author && <span className="ml-1 rounded bg-sunken px-1 text-[10.5px] font-semibold">작성자</span>}
                      <span className="ml-1.5 text-muted-foreground">{c.ago}</span>
                    </span>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-2">{c.text}</span>
                  </span>
                </li>
              ))}
              {!list.length && <li className="py-6 text-center text-[13.5px] text-muted-foreground">{k === 'ask' ? '첫 답변을 남겨 주세요' : '첫 댓글을 남겨 주세요'}</li>}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="mt-2 flex gap-2"
            >
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={k === 'ask' ? '알고 있는 걸 알려 주세요' : '댓글을 남겨 주세요'} className="h-11 rounded-full bg-background px-4 text-[14.5px]" />
              <Button type="submit" size="lg" variant="secondary" className="rounded-full" disabled={!text.trim()}>
                등록
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 border-t bg-background px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
        {!f.mine && (
          <button onClick={() => toggleThank(f.id)} aria-pressed={liked} className={cn('flex h-12 items-center gap-1.5 px-3 text-[14px] font-medium', liked ? 'text-ink' : 'text-muted-foreground')}>
            <Heart className={cn('size-5', liked && 'fill-ink')} /> <span className="tabular">{f.thanks}</span>
          </button>
        )}
        <button onClick={() => cref.current?.scrollIntoView({ behavior: 'smooth' })} className="flex h-12 items-center gap-1.5 px-3 text-[14px] font-medium text-muted-foreground">
          <MessageCircle className="size-5" /> <span className="tabular">{list.length}</span>
        </button>
        <Button
          size="lg"
          variant={saved ? 'outline' : 'default'}
          className="ml-auto min-w-[180px]"
          onClick={() => notify(toggleSaveFind(f) ? `${trip.name}에 저장했어요` : '저장을 취소했어요')}
        >
          {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
          {saved ? '내 여행에 저장됨' : '내 여행에 저장'}
        </Button>
      </div>
    </Panel>
  )
}

/* ---------- write a post (밀리 editor × 오늘의집 게시판/툴바) ---------- */

const SAMPLE_ART: Art = { shape: 'bottle', color: '#F4F4F4', accent: '#3E6FD8', bg: '#EEF2F7' }
const KIND_ICONS: Record<PostKind, typeof Compass> = { find: Compass, tip: Lightbulb, course: Route, ask: MessageCircleQuestion }
const TODAY = '11.26'

interface Photo {
  id: string
  src?: string
  pins: PhotoPin[]
}
interface Draft {
  kind: PostKind | null
  title: string
  body: string
  photos: Photo[]
  place: { name: string; area: string; x: number; y: number; auto?: boolean } | null
  price: string
  cat: Category | null
  catAuto: boolean
  attached: string[]
}
const EMPTY: Draft = { kind: null, title: '', body: '', photos: [], place: null, price: '', cat: null, catAuto: false, attached: [] }
let SAVED_DRAFT: Draft | null = null

const guessCat = (t: string): Category | null => {
  if (/우유|과자|센베|빵|두부|차|커피|맥주|사탕|초콜릿|라멘/.test(t)) return '식품'
  if (/립|크림|마스크|화장|선크림|로션|팩|샴푸/.test(t)) return '뷰티'
  if (/스카프|양말|티셔츠|모자|옷|가방/.test(t)) return '옷'
  if (/면세/.test(t)) return '면세품'
  if (t.trim().length > 3) return '잡화'
  return null
}
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

export function PostFind() {
  const { close, addFind, setTab, trip, tripProducts, rate, notify, setJustPosted, tab } = useApp()
  const [d, setD] = useState<Draft>(() => SAVED_DRAFT ?? EMPTY)
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))
  const [sheet, setSheet] = useState<null | 'kind' | 'place' | 'price' | 'photo' | 'product'>(SAVED_DRAFT ? null : 'kind')
  const [notice, setNotice] = useState(true)
  const [tried, setTried] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  const kindMeta = POST_KINDS.find((k) => k.kind === d.kind)
  const attached = d.attached.map((id) => tripProducts.find((p) => p.id === id)).filter(Boolean) as Product[]
  const valid = !!d.kind && !!d.title.trim() && !!d.place
  const cat = d.cat ?? guessCat(d.title)
  const catAuto = !d.cat && !!cat

  const addPhoto = (src?: string) => {
    const ph: Photo = { id: uid(), src, pins: [] }
    setD((x) => {
      // 사진 위치로 가게를 먼저 채워 둬요 (prototype: nearest place to "my location")
      const near = [...NEARBY_PLACES].sort((a, b) => dist(a, ME) - dist(b, ME))[0]
      return { ...x, photos: [...x.photos, ph], place: x.place ?? { ...near, auto: true } }
    })
  }
  const attach = (p: Product) => {
    setD((x) => {
      const on = x.attached.includes(p.id)
      const next = on ? x.attached.filter((i) => i !== p.id) : [...x.attached, p.id]
      return { ...x, attached: next, price: !on && !x.price ? String(p.price) : x.price, cat: !on && !x.cat ? p.category : x.cat }
    })
  }
  const submit = () => {
    setTried(true)
    if (!valid || !d.place || !d.kind) return
    const first = d.photos[0]
    const f = addFind({
      kind: d.kind,
      title: d.title.trim(),
      story: d.body.trim() || d.title.trim(),
      place: d.place.name,
      area: d.place.area,
      x: d.place.x,
      y: d.place.y,
      price: d.price ? Number(d.price) : undefined,
      category: cat ?? '잡화',
      art: attached[0]?.art ?? SAMPLE_ART,
      photo: first?.src,
      pins: first?.pins.length ? first.pins : undefined,
      date: TODAY,
    })
    SAVED_DRAFT = null
    setJustPosted(f.id)
    close()
    if (tab !== 'magazine') setTab('magazine')
    window.setTimeout(() => notify('지도에 깃발을 꽂았어요 · +50P'), 250)
  }

  return (
    <motion.div className="fixed inset-0 z-[58] flex flex-col bg-background" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
      <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between px-3 pt-[env(safe-area-inset-top)]">
          <button aria-label="닫기" onClick={close} className="grid size-11 place-items-center rounded-full hover:bg-accent">
            <ChevronLeft className="size-6" />
          </button>
          <span className="text-[15.5px] font-semibold">발견 올리기</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                SAVED_DRAFT = d
                notify('임시저장했어요')
              }}
              className="h-9 px-2.5 text-[13.5px] font-medium text-muted-foreground hover:text-ink"
            >
              임시저장
            </button>
            <button
              onClick={submit}
              aria-disabled={!valid}
              className={cn('h-9 rounded-full px-4 text-[14px] font-semibold transition', valid ? 'bg-ink text-white' : 'bg-sunken text-faint')}
            >
              올리기
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <button onClick={() => setSheet('kind')} className={cn('flex h-14 w-full items-center justify-between border-y px-5 text-left', tried && !d.kind && 'bg-sunken')}>
            {kindMeta ? (
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                {(() => {
                  const I = KIND_ICONS[kindMeta.kind]
                  return <I className="size-4" />
                })()}
                {kindMeta.label}
              </span>
            ) : (
              <span className="text-[15px] font-medium">
                어떤 글인가요?<span className="ml-0.5 text-ink">*</span>
              </span>
            )}
            <ChevronDown className="size-5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {notice && (
              <motion.div exit={{ opacity: 0, height: 0 }} className="px-5 pt-3">
                <div className="flex items-start gap-2 rounded-lg bg-sunken px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
                  <span className="flex-1">직접 가 본 곳, 직접 산 물건만 올려 주세요. 가격은 발견한 날 기준으로 보여요.</span>
                  <button aria-label="안내 닫기" onClick={() => setNotice(false)} className="-mr-1 grid size-6 place-items-center">
                    <X className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-5 pt-6">
            <textarea
              value={d.title}
              onChange={(e) => set({ title: e.target.value.slice(0, 40).replace(/\n/g, '') })}
              rows={1}
              placeholder="제목을 입력하세요"
              aria-label="제목"
              className={cn('field-sizing-content w-full resize-none bg-transparent text-[24px] leading-snug font-semibold tracking-tight outline-none placeholder:text-faint', tried && !d.title.trim() && 'placeholder:text-ink-2')}
            />
            <div className="mt-3 h-px bg-ink/80" />

            {/* 발견 정보 카드 */}
            <div className="mt-5 overflow-hidden rounded-xl border">
              <InfoRow
                icon={<MapPin className="size-4" />}
                k="가게"
                req
                missing={tried && !d.place}
                onClick={() => setSheet('place')}
                value={d.place ? d.place.name : undefined}
                sub={d.place ? `${d.place.area} · ${d.place.auto ? '사진에서 찾음' : '지도에 핀 찍음'}` : '지도에 핀을 찍고 가게 이름을 적어요'}
              />
              <InfoRow
                icon={<span className="w-4 text-center text-[13px] font-semibold">¥</span>}
                k={d.kind === 'ask' ? '본 가격' : '가격'}
                onClick={() => setSheet('price')}
                value={d.price ? yen(Number(d.price)) : undefined}
                sub={d.price ? `${TODAY} 기준 · 약 ${Math.round((Number(d.price) * rate) / 100).toLocaleString()}원` : '발견 당시 가격 (선택)'}
              />
              <InfoRow icon={<Tag className="size-4" />} k="카테고리" onClick={() => setSheet('price')} value={cat ?? undefined} sub={cat ? (catAuto ? '제목으로 골라 뒀어요' : undefined) : '선택'} last />
            </div>

            {/* 본문: 사진 · 담은 상품 · 이야기 */}
            {d.photos.map((ph, pi) => (
              <PhotoBlock
                key={ph.id}
                photo={ph}
                labels={attached.map((p) => p.name)}
                onChange={(n) => set({ photos: d.photos.map((x) => (x.id === ph.id ? n : x)) })}
                onRemove={() => set({ photos: d.photos.filter((x) => x.id !== ph.id) })}
                cover={pi === 0}
              />
            ))}
            {attached.map((p) => (
              <div key={p.id} className="mt-3 flex items-center gap-3 rounded-xl border p-2">
                <ProductArt art={p.art} tone="neutral" className="size-12 shrink-0 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                  <span className="text-[12.5px] text-muted-foreground tabular">
                    {yen(p.price)} · 내 리스트에서 가져옴
                  </span>
                </span>
                <button aria-label="상품 빼기" onClick={() => attach(p)} className="grid size-8 place-items-center rounded-full hover:bg-accent">
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <textarea
              value={d.body}
              onChange={(e) => set({ body: e.target.value })}
              placeholder={kindMeta ? kindMeta.body : '종류를 먼저 골라 주세요'}
              aria-label="이야기"
              className="field-sizing-content mt-5 min-h-[140px] w-full resize-none bg-transparent text-[16px] leading-[1.75] outline-none placeholder:text-faint"
            />
          </div>
        </div>

        <div className="shrink-0 border-t bg-background pb-[env(safe-area-inset-bottom)]">
          {tried && !valid && <p className="px-5 pt-2.5 text-[12.5px] font-medium">종류 · 제목 · 가게 위치를 채워 주세요</p>}
          <div className="flex items-center gap-1 px-2 py-1.5">
            <ToolBtn onClick={() => setSheet('photo')} icon={<ImagePlus className="size-5" />} label={`사진${d.photos.length ? ` ${d.photos.length}` : ''}`} />
            <ToolBtn onClick={() => setSheet('product')} icon={<ShoppingBag className="size-5" />} label={`담은 상품${attached.length ? ` ${attached.length}` : ''}`} />
            <ToolBtn onClick={() => setSheet('place')} icon={<MapPin className="size-5" />} label="장소" />
            <span className="ml-auto pr-3 text-[12px] text-faint tabular">{d.title.length} / 40</span>
          </div>
        </div>
      </div>

      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((f) => {
            const r = new FileReader()
            r.onload = () => addPhoto(String(r.result))
            r.readAsDataURL(f)
          })
          e.target.value = ''
        }}
      />

      {/* 종류 선택 */}
      <Sheet open={sheet === 'kind'} onClose={() => setSheet(null)} title="어떤 글인가요?">
        <ul className="divide-y">
          {POST_KINDS.map((k) => {
            const I = KIND_ICONS[k.kind]
            return (
              <li key={k.kind}>
                <button
                  onClick={() => {
                    set({ kind: k.kind })
                    setSheet(null)
                  }}
                  className="flex w-full items-start gap-3 py-3.5 text-left"
                >
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-full border', d.kind === k.kind && 'border-ink bg-ink text-white')}>
                    <I className="size-[18px]" />
                  </span>
                  <span className="flex-1 pt-0.5">
                    <b className="block text-[15.5px] font-semibold">{k.label}</b>
                    <span className="mt-0.5 block text-[13px] text-muted-foreground">{k.desc}</span>
                  </span>
                  {d.kind === k.kind && <Check className="mt-2 size-5" />}
                </button>
              </li>
            )
          })}
        </ul>
      </Sheet>

      <PlaceSheet open={sheet === 'place'} onClose={() => setSheet(null)} value={d.place} onDone={(place) => set({ place })} />

      {/* 가격 · 카테고리 */}
      <Sheet open={sheet === 'price'} onClose={() => setSheet(null)} title={d.kind === 'ask' ? '본 가격 · 카테고리' : '발견 당시 가격 · 카테고리'}>
        <label className="flex h-14 items-center rounded-xl border px-4 focus-within:border-ink">
          <span className="mr-1.5 text-[18px] font-semibold">¥</span>
          <input
            inputMode="numeric"
            value={d.price}
            onChange={(e) => set({ price: e.target.value.replace(/\D/g, '').slice(0, 7) })}
            placeholder="0"
            className="min-w-0 flex-1 bg-transparent text-[20px] font-semibold tabular outline-none placeholder:text-faint"
          />
          {d.price && <span className="text-[13px] text-muted-foreground tabular">≈ {Math.round((Number(d.price) * rate) / 100).toLocaleString()}원</span>}
        </label>
        <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <CalendarDays className="size-3.5" /> {TODAY} · 사진 찍은 날 기준으로 기록돼요
        </p>
        <p className="mt-6 text-[14px] font-semibold">카테고리</p>
        {catAuto && <p className="mt-0.5 text-[12.5px] text-muted-foreground">제목을 보고 골라 뒀어요. 틀리면 바꿔 주세요</p>}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => set({ cat: c })} className="rounded-full">
              {c}
            </Chip>
          ))}
        </div>
        <Button size="lg" className="mt-6 w-full" onClick={() => setSheet(null)}>
          완료
        </Button>
      </Sheet>

      {/* 사진 추가 */}
      <Sheet open={sheet === 'photo'} onClose={() => setSheet(null)} title="사진 넣기">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setSheet(null)
              file.current?.click()
            }}
            className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border text-[14px] font-medium hover:bg-accent"
          >
            <Camera className="size-5" /> 앨범에서 고르기
          </button>
          <button
            onClick={() => {
              addPhoto()
              setSheet(null)
            }}
            className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border text-[14px] font-medium hover:bg-accent"
          >
            <ImagePlus className="size-5" /> 예시 사진 쓰기
          </button>
        </div>
        <p className="mt-3 text-[12.5px] text-muted-foreground">첫 사진이 표지가 돼요. 사진을 누르면 물건에 번호 핀을 달 수 있어요.</p>
      </Sheet>

      {/* 담은 상품 */}
      <Sheet open={sheet === 'product'} onClose={() => setSheet(null)} title={`${trip.name}에 담은 상품`}>
        <p className="-mt-1 mb-2 text-[12.5px] text-muted-foreground">넣으면 가격과 카테고리가 자동으로 채워져요</p>
        <ul className="divide-y">
          {tripProducts.slice(0, 12).map((p) => {
            const on = d.attached.includes(p.id)
            return (
              <li key={p.id}>
                <button onClick={() => attach(p)} className="flex w-full items-center gap-3 py-2.5 text-left">
                  <ProductArt art={p.art} tone="neutral" className="size-12 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-medium">{p.name}</span>
                    <span className="text-[12.5px] text-muted-foreground tabular">
                      {p.category} · {yen(p.price)}
                    </span>
                  </span>
                  <span className={cn('grid size-6 place-items-center rounded-full border', on && 'border-ink bg-ink text-white')}>{on && <Check className="size-4" />}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <Button size="lg" className="mt-4 w-full" onClick={() => setSheet(null)}>
          {d.attached.length ? `${d.attached.length}개 넣기` : '닫기'}
        </Button>
      </Sheet>
    </motion.div>
  )
}

function InfoRow({ icon, k, value, sub, onClick, req, missing, last }: { icon: React.ReactNode; k: string; value?: string; sub?: string; onClick: () => void; req?: boolean; missing?: boolean; last?: boolean }) {
  return (
    <button onClick={onClick} className={cn('flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-accent', !last && 'border-b', missing && 'bg-sunken')}>
      <span className="grid w-5 place-items-center text-muted-foreground">{icon}</span>
      <span className="w-14 shrink-0 text-[13px] text-muted-foreground">{k}</span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-[14.5px]', value ? 'font-semibold' : 'text-faint')}>{value ?? (req ? '필수' : '선택')}</span>
        {sub && <span className="block truncate text-[12px] text-muted-foreground">{sub}</span>}
      </span>
      {req && !value && <span className="rounded bg-ink px-1.5 py-0.5 text-[10.5px] font-semibold text-white">필수</span>}
      <ChevronRight className="size-4 text-faint" />
    </button>
  )
}

function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] font-medium hover:bg-accent">
      {icon}
      {label}
    </button>
  )
}

function PhotoBlock({ photo, labels, onChange, onRemove, cover }: { photo: Photo; labels: string[]; onChange: (p: Photo) => void; onRemove: () => void; cover?: boolean }) {
  return (
    <div className="mt-5">
      <div
        className="relative aspect-[4/3] cursor-crosshair overflow-hidden rounded-xl bg-sunken"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const n = photo.pins.length
          const pin: PhotoPin = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, label: labels[n] ?? `물건 ${n + 1}` }
          onChange({ ...photo, pins: [...photo.pins, pin] })
        }}
      >
        {photo.src ? <img src={photo.src} alt="" className="size-full object-cover grayscale" /> : <ProductArt art={SAMPLE_ART} tone="neutral" className="size-full" />}
        {photo.pins.map((p, i) => (
          <span key={i} className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white ring-[3px] ring-white shadow tabular" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            {i + 1}
          </span>
        ))}
        {cover && <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-0.5 text-[11.5px] font-semibold">표지</span>}
        {!photo.pins.length && <span className="absolute top-2.5 left-2.5 rounded-md bg-white/90 px-2 py-1 text-[11.5px] font-medium">물건을 누르면 핀이 생겨요 · 선택</span>}
        <button
          aria-label="사진 지우기"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/90"
        >
          <X className="size-4" />
        </button>
      </div>
      {photo.pins.map((p, i) => (
        <div key={i} className="mt-2 flex items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[11.5px] font-semibold text-white tabular">{i + 1}</span>
          <input
            value={p.label}
            onChange={(e) => onChange({ ...photo, pins: photo.pins.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
            className="h-9 min-w-0 flex-1 border-b bg-transparent text-[14px] outline-none focus:border-ink"
            aria-label={`핀 ${i + 1} 이름`}
          />
          <button aria-label="핀 지우기" onClick={() => onChange({ ...photo, pins: photo.pins.filter((_, j) => j !== i) })} className="grid size-8 place-items-center text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

type Place = NonNullable<Draft['place']>
function PlaceSheet({ open, onClose, value, onDone }: { open: boolean; onClose: () => void; value: Place | null; onDone: (p: Place) => void }) {
  const [pin, setPin] = useState<{ x: number; y: number }>(value ?? ME)
  const [name, setName] = useState(value?.name ?? '')
  const [area, setArea] = useState(value?.area ?? '시부야 근처')
  const [q, setQ] = useState('')
  const [synced, setSynced] = useState(open)
  if (open !== synced) {
    // reset local state whenever the sheet opens
    setSynced(open)
    if (open) {
      setPin(value ?? ME)
      setName(value?.name ?? '')
      setArea(value?.area ?? '시부야 근처')
      setQ('')
    }
  }
  const near = [...NEARBY_PLACES].filter((p) => !q || p.name.includes(q) || p.area.includes(q)).sort((a, b) => dist(a, pin) - dist(b, pin))
  return (
    <Sheet open={open} onClose={onClose} title="가게 위치">
      <label className="flex h-11 items-center gap-2 rounded-lg border px-3 focus-within:border-ink">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="가게 이름이나 동네로 찾기" className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-faint" />
      </label>
      <div className="relative mt-3 overflow-hidden rounded-xl bg-[#EDEDED]">
        <div
          className="relative aspect-[1200/1000] w-full cursor-crosshair"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setPin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
          }}
        >
          <ShibuyaMap />
          <span className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/40 ring-[3px] ring-white" style={{ left: `${ME.x}%`, top: `${ME.y}%` }} />
          <motion.span key={`${pin.x}${pin.y}`} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="absolute" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <FlagMark className="absolute bottom-0 left-[-5px] h-[34px] w-[26px]" />
          </motion.span>
        </div>
        <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-md bg-ink px-2 py-1 text-[11.5px] font-medium text-white">지도를 눌러 핀을 옮겨요</span>
        <button onClick={() => setPin({ ...ME })} className="absolute right-2.5 bottom-2.5 flex h-8 items-center gap-1 rounded-full bg-white px-2.5 text-[12px] font-semibold shadow">
          <LocateFixed className="size-3.5" /> 사진 위치
        </button>
      </div>
      <p className="mt-4 text-[12.5px] font-medium text-muted-foreground">핀 근처 가게</p>
      <div className="no-scrollbar -mx-5 mt-2 flex gap-1.5 overflow-x-auto px-5">
        {near.map((p) => (
          <Chip
            key={p.name}
            active={name === p.name}
            className="rounded-full"
            onClick={() => {
              setName(p.name)
              setArea(p.area)
              setPin({ x: p.x, y: p.y })
            }}
          >
            {p.name}
          </Chip>
        ))}
      </div>
      <label className="mt-3 flex h-12 items-center gap-2 rounded-lg border px-3 focus-within:border-ink">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="가게 이름 (예: 이름 없는 유리 공방 2층)" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint" />
        <span className="text-[12px] text-faint">가게 이름</span>
      </label>
      <p className="mt-1.5 text-[12px] text-muted-foreground">목록에 없으면 이름만 적어도 핀 위치로 저장돼요</p>
      <Button
        size="lg"
        className="mt-5 w-full"
        disabled={!name.trim()}
        onClick={() => {
          onDone({ name: name.trim(), area, x: pin.x, y: pin.y })
          onClose()
        }}
      >
        이 위치로 할게요
      </Button>
    </Sheet>
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
