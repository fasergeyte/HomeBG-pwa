import { v4 as uuid } from "uuid";
import { StoreName, StoreValue } from "./types";
import { getDb } from "./database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toMap } from "../Common/utils/transforms";

export const getStoreGetQueryKey = (store: StoreName, id?: string | number) => [
  "StoreGetAllQueryKey",
  store,
  ...(id ? [id] : []),
];

export function useStoreGetAll<Name extends StoreName>(store: Name) {
  return useQuery({
    queryKey: getStoreGetQueryKey(store),
    queryFn: () => {
      return getDb().then((db) => db.getAll(store));
    },
  });
}

export function useStoreGet<Name extends StoreName>(
  store: Name,
  id: StoreValue<Name>["id"] | undefined,
  disabled = false
) {
  return useQuery({
    queryKey: getStoreGetQueryKey(store, id ?? "disabled"),
    queryFn: () => (id ? getDb().then((db) => db.get(store, id)) : undefined),
    enabled: !disabled && id !== undefined,
  });
}

export function useStoreGetAllAsMap<Name extends StoreName>(store: Name) {
  const { data: list } = useStoreGetAll(store);

  const map: ReadonlyMap<StoreValue<Name>["id"], StoreValue<Name>> | undefined =
    useMemo(() => {
      if (!list) return;

      return toMap(list, "id");
    }, [list]);
  return { map };
}

export function useStoreAdd<Name extends StoreName>(store: Name) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entity: Omit<StoreValue<Name>, "id" | "modifiedAt">) => {
      const dbEntity = {
        ...entity,
        modifiedAt: new Date(),
        id: uuid(),
      } as Omit<StoreValue<Name>, "id">;

      const result = (await getDb()).add(store, dbEntity);
      qc.invalidateQueries({ queryKey: getStoreGetQueryKey(store) });
      return result;
    },
  });
}

export function useStorePut<Name extends StoreName>(store: Name) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entity: Omit<StoreValue<Name>, "modifiedAt">) => {
      const dbEntity = {
        ...entity,
        modifiedAt: new Date(),
      } as StoreValue<Name>;
      return (await getDb()).put(store, dbEntity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getStoreGetQueryKey(store) });
    },
  });
}

export function useStoreDelete<Name extends StoreName>(store: Name) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: StoreValue<Name>["id"]) =>
      (await getDb()).delete(store, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getStoreGetQueryKey(store) });
    },
  });
}
