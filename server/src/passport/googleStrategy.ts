import passportGoogle from "passport-google-oauth20";
import { BACK_BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../env";
import { createUser, findOne } from "../db/db";
import { v4 as uuidv4 } from "uuid";

const GoogleStrategy = passportGoogle.Strategy;

export const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACK_BASE_URL}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await findOne("user", { googleId: profile.id });

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
