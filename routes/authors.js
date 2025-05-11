import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import Author from '../models/Author.js';
import bcrypt from 'bcryptjs';

const upload = multer({ storage });
const router = express.Router();


router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const authors = await Author.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Author.countDocuments();

    res.json({
      authors,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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
    res.status(201).json(newAuthor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedAuthor) return res.status(404).json({ error: 'Author not found' });
    res.json(updatedAuthor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedAuthor = await Author.findByIdAndDelete(req.params.id);
    if (!deletedAuthor) return res.status(404).json({ error: 'Author not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.patch('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      { avatar: req.file.path },
      { new: true }
    );
    if (!updatedAuthor) return res.status(404).json({ error: 'Author not found' });
    res.json(updatedAuthor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;



