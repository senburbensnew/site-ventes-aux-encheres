const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  const bids = db.prepare(`
    SELECT b.*, u.id AS bidder_id, u.name AS bidder_name
    FROM bids b
    JOIN users u ON u.id = b.user_id
    WHERE b.auction_id = ?
    ORDER BY b.created_at DESC
  `).all(req.params.id);

  res.json(bids.map(row => ({
    id: row.id,
    auction_id: row.auction_id,
    user_id: row.bidder_id,
    amount: row.amount,
    created_at: row.created_at,
    user: { id: row.bidder_id, name: row.bidder_name },
  })));
});

router.post('/', auth, (req, res) => {
  const auctionId = parseInt(req.params.id, 10);
  const amount = parseFloat(req.body?.amount);

  if (isNaN(amount) || amount < 0.01)
    return res.status(422).json({ message: 'Montant invalide.' });

  const placeBid = db.transaction(() => {
    const auction = db.prepare(
      'SELECT * FROM auctions WHERE id = ? '
    ).get(auctionId);

    if (!auction)
      return { error: 404, message: 'Enchère introuvable.' };
    if (auction.status !== 'active' || new Date(auction.end_at) <= new Date())
      return { error: 422, message: "Cette enchère n'est plus active." };
    if (amount <= auction.current_price)
      return { error: 422, message: `Votre offre doit être supérieure au prix actuel (${auction.current_price} €).` };

    const result = db.prepare(
      'INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)'
    ).run(auctionId, req.user.id, parseFloat(amount.toFixed(2)));

    db.prepare(
      "UPDATE auctions SET current_price = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(parseFloat(amount.toFixed(2)), auctionId);

    return { id: result.lastInsertRowid, amount: parseFloat(amount.toFixed(2)) };
  });

  const outcome = placeBid();
  if (outcome.error) return res.status(outcome.error).json({ message: outcome.message });

  const bid = db.prepare(`
    SELECT b.*, u.id AS bidder_id, u.name AS bidder_name
    FROM bids b JOIN users u ON u.id = b.user_id
    WHERE b.id = ?
  `).get(outcome.id);

  // emit socket.io event (io is attached to req.app)
  const io = req.app.get('io');
  io.to(`auction-${auctionId}`).emit('BidPlaced', {
    bid_id:        bid.id,
    amount:        bid.amount,
    bidder_name:   bid.bidder_name,
    current_price: bid.amount,
    created_at:    bid.created_at,
  });

  res.status(201).json({
    id: bid.id,
    auction_id: bid.auction_id,
    user_id: bid.bidder_id,
    amount: bid.amount,
    created_at: bid.created_at,
    user: { id: bid.bidder_id, name: bid.bidder_name },
  });
});

module.exports = router;
