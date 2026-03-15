import { client } from "../client";
import type {
  VoidStartResponse,
  VoidEndRequest,
  VoidEndResponse,
  VoidHistoryResponse,
  TestVoidRequest,
} from "../../types/dto/void";

export async function startVoid(): Promise<VoidStartResponse> {
  return client.post<never, VoidStartResponse>("/void/start");
}

export async function endVoid(req: VoidEndRequest): Promise<VoidEndResponse> {
  return client.post<never, VoidEndResponse>("/void/end", req);
}

export async function cancelVoid(): Promise<void> {
  await client.post("/void/cancel");
}

export async function getVoidHistory(
  targetDay: string,
): Promise<VoidHistoryResponse> {
  return client.get<never, VoidHistoryResponse>("/void/history", {
    params: { target_day: targetDay },
  });
}

export async function createTestVoid(
  req: TestVoidRequest,
): Promise<VoidEndResponse> {
  return client.post<never, VoidEndResponse>("/void/test", req);
}
