export function toMap<T, TKey extends keyof T>(
  list: T[] | undefined,
  key: TKey
): Map<T[TKey], T> {
  return new Map(list?.map((item) => [item[key], item]));
}

export function toMapBy<T, TKeyValue>(
  list: T[] | undefined,
  getKey: (item: T) => TKeyValue
): Map<TKeyValue, T> {
  return new Map(list?.map((item) => [getKey(item), item]));
}
