import { Game, Player } from "@libs/Store";

export interface FormValues {
  date: Date;
  game: Game | string | null;
  result: { place: number; player: Player | string | null }[];
}
