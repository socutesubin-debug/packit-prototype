# Packit 프로토타입

일본 여행 쇼핑 앱 Packit의 클릭 가능한 프로토타입. 디자이너(수빈)가 피그마에서 만든 화면을 코드로 옮긴다.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173/#app
npm run build      # dist/ — 정적 파일
npx tsc -b         # 타입 체크
```

로그인 화면 오른쪽 위 '둘러보기' → 샘플 도쿄여행(상품 4개)으로 바로 들어감.

## 스택

Vite + React 19 + TypeScript + Tailwind v4 + motion/react + lucide-react. 상태는 `src/lib/store.tsx`의 React context 하나(`useApp()`).

## 디자인 원칙 (꼭 지킬 것)

**기준 문서: `docs/ART_DIRECTION.md` (아트 디렉션 2판).** 범위·색·그림자·글꼴·이미지·인터랙션·QA 기준은 이 문서를 따른다. 아래는 요약.


- **피그마가 기준**: 파일 `HisWDC0eBBJVwZR3g2oPAz`, 페이지 `시안2`(node `480:2997`). 화면 프레임 402×874.
- **모든 레이아웃 값은 짝수**. 크기·간격·여백·줄 높이·글자 크기 모두. 피그마에 홀수가 있으면 가장 가까운 짝수로 바꾼다(예 92×75 → 92×76, 13px → 14px).
- 글꼴 Noto Sans KR(`.pk` 클래스), 자간 -3%. 타입 스케일은 `src/index.css`의 `t-h1 / t-h2 / t-h3 / t-title / t-body-l / t-body-m / t-label / t-cap / t-cap2 / t-price-l` 유틸리티(줄 높이 짝수 px 고정).
- 색 토큰은 `src/v2/ui.tsx`의 `C` 객체 = 아트 디렉션 §5 (bg #FAFAFA, ink #111, btn #24222D, sub #666661, ter #737370, gray #6B6B70, field border #949490, brand #8682F2 / brandStrong #5B55D6, 영업중 #1A7F37, 하트 #F2B5CA + 테두리 #E05A8A). 대비 4.5:1(글자) · 3:1(아이콘·필수 경계)을 넘는 값만 쓴다. 새 색이 필요하면 대비를 계산해 문서에 먼저 추가한다.
- 그림자는 떠 있는 요소(네비·FAB·시트·지도 카드·스와이프 카드)에만, 불투명도 0.08 이하. 콘텐츠 카드에는 넣지 않는다.
- 모바일 우선(최대 폭 480). 웹·태블릿 화면은 앱 화면 완성 후 이 화면을 기준으로 만든다(다음 작업).

## 구조

- `src/v2/` — 피그마 시안2 기준 현재 화면
  - `ui.tsx` 공용 컴포넌트(BottomNav2, Sheet2, PillButton, Price, ProductImg, Chip2 …)
  - `Home2.tsx` 홈(빈 화면/그리드/리스트), 저장 시트, 스크린샷 분석, 스와이프 우선순위
  - `Product2.tsx` 제품 상세 + 현지어 카드
  - `Magazine2.tsx` 매거진 홈, 작성글, 사용자 프로필, 글쓰기
  - `Map2.tsx` 지도, 매장 상세
  - `Carry2.tsx` 캐리어 리스트, 꾸미기(겉면 스티커/내부/구매 리스트/후기)
- `src/screens/Login.tsx`, `CreateTrip.tsx` — 1단계(로그인·여행 생성 3단계), 시안2 반영됨
- `src/screens/*` 나머지 — 이전 디자인. `Finds.tsx`의 `RichEditor / FormatPanel / PlaceSheet`는 v2에서 재사용 중. 커버 아티클(StoryArticle)·포인트(Benefits)는 아직 예전 디자인.
- `src/App.tsx` — 탭/오버레이 라우팅(오버레이 타입은 store.tsx의 `Overlay`)
- `src/lib/data.ts` — 샘플 데이터(상품 CATALOG, 여행 SEED_TRIPS, 발견 SEED_FINDS, 매장 STORES)
- `src/assets/` — 피그마 원본에서 받은 이미지(2x). `products/`(배경 없는 PNG), `photos/`, `onb/`

## 피그마에서 이미지 받기

Figma MCP `download_assets`(raw 이미지 URL) → `curl`로 받기 → 2배 크기·짝수로 잘라 `src/assets/`에 저장. URL은 단기 유효.

## 커밋

메시지는 한국어로, 무엇을 바꿨는지 한 줄. 사용자 이메일은 커밋 외에 노출하지 않는다.
