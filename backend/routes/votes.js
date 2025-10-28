const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Cast vote
router.post('/',
  authenticateToken,
  [
    body('market_id').isInt(),
    body('vote').isIn(['YES', 'NO'])
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { market_id, vote } = req.body;
    const userId = req.user.id;

    try {
      // Check if market exists and is open
      const market = db.prepare('SELECT * FROM markets WHERE id = ?').get(market_id);
      if (!market) {
        return res.status(404).json({ error: 'Market not found' });
      }

      if (market.status !== 'open') {
        return res.status(400).json({ error: 'Market is not open for voting' });
      }

      // Check if user has already voted
      const existingVote = db.prepare(
        'SELECT * FROM votes WHERE market_id = ? AND user_id = ?'
      ).get(market_id, userId);

      if (existingVote) {
        return res.status(400).json({ error: 'You have already voted on this market' });
      }

      // Cast vote
      const result = db.prepare(`
        INSERT INTO votes (market_id, user_id, vote)
        VALUES (?, ?, ?)
      `).run(market_id, userId, vote);

      const newVote = db.prepare('SELECT * FROM votes WHERE id = ?').get(result.lastInsertRowid);

      // Check for new badges
      const { checkAndAwardBadges } = require('../services/badgeService');
      checkAndAwardBadges(userId);

      res.status(201).json(newVote);
    } catch (error) {
      console.error('Error casting vote:', error);
      res.status(500).json({ error: 'Failed to cast vote' });
    }
  }
);

// Get user's vote for a specific market
router.get('/market/:marketId', authenticateToken, (req, res) => {
  try {
    const vote = db.prepare(
      'SELECT * FROM votes WHERE market_id = ? AND user_id = ?'
    ).get(req.params.marketId, req.user.id);

    res.json(vote || null);
  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json({ error: 'Failed to fetch vote' });
  }
});

// Get all user's votes (portfolio)
router.get('/my-votes', authenticateToken, (req, res) => {
  try {
    const votes = db.prepare(`
      SELECT 
        v.*,
        m.title,
        m.description,
        m.status,
        m.resolution,
        m.close_time,
        m.resolved_at,
        CASE 
          WHEN m.resolution = v.vote THEN 'correct'
          WHEN m.resolution IS NOT NULL AND m.resolution != v.vote THEN 'incorrect'
          ELSE 'pending'
        END as result
      FROM votes v
      JOIN markets m ON v.market_id = m.id
      WHERE v.user_id = ?
      ORDER BY v.created_at DESC
    `).all(req.user.id);

    const stats = {
      total: votes.length,
      correct: votes.filter(v => v.result === 'correct').length,
      incorrect: votes.filter(v => v.result === 'incorrect').length,
      pending: votes.filter(v => v.result === 'pending').length
    };

    res.json({ votes, stats });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

module.exports = router;

