import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import carrierImg from '@/assets/onb/carrier.png'
import tokyoImg from '@/assets/onb/city-tokyo.jpg'
import { CityArt } from '@/components/art/Scenes'
import { CITIES, REGIONS, SUITCASE_COLORS } from '@/lib/data'
import { useApp } from '@/lib/store'
import { cn, TODAY } from '@/lib/utils'
import { PillButton } from './Login'

/*
 * 피그마 시안2 · 여행 생성 1~3 (480:3376 / 480:3377 / 480:3378)
 * 홀수 값은 전부 짝수로 맞춤: 이미지 92×75→92×76, 간격 3→4 · 9→8 · 17→16, 아이콘 19·21→20, 13px→14px
 */

const C = {
  bg: '#FAFAFA',
  ink: '#111111',
  btn: '#24222D',
  sub: '#666661',
  ter: '#737370',
  gray: '#737370',
  g3: '#C7C7CC',
  g4: '#949490',
  g5: '#E5E5EA',
  line: '#EDEDED',
}

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function CreateTrip({ first }: { first?: boolean }) {
  const { addTrip, close, setTab, notify } = useApp()
  const [step, setStep] = useState(0)
  const [region, setRegion] = useState('전체')
  const [q, setQ] = useState('')
  const [cityId, setCityId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [range, setRange] = useState<{ start?: string; end?: string }>({})
  const [budget, setBudget] = useState(100) // 만원
  const [colorIdx, setColorIdx] = useState(0)

  const city = CITIES.find((c) => c.id === cityId)
  const cities = CITIES.filter((c) => (region === '전체' || c.region === region) && (c.name.includes(q) || c.sub.includes(q)))
  const canNext = step === 0 ? !!city : true

  const finish = () => {
    if (!city) return
    addTrip({
      name: name.trim() || `${city.name} 쇼핑 여행`,
      city: city.name,
      start: range.start ?? '',
      end: range.end ?? range.start ?? '',
      budget: budget * 10000,
      suitcase: { model: 'ribbed', color: SUITCASE_COLORS[colorIdx].value },
    })
    setTab('home')
    close()
    notify('새 여행이 만들어졌어요')
  }
  const back = () => (step ? setStep(step - 1) : close())

  return (
    <motion.div className="pk fixed inset-0 z-[55] overflow-y-auto" style={{ background: C.bg }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col pt-[env(safe-area-inset-top)]">
        {/* 상단 60: 1단계(처음)는 제목 + 1/3, 그 외엔 뒤로 + n/3 */}
        <header className="flex h-[60px] shrink-0 items-center justify-between px-6">
          {step === 0 && first ? (
            <h1 className="t-h2">어디로 떠나시나요?</h1>
          ) : (
            <button onClick={back} aria-label={step ? '이전' : '닫기'} className="-ml-3 grid size-11 place-items-center">
              <ChevronLeft className="size-7" strokeWidth={1.6} />
            </button>
          )}
          <span className="t-label px-3" style={{ color: C.sub }}>
            {step + 1}/3
          </span>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="flex flex-1 flex-col">
            {step === 0 && (
              <StepCity first={first} q={q} setQ={setQ} region={region} setRegion={setRegion} cities={cities} cityId={cityId} setCityId={setCityId} />
            )}
            {step === 1 && city && <StepInfo city={city} onChangeCity={() => setStep(0)} name={name} setName={setName} range={range} setRange={setRange} budget={budget} setBudget={setBudget} />}
            {step === 2 && <StepCarrier idx={colorIdx} setIdx={setColorIdx} />}
          </motion.div>
        </AnimatePresence>

        {/* 하단 버튼: 좌우 20 · 아래 34(홈 인디케이터) */}
        <div className="sticky bottom-0 shrink-0 px-5 pt-4 pb-[max(34px,env(safe-area-inset-bottom))]" style={{ background: `linear-gradient(to top, ${C.bg} 76%, transparent)` }}>
          <PillButton disabled={!canNext} onClick={() => (step < 2 ? setStep(step + 1) : finish())} style={{ background: canNext ? C.btn : C.g3 }}>
            {step < 2 ? '다음' : '여행 생성'}
          </PillButton>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────── 1/3 여행지 선택 ───────── */

function StepCity({ first, q, setQ, region, setRegion, cities, cityId, setCityId }: { first?: boolean; q: string; setQ: (v: string) => void; region: string; setRegion: (v: string) => void; cities: typeof CITIES; cityId: string | null; setCityId: (v: string) => void }) {
  return (
    <div className="flex flex-1 flex-col">
      {!first && <h1 className="t-h2 px-6 pb-4">어디로 떠나시나요?</h1>}
      <div className="px-5">
        {/* 검색 h40 */}
        <label className="flex h-10 items-center gap-3 rounded-full bg-white px-4">
          <Search className="size-4 shrink-0" style={{ color: C.gray }} strokeWidth={2.2} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="여행지를 검색해보세요" className="t-label min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#737370]" />
        </label>
      </div>
      {/* 지역 칩: 오른쪽으로 흘러넘침 */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
        {REGIONS.map((r) => {
          const on = region === r
          return (
            <button key={r} onClick={() => setRegion(r)} aria-pressed={on} className="t-label h-9 shrink-0 rounded-full px-3 transition" style={on ? { background: C.btn, color: '#fff' } : { background: '#fff', color: C.gray }}>
              {r}
            </button>
          )
        })}
      </div>
      <ul className="mt-6 flex flex-col gap-4 px-5">
        {cities.map((c) => {
          const on = c.id === cityId
          return (
            <li key={c.id}>
              <button onClick={() => setCityId(c.id)} aria-pressed={on} className={cn('flex w-full items-center justify-between rounded-2xl border-b p-3 text-left transition', on && 'bg-white')} style={{ borderColor: C.line }}>
                <span className="flex items-center gap-4">
                  {c.id === 'tokyo' ? (
                    <img src={tokyoImg} alt="" className="h-[76px] w-[92px] shrink-0 rounded-lg object-cover" />
                  ) : (
                    <CityArt hue={c.hue} sky={c.sky} className="h-[76px] w-[92px] shrink-0 rounded-lg" />
                  )}
                  <span className="flex flex-col gap-1">
                    <span className="t-body-l">{c.name}</span>
                    <span className="t-label" style={{ color: C.sub }}>
                      {c.sub}
                    </span>
                  </span>
                </span>
                <span className="grid size-6 shrink-0 place-items-center rounded-full transition" style={{ background: on ? C.btn : '#AEAEB2' }}>
                  {on && <Check className="size-4 text-white" strokeWidth={3} />}
                </span>
              </button>
            </li>
          )
        })}
        {!cities.length && (
          <li className="t-label py-10 text-center" style={{ color: C.gray }}>
            검색 결과가 없어요
          </li>
        )}
      </ul>
    </div>
  )
}

/* ───────── 2/3 일정 및 예산 ───────── */

function StepInfo({
  city,
  onChangeCity,
  name,
  setName,
  range,
  setRange,
  budget,
  setBudget,
}: {
  city: (typeof CITIES)[number]
  onChangeCity: () => void
  name: string
  setName: (v: string) => void
  range: { start?: string; end?: string }
  setRange: (v: { start?: string; end?: string }) => void
  budget: number
  setBudget: (v: number) => void
}) {
  const nights = range.start && range.end ? Math.round((+new Date(range.end) - +new Date(range.start)) / 864e5) : null
  return (
    <div className="flex flex-1 flex-col px-5">
      <h1 className="t-h3 px-5">여행 정보를 입력해주세요.</h1>

      {/* 여행지 h52 */}
      <div className="mt-4 flex h-[52px] items-center justify-between rounded-xl bg-white px-5">
        <span className="flex items-center gap-2">
          <MapPin className="size-5" strokeWidth={1.8} />
          <span className="t-body-l">{city.name}</span>
        </span>
        <button onClick={onChangeCity} className="t-label -mr-2 h-10 px-2">
          변경
        </button>
      </div>

      {/* 여행 이름 h52 */}
      <label className="mt-4 flex h-[52px] items-center rounded-xl bg-white px-5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`예: ${city.name} 쇼핑 왕창 하는 여행`} aria-label="여행 이름" className="t-body-l min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#737370]" />
      </label>

      {/* 여행 일정 */}
      <div className="flex h-[60px] items-end justify-between px-4 pb-3">
        <span className="t-body-m">여행 일정</span>
        <button onClick={() => setRange({})} className="t-label" style={{ color: range.start ? C.ink : C.sub }}>
          {range.start ? `${range.start.slice(5).replace('-', '.')}${range.end ? ` – ${range.end.slice(5).replace('-', '.')} · ${nights}박 ${(nights ?? 0) + 1}일` : ''}` : '아직 미정'}
        </button>
      </div>
      <RangeCalendar value={range} onChange={setRange} />

      {/* 쇼핑 예산 */}
      <div className="mt-6 flex items-center gap-1 px-4 pb-2">
        <span className="t-body-m">쇼핑예산</span>
        <span className="t-label" style={{ color: C.sub }}>
          {budget ? `${budget}만원` : '아직 미정'}
        </span>
      </div>
      <BudgetSlider value={budget} onChange={setBudget} />
      <div className="h-6" />
    </div>
  )
}

const WEEK = ['월', '화', '수', '목', '금', '토', '일']

function RangeCalendar({ value, onChange }: { value: { start?: string; end?: string }; onChange: (v: { start?: string; end?: string }) => void }) {
  const [month, setMonth] = useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))
  const today = iso(TODAY)
  const cells = useMemo(() => {
    const lead = (month.getDay() + 6) % 7 // 월요일 시작
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const out: (string | null)[] = Array(lead).fill(null)
    for (let d = 1; d <= days; d++) out.push(iso(new Date(month.getFullYear(), month.getMonth(), d)))
    while (out.length % 7) out.push(null)
    return out
  }, [month])
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
  const pick = (d: string) => {
    if (!value.start || value.end || d < value.start) onChange({ start: d })
    else if (d === value.start) onChange({})
    else onChange({ start: value.start, end: d })
  }
  const canPrev = month > new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-white py-2 shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
      <div className="flex w-full max-w-[354px] items-center justify-between px-2">
        <button aria-label="이전 달" disabled={!canPrev} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid size-8 place-items-center disabled:opacity-30">
          <ChevronLeft className="size-6" strokeWidth={1.8} />
        </button>
        <p className="t-body-l" style={{ color: '#131A29' }}>
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </p>
        <button aria-label="다음 달" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid size-8 place-items-center">
          <ChevronRight className="size-6" strokeWidth={1.8} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-x-2">
        {WEEK.map((w) => (
          <span key={w} className="t-body-l grid h-10 w-[38px] place-items-center" style={{ color: '#C4C4C4' }}>
            {w}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-[14px] pb-2">
        {weeks.map((wk, i) => (
          <div key={i} className="grid grid-cols-7 gap-x-2">
            {wk.map((d, j) => {
              if (!d) return <span key={j} className="h-10 w-[38px]" />
              const past = d < today
              const isEnd = d === value.start || d === value.end
              const inRange = !!value.start && !!value.end && d > value.start && d < value.end
              return (
                <button
                  key={j}
                  disabled={past}
                  onClick={() => pick(d)}
                  aria-pressed={isEnd}
                  aria-label={d}
                  className="t-body-l grid h-10 w-[38px] place-items-center rounded-lg transition"
                  style={isEnd ? { background: C.btn, color: '#fff' } : inRange ? { background: '#F2F2F4', color: C.ink } : { color: past ? C.g4 : C.sub }}
                >
                  {Number(d.slice(8))}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 0~50만원은 왼쪽 절반(5만원 단위), 50~300만원은 오른쪽 절반(10만원 단위) — 시안의 0 · 50 · 300 눈금 그대로 */
const toT = (v: number) => (v <= 50 ? (v / 50) * 0.5 : 0.5 + ((v - 50) / 250) * 0.5)
const toV = (t: number) => (t <= 0.5 ? Math.round((t / 0.5) * 10) * 5 : 50 + Math.round(((t - 0.5) / 0.5) * 25) * 10)

function BudgetSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState(false)
  const t = toT(value)
  const set = (clientX: number) => {
    const r = track.current?.getBoundingClientRect()
    if (!r) return
    onChange(toV(Math.min(1, Math.max(0, (clientX - r.left) / r.width))))
  }
  useEffect(() => {
    if (!drag) return
    const mv = (e: PointerEvent) => set(e.clientX)
    const up = () => setDrag(false)
    window.addEventListener('pointermove', mv)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', mv)
      window.removeEventListener('pointerup', up)
    }
  })
  return (
    <div className="px-5">
      {/* 말풍선 h24 */}
      <div className="relative h-7">
        <span className="t-cap2 absolute top-0 -translate-x-1/2 rounded-lg border px-2 py-1 whitespace-nowrap" style={{ left: `${t * 100}%`, color: C.gray, borderColor: C.g4, background: C.bg }}>
          {value}만원
        </span>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="쇼핑 예산"
        aria-valuemin={0}
        aria-valuemax={300}
        aria-valuenow={value}
        aria-valuetext={`${value}만원`}
        onPointerDown={(e) => {
          setDrag(true)
          set(e.clientX)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onChange(toV(Math.min(1, t + (t < 0.5 ? 0.05 : 0.02))))
          if (e.key === 'ArrowLeft') onChange(toV(Math.max(0, t - (t <= 0.5 ? 0.05 : 0.02))))
        }}
        className="relative h-5 cursor-pointer touch-none outline-none"
      >
        <span className="absolute inset-x-0 top-[6px] h-2 rounded-full" style={{ background: C.g5 }} />
        <span className="absolute top-[6px] left-0 h-2 rounded-full" style={{ width: `${t * 100}%`, background: C.gray }} />
        <span className="absolute top-0 -left-2.5 size-5 rounded-full" style={{ background: C.gray }} />
        <span className="absolute top-0 size-5 -translate-x-1/2 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.16)]" style={{ left: `${t * 100}%`, background: C.gray }} />
      </div>
      <div className="t-cap relative mt-1 h-4" style={{ color: C.sub }}>
        <span className="absolute left-0 -translate-x-1/2">0</span>
        <span className="absolute left-1/2 -translate-x-1/2">50</span>
        <span className="absolute right-0 translate-x-1/2">300</span>
      </div>
    </div>
  )
}

/* ───────── 3/3 캐리어 선택 ───────── */

function StepCarrier({ idx, setIdx }: { idx: number; setIdx: (i: number) => void }) {
  const scroller = useRef<HTMLDivElement>(null)
  const go = (i: number) => {
    setIdx(i)
    const el = scroller.current?.children[i] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="t-h3 px-10">
        이번 여행에 어울리는
        <br />
        캐리어를 선택해보세요!
      </h1>
      {/* 캐러셀: 266×392 · 옆 캐리어가 살짝 보이게 */}
      <div
        ref={scroller}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-2 overflow-x-auto px-[calc(50%-133px)]"
        onScroll={(e) => {
          const el = e.currentTarget
          const i = Math.round(el.scrollLeft / 274)
          if (i !== idx && SUITCASE_COLORS[i]) setIdx(i)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' && idx < SUITCASE_COLORS.length - 1) go(idx + 1)
          if (e.key === 'ArrowLeft' && idx > 0) go(idx - 1)
        }}
      >
        {SUITCASE_COLORS.map((c, i) => (
          <motion.button key={c.id} onClick={() => go(i)} aria-label={`${c.name} 캐리어`} aria-pressed={i === idx} animate={{ scale: i === idx ? 1 : 0.92, opacity: i === idx ? 1 : 0.8 }} className="h-[392px] w-[266px] shrink-0 snap-center">
            <TintedCarrier tint={c.tint} />
          </motion.button>
        ))}
      </div>
      <div className="mx-auto mt-6 w-[268px]">
        <p className="t-body-m">캐리어 색상</p>
        <div className="mt-2 flex gap-3">
          {SUITCASE_COLORS.map((c, i) => (
            <button key={c.id} aria-label={c.name} aria-pressed={i === idx} onClick={() => go(i)} className={cn('size-11 rounded-full border-2 transition', i === idx && 'ring-2 ring-[#24222D] ring-offset-2 ring-offset-[#FAFAFA]')} style={{ background: c.value, borderColor: '#B4B4B8' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** 흰 캐리어 사진 위에 색을 곱해서(멀티플라이) 색상별 캐리어를 만들어요 */
export function TintedCarrier({ tint, className }: { tint: string | null; className?: string }) {
  const mask = { WebkitMaskImage: `url(${carrierImg})`, maskImage: `url(${carrierImg})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' } as React.CSSProperties
  return (
    <span className={cn('relative block size-full', className)}>
      <img src={carrierImg} alt="" draggable={false} className="size-full object-contain select-none" />
      {tint && <span className="absolute inset-0" style={{ ...mask, background: tint, mixBlendMode: 'multiply' }} />}
    </span>
  )
}
