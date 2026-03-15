/**
 * "오늘"은 (현재 시간 - 16시간)의 날짜.
 * 예: 2월 24일 새벽 2시 → 2월 23일
 */
export function getTargetDay(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  d.setHours(d.getHours() - 16);
  return formatDate(d);
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 초를 "h시간 m분" 형태로 변환
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

/**
 * ISO 문자열을 "n분 전", "n시간 전", "n일 전" 형태로 변환
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "방금 전";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

/**
 * targetDay 이동 가능 여부 체크
 */
export function canNavigateNext(currentDay: string): boolean {
  return currentDay < getTargetDay();
}

export function canNavigatePrev(
  currentDay: string,
  minDate: string,
): boolean {
  return currentDay > minDate;
}

/**
 * targetDay에 1일 더하기/빼기
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * "M월 D일 (요일)" 형태로 포맷
 */
export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = weekdays[d.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}
