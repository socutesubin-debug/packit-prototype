import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bell, BellRing, Bookmark, BookmarkCheck, Compass, Heart, Lightbulb, MapPin, MessageCircle, MessageCircleQuestion, PenLine, Route } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ProductArt } from '@/components/art/ProductArt'
import { Button } from '@/components/ui/button'
import { IconBtn, Panel } from '@/components/ui/primitives'
import { AUTHORS, COLLECTIONS, POST_KINDS, SERIES, STORIES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Find, PostKind, TravelerSeries } from '@/lib/types'
import { cn, yen } from '@/lib/utils'
import { FindPhoto, FlagMark } from './Finds'
import { ShibuyaMap } from './MapScreen'

const when = (d: number) => (d === 0 ? '오늘' : d === 1 ? '어제' : d < 7 ? `${d}일 전` : `${Math.round(d / 7)}주 전`)

export function Avatar({ name, dark, className }: { name: string; dark?: boolean; className?: string }) {
  return <span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold', dark ? 'bg-white/15 text-white' : 'bg-sunken text-ink-2', className)}>{name.slice(0, 1)}</span>
}

/** English kicker + thick rule, the magazine section header */
function Head({ en, ko, right, className }: { en: string; ko?: string; right?: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-3">
        <p className="text-[11.5px] font-semibold tracking-[0.18em] text-ink">
          {en}
          {ko && <span className="ml-2 font-normal tracking-normal text-muted-foreground">{ko}</span>}
        </p>
        {right}
      </div>
      <div className="mt-2 h-[1.5px] bg-ink" />
    </div>
  )
}

const Num = ({ n, className }: { n: number; className?: string }) => <span className={cn('text-[34px] leading-none font-extralight tracking-tight tabular', className)}>{String(n).padStart(2, '0')}</span>

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

const TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'series', label: '연재' },
  { id: 'find', label: '발견' },
  { id: 'tip', label: '팁' },
  { id: 'course', label: '코스' },
  { id: 'ask', label: '질문' },
] as const
type TabId = (typeof TABS)[number]['id']

