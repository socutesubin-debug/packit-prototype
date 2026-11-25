import { motion } from 'motion/react'
import { ArrowLeft, ArrowUpRight, Bookmark, BookmarkCheck, Compass, Heart, Lightbulb, MapPin, MessageCircle, MessageCircleQuestion, PenLine, Route } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Chip, IconBtn, Panel } from '@/components/ui/primitives'
import { COLLECTIONS, POST_KINDS, SERIES, STORIES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Find, PostKind } from '@/lib/types'
import { cn, yen } from '@/lib/utils'
import { FindPhoto, FlagMark } from './Finds'
import { ShibuyaMap } from './MapScreen'

const when = (d: number) => (d === 0 ? '오늘' : d === 1 ? '어제' : d < 7 ? `${d}일 전` : `${Math.round(d / 7)}주 전`)

function Avatar({ name, dark }: { name: string; dark?: boolean }) {
  return <span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold', dark ? 'bg-white/15 text-white' : 'bg-sunken text-ink-2')}>{name.slice(0, 1)}</span>
}

/** three cutouts arranged like a magazine cover */
function Collage({ finds, dark }: { finds: Find[]; dark?: boolean }) {
  return (
    <div className="absolute inset-y-0 left-1/2 aspect-square max-w-full -translate-x-1/2">
      {finds.slice(0, 3).map((f, i) => (
        <motion.div
          key={f.id}
          className="absolute w-[46%]"
          style={{ left: ['4%', '50%', '27%'][i], top: ['12%', '6%', '38%'][i], zIndex: i === 2 ? 3 : 1 }}
          initial={{ y: 20, opacity: 0, rotate: 0 }}
          animate={{ y: 0, opacity: 1, rotate: [-8, 7, -2][i] }}
          transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 160, damping: 16 }}
        >
          <div className={cn('rounded-[14px] p-1.5 shadow-[0_18px_30px_-16px_rgba(0,0,0,0.5)]', dark ? 'bg-white' : 'bg-white ring-1 ring-black/5')}>
            <FindPhoto f={f} className="aspect-square w-full rounded-[10px]" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export const kindLabel = (k?: PostKind) => POST_KINDS.find((x) => x.kind === (k ?? 'find'))!.label
export const KIND_ICON: Record<PostKind, typeof Compass> = { find: Compass, tip: Lightbulb, course: Route, ask: MessageCircleQuestion }

export function Magazine() {
  const { finds, open, following, justPosted } = useApp()
  const [feed, setFeed] = useState<'rec' | 'follow'>('rec')
  const [kind, setKind] = useState<PostKind | 'all'>('all')
  const byId = (id: string) => finds.find((f) => f.id === id)
  const stories = STORIES.map((s) => ({ ...s, finds: s.findIds.map(byId).filter(Boolean) as Find[] }))
  const today = stories[0]
  const series = SERIES.find((x) => x.id === today.series)
  const pool = finds
    .filter((f) => f.city === '도쿄' && (!f.mine || f.id === justPosted))
    .filter((f) => feed === 'rec' || following.has(f.author) || f.id === justPosted)
    .filter((f) => kind === 'all' || (f.kind ?? 'find') === kind)
    .sort((a, b) => (a.id === justPosted ? -1 : b.id === justPosted ? 1 : feed === 'rec' ? b.saves / (1 + b.daysAgo) - a.saves / (1 + a.daysAgo) : a.daysAgo - b.daysAgo))

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-[max(20px,env(safe-area-inset-top))] pb-32 lg:px-10 lg:pt-12">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[12.5px] font-semibold text-muted-foreground">11월 26일 목요일</p>
          <h1 className="mt-1 text-[30px] leading-none font-semibold tracking-tight lg:text-[36px]">발견</h1>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => open({ type: 'post' })}>
          <PenLine className="size-4" /> 글쓰기
        </Button>
      </header>

      {/* TODAY — App Store Today */}
      <button onClick={() => open({ type: 'story', id: today.id })} className="group relative mt-5 flex w-full flex-col overflow-hidden rounded-3xl bg-ink text-left text-white lg:flex-row">
        <div className="relative aspect-[5/4] w-full lg:aspect-auto lg:h-[340px] lg:flex-1">
          <Collage finds={today.finds} dark />
        </div>
        <div className="p-5 pt-0 lg:flex lg:w-[380px] lg:flex-col lg:justify-end lg:p-8">
          <p className="text-[11.5px] font-semibold tracking-[0.12em] text-white/50">TODAY · 연재 {series?.title} EP.{today.ep}</p>
          <h2 className="mt-2 text-[25px] leading-[1.2] font-semibold tracking-tight text-balance lg:text-[30px]">{today.title}</h2>
          <p className="mt-1.5 text-[14px] text-white/60">{today.sub}</p>
          <p className="mt-4 flex items-center gap-1 text-[13px] font-semibold">
            읽기 <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </p>
        </div>
      </button>

      {/* 연재 코너 — 29CM */}
      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2 className="text-[19px] font-semibold tracking-tight">연재</h2>
          <span className="text-[12.5px] text-muted-foreground">매주 새 회차</span>
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:px-0">
          {SERIES.map((se) => {
            const last = se.eps[0]
            const st = stories.find((x) => x.id === last.storyId)
            return (
              <button key={se.id} onClick={() => open({ type: 'series', id: se.id })} className="w-[232px] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card text-left shadow-xs lg:w-auto">
                <div className="relative aspect-[16/10] bg-sunken">
                  {st ? <Collage finds={st.finds} /> : <ReceiptArt />}
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold shadow-xs">EP.{last.ep} 최신</span>
                </div>
                <div className="p-3.5">
                  <p className="text-[11.5px] font-medium text-muted-foreground">{se.by}</p>
                  <h3 className="mt-0.5 text-[15.5px] font-semibold tracking-tight">{se.title}</h3>
                  <p className="mt-1 line-clamp-1 text-[12.5px] text-muted-foreground">{last.title}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* 여행자 발견 피드 — 오늘의집 콘텐츠 × 밀리 포스팅 */}
      <section className="mt-9">
        <div className="sticky top-0 z-10 -mx-5 bg-background/95 px-5 pt-2 backdrop-blur lg:mx-0 lg:px-0">
          <div className="flex gap-5 border-b">
            {([['rec', '추천'], ['follow', '팔로잉']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFeed(k)} className={cn('-mb-px border-b-2 pb-2.5 text-[16px] font-semibold transition', feed === k ? 'border-ink text-ink' : 'border-transparent text-faint')}>
                {l}
              </button>
            ))}
          </div>
          <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5 py-3 lg:mx-0 lg:px-0">
            <Chip active={kind === 'all'} onClick={() => setKind('all')} className="rounded-full">전체</Chip>
            {POST_KINDS.map((k) => {
              const I = KIND_ICON[k.kind]
              return (
                <Chip key={k.kind} active={kind === k.kind} onClick={() => setKind(k.kind)} className="rounded-full">
                  <I className="size-3.5" /> {k.label}
                </Chip>
              )
            })}
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {pool.map((f) => (
            <PostCard key={f.id} f={f} highlight={f.id === justPosted} />
          ))}
        </div>
        {!pool.length && (
          <p className="py-14 text-center text-[14px] text-muted-foreground">{feed === 'follow' ? '팔로우한 여행자의 글이 아직 없어요' : '이 종류의 글이 아직 없어요'}</p>
        )}
      </section>
      <p className="mt-6 text-center text-[11.5px] text-faint">발견 탭의 글과 사진은 예시 콘텐츠예요</p>
    </div>
  )
}

function ReceiptArt() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="w-[46%] -rotate-3 rounded-sm bg-white p-3 shadow-[0_12px_24px_-14px_rgba(0,0,0,0.4)]">
        {[70, 90, 55, 80, 60].map((w, i) => (
          <div key={i} className="mb-1.5 flex justify-between gap-2">
            <span className="h-1.5 rounded-full bg-sunken" style={{ width: `${w * 0.6}%` }} />
            <span className="h-1.5 w-[18%] rounded-full bg-sunken" />
          </div>
        ))}
        <div className="mt-2 border-t border-dashed pt-1.5 text-right text-[9px] font-semibold tabular">¥42,800</div>
      </div>
    </div>
  )
}

export function PostCard({ f, highlight }: { f: Find; highlight?: boolean }) {
  const { open, thanked, toggleThank, savedFind, toggleSaveFind, notify, comments, following, toggleFollow } = useApp()
  const k = f.kind ?? 'find'
  const I = KIND_ICON[k]
  const saved = savedFind(f.id)
  const liked = thanked.has(f.id)
  const n = comments[f.id]?.length ?? 0
  const go = () => open({ type: 'find', id: f.id })
  return (
    <article className={cn('rounded-2xl border bg-card p-4 shadow-xs', highlight && 'border-ink ring-1 ring-ink')}>
      <div className="flex items-center gap-2">
        <Avatar name={f.author} />
        <span className="min-w-0 flex-1 truncate text-[13px]">
          <b className="font-semibold">{f.author}</b>
          <span className="text-muted-foreground"> · {highlight ? '방금 · 내 글' : when(f.daysAgo)}</span>
        </span>
        {!f.mine && !following.has(f.author) && (
          <button onClick={() => toggleFollow(f.author)} className="text-[12.5px] font-semibold text-ink underline-offset-2 hover:underline">
            팔로우
          </button>
        )}
      </div>
      <button onClick={go} className="mt-3 block w-full text-left">
        <span className="inline-flex items-center gap-1 rounded-md bg-sunken px-1.5 py-0.5 text-[11.5px] font-semibold text-ink-2">
          <I className="size-3" /> {kindLabel(k)}
        </span>
        <h3 className="mt-2 text-[16.5px] leading-snug font-semibold tracking-tight">{f.title}</h3>
        <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-ink-2">{f.story}</p>
        {k !== 'tip' && <FindPhoto f={f} className="mt-3 aspect-[16/10] w-full rounded-xl" />}
        <p className="mt-2.5 flex items-center gap-1 text-[12.5px] text-muted-foreground">
          <MapPin className="size-3.5" /> <span className="truncate">{f.place}</span>
          {f.price != null && <span className="ml-auto shrink-0 font-semibold text-ink tabular">{k === 'ask' ? '본 가격 ' : ''}{yen(f.price)}</span>}
        </p>
      </button>
      <div className="mt-3 flex items-center border-t pt-2 text-[13px] text-muted-foreground">
        <button onClick={() => !f.mine && toggleThank(f.id)} aria-pressed={liked} className={cn('flex h-9 items-center gap-1.5 pr-4', liked && 'text-ink')}>
          <Heart className={cn('size-4', liked && 'fill-ink')} /> <span className="tabular">{f.thanks}</span>
        </button>
        <button onClick={go} className="flex h-9 items-center gap-1.5 pr-4">
          <MessageCircle className="size-4" /> <span className="tabular">{n}</span>
        </button>
        <button
          onClick={() => notify(toggleSaveFind(f) ? '내 여행에 저장했어요' : '저장을 취소했어요')}
          aria-pressed={saved}
          className={cn('ml-auto flex h-9 items-center gap-1.5', saved && 'font-semibold text-ink')}
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />} {saved ? '저장됨' : '저장'}
        </button>
      </div>
    </article>
  )
}

