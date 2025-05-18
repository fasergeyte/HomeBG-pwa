declare module "bg-games-api" {
  export interface Player {
    name: string;
    id: string;
    modifiedAt: Date;
    deleted?: boolean;
    dupOfId?: string;
    userId?: string;
  }

  export interface Game {
    name: string;
    id: string;
    modifiedAt: Date;
    deleted?: boolean;
  }

  export interface PlayedGame {
    id: string;
    /** Дата партии */
    date: Date;
    modifiedAt: Date;
    result: { place: number; playerId: string }[];
    gameId: string;
    deleted?: boolean;
  }

  export interface SyncRequest {
    playedGames: PlayedGame[];
    players: Player[];
    games: Game[];
    lastSync: number;
  }
}
