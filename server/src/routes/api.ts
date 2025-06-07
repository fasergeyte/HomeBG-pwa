// userRoute.ts
import { Request, Response, Router } from "express";
import requireJwt from "../middlewares/requireJwt"; // our middleware to authenticate using JWT
import { syncData } from "../services/syncData";
import type { SyncRequest } from "bg-games-api";

const router = Router();

router.get("/sync", requireJwt, (req, res) => {
  try {
    const data = JSON.parse(req.body) as SyncRequest;

    if (!req.user) {
      throw new Error("Unknown user");
    }

    const responseData = syncData(data, req.user);

    // it is a mock, you MUST return only the necessary info :)
    res.status(200).json(responseData);
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching user info", error });
    return;
  }
});

export default router;
