const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

require('./db'); // run migrations on startup

const authRoutes    = require('./routes/auth');
const auctionRoutes = require('./routes/auctions').router;
const bidRoutes     = require('./routes/bids');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

app.set('io', io);

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/auctions/:id/bids', bidRoutes);

io.on('connection', socket => {
  socket.on('join', auctionId => {
    socket.join(`auction-${auctionId}`);
  });
});

const PORT = process.env.PORT ?? 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
