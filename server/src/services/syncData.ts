type SyncData = unknown;

export function syncData(data: SyncData) {
  console.log("syncData", data);
  return { someData: [] };
}
