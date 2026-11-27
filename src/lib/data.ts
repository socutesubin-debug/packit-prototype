import pTokyoBanana from '@/assets/products/tokyobanana.png'
import pBiore from '@/assets/products/biore.png'
import pShiseido from '@/assets/products/shiseido.png'
import pJagarico from '@/assets/products/jagarico.png'
import pOhta from '@/assets/products/ohta.png'
import pRohto from '@/assets/products/rohto.png'
import phMiffy1 from '@/assets/photos/miffy1.jpg'
import phMiffy2 from '@/assets/photos/miffy2.jpg'
import phKiriko from '@/assets/photos/find-kiriko.jpg'
import phChiikawa from '@/assets/photos/find-chiikawa.jpg'
import phKuromi from '@/assets/photos/find-kuromi.jpg'
import phChopsticks from '@/assets/photos/find-chopsticks.jpg'
import phMatsukiyo from '@/assets/photos/store-matsukiyo.jpg'
import phFlagship from '@/assets/photos/store-flagship.jpg'
import type { Author, Comment, PostKind, TravelerSeries, Category, Find, Product, Store, Trip } from './types'

export const CATEGORIES: Category[] = ['뷰티', '식품', '옷', '잡화', '면세품']

export const CITIES = [
  { id: 'tokyo', name: '도쿄', sub: '도쿄, 하라주쿠, 오모테산도, 시부야', region: '일본', hue: '#E8453C', sky: '#FFE3DD' },
  { id: 'osaka', name: '오사카', sub: '오사카, 교토, 나라, 고베', region: '일본', hue: '#3E6FD8', sky: '#DDE7FF' },
  { id: 'sapporo', name: '삿포로', sub: '삿포로, 오타루, 비에이', region: '일본', hue: '#6B6BD6', sky: '#E4E4FF' },
  { id: 'okinawa', name: '오키나와', sub: '나하, 국제거리, 차탄', region: '일본', hue: '#1E9BB8', sky: '#D4F1F7' },
  { id: 'fukuoka', name: '후쿠오카', sub: '하카타, 텐진, 다자이후', region: '일본', hue: '#1F9C74', sky: '#D6F2E7' },
  { id: 'bangkok', name: '방콕', sub: '시암, 수쿰빗, 짜뚜짝', region: '동남아시아', hue: '#E58A1F', sky: '#FFEBD2' },
  { id: 'shanghai', name: '상하이', sub: '와이탄, 신톈디, 난징루', region: '중국', hue: '#C2463E', sky: '#FBE0DE' },
  { id: 'newyork', name: '뉴욕', sub: '맨해튼, 소호, 브루클린', region: '미국', hue: '#2B2B2B', sky: '#E6E6E6' },
  { id: 'paris', name: '파리', sub: '마레, 생제르맹, 몽마르트르', region: '유럽', hue: '#2F5DA8', sky: '#DCE6F7' },
]
export const REGIONS = ['전체', '일본', '중국', '동남아시아', '미국', '유럽']

/** 피그마 시안2 · 캐리어 색상 (tint = 사진 위에 곱하는 색) */
export const SUITCASE_COLORS = [
  { id: 'white', value: '#E5E5EA', tint: null, name: '화이트' },
  { id: 'black', value: '#111111', tint: '#3A3A40', name: '블랙' },
  { id: 'yellow', value: '#F3C768', tint: '#F6CF7A', name: '옐로' },
  { id: 'blue', value: '#91B8F0', tint: '#9CC0F2', name: '블루' },
  { id: 'pink', value: '#F2B5CA', tint: '#F4BDD0', name: '핑크' },
]

export const PHRASES = [
  { ko: '이 상품은 어디 있나요?', ja: 'この商品はどこにありますか。' },
  { ko: '이 상품 재고 있나요?', ja: 'この商品の在庫はありますか。' },
  { ko: '면세 되나요?', ja: '免税できますか。' },
  { ko: '구매 수량 제한이 있나요?', ja: '購入数の制限はありますか。' },
]

export const STORES: Store[] = [
  { id: 's1', name: '마츠모토키요시 시부야점', ja: '薬 マツモトキヨシ', kind: '드럭스토어', area: '시부야 · 우다가와초', address: '23-4 Udagawacho, Shibuya, Tokyo 150-0042 일본', hours: '10:00 - 22:30', open: true, distance: 350, x: 62, y: 48, lat: 35.6612, lng: 139.6985, color: '#E6E6E6', photo: phMatsukiyo },
  { id: 's2', name: '마츠모토키요시 시부야 플래그십 스토어', ja: 'マツモトキヨシ 渋谷フラッグシップ', kind: '드럭스토어', area: '시부야 · 센터가이', address: '도쿄도 시부야구 우다가와초 일대', hours: '09:00 - 23:00', open: true, distance: 450, x: 36, y: 64, lat: 35.66, lng: 139.6992, color: '#1E1E1E', photo: phFlagship },
  { id: 's3', name: '로프트 시부야', ja: 'ロフト', kind: '생활 잡화', area: '시부야 · 진난', address: '도쿄도 시부야구 진난 일대', hours: '11:00 - 21:00', open: true, distance: 450, x: 46, y: 22, lat: 35.6621, lng: 139.698, color: '#F4F4F4' },
  { id: 's4', name: '스크램블 스퀘어 기념품관', ja: 'スクランブルスクエア', kind: '기념품', area: '시부야역', address: '도쿄도 시부야구 시부야역 직결', hours: '10:00 - 21:00', open: true, distance: 520, x: 64, y: 56, lat: 35.6584, lng: 139.7022, color: '#BDBDBD' },
  { id: 's5', name: '빅카메라 시부야 동구점', ja: 'ビックカメラ', kind: '전자 · 생활', area: '시부야 · 동쪽 출구', address: '도쿄도 시부야구 시부야 일대', hours: '10:00 - 21:00', open: false, distance: 520, x: 74, y: 34, lat: 35.6594, lng: 139.7036, color: '#4A4A4A' },
]

