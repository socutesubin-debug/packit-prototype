import type { Category, Find, Product, Store, Trip } from './types'

export const CATEGORIES: Category[] = ['뷰티', '식품', '옷', '잡화', '면세품']

export const CITIES = [
  { id: 'tokyo', name: '도쿄', sub: '도쿄, 하라주쿠, 오모테산도, 시부야', region: '일본', hue: '#E8453C', sky: '#FFE3DD' },
  { id: 'osaka', name: '오사카', sub: '오사카, 교토, 나라, 고베', region: '일본', hue: '#3E6FD8', sky: '#DDE7FF' },
  { id: 'fukuoka', name: '후쿠오카', sub: '하카타, 텐진, 다자이후', region: '일본', hue: '#1F9C74', sky: '#D6F2E7' },
  { id: 'sapporo', name: '삿포로', sub: '삿포로, 오타루, 비에이', region: '일본', hue: '#6B6BD6', sky: '#E4E4FF' },
  { id: 'bangkok', name: '방콕', sub: '시암, 수쿰빗, 짜뚜짝', region: '동남아시아', hue: '#E58A1F', sky: '#FFEBD2' },
  { id: 'shanghai', name: '상하이', sub: '와이탄, 신톈디, 난징루', region: '중국', hue: '#C2463E', sky: '#FBE0DE' },
  { id: 'paris', name: '파리', sub: '마레, 생제르맹, 몽마르트르', region: '유럽', hue: '#2F5DA8', sky: '#DCE6F7' },
]
export const REGIONS = ['전체', '일본', '동남아시아', '중국', '유럽']

export const SUITCASE_COLORS = [
  { id: 'silver', value: '#C9CBCF', name: '실버' },
  { id: 'white', value: '#F4F4F4', name: '화이트' },
  { id: 'gray', value: '#9A9A9A', name: '그레이' },
  { id: 'charcoal', value: '#4A4A4A', name: '차콜' },
  { id: 'black', value: '#1E1E1E', name: '블랙' },
]

export const PHRASES = [
  { ko: '이 상품은 어디 있나요?', ja: 'この商品はどこにありますか。' },
  { ko: '이 상품 재고 있나요?', ja: 'この商品の在庫はありますか。' },
  { ko: '면세 되나요?', ja: '免税できますか。' },
  { ko: '다른 색도 있나요?', ja: 'ほかの色はありますか。' },
]

export const STORES: Store[] = [
  { id: 's1', name: '마츠모토키요시 시부야점', ja: '薬 マツモトキヨシ', kind: '드럭스토어', area: '시부야 · 우다가와초', address: '도쿄도 시부야구 우다가와초 일대', hours: '10:00 - 22:30', open: true, distance: 350, x: 38, y: 40, color: '#E6E6E6' },
  { id: 's2', name: '돈키호테 시부야 본점', ja: 'ドン・キホーテ', kind: '잡화점', area: '시부야 · 도겐자카', address: '도쿄도 시부야구 도겐자카 일대', hours: '24시간', open: true, distance: 600, x: 24, y: 58, color: '#1E1E1E' },
  { id: 's3', name: '로프트 시부야', ja: 'ロフト', kind: '생활 잡화', area: '시부야 · 진난', address: '도쿄도 시부야구 진난 일대', hours: '11:00 - 21:00', open: true, distance: 450, x: 46, y: 22, color: '#F4F4F4' },
  { id: 's4', name: '스크램블 스퀘어 기념품관', ja: 'スクランブルスクエア', kind: '기념품', area: '시부야역', address: '도쿄도 시부야구 시부야역 직결', hours: '10:00 - 21:00', open: true, distance: 300, x: 64, y: 56, color: '#BDBDBD' },
  { id: 's5', name: '빅카메라 시부야 동구점', ja: 'ビックカメラ', kind: '전자 · 생활', area: '시부야 · 동쪽 출구', address: '도쿄도 시부야구 시부야 일대', hours: '10:00 - 21:00', open: false, distance: 520, x: 74, y: 34, color: '#4A4A4A' },
]

