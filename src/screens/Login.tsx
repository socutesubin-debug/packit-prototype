import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import carrier from '@/assets/onb/3d/carrier.webp'
import cloud1 from '@/assets/onb/3d/cloud1.webp'
import cloud2 from '@/assets/onb/3d/cloud2.webp'
import cloud3 from '@/assets/onb/3d/cloud3.webp'
import cloud4 from '@/assets/onb/3d/cloud4.webp'
import plane from '@/assets/onb/3d/plane.webp'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * 로그인 · 브랜드 무대 (아트 디렉션 §5.6 예외)
 * 3D 캐리어가 겹겹이 흐르는 구름 위에 둥실 떠 있고, 비행기가 가끔 지나간다.
 * 하늘은 접속 시각에 따라 낮·노을·밤. 폰을 기울이거나 드래그하면 층마다 다르게 움직인다.
 * 3D 에셋: 히그스필드(GPT Image 2.6) 생성, 2배 크기 webp.
 */
type Sky = 'day' | 'sunset' | 'night'
const SKIES: Record<Sky, { bg: string; ink: string; sub: string; cloud: string }> = {
  day: { bg: 'linear-gradient(180deg,#B4AFF6 0%,#D6D3FB 46%,#F4F3FE 100%)', ink: '#24222D', sub: '#4A4766', cloud: 'none' },
  sunset: { bg: 'linear-gradient(180deg,#6F67E0 0%,#B79AE0 44%,#F6B7B4 78%,#FBD8C4 100%)', ink: '#FFFFFF', sub: '#FFFFFF', cloud: 'brightness(0.98) sepia(0.06) hue-rotate(-14deg)' },
  night: { bg: 'linear-gradient(180deg,#110F26 0%,#25215A 50%,#4A43B8 100%)', ink: '#FFFFFF', sub: '#D9D7FB', cloud: 'brightness(0.74) sepia(0.35) hue-rotate(208deg) saturate(1.8)' },
}
const skyByHour = (h: number): Sky => (h >= 6 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'sunset' : 'night')
const ORDER: Sky[] = ['day', 'sunset', 'night']

