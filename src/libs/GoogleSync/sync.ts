/// https://github.com/anvaka/time/blob/d016fe1f79c8c458f7e7c8cbe22cef6a89db7e57/src/lib/goog.js#L115

async function start() {
  // Initializes the client with the API key and the Translate API.
  await gapi.client.init({
    apiKey: "YOUR_API_KEY",
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  });

  gapi.client.sheets.spreadsheets.create(
    {},
    { properties: { title: "bg-games" } }
  );
}

export function auth() {
  gapi.load("auth2", function () {
    /* Ready. Make a call to gapi.auth2.init or some other API */
  });
}

export function sync() {
  // Loads the JavaScript client library and invokes `start` afterwards.
  gapi.load("client", start);
}