const R = {
  jisoo: { user: 'JISOO', trip: '도쿄여행 25.12.08', mood: 'good' as const, text: '선물용으로 여러 개 사갔는데 반응이 좋았던 아이템' },
  min: { user: '민트초코', trip: '오사카 25.10.02', mood: 'good' as const, text: '여름에 쓰기 좋아요. 백탁 없이 가볍게 발려요' },
  dan: { user: '단단', trip: '후쿠오카 25.07.21', mood: 'soso' as const, text: '생각보다 작아서 두 개 사는 걸 추천해요' },
}

type Seed = Omit<Product, 'tripId' | 'priority' | 'favorite' | 'memo' | 'purchased'>

export const CATALOG: Seed[] = [
  { id: 'p1', name: '도쿄바나나 자쿠샌드 초코바나나맛', ja: '東京ばな奈 ザックサンド チョコバナナ味', brand: 'TOKYO BANANA WORLD', category: '식품', price: 980, desc: '바나나 풍미를 담은 바삭한 쿠키 사이에 부드러운 밀크 초콜릿을 샌드한 디저트입니다. 콘플레이크를 더해 경쾌한 식감과 달콤한 초코바나나의 조화를 즐길 수 있습니다. 귀여운 고양이 캐릭터 패키지라 선물용으로도 좋아요.', art: { shape: 'box', color: '#F6C945', accent: '#7A4A23', bg: '#FFF6DA' }, photo: pTokyoBanana, storeIds: ['s1', 's4'], pickRate: 72, reviews: [{ user: 'JISOO KIM', trip: '도쿄여행 26.11.08', mood: 'good', text: '선물용으로 여러 개 사갔는데 반응이 좋았던 아이템입니다.' }, { user: '민트초코', trip: '오사카여행 26.10.02', mood: 'soso', text: '기존 도쿄바나나보다 바삭해서 더 취향이었어요. 바나나 달콤함이 잘 어울려서 커피랑 먹기 좋아요.' }] },
  { id: 'p2', name: '비오레 UV 아쿠아리치 워터리 에센스 선크림', ja: 'ビオレ UV アクアリッチ ウォータリーエッセンス', brand: 'BIORÉ', category: '뷰티', price: 1184, desc: '물처럼 가볍게 발리는 에센스 타입 선크림. 끈적임이 적어 여름 필수템으로 많이 찾아요.', art: { shape: 'tube', color: '#3FB4E6', accent: '#E9F7FD', bg: '#E3F4FB' }, photo: pBiore, storeIds: ['s1', 's2'], pickRate: 81, reviews: [R.min] },
  { id: 'p3', name: '리바이탈에센스 스킨 글로우 파운데이션', ja: 'エッセンス スキングロウ ファンデーション', brand: 'SHISEIDO', category: '뷰티', price: 7590, desc: '에센스를 머금은 듯 촉촉하게 밀착되는 리퀴드 파운데이션. 일본 매장 가격이 국내보다 저렴한 편이에요.', art: { shape: 'bottle', color: '#F3E3CF', accent: '#D62C2C', bg: '#FBF3EA' }, photo: pShiseido, storeIds: ['s1'], pickRate: 68, reviews: [R.min] },
  { id: 'p4', name: '자가리코 명란버터맛', ja: 'じゃがりこ たらこバター', brand: 'CALBEE', category: '식품', price: 170, desc: '컵에 담긴 바삭한 감자 스틱. 명란버터맛은 일본 한정이라 편의점에서 보이면 꼭 집어 오세요.', art: { shape: 'can', color: '#E85B3C', accent: '#FFE07A', bg: '#FCE6DE' }, photo: pJagarico, storeIds: ['s1', 's2'], pickRate: 52, reviews: [R.dan] },
  { id: 'p13', name: '오타이산 가루 위장약 48포', ja: '太田胃散 分包 48包', brand: "OHTA'S ISAN", category: '의약품', price: 1738, desc: '부모님 선물로 많이 찾는 가루 위장약. 복용 전 성분과 용법을 꼭 확인하세요.', art: { shape: 'box', color: '#2F4E8C', accent: '#FFFFFF', bg: '#E1E7F3' }, photo: pOhta, storeIds: ['s1'], pickRate: 64, reviews: [] },
  { id: 'p14', name: 'V로토 프리미엄 안약', ja: 'Vロート プレミアム', brand: 'ROHTO', category: '의약품', price: 1650, desc: '눈 피로에 좋은 프리미엄 안약. 여행 중 오래 걸은 날 밤에 쓰기 좋아요.', art: { shape: 'box', color: '#2B2F8C', accent: '#D9B54A', bg: '#E4E5F5' }, photo: pRohto, storeIds: ['s1', 's2'], pickRate: 59, reviews: [] },
  { id: 'p5', name: '로이스 생초콜릿 마일드 카카오', ja: 'ロイズ 生チョコレート マイルドカカオ', brand: "ROYCE'", category: '면세품', price: 864, desc: '입에서 부드럽게 녹는 생초콜릿. 보냉 포장이 필요하니 마지막 날 사는 걸 추천해요.', art: { shape: 'box', color: '#6B4630', accent: '#E9D3B5', bg: '#F3E7DA' }, storeIds: ['s4'], pickRate: 77, reviews: [R.jisoo] },
  { id: 'p6', name: '이마바리 타월 거즈 손수건', ja: '今治タオル ガーゼハンカチ', brand: 'IMABARI', category: '잡화', price: 1320, desc: '흡수력이 좋은 거즈 손수건. 색이 다양해서 여러 장 골라 선물하기 좋아요.', art: { shape: 'towel', color: '#9AC7B5', accent: '#FFFFFF', bg: '#E5F3EC' }, storeIds: ['s3', 's2'], pickRate: 48, reviews: [] },
  { id: 'p7', name: '캔메이크 마시멜로 피니시 파우더', ja: 'キャンメイク マシュマロフィニッシュパウダー', brand: 'CANMAKE', category: '뷰티', price: 1034, desc: '보송하게 마무리되는 프레스드 파우더. 휴대용 거울이 달려 있어요.', art: { shape: 'jar', color: '#F4A7C0', accent: '#FFFFFF', bg: '#FDE8EF' }, storeIds: ['s1', 's2'], pickRate: 63, reviews: [R.min] },
  { id: 'p8', name: '오후의 홍차 로열 밀크티', ja: '午後の紅茶 ロイヤルミルクティー', brand: 'KIRIN', category: '식품', price: 160, desc: '편의점에서도 쉽게 찾을 수 있는 밀크티. 여행 중 간식으로 좋아요.', art: { shape: 'can', color: '#C9824B', accent: '#FFF4E6', bg: '#F7E9DC' }, storeIds: ['s2'], pickRate: 40, reviews: [] },
  { id: 'p9', name: '무인양품 휴대용 아로마 디퓨저', ja: '無印良品 ポータブルアロマディフューザー', brand: 'MUJI', category: '잡화', price: 3990, desc: '충전식이라 호텔에서도 쓰기 좋은 소형 디퓨저. 국내보다 저렴한지 비교해 보세요.', art: { shape: 'jar', color: '#E7E1D6', accent: '#8B7E6A', bg: '#F2EEE7' }, storeIds: ['s3'], pickRate: 35, reviews: [] },
  { id: 'p10', name: '킷캣 말차 미니 12개입', ja: 'キットカット 抹茶 ミニ 12枚', brand: 'NESTLÉ', category: '식품', price: 540, desc: '일본 한정 맛으로 유명한 말차 킷캣. 나눠 주기 좋은 개별 포장이에요.', art: { shape: 'bar', color: '#5E9C4E', accent: '#E8453C', bg: '#E4F1DE' }, storeIds: ['s2', 's4'], pickRate: 69, reviews: [R.jisoo] },
  { id: 'p11', name: '유니클로 히트텍 울트라 웜 크루넥', ja: 'ユニクロ ヒートテック ウルトラウォーム', brand: 'UNIQLO', category: '의류', price: 2990, desc: '겨울 여행 이너로 좋은 발열 내의. 일본 사이즈는 한 치수 크게 보세요.', art: { shape: 'towel', color: '#3A3A3D', accent: '#E8453C', bg: '#E9E9EA' }, storeIds: ['s3'], pickRate: 44, reviews: [R.dan] },
  { id: 'p12', name: '카베진 알파 위장약 300정', ja: 'キャベジンコーワα', brand: 'KOWA', category: '의약품', price: 1980, desc: '부모님 선물로 많이 찾는 위장약. 복용 전 성분과 용법을 꼭 확인하세요.', art: { shape: 'bottle', color: '#2E9D6A', accent: '#FFFFFF', bg: '#DFF2E8' }, storeIds: ['s1'], pickRate: 58, reviews: [] },
]