const R = {
  jisoo: { user: 'JISOO', trip: '도쿄여행 25.12.08', mood: 'good' as const, text: '선물용으로 여러 개 사갔는데 반응이 좋았던 아이템' },
  min: { user: '민트초코', trip: '오사카 25.10.02', mood: 'good' as const, text: '여름에 쓰기 좋아요. 백탁 없이 가볍게 발려요' },
  dan: { user: '단단', trip: '후쿠오카 25.07.21', mood: 'soso' as const, text: '생각보다 작아서 두 개 사는 걸 추천해요' },
}

type Seed = Omit<Product, 'tripId' | 'priority' | 'favorite' | 'memo' | 'purchased'>

export const CATALOG: Seed[] = [
  { id: 'p1', name: '도쿄바나나 자쿠샌드 초코바나나맛', ja: '東京ばな奈 ザックサンド チョコバナナ味', brand: 'TOKYO BANANA WORLD', category: '식품', price: 980, desc: '바나나 풍미를 살린 바삭한 샌드 과자. 일본 여행 기념품이나 선물용으로 살펴보기 좋은 상품이에요.', art: { shape: 'box', color: '#F6C945', accent: '#7A4A23', bg: '#FFF6DA' }, storeIds: ['s2', 's4'], pickRate: 72, reviews: [R.jisoo, R.dan] },
  { id: 'p2', name: '비오레 UV 아쿠아리치 워터리 에센스 선크림', ja: 'ビオレ UV アクアリッチ ウォータリーエッセンス', brand: 'BIORÉ', category: '뷰티', price: 1184, desc: '물처럼 가볍게 발리는 에센스 타입 선크림. 끈적임이 적어 여름 필수템으로 많이 찾아요.', art: { shape: 'tube', color: '#3FB4E6', accent: '#E9F7FD', bg: '#E3F4FB' }, storeIds: ['s1', 's2'], pickRate: 81, reviews: [R.min] },
  { id: 'p3', name: '용각산 목캔디 허브맛', ja: '龍角散ののどすっきり飴', brand: 'RYUKAKUSAN', category: '식품', price: 230, desc: '허브 향이 시원한 목캔디. 건조한 비행기 안이나 여행 중에 하나씩 꺼내 먹기 좋아요.', art: { shape: 'pouch', color: '#2F5DA8', accent: '#FFFFFF', bg: '#E2EAF7' }, storeIds: ['s1'], pickRate: 54, reviews: [R.dan] },
  { id: 'p4', name: '멜라노CC 프리미엄 비타민C 에센스', ja: 'メラノCC 薬用しみ集中対策 プレミアム美容液', brand: 'MELANO CC', category: '뷰티', price: 1628, desc: '비타민C 유도체가 들어간 집중 케어 에센스. 작은 용량이라 파우치에 넣기 좋아요.', art: { shape: 'bottle', color: '#F2B63B', accent: '#1E1E1E', bg: '#FFF1D6' }, storeIds: ['s1', 's2'], pickRate: 66, reviews: [R.min] },
  { id: 'p5', name: '로이스 생초콜릿 마일드 카카오', ja: 'ロイズ 生チョコレート マイルドカカオ', brand: "ROYCE'", category: '면세품', price: 864, desc: '입에서 부드럽게 녹는 생초콜릿. 보냉 포장이 필요하니 마지막 날 사는 걸 추천해요.', art: { shape: 'box', color: '#6B4630', accent: '#E9D3B5', bg: '#F3E7DA' }, storeIds: ['s4'], pickRate: 77, reviews: [R.jisoo] },
  { id: 'p6', name: '이마바리 타월 거즈 손수건', ja: '今治タオル ガーゼハンカチ', brand: 'IMABARI', category: '잡화', price: 1320, desc: '흡수력이 좋은 거즈 손수건. 색이 다양해서 여러 장 골라 선물하기 좋아요.', art: { shape: 'towel', color: '#9AC7B5', accent: '#FFFFFF', bg: '#E5F3EC' }, storeIds: ['s3', 's2'], pickRate: 48, reviews: [] },
  { id: 'p7', name: '캔메이크 마시멜로 피니시 파우더', ja: 'キャンメイク マシュマロフィニッシュパウダー', brand: 'CANMAKE', category: '뷰티', price: 1034, desc: '보송하게 마무리되는 프레스드 파우더. 휴대용 거울이 달려 있어요.', art: { shape: 'jar', color: '#F4A7C0', accent: '#FFFFFF', bg: '#FDE8EF' }, storeIds: ['s1', 's2'], pickRate: 63, reviews: [R.min] },
  { id: 'p8', name: '오후의 홍차 로열 밀크티', ja: '午後の紅茶 ロイヤルミルクティー', brand: 'KIRIN', category: '식품', price: 160, desc: '편의점에서도 쉽게 찾을 수 있는 밀크티. 여행 중 간식으로 좋아요.', art: { shape: 'can', color: '#C9824B', accent: '#FFF4E6', bg: '#F7E9DC' }, storeIds: ['s2'], pickRate: 40, reviews: [] },
  { id: 'p9', name: '무인양품 휴대용 아로마 디퓨저', ja: '無印良品 ポータブルアロマディフューザー', brand: 'MUJI', category: '잡화', price: 3990, desc: '충전식이라 호텔에서도 쓰기 좋은 소형 디퓨저. 국내보다 저렴한지 비교해 보세요.', art: { shape: 'jar', color: '#E7E1D6', accent: '#8B7E6A', bg: '#F2EEE7' }, storeIds: ['s3'], pickRate: 35, reviews: [] },
  { id: 'p10', name: '킷캣 말차 미니 12개입', ja: 'キットカット 抹茶 ミニ 12枚', brand: 'NESTLÉ', category: '식품', price: 540, desc: '일본 한정 맛으로 유명한 말차 킷캣. 나눠 주기 좋은 개별 포장이에요.', art: { shape: 'bar', color: '#5E9C4E', accent: '#E8453C', bg: '#E4F1DE' }, storeIds: ['s2', 's4'], pickRate: 69, reviews: [R.jisoo] },
  { id: 'p11', name: '유니클로 히트텍 울트라 웜 크루넥', ja: 'ユニクロ ヒートテック ウルトラウォーム', brand: 'UNIQLO', category: '옷', price: 2990, desc: '겨울 여행 이너로 좋은 발열 내의. 일본 사이즈는 한 치수 크게 보세요.', art: { shape: 'towel', color: '#3A3A3D', accent: '#E8453C', bg: '#E9E9EA' }, storeIds: ['s3'], pickRate: 44, reviews: [R.dan] },
  { id: 'p12', name: '카베진 알파 위장약 300정', ja: 'キャベジンコーワα', brand: 'KOWA', category: '잡화', price: 1980, desc: '부모님 선물로 많이 찾는 위장약. 복용 전 성분과 용법을 꼭 확인하세요.', art: { shape: 'bottle', color: '#2E9D6A', accent: '#FFFFFF', bg: '#DFF2E8' }, storeIds: ['s1'], pickRate: 58, reviews: [] },
]

