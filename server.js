import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './db.js';
import authorsRouter from './routes/authors.js';
import blogPostsRouter from './routes/blogPosts.js';
import authRouter from './routes/auth.js';
import passport from 'passport';
import session from 'express-session';
import { authenticateToken } from './middlewares/auth.js';
import { sendEmail } from './utils/mailer.js'; // <-- aggiunto

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.get('/test-email', async (req, res) => {
  try {
    await sendEmail(
      'tua.email@esempio.com',
      'Email di prova ✔️',
      `<h2>Ciao!</h2><p>Questa è una email di test da StriveBlog.</p>`
    );
    res.send('✅ Email inviata con successo!');
  } catch (error) {
    console.error('Errore invio email:', error);
    res.status(500).send('❌ Errore invio email');
  }
});

app.use('/', authRouter);


app.use((req, res, next) => {
  if (req.path === '/login' || (req.path === '/authors' && req.method === 'POST')) return next();
  authenticateToken(req, res, next);
});


app.use('/authors', authorsRouter);
app.use('/blogPosts', blogPostsRouter);


connectDB();


app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});