/** Pool used by the fake "AI 분석" flow */
export const SCAN_POOL: Seed[] = [
  ...['p1', 'p2', 'p3', 'p4', 'p13', 'p14', 'p10', 'p12'].map((id) => CATALOG.find((c) => c.id === id)!),
  { id: 'q1', name: '시세이도 아넷사 퍼펙트 UV 밀크', ja: 'アネッサ パーフェクトUV スキンケアミルク', brand: 'ANESSA', category: '뷰티', price: 3278, desc: '물과 땀에 강한 선밀크. 여름 여행이나 야외 일정이 많을 때 좋아요.', art: { shape: 'bottle', color: '#D9A93C', accent: '#FFFFFF', bg: '#FBF0D6' }, storeIds: ['s1', 's2'], pickRate: 79, reviews: [R.min] },
  { id: 'q2', name: '자가리코 감자 스틱 샐러드맛', ja: 'じゃがりこ サラダ', brand: 'CALBEE', category: '식품', price: 150, desc: '컵에 담긴 바삭한 감자 스틱. 편의점과 마트 어디서나 찾기 쉬워요.', art: { shape: 'can', color: '#E85B3C', accent: '#FFE07A', bg: '#FCE6DE' }, storeIds: ['s2'], pickRate: 52, reviews: [] },
  { id: 'q3', name: '휴족시간 쿨링 시트 18매', ja: '休足時間 18枚', brand: 'LION', category: '잡화', price: 698, desc: '많이 걸은 날 밤 다리에 붙이는 쿨링 시트.', art: { shape: 'pouch', color: '#7FB8E8', accent: '#FFFFFF', bg: '#E4F0FB' }, storeIds: ['s1', 's2'], pickRate: 61, reviews: [R.dan] },
  { id: 'q4', name: '시로이 코이비토 화이트 12개입', ja: '白い恋人 12枚入', brand: 'ISHIYA', category: '면세품', price: 1188, desc: '화이트 초콜릿을 샌드한 랑그드샤 쿠키. 공항 면세점에서도 살 수 있어요.', art: { shape: 'box', color: '#5B8BD6', accent: '#FFFFFF', bg: '#E2EBFA' }, storeIds: ['s4'], pickRate: 74, reviews: [R.jisoo] },
]

