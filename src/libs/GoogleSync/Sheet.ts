import { isNil, isNumber, isString } from "lodash";
import { CellData, RowData } from "./types";
export type Table = (string | number | undefined | null)[][];

export class Sheet {
  constructor(readonly spreadsheetId: string, readonly sheetId: number) {}

  public async write(col: number, row: number, data: Table) {
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
      spreadsheetId: this.spreadsheetId,
      resource: {
        requests: [
          {
            updateCells: {
              range: {
                sheetId: this.sheetId,
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
}