/** Pool used by the fake "AI 분석" flow */
export const SCAN_POOL: Seed[] = [
  { id: 'q1', name: '시세이도 아넷사 퍼펙트 UV 밀크', ja: 'アネッサ パーフェクトUV スキンケアミルク', brand: 'ANESSA', category: '뷰티', price: 3278, desc: '물과 땀에 강한 선밀크. 여름 여행이나 야외 일정이 많을 때 좋아요.', art: { shape: 'bottle', color: '#D9A93C', accent: '#FFFFFF', bg: '#FBF0D6' }, storeIds: ['s1', 's2'], pickRate: 79, reviews: [R.min] },
  { id: 'q2', name: '자가리코 감자 스틱 샐러드맛', ja: 'じゃがりこ サラダ', brand: 'CALBEE', category: '식품', price: 150, desc: '컵에 담긴 바삭한 감자 스틱. 편의점과 마트 어디서나 찾기 쉬워요.', art: { shape: 'can', color: '#E85B3C', accent: '#FFE07A', bg: '#FCE6DE' }, storeIds: ['s2'], pickRate: 52, reviews: [] },
  { id: 'q3', name: '휴족시간 쿨링 시트 18매', ja: '休足時間 18枚', brand: 'LION', category: '잡화', price: 698, desc: '많이 걸은 날 밤 다리에 붙이는 쿨링 시트.', art: { shape: 'pouch', color: '#7FB8E8', accent: '#FFFFFF', bg: '#E4F0FB' }, storeIds: ['s1', 's2'], pickRate: 61, reviews: [R.dan] },
  { id: 'q4', name: '시로이 코이비토 화이트 12개입', ja: '白い恋人 12枚入', brand: 'ISHIYA', category: '면세품', price: 1188, desc: '화이트 초콜릿을 샌드한 랑그드샤 쿠키. 공항 면세점에서도 살 수 있어요.', art: { shape: 'box', color: '#5B8BD6', accent: '#FFFFFF', bg: '#E2EBFA' }, storeIds: ['s4'], pickRate: 74, reviews: [R.jisoo] },
]