const MUST = ['p1', 'p3', 'p4']
const MAYBE = ['p2']
const SKIP: string[] = []
const TOKYO = ['p1', 'p3', 'p4', 'p2']

export const SEED_TRIPS: Trip[] = [
  {
    id: 't1', name: '돈 왕창 쓰는 도쿄여행', city: '도쿄', start: '2026-12-03', end: '2026-12-07', budget: 600000,
    suitcase: { model: 'ribbed', color: '#E5E5EA' }, sample: true,
    stickers: [
      { id: 'st1', kind: 'tokyo', x: 26, y: 20, rot: -16 },
      { id: 'st2', kind: 'sakura', x: 82, y: 58, rot: 8 },
      { id: 'st3', kind: 'cat', x: 28, y: 78, rot: 0 },
    ],
  },
  {
    id: 't2', name: '식도락 오사카 여행', city: '오사카', start: '2025-09-24', end: '2025-09-30', budget: 400000,
    suitcase: { model: 'ribbed', color: '#F2B5CA' }, sample: true,
    stickers: [
      { id: 'st4', kind: 'osaka', x: 30, y: 30, rot: -6 },
      { id: 'st5', kind: 'sakura', x: 66, y: 64, rot: 10 },
    ],
  },
]

export function seedProducts(): Product[] {
  const tokyo = TOKYO.map((id) => CATALOG.find((c) => c.id === id)!).map<Product>((s) => ({
    ...s,
    tripId: 't1',
    priority: MUST.includes(s.id) ? 'must' : MAYBE.includes(s.id) ? 'maybe' : SKIP.includes(s.id) ? 'skip' : null,
    favorite: MUST.includes(s.id),
    memo: '',
    purchased: true,
    myMood: s.id === 'p1' ? 'good' : s.id === 'p2' ? 'bad' : undefined,
  }))
  const osakaIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p12', 'p14']
  const osaka = CATALOG.filter((s) => osakaIds.includes(s.id)).map<Product>((s, i) => ({
    ...s,
    id: `o-${s.id}`,
    tripId: 't2',
    priority: 'must',
    favorite: false,
    memo: '',
    purchased: true,
    myMood: (['good', 'good', 'soso', 'good', 'bad'] as const)[i % 5],
  }))
  return [...tokyo, ...osaka]
}


