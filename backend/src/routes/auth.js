const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password)
    return res.status(422).json({ message: 'Nom, email et mot de passe sont requis.' });
  if (password.length < 6)
    return res.status(422).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing)
    return res.status(422).json({ message: 'Cet email est déjà utilisé.' });

  const hashed = await bcrypt.hash(password, 12);
  const result = db
    .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name, email, hashed);

  const token = crypto.randomBytes(40).toString('hex');
  db.prepare('INSERT INTO tokens (user_id, token) VALUES (?, ?)').run(result.lastInsertRowid, token);

  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ user, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

  const token = crypto.randomBytes(40).toString('hex');
  db.prepare('INSERT INTO tokens (user_id, token) VALUES (?, ?)').run(user.id, token);

  res.json({ token });
});

router.post('/logout', auth, (req, res) => {
  db.prepare('DELETE FROM tokens WHERE token = ?').run(req.token);
  res.json({ message: 'Déconnecté.' });
});

router.get('/me', auth, (req, res) => {
  const { id, name, email } = req.user;
  res.json({ id, name, email });
});

module.exports = router;
