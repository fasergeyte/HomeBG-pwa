import { Router } from "express";
import passport from "passport";
import { FRONT_BASE_URL, JWT_SECRET } from "../env";
import jwt from "jsonwebtoken";
import requireJwt from "../middlewares/requireJwt";

const router = Router();

/*
  This route triggers the Google sign-in/sign-up flow. 
  When the frontend calls it, the user will be redirected to the 
  Google accounts page to log in with their Google account.
*/
// Google OAuth2.0 route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/*
  This route is the callback endpoint for Google OAuth2.0. 
  After the user logs in via Google's authentication flow, they are redirected here.
  Passport.js processes the callback, attaches the user to req.user, and we handle 
  the access token generation and redirect the user to the frontend.
*/
// Google OAuth2.0 callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const user = req.user!;

      const authToken = await jwt.sign(user, JWT_SECRET);

      // redirect to frontend with the accessToken as query param
      const redirectUrl = `${FRONT_BASE_URL}/auth/${authToken}`;
      res.redirect(redirectUrl);
      return;
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred during authentication", error });
      return;
    }
  }
);

// mock user info endpoint to return user data
router.get("/user", requireJwt, (req, res) => {
  res.status(200).json(req.user);
});

export default router;