/** Sample local finds around Shibuya (all fictional examples) */
export const SEED_FINDS: Find[] = [
  { id: 'g1', city: '도쿄', title: '도쿄역에서 만난 역장 미피', story: '도쿄역 지하 캐릭터 스트리트를 구경하다가\n역장님으로 변신한 미피를 발견했어요!\n작은 모자와 제복이 너무 귀엽더라고요.\n도쿄역점 한정 디자인이라 미피 좋아하시는 분들은\n꼭 들러보세요. 큰 인형이 부담스럽다면 작은 키링도 있어요.\n\n#도쿄여행 #미피 #도쿄역한정 #캐릭터굿즈', place: '도쿄 캐릭터 스트리트 B1F 미피 스타일 도쿄역점', area: '도쿄역', station: '도쿄역', x: 22, y: 40, lat: 35.6806, lng: 139.767, price: 5390, category: '잡화', art: { shape: 'jar', color: '#1F2A55', accent: '#F2C94C', bg: '#E8EAF3' }, photo: phMiffy1, photos: [phMiffy1, phMiffy2], author: '여행하는곰', authorTrip: '도쿄 여행 중', daysAgo: 0, saves: 5, thanks: 3, sample: true, date: '26.11.26' },
  { id: 'g2', city: '도쿄', title: '에도 키리코 스카이트리 글라스', story: '긴시초역 근처 공방에서 산 에도 키리코 잔이에요. 스카이트리 무늬가 빛을 받으면 반짝여요.', place: '스미다 에도 키리코관', area: '긴시초', station: '긴시초역', x: 86, y: 18, lat: 35.6966, lng: 139.8146, price: 17600, category: '잡화', art: { shape: 'jar', color: '#2B3FB8', accent: '#FFFFFF', bg: '#E4E7F7' }, photo: phKiriko, author: 'JISOO', authorTrip: '도쿄 여행 중', daysAgo: 1, saves: 24, thanks: 11, sample: true },
  { id: 'g3', city: '도쿄', title: '치이카와 베이커리 코로네 마스코트', story: '하라주쿠 치이카와 베이커리에서만 파는 코로네 마스코트. 빵 냄새 맡으며 줄 서는 것도 재밌어요.', place: '치이카와 베이커리 하라주쿠', area: '하라주쿠', station: '메이지진구마에역', x: 74, y: 18, lat: 35.6702, lng: 139.7029, price: 6800, category: '잡화', art: { shape: 'jar', color: '#F6D58E', accent: '#E8453C', bg: '#FFF6E2' }, photo: phChiikawa, author: 'Eilibean', authorTrip: '도쿄 여행 중', daysAgo: 2, saves: 41, thanks: 20, sample: true },
  { id: 'g4', city: '도쿄', title: '쿠로미 이니셜 체크 파우치', story: '긴시초 산리오 숍에서 이니셜 와펜을 골라 붙여 주는 파우치예요. 10분이면 완성돼요.', place: '산리오 기프트 게이트 긴시초', area: '긴시초', station: '긴시초역', x: 8, y: 50, lat: 35.6968, lng: 139.8136, price: 3300, category: '잡화', art: { shape: 'pouch', color: '#F4A7C0', accent: '#1E1E1E', bg: '#FDE8EF' }, photo: phKuromi, author: 'JISOO', authorTrip: '도쿄 여행 중', daysAgo: 3, saves: 18, thanks: 6, sample: true },
  { id: 'g5', city: '도쿄', title: '에도 가라키 팔각 자단 젓가락', story: '긴자 나츠노 본점에서 이름을 새겨 주는 자단 젓가락. 부모님 선물로 두 벌 샀어요.', place: '긴자 나츠노 본점', area: '긴자', station: '긴자 나츠노 본점', x: 92, y: 50, lat: 35.6712, lng: 139.7642, price: 6800, category: '잡화', art: { shape: 'bar', color: '#5B2E1E', accent: '#D9B54A', bg: '#F3E7DA' }, photo: phChopsticks, author: 'Eilibean', authorTrip: '도쿄 여행 중', daysAgo: 4, saves: 29, thanks: 13, sample: true },
  { id: 'f1', city: '도쿄', title: '골목 공방의 유리 풍경', story: '도겐자카 뒷골목 2층 작은 공방에서 할아버지가 직접 불어 만든 풍경이에요. 지도에는 안 나오고 간판도 작아요. 소리가 정말 맑아서 하나 사 왔어요.', place: '이름 없는 유리 공방 (2층)', area: '도겐자카 뒷골목', x: 30, y: 70, lat: 35.6573, lng: 139.6964, price: 2200, category: '잡화', art: { shape: 'jar', color: '#9CC9E8', accent: '#E8453C', bg: '#E4F1FA' }, author: '민트초코', authorTrip: '도쿄 여행 중', daysAgo: 3, saves: 42, thanks: 18, sample: true, pins: [{ x: 50, y: 40, label: '유리 풍경', price: 2200 }] },
  { id: 'f2', city: '도쿄', title: '시부야 한정 마스킹테이프', story: '동네 문구점 계산대 옆에만 있는 시부야 거리 그림 마스킹테이프. 온라인 판매를 안 한대요.', place: '골목 끝 문구점', area: '오쿠시부야', x: 18, y: 36, lat: 35.664, lng: 139.693, price: 480, category: '잡화', art: { shape: 'can', color: '#F2C94C', accent: '#141413', bg: '#FFF5D6' }, author: '단단', authorTrip: '도쿄 여행 중', daysAgo: 1, saves: 27, thanks: 9, sample: true },
  { id: 'f3', city: '도쿄', title: '할머니 쌀과자 센베', story: '아침에만 굽는 간장 센베. 오후 2시면 다 팔려요. 포장지가 신문지라 선물용으로도 귀여워요.', place: '마루야마 센베 가게', area: '진구마에 골목', x: 52, y: 12, lat: 35.6676, lng: 139.7052, price: 650, category: '식품', art: { shape: 'pouch', color: '#C9824B', accent: '#FFF4E6', bg: '#F7E9DC' }, author: 'JISOO', authorTrip: '2주 전 다녀옴', daysAgo: 14, saves: 63, thanks: 31, sample: true, pins: [{ x: 40, y: 46, label: '간장 센베 5장', price: 650 }, { x: 70, y: 66, label: '신문지 포장' }] },
  { id: 'f4', city: '도쿄', title: '킷사텐 오리지널 성냥갑', story: '50년 된 킷사텐에서 커피를 마시면 계산할 때 하나씩 줘요. 따로 사려면 ¥100. 디자인이 매년 바뀐대요.', place: '킷사 코하쿠', area: '우다가와초', x: 44, y: 46, lat: 35.6607, lng: 139.6974, price: 100, category: '잡화', art: { shape: 'box', color: '#2F5DA8', accent: '#F2C94C', bg: '#E2EAF7' }, author: '여행하는곰', authorTrip: '도쿄 여행 중', daysAgo: 5, saves: 19, thanks: 7, sample: true },
  { id: 'f5', city: '도쿄', title: '쪽빛 염색 데누구이', story: '작은 염색 공방에서 손으로 물들인 손수건. 같은 무늬가 하나도 없어요. 사장님이 접는 법도 알려 주셨어요.', place: '아이조메 공방', area: '시부야강 산책로', x: 82, y: 78, price: 1650, category: '잡화', art: { shape: 'towel', color: '#2F4E8C', accent: '#FFFFFF', bg: '#E1E7F3' }, author: '단단', authorTrip: '도쿄 여행 중', daysAgo: 2, saves: 35, thanks: 12, sample: true },
  { id: 'f6', city: '도쿄', title: '동네 빵집 멜론빵 키링', story: '빵집에서 직접 만든 펠트 키링. 빵을 사면 진열대 아래 바구니에 있는 걸 보여 줘요.', place: '베이커리 하루', area: '에비스 방향 주택가', x: 88, y: 46, price: 900, category: '잡화', art: { shape: 'jar', color: '#B7D37A', accent: '#F2C94C', bg: '#EEF6DD' }, author: '민트초코', authorTrip: '도쿄 여행 중', daysAgo: 6, saves: 22, thanks: 10, sample: true },
  { id: 'f7', city: '도쿄', title: '목욕탕 한정 유리병 우유', story: '동네 센토(대중목욕탕) 카운터 냉장고에만 있는 병우유. 병은 반납해야 하지만 뚜껑 종이는 기념으로 가져갈 수 있어요.', place: '고마유 센토', area: '시부야 2초메 주택가', x: 74, y: 88, price: 150, category: '식품', art: { shape: 'bottle', color: '#F4F4F4', accent: '#3E6FD8', bg: '#EEF2F7' }, author: '여행하는곰', authorTrip: '도쿄 여행 중', daysAgo: 0, saves: 8, thanks: 3, sample: true, pins: [{ x: 46, y: 44, label: '유리병 우유', price: 150 }, { x: 72, y: 70, label: '뚜껑 종이' }] },
  { id: 'f8', city: '도쿄', title: '헌책방 주인이 만든 책갈피', story: '헌책을 사면 주인 할아버지가 손글씨로 쓴 책갈피를 끼워 줘요. 따로도 3장에 ¥300.', place: '이치노 서점', area: '진구마에 3초메', x: 36, y: 14, price: 300, category: '잡화', art: { shape: 'bar', color: '#D9C7A8', accent: '#141413', bg: '#F3EEE4' }, author: 'JISOO', authorTrip: '도쿄 여행 중', daysAgo: 1, saves: 31, thanks: 14, sample: true },
  { id: 'f9', city: '도쿄', title: '골목 두부가게 유바 과자', story: '두부가게에서 남은 유바를 튀겨 파는 과자. 오전에만 나오고 봉투에 날짜를 손으로 써 줘요.', place: '마츠다 두부점', area: '우에하라 상점가', x: 12, y: 54, price: 380, category: '식품', art: { shape: 'pouch', color: '#EFE3C8', accent: '#8B5A3C', bg: '#F7F1E4' }, author: '민트초코', authorTrip: '도쿄 여행 중', daysAgo: 4, saves: 47, thanks: 20, sample: true },
  { id: 'f10', city: '도쿄', title: '구제 숍의 쇼와 시대 스카프', story: '지하 구제 숍 안쪽 바구니에 1970년대 실크 스카프가 섞여 있어요. 하나하나 무늬가 달라서 오래 골랐어요.', place: '지하 구제 숍 미도리', area: '캣 스트리트 뒤', x: 58, y: 24, price: 1200, category: '옷', art: { shape: 'towel', color: '#8B5A3C', accent: '#F2C94C', bg: '#F3E7DA' }, author: '단단', authorTrip: '2주 전 다녀옴', daysAgo: 12, saves: 56, thanks: 25, sample: true },
  { id: 't1', kind: 'tip', city: '도쿄', title: '돈키호테 면세는 5,000엔부터, 영수증 합산 돼요', story: '같은 날 같은 매장이면 층이 달라도 영수증을 합쳐서 면세 받을 수 있어요. 계산대 말고 1층 면세 카운터로 가야 해요.', place: '돈키호테 시부야점', area: '우다가와초', x: 40, y: 52, category: '면세품', art: { shape: 'box', color: '#141413', accent: '#F2C94C', bg: '#EDEDED' }, author: '단단', authorTrip: '도쿄 여행 중', daysAgo: 0, saves: 88, thanks: 40, sample: true },
  { id: 'q1', kind: 'ask', city: '도쿄', title: '시부야에서 하다라보 고쿠준 제일 싼 곳 아시는 분?', story: '마츠키요랑 돈키 둘 다 가 봤는데 가격이 조금씩 달라요. 다른 곳에서 더 싸게 보신 분 있나요?', place: '시부야역 근처', area: '시부야', x: 56, y: 58, price: 880, category: '뷰티', art: { shape: 'bottle', color: '#E9EEF5', accent: '#2F5DA8', bg: '#EEF2F7' }, author: '여행하는곰', authorTrip: '도쿄 여행 중', daysAgo: 0, saves: 5, thanks: 2, sample: true },
  { id: 'c1', kind: 'course', city: '도쿄', title: '오쿠시부야 반나절 문구 코스', story: '골목 문구점 → 헌책방 → 킷사텐 순서로 돌면 걸어서 40분이에요. 킷사텐에서 쉬면서 산 걸 정리하기 좋아요.', place: '오쿠시부야 일대', area: '오쿠시부야', x: 22, y: 32, category: '잡화', art: { shape: 'bar', color: '#D9C7A8', accent: '#141413', bg: '#F3EEE4' }, author: 'JISOO', authorTrip: '도쿄 여행 중', daysAgo: 2, saves: 51, thanks: 22, sample: true, pins: [{ x: 22, y: 34, label: '1 골목 문구점' }, { x: 50, y: 50, label: '2 이치노 서점' }, { x: 76, y: 66, label: '3 킷사 코하쿠' }] },
  { id: 'm1', city: '오사카', title: '도톤보리 수제 젓가락', story: '오사카 시장 안쪽 젓가락 가게에서 이름을 새겨 줘요. 15분 걸려요.', place: '하시야 젓가락', area: '오사카 · 센니치마에', x: 60, y: 30, price: 1800, category: '잡화', art: { shape: 'bar', color: '#8B5A3C', accent: '#F2C94C', bg: '#F3E7DA' }, author: '수빈', authorTrip: '오사카 여행', daysAgo: 52, saves: 14, thanks: 6, mine: true },
  { id: 'm2', city: '오사카', title: '오사카 한정 타코야키 키캡', story: '전자상가 골목 작은 가게에서만 파는 레진 키캡이에요.', place: '키캡 숍 니폰바시', area: '오사카 · 니폰바시', x: 70, y: 60, price: 1200, category: '잡화', art: { shape: 'jar', color: '#C9824B', accent: '#2A2A2C', bg: '#F7E9DC' }, author: '수빈', authorTrip: '오사카 여행', daysAgo: 51, saves: 9, thanks: 4, mine: true },
]

