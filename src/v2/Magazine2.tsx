import { motion } from 'motion/react'
import { Check, ChevronRight, Grid2x2, Heart, Image as ImageIcon, MapPin, MessageCircle, MoreHorizontal, Share2, Tag } from 'lucide-react'
import { useRef, useState } from 'react'
import cover from '@/assets/photos/mag-cover.jpg'
import cups1 from '@/assets/photos/cups1.jpg'
import cups2 from '@/assets/photos/cups2.jpg'
import mapImg from '@/assets/photos/map-shibuya.png'
import { ProductArt } from '@/components/art/ProductArt'
import { AUTHORS } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Category, Find } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FormatPanel, PlaceSheet, RichEditor, useFormatState } from '@/screens/Finds'
import { htmlToText, sanitize } from '@/lib/rich'
import { Avatar, BackButton, C, IconBtn, Screen, SectionHead, Sheet2, wonStr, yenStr } from './ui'

const TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'find', label: '발견' },
  { id: 'tip', label: '팁' },
  { id: 'course', label: '코스' },
] as const

const kindOf = (f: Find) => f.kind ?? 'find'

/** 사진(있으면) 또는 일러스트 */
export function FindImage({ f, className }: { f: Find; className?: string }) {
  if (f.photo) return <img src={f.photo} alt="" className={cn('object-cover', className)} />
  return <ProductArt art={f.art} tone="neutral" className={className} />
}

/* ───────── 매거진 홈 ───────── */
export function Magazine2() {
  const { finds, open } = useApp()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all')
  const list = finds.filter((f) => f.city === '도쿄' && (tab === 'all' ? !!f.photo || f.mine : kindOf(f) === tab))
  return (
    <Screen>
      {/* 텍스트 탭 */}
      <nav className="flex h-10 items-end gap-6 px-4" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="t-body-m relative h-8" style={{ color: tab === t.id ? C.ink : C.ter, fontWeight: tab === t.id ? 600 : 500 }}>
            {t.label}
            {tab === t.id && <motion.span layoutId="magtab" className="absolute inset-x-0 -bottom-px h-0.5" style={{ background: C.ink }} />}
          </button>
        ))}
      </nav>
      <div className="h-px" style={{ background: C.line }} />

      {tab === 'all' && (
        <>
          {/* 커버 스토리 402×468 */}
          <button onClick={() => open({ type: 'story', id: 'st1' })} className="relative block h-[468px] w-full overflow-hidden text-left">
            <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
            <span className="absolute top-2 left-1/2 flex -translate-x-1/2 gap-1">
              <span className="h-1.5 w-9 rounded-full bg-white" />
              <span className="h-1.5 w-3 rounded-full bg-white/60" />
              <span className="h-1.5 w-3 rounded-full bg-white/60" />
            </span>
            <span className="t-h1 absolute bottom-8 left-8 text-white">
              도쿄에서 발견한,
              <br />
              오래 간직하고 싶은 물건들
            </span>
          </button>
          <div className="px-7 pt-6">
            <p className="t-label" style={{ color: C.sub }}>
              장인의 손길과 지역의 이야기가 담긴 물건들
            </p>
            <p className="t-cap mt-2" style={{ color: C.ter }}>
              2025년 10월 29일
            </p>
          </div>
        </>
      )}

      <section className="mt-12 px-5">
        <SectionHead>{tab === 'tip' ? '여행자들의 팁' : tab === 'course' ? '여행자들의 코스' : '여행자들의 발견'}</SectionHead>
        <ul className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-6">
          {list.map((f) => (
            <FindCard key={f.id} f={f} />
          ))}
        </ul>
        {!list.length && (
          <p className="t-label py-12 text-center" style={{ color: C.ter }}>
            아직 올라온 글이 없어요
          </p>
        )}
      </section>
    </Screen>
  )
}

