# 당밤공 (DangBamGong) Frontend

"void(공허)" 시간을 추적하는 소셜 앱. Expo + React Native 기반.

## 기술 스택

- **Expo 54** / React Native 0.81 / React 19
- **TypeScript** - strict mode 활성화
- **Expo Router 6** - 파일 기반 라우팅 (`src/app/`)
- **TanStack React Query 5** - 서버 상태 관리 (staleTime 30s, gcTime 5m, retry 1)
- **Axios** - HTTP 클라이언트 (`src/api/client.ts`)
- **React Native Reanimated 4** - 애니메이션
- **React Native Gesture Handler** - 제스처 (롱프레스, 스와이프)
- **Expo SecureStore** - JWT 토큰 저장
- **Expo Notifications** - 푸시 알림
- **소셜 로그인**: `@react-native-google-signin/google-signin`, `@react-native-seoul/kakao-login`, `expo-apple-authentication`
- **react-native-svg** + `react-native-svg-transformer` - SVG 아이콘
- **@gorhom/portal** - 포탈 (모달, 드로어)
- **StyleSheet.create()** - 순수 RN 스타일링 (CSS-in-JS 미사용)

## 스크립트

```bash
npm start          # expo start --dev-client --tunnel
npm run android    # expo start --android
npm run ios        # expo start --ios
npm run web        # expo start --web
```

## 디렉토리 구조

```
src/
├── app/                    # Expo Router 라우팅
│   ├── index.tsx           # 인증 상태에 따른 초기 라우팅
│   ├── _layout.tsx         # 루트 레이아웃 (폰트, QueryClient, Portal)
│   ├── (auth)/             # 인증 화면
│   │   ├── landing.tsx     # 소셜 로그인 (Google, Kakao, Apple)
│   │   └── nickname.tsx    # 닉네임 설정 (신규 유저)
│   └── (tabs)/             # 탭 화면
│       ├── _layout.tsx     # 탭 레이아웃 + 푸시 알림 등록
│       ├── main/           # 홈 (index.tsx, activity.tsx)
│       ├── stats/          # 통계 (index.tsx)
│       ├── friends/        # 친구 (index.tsx, search.tsx)
│       └── settings/       # 설정 (index.tsx, profile.tsx, push.tsx, block.tsx, detail.tsx)
├── api/
│   ├── client.ts           # Axios 인스턴스, 토큰 관리, 인터셉터
│   └── services/           # 도메인별 API 함수
│       ├── auth.ts         # 소셜 로그인, 테스트 로그인, 닉네임 설정, 탈퇴
│       ├── users.ts        # 프로필, 닉네임 변경, 알림 설정, 검색, 차단
│       ├── void.ts         # void 시작/종료/취소, 히스토리, 테스트 void
│       ├── friends.ts      # 친구 목록, 요청(전송/수락/거절/삭제), 찌르기, 삭제
│       ├── stats.ts        # 홈 통계, 일별 통계, 개인 통계
│       ├── activities.ts   # 활동 CRUD
│       ├── notifications.ts # 알림 목록, 읽음 처리, 삭제
│       └── devices.ts      # 푸시 알림 디바이스 토큰 등록/삭제
├── components/
│   ├── navigation/         # BottomTab, TabHeader, ScreenHeader
│   ├── main/               # VoidTouchArea, HomeStatsBar, ActivitySelector, AddActivityModal, NotificationDrawer
│   ├── friends/            # FriendListItem, ReceivedRequestItem, SentRequestItem, SearchResultItem, SwipeableCard
│   ├── stats/              # Histogram, Timetable, DateNavigator, StatsText
│   └── shared/             # Toast, LoadingView, EmptyView, Chip, Spinner, PullToRefreshView, PullArcIndicator
├── hooks/                  # React Query 기반 커스텀 훅
│   ├── useUser.ts          # useMe, useChangeNickname, useUpdateSettings, useSearchUsers, useBlock*
│   ├── useVoid.ts          # useStartVoid, useEndVoid, useCancelVoid, useVoidHistory, useCreateTestVoid
│   ├── useFriends.ts       # useFriendList, useReceivedRequests, useSentRequests, useNudgeFriend 등
│   ├── useStats.ts         # useHomeStats, useDailyStats, usePrefetchAdjacentDayStats, useMyStats
│   ├── useActivities.ts    # useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity
│   ├── useNotifications.ts # useNotifications, useMarkAsRead, useDeleteNotification
│   ├── useNudgeCooldown.ts # 찌르기 5분 쿨다운 (SecureStore 기반)
│   ├── useDebounce.ts      # 범용 디바운스 훅 (기본 1000ms)
│   └── useContainerWidth.ts # 뷰포트 너비 (iPad 가로 모드 대응, maxWidth: 560)
├── lib/
│   ├── AuthContext.tsx     # 인증 상태 (Context API)
│   ├── socialAuth.ts       # Google/Kakao/Apple 소셜 로그인 함수
│   ├── pushNotifications.ts # 푸시 알림 권한 요청 + 디바이스 토큰 등록
│   ├── queryClient.ts      # React Query 설정
│   ├── queryKeys.ts        # 쿼리 키 팩토리
│   ├── reactQueryFocus.ts  # 앱 포그라운드 시 리페치
│   ├── dateUtils.ts        # 날짜 유틸리티
│   └── mockStats.ts        # 개발용 목 데이터
├── types/
│   ├── common.ts           # ErrorCode (31종), ApiResponse, ErrorResponse
│   └── dto/                # API 요청/응답 타입 (auth, users, void, friends, stats, activities, notifications, devices)
└── constants/
    ├── colors.ts           # 색상 팔레트 (다크 테마)
    └── layout.ts           # bottomTabHeight: 110, ipadMaxWidth: 560
```

