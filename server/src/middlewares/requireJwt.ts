import passport from "passport";

// requireJwt middleware to authenticate the request using JWT
const requireJwt = passport.authenticate("jwtAuth", { session: false });

export default requireJwt;
