import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, Check, ChevronLeft, ChevronRight, MapPin, Search, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { CityArt } from '@/components/art/Scenes'
import { Suitcase } from '@/components/art/Suitcase'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ko } from 'react-day-picker/locale'
import type { DateRange } from 'react-day-picker'
import { Input } from '@/components/ui/input'
import { Chip } from '@/components/ui/primitives'
import { CITIES, REGIONS, SUITCASE_COLORS } from '@/lib/data'
import { useApp } from '@/lib/store'
import type { SuitcaseModel } from '@/lib/types'
import { cn, TODAY } from '@/lib/utils'

const MODELS: { id: SuitcaseModel; name: string }[] = [
  { id: 'ribbed', name: '알루미늄 라인' },
  { id: 'classic', name: '클래식 하드' },
  { id: 'soft', name: '포켓 캐리어' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function CreateTrip() {
  const { addTrip, close, setTab, notify } = useApp()
  const [step, setStep] = useState(0)
  const [region, setRegion] = useState('전체')
  const [q, setQ] = useState('')
  const [cityId, setCityId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [range, setRange] = useState<{ start?: string; end?: string }>({})
  const [calOpen, setCalOpen] = useState(false)
  const [budget, setBudget] = useState('')
  const [model, setModel] = useState<SuitcaseModel>('ribbed')
  const [color, setColor] = useState(SUITCASE_COLORS[0].value)

  const city = CITIES.find((c) => c.id === cityId)
  const cities = CITIES.filter((c) => (region === '전체' || c.region === region) && (c.name.includes(q) || c.sub.includes(q)))

  const canNext = step === 0 ? !!city : step === 1 ? true : true
  const finish = () => {
    if (!city) return
    addTrip({
      name: name.trim() || `${city.name} 쇼핑 여행`,
      city: city.name,
      start: range.start ?? '2026-12-10',
      end: range.end ?? range.start ?? '2026-12-14',
      budget: Number(budget.replace(/\D/g, '')) || 0,
      suitcase: { model, color },
    })
    setTab('home')
    close()
    notify('새 여행이 만들어졌어요')
  }

  return (
    <motion.div className="fixed inset-0 z-[55] overflow-y-auto bg-ground" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-5 pt-[max(16px,env(safe-area-inset-top))] pb-6 lg:pt-10">
        <header className="flex h-12 items-center justify-between">
          <button onClick={() => (step ? setStep(step - 1) : close())} aria-label={step ? '이전' : '닫기'} className="-ml-2 grid size-11 place-items-center rounded-full hover:bg-accent">
            {step ? <ChevronLeft className="size-6" /> : <X className="size-6" />}
          </button>
          <div className="flex items-center gap-1.5" aria-label={`${step + 1} / 3 단계`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-ink' : i < step ? 'w-1.5 bg-ink' : 'w-1.5 bg-line')} />
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="flex flex-1 flex-col">
            {step === 0 && (
              <>
                <h1 className="display mt-4 text-[28px]">어디로 떠나시나요?</h1>
                <label className="mt-5 flex h-11 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                  <Search className="size-4 text-muted-foreground" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="여행지를 검색해 보세요" className="flex-1 bg-transparent outline-none placeholder:text-faint" />
                </label>
                <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
                  {REGIONS.map((r) => (
                    <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
                      {r}
                    </Chip>
                  ))}
                </div>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {cities.map((c) => {
                    const on = c.id === cityId
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => setCityId(c.id)}
                          className={cn('flex w-full items-center gap-4 rounded-xl border bg-card shadow-xs p-3 text-left transition', on ? 'ring-2 ring-ink' : 'border hover:ring-faint')}
                        >
                          <CityArt hue={c.hue} sky={c.sky} className="h-16 w-20 shrink-0" />
                          <span className="flex-1">
                            <span className="block text-[16px] font-semibold">{c.name}</span>
                            <span className="mt-0.5 block text-[13px] text-muted-foreground">{c.sub}</span>
                          </span>
                          <span className={cn('mr-1 grid size-6 place-items-center rounded-full', on ? 'bg-ink text-white' : 'ring-2 ring-line')}>{on && <Check className="size-4" strokeWidth={3} />}</span>
                        </button>
                      </li>
                    )
                  })}
                  {!cities.length && <li className="py-10 text-center text-[14px] text-muted-foreground">검색 결과가 없어요</li>}
                </ul>
              </>
            )}

            {step === 1 && city && (
              <>
                <h1 className="display mt-4 text-[28px]">여행 정보를 알려주세요</h1>
                <div className="mt-6 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 border">
                  <MapPin className="size-5 text-brand" />
                  <span className="flex-1 font-semibold">{city.name}</span>
                  <button onClick={() => setStep(0)} className="text-[13px] font-semibold text-muted-foreground underline-offset-2 hover:underline">
                    변경
                  </button>
                </div>
                <Field label="여행 이름">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`예: ${city.name} 쇼핑 여행`} className="h-11 bg-background text-[15px]" />
                </Field>
                <Field label="여행 일정" hint="아직 미정이어도 괜찮아요">
                  <button onClick={() => setCalOpen((s) => !s)} className="flex h-11 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left shadow-xs hover:bg-accent">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className={cn('flex-1 tabular', !range.start && 'text-faint')}>
                      {range.start ? `${range.start.replaceAll('-', '.')}${range.end ? ` - ${range.end.slice(5).replace('-', '.')}` : ''}` : '떠나는 날짜를 골라 주세요'}
                    </span>
                    <ChevronRight className={cn('size-4 text-muted-foreground transition', calOpen && 'rotate-90')} />
                  </button>
                  <AnimatePresence>
                    {calOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <RangeCalendar value={range} onChange={setRange} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Field>
                <Field label="쇼핑 예산" hint="선택">
                  <div className="flex h-11 items-center rounded-md border border-input bg-background px-3 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                    <input
                      inputMode="numeric"
                      value={budget}
                      onChange={(e) => {
                        const n = e.target.value.replace(/\D/g, '')
                        setBudget(n ? Number(n).toLocaleString('ko-KR') : '')
                      }}
                      placeholder="0"
                      className="flex-1 bg-transparent tabular outline-none placeholder:text-faint"
                    />
                    <span className="text-muted-foreground">원</span>
                    {budget && (
                      <button onClick={() => setBudget('')} aria-label="지우기" className="ml-2 grid size-6 place-items-center rounded-full bg-sunken">
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    {[300000, 500000, 1000000].map((v) => (
                      <Chip key={v} onClick={() => setBudget(v.toLocaleString('ko-KR'))} className="h-8 text-[12.5px]">
                        +{v / 10000}만원
                      </Chip>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {step === 2 && <SuitcasePicker model={model} setModel={setModel} color={color} setColor={setColor} />}
          </motion.div>
        </AnimatePresence>

        <div className="sticky bottom-0 mt-6 bg-gradient-to-t from-ground from-70% to-transparent pt-4 pb-[env(safe-area-inset-bottom)]">
          <Button size="lg" className="w-full" disabled={!canNext} onClick={() => (step < 2 ? setStep(step + 1) : finish())}>
            {step === 0 ? '다음' : step === 1 ? '다음' : '이 캐리어로 시작하기'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[14px] font-semibold">{label}</span>
        {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function RangeCalendar({ value, onChange }: { value: { start?: string; end?: string }; onChange: (v: { start?: string; end?: string }) => void }) {
  const toDate = (v?: string) => (v ? new Date(`${v}T00:00:00`) : undefined)
  const selected: DateRange | undefined = value.start ? { from: toDate(value.start), to: toDate(value.end) } : undefined
  return (
    <div className="mt-2 flex justify-center rounded-xl border bg-card p-2 shadow-xs">
      <Calendar
        mode="range"
        locale={ko}
        defaultMonth={toDate(value.start) ?? new Date(2026, 11, 1)}
        selected={selected}
        onSelect={(r) => onChange({ start: r?.from ? iso(r.from) : undefined, end: r?.to && r.from && iso(r.to) !== iso(r.from) ? iso(r.to) : undefined })}
        disabled={{ before: TODAY }}
        className="w-full [--cell-size:--spacing(10)]"
        classNames={{ months: 'relative flex w-full flex-col', month: 'flex w-full flex-col gap-3' }}
      />
    </div>
  )
}

function SuitcasePicker({ model, setModel, color, setColor }: { model: SuitcaseModel; setModel: (m: SuitcaseModel) => void; color: string; setColor: (c: string) => void }) {
  const idx = MODELS.findIndex((m) => m.id === model)
  const scroller = useRef<HTMLDivElement>(null)
  const go = (i: number) => {
    const n = (i + MODELS.length) % MODELS.length
    setModel(MODELS[n].id)
    scroller.current?.children[n]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
  return (
    <div
      className="flex flex-1 flex-col"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(idx - 1)
        if (e.key === 'ArrowRight') go(idx + 1)
      }}
    >
      <h1 className="display mt-4 text-[28px] text-balance">이번 여행에 어울리는 캐리어를 골라 보세요</h1>
      <div className="relative mt-6 flex flex-1 items-center">
        <button aria-label="이전 캐리어" onClick={() => go(idx - 1)} className="absolute left-0 z-10 grid size-10 place-items-center rounded-full bg-surface shadow-xs">
          <ChevronLeft className="size-5" />
        </button>
        <div
          ref={scroller}
          className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget
            const i = Math.round(el.scrollLeft / el.clientWidth)
            if (MODELS[i] && MODELS[i].id !== model) setModel(MODELS[i].id)
          }}
        >
          {MODELS.map((m) => (
            <div key={m.id} className="flex w-full shrink-0 snap-center flex-col items-center">
              <motion.div animate={{ scale: m.id === model ? 1 : 0.9 }} className="w-[52%] max-w-[230px]">
                <Suitcase color={color} model={m.id} className="w-full" id={`pick-${m.id}`} />
              </motion.div>
              <p className="mt-4 text-[15px] font-semibold">{m.name}</p>
            </div>
          ))}
        </div>
        <button aria-label="다음 캐리어" onClick={() => go(idx + 1)} className="absolute right-0 z-10 grid size-10 place-items-center rounded-full bg-surface shadow-xs">
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="mt-6">
        <p className="mb-3 text-[14px] font-semibold">캐리어 색상</p>
        <div className="flex gap-3">
          {SUITCASE_COLORS.map((c) => (
            <button
              key={c.id}
              aria-label={c.name}
              aria-pressed={c.value === color}
              onClick={() => setColor(c.value)}
              className={cn('size-11 rounded-full ring-offset-2 ring-offset-ground transition', c.value === color ? 'ring-2 ring-ink' : 'border')}
              style={{ background: c.value }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
