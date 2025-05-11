//config/passportConfig.js
import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import Author from '../models/Author.js';
import jwt from 'jsonwebtoken';
import "dotenv/config"; // assicurati che carichi le variabili

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let author = await Author.findOne({ email: profile.emails[0].value });

        if (!author) {
          author = new Author({
            nome: profile.name.givenName,
            cognome: profile.name.familyName,
            email: profile.emails[0].value,
            password: '',
          });

          await author.save();
        }

        const token = jwt.sign({ id: author._id, email: author.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        done(null, { token, author });
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

