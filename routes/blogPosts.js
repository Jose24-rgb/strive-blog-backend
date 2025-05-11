// routes/blogPosts.js
import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import BlogPost from '../models/BlogPost.js';
import Author from '../models/Author.js'; // <-- aggiunto
import { sendEmail } from '../utils/mailer.js'; // <-- aggiunto

const upload = multer({ storage });
const router = express.Router();

// POST /blogPosts → crea un nuovo post e invia email all'autore
router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const newPost = new BlogPost({
      category: req.body.category,
      title: req.body.title,
      cover: req.file?.path || '',
      readTime: {
        value: req.body.readTime?.value,
        unit: req.body.readTime?.unit
      },
      author: req.body.author,
      content: req.body.content
    });

    await newPost.save();

    // Prendi autore
    const author = await Author.findById(req.body.author);

    if (author) {
      await sendEmail(
        author.email,
        'Hai pubblicato un nuovo articolo!',
        `<h2>Complimenti ${author.nome}!</h2><p>Hai appena pubblicato un nuovo post: <strong>${newPost.title}</strong>.</p>`
      );
    }

    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /blogPosts → restituisce la lista dei post con filtro titolo + paginazione
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, title } = req.query;

  try {
    const query = title ? { title: { $regex: title, $options: 'i' } } : {};
    const posts = await BlogPost.find(query)
      .populate('author')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET /authors/:id/blogPosts → tutti i post di un autore specifico
router.get('/authors/:id/blogPosts', async (req, res) => {
  try {
    const posts = await BlogPost.find({ author: req.params.id }).populate('author');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /blogPosts/:id/comments → tutti i commenti del post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /blogPosts/:id/comments/:commentId → commento specifico
router.get('/:id/comments/:commentId', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /blogPosts/:id/comments → aggiunge un commento
router.post('/:id/comments', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
      text: req.body.text,
      user: req.body.user
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(post.comments.at(-1));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /blogPosts/:id/comments/:commentId → modifica un commento
router.put('/:id/comments/:commentId', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.text = req.body.text || comment.text;
    comment.user = req.body.user || comment.user;

    await post.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /blogPosts/:id/comments/:commentId → elimina un commento
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.deleteOne();
    await post.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;