export function Magazine() {
  const { finds, open, following, justPosted, tSeries } = useApp()
  const [tab, setTabId] = useState<TabId>('all')
  const [feed, setFeed] = useState<'rec' | 'sub'>('rec')
  const byId = (id: string) => finds.find((f) => f.id === id)
  const stories = STORIES.map((s) => ({ ...s, finds: s.findIds.map(byId).filter(Boolean) as Find[] }))
  const [cover, ...week] = stories
  const coverSeries = SERIES.find((x) => x.id === cover.series)
  const pool = finds
    .filter((f) => f.city === '도쿄' && (!f.mine || f.id === justPosted))
    .filter((f) => feed === 'rec' || following.has(f.author) || f.id === justPosted)
    .sort((a, b) => (a.id === justPosted ? -1 : b.id === justPosted ? 1 : feed === 'rec' ? b.saves / (1 + b.daysAgo) - a.saves / (1 + a.daysAgo) : a.daysAgo - b.daysAgo))
  const tips = pool.filter((f) => f.kind === 'tip')
  const grid = tab === 'all' ? pool.filter((f) => f.kind !== 'tip') : pool.filter((f) => (f.kind ?? 'find') === tab)
  const kindTab = tab !== 'all' && tab !== 'series'

  const feedToggle = (
    <span className="flex gap-3 text-[13px]">
      {([['rec', '추천'], ['sub', '구독']] as const).map(([k, l]) => (
        <button key={k} onClick={() => setFeed(k)} className={cn('font-semibold transition', feed === k ? 'text-ink' : 'text-faint')}>
          {l}
        </button>
      ))}
    </span>
  )

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-[max(16px,env(safe-area-inset-top))] pb-32 lg:px-10 lg:pt-12">
      {/* masthead */}
      <header>
        <div className="flex items-center justify-between">
          <p className="text-[11.5px] font-medium tracking-[0.18em] text-muted-foreground">NO.47 · NOV 2026</p>
          <button onClick={() => open({ type: 'post' })} aria-label="글쓰기" className="-mr-2 flex h-9 items-center gap-1 rounded-full px-2 text-[13px] font-semibold hover:bg-accent">
            <PenLine className="size-4" /> 글쓰기
          </button>
        </div>
        <h1 className="mt-1 text-[34px] leading-none font-bold tracking-[-0.04em] lg:text-[48px]">Packit Journal</h1>
      </header>
      <nav className="sticky top-0 z-10 -mx-5 mt-3 border-t-[1.5px] border-ink bg-background/95 px-5 backdrop-blur lg:mx-0 lg:px-0">
        <div className="no-scrollbar flex gap-5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTabId(t.id)} className={cn('-mb-px shrink-0 border-b-2 py-3 text-[13.5px] font-semibold tracking-wide transition', tab === t.id ? 'border-ink text-ink' : 'border-transparent text-faint hover:text-ink-2')}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'all' && (
        <>
          {/* cover story */}
          <button onClick={() => open({ type: 'story', id: cover.id })} className="group -mx-5 mt-1 block w-[calc(100%+40px)] text-left lg:mx-0 lg:w-full">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink lg:aspect-[16/8]">
              <Collage finds={cover.finds} dark />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pt-24 pb-6 text-white lg:px-8">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">COVER STORY · {coverSeries?.title} EP.{cover.ep}</p>
                <h2 className="mt-2 text-[28px] leading-[1.18] font-bold tracking-[-0.03em] text-balance lg:text-[40px]">{cover.title}</h2>
              </div>
            </div>
          </button>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">{cover.sub}</p>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">글 Packit 에디터 · 사진 여행자 {cover.finds.length}명</p>

          <Head en="THIS WEEK" className="mt-10" />
          <ol>
            {week.map((s, i) => (
              <li key={s.id} className="border-b">
                <button onClick={() => open({ type: 'story', id: s.id })} className="flex w-full items-center gap-4 py-4 text-left">
                  <Num n={i + 1} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] leading-snug font-semibold tracking-tight">{s.title}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">{s.sub}</span>
                  </span>
                  <FindPhoto f={s.finds[0]} className="size-14 shrink-0" />
                </button>
              </li>
            ))}
          </ol>
        </>
      )}

      {(tab === 'all' || tab === 'series') && (
        <>
          <Head en="SERIES" ko="에디터 연재" className={tab === 'all' ? 'mt-12' : 'mt-6'} />
          <Rail>
            {SERIES.map((se) => {
              const st = stories.find((x) => x.id === se.eps[0].storyId)
              return (
                <PortraitCard key={se.id} onClick={() => open({ type: 'series', id: se.id })} kicker={`EP.${String(se.eps[0].ep).padStart(2, '0')}`} title={se.title} meta={se.by}>
                  {st ? <Collage finds={st.finds} /> : <ReceiptArt />}
                </PortraitCard>
              )
            })}
          </Rail>

          <Head en="TRAVELER SERIES" ko="여행자 연재" className="mt-12" />
          <Rail>
            {tSeries.map((ts) => (
              <PortraitCard key={ts.id} onClick={() => open({ type: 'tseries', id: ts.id })} kicker={`${ts.eps.length}화${ts.ongoing ? ' · 연재 중' : ''}`} title={ts.title} meta={ts.author} avatar={ts.author}>
                <SeriesCover ts={ts} />
              </PortraitCard>
            ))}
          </Rail>
        </>
      )}

      {tab !== 'series' && (
        <>
          <Head en={kindTab ? kindLabel(tab as PostKind).toUpperCase() : "TRAVELERS' FINDS"} ko={kindTab ? undefined : '여행자 발견'} right={feedToggle} className={tab === 'all' ? 'mt-12' : 'mt-6'} />
          {tab === 'tip' ? (
            <div>{tips.map((f) => <TipQuote key={f.id} f={f} />)}</div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 lg:grid-cols-4 lg:gap-x-5">
              {grid.map((f, i) => (
                <FragmentWithTip key={f.id} show={tab === 'all' && i === 3 && !!tips[0]} tip={tips[0]}>
                  <FindTile f={f} highlight={f.id === justPosted} />
                </FragmentWithTip>
              ))}
            </div>
          )}
          {!(tab === 'tip' ? tips : grid).length && (
            <p className="py-14 text-center text-[14px] text-muted-foreground">{feed === 'sub' ? '구독한 여행자의 글이 아직 없어요' : '이 종류의 글이 아직 없어요'}</p>
          )}
        </>
      )}
      <p className="mt-12 text-center text-[11.5px] text-faint">발견 탭의 글과 사진은 예시 콘텐츠예요</p>
    </div>
  )
}

