import { Strategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import bcrypt from "bcrypt";
import { findOneUser } from "../db";
import { JWT_SECRET } from "../env";

export const jwtStrategy = new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  },
  async (
    payload: { id?: string; jwtSecureCode?: string },
    done: VerifiedCallback
  ) => {
    /* 
    a valid JWT in our system must have `id` and `jwtSecureCode`.
    you can create your JWT like the way you like.
  */
    // bad path: JWT is not valid
    if (!payload?.id || !payload?.jwtSecureCode) {
      return done(null, false);
    }

    // try to find a User with the `id` in the JWT payload.
    const user = await findOneUser({ id: payload.id });

    // bad path: User is not found.
    if (!user) {
      return done(null, false);
    }

    // compare User's jwtSecureCode with the JWT's `jwtSecureCode` that the
    // request has.
    // bad path: bad JWT, it sucks.
    if (!bcrypt.compareSync(user.jwtSecureCode, payload.jwtSecureCode)) {
      return done(null, false);
    }

    // happy path: JWT is valid, we auth the User.
    return done(null, user);
  }
);
