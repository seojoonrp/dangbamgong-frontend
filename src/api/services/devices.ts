import { client } from "../client";

export async function registerDeviceToken(token: string): Promise<void> {
  await client.put("/devices/token", { token });
}

export async function deleteDeviceToken(token: string): Promise<void> {
  await client.delete("/devices/token", { data: { token } });
}
