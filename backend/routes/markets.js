const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all markets
router.get('/', authenticateToken, (req, res) => {
  try {
    const markets = db.prepare(`
      SELECT 
        m.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM votes WHERE market_id = m.id AND vote = 'YES') as yes_count,
        (SELECT COUNT(*) FROM votes WHERE market_id = m.id AND vote = 'NO') as no_count,
        (SELECT COUNT(*) FROM votes WHERE market_id = m.id) as total_votes
      FROM markets m
      LEFT JOIN users u ON m.created_by = u.id
      ORDER BY m.created_at DESC
    `).all();

    // Hide vote counts if show_totals is false and market is open
    const formattedMarkets = markets.map(market => {
      if (!market.show_totals && market.status === 'open') {
        return {
          ...market,
          yes_count: null,
          no_count: null,
          total_votes: null
        };
      }
      return market;
    });

    res.json(formattedMarkets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// Get single market
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const market = db.prepare(`
      SELECT 
        m.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM votes WHERE market_id = m.id AND vote = 'YES') as yes_count,
        (SELECT COUNT(*) FROM votes WHERE market_id = m.id AND vote = 'NO') as no_count,
        (SELECT COUNT(*) FROM votes WHERE market_id = m.id) as total_votes
      FROM markets m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
    `).get(req.params.id);

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // Hide vote counts if show_totals is false and market is open
    if (!market.show_totals && market.status === 'open') {
      market.yes_count = null;
      market.no_count = null;
      market.total_votes = null;
    }

    res.json(market);
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(500).json({ error: 'Failed to fetch market' });
  }
});

// Create market (admin only)
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('description').trim().notEmpty(),
    body('rules').optional().trim(),
    body('close_time').isISO8601(),
    body('show_totals').optional().isBoolean()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, rules, close_time, show_totals } = req.body;

    // Validate close time is in the future
    if (new Date(close_time) <= new Date()) {
      return res.status(400).json({ error: 'Close time must be in the future' });
    }

    try {
      // Convert boolean to integer for SQLite (1 for true, 0 for false)
      const showTotalsValue = show_totals !== false ? 1 : 0;
      
      const result = db.prepare(`
        INSERT INTO markets (title, description, rules, close_time, show_totals, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(title, description, rules || null, close_time, showTotalsValue, req.user.id);

      const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(market);
    } catch (error) {
      console.error('Error creating market:', error);
      res.status(500).json({ error: 'Failed to create market' });
    }
  }
);

// Resolve market (admin only)
router.post('/:id/resolve',
  authenticateToken,
  requireAdmin,
  [
    body('resolution').isIn(['YES', 'NO'])
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resolution } = req.body;
    const marketId = req.params.id;

    try {
      // Get market
      const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId);
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      if (market.status === 'resolved') {
        return res.status(400).json({ error: 'Market already resolved' });
      }

      if (market.status === 'open') {
        return res.status(400).json({ error: 'Market must be closed before resolving' });
      }

      // Update market
      db.prepare(`
        UPDATE markets 
        SET status = 'resolved', resolution = ?, resolved_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(resolution, marketId);

      // Award points to correct voters
      const correctVotes = db.prepare(`
        SELECT user_id FROM votes WHERE market_id = ? AND vote = ?
      `).all(marketId, resolution);

      const updatePoints = db.prepare('UPDATE users SET points = points + 10 WHERE id = ?');
      correctVotes.forEach(vote => {
        updatePoints.run(vote.user_id);
      });

      // Check for new badges
      const { checkAndAwardBadges } = require('../services/badgeService');
      correctVotes.forEach(vote => {
        checkAndAwardBadges(vote.user_id);
      });

      const updatedMarket = db.prepare('SELECT * FROM markets WHERE id = ?').get(marketId);
      res.json({ 
        market: updatedMarket, 
        points_awarded: correctVotes.length * 10 
      });
    } catch (error) {
      console.error('Error resolving market:', error);
      res.status(500).json({ error: 'Failed to resolve market' });
    }
  }
);

module.exports = router;

