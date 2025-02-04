// userRoute.ts
import { Request, Response, Router } from "express";
import requireJwt from "../middlewares/requireJwt"; // our middleware to authenticate using JWT
import { syncData } from "../services/syncData";

const router = Router();

// mock user info endpoint to return user data
router.get("/sync", requireJwt, (req, res) => {
  try {
    const data = JSON.parse(req.body);
    const responseData = syncData(data);

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
