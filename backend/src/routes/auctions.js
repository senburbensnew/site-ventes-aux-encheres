const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const auctions = db.prepare(`
    SELECT a.*, u.id AS user_id, u.name AS user_name,
           (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) AS bids_count
    FROM auctions a
    JOIN users u ON u.id = a.user_id
    ORDER BY a.end_at
  `).all();

  res.json(auctions.map(formatAuction));
});

router.get('/:id', (req, res) => {
  const auction = db.prepare(`
    SELECT a.*, u.id AS user_id, u.name AS user_name
    FROM auctions a
    JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!auction) return res.status(404).json({ message: 'Enchère introuvable.' });

  const bids = db.prepare(`
    SELECT b.*, u.id AS bidder_id, u.name AS bidder_name
    FROM bids b
    JOIN users u ON u.id = b.user_id
    WHERE b.auction_id = ?
    ORDER BY b.created_at DESC
  `).all(auction.id);

  res.json({
    ...formatAuction(auction),
    bids: bids.map(formatBid),
    bids_count: bids.length,
  });
});

router.post('/', auth, (req, res) => {
  const { title, description, image_url, start_price, end_at } = req.body ?? {};

  if (!title || !start_price || !end_at)
    return res.status(422).json({ message: 'Titre, prix de départ et date de fin sont requis.' });
  if (isNaN(parseFloat(start_price)) || parseFloat(start_price) < 0.01)
    return res.status(422).json({ message: 'Le prix de départ doit être supérieur à 0.' });
  if (new Date(end_at) <= new Date())
    return res.status(422).json({ message: 'La date de fin doit être dans le futur.' });
  if (image_url && !/^https?:\/\/.+/.test(image_url))
    return res.status(422).json({ message: "L'URL de l'image est invalide." });

  const price = parseFloat(parseFloat(start_price).toFixed(2));
  const result = db.prepare(`
    INSERT INTO auctions (user_id, title, description, image_url, start_price, current_price, status, end_at)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
  `).run(req.user.id, title, description ?? null, image_url ?? null, price, price, end_at);

  const auction = db.prepare(`
    SELECT a.*, u.id AS user_id, u.name AS user_name
    FROM auctions a JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(formatAuction(auction));
});

function formatAuction(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    start_price: row.start_price,
    current_price: row.current_price,
    status: row.status,
    end_at: row.end_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    bids_count: row.bids_count ?? undefined,
    user: { id: row.user_id, name: row.user_name },
  };
}

function formatBid(row) {
  return {
    id: row.id,
    auction_id: row.auction_id,
    user_id: row.bidder_id,
    amount: row.amount,
    created_at: row.created_at,
    user: { id: row.bidder_id, name: row.bidder_name },
  };
}

module.exports = { router, formatBid };
