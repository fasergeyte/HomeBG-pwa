import { StoreName, StoreValue } from "./types";
import { getDb } from "./database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export const getStoreGetAllQueryKey = (store: StoreName) => [
  "StoreGetAllQueryKey",
  store,
];

export function useStoreGetAll<Name extends StoreName>(store: Name) {
  return useQuery({
    queryKey: getStoreGetAllQueryKey(store),
    queryFn: () => getDb().then((db) => db.getAll(store)),
  });
}

export function useStoreGetAllAsMap<Name extends StoreName>(store: Name) {
  const { data: list } = useStoreGetAll(store);

  const map: ReadonlyMap<string, StoreValue<Name>> | undefined = useMemo(() => {
    if (!list) return;

    return new Map(list?.map((item) => [item.id, item]));
  }, [list]);
  return { map };
}

export function useStoreAdd<Name extends StoreName>(store: Name) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entity: Omit<StoreValue<Name>, "id">) => {
      const result = (await getDb()).add(store, entity);
      qc.invalidateQueries({ queryKey: getStoreGetAllQueryKey(store) });
      return result;
    },
  });
}

export function useStorePut<Name extends StoreName>(store: Name) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entity: StoreValue<Name>) =>
      (await getDb()).put(store, entity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getStoreGetAllQueryKey(store) });
    },
  });
}

export function useStoreDelete<Name extends StoreName>(store: Name) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await getDb()).delete(store, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getStoreGetAllQueryKey(store) });
    },
  });
}
