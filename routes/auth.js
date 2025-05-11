import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import Author from '../models/Author.js';
import { authenticateToken } from '../middlewares/auth.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/mailer.js';

const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { nome, cognome, email, dataDiNascita, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAuthor = new Author({
      nome,
      cognome,
      email,
      dataDiNascita,
      password: hashedPassword
    });

    await newAuthor.save();

   
    await sendEmail(
      email,
      'Benvenuto su StriveBlog!',
      `<h2>Ciao ${nome}!</h2><p>Grazie per esserti registrato. Ora puoi pubblicare i tuoi articoli sul nostro blog!</p>`
    );

    res.status(201).json(newAuthor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const author = await Author.findOne({ email }).select('+password');
  if (!author) return res.status(404).json({ error: 'Author not found' });

  const match = await bcrypt.compare(password, author.password);
  if (!match) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ id: author._id, email: author.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
});


router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));


router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const { token } = req.user;
   
    res.redirect(`${process.env.FRONTEND_URL}/home?token=${token}`);
  }
);


router.get('/me', authenticateToken, async (req, res) => {
  const author = await Author.findById(req.user.id);
  res.json(author);
});

export default router;


