import { Player } from "@libs/Store";

export interface FormValues {
  name: string;
  link: string;
  players: (Player | null)[];
  applyRule: boolean;
}
