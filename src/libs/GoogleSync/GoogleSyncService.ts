/// https://github.com/anvaka/time/blob/d016fe1f79c8c458f7e7c8cbe22cef6a89db7e57/src/lib/goog.js#L115
const CLIENT_ID =
  "962724112021-t58vora6m5ehushe40c0901vple32u6p.apps.googleusercontent.com";
const API_KEY = "AIzaSyAWnMRJNEdPZlZpWSieOKxxv4xtKn29PsA";

class GoogleSyncService {
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

  private async ensureAuth() {
    if (gapi.client.getToken()) return;

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

  public async ensueInited() {
    if (this.initPromise) return await this.initPromise;

    this.initPromise = Promise.all([
      this.initSheetsApi(),
      this.initAuthClient(),
    ]);

    return await this.initPromise;
  }

  public async createSheet() {
    this.ensureAuth();

    gapi.client.sheets.spreadsheets
      .create({
        resource: {
          properties: {
            title: "bg-games",
          },
        },
      })
      .then((response) => {
        alert("Spreadsheet" + response.result.spreadsheetUrl);
      })
      .catch((e) => {
        alert(JSON.stringify(e));
      });
  }
}

export const GoogleSyncServiceInst = new GoogleSyncService();
