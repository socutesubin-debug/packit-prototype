import { motion } from 'motion/react'
import { ArrowLeft, ArrowUpRight, Bookmark, BookmarkCheck, ChevronRight, Flag, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Chip, IconBtn, Panel } from '@/components/ui/primitives'
import { COLLECTIONS, STORIES } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { Find } from '@/lib/types'
import { cn, yen } from '@/lib/utils'
import { FindPhoto } from './Finds'

const when = (d: number) => (d === 0 ? '오늘' : d === 1 ? '어제' : d < 7 ? `${d}일 전` : `${Math.round(d / 7)}주 전`)

function Avatar({ name, dark }: { name: string; dark?: boolean }) {
  return <span className={cn('grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold', dark ? 'bg-white/15 text-white' : 'bg-sunken text-ink-2')}>{name.slice(0, 1)}</span>
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

export function Magazine() {
  const { finds, open } = useApp()
  const [city, setCity] = useState<'도쿄' | '오사카' | '전체'>('도쿄')
  const pool = finds.filter((f) => !f.mine && (city === '전체' || f.city === city))
  const byId = (id: string) => finds.find((f) => f.id === id)
  const stories = city === '오사카' ? [] : STORIES.map((s) => ({ ...s, finds: s.findIds.map(byId).filter(Boolean) as Find[] }))
  const top = [...pool].sort((a, b) => b.saves - a.saves).slice(0, 5)
  const fresh = [...pool].sort((a, b) => a.daysAgo - b.daysAgo)
  const [cover, ...more] = stories

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-[max(20px,env(safe-area-inset-top))] pb-32 lg:px-10 lg:pt-12">
      <header>
        <p className="text-[12.5px] font-semibold text-muted">Packit 매거진 · 11월 넷째 주</p>
        <h1 className="mt-2 text-[30px] leading-[1.12] font-bold tracking-tight lg:text-[40px]">
          여기서만
          <br />살 수 있는 것들
        </h1>
        <p className="mt-2 text-[14.5px] text-muted">다녀온 여행자들이 직접 찾고 올린 물건을 모았어요</p>
      </header>
      <div className="mt-5 flex gap-1.5">
        {(['도쿄', '오사카', '전체'] as const).map((c) => (
          <Chip key={c} active={city === c} onClick={() => setCity(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {cover && (
        <section className="mt-6 grid gap-2.5 lg:grid-cols-3 lg:gap-3">
          <button onClick={() => open({ type: 'story', id: cover.id })} className="group relative flex flex-col overflow-hidden rounded-[28px] bg-ink text-left text-white lg:col-span-2">
            <div className="relative aspect-[5/4] w-full lg:aspect-auto lg:h-[360px]">
              <Collage finds={cover.finds} dark />
            </div>
            <div className="p-5 pt-0 lg:p-7 lg:pt-0">
              <span className="inline-block rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold text-ink">{cover.kicker}</span>
              <h2 className="mt-3 text-[24px] leading-[1.2] font-bold tracking-tight text-balance lg:text-[30px]">{cover.title}</h2>
              <p className="mt-1.5 text-[14px] text-white/60">{cover.sub}</p>
              <p className="mt-4 flex items-center gap-1 text-[13px] font-semibold">
                발견 {cover.finds.length}개 읽기 <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </p>
            </div>
          </button>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1 lg:gap-3">
            {more.map((s) => (
              <button key={s.id} onClick={() => open({ type: 'story', id: s.id })} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface text-left">
                <div className="relative aspect-[4/3] w-full bg-sunken lg:aspect-[16/9]">
                  <Collage finds={s.finds} />
                </div>
                <div className="p-3.5 lg:p-4">
                  <p className="text-[11.5px] font-semibold text-muted">{s.kicker}</p>
                  <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug font-semibold">{s.title}</h3>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        {top.length > 0 && (
          <section>
            <h2 className="text-[19px] font-bold tracking-tight">이번 주 많이 저장한 발견</h2>
            <ol className="mt-3 divide-y divide-line">
              {top.map((f, i) => (
                <li key={f.id}>
                  <button onClick={() => open({ type: 'find', id: f.id })} className="flex w-full items-center gap-4 py-3.5 text-left">
                    <span className="w-7 text-[28px] leading-none font-light tabular text-ink">{i + 1}</span>
                    <FindPhoto f={f} className="size-14 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{f.title}</span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                        {f.area} · {f.saves}명 저장
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-faint" />
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <h2 className="text-[19px] font-bold tracking-tight">테마로 보기</h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {COLLECTIONS.map((c) => {
              const list = pool.filter(c.filter)
              return (
                <button key={c.id} onClick={() => open({ type: 'collection', id: c.id })} className="flex items-center gap-3 rounded-[20px] bg-surface p-3 text-left">
                  <div className="relative h-12 w-14 shrink-0">
                    {list.slice(0, 2).map((f, i) => (
                      <div key={f.id} className="absolute top-0 w-10" style={{ left: i * 14, rotate: `${(i ? 8 : -6)}deg` }}>
                        <FindPhoto f={f} className="aspect-square w-full rounded-lg ring-2 ring-white" />
                      </div>
                    ))}
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-semibold">{c.title}</span>
                    <span className="text-[12.5px] text-muted tabular">{list.length}개</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-[19px] font-bold tracking-tight">새로 올라온 발견</h2>
          <span className="text-[12.5px] text-muted tabular">{fresh.length}개</span>
        </div>
        <div className="mt-3 columns-2 gap-2.5 sm:columns-3 lg:columns-4 lg:gap-3">
          {fresh.map((f, i) => (
            <PostCard key={f.id} f={f} tall={i % 3 === 0} />
          ))}
        </div>
      </section>

      <button onClick={() => open({ type: 'post' })} className="mt-6 flex w-full items-center gap-4 rounded-[28px] bg-ink p-5 text-left text-white">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10">
          <Flag className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block text-[16px] font-semibold">당신이 찾은 물건도 알려 주세요</span>
          <span className="mt-0.5 block text-[13px] text-white/60">올리면 +50P, 누가 저장할 때마다 +10P</span>
        </span>
        <ChevronRight className="size-5 text-white/60" />
      </button>
      <p className="mt-3 text-center text-[11.5px] text-faint">매거진의 발견과 기사는 예시 콘텐츠예요</p>
    </div>
  )
}

function PostCard({ f, tall }: { f: Find; tall?: boolean }) {
  const { open } = useApp()
  return (
    <button onClick={() => open({ type: 'find', id: f.id })} className="mb-2.5 block w-full break-inside-avoid rounded-[var(--radius-card)] bg-surface p-2.5 text-left lg:mb-3">
      <FindPhoto f={f} className={cn('w-full rounded-[16px]', tall ? 'aspect-[4/5]' : 'aspect-square')} />
      <div className="px-1 pt-2.5 pb-1">
        <p className="line-clamp-2 text-[14px] leading-[1.3] font-semibold">{f.title}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
          <Avatar name={f.author} /> <span className="truncate">{f.author}</span> · {when(f.daysAgo)}
        </p>
        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-faint">
          <Bookmark className="size-3" /> {f.saves}
        </p>
      </div>
    </button>
  )
}

/* ---------- article ---------- */

export function StoryArticle({ id, z }: { id: string; z: number }) {
  const { close, closeAll, finds, savedFind, toggleSaveFind, notify, setMapFocus, setTab, open } = useApp()
  const s = STORIES.find((x) => x.id === id)
  if (!s) return null
  const list = s.findIds.map((fid) => finds.find((f) => f.id === fid)).filter(Boolean) as Find[]
  return (
    <Panel onClose={close} z={z} wide>
      <div className="flex-1 overflow-y-auto bg-white pb-16">
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
            <span className="inline-block rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold text-ink">{s.kicker}</span>
            <h1 className="mt-3 text-[30px] leading-[1.15] font-bold tracking-tight text-balance">{s.title}</h1>
            <p className="mt-2 text-[15px] text-white/60">{s.sub}</p>
            <p className="mt-5 text-[12.5px] text-white/50">Packit 에디터 · 여행자 발견 {list.length}개</p>
          </div>
        </div>
        <article className="mx-auto max-w-[620px] px-6 pt-8">
          <p className="text-[16.5px] leading-[1.8] text-ink-2">{s.intro}</p>
          {list.map((f, i) => {
            const saved = savedFind(f.id)
            return (
              <section key={f.id} className="mt-12 border-t border-ink pt-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-[40px] leading-none font-light tabular">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="text-[21px] leading-tight font-bold tracking-tight">{f.title}</h2>
                </div>
                <button onClick={() => open({ type: 'find', id: f.id })} className="mt-4 block w-full">
                  <FindPhoto f={f} className="aspect-[4/3] w-full rounded-[18px]" />
                </button>
                <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
                  <MapPin className="size-3.5" /> {f.place} · {f.area}
                  {f.price != null && <span className="ml-auto font-semibold text-ink tabular">{yen(f.price)}</span>}
                </p>
                <p className="mt-3 text-[15.5px] leading-[1.75] text-ink-2">“{f.story}”</p>
                <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-muted">
                  <Avatar name={f.author} /> {f.author}님의 발견 · {f.saves}명 저장
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant={saved ? 'secondary' : 'primary'}
                    className="flex-1"
                    onClick={() => notify(toggleSaveFind(f) ? '내 여행에 저장했어요' : '저장을 취소했어요')}
                  >
                    {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />} {saved ? '저장됨' : '내 여행에 저장'}
                  </Button>
                  <Button
                    variant="soft"
                    onClick={() => {
                      setMapFocus(`f:${f.id}`)
                      closeAll()
                      setTab('map')
                    }}
                  >
                    <MapPin className="size-4" /> 지도
                  </Button>
                </div>
              </section>
            )
          })}
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
        <p className="mt-4 text-[12.5px] font-semibold text-muted">테마</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight">{c.title}</h1>
        <p className="mt-1 text-[14px] text-muted tabular">발견 {list.length}개</p>
        <div className="mt-5 columns-2 gap-2.5">
          {list.map((f, i) => (
            <PostCard key={f.id} f={f} tall={i % 3 === 1} />
          ))}
        </div>
        {!list.length && <p className="py-16 text-center text-[14px] text-muted">아직 이 테마의 발견이 없어요</p>}
      </div>
    </Panel>
  )
}

