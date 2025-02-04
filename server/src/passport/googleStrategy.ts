import passportGoogle from "passport-google-oauth20";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../env";
import { createUser, findOneUser } from "../db";
import { v4 as uuidv4 } from "uuid";

const GoogleStrategy = passportGoogle.Strategy;

export const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log("callback", accessToken);
    const user = await findOneUser({ googleId: profile.id });

    if (user) {
      done(null, user);
      return;
    }

    const newUser = await createUser({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails?.at(0)?.value,
      jwtSecureCode: uuidv4(),
    });

    done(null, newUser);
  }
);
