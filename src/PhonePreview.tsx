import QRCode from 'qrcode'
import { Monitor, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/art/Stickers'

export const SHARE_URL = 'https://claude.ai/artifact/8x3RJEb4P39UmfsQE6FtLY'
const PW = 390
const PH = 844

/** Desktop-only: runs the app inside a phone frame (an iframe at phone width) with a QR code to open it on a real phone. */
export function PhonePreview() {
  const [qr, setQr] = useState('')
  const [scale, setScale] = useState(1)

  useEffect(() => {
    QRCode.toString(`${SHARE_URL}`, { type: 'svg', margin: 0, color: { dark: '#141413', light: '#00000000' } }).then(setQr)
  }, [])
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 64) / (PH + 28)))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center gap-16 bg-ground px-6 py-8">
      <aside className="hidden w-[320px] lg:block">
        <div className="flex items-center gap-2.5">
          <Logo className="size-10" />
          <span className="display text-[24px]">Packit</span>
        </div>
        <h1 className="display mt-8 text-[34px] text-balance">휴대폰 화면으로 보는 중이에요</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">프레임 안에서 실제 앱처럼 눌러 보세요. 스와이프, 스티커 드래그, 지도 이동도 마우스로 할 수 있어요.</p>
        <div className="mt-8 flex items-center gap-4 rounded-[24px] bg-surface p-4 shadow-[var(--shadow-card)]">
          <div className="size-28 shrink-0 rounded-xl bg-white p-2 ring-1 ring-line" dangerouslySetInnerHTML={{ __html: qr }} aria-label="휴대폰으로 열기 QR 코드" />
          <div>
            <p className="flex items-center gap-1.5 text-[14px] font-bold">
              <Smartphone className="size-4 text-brand" /> 내 휴대폰에서 열기
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">카메라로 스캔하면 바로 열려요. Claude에 로그인된 상태여야 해요.</p>
          </div>
        </div>
        <a href="#" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-surface px-5 text-[14px] font-semibold ring-1 ring-line hover:bg-sunken">
          <Monitor className="size-4" /> PC 화면으로 보기
        </a>
      </aside>

      <div style={{ width: (PW + 28) * scale, height: (PH + 28) * scale }} className="shrink-0">
        <div style={{ width: PW + 28, height: PH + 28, transform: `scale(${scale})`, transformOrigin: 'top left' }} className="relative rounded-[62px] bg-[#111] p-[14px] shadow-[0_40px_80px_-30px_rgba(20,20,19,0.55),inset_0_0_0_2px_#2b2b2d]">
          <div className="pointer-events-none absolute top-[26px] left-1/2 z-10 h-[30px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
          <div className="overflow-hidden rounded-[48px] bg-ground">
            <div className="flex h-[50px] items-end justify-between px-8 pb-2 text-[15px] font-semibold tabular">
              <span>9:41</span>
              <span className="flex items-center gap-1.5">
                <span className="flex items-end gap-[2px]">{[5, 7, 9, 11].map((h) => <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />)}</span>
                <span className="ml-1 h-[11px] w-[22px] rounded-[3px] border border-ink/50 p-[1.5px]"><span className="block h-full w-[70%] rounded-[1.5px] bg-ink" /></span>
              </span>
            </div>
            <iframe title="Packit 모바일 미리보기" src="./index.html#app" width={PW} height={PH - 50} className="block bg-ground" />
          </div>
        </div>
      </div>
    </div>
  )
}