export function FindCard({ f, hideMeta }: { f: Find; hideMeta?: boolean }) {
  const { open } = useApp()
  return (
    <li>
      <button onClick={() => open({ type: 'find', id: f.id })} className="block w-full text-left">
        <FindImage f={f} className="h-[200px] w-full" />
        <p className="t-cap mt-2" style={{ color: C.ter, fontSize: 12 }}>
          {f.station ?? f.area}
        </p>
        <p className="t-label mt-1 line-clamp-2" style={{ fontWeight: 500 }}>
          {f.title}
        </p>
      </button>
      {!hideMeta && (
        <p className="t-cap mt-2" style={{ color: C.ter }}>
          <button onClick={() => open({ type: 'author', name: f.author })} className="hover:underline">
            {f.author}
          </button>
          {f.price != null && ` · ${yenStr(f.price)}`}
        </p>
      )}
    </li>
  )
}

/* ───────── 작성글 (발견 상세) ───────── */
export function FindDetail2({ id, z }: { id: string; z: number }) {
  const { finds, close, open, savedFind, toggleSaveFind, thanked, toggleThank, following, toggleFollow, comments, addComment, notify, rate, setMapFocus, setTab, closeAll } = useApp()
  const f = finds.find((x) => x.id === id)
  const [text, setText] = useState('')
  const [slide, setSlide] = useState(0)
  if (!f) return null
  const photos = f.photos ?? (f.photo ? [f.photo] : [])
  const cs = comments[f.id] ?? []
  const saved = savedFind(f.id)
  const liked = thanked.has(f.id)
  const fol = following.has(f.author)
  const lines = f.story.split('\n')
  const tags = lines.filter((l) => l.trim().startsWith('#')).join(' ')
  const body = lines.filter((l) => !l.trim().startsWith('#')).join('\n').trim()
  const kindLabel = { find: '발견', tip: '팁', course: '코스', ask: '질문' }[kindOf(f)]
  return (
    <motion.div className="pk fixed inset-0 overflow-y-auto" style={{ zIndex: z, background: C.bg }} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }}>
      <div className="mx-auto w-full max-w-[480px] pt-[env(safe-area-inset-top)] pb-[calc(120px+env(safe-area-inset-bottom))]">
        <header className="relative flex h-[60px] items-center px-5">
          <BackButton onClick={close} />
          <span className="t-body-m absolute left-1/2 -translate-x-1/2 font-semibold">{kindLabel}</span>
        </header>

        {/* 작성자 */}
        <div className="mt-2 flex h-10 items-center justify-between px-6">
          <button onClick={() => open({ type: 'author', name: f.author })} className="flex items-center gap-2 text-left">
            <Avatar name={f.author} />
            <span>
              <span className="t-label block font-semibold">{AUTHORS[f.author]?.name ?? f.author}</span>
              <span className="t-cap" style={{ color: C.ter }}>
                {f.authorTrip} · {f.daysAgo ? `${f.daysAgo}일 전` : '3시간 전'}
              </span>
            </span>
          </button>
          {!f.mine && (
            <button onClick={() => toggleFollow(f.author)} className="t-cap2 h-7 rounded-md px-3 font-semibold text-white" style={{ background: fol ? C.btn : C.g3 }}>
              {fol ? '팔로잉' : '팔로우'}
            </button>
          )}
        </div>

        {/* 사진 캐러셀 */}
        <div className="mt-5">
          {photos.length ? (
            <div className="relative">
              <div
                className="no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto"
                onScroll={(e) => {
                  const el = e.currentTarget
                  setSlide(Math.round(el.scrollLeft / 270))
                }}
              >
                {photos.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-[374px] w-[266px] shrink-0 snap-start object-cover" />
                ))}
              </div>
              {photos.length > 1 && (
                <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
                  {photos.map((_, i) => (
                    <span key={i} className="h-1.5 rounded-full bg-white transition-all" style={{ width: i === slide ? 36 : 12, opacity: i === slide ? 1 : 0.6 }} />
                  ))}
                </span>
              )}
            </div>
          ) : (
            <ProductArt art={f.art} tone="neutral" className="mx-5 h-[260px]" />
          )}
        </div>

        <article className="px-9 pt-8">
          <h1 className="t-title">{f.title}</h1>
          {f.html ? (
            <div className="rich rich-read mt-3" dangerouslySetInnerHTML={{ __html: sanitize(f.html) }} />
          ) : (
            <p className="t-label mt-3 whitespace-pre-line" style={{ fontWeight: 400, lineHeight: '24px' }}>
              {body}
            </p>
          )}
          {tags && (
            <p className="t-label mt-4" style={{ color: C.ter, fontWeight: 400 }}>
              {tags}
            </p>
          )}
        </article>

        {/* 발견 정보 카드 — 지도 + 영수증 끝 */}
        <div className="mx-7 mt-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="receipt-edge bg-white px-2 pt-2 pb-5">
            <button
              onClick={() => {
                setMapFocus(`f:${f.id}`)
                closeAll()
                setTab('map')
              }}
              className="relative block h-[130px] w-full overflow-hidden rounded-xl"
              style={{ background: '#F4F4F4' }}
            >
              <img src={mapImg} alt="" className="absolute inset-0 size-full object-cover object-[50%_40%]" />
              <FlagIcon className="absolute top-[42%] left-[48%] h-6 w-6" />
              <span className="t-label absolute right-2 bottom-2 flex h-9 items-center gap-1 rounded-full bg-white px-4">
                지도보기 <ChevronRight className="size-4" />
              </span>
            </button>
            <dl className="t-label mt-3 flex flex-col gap-3 px-3">
              <Row label="위치" value={f.place} />
              <Row label="카테고리" value={f.category === '잡화' ? '캐릭터 · 굿즈' : f.category} />
              <div className="border-t border-dashed" style={{ borderColor: C.g3 }} />
              {f.price != null && <Row label="가격" value={`${yenStr(f.price)}`} sub={`(${wonStr(f.price, rate)})`} />}
            </dl>
          </div>
        </div>

        <p className="t-cap mt-4 px-7" style={{ color: C.ter }}>
          {f.date ?? '26.11.26'} · 좋아요 {f.thanks} · 내 여행 저장 {f.saves} · 조회 58
        </p>

        {/* 댓글 */}
        <section className="mt-8 px-9">
          <h2 className="t-label font-semibold">댓글 {cs.length}</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {cs.map((c) => (
              <li key={c.id} className="flex gap-2">
                <Avatar name={c.user} size={32} />
                <div>
                  <p className="t-cap2">
                    <b className="font-semibold">{c.user}</b>{' '}
                    <span style={{ color: C.ter, fontWeight: 400 }}>{c.ago}</span>
                  </p>
                  <p className="t-cap mt-1" style={{ fontSize: 14, lineHeight: '20px' }}>
                    {c.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!text.trim()) return
              addComment(f.id, text.trim())
              setText('')
            }}
            className="mt-5"
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="댓글을 남겨 주세요" aria-label="댓글" className="t-label h-10 w-full rounded-xl border bg-white px-5 outline-none" style={{ borderColor: C.line }} />
          </form>
        </section>
      </div>

      {/* 하단: 좋아요 · 댓글 · 공유 · 내 여행에 저장 */}
      <div className="fixed inset-x-0 bottom-0 z-10 rounded-t-3xl border-t bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-[74px] max-w-[480px] items-center gap-4 px-10 pb-[env(safe-area-inset-bottom)]">
          <button onClick={() => toggleThank(f.id)} aria-pressed={liked} className="t-label flex items-center gap-1" style={{ color: C.sub }}>
            <Heart className="size-5" strokeWidth={1.6} style={liked ? { fill: C.pink, color: C.pinkLine } : undefined} />
            {f.thanks}
          </button>
          <span className="t-label flex items-center gap-1" style={{ color: C.sub }}>
            <MessageCircle className="size-5" strokeWidth={1.6} />
            {cs.length}
          </span>
          <button aria-label="공유" onClick={() => notify('링크를 복사했어요')} style={{ color: C.sub }}>
            <Share2 className="size-5" strokeWidth={1.6} />
          </button>
          <button
            onClick={() => {
              toggleSaveFind(f)
              notify(saved ? '내 여행에서 뺐어요' : '내 여행에 저장했어요')
            }}
            className="t-body-l ml-auto flex h-12 items-center gap-1 rounded-full px-5 text-white"
            style={{ background: C.ink }}
          >
            {saved && <Check className="size-5" />}
            {saved ? '저장했어요' : '내 여행에 저장'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex gap-6">
      <dt className="w-14 shrink-0" style={{ color: C.sub, fontWeight: 400 }}>
        {label}
      </dt>
      <dd className="t-body-m font-semibold">
        {value}{' '}
        {sub && (
          <span className="t-label" style={{ color: C.sub, fontWeight: 400 }}>
            {sub}
          </span>
        )}
      </dd>
    </div>
  )
}

