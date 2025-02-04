import passport from "passport";
import { googleStrategy } from "./googleStrategy";
import { isString } from "lodash";
import { findOneUser } from "../db";
import { jwtStrategy } from "./jwtStrategy";

// initialize passport with Google and JWT strategies
passport.use("google", googleStrategy);
passport.use("jwtAuth", jwtStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = isString(id) ? await findOneUser({ id }) : undefined;
  done(null, user);
});

export default passport;