export const REWARDS = [
  { id: 'r1', title: '제휴 소품샵 10% 할인 쿠폰', sub: '도쿄 제휴 매장 12곳', cost: 500 },
  { id: 'r2', title: 'Packit 한정 스티커 팩', sub: '캐리어 꾸미기 스티커 6종', cost: 300 },
  { id: 'r3', title: '공항 라운지 할인권', sub: '인천공항 제휴 라운지', cost: 2000 },
]

export const POINT_RULES = [
  { label: '현지 발견 올리기', pt: 50 },
  { label: '다른 여행자가 내 발견을 저장', pt: 10 },
  { label: '고마워요를 받을 때', pt: 5 },
]

/** Editorial stories for the magazine tab (example content) */
export const STORIES = [
  {
    id: 's-crafts', kicker: '에디터 픽', title: '지도에 없는 도쿄 골목 공방 4곳', sub: '간판이 작아 지나치기 쉬운, 손으로 만든 물건을 파는 곳',
    intro: '도쿄에 다녀온 여행자들이 직접 찾아 올린 발견 중에서, 주인이 직접 만들어 그 가게에서만 살 수 있는 물건을 모았어요. 대부분 2층이나 골목 안쪽이라 지도 앱으로는 찾기 어려워요.',
    findIds: ['f1', 'f5', 'f6', 'f8'], series: 'alley', ep: 3,
  },
  {
    id: 's-snacks', kicker: '아침에만 있어요', title: '오후엔 다 팔리는 동네 간식', sub: '여행 첫날 아침에 들러야 하는 가게들',
    intro: '오전에만 굽거나 하루 수량이 정해진 간식이에요. 일정 첫날 아침 동선에 넣어 두면 좋아요.',
    findIds: ['f3', 'f9', 'f7'], series: 'morning', ep: 2,
  },
  {
    id: 's-vintage', kicker: '시간이 쌓인 물건', title: '쇼와 감성 기념품', sub: '오래된 가게가 건네는 작은 물건들',
    intro: '오래된 킷사텐, 헌책방, 구제 숍에서 찾은 물건이에요. 같은 디자인을 다시 구하기 어려운 것들이라 보이면 바로 사는 걸 추천해요.',
    findIds: ['f4', 'f10', 'f2'], series: 'alley', ep: 2,
  },
]

