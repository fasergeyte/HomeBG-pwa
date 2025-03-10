export enum HomeSection {
  PlayedGames = "playedGames",
  Players = "players",
  Games = "games",
}

export const paths = {
  root: {
    route: `/*`,
    getUrl: () => "/",
  },
  auth: {
    route: `/auth/:token`,
    getUrl: (params: { token: string }) => `auth/${params.token}`,
  },
  home: {
    route: `/home/:section?/*`,
    getUrl: (params?: { section?: HomeSection }) =>
      `/home/${params?.section ?? HomeSection.PlayedGames}`,
  },
  playedGameDialog: {
    route: `playedGameDlg/:id?`,
    getUrl: (params?: { id?: string | number }) =>
      `playedGameDlg/${params?.id ?? ""}`,
  },

  playerStats: {
    route: `/stats/player/:id`,
    getUrl: (params?: { id: string | number }) => `/stats/player/${params?.id}`,
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
