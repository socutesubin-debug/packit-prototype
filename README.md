# Packit 프로토타입

> 여행을 캐리어에 담아 — 일본 여행 쇼핑 리스트 서비스의 클릭 가능한 프로토타입

V1 Figma 1차 시안의 구조를 그대로 두고, 반응형(모바일 하단 내비 / PC 사이드바) UI로 다시 구현했어요.
모든 데이터는 브라우저 안의 예시 데이터이고, 서버나 실제 AI 연동은 없어요.

## 화면

| 묶음 | 내용 |
| --- | --- |
| 로그인 · 여행 만들기 | 애플/카카오(연출), 여행지 → 이름·일정·예산(캘린더) → 캐리어 모양·색 |
| 홈 | 여행 요약(D-day·저장 수·꼭 살래 합계), 이미지형/리스트형, 카테고리·즐겨찾기·검색, 빈 상태 |
| + 저장 | 스크린샷·링크·사진 촬영·직접 입력 → AI 분석 연출 → 담을 상품 선택 |
| 상품 상세 | 현지가 ↔ 원화, 환율 수정, 우선순위, 샀어요, 메모, 판매처, 후기, 현지어 문의 카드 |
| 우선순위 | 스와이프(→ 꼭 살래 / ← 안 살래 / ↑ 고민, 키보드 화살표 지원), 예산 대비 합계, PC는 3열 보드 |
| 지도 | 시부야 그림 지도, 매장 핀·카드, 필터(꼭 살래·가까운 순·영업 중), 매장 상세·길찾기 |
| 캐리어 | 여행별 캐리어, 스티커 붙이기·드래그·떼기, 열기 애니메이션, 구매품 물리 효과·흔들기, 후기, 이미지 저장 |

## 기술

- Vite + React 19 + TypeScript
- Tailwind CSS v4, shadcn/ui 방식의 컴포넌트(`src/components/ui`, cva + tailwind-merge)
- motion(Framer Motion), lucide-react, html-to-image
- Pretendard Variable (패키지 내장)

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 정적 빌드
```

Vercel에 올릴 때는 Framework Preset을 **Vite**로 두면 돼요. 빌드 결과는 상대 경로(`base: './'`)라 어떤 하위 경로에 올려도 동작해요.

## 구조

```
src/
  lib/          types · data(예시 데이터) · store(상태) · utils
  components/   Shell(내비·사이드바) · ProductCard · ui/ · art/(상품·스티커·캐리어 SVG)
  screens/      Login · CreateTrip · Home · Save · ProductDetail · Priority · MapScreen · Carry
```

상품·매장 이미지는 모두 자리표시용 SVG 일러스트예요. 실제 사진은 `src/components/art/ProductArt.tsx`와 `Scenes.tsx`를 교체하면 돼요.
