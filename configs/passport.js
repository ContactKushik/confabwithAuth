const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const {userModel} = require("../models/userModel.js");
const dotenv = require("dotenv");

dotenv.config();

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.token; // Directly return the token from the "token" cookie
  }
  return null;
};

const options = {
  jwtFromRequest: cookieExtractor, // Use the custom extractor
  secretOrKey: process.env.JWT_SECRET, // Use your JWT secret key
};

const configurePassport = (passport) => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        // Find the user associated with the token payload
        const user = await userModel
          .findOne({ email: payload.email })
          .select("-password");
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        return done(null, user);
      } catch (err) {
        console.error("Error in passport strategy:", err);
        return done(err, false);
      }
    })
  );
};

module.exports = configurePassport;