export const COLLECTIONS = [
  { id: 'c-gift', title: '선물하기 좋은', filter: (f: Find) => f.category === '잡화' && (f.price ?? 0) <= 2000 },
  { id: 'c-cheap', title: '₩10,000 이하', filter: (f: Find) => (f.price ?? 0) * 8.44 <= 10000 },
  { id: 'c-food', title: '먹어서 없어지는', filter: (f: Find) => f.category === '식품' },
  { id: 'c-wear', title: '입고 쓰는', filter: (f: Find) => f.category === '옷' || f.title.includes('손수건') || f.title.includes('데누구이') },
]

/** 연재 코너 (29CM 연재처럼 회차로 쌓이는 기획) — example content */
export const SERIES = [
  {
    id: 'alley', title: '지도에 없는 가게', by: 'Packit 에디터', desc: '간판이 작아 지나치는 골목 가게를 매주 한 곳씩 찾아가요',
    eps: [
      { ep: 3, storyId: 's-crafts', title: '골목 공방 4곳', date: '11.24' },
      { ep: 2, storyId: 's-vintage', title: '쇼와 감성 기념품', date: '11.17' },
      { ep: 1, title: '2층에 숨은 가게들', date: '11.10' },
    ],
  },
  {
    id: 'morning', title: '아침에만 있어요', by: 'Packit 에디터', desc: '오전에 다 팔리는 간식과 시장을 모아요',
    eps: [
      { ep: 2, storyId: 's-snacks', title: '오후엔 다 팔리는 동네 간식', date: '11.21' },
      { ep: 1, title: '새벽 시장 첫 손님', date: '11.14' },
    ],
  },
  {
    id: 'receipt', title: '여행자의 영수증', by: '여행자 연재', desc: '여행자 한 명의 쇼핑 영수증을 펼쳐 보는 코너',
    eps: [{ ep: 1, title: '3박 4일, ¥42,800의 기록', date: '11.19' }],
  },
] as { id: string; title: string; by: string; desc: string; eps: { ep: number; storyId?: string; title: string; date: string }[] }[]

