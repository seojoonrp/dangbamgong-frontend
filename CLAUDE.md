# 당밤공 (DangBamGong) Frontend

"void(공허)" 시간을 추적하는 소셜 앱. Expo + React Native 기반.

## 기술 스택

- **Expo 54** / React Native 0.81 / React 19
- **Expo Router 6** - 파일 기반 라우팅 (`src/app/`)
- **TanStack React Query 5** - 서버 상태 관리 (staleTime 30s, gcTime 5m)
- **Axios** - HTTP 클라이언트 (`src/api/client.ts`)
- **React Native Reanimated 4** - 애니메이션
- **Expo SecureStore** - 토큰 저장
- **React Native Gesture Handler** - 스와이프 제스처
- **StyleSheet.create()** - 순수 RN 스타일링 (CSS-in-JS 미사용)

## 스크립트

```bash
npm start          # expo start --dev-client --tunnel
npm run android    # expo start --android
npm run ios        # expo start --ios
```

## 디렉토리 구조

```
src/
├── app/                # Expo Router 라우팅
│   ├── (auth)/         # 인증 화면 (landing, nickname)
│   └── (tabs)/         # 탭 화면 (main, stats, friends, settings)
├── api/
│   ├── client.ts       # Axios 인스턴스, 토큰 관리, 인터셉터
│   └── services/       # 도메인별 API 함수 (auth, users, void, friends, stats, activities, notifications, devices)
├── components/
│   ├── navigation/     # BottomTab, TabHeader, ScreenHeader
│   ├── main/           # VoidSwipeArea, HomeStatsBar, ActivitySelector, AddActivityModal
│   ├── friends/        # FriendListItem, ReceivedRequestItem, SentRequestItem
│   ├── stats/          # Histogram, Timetable, DateNavigator, StatsText
│   ├── settings/       # 설정 관련 컴포넌트
│   └── shared/         # Toast, LoadingView, EmptyView, Chip
├── hooks/              # React Query 기반 커스텀 훅 (useMe, useVoid, useFriends 등)
├── lib/
│   ├── AuthContext.tsx  # 인증 상태 (Context API)
│   ├── queryClient.ts  # React Query 설정
│   ├── queryKeys.ts    # 쿼리 키 팩토리
│   ├── reactQueryFocus.ts  # 앱 포그라운드 시 리페치
│   ├── dateUtils.ts    # 날짜 유틸리티
│   └── mockStats.ts    # 개발용 목 데이터
├── types/
│   ├── common.ts       # ErrorCode, ApiResponse
│   └── dto/            # API 요청/응답 타입 (auth, users, void, friends, stats, activities, notifications)
└── constants/
    ├── colors.ts       # 색상 팔레트 (다크 테마)
    └── layout.ts       # 레이아웃 상수 (bottomTabHeight: 110)
```

## 핵심 아키텍처 패턴

### 데이터 흐름
```
Screen → Hook (useQuery/useMutation) → Service (API 함수) → client.ts (Axios)
```

### API 클라이언트 (`src/api/client.ts`)
- Base URL: `http://172.30.1.28:8000` (로컬 개발 서버)
- Request 인터셉터: SecureStore에서 토큰 읽어 `Authorization: Bearer` 헤더 추가
- Response 인터셉터: `{ success, data }` 래퍼에서 `data`만 추출
- 에러: `ApiError` 클래스 (`code: ErrorCode`, `status: number`)

### React Query 패턴
- **쿼리 키**: `queryKeys` 팩토리 사용 (`queryKeys.user.me()`, `queryKeys.void.history(targetDay)` 등)
- **Optimistic Updates**: 삭제/수정 뮤테이션에서 `onMutate`로 로컬 캐시 즉시 업데이트, `onError`로 롤백
- **폴링**: 친구 목록, 홈 통계, 알림 읽지않은 수 → `refetchInterval: 60000`

### 인증 흐름
1. `SecureStore`에서 토큰 확인 → `getMe()` 호출로 유효성 검증
2. `AuthContext`: `{ isAuthenticated, isNewUser, isLoading }`
3. `src/app/index.tsx`에서 상태에 따라 라우팅:
   - 미인증 → `/(auth)/landing`
   - 신규 유저 (닉네임 없음) → `/(auth)/nickname`
   - 인증 완료 → `/(tabs)/main`

## 코딩 컨벤션

- **컴포넌트**: PascalCase 파일명, `function` 선언 + `export default`
- **훅**: `use` 접두사 camelCase (`useActivities.ts`)
- **스타일**: 컴포넌트 하단 `StyleSheet.create()`로 정의
- **색상**: 항상 `Colors` 상수 사용 (`src/constants/colors.ts`)
  - 배경: `Colors.black.dark` / `Colors.black.mid` / `Colors.black.light`
  - 텍스트: `Colors.white` / `Colors.text.light` / `Colors.text.mid`
  - 포인트: `Colors.point.coral` / `Colors.point.strong`
- **폰트**: A2Z 커스텀 폰트 (Light, Regular, Medium, SemiBold, Bold) — 루트 레이아웃에서 기본 설정됨
- **아이콘**: SVG 파일을 `assets/icons/`에 두고 React 컴포넌트로 import (metro.config.js에 svg-transformer 설정)
- **에러 처리**: `ApiError` instanceof 체크 → 에러 코드별 분기 → Toast로 사용자 알림

## 핵심 도메인 로직

### Void 세션
- 사용자가 "void(공허)" 시간을 시작/종료하며 추적
- 종료 시 activities(활동 태그) 선택 가능
- 스와이프 제스처로 시작/종료 (`VoidSwipeArea` 컴포넌트)

### 날짜 계산 (`getTargetDay`)
- **핵심**: `new Date(now - 16시간)` — 한국 기준 자정이 아닌 오전 8시를 하루의 경계로 사용
- 새벽 3시에 void를 끝내면 "어제" 날짜로 기록됨

### 친구 시스템
- 태그 기반 검색 → 친구 요청 → 수락/거절
- 친구 찔러보기(nudge) — 5분 쿨다운 (`useNudgeCooldown` 훅)
- `Swipeable` 컴포넌트로 삭제/차단 액션

## 개발 참고

- **목 데이터**: `src/lib/mockStats.ts`의 `USE_MOCK` 플래그로 통계 화면 목 데이터 사용 가능
- **테스트 로그인**: `loginTest(socialId)` — 소셜 인증 없이 테스트용 로그인
- **테스트 void**: `createTestVoid(req)` — 임의 시간대 void 세션 생성
- **커스텀 탭바**: `BottomTab.tsx` — Reanimated로 슬라이딩 인디케이터 애니메이션
- **앱 포그라운드 감지**: `reactQueryFocus.ts`가 AppState 변화 감지하여 React Query 자동 리페치
