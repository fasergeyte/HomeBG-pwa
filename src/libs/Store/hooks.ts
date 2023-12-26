import { useEffect, useState } from "react";
import { StoreNames, StoreValue } from "./types";
import { getDb } from "./database";

export function useStoreGetAll<Name extends StoreNames>(store: Name) {
    const [data, setData] = useState<StoreValue<Name>[]>()

    useEffect(() => {
        getDb()
            .then((db) => db.getAll(store))
            .then((data) => setData(data))
    }, [store,]);

    return { data };
}