function FragmentWithTip({ children, show, tip }: { children: React.ReactNode; show: boolean; tip?: Find }) {
  return (
    <>
      {children}
      {show && tip && (
        <div className="col-span-2 lg:col-span-4">
          <TipQuote f={tip} label="TIP OF THE DAY" />
        </div>
      )}
    </>
  )
}

function Rail({ children }: { children: React.ReactNode }) {
  return <div className="no-scrollbar -mx-5 mt-4 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">{children}</div>
}

function PortraitCard({ children, onClick, kicker, title, meta, avatar }: { children: React.ReactNode; onClick: () => void; kicker: string; title: string; meta: string; avatar?: string }) {
  return (
    <button onClick={onClick} className="group w-[150px] shrink-0 snap-start text-left lg:w-auto">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-sunken">
        {children}
        {avatar && <Avatar name={avatar} className="absolute top-2 left-2 size-7 bg-white text-[11px] text-ink shadow-xs" />}
      </div>
      <p className="mt-2.5 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{kicker}</p>
      <p className="mt-0.5 text-[15px] leading-snug font-semibold tracking-tight">{title}</p>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">{meta}</p>
    </button>
  )
}

/** cover for a traveler series: its episodes' photos, or a receipt */
function SeriesCover({ ts }: { ts: TravelerSeries }) {
  const { finds } = useApp()
  const list = ts.eps.map((e) => finds.find((f) => f.id === e.findId)).filter(Boolean) as Find[]
  return list.length ? <Collage finds={list} /> : <ReceiptArt total={ts.eps.reduce((a, e) => a + (e.spent ?? 0), 0)} />
}

function ReceiptArt({ total = 42800 }: { total?: number }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="w-[54%] -rotate-3 bg-white p-3 shadow-[0_12px_24px_-14px_rgba(0,0,0,0.4)]">
        {[70, 90, 55, 80, 60].map((w, i) => (
          <div key={i} className="mb-1.5 flex justify-between gap-2">
            <span className="h-1.5 rounded-full bg-sunken" style={{ width: `${w * 0.6}%` }} />
            <span className="h-1.5 w-[18%] rounded-full bg-sunken" />
          </div>
        ))}
        <div className="mt-2 border-t border-dashed pt-1.5 text-right text-[9px] font-semibold whitespace-nowrap tabular">{yen(total)}</div>
      </div>
    </div>
  )
}

function FindTile({ f, highlight }: { f: Find; highlight?: boolean }) {
  const { open, savedFind } = useApp()
  const k = f.kind ?? 'find'
  return (
    <button onClick={() => open({ type: 'find', id: f.id })} className="group block min-w-0 text-left">
      <div className={cn('relative overflow-hidden bg-sunken', highlight && 'ring-2 ring-ink ring-offset-2')}>
        <FindPhoto f={f} className="aspect-[4/5] w-full transition duration-300 group-hover:scale-[1.02]" />
        {savedFind(f.id) && <BookmarkCheck className="absolute top-2 right-2 size-5 rounded-full bg-white p-0.5" />}
      </div>
      <p className="mt-2.5 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{highlight ? '방금 올린 내 글' : k === 'find' ? f.area : kindLabel(k)}</p>
      <p className="mt-0.5 line-clamp-2 text-[14.5px] leading-snug font-semibold tracking-tight">
        {k === 'ask' && 'Q. '}
        {f.title}
      </p>
      <p className="mt-1 truncate text-[12.5px] text-muted-foreground">
        {f.author}
        {f.price != null && <span className="tabular"> · {yen(f.price)}</span>}
      </p>
    </button>
  )
}

