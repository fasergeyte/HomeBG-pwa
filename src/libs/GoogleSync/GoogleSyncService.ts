// import { getDb } from "@libs/Store";
// import { getDb } from "@libs/Store";
// import { GoogleSheetsService } from "./GoogleSheetsService";
// import { Table } from "./Sheet";

// const SHEET_TITLE = "games";
// const SPREADSHEET_TITLE = "bg-games";

class GoogleSyncService {
  // private gSheets = new GoogleSheetsService();

  public async sync() {
    // const db = await getDb();
    // const games = await db.getAll("game");
    // const players = await db.getAll("player");
    // const playedGames = await db.getAll("playedGame");
    // const tableGames = playedGames.map((game) => this.gameToTable(game));
    // const mergedGames = tableGames.reduce<Table>((acc, game) => {
    //   acc.push(...game, []);
    // }, []);
    // await this.gSheets.ensureAuth();
    // const sheet = await this.gSheets.createSheet(
    //   SHEET_TITLE,
    //   SPREADSHEET_TITLE
    // );
    // await sheet?.write(1, 2, mergedGames);
  }

  public() {}
}

export const GoogleSync = new GoogleSyncService();