### 에셋 구조

```
assets/
├── fonts/                  # A2Z 커스텀 폰트 (Light, Regular, Medium, SemiBold, Bold)
├── icons/
│   ├── brand/              # 소셜 로그인 (google, kakao, apple)
│   ├── header/             # 헤더 아이콘 (main, stats, friends, settings, notifications, activities)
│   ├── navigation/         # 탭바 아이콘 (main, stats, friends, settings)
│   ├── settings/           # 설정 아이콘 (profile, push, block, withdraw 등)
│   └── shared/             # 공용 아이콘 (plus, search, edit, delete, arrow, chevron 등)
└── images/                 # void.svg, awake.svg, sleep.svg
```

## 핵심 아키텍처 패턴

### 데이터 흐름
```
Screen → Hook (useQuery/useMutation) → Service (API 함수) → client.ts (Axios)
```

### API 클라이언트 (`src/api/client.ts`)
- Base URL: `http://172.30.1.28:8001/api/v1` (데스크탑) / `http://172.30.1.98:8000/api/v1` (노트북, 주석처리)
- Request 인터셉터: SecureStore에서 토큰 읽어 `Authorization: Bearer` 헤더 추가
- Response 인터셉터: `{ success, data }` 래퍼에서 `data`만 추출
- 타임아웃: 10초, ECONNABORTED 시 Alert + 재시도 큐
- 에러: `ApiError` 클래스 (`code: ErrorCode`, `status: number`)

### React Query 패턴
- **쿼리 키**: `queryKeys` 팩토리 사용 (`queryKeys.user.me()`, `queryKeys.void.history(targetDay)` 등)
- **Optimistic Updates**: 삭제/수정 뮤테이션에서 `onMutate`로 로컬 캐시 즉시 업데이트, `onError`로 롤백, `onSettled`로 invalidate
- **폴링**: 친구 목록, 홈 통계(void 중), 친구 요청 → `refetchInterval: 60_000`
- **프리페치**: 통계 화면에서 인접 날짜 데이터 미리 로드 (`usePrefetchAdjacentDayStats`)

### 인증 흐름
1. `SecureStore`에서 토큰 확인 → `getMe()` 호출로 유효성 검증
2. `AuthContext`: `{ isAuthenticated, isNewUser, isLoading }`
3. `src/app/index.tsx`에서 상태에 따라 라우팅:
   - 미인증 → `/(auth)/landing`
   - 신규 유저 (닉네임 없음) → `/(auth)/nickname`
   - 인증 완료 → `/(tabs)/main`
4. 로그아웃 시: 서버에서 디바이스 토큰 삭제 → SecureStore 토큰 제거 → React Query 캐시 클리어

