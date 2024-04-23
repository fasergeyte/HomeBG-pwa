import { isString } from "lodash";

export function error(...errors: unknown[]) {
  alert(
    errors.map((e) => (isString(e) ? e : JSON.stringify(e, null, 2))).join(" ")
  );
}
