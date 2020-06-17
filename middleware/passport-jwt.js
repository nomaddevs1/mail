const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const{ User }= require("../model/user");

// Setup work and export for the JWT passport strategy
module.exports = function (passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = "secret";
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        console.log(jwt_payload);
        console.log(jwt_payload.d);
        const user = User.findById(jwt_payload.id );

        if (user) return done(null, user);
        else return done(null, false);
      } catch (error) {
        console.log(error.message);
      }
    })
  );
};
