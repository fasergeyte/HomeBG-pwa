export function toMap<Key, T extends { id: Key }>(
  list?: (T & { id: Key })[]
): Map<Key, T> {
  return new Map(list?.map((item) => [item.id, item]));
}