### 소셜 로그인 (`src/lib/socialAuth.ts`)
- `signInWithGoogle()`, `signInWithKakao()`, `signInWithApple()` → `LoginRequest` 반환
- `isCancellation()` 헬퍼로 사용자 취소 감지
- 각 프로바이더별 app.json 플러그인 설정 필요 (URL scheme, App Key 등)

### 푸시 알림 (`src/lib/pushNotifications.ts`)
- 탭 레이아웃 마운트 시 `requestPushPermissionAndRegister()` 호출
- 권한 요청 → 디바이스 토큰 획득 → 서버에 등록
- Android: 알림 채널 자동 설정

## 코딩 컨벤션

- **컴포넌트**: PascalCase 파일명, `function` 선언 + `export default`
- **훅**: `use` 접두사 camelCase (`useActivities.ts`)
- **스타일**: 컴포넌트 하단 `StyleSheet.create()`로 정의
- **색상**: 항상 `Colors` 상수 사용 (`src/constants/colors.ts`)
  - 배경: `Colors.black.dark` / `Colors.black.mid` / `Colors.black.light`
  - 텍스트: `Colors.white` / `Colors.text.light` / `Colors.text.mid`
  - 포인트: `Colors.point.coral` / `Colors.point.strong`
  - 비활성: `Colors.disabled`
  - 브랜드: `Colors.brand.kakao`
- **폰트**: A2Z 커스텀 폰트 (Light, Regular, Medium, SemiBold, Bold) — 루트 레이아웃에서 기본 설정됨
- **아이콘**: SVG 파일을 `assets/icons/`에 두고 React 컴포넌트로 import (metro.config.js에 svg-transformer 설정)
- **에러 처리**: `ApiError` instanceof 체크 → 에러 코드별 분기 → Toast로 사용자 알림
- **iPad 대응**: `useContainerWidth` 훅으로 최대 너비 제한 (560px)

## 핵심 도메인 로직

### Void 세션
- 사용자가 "void(공허)" 시간을 시작/종료하며 추적
- 종료 시 activities(활동 태그) 선택 가능
- 롱프레스/탭 제스처로 시작/종료 (`VoidTouchArea` 컴포넌트, 하단 바 프로그레스 애니메이션)

### 날짜 계산 (`getTargetDay`)
- **핵심**: `new Date(now - 16시간)` — 한국 기준 자정이 아닌 오전 8시를 하루의 경계로 사용
- 새벽 3시에 void를 끝내면 "어제" 날짜로 기록됨

### 친구 시스템
- 태그 기반 검색 → 친구 요청 → 수락/거절
- 친구 찔러보기(nudge) — 5분 쿨다운 (`useNudgeCooldown` 훅, SecureStore 기반)
- `SwipeableCard` 컴포넌트 (ReanimatedSwipeable 래퍼)로 삭제/차단 액션

### 알림 시스템
- `NotificationDrawer` 컴포넌트로 알림 목록 표시
- 읽음/삭제 처리, 페이지네이션 (limit/offset)
- 알림 설정: 친구 요청, 찌르기, void 리마인더 (시간 설정 가능)

## 개발 참고

- **목 데이터**: `src/lib/mockStats.ts`의 `USE_MOCK` 플래그로 통계 화면 목 데이터 사용 가능
- **테스트 로그인**: `loginTest(socialId)` — 소셜 인증 없이 테스트용 로그인
- **테스트 void**: `createTestVoid(req)` — 임의 시간대 void 세션 생성
- **커스텀 탭바**: `BottomTab.tsx` — Reanimated로 슬라이딩 인디케이터 애니메이션
- **앱 포그라운드 감지**: `reactQueryFocus.ts`가 AppState 변화 감지하여 React Query 자동 리페치
- **Pull-to-Refresh**: `PullToRefreshView` + `PullArcIndicator` — Reanimated 기반 커스텀 새로고침 UI
- **빌드**: EAS Build 사용 (development/preview/production 프로필), 버전 관리는 remote 소스
- **플랫폼**: iOS 전용 (app.json `platforms: ["ios"]`), Bundle ID: `com.seojoonrp.dangbamgong`