function TipQuote({ f, label }: { f: Find; label?: string }) {
  const { open } = useApp()
  return (
    <button onClick={() => open({ type: 'find', id: f.id })} className="block w-full border-b py-6 text-left">
      {label && <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">{label}</p>}
      <p className={cn('text-[21px] leading-[1.45] font-semibold tracking-[-0.02em] text-balance', label && 'mt-2.5')}>“{f.title}”</p>
      <p className="mt-2.5 text-[13px] text-muted-foreground">
        — {f.author} · {f.place}
      </p>
    </button>
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
            구독
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

/* ---------- 에디터 연재 (29CM) ---------- */

function SeriesHero({ onBack, kicker, title, meta, children }: { onBack: () => void; kicker: string; title: string; meta: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-sunken">
      {children}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/85 to-transparent px-5 pt-20 pb-5">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">{kicker}</p>
        <h1 className="mt-1.5 text-[28px] leading-[1.15] font-bold tracking-[-0.03em]">{title}</h1>
        <div className="mt-2 text-[13px] text-muted-foreground">{meta}</div>
      </div>
      <div className="absolute top-0 left-0 px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <IconBtn label="뒤로" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </IconBtn>
      </div>
    </div>
  )
}

function EpRow({ n, title, meta, thumb, onClick, dim }: { n: number; title: string; meta: string; thumb?: Find | null; onClick: () => void; dim?: boolean }) {
  return (
    <li className="border-b">
      <button onClick={onClick} className={cn('flex w-full items-center gap-4 px-5 py-4 text-left', dim && 'opacity-45')}>
        <Num n={n} className="w-11 text-[30px]" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] leading-snug font-semibold">{title}</span>
          <span className="mt-0.5 block text-[12.5px] text-muted-foreground tabular">{meta}</span>
        </span>
        {thumb !== undefined && (thumb ? <FindPhoto f={thumb} className="size-14 shrink-0" /> : <span className="size-14 shrink-0 bg-sunken" />)}
      </button>
    </li>
  )
}

export function SeriesPanel({ id, z }: { id: string; z: number }) {
  const { close, open, finds, notify } = useApp()
  const se = SERIES.find((x) => x.id === id)
  if (!se) return null
  const latest = STORIES.find((x) => x.id === se.eps[0].storyId)
  const coverFinds = (latest?.findIds ?? []).map((fid) => finds.find((f) => f.id === fid)).filter(Boolean) as Find[]
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto pb-12">
        <SeriesHero onBack={close} kicker={`SERIES · ${se.by}`} title={se.title} meta={`총 ${se.eps.length}화 · 매주 업데이트`}>
          {coverFinds.length ? <Collage finds={coverFinds} /> : <ReceiptArt />}
        </SeriesHero>
        <p className="px-5 pt-2 text-[14.5px] leading-relaxed text-ink-2">{se.desc}</p>
        <div className="mx-5 mt-6 h-[1.5px] bg-ink" />
        <ol>
          {se.eps.map((e) => {
            const st = STORIES.find((x) => x.id === e.storyId)
            const thumb = st ? (finds.find((f) => f.id === st.findIds[0]) ?? null) : null
            return <EpRow key={e.ep} n={e.ep} title={e.title} meta={`${e.date}${st ? '' : ' · 준비 중'}`} thumb={thumb} dim={!st} onClick={() => (st ? open({ type: 'story', id: st.id }) : notify('다음 주에 공개돼요'))} />
          })}
        </ol>
      </div>
    </Panel>
  )
}

/* ---------- 여행자 연재 (브런치북) ---------- */

export function TravelerSeriesPanel({ id, z }: { id: string; z: number }) {
  const { close, open, finds, notify, tSeries } = useApp()
  const [alarm, setAlarm] = useState(false)
  const ts = tSeries.find((x) => x.id === id)
  if (!ts) return null
  const first = ts.eps.find((e) => e.findId)
  const total = ts.eps.reduce((a, e) => a + (e.spent ?? 0), 0)
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto pb-12">
        <SeriesHero
          onBack={close}
          kicker="TRAVELER SERIES"
          title={ts.title}
          meta={
            <button onClick={() => open({ type: 'author', name: ts.author })} className="flex items-center gap-1.5 hover:text-ink">
              <Avatar name={ts.author} /> {ts.author} · {ts.eps.length}화 · 구독자 {ts.subs}
            </button>
          }
        >
          <SeriesCover ts={ts} />
        </SeriesHero>
        <div className="px-5 pt-2">
          {ts.desc && <p className="text-[14.5px] leading-relaxed text-ink-2">{ts.desc}</p>}
          {total > 0 && <p className="mt-2 text-[12.5px] text-muted-foreground tabular">지금까지 쓴 돈 {yen(total)}</p>}
          <div className="mt-5 flex gap-2">
            <Button size="lg" className="flex-1" disabled={!first} onClick={() => first?.findId && open({ type: 'find', id: first.findId })}>
              1화부터 읽기
            </Button>
            <Button
              size="lg"
              variant="outline"
              aria-pressed={alarm}
              onClick={() => {
                setAlarm(!alarm)
                notify(alarm ? '새 회차 알림을 껐어요' : '새 회차가 올라오면 알려 드릴게요')
              }}
            >
              {alarm ? <BellRing className="size-5" /> : <Bell className="size-5" />}
            </Button>
          </div>
        </div>
        <div className="mx-5 mt-7 h-[1.5px] bg-ink" />
        <ol>
          {ts.eps.map((e, i) => (
            <EpRow
              key={i}
              n={i + 1}
              title={e.title}
              meta={[e.spent ? yen(e.spent) : null, e.stores ? `${e.stores}곳` : null].filter(Boolean).join(' · ') || '기록'}
              thumb={e.findId ? (finds.find((f) => f.id === e.findId) ?? null) : null}
              onClick={() => (e.findId ? open({ type: 'find', id: e.findId }) : notify('예시 회차예요'))}
            />
          ))}
          {ts.ongoing && (
            <li className="flex items-center gap-4 px-5 py-4 text-muted-foreground">
              <Num n={ts.eps.length + 1} className="w-11 text-[30px] text-faint" />
              <span className="text-[13.5px]">다음 화 준비 중</span>
            </li>
          )}
        </ol>
      </div>
    </Panel>
  )
}

