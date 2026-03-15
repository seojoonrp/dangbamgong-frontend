export interface VoidStartResponse {
  sessionId: string;
  startedAt: string;
  targetDay: string;
}

export interface VoidEndRequest {
  activities?: string[];
}

export interface VoidEndResponse {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  activities: string[];
  targetDay: string;
}

export interface VoidSession {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  activities: string[];
}

export interface VoidHistoryResponse {
  targetDay: string;
  totalDurationSec: number;
  sessions: VoidSession[];
}

export interface VoidSessionItem {
  startedAt: string;
  endedAt: string;
  activities: string[];
}

export interface TestVoidRequest {
  startedAt?: string;
  endedAt?: string;
  activities?: string[];
}
