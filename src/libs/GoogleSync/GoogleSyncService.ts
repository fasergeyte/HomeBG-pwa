import { getDb } from "@libs/Store";
import { GoogleSheetsService } from "./GoogleSheetsService";
import { Table } from "./Sheet";
import { toMap } from "@libs/Common";

const SHEET_TITLE = "games";
const SPREADSHEET_TITLE = "bg-games";

class GoogleSyncService {
  private gSheets = new GoogleSheetsService();

  public async sync() {
    const db = await getDb();
    const games = toMap(await db.getAll("game"));
    const players = toMap(await db.getAll("player"));
    const playedGames = await db.getAll("playedGame");

    const tableGames = playedGames.map((play) => {
      return [
        ["ид:", play.id],
        ["Дата:", play.date.toLocaleDateString()],
        ["Обновлена:", play.modifiedAt.toISOString()],
        ["Игра:", games.get(play.gameId)?.name ?? ""],
        ...play.result.map((res) => [
          res.place,
          players.get(res.playerId)?.name ?? "",
        ]),
      ];
    });

    const mergedGames = tableGames.reduce<Table>((acc, game) => {
      acc.push(...game, []);
      return acc;
    }, []);

    await this.gSheets.ensureAuth();
    const sheet = await this.gSheets.createSheet(
      SHEET_TITLE,
      SPREADSHEET_TITLE
    );

    await sheet?.write(0, 0, mergedGames);
  }
}

export const GoogleSync = new GoogleSyncService();