/* ---------- 여행자 프로필 (브런치 작가 페이지) ---------- */

export function AuthorPanel({ name, z }: { name: string; z: number }) {
  const { close, open, finds, tSeries, following, toggleFollow } = useApp()
  const [tab, setTab] = useState<'series' | 'finds' | 'about'>('series')
  const a = AUTHORS[name] ?? { name, bio: '여행자', subs: 0, cities: [] }
  const series = tSeries.filter((x) => x.author === name)
  const posts = finds.filter((f) => f.author === name)
  const me = name === '수빈'
  const subbed = following.has(name)
  return (
    <Panel onClose={close} z={z}>
      <div className="flex-1 overflow-y-auto pb-12">
        <div className="px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <IconBtn label="뒤로" onClick={close} className="shadow-none">
            <ArrowLeft className="size-5" />
          </IconBtn>
        </div>
        <div className="px-5 pt-4 text-center">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-sunken text-[26px] font-semibold">{name.slice(0, 1)}</span>
          <h1 className="mt-3 text-[22px] font-bold tracking-tight">{name}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{a.bio}</p>
          <div className="mt-4 flex justify-center gap-8">
            {[
              [a.subs + (subbed && !me ? 1 : 0), '구독자'],
              [posts.length, '발견'],
              [a.cities.length, '다녀온 도시'],
            ].map(([n, l]) => (
              <div key={l as string}>
                <p className="text-[18px] font-semibold tabular">{n}</p>
                <p className="text-[12px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          {!me && (
            <Button size="lg" variant={subbed ? 'outline' : 'default'} className="mt-5 w-[200px] rounded-full" onClick={() => toggleFollow(name)}>
              {subbed ? '구독 중' : '구독하기'}
            </Button>
          )}
        </div>
        <div className="mt-7 flex gap-6 border-b px-5">
          {([['series', `연재 ${series.length}`], ['finds', `발견 ${posts.length}`], ['about', '소개']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn('-mb-px border-b-2 pb-3 text-[14.5px] font-semibold', tab === k ? 'border-ink text-ink' : 'border-transparent text-faint')}>
              {l}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pt-4">
            {tab === 'series' &&
              (series.length ? (
                <ul className="divide-y">
                  {series.map((ts) => (
                    <li key={ts.id}>
                      <button onClick={() => open({ type: 'tseries', id: ts.id })} className="flex w-full gap-4 py-4 text-left">
                        <div className="relative h-[104px] w-[78px] shrink-0 overflow-hidden bg-sunken">
                          <SeriesCover ts={ts} />
                        </div>
                        <span className="min-w-0 flex-1 pt-1">
                          <span className="block text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">TRAVELER SERIES · {ts.eps.length}화</span>
                          <span className="mt-1 block text-[16px] font-semibold tracking-tight">{ts.title}</span>
                          <span className="mt-1 line-clamp-2 block text-[13px] text-muted-foreground">{ts.desc || (ts.ongoing ? '연재 중' : '')}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-12 text-center text-[14px] text-muted-foreground">{me ? '글쓰기에서 첫 연재를 시작해 보세요' : '아직 연재가 없어요'}</p>
              ))}
            {tab === 'finds' && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-6">
                {posts.map((f) => (
                  <FindTile key={f.id} f={f} />
                ))}
              </div>
            )}
            {tab === 'about' && (
              <div className="py-2">
                <p className="text-[15px] leading-relaxed text-ink-2">{a.bio}</p>
                <p className="mt-6 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">CITIES</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.cities.map((c) => (
                    <span key={c} className="rounded-full border px-3 py-1 text-[13px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Panel>
  )
}

/* ---------- article (29CM 에디토리얼) ---------- */

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
    if (el && t) el.scrollTo({ top: t.offsetTop - 50, behavior: 'smooth' })
  }
  const toMap = (f: Find) => {
    setMapFocus(`f:${f.id}`)
    closeAll()
    setTab('map')
  }
  return (
    <Panel onClose={close} z={z} wide>
      <div ref={scroller} className="relative flex-1 overflow-y-auto bg-white pb-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink lg:aspect-[16/10]">
          <Collage finds={list} dark />
          <div className="absolute top-0 left-0 px-4 pt-[max(12px,env(safe-area-inset-top))]">
            <IconBtn label="뒤로" onClick={close} className="border-white/20 bg-black/30 text-white">
              <ArrowLeft className="size-5" />
            </IconBtn>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-6 pt-28 pb-7 text-white">
            {se && (
              <button onClick={() => open({ type: 'series', id: se.id })} className="text-[11px] font-semibold tracking-[0.18em] text-white/70 hover:text-white">
                {se.title} · EP.{String(s.ep).padStart(2, '0')}
              </button>
            )}
            <h1 className="mt-2 text-[30px] leading-[1.15] font-bold tracking-[-0.03em] text-balance">{s.title}</h1>
          </div>
        </div>
        <div className="mx-auto max-w-[620px] px-6 pt-5">
          <p className="text-[15px] leading-relaxed text-ink-2">{s.sub}</p>
          <p className="mt-2 text-[12.5px] text-muted-foreground">글 Packit 에디터 · 사진 여행자 {list.length}명</p>
        </div>

        <nav className="sticky top-0 z-10 mt-5 border-y bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[620px] gap-6 px-6">
            {([['story', '이야기'], ['items', `발견템 ${list.length}`], ['map', '지도']] as const).map(([k, l]) => (
              <button key={k} onClick={() => jump(k)} className={cn('-mb-px border-b-2 py-3.5 text-[14px] font-semibold transition', tab === k ? 'border-ink text-ink' : 'border-transparent text-faint')}>
                {l}
              </button>
            ))}
          </div>
        </nav>

        <article className="mx-auto max-w-[620px] px-6">
          <div ref={refs.story} className="pt-8">
            <p className="text-[16.5px] leading-[1.85] text-ink-2">
              <span className="float-left mt-1 mr-2.5 text-[54px] leading-[0.85] font-bold tracking-tight text-ink">{s.intro.slice(0, 1)}</span>
              {s.intro.slice(1)}
            </p>
          </div>
          <div ref={refs.items}>
            {list.map((f, i) => {
              const saved = savedFind(f.id)
              return (
                <section key={f.id} className="mt-14">
                  <Num n={i + 1} className="text-[48px]" />
                  <div className="mt-3 h-[1.5px] bg-ink" />
                  <h2 className="mt-4 text-[22px] leading-tight font-bold tracking-[-0.02em]">{f.title}</h2>
                  <button onClick={() => open({ type: 'find', id: f.id })} className="mt-5 -mx-6 block w-[calc(100%+48px)] lg:mx-0 lg:w-full">
                    <FindPhoto f={f} className="aspect-[4/5] w-full lg:aspect-[4/3]" />
                  </button>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    {f.place} · {f.area} · 사진{' '}
                    <button onClick={() => open({ type: 'author', name: f.author })} className="underline underline-offset-2">
                      {f.author}
                    </button>
                  </p>
                  <p className="mt-5 text-[16px] leading-[1.85] text-ink-2">{f.story}</p>
                  <div className="mt-6 flex items-center gap-3 border p-2.5">
                    <ProductArt art={f.art} tone="neutral" className="size-14 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{f.title}</span>
                      <span className="mt-0.5 block text-[12.5px] text-muted-foreground tabular">
                        {f.price != null ? `${yen(f.price)} · 발견 당시` : '가격 정보 없음'}
                      </span>
                    </span>
                    <button onClick={() => toMap(f)} aria-label="지도에서 보기" className="grid size-10 place-items-center border hover:bg-accent">
                      <MapPin className="size-4" />
                    </button>
                    <button
                      onClick={() => notify(toggleSaveFind(f) ? '내 여행에 저장했어요' : '저장을 취소했어요')}
                      aria-pressed={saved}
                      className={cn('flex h-10 items-center gap-1 border px-3 text-[13px] font-semibold', saved ? 'border-ink bg-ink text-white' : 'hover:bg-accent')}
                    >
                      {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />} {saved ? '저장됨' : '저장'}
                    </button>
                  </div>
                </section>
              )
            })}
          </div>

          <div ref={refs.map} className="mt-16">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">MAP</p>
            <div className="mt-2 h-[1.5px] bg-ink" />
            <h2 className="mt-4 text-[22px] font-bold tracking-[-0.02em]">한 번에 돌아보기</h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">번호를 누르면 지도 탭에서 위치를 보여 줘요</p>
            <div className="relative mt-4 overflow-hidden bg-[#EDEDED]">
              <div className="relative aspect-[1200/1000] w-full">
                <ShibuyaMap />
                {list.map((f, i) => (
                  <button key={f.id} onClick={() => toMap(f)} aria-label={f.title} className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white ring-[3px] ring-white tabular" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <ol className="mt-2 divide-y">
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