export function FlagIcon({ className, color = C.flag }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 2v20" stroke="#3A3A40" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.8 3h14l-3.6 5 3.6 5h-14z" fill={color} />
    </svg>
  )
}

/* ───────── 사용자(여행자) 프로필 ───────── */
export function Profile2({ name, z }: { name: string; z: number }) {
  const { finds, close, following, toggleFollow } = useApp()
  const a = AUTHORS[name] ?? { name, bio: '', subs: 0, cities: [] }
  const posts = finds.filter((f) => f.author === name && (f.photo || f.mine))
  const sub = following.has(name)
  return (
    <motion.div className="pk fixed inset-0 overflow-y-auto" style={{ zIndex: z, background: C.bg }} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 320 }}>
      <div className="mx-auto w-full max-w-[480px] pt-[env(safe-area-inset-top)] pb-[calc(120px+env(safe-area-inset-bottom))]">
        <header className="flex h-[60px] items-center px-5">
          <BackButton onClick={close} circle />
        </header>
        <div className="mt-4 flex flex-col items-center text-center">
          <Avatar name={name} size={60} />
          <h1 className="t-title mt-4">{a.name}</h1>
          <p className="t-label mt-1" style={{ color: C.ter, fontWeight: 400 }}>
            {a.bio}
          </p>
          <dl className="mt-6 grid w-full grid-cols-3 px-6">
            {[
              [a.subs + (sub ? 1 : 0), '구독자'],
              [posts.length, '포스트'],
              [24, '여행'],
            ].map(([n, l]) => (
              <div key={l} className="flex flex-col-reverse items-center gap-1">
                <dt className="t-label" style={{ color: C.ter, fontWeight: 400 }}>
                  {l}
                </dt>
                <dd className="t-title tabular">{n}</dd>
              </div>
            ))}
          </dl>
          <button onClick={() => toggleFollow(name)} className="t-body-m mt-6 h-12 rounded-full px-5 text-white" style={{ background: sub ? C.gray : C.ink }}>
            {sub ? '구독 중' : '구독하기'}
          </button>
        </div>
        <section className="mt-9 px-5">
          <SectionHead>포스트 내역</SectionHead>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-6">
            {posts.map((f) => (
              <FindCard key={f.id} f={f} hideMeta />
            ))}
          </ul>
        </section>
      </div>
    </motion.div>
  )
}

