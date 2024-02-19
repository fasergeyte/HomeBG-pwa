const base = (import.meta.env.BASE_URL + "/").replace(/\/\/$/, "/");

export const paths = {
  playedGameDialog: {
    route: `/playedGame/:id?`,
    getUrl: (params?: { id?: string | number }) =>
      `${base}playedGame/${params?.id ?? ""}`,
  },
  root: {
    route: `${base}*`,
    getUrl: () => `${base}`,
  },
} as const;

export type IncomingParams<T extends keyof typeof paths> =
  undefined extends Parameters<(typeof paths)[T]["getUrl"]>[0]
    ? Partial<Exclude<Parameters<(typeof paths)[T]["getUrl"]>[0], undefined>>
    : Parameters<(typeof paths)[T]["getUrl"]>[0];

export type UrlParams<T extends keyof typeof paths> = {
  [P in keyof IncomingParams<T>]: undefined extends IncomingParams<T>
    ? undefined | string
    : string;
};