export function Login() {
  const { setAuthed, open } = useApp()
  const reduce = useReducedMotion() ?? false
  const [sky, setSky] = useState<Sky>(() => skyByHour(new Date().getHours()))
  const s = SKIES[sky]
  const start = () => {
    setAuthed(true)
    open({ type: 'create', first: true })
  }

  // 기울기·드래그 → -1~1
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const sx = useSpring(tx, { stiffness: 60, damping: 16 })
  const sy = useSpring(ty, { stiffness: 60, damping: 16 })
  useEffect(() => {
    if (reduce) return
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      tx.set(clamp(e.gamma / 30))
      ty.set(clamp((e.beta - 45) / 30))
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [reduce, tx, ty])
  const onPointer = (e: React.PointerEvent) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    tx.set(((e.clientX - r.left) / r.width) * 2 - 1)
    ty.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const reset = () => {
    tx.set(0)
    ty.set(0)
  }

  const stars = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 46, d: i % 3 === 0 ? 4 : 2, t: (i % 5) * 0.6 })), [])

  return (
    <div className="pk relative min-h-dvh overflow-hidden transition-[background] duration-700" style={{ background: s.bg }} onPointerMove={onPointer} onPointerLeave={reset}>
      {/* 밤: 별 */}
      {sky === 'night' &&
        stars.map((st, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.d, height: st.d }}
            animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: st.t }}
          />
        ))}

      <div className="absolute inset-x-0 top-0 mx-auto h-full max-w-[480px]">
        {/* 뒤 구름 */}
        <Layer depth={8} sx={sx} sy={sy} className="top-[36%]" style={{ opacity: 0.55, filter: s.cloud }}>
          <CloudBand src={cloud1} width={640} duration={110} reduce={reduce} />
        </Layer>
        <Layer depth={14} sx={sx} sy={sy} className="top-[50%]" style={{ opacity: 0.8, filter: s.cloud }}>
          <CloudBand src={cloud2} width={720} duration={80} reverse reduce={reduce} />
        </Layer>

        {/* 비행기: 가끔 지나감 */}
        {!reduce && (
          <Layer depth={10} sx={sx} sy={sy} className="top-[27%] w-full">
            <motion.img
              src={plane}
              alt=""
              className="absolute w-[120px]"
              initial={{ x: -160, y: 24, rotate: -6 }}
              animate={{ x: [-160, 520], y: [24, -12], rotate: [-6, -10] }}
              transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, repeatDelay: 6, delay: 1.2 }}
            />
          </Layer>
        )}

        {/* 캐리어 */}
        <Layer depth={22} sx={sx} sy={sy} className="inset-x-0 top-[34%] flex justify-center">
          <motion.img
            src={carrier}
            alt="Packit 캐리어"
            className="w-[200px] drop-shadow-[0_24px_32px_rgba(36,34,45,0.18)]"
            initial={{ y: 40, opacity: 0 }}
            animate={reduce ? { y: 0, opacity: 1 } : { y: [0, -12, 0], rotate: [-2, 2, -2], opacity: 1 }}
            transition={reduce ? { duration: 0.4 } : { y: { duration: 4.4, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 6.8, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6 } }}
          />
        </Layer>

        {/* 앞 구름 */}
        <Layer depth={30} sx={sx} sy={sy} className="top-[62%]" style={{ filter: s.cloud }}>
          <CloudBand src={cloud3} width={760} duration={52} reduce={reduce} />
        </Layer>
        <Layer depth={40} sx={sx} sy={sy} className="top-[72%]" style={{ filter: s.cloud }}>
          <CloudBand src={cloud4} width={820} duration={36} reverse reduce={reduce} />
        </Layer>
      </div>

      {/* 글자·버튼 */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pt-[env(safe-area-inset-top)] pb-[max(36px,env(safe-area-inset-bottom))]">
        <div className="flex h-16 items-center justify-end">
          <button onClick={() => setAuthed(true)} className="t-label h-10 rounded-full bg-white/70 px-4 text-[#24222D]">
            둘러보기
          </button>
        </div>
        <motion.div className="mt-8 text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          {/* 프로토타입 확인용: 로고를 누르면 낮 → 노을 → 밤 */}
          <button className="t-title font-bold tracking-[-0.03em]" style={{ color: s.sub }} onClick={() => setSky(ORDER[(ORDER.indexOf(sky) + 1) % 3])} aria-label={`하늘 바꾸기 (지금 ${sky})`}>
            Packit
          </button>
          <h1 className="mt-2 text-[32px] leading-[44px] font-bold tracking-[-0.03em]" style={{ color: s.ink }}>
            여행의 설렘까지
            <br />
            담아가요
          </h1>
        </motion.div>
        <motion.div className="mt-auto flex flex-col gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <PillButton onClick={start} className="bg-[#24222D]">
            애플로 시작하기
          </PillButton>
          <PillButton onClick={start} className="bg-[#FEE500] text-black/85">
            카카오톡으로 시작하기
          </PillButton>
        </motion.div>
      </div>
    </div>
  )
}

/** 기울기에 따라 깊이만큼 밀리는 층 */
function Layer({ depth, sx, sy, className, style, children }: { depth: number; sx: MotionValue<number>; sy: MotionValue<number>; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const x = useTransform(sx, (v) => -v * depth)
  const y = useTransform(sy, (v) => -v * depth * 0.5)
  return (
    <motion.div className={cn('pointer-events-none absolute', className)} style={{ x, y, ...style }}>
      {children}
    </motion.div>
  )
}

/** 끝없이 흐르는 구름 띠 (같은 그림 두 장을 이어 붙여 반복) */
function CloudBand({ src, width, duration, reverse, reduce }: { src: string; width: number; duration: number; reverse?: boolean; reduce: boolean }) {
  const from = reverse ? -width : 0
  const to = reverse ? 0 : -width
  return (
    <div className="relative">
      <motion.div className="flex w-max items-end" style={{ marginLeft: -Math.round((width - 402) / 4) * 2 }} animate={reduce ? undefined : { x: [from, to] }} transition={{ duration, ease: 'linear', repeat: Infinity }}>
        <img src={src} alt="" style={{ width }} />
        <img src={src} alt="" style={{ width, marginLeft: -2 }} />
        <img src={src} alt="" style={{ width, marginLeft: -2 }} />
      </motion.div>
      {/* 구름 띠 아래를 같은 색으로 채워 평평한 밑단이 보이지 않게 */}
      <div className="absolute inset-x-[-80px] top-[calc(100%-2px)] h-[720px]" style={{ background: 'linear-gradient(180deg,#DCDBEF 0%,#E8E7F5 40%,#F1F0FA 100%)' }} />
    </div>
  )
}

/** 362-버튼: h48 · radius full · Body-L 흰 글씨 */
export function PillButton({ className, disabled, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...p} disabled={disabled} className={cn('t-body-l flex h-12 w-full items-center justify-center rounded-full px-2 text-white transition active:scale-[0.99]', disabled && 'cursor-default', className)} />
}
