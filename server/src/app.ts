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

// mock user info endpoint to return user data
app.get("/test", (req, res) => {
  res.status(200).json('{ "test" : "ok"}');
});

app.listen(PORT, () => {
  console.log("App listening on port: " + PORT);
});
