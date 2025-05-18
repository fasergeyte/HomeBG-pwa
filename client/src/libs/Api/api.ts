import { axios } from "./ApiContext";
import type { SyncRequest } from "bg-games-api";

export function apiSyncPost(reqData: SyncRequest) {
  return axios.post<SyncRequest>("api/sync", reqData);
}