const MUST = ['p1', 'p2', 'p4', 'p5']
const MAYBE = ['p3', 'p9', 'p10']
const SKIP = ['p11']

export const SEED_TRIPS: Trip[] = [
  {
    id: 't1', name: '돈 왕창 쓰는 도쿄여행', city: '도쿄', start: '2026-12-03', end: '2026-12-07', budget: 600000,
    suitcase: { model: 'ribbed', color: '#C9CBCF' }, sample: true,
    stickers: [
      { id: 'st1', kind: 'tokyo', x: 26, y: 26, rot: -12 },
      { id: 'st2', kind: 'packit', x: 34, y: 66, rot: 8 },
      { id: 'st3', kind: 'onigiri', x: 70, y: 46, rot: 14 },
    ],
  },
  {
    id: 't2', name: '식도락 오사카 여행', city: '오사카', start: '2025-10-01', end: '2025-10-04', budget: 400000,
    suitcase: { model: 'classic', color: '#1E1E1E' }, sample: true,
    stickers: [
      { id: 'st4', kind: 'osaka', x: 30, y: 30, rot: -6 },
      { id: 'st5', kind: 'sakura', x: 66, y: 64, rot: 10 },
    ],
  },
]

export function seedProducts(): Product[] {
  const tokyo = CATALOG.map<Product>((s) => ({
    ...s,
    tripId: 't1',
    priority: MUST.includes(s.id) ? 'must' : MAYBE.includes(s.id) ? 'maybe' : SKIP.includes(s.id) ? 'skip' : null,
    favorite: ['p1', 'p2', 'p10'].includes(s.id),
    memo: s.id === 'p1' ? '팀 선물용 3박스' : '',
    purchased: false,
  }))
  const osakaIds = ['p1', 'p2', 'p7', 'p10', 'p6']
  const osaka = CATALOG.filter((s) => osakaIds.includes(s.id)).map<Product>((s, i) => ({
    ...s,
    id: `o-${s.id}`,
    tripId: 't2',
    priority: 'must',
    favorite: false,
    memo: '',
    purchased: true,
    myMood: (['good', 'good', 'soso', 'good', 'bad'] as const)[i],
  }))
  return [...tokyo, ...osaka]
}


