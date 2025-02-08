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

app.get("/test", (req, res) => {
  res.status(200).send("Works!");
});

app.listen(PORT, () => {
  console.log("App listening on port: " + PORT);
});
