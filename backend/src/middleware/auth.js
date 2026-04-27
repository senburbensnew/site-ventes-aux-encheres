const db = require('../db');

function auth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'Non authentifié.' });

  const row = db
    .prepare('SELECT u.* FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.token = ?')
    .get(token);

  if (!row) return res.status(401).json({ message: 'Token invalide.' });

  req.user = row;
  req.token = token;
  next();
}

module.exports = auth;