/* ---------- series (29CM 연재) ---------- */

export function SeriesPanel({ id, z }: { id: string; z: number }) {
  const { close, open, finds, notify } = useApp()
  const se = SERIES.find((x) => x.id === id)
  if (!se) return null
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto pb-12">
        <div className="px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <IconBtn label="뒤로" onClick={close} className="shadow-none">
            <ArrowLeft className="size-5" />
          </IconBtn>
        </div>
        <div className="px-5 pt-5 pb-6">
          <p className="text-[12px] font-semibold tracking-[0.12em] text-muted-foreground">SERIES · {se.by}</p>
          <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-tight">{se.title}</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{se.desc}</p>
          <p className="mt-3 text-[13px] font-medium tabular">총 {se.eps.length}화</p>
        </div>
        <ol className="border-t">
          {se.eps.map((e) => {
            const st = STORIES.find((x) => x.id === e.storyId)
            const cover = st ? (finds.find((f) => f.id === st.findIds[0]) ?? null) : null
            return (
              <li key={e.ep} className="border-b">
                <button
                  onClick={() => (st ? open({ type: 'story', id: st.id }) : notify('다음 주에 공개돼요'))}
                  className={cn('flex w-full items-center gap-4 px-5 py-4 text-left', !st && 'opacity-50')}
                >
                  <span className="w-11 shrink-0 text-[13px] font-semibold tabular">EP.{String(e.ep).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] leading-snug font-semibold">{e.title}</span>
                    <span className="mt-0.5 block text-[12.5px] text-muted-foreground tabular">{e.date}{!st && ' · 준비 중'}</span>
                  </span>
                  {cover ? <FindPhoto f={cover} className="size-16 shrink-0 rounded-lg" /> : <span className="size-16 shrink-0 rounded-lg bg-sunken" />}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </Panel>
  )
}

/* ---------- article ---------- */

export function StoryArticle({ id, z }: { id: string; z: number }) {
  const { close, closeAll, finds, savedFind, toggleSaveFind, notify, setMapFocus, setTab, open } = useApp()
  const scroller = useRef<HTMLDivElement>(null)
  const refs = { story: useRef<HTMLDivElement>(null), items: useRef<HTMLDivElement>(null), map: useRef<HTMLDivElement>(null) }
  const [tab, setTabState] = useState<'story' | 'items' | 'map'>('story')
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const on = () => {
      const y = el.scrollTop + 120
      const at = (r: React.RefObject<HTMLDivElement | null>) => r.current?.offsetTop ?? 0
      setTabState(y >= at(refs.map) - 40 ? 'map' : y >= at(refs.items) ? 'items' : 'story')
    }
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  })
  const s = STORIES.find((x) => x.id === id)
  if (!s) return null
  const se = SERIES.find((x) => x.id === s.series)
  const list = s.findIds.map((fid) => finds.find((f) => f.id === fid)).filter(Boolean) as Find[]
  const jump = (k: keyof typeof refs) => {
    const el = scroller.current
    const t = refs[k].current
    if (el && t) el.scrollTo({ top: t.offsetTop - 56, behavior: 'smooth' })
  }
  const toMap = (f: Find) => {
    setMapFocus(`f:${f.id}`)
    closeAll()
    setTab('map')
  }
  return (
    <Panel onClose={close} z={z} wide>
      <div ref={scroller} className="relative flex-1 overflow-y-auto bg-white pb-16">
        <div className="relative bg-ink pt-[max(12px,env(safe-area-inset-top))] text-white">
          <div className="px-4">
            <IconBtn label="뒤로" onClick={close} className="bg-white/10 text-white shadow-none">
              <ArrowLeft className="size-5" />
            </IconBtn>
          </div>
          <div className="relative mx-auto aspect-[5/4] max-w-[520px]">
            <Collage finds={list} dark />
          </div>
          <div className="mx-auto max-w-[620px] px-6 pb-8">
            {se && (
              <button onClick={() => open({ type: 'series', id: se.id })} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-semibold text-ink">
                연재 · {se.title} EP.{s.ep}
              </button>
            )}
            <h1 className="mt-3 text-[30px] leading-[1.15] font-semibold tracking-tight text-balance">{s.title}</h1>
            <p className="mt-2 text-[15px] text-white/60">{s.sub}</p>
            <p className="mt-5 text-[12.5px] text-white/50">Packit 에디터 · 여행자 발견 {list.length}개</p>
          </div>
        </div>

        <nav className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[620px] px-6">
            {([['story', '이야기'], ['items', `발견템 ${list.length}`], ['map', '지도']] as const).map(([k, l]) => (
              <button key={k} onClick={() => jump(k)} className={cn('-mb-px flex-1 border-b-2 py-3.5 text-[14.5px] font-semibold transition', tab === k ? 'border-ink text-ink' : 'border-transparent text-faint')}>
                {l}
              </button>
            ))}
          </div>
        </nav>

        <article className="mx-auto max-w-[620px] px-6">
          <div ref={refs.story} className="pt-8">
            <p className="text-[16.5px] leading-[1.8] text-ink-2">{s.intro}</p>
          </div>
          <div ref={refs.items}>
            {list.map((f, i) => {
              const saved = savedFind(f.id)
              return (
                <section key={f.id} className="mt-12 border-t border-ink pt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[40px] leading-none font-light tabular">{String(i + 1).padStart(2, '0')}</span>
                    <h2 className="text-[21px] leading-tight font-semibold tracking-tight">{f.title}</h2>
                  </div>
                  <button onClick={() => open({ type: 'find', id: f.id })} className="mt-4 block w-full">
                    <FindPhoto f={f} className="aspect-[4/3] w-full rounded-xl" />
                  </button>
                  <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <MapPin className="size-3.5" /> {f.place} · {f.area}
                    {f.price != null && <span className="ml-auto font-semibold text-ink tabular">{yen(f.price)}</span>}
                  </p>
                  <p className="mt-3 text-[15.5px] leading-[1.75] text-ink-2">“{f.story}”</p>
                  <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                    <Avatar name={f.author} /> {f.author}님의 발견 · {f.saves}명 저장
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button variant={saved ? 'outline' : 'default'} className="flex-1" onClick={() => notify(toggleSaveFind(f) ? '내 여행에 저장했어요' : '저장을 취소했어요')}>
                      {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />} {saved ? '저장됨' : '내 여행에 저장'}
                    </Button>
                    <Button variant="secondary" onClick={() => toMap(f)}>
                      <MapPin className="size-4" /> 지도
                    </Button>
                  </div>
                </section>
              )
            })}
          </div>

          <div ref={refs.map} className="mt-14 border-t border-ink pt-5">
            <h2 className="text-[21px] font-semibold tracking-tight">한 번에 돌아보기</h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">번호를 누르면 지도 탭에서 위치를 보여 줘요</p>
            <div className="relative mt-4 overflow-hidden rounded-xl bg-[#EDEDED]">
              <div className="relative aspect-[1200/1000] w-full">
                <ShibuyaMap />
                {list.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => toMap(f)}
                    aria-label={f.title}
                    className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white ring-[3px] ring-white tabular"
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <ol className="mt-3 divide-y">
              {list.map((f, i) => (
                <li key={f.id}>
                  <button onClick={() => toMap(f)} className="flex w-full items-center gap-3 py-3 text-left">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[11.5px] font-semibold text-white tabular">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold">{f.place}</span>
                      <span className="block truncate text-[12.5px] text-muted-foreground">{f.area}</span>
                    </span>
                    <FlagMark className="h-[18px] w-[14px]" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-12 text-center text-[11.5px] text-faint">예시 기사예요. 실제 운영 시 여행자 발견을 에디터가 골라 엮어요.</p>
        </article>
      </div>
    </Panel>
  )
}

export function CollectionPanel({ id, z }: { id: string; z: number }) {
  const { close, finds } = useApp()
  const c = COLLECTIONS.find((x) => x.id === id)
  if (!c) return null
  const list = finds.filter((f) => !f.mine && c.filter(f))
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto px-5 pb-12">
        <div className="-mx-1 pt-[max(12px,env(safe-area-inset-top))]">
          <IconBtn label="뒤로" onClick={close} className="shadow-none">
            <ArrowLeft className="size-5" />
          </IconBtn>
        </div>
        <p className="mt-4 text-[12.5px] font-semibold text-muted-foreground">테마</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">{c.title}</h1>
        <p className="mt-1 text-[14px] text-muted-foreground tabular">발견 {list.length}개</p>
        <div className="mt-5 grid gap-3">
          {list.map((f) => (
            <PostCard key={f.id} f={f} />
          ))}
        </div>
        {!list.length && <p className="py-16 text-center text-[14px] text-muted-foreground">아직 이 테마의 발견이 없어요</p>}
      </div>
    </Panel>
  )
}

