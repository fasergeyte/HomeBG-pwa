import { useEffect, useState } from "react";
import { StoreName, StoreValue } from "./types";
import { getDb } from "./database";

export function useStoreGetAll<Name extends StoreName>(store: Name) {
  const [data, setData] = useState<StoreValue<Name>[]>();

  useEffect(() => {
    getDb()
      .then((db) => db.getAll(store))
      .then((data) => setData(data));
  }, [store]);

  return { data };
}