/** Sample local finds around Shibuya (all fictional examples) */
export const SEED_FINDS: Find[] = [
  { id: 'f1', city: '도쿄', title: '골목 공방의 유리 풍경', story: '도겐자카 뒷골목 2층 작은 공방에서 할아버지가 직접 불어 만든 풍경이에요. 지도에는 안 나오고 간판도 작아요. 소리가 정말 맑아서 하나 사 왔어요.', place: '이름 없는 유리 공방 (2층)', area: '도겐자카 뒷골목', x: 30, y: 70, price: 2200, category: '잡화', art: { shape: 'jar', color: '#9CC9E8', accent: '#E8453C', bg: '#E4F1FA' }, author: '민트초코', authorTrip: '도쿄 여행 중', daysAgo: 3, saves: 42, thanks: 18, sample: true },
  { id: 'f2', city: '도쿄', title: '시부야 한정 마스킹테이프', story: '동네 문구점 계산대 옆에만 있는 시부야 거리 그림 마스킹테이프. 온라인 판매를 안 한대요.', place: '골목 끝 문구점', area: '오쿠시부야', x: 18, y: 36, price: 480, category: '잡화', art: { shape: 'can', color: '#F2C94C', accent: '#141413', bg: '#FFF5D6' }, author: '단단', authorTrip: '도쿄 여행 중', daysAgo: 1, saves: 27, thanks: 9, sample: true },
  { id: 'f3', city: '도쿄', title: '할머니 쌀과자 센베', story: '아침에만 굽는 간장 센베. 오후 2시면 다 팔려요. 포장지가 신문지라 선물용으로도 귀여워요.', place: '마루야마 센베 가게', area: '진구마에 골목', x: 52, y: 12, price: 650, category: '식품', art: { shape: 'pouch', color: '#C9824B', accent: '#FFF4E6', bg: '#F7E9DC' }, author: 'JISOO', authorTrip: '2주 전 다녀옴', daysAgo: 14, saves: 63, thanks: 31, sample: true },
  { id: 'f4', city: '도쿄', title: '킷사텐 오리지널 성냥갑', story: '50년 된 킷사텐에서 커피를 마시면 계산할 때 하나씩 줘요. 따로 사려면 ¥100. 디자인이 매년 바뀐대요.', place: '킷사 코하쿠', area: '우다가와초', x: 44, y: 46, price: 100, category: '잡화', art: { shape: 'box', color: '#2F5DA8', accent: '#F2C94C', bg: '#E2EAF7' }, author: '여행하는곰', authorTrip: '도쿄 여행 중', daysAgo: 5, saves: 19, thanks: 7, sample: true },
  { id: 'f5', city: '도쿄', title: '쪽빛 염색 데누구이', story: '작은 염색 공방에서 손으로 물들인 손수건. 같은 무늬가 하나도 없어요. 사장님이 접는 법도 알려 주셨어요.', place: '아이조메 공방', area: '시부야강 산책로', x: 82, y: 78, price: 1650, category: '잡화', art: { shape: 'towel', color: '#2F4E8C', accent: '#FFFFFF', bg: '#E1E7F3' }, author: '단단', authorTrip: '도쿄 여행 중', daysAgo: 2, saves: 35, thanks: 12, sample: true },
  { id: 'f6', city: '도쿄', title: '동네 빵집 멜론빵 키링', story: '빵집에서 직접 만든 펠트 키링. 빵을 사면 진열대 아래 바구니에 있는 걸 보여 줘요.', place: '베이커리 하루', area: '에비스 방향 주택가', x: 88, y: 46, price: 900, category: '잡화', art: { shape: 'jar', color: '#B7D37A', accent: '#F2C94C', bg: '#EEF6DD' }, author: '민트초코', authorTrip: '도쿄 여행 중', daysAgo: 6, saves: 22, thanks: 10, sample: true },
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
