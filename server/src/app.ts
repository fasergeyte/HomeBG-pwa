import express from "express";
import { PORT } from "./env";
import auth from "./routes/auth";
import syncApi from "./routes/api";
import { json } from "body-parser";

import "./passport";

const app = express();

app.use(json());

app.use("/auth", auth);
app.use("/api", syncApi);

app.listen(PORT, () => {
  console.log("App listening on port: " + PORT);
});
