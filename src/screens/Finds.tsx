import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Compass, Flag, Heart, ImagePlus, Lightbulb, MoreHorizontal, Plus, Bold, Italic, Underline, Strikethrough, Highlighter, LocateFixed, MapPin, MessageCircle, MessageCircleQuestion, Quote, Route, Search, ShoppingBag, Sparkles, Tag, Trophy, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HILITE, TEXT_COLORS, htmlToText, sanitize, textToHtml } from '@/lib/rich'
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

/** post body: paragraphs, with "> " lines as pull quotes */
function Body({ text, html }: { text: string; html?: string }) {
  if (html) return <div className="rich rich-read mt-4" dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
  return (
    <div className="mt-4 space-y-3">
      {text.split('\n').filter((l) => l.trim()).map((l, i) =>
        l.startsWith('>') ? (
          <blockquote key={i} className="border-l-[3px] border-ink py-1 pl-4 text-[19px] leading-snug font-semibold tracking-[-0.02em]">
            {l.replace(/^>\s?/, '')}
          </blockquote>
        ) : (
          <p key={i} className="text-[15.5px] leading-[1.8] text-ink-2">
            {l}
          </p>
        ),
      )}
    </div>
  )
}

export function FindDetail({ id, z }: { id: string; z: number }) {
  const { finds, close, closeAll, savedFind, toggleSaveFind, thanked, toggleThank, notify, setMapFocus, setTab, trip, following, toggleFollow, comments, addComment, open, tSeries } = useApp()
  const [text, setText] = useState('')
  const cref = useRef<HTMLDivElement>(null)
  const f = finds.find((x) => x.id === id)
  if (!f) return null
  const k = f.kind ?? 'find'
  const series = tSeries.find((x) => x.id === f.seriesId)
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
          <button onClick={() => open({ type: 'author', name: f.author })} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-[14px] font-semibold">{f.author.slice(0, 1)}</span>
            <span className="min-w-0 flex-1">
              <b className="block text-[14.5px] font-semibold">{f.author}</b>
              <span className="text-[12.5px] text-muted-foreground">{f.authorTrip} · {when(f.daysAgo)}</span>
            </span>
          </button>
          {!f.mine && (
            <Button size="sm" variant={following.has(f.author) ? 'outline' : 'default'} className="rounded-full" onClick={() => toggleFollow(f.author)}>
              {following.has(f.author) ? '구독 중' : '구독'}
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
          {series && (
            <button onClick={() => open({ type: 'tseries', id: series.id })} className="mb-2 text-[11.5px] font-semibold tracking-[0.12em] text-muted-foreground hover:text-ink">
              TRAVELER SERIES · {series.title} {series.eps.findIndex((e) => e.findId === f.id) + 1}화
            </button>
          )}
          <h1 className="text-[24px] leading-tight font-bold tracking-[-0.02em]">{f.title}</h1>
          {f.subtitle && <p className="mt-1.5 text-[15px] text-muted-foreground">{f.subtitle}</p>}
          <Body text={f.story} html={f.html} />

          <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-xs">
            {/* 납작한 지도 띠: 발견 장소가 가운데 오도록 지도를 잘라 보여줘요 */}
            <button onClick={toMap} aria-label={`${f.place} 지도에서 보기`} className="relative block h-[96px] w-full overflow-hidden bg-[#EDEDED]">
              <span className="pointer-events-none absolute block" style={{ width: 720, height: 600, left: `calc(50% - ${f.x * 7.2}px)`, top: `calc(50% - ${f.y * 6}px)` }}>
                <ShibuyaMap />
              </span>
              <span className="absolute top-[58%] left-1/2">
                <FlagMark className="absolute bottom-0 left-[-5px] h-[34px] w-[26px]" active />
              </span>
              <span className="absolute right-2 bottom-2 flex items-center rounded-md bg-white px-2 py-0.5 text-[12px] font-semibold shadow-xs">
                지도 <ChevronRight className="size-3.5" />
              </span>
            </button>
            <button onClick={toMap} className="block w-full border-t px-4 py-3 text-left hover:bg-accent">
              <b className="block truncate text-[15px] font-semibold">{f.place}</b>
              <span className="text-[12.5px] text-muted-foreground">{f.area}</span>
            </button>
            {f.price != null && (
              <div className="flex items-center justify-between border-t px-4 py-2.5 text-[13.5px]">
                <span className="text-muted-foreground">{k === 'ask' ? '본 가격' : '발견 당시'}</span>
                <span className="font-semibold tabular">
                  {yen(f.price)} · {dateOf(f)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t px-4 py-2.5 text-[13.5px]">
              <span className="text-muted-foreground">카테고리</span>
              <span>
                {f.category} <span className="text-muted-foreground">· {f.saves}명 저장</span>
              </span>
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
  subtitle: string
  /** 연재에 묶기: existing series id, or a new series title */
  series: { id?: string; title: string } | null
  visibility: Visibility
}
type Visibility = 'all' | 'subs' | 'me'
const VIS_LABEL: Record<Visibility, string> = { all: '전체 공개', subs: '구독자만', me: '나만 보기' }
const EMPTY: Draft = { kind: null, title: '', body: '', photos: [], place: null, price: '', cat: null, catAuto: false, attached: [], subtitle: '', series: null, visibility: 'all' }
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
  const { close, addFind, setTab, trip, tripProducts, rate, notify, setJustPosted, tab, tSeries, addEpisode, updateFind } = useApp()
  const mySeries = tSeries.filter((x) => x.author === '수빈')
  const [pinMode, setPinMode] = useState(false)
  const [newSeries, setNewSeries] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const [fmt, setFmt] = useState(false)
  const fs = useFormatState(bodyRef)
  const [d, setD] = useState<Draft>(() => ({ ...EMPTY, ...(SAVED_DRAFT ?? {}) }))
  const [focused, setFocused] = useState(false)
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }))
  const [sheet, setSheet] = useState<null | 'kind' | 'place' | 'price' | 'cat' | 'photo' | 'product' | 'series'>(SAVED_DRAFT ? null : 'kind')
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
      story: htmlToText(d.body) || d.title.trim(),
      html: htmlToText(d.body) ? sanitize(d.body) : undefined,
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
      subtitle: d.subtitle.trim() || undefined,
    })
    let msg = '지도에 깃발을 꽂았어요 · +50P'
    if (d.series) {
      const sid = addEpisode(d.series.id ? { id: d.series.id } : { title: d.series.title }, { title: d.title.trim(), findId: f.id, spent: d.price ? Number(d.price) : undefined })
      updateFind(f.id, { seriesId: sid })
      const n = d.series.id ? (mySeries.find((x) => x.id === d.series?.id)?.eps.length ?? 0) + 1 : 1
      msg = `‘${d.series.title}’ ${n}화로 올렸어요 · +50P`
    }
    SAVED_DRAFT = null
    setJustPosted(f.id)
    close()
    if (tab !== 'magazine') setTab('magazine')
    window.setTimeout(() => notify(msg), 250)
  }

  const cover = d.photos[0]
  const focusBody = () => {
    const el = bodyRef.current
    if (!el || document.activeElement === el) return
    el.focus()
    const r = document.createRange()
    r.selectNodeContents(el)
    r.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(r)
  }
  const tools = (
    <>
      <ToolIcon label="서식" active={fmt} onMouseDown={(e) => e.preventDefault()} onClick={() => { focusBody(); setFmt((v) => !v) }}>
        <span className="text-[16px] leading-none font-semibold tracking-[-0.03em]">Aa</span>
      </ToolIcon>
      <ToolIcon label="사진" onClick={() => setSheet('photo')}>
        <ImagePlus className="size-[21px]" />
      </ToolIcon>
      <ToolIcon label="담은 상품" onClick={() => setSheet('product')} badge={attached.length || undefined}>
        <ShoppingBag className="size-[21px]" />
      </ToolIcon>
      <ToolIcon label="가격" onClick={() => setSheet('price')}>
        <span className="text-[17px] leading-none font-semibold">¥</span>
      </ToolIcon>
      <ToolIcon
        label="인용"
        active={fs.focused && fs.block === 'blockquote'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          focusBody()
          applyBlock(fs.block === 'blockquote' ? 'p' : 'blockquote')
          fs.refresh()
        }}
      >
        <Quote className="size-[19px]" />
      </ToolIcon>
      <ToolIcon label="연재에 묶기 등 더 보기" onClick={() => setSheet('series')}>
        <MoreHorizontal className="size-[21px]" />
      </ToolIcon>
    </>
  )

  return (
    <motion.div className="fixed inset-0 z-[58] flex flex-col bg-background" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
      <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col">
        {/* 글감식 상단: 취소 · 종류/공개 범위 · 올리기 */}
        <header className="grid h-14 shrink-0 grid-cols-[72px_1fr_72px] items-center border-b px-4 pt-[env(safe-area-inset-top)]">
          <button onClick={close} className="justify-self-start text-[15px] text-[#92928C] hover:text-ink">
            취소
          </button>
          <button onClick={() => setSheet('kind')} className={cn('flex items-center justify-self-center gap-1.5 text-[15.5px] font-semibold', tried && !d.kind && 'underline decoration-2 underline-offset-4')}>
            {kindMeta ? kindMeta.label : '종류 선택'}
            <span className="size-1 rounded-full bg-[#B9B9B2]" />
            {VIS_LABEL[d.visibility]}
            <ChevronDown className="size-4" />
          </button>
          <button onClick={submit} aria-disabled={!valid} className={cn('justify-self-end text-[15px] font-bold transition', valid ? 'text-ink' : 'text-[#B9B9B2]')}>
            올리기
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-6">
          {/* 사진 먼저 (오늘의집) */}
          <div className="px-4 pt-4">
            {cover ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EFEFEB]">
                {cover.src ? <img src={cover.src} alt="" className="size-full object-cover grayscale" /> : <ProductArt art={attached[0]?.art ?? SAMPLE_ART} tone="neutral" className="size-full" />}
                {cover.pins.map((p, i) => (
                  <span key={i} className="absolute z-20 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white shadow ring-[3px] ring-white tabular" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    {i + 1}
                  </span>
                ))}
                {pinMode && (
                  <div
                    className="absolute inset-0 z-10 cursor-crosshair"
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect()
                      const n = cover.pins.length
                      const pin: PhotoPin = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, label: attached[n]?.name ?? `물건 ${n + 1}` }
                      set({ photos: [{ ...cover, pins: [...cover.pins, pin] }, ...d.photos.slice(1)] })
                    }}
                  >
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium whitespace-nowrap text-white">물건을 누르면 번호 핀이 생겨요</span>
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 z-30 rounded-md bg-white px-2 py-0.5 text-[11.5px] font-semibold">표지</span>
                <div className="absolute top-2.5 right-2.5 z-30 flex gap-1.5">
                  <button onClick={() => setPinMode(!pinMode)} className={cn('h-8 rounded-full px-3 text-[12px] font-semibold shadow-xs', pinMode ? 'bg-ink text-white' : 'bg-white/90')}>
                    {pinMode ? '완료' : '핀 달기'}
                  </button>
                  {!pinMode && (
                    <button aria-label="표지 사진 빼기" onClick={() => set({ photos: d.photos.slice(1) })} className="grid size-8 place-items-center rounded-full bg-white/90 shadow-xs">
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                {!pinMode && (
                  <button onClick={() => setSheet('photo')} className="absolute right-2.5 bottom-2.5 z-30 flex h-8 items-center gap-1 rounded-full bg-black/65 px-3 text-[12.5px] font-semibold text-white">
                    <Plus className="size-3.5" /> {d.photos.length}
                  </button>
                )}
              </div>
            ) : (
              <button onClick={() => setSheet('photo')} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[#DEDED8] bg-[#FAFAF8] text-[#92928C] hover:bg-[#F7F7F3]">
                <Plus className="size-6" />
                <span className="text-[14px] font-medium">사진을 올려 주세요</span>
                <span className="text-[12px] text-[#B9B9B2]">첫 장이 표지가 돼요</span>
              </button>
            )}
            {!!cover?.pins.length && (
              <div className="pt-1">
                {cover.pins.map((p, i) => (
                  <div key={i} className="mt-1.5 flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[11.5px] font-semibold text-white tabular">{i + 1}</span>
                    <input
                      value={p.label}
                      onChange={(e) => set({ photos: [{ ...cover, pins: cover.pins.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }, ...d.photos.slice(1)] })}
                      className="h-9 min-w-0 flex-1 border-b bg-transparent text-[14px] outline-none focus:border-ink"
                      aria-label={`핀 ${i + 1} 이름`}
                    />
                    <button aria-label="핀 지우기" onClick={() => set({ photos: [{ ...cover, pins: cover.pins.filter((_, j) => j !== i) }, ...d.photos.slice(1)] })} className="grid size-8 place-items-center text-muted-foreground">
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4">
            <textarea
              value={d.title}
              onChange={(e) => set({ title: e.target.value.slice(0, 40).replace(/\n/g, '') })}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={1}
              placeholder="제목"
              aria-label="제목"
              className={cn('field-sizing-content mt-5 w-full resize-none bg-transparent text-[24px] leading-snug font-bold tracking-[-0.02em] outline-none placeholder:font-medium placeholder:text-[#B9B9B2]', tried && !d.title.trim() && 'placeholder:text-ink-2')}
            />
            <div className="mt-2 h-px bg-[#EFEFEB]" />

            {/* 위치 · 가격 · 카테고리 칩 */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {d.place ? (
                <span className="inline-flex h-8 items-center gap-1 rounded-full bg-[#F7F7F3] pr-1 pl-3 text-[13px]">
                  <button onClick={() => setSheet('place')} className="flex items-center gap-1">
                    <MapPin className="size-3.5 fill-ink text-white" /> {d.place.name}
                  </button>
                  <button aria-label="위치 빼기" onClick={() => set({ place: null })} className="grid size-6 place-items-center text-[#92928C]">
                    <X className="size-3.5" />
                  </button>
                </span>
              ) : (
                <button onClick={() => setSheet('place')} className={cn('flex h-8 items-center gap-1 text-[13.5px] text-[#92928C] hover:text-ink', tried && 'text-ink underline underline-offset-4')}>
                  <MapPin className="size-4 fill-[#92928C] text-white" /> 가게 위치 추가
                </button>
              )}
              {d.price ? (
                <span className="inline-flex h-8 items-center gap-0.5 rounded-full bg-[#F7F7F3] pr-1 pl-3 text-[13px]">
                  <button onClick={() => setSheet('price')} className="font-semibold tabular">
                    {yen(Number(d.price))}
                  </button>
                  <button aria-label="가격 빼기" onClick={() => set({ price: '' })} className="grid size-6 place-items-center text-[#92928C]">
                    <X className="size-3.5" />
                  </button>
                </span>
              ) : (
                <button onClick={() => setSheet('price')} className="flex h-8 items-center gap-1 px-1 text-[13.5px] text-[#92928C] hover:text-ink">
                  <span className="text-[14px] font-bold">¥</span> 가격 추가
                </button>
              )}
              {d.cat ? (
                <span className="inline-flex h-8 items-center gap-0.5 rounded-full bg-[#F7F7F3] pr-1 pl-3 text-[13px] text-[#666661]">
                  <button onClick={() => setSheet('cat')}>{d.cat}</button>
                  <button aria-label="카테고리 빼기" onClick={() => set({ cat: null })} className="grid size-6 place-items-center text-[#92928C]">
                    <X className="size-3.5" />
                  </button>
                </span>
              ) : (
                <button onClick={() => setSheet('cat')} className="flex h-8 items-center gap-1 px-1 text-[13.5px] text-[#92928C] hover:text-ink">
                  <Tag className="size-3.5" /> {catAuto ? <>카테고리 · <span className="text-ink-2">{cat}</span>?</> : '카테고리 추가'}
                </button>
              )}
              {d.series && <span className="inline-flex h-8 items-center rounded-full border border-[#DEDED8] px-3 text-[12.5px] text-[#666661]">연재 · {d.series.title}</span>}
            </div>

            {d.photos.slice(1).map((ph) => (
              <PhotoBlock key={ph.id} photo={ph} labels={attached.map((p) => p.name)} onChange={(n) => set({ photos: d.photos.map((x) => (x.id === ph.id ? n : x)) })} onRemove={() => set({ photos: d.photos.filter((x) => x.id !== ph.id) })} />
            ))}
            {attached.map((p) => (
              <div key={p.id} className="mt-3 flex items-center gap-3 rounded-xl border p-2">
                <ProductArt art={p.art} tone="neutral" className="size-12 shrink-0 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                  <span className="text-[12.5px] text-muted-foreground tabular">{yen(p.price)} · 내 리스트에서 가져옴</span>
                </span>
                <button aria-label="상품 빼기" onClick={() => attach(p)} className="grid size-8 place-items-center rounded-full hover:bg-accent">
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <RichEditor
              ref={bodyRef}
              initial={d.body}
              onChange={(html) => set({ body: html })}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false)
                window.setTimeout(() => {
                  if (document.activeElement !== bodyRef.current) setFmt(false)
                }, 0)
              }}
              placeholder={!d.kind || d.kind === 'find' ? '어디서, 무엇을 발견했나요? 짧은 소개로 시작해 보세요.\n#면세 #한정판 처럼 태그도 달 수 있어요.' : (kindMeta?.body ?? '')}
            />
          </div>
        </div>

        {/* 하단 툴바: 평소엔 바, 입력 중엔 키보드 위에 뜨는 둥근 막대 (Apple 메모) */}
        <div className="shrink-0 pb-[env(safe-area-inset-bottom)]">
          {tried && !valid && <p className="px-4 pb-1 text-[12.5px] font-medium">종류 · 제목 · 가게 위치를 채워 주세요</p>}
          {fmt ? (
            <FormatPanel fs={fs} onClose={() => setFmt(false)} />
          ) : focused ? (
            <div className="mx-3 mb-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-[0_2px_14px_rgba(0,0,0,0.14)]">
              {tools}
              <span className="ml-auto pr-3 text-[12px] text-[#92928C] tabular">{d.title.length}/40</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 border-t px-2 py-1.5">
              {tools}
              <button
                onClick={() => {
                  SAVED_DRAFT = d
                  notify('임시저장했어요')
                }}
                className="ml-auto flex h-10 items-center gap-2 px-3 text-[14px] text-[#92928C] hover:text-ink"
              >
                임시저장 <span className="h-3.5 w-px bg-[#DEDED8]" /> <span className="tabular">{SAVED_DRAFT ? 1 : 0}</span>
              </button>
            </div>
          )}
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

      {/* 종류 · 공개 범위 */}
      <Sheet open={sheet === 'kind'} onClose={() => setSheet(null)} title="어떤 글인가요?">
        <ul className="-mt-1 divide-y">
          {POST_KINDS.map((k) => {
            const I = KIND_ICONS[k.kind]
            return (
              <li key={k.kind}>
                <button
                  onClick={() => set({ kind: k.kind })}
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
        <p className="mt-5 text-[12.5px] font-semibold text-[#92928C]">누구에게 보일까요?</p>
        <div className="mt-2 flex rounded-xl bg-[#F7F7F3] p-1">
          {(Object.keys(VIS_LABEL) as Visibility[]).map((v) => (
            <button key={v} onClick={() => set({ visibility: v })} className={cn('h-9 flex-1 rounded-lg text-[13.5px] transition', d.visibility === v ? 'bg-ink font-semibold text-white' : 'text-[#666661]')}>
              {VIS_LABEL[v]}
            </button>
          ))}
        </div>
        <Button size="lg" className="mt-5 w-full" disabled={!d.kind} onClick={() => setSheet(null)}>
          {d.kind ? '완료' : '종류를 골라 주세요'}
        </Button>
      </Sheet>

      <PlaceSheet open={sheet === 'place'} onClose={() => setSheet(null)} value={d.place} onDone={(place) => set({ place })} />

      {/* 가격 */}
      <Sheet open={sheet === 'price'} onClose={() => setSheet(null)} title={d.kind === 'ask' ? '본 가격' : '발견 당시 가격'}>
        <label className="flex h-14 items-center rounded-xl border px-4 focus-within:border-ink">
          <span className="mr-1.5 text-[18px] font-semibold">¥</span>
          <input
            autoFocus
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
        <Button size="lg" className="mt-6 w-full" onClick={() => setSheet(null)}>
          완료
        </Button>
      </Sheet>

      {/* 카테고리 */}
      <Sheet open={sheet === 'cat'} onClose={() => setSheet(null)} title="카테고리">
        {catAuto && <p className="-mt-1 text-[12.5px] text-muted-foreground">제목을 보고 '{cat}'로 골라 뒀어요. 맞으면 눌러 주세요</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => { set({ cat: c }); setSheet(null) }} className="rounded-full">
              {c}
            </Chip>
          ))}
        </div>
        <div className="h-4" />
      </Sheet>

      {/* 연재에 묶기 */}
      <Sheet open={sheet === 'series'} onClose={() => setSheet(null)} title="더 보기 · 연재에 묶기">
        <p className="-mt-1 mb-2 text-[12.5px] text-muted-foreground">묶으면 내 연재의 다음 화로 올라가요</p>
        <ul className="divide-y">
          <li>
            <button onClick={() => { set({ series: null }); setSheet(null) }} className="flex w-full items-center justify-between py-3.5 text-left text-[15px]">
              묶지 않고 올리기 {!d.series && <Check className="size-5" />}
            </button>
          </li>
          {mySeries.map((x) => (
            <li key={x.id}>
              <button onClick={() => { set({ series: { id: x.id, title: x.title } }); setSheet(null) }} className="flex w-full items-center justify-between py-3.5 text-left">
                <span>
                  <b className="block text-[15px] font-semibold">{x.title}</b>
                  <span className="text-[12.5px] text-muted-foreground">{x.eps.length + 1}화로 올라가요</span>
                </span>
                {d.series?.id === x.id && <Check className="size-5" />}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] font-semibold">새 연재 시작하기</p>
        <div className="mt-2 flex gap-2">
          <Input value={newSeries} onChange={(e) => setNewSeries(e.target.value.slice(0, 24))} placeholder="예: 도쿄 3박 4일 영수증" className="h-11 text-[15px]" />
          <Button
            size="lg"
            disabled={!newSeries.trim()}
            onClick={() => {
              set({ series: { title: newSeries.trim() } })
              setNewSeries('')
              setSheet(null)
            }}
          >
            시작
          </Button>
        </div>
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
        <p className="mt-3 text-[12.5px] text-muted-foreground">첫 사진이 표지가 돼요. '핀 달기'로 물건에 번호 핀을 달 수 있어요.</p>
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

/* ───────── 서식 (아이폰 메모 방식) ───────── */

type Block = 'h2' | 'h3' | 'p' | 'blockquote'

export function applyBlock(b: Block) {
  document.execCommand('defaultParagraphSeparator', false, 'p')
  document.execCommand('formatBlock', false, `<${b}>`)
}

/** 커서만 있을 때 서식을 끄면, 그 서식 span 밖으로 커서를 꺼내요 (Chrome은 빈 선택에 끄기가 안 먹어요) */
function escapeStyle(prop: string) {
  const sel = window.getSelection()
  if (!sel || !sel.isCollapsed || !sel.anchorNode) return false
  let n: Node | null = sel.anchorNode
  let host: HTMLElement | null = null
  while (n && !(n instanceof HTMLElement && n.isContentEditable && n.getAttribute('contenteditable') === 'true')) {
    if (n instanceof HTMLElement && n.style.getPropertyValue(prop)) host = n
    n = n.parentNode
  }
  if (!host) return false
  const after = host.nextSibling
  if (after?.nodeType === Node.TEXT_NODE && after.textContent?.startsWith('\u200b')) {
    sel.collapse(after, 1)
    return true
  }
  const t = document.createTextNode('\u200b')
  host.after(t)
  sel.collapse(t, 1)
  return true
}

export function useFormatState(ref: React.RefObject<HTMLDivElement | null>) {
  const [st, setSt] = useState({ focused: false, block: 'p' as string, bold: false, italic: false, underline: false, strike: false, color: '', hilite: false })
  const refresh = () => {
    const el = ref.current
    const sel = window.getSelection()
    const inside = !!el && !!sel?.anchorNode && el.contains(sel.anchorNode)
    if (!inside) return setSt((x) => ({ ...x, focused: false }))
    let block = String(document.queryCommandValue('formatBlock') || 'p').toLowerCase()
    if (block === 'div' || block === '') block = 'p'
    const color = rgbToHex(String(document.queryCommandValue('foreColor')))
    const bg = rgbToHex(String(document.queryCommandValue('hiliteColor') || document.queryCommandValue('backColor')))
    setSt({
      focused: true,
      block,
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strike: document.queryCommandState('strikeThrough'),
      color,
      hilite: bg.toUpperCase() === HILITE,
    })
  }
  useEffect(() => {
    document.addEventListener('selectionchange', refresh)
    return () => document.removeEventListener('selectionchange', refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { ...st, refresh }
}
type FormatState = ReturnType<typeof useFormatState>

function rgbToHex(v: string) {
  const m = v.match(/\d+/g)
  if (!v.startsWith('rgb') || !m) return v
  return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()
}

export function RichEditor({ ref, initial, onChange, onFocus, onBlur, placeholder }: { ref: React.RefObject<HTMLDivElement | null>; initial: string; onChange: (html: string) => void; onFocus: () => void; onBlur: () => void; placeholder: string }) {
  const [empty, setEmpty] = useState(!initial || !htmlToText(initial))
  useEffect(() => {
    if (ref.current && initial) ref.current.innerHTML = sanitize(textToHtml(initial))
    document.execCommand('defaultParagraphSeparator', false, 'p')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline
      aria-label="이야기"
      data-ph={placeholder}
      data-empty={empty}
      onFocus={() => {
        document.execCommand('styleWithCSS', false, 'true')
        onFocus()
      }}
      onBlur={onBlur}
      onInput={(e) => {
        const el = e.currentTarget
        const isEmpty = !el.textContent?.trim()
        setEmpty(isEmpty)
        onChange(isEmpty ? '' : el.innerHTML)
      }}
      onPaste={(e) => {
        e.preventDefault()
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
      }}
      className="rich rich-edit relative mt-4 min-h-[160px] w-full outline-none"
    />
  )
}

const STYLES: { b: Block; label: string; cls: string }[] = [
  { b: 'h2', label: '제목', cls: 'text-[19px] font-bold' },
  { b: 'h3', label: '소제목', cls: 'text-[16px] font-bold' },
  { b: 'p', label: '본문', cls: 'text-[14.5px]' },
  { b: 'blockquote', label: '인용', cls: 'text-[14.5px] font-semibold' },
]

export function FormatPanel({ fs, onClose }: { fs: FormatState; onClose: () => void }) {
  // 누르는 동안 편집기 포커스(선택 영역)를 잃지 않게 해요
  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault()
  const run = (fn: () => void) => () => {
    fn()
    fs.refresh()
  }
  const inline: { k: 'bold' | 'italic' | 'underline' | 'strike'; cmd: string; label: string; icon: React.ReactNode }[] = [
    { k: 'bold', cmd: 'bold', label: '굵게', icon: <Bold className="size-[19px]" strokeWidth={2.6} /> },
    { k: 'italic', cmd: 'italic', label: '기울임', icon: <Italic className="size-[19px]" /> },
    { k: 'underline', cmd: 'underline', label: '밑줄', icon: <Underline className="size-[19px]" /> },
    { k: 'strike', cmd: 'strikeThrough', label: '취소선', icon: <Strikethrough className="size-[19px]" /> },
  ]
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onPointerDown={keep}
      onMouseDown={keep}
      className="mx-2 mb-2 rounded-[22px] bg-white px-4 pt-3 pb-4 shadow-[0_4px_24px_rgba(0,0,0,0.16)]"
      role="toolbar"
      aria-label="서식"
    >
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold">서식</p>
        <button aria-label="서식 닫기" onClick={onClose} className="grid size-7 place-items-center rounded-full bg-[#F0F0EC] text-[#666661]">
          <X className="size-4" />
        </button>
      </div>

      {/* 글자 크기 = 문단 스타일 */}
      <div className="no-scrollbar -mx-4 mt-3 flex items-end gap-1.5 overflow-x-auto px-4">
        {STYLES.map((x) => {
          const on = fs.block === x.b
          return (
            <button key={x.b} aria-pressed={on} onClick={run(() => applyBlock(x.b))} className={cn('flex h-11 shrink-0 items-center rounded-xl px-3.5 whitespace-nowrap transition', on ? 'bg-[#DFFF3F]' : 'hover:bg-[#F7F7F3]', x.cls)}>
              {x.b === 'blockquote' ? <span className="border-l-[2.5px] border-ink pl-1.5 leading-tight">{x.label}</span> : x.label}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {/* 굵기 · 기울기 · 밑줄 · 취소선 */}
        <div className="flex flex-1 overflow-hidden rounded-xl bg-[#F7F7F3]">
          {inline.map((x, i) => (
            <button key={x.k} aria-label={x.label} title={x.label} aria-pressed={fs[x.k]} onClick={run(() => document.execCommand(x.cmd))} className={cn('grid h-11 flex-1 place-items-center transition', i > 0 && 'border-l border-white', fs[x.k] ? 'bg-ink text-white' : 'text-ink')}>
              {x.icon}
            </button>
          ))}
        </div>
        {/* 형광펜 — 브랜드 라임 */}
        <button aria-label="형광펜" title="형광펜" aria-pressed={fs.hilite} onClick={run(() => (fs.hilite && escapeStyle('background-color')) || document.execCommand('hiliteColor', false, fs.hilite ? 'transparent' : HILITE))} className={cn('grid h-11 w-12 place-items-center rounded-xl transition', fs.hilite ? 'bg-ink text-[#DFFF3F]' : 'bg-[#F7F7F3] text-ink')}>
          <Highlighter className="size-[19px]" />
        </button>
      </div>

      {/* 글자 색 */}
      <div className="mt-3.5 flex items-center justify-between px-0.5">
        {TEXT_COLORS.map((c, i) => {
          const on = fs.color.toUpperCase() === c.v.toUpperCase() || (i === 0 && !TEXT_COLORS.some((x) => x.v.toUpperCase() === fs.color.toUpperCase()))
          return (
            <button key={c.v} aria-label={`글자색 ${c.name}`} title={c.name} aria-pressed={on} onClick={run(() => document.execCommand('foreColor', false, c.v))} className={cn('grid size-9 place-items-center rounded-full transition', on && 'ring-2 ring-ink ring-offset-2')}>
              <span className="size-7 rounded-full" style={{ background: c.v }} />
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

function ToolIcon({ label, onClick, onMouseDown, children, active, badge }: { label: string; onClick: () => void; onMouseDown?: (e: React.MouseEvent) => void; children: React.ReactNode; active?: boolean; badge?: number }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} onMouseDown={onMouseDown} className={cn('relative grid size-10 place-items-center rounded-lg text-ink transition hover:bg-accent', active && 'bg-[#DFFF3F] hover:bg-[#DFFF3F]')}>
      {children}
      {badge ? <span className="absolute top-1 right-0.5 grid size-4 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white tabular">{badge}</span> : null}
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
export function PlaceSheet({ open, onClose, value, onDone }: { open: boolean; onClose: () => void; value: Place | null; onDone: (p: Place) => void }) {
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