/* ───────── 글쓰기 ───────── */
type Place = { name: string; area: string; x: number; y: number; auto?: boolean }
const CATS: Category[] = ['뷰티', '식품', '의약품', '의류', '잡화']
let DRAFT_COUNT = 0

export function Write2() {
  const { close, addFind, notify, setJustPosted, setTab, tab } = useApp()
  const bodyRef = useRef<HTMLDivElement>(null)
  const fs = useFormatState(bodyRef)
  const [fmt, setFmt] = useState(false)
  const [focused, setFocused] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [place, setPlace] = useState<Place | null>(null)
  const [cat, setCat] = useState<Category | null>(null)
  const [price, setPrice] = useState('')
  const [sheet, setSheet] = useState<null | 'place' | 'cat' | 'price'>(null)
  const [photos, setPhotos] = useState<string[]>([cups1, cups2])
  const file = useRef<HTMLInputElement>(null)
  const valid = !!title.trim() && !!place
  const submit = () => {
    if (!valid || !place) {
      notify(!title.trim() ? '제목을 적어 주세요' : '위치를 추가해 주세요')
      return
    }
    const f = addFind({
      kind: 'find',
      title: title.trim(),
      story: htmlToText(body) || title.trim(),
      html: htmlToText(body) ? sanitize(body) : undefined,
      place: place.name,
      area: place.area,
      x: place.x,
      y: place.y,
      price: price ? Number(price) : undefined,
      category: cat ?? '잡화',
      art: { shape: 'jar', color: '#E7E1D6', accent: '#8B7E6A', bg: '#F2EEE7' },
      photo: photos[0],
      photos,
      date: '26.11.26',
    })
    setJustPosted(f.id)
    close()
    if (tab !== 'magazine') setTab('magazine')
    window.setTimeout(() => notify('발견을 올렸어요 · +50P'), 250)
  }
  return (
    <motion.div className="pk fixed inset-0 z-[58] flex flex-col" style={{ background: C.bg }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
      <div className="mx-auto flex min-h-0 w-full max-w-[480px] flex-1 flex-col pt-[env(safe-area-inset-top)]">
        <header className="flex h-[60px] shrink-0 items-center justify-between px-5 pt-4">
          <BackButton onClick={close} circle label="취소" />
          <button onClick={submit} aria-disabled={!valid} className="t-body-m h-12 rounded-full px-5 font-semibold text-white" style={{ background: C.ink, opacity: valid ? 1 : 0.9 }}>
            글쓰기
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">
          {/* 사진 288×268 */}
          <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto px-6">
            {photos.map((src, i) => (
              <img key={i} src={src} alt="" className="h-[268px] w-[288px] shrink-0 object-cover" />
            ))}
            <button onClick={() => file.current?.click()} className="grid h-[268px] w-[120px] shrink-0 place-items-center border border-dashed" style={{ borderColor: C.g3, color: C.ter }}>
              <ImageIcon className="size-6" strokeWidth={1.6} />
            </button>
          </div>
          <div className="px-5">
            <textarea value={title} onChange={(e) => setTitle(e.target.value.slice(0, 40))} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={1} placeholder="제목" aria-label="제목" className="t-h2 field-sizing-content mt-6 w-full resize-none bg-transparent px-2 outline-none placeholder:font-medium placeholder:text-[#737370]" style={{ fontWeight: 600 }} />
            <div className="h-px" style={{ background: C.g3 }} />
            <ul className="mt-2">
              <WriteRow icon={<MapPin className="size-5" strokeWidth={1.6} />} label={place ? place.name : '위치 추가'} on={!!place} onClick={() => setSheet('place')} />
              <WriteRow icon={<Grid2x2 className="size-5" strokeWidth={1.6} />} label={cat ?? '카테고리'} on={!!cat} onClick={() => setSheet('cat')} />
              <WriteRow icon={<Tag className="size-5" strokeWidth={1.6} />} label={price ? `¥${Number(price).toLocaleString()}` : '가격 추가'} on={!!price} onClick={() => setSheet('price')} />
            </ul>
            <RichEditor
              ref={bodyRef}
              initial=""
              onChange={setBody}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false)
                window.setTimeout(() => {
                  if (document.activeElement !== bodyRef.current) setFmt(false)
                }, 0)
              }}
              placeholder={'어디서 무엇을 발견하셨나요? 마음껏 작성해주세요.\n다양한 #태그도 달 수 있어요'}
            />
          </div>
        </div>

        {/* 하단 툴바 (Apple 메모식) */}
        <div className="shrink-0 px-4 pb-[max(34px,env(safe-area-inset-bottom))]">
          {fmt ? (
            <FormatPanel fs={fs} onClose={() => setFmt(false)} />
          ) : (
            <div className={cn('flex h-12 items-center gap-2 rounded-full border bg-white px-3 transition', focused && 'shadow-[0_2px_12px_rgba(0,0,0,0.08)]')} style={{ borderColor: C.g4 }}>
              <IconBtn label="사진" onClick={() => file.current?.click()} className="size-10">
                <ImageIcon className="size-6" strokeWidth={1.6} />
              </IconBtn>
              <IconBtn
                label="서식"
                onClick={() => {
                  const el = bodyRef.current
                  if (el && document.activeElement !== el) {
                    el.focus()
                    const r = document.createRange()
                    r.selectNodeContents(el)
                    r.collapse(false)
                    window.getSelection()?.removeAllRanges()
                    window.getSelection()?.addRange(r)
                  }
                  setFmt(true)
                }}
                className="size-10"
              >
                <span className="text-[20px] leading-none" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
                  Aa
                </span>
              </IconBtn>
              <IconBtn label="더 보기" onClick={() => notify('연재에 묶기는 곧 열려요')} className="size-10">
                <MoreHorizontal className="size-6" strokeWidth={1.6} />
              </IconBtn>
              <button
                onClick={() => {
                  DRAFT_COUNT = 1
                  notify('임시저장했어요')
                }}
                className="t-label ml-auto flex h-10 items-center gap-2 px-2"
                style={{ color: C.gray }}
              >
                임시저장 <span className="tabular">{DRAFT_COUNT}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <PlaceSheet open={sheet === 'place'} onClose={() => setSheet(null)} value={place} onDone={(p) => setPlace(p)} />
      <Sheet2 open={sheet === 'cat'} onClose={() => setSheet(null)} title="카테고리">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCat(c)
                setSheet(null)
              }}
              className="t-label h-10 rounded-full px-4"
              style={cat === c ? { background: C.btn, color: '#fff' } : { background: C.line }}
            >
              {c}
            </button>
          ))}
        </div>
      </Sheet2>
      <Sheet2 open={sheet === 'price'} onClose={() => setSheet(null)} title="발견 당시 가격">
        <label className="flex h-14 items-center rounded-xl border px-4" style={{ borderColor: C.g4 }}>
          <span className="t-title mr-2">¥</span>
          <input autoFocus inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, '').slice(0, 7))} placeholder="0" className="t-title min-w-0 flex-1 bg-transparent outline-none" />
        </label>
        <button onClick={() => setSheet(null)} className="t-body-l mt-4 h-12 w-full rounded-full text-white" style={{ background: C.btn }}>
          완료
        </button>
      </Sheet2>
      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((f) => {
            const r = new FileReader()
            r.onload = () => setPhotos((ps) => [...ps, String(r.result)])
            r.readAsDataURL(f)
          })
        }}
      />
    </motion.div>
  )
}

function WriteRow({ icon, label, on, onClick }: { icon: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <li>
      <button onClick={onClick} className="flex h-[38px] w-full items-center gap-2 px-2 text-left">
        <span style={{ color: C.sub }}>{icon}</span>
        <span className="t-label flex-1 truncate font-semibold" style={{ color: on ? C.ink : C.ink }}>
          {label}
        </span>
        <ChevronRight className="size-5" strokeWidth={1.6} />
      </button>
    </li>
  )
}
