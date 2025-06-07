import { isString } from "lodash";

export function error(...errors: unknown[]) {
  const msg = errors
    .map((e) =>
      isString(e)
        ? e
        : e instanceof Error
        ? e.stack
        : JSON.stringify(e, null, 2)
    )
    .join(" ");
  errors.forEach((e) => console.error(e));
  alert(msg);
}