export const POST_KINDS: { kind: PostKind; label: string; desc: string; body: string }[] = [
  { kind: 'find', label: '발견', desc: '여행 중 찾은 가게와 물건을 사진으로 소개해요', body: '어디서, 어떻게 발견했는지 들려주세요' },
  { kind: 'tip', label: '한 줄 팁', desc: '면세 · 재고 · 가격처럼 짧게 알려 줄 정보', body: '다른 여행자가 바로 써먹을 수 있게 짧게 적어 주세요' },
  { kind: 'course', label: '쇼핑 코스', desc: '하루 동안 들른 가게를 순서대로 엮어요', body: '어떤 순서로 돌았는지, 얼마나 걸렸는지 알려 주세요' },
  { kind: 'ask', label: '물어보기', desc: '어디서 사는지, 얼마인지 다른 여행자에게 물어요', body: '궁금한 물건과 상황을 적어 주세요' },
]

/** places near the photo location, for the location picker */
export const NEARBY_PLACES = [
  { name: '마츠다 두부점', area: '우에하라 상점가', x: 12, y: 54 },
  { name: '골목 끝 문구점', area: '오쿠시부야', x: 18, y: 36 },
  { name: '킷사 코하쿠', area: '우다가와초', x: 44, y: 46 },
  { name: '돈키호테 시부야점', area: '우다가와초', x: 40, y: 52 },
  { name: '로손 시부야 2초메점', area: '시부야 2초메', x: 70, y: 82 },
]

export const SEED_COMMENTS: Record<string, Comment[]> = {
  g1: [
    { id: 'kg1', user: '도쿄산책', text: '캐릭터 스트리트 구경하려면 시간을 넉넉하게 잡는 걸 추천해요!', ago: '25분전' },
    { id: 'kg2', user: '민트초코', text: '다음 주 도쿄 가는데 바로 저장했어요! 너무 귀여워요', ago: '8분전' },
  ],
  f7: [
    { id: 'k1', user: '민트초코', text: '병 반납하면 10엔 돌려줘요! 저도 어제 마셨어요', ago: '1시간 전' },
    { id: 'k2', user: 'JISOO', text: '목욕 안 해도 살 수 있나요?', ago: '40분 전' },
  ],
  f1: [{ id: 'k3', user: '단단', text: '토요일엔 문 닫더라고요. 평일에 가세요', ago: '2일 전' }],
  q1: [
    { id: 'k4', user: '단단', text: '센터가이 안쪽 코코카라파인이 ¥790이었어요', ago: '20분 전' },
    { id: 'k5', user: '민트초코', text: '돈키 면세 받으면 그게 제일 싸요', ago: '10분 전' },
  ],
  t1: [{ id: 'k6', user: 'JISOO', text: '여권 꼭 챙기세요. 사진으로는 안 돼요', ago: '3시간 전' }],
}

/** 여행자 연재 (브런치북처럼 여행자가 회차로 묶는 글) — example content */
export const SEED_TRAVELER_SERIES: TravelerSeries[] = [
  {
    id: 'ts-receipt', author: '단단', city: '도쿄', title: '도쿄 3박 4일 영수증', subs: 312, ongoing: true,
    desc: '하루치 쇼핑 영수증을 펼쳐서, 어디서 무엇을 얼마에 샀는지 기록해요.',
    eps: [
      { title: '첫날, 공항 면세점', spent: 8400, stores: 3 },
      { title: '시부야 골목 문구점', spent: 3120, stores: 4, findId: 'f2' },
      { title: '돈키호테 마지막 밤', spent: 14800, stores: 1, findId: 't1' },
      { title: '쪽빛 손수건 하나', spent: 1650, stores: 1, findId: 'f5' },
    ],
  },
  {
    id: 'ts-snack', author: '민트초코', city: '도쿄', title: '동네 간식 일지', subs: 188, ongoing: true,
    desc: '편의점 말고, 동네 가게에서만 파는 간식을 하루 하나씩 먹어 봐요.',
    eps: [
      { title: '두부가게의 유바 과자', spent: 380, stores: 1, findId: 'f9' },
      { title: '빵집 키링은 덤', spent: 900, stores: 1, findId: 'f6' },
      { title: '오후 2시의 센베', spent: 650, stores: 1, findId: 'f3' },
    ],
  },
  {
    id: 'ts-osaka', author: '단단', city: '오사카', title: '오사카 문구점 지도', subs: 97, ongoing: true,
    desc: '오사카 골목 문구점을 한 곳씩 지도에 꽂아요.',
    eps: [{ title: '센니치마에 젓가락 가게', spent: 1800, stores: 1 }, { title: '니폰바시 키캡 숍', spent: 1200, stores: 1 }],
  },
]

export const AUTHORS: Record<string, Author> = {
  단단: { name: '단단', bio: '골목 문구점만 찾아다니는 여행자', subs: 312, cities: ['도쿄', '오사카', '교토'] },
  민트초코: { name: '민트초코', bio: '동네 간식과 빵집 기록', subs: 188, cities: ['도쿄', '후쿠오카'] },
  JISOO: { name: 'JISOO', bio: '오래된 가게를 좋아해요', subs: 241, cities: ['도쿄'] },
  여행하는곰: { name: '여행하는 곰', bio: '여행다니는 걸 좋아하는 그냥 아저씨', subs: 312, cities: ['도쿄', '삿포로'] },
  수빈: { name: '수빈', bio: '쇼핑 리스트로 여행을 준비해요', subs: 12, cities: ['오사카', '도쿄'] },
}

// link seeded posts to their traveler series
for (const ts of SEED_TRAVELER_SERIES) for (const e of ts.eps) {
  const f = SEED_FINDS.find((x) => x.id === e.findId)
  if (f) f.seriesId = ts.id
}
