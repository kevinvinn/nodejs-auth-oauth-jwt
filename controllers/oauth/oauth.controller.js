const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

class PassportOauth {
  constructor() {
    this.initializeGoogleStrategy();
    this.setupSerialization();
  }

  initializeGoogleStrategy() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "http://127.0.0.1:3000/auth/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await prisma.users.findUnique({
              where: { user_email: profile.emails[0].value },
            });

            if (!user) {
              user = await prisma.users.create({
                data: {
                  user_name: profile.displayName || "Nama Default",
                  user_email: profile.emails[0].value,
                  user_password: "",
                  user_is_active: "verified",
                },
              });
            }

            return done(null, user);
          } catch (error) {
            console.error("Error in Google OAuth:", error);
            return done(error, null);
          }
        }
      )
    );
  }

  setupSerialization() {
    passport.serializeUser((user, done) => {
      done(null, user.user_id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await prisma.users.findUnique({
          where: { user_id: id },
        });
        done(null, user);
      } catch (error) {
        console.error("Error deserializing user:", error);
        done(error, null);
      }
    });
  }
}

module.exports = new PassportOauth();
