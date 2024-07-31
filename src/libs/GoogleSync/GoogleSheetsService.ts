import { CellData, RowData, Table } from "./types";
import { isNil, isNumber, isString } from "lodash";

/// https://github.com/anvaka/time/blob/d016fe1f79c8c458f7e7c8cbe22cef6a89db7e57/src/lib/goog.js#L115
const CLIENT_ID =
  "962724112021-t58vora6m5ehushe40c0901vple32u6p.apps.googleusercontent.com";
const API_KEY = "AIzaSyAWnMRJNEdPZlZpWSieOKxxv4xtKn29PsA";

export class GoogleSheetsService {
  private initPromise:
    | Promise<[void, google.accounts.oauth2.TokenClient]>
    | undefined;
  private onAuth?: (err?: string) => void | undefined;

  private async initSheetsApi() {
    return new Promise<void>((res) => {
      gapi.load("client", async function () {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
          ],
        });
        res();
      });
    });
  }

  private async initAuthClient() {
    return google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      callback: (response) => {
        if (response.error) {
          return this.onAuth?.(
            `${response.error}\n${response.error_description}`
          );
        }
        this.onAuth?.();
      },
    });
  }

  public async ensureAuth() {
    if (gapi.client?.getToken()) return;

    const [, tokenClient] = await this.ensueInited();

    await new Promise<void>((res, rej) => {
      tokenClient.requestAccessToken();
      this.onAuth = (err) => {
        this.onAuth = undefined;
        if (err) {
          return rej(err);
        }
        res();
      };
    });
  }

  private async ensueInited() {
    if (this.initPromise) return await this.initPromise;

    this.initPromise = Promise.all([
      this.initSheetsApi(),
      this.initAuthClient(),
    ]);

    return await this.initPromise;
  }

  public async createSpreadsheet(
    spreadSheetTitle: string,
    sheetTitles: string[] = []
  ): Promise<gapi.client.sheets.Spreadsheet> {
    const response = await gapi.client.sheets.spreadsheets.create({
      resource: {
        properties: {
          title: spreadSheetTitle,
        },
        sheets: sheetTitles.map((title) => ({
          properties: {
            title,
          },
        })),
      },
    });

    return response.result;
  }

  public async get(
    documentId: string
  ): Promise<gapi.client.sheets.Spreadsheet> {
    const data = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: documentId,
    });
    return data.result;
  }

  public async writeData(
    spreadsheetId: string,
    sheetId: number,
    col: number,
    row: number,
    data: Table
  ) {
    const rows: RowData[] = data.map<RowData>((row) => {
      return {
        values: row.map<CellData>((value) => {
          if (isNil(value)) {
            return {
              userEnteredValue: {
                stringValue: "",
              },
            };
          }

          if (isString(value)) {
            return {
              userEnteredValue: {
                stringValue: value,
              },
            };
          }

          if (isNumber(value)) {
            return {
              userEnteredValue: {
                numberValue: value,
              },
            };
          }

          return {
            userEnteredValue: {
              stringValue: String(value),
            },
          };
        }),
      };
    });

    return gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            updateCells: {
              range: {
                sheetId,
                startColumnIndex: col,
                startRowIndex: row,
              },
              rows,
              fields: "userEnteredValue.stringValue",
            },
          },
        ],
      },
    });
  }

  async readData(spreadsheetId: string, range: string) {
    const data = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range,
    });

    return data.result.values as Table | undefined;
  }
}
