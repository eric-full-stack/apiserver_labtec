const FacebookTokenStrategy = require("passport-facebook-token");
const GoogleTokenStrategy = require("passport-google-token").Strategy;
const passport = require("passport");
const User = require("../models/User").model;

module.exports = function() {
  passport.use(
    new FacebookTokenStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET
      },
      function(accessToken, refreshToken, profile, done) {
        User.upsertFbUser(accessToken, refreshToken, profile, function(
          err,
          user
        ) {
          return done(err, user);
        });
      }
    )
  );

  passport.use(
    new GoogleTokenStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      function(accessToken, refreshToken, profile, done) {
        User.upsertGoogleUser(accessToken, refreshToken, profile, function(
          err,
          user
        ) {
          return done(err, user);
        });
      }
    )
  );
};
